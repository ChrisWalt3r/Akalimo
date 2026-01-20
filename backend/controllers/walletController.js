const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Wallet Balance & Transactions
const getWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find or Create Wallet
        let wallet = await prisma.wallet.findUnique({
            where: { userId },
            include: { transactions: { orderBy: { createdAt: 'desc' } } }
        });

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: { userId, balance: 0.00 }
            });
        }

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: "Error fetching wallet", error: error.message });
    }
};

// Deposit (Mock)
const deposit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body; // e.g., 50000

        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        // Atomic Transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Credit Wallet
            const updatedWallet = await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            });

            // Create Transaction Record
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: 'DEPOSIT',
                    status: 'COMPLETED',
                    description: 'Mobile Money Deposit'
                }
            });

            return updatedWallet;
        });

        res.json({ success: true, balance: result.balance });

    } catch (error) {
        res.status(500).json({ message: "Deposit failed", error: error.message });
    }
};

// PAY 50% for Order (Escrow)
const payOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, amount } = req.body;

        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        if (Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ message: "Insufficient Funds. Please top up." });
        }

        // Atomic: Deduct -> Update Order -> Record Transaction
        await prisma.$transaction(async (prisma) => {
            // 1. Deduct
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            // 2. Update Order
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'IN_PROGRESS' } // Or 'PAID_ESCROW'
            });

            // 3. Record Transaction
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: 'PAYMENT_ESCROW',
                    status: 'HELD',
                    description: `50% Commitment for Order #${orderId.slice(0, 8)}`,
                    relatedOrderId: orderId
                }
            });

            // 4. Ideally, also credit Provider's "Escrow/On-Hold" balance here or notify them
            // For now, simpler notification logic would go here.
        });

        res.json({ success: true, message: "Payment Successful. Job Started!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Payment failed", error: error.message });
    }
};


// Release Final 50% & Complete Order
const releaseFinalPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { quotationsList: true } // Need total amount
        });

        if (!order || order.serviceReceiverId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (order.status !== 'WORK_DONE') {
            return res.status(400).json({ message: "Job is not marked as done yet." });
        }

        // Calculate Remaining Amount (50% of the accepted quote)
        // Assuming the first quote is the accepted one for simplicity or we stored acceptedQuoteId
        // Ideally we should track which quote was accepted. For now, we take quotationsList[0] totalAmount.
        const acceptedQuote = order.quotationsList[0];
        if (!acceptedQuote) return res.status(400).json({ message: "No quote found" });

        const totalAmount = Number(acceptedQuote.totalAmount);
        const remainingAmount = totalAmount / 2;

        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet || Number(wallet.balance) < remainingAmount) {
            return res.status(400).json({ message: "Insufficient Funds for final payment." });
        }

        await prisma.$transaction(async (prisma) => {
            // 1. Debit User Remaining
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: remainingAmount } }
            });

            // 2. Credit Provider (Total Amount - Commission)
            // Commission e.g. 10%
            const providerId = order.serviceProviderId;
            const commission = totalAmount * 0.10;
            const finalPayoutPromise = totalAmount - commission;

            // Find Provider Wallet
            let providerWallet = await prisma.wallet.findUnique({ where: { userId: providerId } });
            if (!providerWallet) {
                providerWallet = await prisma.wallet.create({ data: { userId: providerId } });
            }

            await prisma.wallet.update({
                where: { id: providerWallet.id },
                data: { balance: { increment: finalPayoutPromise } }
            });

            // 3. Update Order to COMPLETED
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            });

            // 4. Record Transactions
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: remainingAmount,
                    type: 'PAYMENT_FINAL',
                    status: 'COMPLETED',
                    relatedOrderId: orderId
                }
            });

            await prisma.transaction.create({
                data: {
                    walletId: providerWallet.id,
                    amount: finalPayoutPromise,
                    type: 'PAYOUT_EARNINGS',
                    status: 'COMPLETED',
                    description: `Earnings for Order #${orderId.slice(0, 8)} (Less 10% Comm)`,
                    relatedOrderId: orderId
                }
            });
        });

        res.json({ success: true, message: "Order Completed & Paid!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Final Payment Failed" });
    }
};

module.exports = { getWallet, deposit, payOrder, releaseFinalPayment };
