const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission'); 

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Students)
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'enrolledCourses.course',
      select: 'title description instructor thumbnail lessons',
      populate: { path: 'instructor', select: 'name avatar' }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const enrolledCourses = user.enrolledCourses.map(enrollment => ({
      _id: enrollment.course._id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      thumbnail: enrollment.course.thumbnail,
      instructor: enrollment.course.instructor,
      progress: enrollment.progress || 0,
      completed: enrollment.completed || false,
      enrolledAt: enrollment.enrolledAt,
    }));

    const courseIds = enrolledCourses.map(c => c._id);

    // ✅ Get ALL assignments (not just upcoming)
    const assignments = await Assignment.find({
      course: { $in: courseIds }
    }).populate('course', 'title _id').sort({ deadline: 1 });

    const submissionsForStudent = await Submission.find({
      assignment: { $in: assignments.map(a => a._id) },
      student: userId
    });

    const now = new Date();

    const formattedAssignments = assignments.map(assignment => {
      const submission = submissionsForStudent.find(
        sub => sub.assignment.toString() === assignment._id.toString()
      );

      const isLate =
        submission?.submittedAt &&
        new Date(submission.submittedAt) > new Date(assignment.deadline);

      const isPastDue = !submission && now > new Date(assignment.deadline);

      let status = 'missing';

      if (submission) {
        if (submission.graded) status = 'graded';
        else if (submission.status === 'submitted') status = isLate ? 'late' : 'pending';
        else status = 'draft';
      } else if (isPastDue) {
        status = 'missing';
      } else {
        status = 'upcoming';
      }

      return {
        _id: assignment._id,
        title: assignment.title,
        courseName: assignment.course.title,
        courseId: assignment.course._id,
        dueDate: assignment.deadline,
        points: assignment.maxGrade || 0,
        status,
        isLate,
        submittedAt: submission?.submittedAt || null,
        grade: submission?.grade ?? null,
        feedback: submission?.feedback || null,
        submissionId: submission?._id || null,
        content: submission?.content || null,
        files: submission?.files || [],
      };
    });

    // ✅ Quizzes
    const quizzes = await Quiz.find({
      course: { $in: courseIds }
    }).populate('course', 'title _id').sort({ createdAt: 1 });

    const formattedQuizzes = quizzes.map(quiz => {
      const attempt = quiz.attempts?.find(
        att => att.student.toString() === userId.toString()
      );

      return {
        _id: quiz._id,
        title: quiz.title,
        courseName: quiz.course.title,
        courseId: quiz.course._id,
        duration: quiz.duration || 30,
        passingScore: quiz.passingScore || 70,
        completed: !!attempt,
        score: attempt?.score ?? null,
        passed: attempt?.passed ?? null,
        completedAt: attempt?.completedAt || null,
        totalQuestions: quiz.questions?.length || 0,
      };
    });

    // ✅ Progress
    const totalProgress = enrolledCourses.reduce(
      (sum, c) => sum + (c.progress || 0),
      0
    );

    const // In your dashboard controller
overallProgress = totalProgress / enrolledCourses.length
// → (100 + 0) / 2 = 50%

    // ✅ Next deadline
    const pendingDeadlines = formattedAssignments
      .filter(
        a =>
          ['upcoming', 'missing'].includes(a.status) &&
          new Date(a.dueDate) > now
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const nextDeadline = pendingDeadlines[0]
      ? {
          date: pendingDeadlines[0].dueDate,
          title: pendingDeadlines[0].title,
          courseName: pendingDeadlines[0].courseName,
        }
      : null;

    // ✅ Stats (more professional)
    const stats = {
      totalEnrolled: enrolledCourses.length,
      totalCompleted: enrolledCourses.filter(c => c.completed).length,
      pendingAssignments: formattedAssignments.filter(a => a.status === 'pending').length,
      missingAssignments: formattedAssignments.filter(a => a.status === 'missing').length,
      gradedAssignments: formattedAssignments.filter(a => a.status === 'graded').length,
      upcomingQuizzes: formattedQuizzes.filter(q => !q.completed).length,
      completedQuizzes: formattedQuizzes.filter(q => q.completed).length,
    };

    res.json({
      enrolledCourses,
      assignments: formattedAssignments,
      quizzes: formattedQuizzes,
      overallProgress: Math.round(overallProgress),
      nextDeadline,
      stats,
    });

  } catch (error) {
    console.error('Error in getStudentDashboard:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get instructor dashboard data
// @route   GET /api/dashboard/instructor
// @access  Private (Instructors)
exports.getInstructorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get courses created by instructor
    const courses = await Course.find({ instructor: userId })
      .select('title description thumbnail enrolledStudents createdAt')
      .sort({ createdAt: -1 });

    const formattedCourses = courses.map(course => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      enrolledStudents: course.enrolledStudents || [],
      studentCount: course.enrolledStudents ? course.enrolledStudents.length : 0,
      createdAt: course.createdAt,
    }));

    // Get total students across all courses
    const totalStudents = formattedCourses.reduce((sum, course) => sum + course.studentCount, 0);

    // Get recent assignments
    const courseIds = courses.map(c => c._id);
    const recentAssignments = await Assignment.find({
      course: { $in: courseIds }
    })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalCourses: courses.length,
      totalStudents,
      totalAssignments: await Assignment.countDocuments({ course: { $in: courseIds } }),
      totalQuizzes: await Quiz.countDocuments({ course: { $in: courseIds } }),
    };

    res.json({
      createdCourses: formattedCourses,
      recentAssignments,
      stats,
    });
  } catch (error) {
    console.error('Error in getInstructorDashboard:', error);
    res.status(500).json({ 
      message: 'Server error while fetching instructor dashboard',
      error: error.message 
    });
  }
};