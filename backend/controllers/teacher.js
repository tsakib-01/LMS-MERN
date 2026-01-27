// controllers/teacher.js
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get all teacher's courses
    const courses = await Course.find({ instructor: teacherId });
    const courseIds = courses.map(c => c._id);

    // Count total students (unique across all courses)
    const uniqueStudents = new Set();
    courses.forEach(course => {
      course.enrolledStudents.forEach(studentId => {
        uniqueStudents.add(studentId.toString());
      });
    });

    // Get pending submissions
    const assignments = await Assignment.find({ course: { $in: courseIds } });
    const assignmentIds = assignments.map(a => a._id);
    const pendingSubmissions = await Submission.countDocuments({
      assignment: { $in: assignmentIds },
      graded: false
    });

    // Get recent courses (last 3)
    const recentCourses = await Course.find({ instructor: teacherId })
      .sort('-createdAt')
      .limit(3)
      .populate('enrolledStudents', 'name');

    res.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents: uniqueStudents.size,
        pendingSubmissions,
        activeCourses: courses.filter(c => c.published).length
      },
      recentCourses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all courses
// controllers/teacher.js - Update this function:

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email')
      .sort('-createdAt');

    // Map to use 'published' instead of 'isPublished' for frontend
    const mappedCourses = courses.map(course => ({
      ...course.toObject(),
      published: course.isPublished // Add this for backward compatibility
    }));

    res.json({ success: true, courses: mappedCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// controllers/teacher.js - Add these new functions:

// Add lesson to course
exports.addLesson = async (req, res) => {
  try {
    console.log('📝 Adding lesson to course...');
    const { title, description, type, videoUrl, content, duration, isPreview } = req.body;
    
    const course = await Course.findOne({
      _id: req.params.courseId,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newLesson = {
      title,
      description,
      type,
      videoUrl,
      content,
      duration,
      isPreview: isPreview || false,
      order: course.lessons.length + 1
    };

    course.lessons.push(newLesson);
    await course.save();

    console.log('✅ Lesson added successfully');
    res.status(201).json({ success: true, lesson: course.lessons[course.lessons.length - 1] });
  } catch (error) {
    console.error('💥 Error adding lesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    
    const course = await Course.findOne({
      _id: courseId,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    Object.assign(lesson, req.body);
    await course.save();

    res.json({ success: true, lesson });
  } catch (error) {
    console.error('💥 Error updating lesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    
    const course = await Course.findOne({
      _id: courseId,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.lessons.pull(lessonId);
    
    // Reorder remaining lessons
    course.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });
    
    await course.save();

    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('💥 Error deleting lesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reorder lessons
exports.reorderLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessons } = req.body; // Array of { lessonId, order }
    
    const course = await Course.findOne({
      _id: courseId,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    lessons.forEach(({ lessonId, order }) => {
      const lesson = course.lessons.id(lessonId);
      if (lesson) {
        lesson.order = order;
      }
    });

    // Sort lessons by order
    course.lessons.sort((a, b) => a.order - b.order);
    await course.save();

    res.json({ success: true, lessons: course.lessons });
  } catch (error) {
    console.error('💥 Error reordering lessons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    console.log('📝 Creating course...');
    console.log('Request body:', req.body);
    console.log('Teacher ID:', req.user._id);

    const { title, description, category, thumbnail, price } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      thumbnail,
      price: price || 0,
      instructor: req.user._id,
      isPublished: false
    });

    console.log('✅ Course created:', course._id);
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('💥 Error creating course:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.errors
    });
  }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    }).populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// controllers/teacher.js - Update this function:

// Toggle publish status
exports.togglePublish = async (req, res) => {
  try {
    const { published } = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user._id },
      { isPublished: published }, // Changed from 'published' to 'isPublished'
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error('💥 Error toggling publish:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all assignments
exports.getAssignments = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = courses.map(c => c._id);

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .sort('-createdAt');

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, course, deadline, maxGrade } = req.body;

    // Verify teacher owns the course
    const courseDoc = await Course.findOne({
      _id: course,
      instructor: req.user._id
    });

    if (!courseDoc) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      deadline,
      maxGrade: maxGrade || 100
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: assignment.course._id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: assignment.course,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(assignment, req.body);
    await assignment.save();

    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: assignment.course,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await assignment.deleteOne();

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all submissions
exports.getSubmissions = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = courses.map(c => c._id);

    const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'name email')
      .populate('assignment', 'title maxGrade')
      .sort('-submittedAt');

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Grade submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify teacher owns the course
    const assignment = await Assignment.findById(submission.assignment);
    const course = await Course.findOne({
      _id: assignment.course,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.graded = true;
    submission.gradedAt = Date.now();

    await submission.save();

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = courses.map(c => c._id);

    const quizzes = await Quiz.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .sort('-createdAt');

    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, course, duration, passingScore, questions } = req.body;

    // Verify teacher owns the course
    const courseDoc = await Course.findOne({
      _id: course,
      instructor: req.user._id
    });

    if (!courseDoc) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      course,
      duration,
      passingScore: passingScore || 70,
      questions
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single quiz
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: quiz.course._id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: quiz.course,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: quiz.course,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('attempts.student', 'name email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findOne({
      _id: quiz.course,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, attempts: quiz.attempts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get enrolled students
exports.getEnrolledStudents = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email createdAt');

    // Create unique student list
    const studentMap = new Map();
    courses.forEach(course => {
      course.enrolledStudents.forEach(student => {
        if (!studentMap.has(student._id.toString())) {
          studentMap.set(student._id.toString(), {
            ...student.toObject(),
            courses: [{ id: course._id, title: course.title }]
          });
        } else {
          studentMap.get(student._id.toString()).courses.push({
            id: course._id,
            title: course.title
          });
        }
      });
    });

    const students = Array.from(studentMap.values());

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student progress
exports.getStudentProgress = async (req, res) => {
  try {
    const studentId = req.params.id;

    const courses = await Course.find({
      instructor: req.user._id,
      enrolledStudents: studentId
    }).select('title modules');

    // Get student's submissions
    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title course');

    // Get student's quiz attempts
    const quizzes = await Quiz.find({
      'attempts.student': studentId
    }).select('title attempts');

    res.json({
      success: true,
      courses,
      submissions,
      quizzes: quizzes.map(q => ({
        title: q.title,
        attempts: q.attempts.filter(a => a.student.toString() === studentId)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};