const Course = require('../models/Course');
const User = require('../models/User');
const { createCheckoutSession } = require('../utils/stripe');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');    
const Submission = require('../models/Submission');

// ==================== ASSIGNMENT SUBMISSION ====================
exports.submitAssignment = async (req, res) => {
  try {
    const { id: courseId, assignmentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const file = req.file;

    console.log('📝 Submitting assignment:', { courseId, assignmentId, userId });

    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ 
        success: false,
        message: 'Assignment not found' 
      });
    }

    if (assignment.course.toString() !== courseId) {
      return res.status(400).json({ 
        success: false,
        message: 'Assignment does not belong to this course' 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    const user = await User.findById(userId);
    
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be enrolled to submit assignments' 
      });
    }

    const isEnrolled = user.enrolledCourses.some(
      enrolled => {
        const cId = enrolled.course ? enrolled.course.toString() : enrolled.toString();
        return cId === courseId;
      }
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be enrolled to submit assignments' 
      });
    }

    if (!text && !file) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide your answer or attach a file' 
      });
    }

    let existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    });

    if (existingSubmission) {
      existingSubmission.content = text || existingSubmission.content;
      if (file) {
        existingSubmission.file = `/uploads/${file.filename}`;
      }
      existingSubmission.submittedAt = new Date();
      existingSubmission.graded = false;
      existingSubmission.grade = null;
      existingSubmission.feedback = null;
      existingSubmission.gradedAt = null;
      
      await existingSubmission.save();
      console.log('✅ Updated existing submission');
      
      return res.status(200).json({ 
        success: true,
        message: 'Assignment updated successfully',
        submission: existingSubmission
      });
    }

    const newSubmission = new Submission({
      assignment: assignmentId,
      student: userId,
      content: text || '',
      file: file ? `/uploads/${file.filename}` : null
    });

    await newSubmission.save();
    assignment.submissions.push(newSubmission._id);
    await assignment.save();

    console.log('✅ Created new submission');

    res.status(200).json({ 
      success: true,
      message: 'Assignment submitted successfully',
      submission: newSubmission
    });
  } catch (error) {
    console.error('💥 Assignment submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== QUIZ SUBMISSION ====================
exports.submitQuiz = async (req, res) => {
  try {
    const { id: courseId, quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    console.log('❓ Submitting quiz:', { courseId, quizId, userId, answers });

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false,
        message: 'Answers are required and must be an array' 
      });
    }

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    if (quiz.course.toString() !== courseId) {
      return res.status(400).json({ 
        success: false,
        message: 'Quiz does not belong to this course' 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    const user = await User.findById(userId);
console.log('👤 User enrolledCourses:', JSON.stringify(user.enrolledCourses, null, 2));
console.log('🎯 Looking for courseId:', courseId);
    
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be enrolled to take quizzes' 
      });
    }

    const isEnrolled = user.enrolledCourses.some(
      enrolled => {
        const cId = enrolled.course ? enrolled.course.toString() : enrolled.toString();
        return cId === courseId;
      }
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be enrolled to take quizzes' 
      });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ 
        success: false,
        message: `Please answer all ${quiz.questions.length} questions` 
      });
    }

    const result = quiz.calculateScore(answers);
    console.log('📊 Quiz results:', result);

    quiz.attempts.push({
      student: userId,
      answers,
      score: result.score,
      passed: result.passed,
      completedAt: new Date()
    });

    await quiz.save();

    res.status(200).json({
      success: true,
      message: result.passed ? 'Congratulations! You passed!' : 'Keep learning!',
      score: result.score,
      correct: result.correct,
      total: result.total,
      passed: result.passed,
      passingScore: quiz.passingScore
    });
  } catch (error) {
    console.error('💥 Quiz submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== REVIEW SUBMISSION ====================
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    const user = req.user;
    
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }
    
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating and comment are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'Must be enrolled to review' 
      });
    }

    const enrolled = user.enrolledCourses.some(
      enrolled => {
        const cId = enrolled.course ? enrolled.course.toString() : enrolled.toString();
        return cId === course._id.toString();
      }
    );
    
    if (!enrolled) {
      return res.status(403).json({ 
        success: false,
        message: 'Must be enrolled to review' 
      });
    }
    
    const existingReviewIndex = course.ratings.findIndex(
      r => r.user.toString() === user._id.toString()
    );
    
    if (existingReviewIndex !== -1) {
      course.ratings[existingReviewIndex].rating = parseInt(rating);
      course.ratings[existingReviewIndex].comment = comment;
      course.ratings[existingReviewIndex].createdAt = new Date();
      console.log('✅ Updated existing review');
    } else {
      course.ratings.push({
        user: user._id,
        rating: parseInt(rating),
        comment,
        createdAt: new Date()
      });
      console.log('✅ Added new review');
    }
    
    await course.save();
    await course.populate('ratings.user', 'name email');
    
    res.json({ 
      success: true, 
      message: 'Review submitted successfully',
      course 
    });
  } catch (error) {
    console.error('💥 Review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getCourseAssignments = async (req, res) => {
  const assignments = await Assignment.find({ course: req.params.id })
    .sort('-createdAt');
  res.json({ assignments });
};

exports.getCourseQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ course: req.params.id })
    .sort('-createdAt');
  res.json({ quizzes });
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name avatar')
      .sort('-createdAt');
    
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchCourses = async (req, res) => {
  try {
    const { query, category, level } = req.query;
    const filters = { isPublished: true };
    
    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (level) {
      filters.level = level;
    }
    
    const courses = await Course.find(filters)
      .populate('instructor', 'name avatar')
      .sort('-createdAt');
    
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('enrolledStudents', 'name avatar')
      .populate({
        path: 'ratings.user',
        select: 'name email'
      });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const assignments = await Assignment.find({ course: req.params.id })
      .sort('deadline');
    
    const quizzes = await Quiz.find({ course: req.params.id })
      .sort('createdAt');
    
    const courseData = course.toObject();
    courseData.assignments = assignments;
    courseData.quizzes = quizzes;
    
    res.json({ success: true, course: courseData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, category, level, duration, lessons } = req.body;
    
    const course = new Course({
      title,
      description,
      price: parseFloat(price),
      isPaid: parseFloat(price) > 0,
      thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : null,
      instructor: req.user._id,
      category,
      level,
      duration,
      lessons: lessons.map(lesson => ({
        ...lesson,
        order: lesson.order || 0
      }))
    });
    
    await course.save();
    
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });
    
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, category, level, duration, lessons } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price ? parseFloat(price) : course.price;
    course.isPaid = parseFloat(price) > 0;
    course.category = category || course.category;
    course.level = level || course.level;
    course.duration = duration || course.duration;
    course.lessons = lessons ? lessons.map(lesson => ({
      ...lesson,
      order: lesson.order || 0
    })) : course.lessons;
    
    if (req.file) {
      course.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }
    
    await course.save();
    
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    await course.remove();
    
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdCourses: course._id }
    });
    
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    console.log('📚 Enrolling user:', req.user._id);
    console.log('📚 Course ID:', req.params.id);
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log('✅ Course found:', course.title);
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user.email);
    console.log('📋 Current enrolled courses BEFORE:', user.enrolledCourses);
    
    // Initialize enrolledCourses if it doesn't exist
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    
    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      enrolled => {
        const courseId = enrolled.course ? enrolled.course.toString() : enrolled.toString();
        return courseId === course._id.toString();
      }
    );
    
    if (alreadyEnrolled) {
      console.log('⚠️ Already enrolled');
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Check if course is paid
    if (course.isPaid && course.price > 0) {
      console.log('💰 Paid course - creating checkout session');
      const session = await createCheckoutSession(course._id, user.email);
      return res.json({ success: true, session });
    }
    
    console.log('🆓 Free course - enrolling directly');
    
    // Add enrollment
    user.enrolledCourses.push({
      course: course._id,
      progress: 0,
      completed: false
    });
    
    console.log('📋 Enrolled courses AFTER push:', user.enrolledCourses);
    
    // Save user
    await user.save();
    console.log('✅ User saved with new enrollment');
    
    // Verify save
    const verifyUser = await User.findById(req.user._id);
    console.log('🔍 Verification - enrolledCourses after save:', verifyUser.enrolledCourses);
    
    // Add student to course
    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    
    course.enrolledStudents.push(user._id);
    await course.save();
    console.log('✅ Course updated with new student');
    
    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    console.error('💥 Enrollment error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const user = req.user;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const enrolledCourse = user.enrolledCourses.find(
      enrolled => enrolled.course.toString() === course._id.toString()
    );
    
    if (!enrolledCourse) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    const lesson = course.lessons.find(l => l._id.toString() === lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    enrolledCourse.progress = Math.min(100, enrolledCourse.progress + (100 / course.lessons.length));
    
    if (enrolledCourse.progress >= 100) {
      enrolledCourse.completed = true;
      enrolledCourse.completionDate = new Date();
      enrolledCourse.certificate = `/certificates/${user._id}-${course._id}.pdf`;
    }
    
    await user.save();
    
    res.json({ success: true, progress: enrolledCourse.progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

