const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Haversine Helper (Should be refactored to utils/geo.js)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Configuration for Fees (Could be in DB/Env)
const BASE_ASSESSMENT_FEE = 1500; // e.g. 1500 UGX/KES base
const COST_PER_KM = 50; // e.g. 50 per km

const createQuotation = async (req, res) => {
    try {
        const { orderId, serviceFee, items } = req.body; // items = [{name, qty, price}]
        const providerId = req.user.id;

        // 1. Get Order & Provider Profile for Distance Calc
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        const providerProfile = await prisma.profile.findUnique({ where: { userId: providerId } });

        if (!order || !providerProfile) {
            return res.status(404).json({ message: "Order or Provider Profile not found" });
        }

        // 2. Calculate Assessment Fee
        let assessmentFee = BASE_ASSESSMENT_FEE;
        if (order.latitude && order.longitude && providerProfile.latitude && providerProfile.longitude) {
            const distKm = getDistance(order.latitude, order.longitude, providerProfile.latitude, providerProfile.longitude);
            assessmentFee += Math.round(distKm * COST_PER_KM);
        }

        // 3. Calculate Item Totals
        let itemsTotal = 0;
        if (items && Array.isArray(items)) {
            itemsTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        }

        const totalAmount = parseFloat(assessmentFee) + parseFloat(serviceFee) + parseFloat(itemsTotal);

        // 4. Create Quotation
        const quotation = await prisma.quotation.create({
            data: {
                orderId,
                serviceProviderId: providerId,
                assessmentFee,
                serviceFee,
                totalAmount,
                items: items || [], // JSON field
                status: 'PENDING'
            }
        });

        // Notify Receiver (Optional/Todo)

        res.status(201).json({
            success: true,
            message: "Quotation sent successfully",
            quotation
        });

    } catch (error) {
        console.error("Quotation Error:", error);
        res.status(500).json({ message: "Failed to create quotation", error: error.message });
    }
};

const getQuotationsForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const quotations = await prisma.quotation.findMany({
            where: { orderId },
            include: {
                serviceProvider: {
                    select: {
                        phone: true,
                        profile: { select: { fullName: true, avatarUrl: true } }
                    }
                }
            }
        });

        res.json(quotations);

    } catch (error) {
        res.status(500).json({ message: "Error fetching quotations" });
    }
};

module.exports = { createQuotation, getQuotationsForOrder };
