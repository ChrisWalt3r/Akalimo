const express = require('express');
const router = express.Router();
const { confirmArrival, createOrder, getUserOrders, addProgressUpdate, completeJob, getProviderJobs } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Cloudinary Upload
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/:orderId/confirm-arrival', protect, confirmArrival);
router.post('/', protect, upload.array('photos', 5), createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/provider-orders', protect, getProviderJobs);
router.post('/:orderId/update', protect, upload.array('photos', 3), addProgressUpdate);
router.post('/:orderId/complete', protect, completeJob);

module.exports = router;
