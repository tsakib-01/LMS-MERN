// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { protect, authorize } = require('../middlewares/auth');

// ── Public auth routes ───────────────────────────────────────────────────────
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// ── NEW: Teacher sets their password via invite link (public — no auth needed)
router.post('/set-password/:token', authController.setPassword);

// ── Admin-only user management routes ───────────────────────────────────────
router.post('/users/create-teacher', protect, authorize('admin'), authController.createTeacher);
router.get('/users', protect, authorize('admin'), authController.getAllUsers);
router.patch('/users/:id/toggle-status', protect, authorize('admin'), authController.toggleUserStatus);

module.exports = router;