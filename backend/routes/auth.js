const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Import the specific CV upload middleware from the controller
const { uploadCV } = authController;

// Authentication routes
router.post('/register', uploadCV, authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;