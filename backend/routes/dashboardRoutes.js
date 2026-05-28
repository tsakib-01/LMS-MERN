const express = require('express');
const router = express.Router();
const { 
  getStudentDashboard, 
  getInstructorDashboard 
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Student dashboard
router.get('/student', getStudentDashboard);

// Instructor dashboard
router.get('/instructor', getInstructorDashboard);

module.exports = router;