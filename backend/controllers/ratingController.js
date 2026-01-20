const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRating = async (req, res) => {
    try {
        const raterId = req.user.id;
        const { orderId, rating, comment } = req.body;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Ensure order is completed
        if (order.status !== 'COMPLETED') {
            return res.status(400).json({ message: "Can only rate completed orders." });
        }

        // Determine who is being rated
        let ratedUserId;
        if (order.serviceReceiverId === raterId) {
            ratedUserId = order.serviceProviderId;
        } else if (order.serviceProviderId === raterId) {
            ratedUserId = order.serviceReceiverId;
        } else {
            return res.status(403).json({ message: "Not authorized" });
        }

        const newRating = await prisma.rating.create({
            data: {
                orderId,
                raterId,
                ratedUserId,
                rating: Number(rating),
                comment
            }
        });

        res.status(201).json(newRating);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting rating" });
    }
};

module.exports = { createRating };
