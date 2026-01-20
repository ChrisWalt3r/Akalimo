const express = require('express');
const router = express.Router();
const { getWallet, deposit, payOrder, releaseFinalPayment } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWallet);
router.post('/deposit', protect, deposit);
router.post('/pay-order', protect, payOrder);
router.post('/pay-final', protect, releaseFinalPayment);

module.exports = router;
