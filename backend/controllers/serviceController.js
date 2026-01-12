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

module.exports = { getCategories, getServices };
