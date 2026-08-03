const express = require('express');
const { signup, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/signup', signup);
router.post('/login', login);

// Protected Routes
router.get('/me', protect, getCurrentUser);

module.exports = router;
