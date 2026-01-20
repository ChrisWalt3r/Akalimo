const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Haversine Helper (Duplicate for now, should move to utils in refactor)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d;
}

const confirmArrival = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: "GPS coordinates required" });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.latitude || !order.longitude) {
            return res.status(400).json({ message: "Order does not have a set location" });
        }

        const distance = getDistance(lat, lng, order.latitude, order.longitude);
        const MAX_DISTANCE_METERS = 200; // Allow 200m radius

        if (distance <= MAX_DISTANCE_METERS) {
            // Success: Update Order status to indicate arrival (or just log it for now)
            // Ideally: order.status = 'PROVIDER_ARRIVED' or similar. 
            // For now, let's assuming we just return success.
            res.json({
                success: true,
                message: "Arrival Confirmed",
                distance: Math.round(distance) + "m"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "You are too far from the location",
                distance: Math.round(distance) + "m"
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const createOrder = async (req, res) => {
    try {
        const {
            categoryId,
            serviceType,
            description,
            quotations,
            locationName,
            lat,
            lng,
            scheduledDate,
            scheduledTime
        } = req.body;

        const userId = req.user.id; // From authMiddleware

        // Handle Photos
        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            photoUrls = req.files.map(f => f.path); // Cloudinary URL
        }

        // Combine date and time if provided
        let scheduledDateTime = new Date();
        if (scheduledDate) {
            scheduledDateTime = new Date(scheduledDate);
        }

        const newOrder = await prisma.order.create({
            data: {
                serviceReceiverId: userId,
                categoryId: categoryId,
                serviceType: serviceType || 'General',
                description: description,
                quotations: quotations ? parseInt(quotations) : 1,
                locationName: locationName || 'Pinned Location',
                latitude: lat ? parseFloat(lat) : null,
                longitude: lng ? parseFloat(lng) : null,
                photos: photoUrls,
                scheduledDate: scheduledDateTime,
                status: 'PENDING'
            }
        });


        // TRIGGER NOTIFICATION LOGIC
        // 1. Find Search Logic (Import or duplicate Haversine)
        // Re-using local getDistance helper

        if (lat && lng && categoryId) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            // Find Profiles in this category
            const profiles = await prisma.profile.findMany({
                where: {
                    services: { some: { categoryId: categoryId } },
                    latitude: { not: null },
                    longitude: { not: null }
                },
                select: { userId: true, latitude: true, longitude: true }
            });

            // Filter by Distance (e.g. 50km radius)
            const nearbyProviders = profiles.filter(p => {
                const dist = getDistance(userLat, userLng, p.latitude, p.longitude);
                return dist <= 50000; // 50km
            });

            // Bulk Create Notifications
            if (nearbyProviders.length > 0) {
                const notifications = nearbyProviders.map(p => ({
                    userId: p.userId,
                    title: "New Job Alert!",
                    message: `A new ${serviceType} job is available nearby (${locationName}). Check it out!`,
                    type: "ORDER_ALERT",
                    metadata: { orderId: newOrder.id }
                }));

                await prisma.notification.createMany({
                    data: notifications
                });
                console.log(`[Notification] Sent alerts to ${nearbyProviders.length} providers.`);
            } else {
                console.log(`[Notification] No providers found within 50km.`);
            }
        }

        res.status(201).json({
            success: true,
            message: "Order Created Successfully. Providers have been notified.",
            order: newOrder
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ connection: "Server Error creating order", error: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { serviceReceiverId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                quotationsList: {
                    select: { id: true, totalAmount: true, status: true, serviceProvider: { select: { phone: true } } }
                },
                updates: { orderBy: { createdAt: 'desc' } }
            }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ connection: "Error fetching orders", error: error.message });
    }
};

const addProgressUpdate = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { description } = req.body;
        const userId = req.user.id; // Provider

        // Check if provider works on this order
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.serviceProviderId !== userId) {
            return res.status(403).json({ message: "Not authorized to update this order" });
        }

        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            photoUrls = req.files.map(f => f.path);
        }

        const update = await prisma.progressUpdate.create({
            data: {
                orderId,
                description,
                photos: photoUrls
            }
        });

        // Notify Receiver (Optional but good)
        await prisma.notification.create({
            data: {
                userId: order.serviceReceiverId,
                title: "Work Update",
                message: `New progress update on your ${order.serviceType} order.`,
                type: "INFO",
                metadata: { orderId }
            }
        });

        res.status(201).json({ success: true, update });
    } catch (error) {
        console.error(error);
        res.status(500).json({ connection: "Error adding update", error: error.message });
    }
};

const completeJob = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.serviceProviderId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'WORK_DONE' } // Waiting for final payment
        });

        // Notify Receiver
        await prisma.notification.create({
            data: {
                userId: order.serviceReceiverId,
                title: "Job Completed!",
                message: "Provider has marked the job as done. Please review and pay balance.",
                type: "INFO",
                metadata: { orderId }
            }
        });

        res.json({ success: true, order: updatedOrder });
    } catch (e) {
        res.status(500).json({ message: "Error completing job" });
    }
};

const getProviderJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobs = await prisma.order.findMany({
            where: { serviceProviderId: userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                serviceReceiver: { select: { profile: { select: { fullName: true, location: true } }, phone: true } },
                updates: { orderBy: { createdAt: 'desc' } }
            }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
};

module.exports = { confirmArrival, createOrder, getUserOrders, addProgressUpdate, completeJob, getProviderJobs };
