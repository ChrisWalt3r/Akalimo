const express = require('express');
const router = express.Router();
const { getCategories, getServices } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', protect, getCategories);
router.get('/services', protect, getServices);

module.exports = router;
