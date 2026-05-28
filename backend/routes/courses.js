const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');
const { protect, authorize } = require('../middlewares/auth');
const { thumbnailUpload, assignmentUpload } = require('../utils/upload');

// ==================== COURSE ROUTES ====================
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/:id', courseController.getCourseById);

router.post('/', protect, authorize('Instructor', 'Admin'), thumbnailUpload.single('thumbnail'), courseController.createCourse);
router.put('/:id', protect, authorize('Instructor', 'Admin'), thumbnailUpload.single('thumbnail'), courseController.updateCourse);
router.delete('/:id', protect, authorize('Instructor', 'Admin'), courseController.deleteCourse);

router.post('/:id/enroll', protect, courseController.enrollCourse);
router.post('/:id/review', protect, courseController.addReview);
router.post('/:id/complete-lesson', protect, courseController.completeLesson);
router.get('/:id/my-progress', protect, courseController.getMyProgress);

// ==================== ASSIGNMENT ROUTES ====================
router.get('/:id/assignments', courseController.getCourseAssignments);

router.get('/:id/assignments/:assignmentId/submission', protect, courseController.getSubmission);

router.post('/:id/assignments/:assignmentId/draft',
  protect,
  assignmentUpload.any(),
  courseController.saveAssignmentDraft
);

router.post('/:id/assignments/:assignmentId/submit',
  protect,
  assignmentUpload.single('file'),
  courseController.submitAssignment
);

router.delete('/:id/assignments/:assignmentId/submission',
  protect,
  courseController.deleteSubmission
);

router.put('/:id/assignments/:assignmentId/submission',
  protect,
  assignmentUpload.single('file'),
  courseController.updateSubmission
);

// ==================== SUBMISSION ROUTES ====================
router.post('/submissions/:submissionId/comments', protect, courseController.addPrivateComment);
router.delete('/submissions/:submissionId/files/:fileId', protect, courseController.deleteSubmissionFile);



// // ✅ Both routes MUST have thumbnailUpload middleware
// router.post('/courses',     thumbnailUpload.single('thumbnail'), teacher.createCourse);
// router.put('/courses/:id',  thumbnailUpload.single('thumbnail'), teacher.updateCourse);


// ==================== QUIZ ROUTES ====================
router.get('/:id/quizzes', courseController.getCourseQuizzes);
router.post('/:id/quizzes/:quizId/submit', protect, courseController.submitQuiz);

module.exports = router;