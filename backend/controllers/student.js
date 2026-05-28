// controllers/student.js
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    console.log('📝 Student submitting assignment...');
    console.log('Request body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);

    const { courseId, assignmentId } = req.params;
    const { text, content } = req.body;
    const studentId = req.user._id;

    // Use either 'text' or 'content' field (frontend might send either)
    const submissionContent = content || text || '';

    // Validate required fields
    if (!submissionContent && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide submission text or attach a file'
      });
    }

    // Verify the assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify student is enrolled in the course
    const isEnrolled = course.enrolledStudents.some(
      student => student.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to submit assignments'
      });
    }

    // Check if deadline has passed
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment deadline has passed'
      });
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }

    // Handle file attachment (single file only based on model)
    const file = req.files && req.files.length > 0 
      ? (req.files[0].path || `/uploads/submissions/${req.files[0].filename}`) 
      : null;
    console.log('Submission file:', file);

    // Create the submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      content: submissionContent,
      file: file,
      submittedAt: new Date()
    });

    // Add submission reference to assignment
    assignment.submissions.push(submission._id);
    await assignment.save();

    await submission.populate('student', 'name email');
    await submission.populate('assignment', 'title maxGrade');

    console.log('✅ Assignment submitted:', submission._id);
    res.status(201).json({ 
      success: true, 
      message: 'Assignment submitted successfully',
      submission 
    });
  } catch (error) {
    console.error('💥 Error submitting assignment:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get student's submissions for a course
exports.getMySubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Get all assignments for the course
    const assignments = await Assignment.find({ course: courseId }).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    // Get student's submissions
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: studentId
    })
      .populate('assignment', 'title maxGrade deadline')
      .sort('-submittedAt');

    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    // Verify the quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify student is enrolled
    const isEnrolled = course.enrolledStudents.some(
      student => student.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to take quizzes'
      });
    }

    // Calculate score
    let correct = 0;
    const total = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const score = (correct / total) * 100;
    const passed = score >= quiz.passingScore;

    // Save attempt
    quiz.attempts.push({
      student: studentId,
      answers,
      score,
      passed,
      completedAt: new Date()
    });

    await quiz.save();

    res.json({
      success: true,
      score,
      correct,
      total,
      passed,
      passingScore: quiz.passingScore
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get enrolled courses for student
exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user._id;

    const courses = await Course.find({
      enrolledStudents: studentId,
      isPublished: true
    })
      .populate('instructor', 'name email')
      .sort('-createdAt');

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student progress for a course
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get assignments for the course
    const assignments = await Assignment.find({ course: courseId }).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    // Get student's submissions
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: studentId
    });

    // Get quizzes for the course
    const quizzes = await Quiz.find({ course: courseId });
    
    const quizAttempts = quizzes.reduce((acc, quiz) => {
      const studentAttempts = quiz.attempts.filter(
        a => a.student.toString() === studentId.toString()
      );
      return acc.concat(studentAttempts);
    }, []);

    res.json({
      success: true,
      progress: {
        totalLessons: course.lessons?.length || 0,
        totalAssignments: assignments.length,
        completedAssignments: submissions.length,
        totalQuizzes: quizzes.length,
        completedQuizzes: quizAttempts.length,
        averageQuizScore: quizAttempts.length > 0
          ? (quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;