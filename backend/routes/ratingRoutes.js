const express = require('express');
const router = express.Router();
const { createRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRating);

module.exports = router;
