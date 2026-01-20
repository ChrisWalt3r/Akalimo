const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                services: true
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const getServices = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const where = categoryId ? { categoryId } : {};

        const services = await prisma.service.findMany({
            where: where,
            include: { category: true }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
}

// Haversine Formula for distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

const searchProviders = async (req, res) => {
    try {
        const { lat, lng, categoryId } = req.query;

        if (!lat || !lng || !categoryId) {
            return res.status(400).json({ message: "Missing latitude, longitude, or categoryId" });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // 1. Find Profiles that have services in this category
        // We also want to include the User info to get the name if needed (though Profile has fullName)
        const profiles = await prisma.profile.findMany({
            where: {
                services: {
                    some: {
                        categoryId: categoryId
                    }
                },
                latitude: { not: null },
                longitude: { not: null }
            },
            include: {
                services: {
                    where: { categoryId: categoryId } // Include only relevant services
                },
                user: {
                    select: { phone: true, email: true }
                }
            }
        });

        // 2. Calculate Distance & Sort
        const providersWithDistance = profiles.map(p => {
            const dist = getDistance(userLat, userLng, p.latitude, p.longitude);
            return { ...p, distance: dist }; // Add distance to object
        });

        // 3. Sort by Distance (Ascending)
        providersWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(providersWithDistance);

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Error searching providers", error: error.message });
    }
};

module.exports = { getCategories, getServices, searchProviders };
