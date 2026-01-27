// routes/teacher.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher');
const { protect, authorize } = require('../middlewares/auth');

// Apply authentication and teacher authorization to all routes
router.use(protect);
router.use(authorize('teacher'));

// Dashboard
router.get('/dashboard', teacherController.getDashboard);

// Courses
router.get('/courses', teacherController.getCourses);
router.post('/courses', teacherController.createCourse);
router.get('/courses/:id', teacherController.getCourse);
router.put('/courses/:id', teacherController.updateCourse);
router.delete('/courses/:id', teacherController.deleteCourse);
router.patch('/courses/:id/publish', teacherController.togglePublish);

// Assignments
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', teacherController.createAssignment);
router.get('/assignments/:id', teacherController.getAssignment);
router.put('/assignments/:id', teacherController.updateAssignment);
router.delete('/assignments/:id', teacherController.deleteAssignment);

// Submissions
router.get('/submissions', teacherController.getSubmissions);
router.patch('/submissions/:id/grade', teacherController.gradeSubmission);

// Quizzes
router.get('/quizzes', teacherController.getQuizzes);
router.post('/quizzes', teacherController.createQuiz);
router.get('/quizzes/:id', teacherController.getQuiz);
router.put('/quizzes/:id', teacherController.updateQuiz);
router.delete('/quizzes/:id', teacherController.deleteQuiz);
router.get('/quizzes/:id/results', teacherController.getQuizResults);

// Students
router.get('/students', teacherController.getEnrolledStudents);
router.get('/students/:id/progress', teacherController.getStudentProgress);




// Lesson management routes
router.post('/courses/:courseId/lessons', teacherController.addLesson);
router.put('/courses/:courseId/lessons/:lessonId', teacherController.updateLesson);
router.delete('/courses/:courseId/lessons/:lessonId', teacherController.deleteLesson);
router.patch('/courses/:courseId/lessons/reorder', teacherController.reorderLessons);

module.exports = router;