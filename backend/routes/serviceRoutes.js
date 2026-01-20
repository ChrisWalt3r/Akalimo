const express = require('express');
const router = express.Router();
const { getCategories, getServices, searchProviders } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', protect, getCategories);
router.get('/services', protect, getServices);
router.get('/search', protect, searchProviders);

module.exports = router;
