// routes/student.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const { protect, authorize } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists for student submissions (bypass on Vercel read-only FS)
const uploadDir = 'uploads/submissions';
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.error(`❌ Failed to create upload directory ${uploadDir}:`, err.message);
  }
}

// Configure storage for student submissions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt|xls|xlsx|ppt|pptx|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, Excel, PowerPoint, Image, Text and ZIP files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Apply authentication and student authorization to all routes
router.use(protect);
router.use(authorize('student'));

// ========================================
// STUDENT COURSES
// ========================================
router.get('/my-courses', studentController.getMyCourses);
router.get('/courses/:courseId/progress', studentController.getCourseProgress);

// ========================================
// ASSIGNMENT SUBMISSIONS
// ========================================
router.post(
  '/courses/:courseId/assignments/:assignmentId/submit',
  upload.array('file', 5),
  studentController.submitAssignment
);
router.get('/courses/:courseId/submissions', studentController.getMySubmissions);

// ========================================
// QUIZ SUBMISSIONS
// ========================================
router.post('/courses/:courseId/quizzes/:quizId/submit', studentController.submitQuiz);

module.exports = router;