const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { protect, authorize } = require('../middlewares/auth');

// User routes
router.get('/me', protect, userController.getMe);
router.put('/me', protect, userController.updateProfile);
router.get('/dashboard', protect, userController.getDashboard);
router.get('/admin/users', protect, authorize('Admin'), userController.getAdminUsers);
router.put('/admin/users/:id/role', protect, authorize('Admin'), userController.updateUserRole);

module.exports = router;