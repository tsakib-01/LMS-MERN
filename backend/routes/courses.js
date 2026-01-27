const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../utils/upload');

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', protect, authorize('Instructor', 'Admin'), upload.single('thumbnail'), courseController.createCourse);
router.put('/:id', protect, authorize('Instructor', 'Admin'), upload.single('thumbnail'), courseController.updateCourse);
router.delete('/:id', protect, authorize('Instructor', 'Admin'), courseController.deleteCourse);
router.post('/:id/enroll', protect, courseController.enrollCourse);
router.post('/:id/review', protect, courseController.addReview);
router.post('/:id/complete-lesson', protect, courseController.completeLesson);

// Assignment routes
router.post('/:id/assignments/:assignmentId/submit', protect, upload.single('file'), courseController.submitAssignment);

// Quiz routes
router.post('/:id/quizzes/:quizId/submit', protect, courseController.submitQuiz);

module.exports = router;