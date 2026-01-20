const express = require('express');
const router = express.Router();
const { createQuotation, getQuotationsForOrder } = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createQuotation);
router.get('/:orderId', protect, getQuotationsForOrder);

module.exports = router;
