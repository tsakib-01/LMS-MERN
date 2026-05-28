// controllers/courses.js
const Course = require('../models/Course');
const User = require('../models/User');
const { createCheckoutSession } = require('../utils/stripe');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const { cloudinary } = require('../utils/upload');

// ==================== ASSIGNMENT DRAFT (SAVE WITHOUT SUBMITTING) ====================
exports.saveAssignmentDraft = async (req, res) => {
  try {
    const { id: courseId, assignmentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
  const files = req.files || []; // Get files from any field name
console.log('📎 Files received:', files); // Debug log

    console.log('💾 Saving draft:', { courseId, assignmentId, userId });

    // Verify assignment exists
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

    // Verify enrollment
    const user = await User.findById(userId);
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be enrolled to save assignments' 
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
        message: 'You must be enrolled to save assignments' 
      });
    }

    // Find or create submission
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    });

    if (submission) {
      // Update existing draft
      if (submission.status === 'submitted' || submission.graded) {
        return res.status(400).json({ 
          success: false,
          message: 'Cannot edit a submitted or graded assignment' 
        });
      }

      submission.content = text || submission.content;
      
      // Add new files
      if (files && files.length > 0) {
        const newFiles = files.map(file => ({
           filename: file.filename,
  originalName: file.originalname,
  path: file.path,        // Cloudinary URL
  publicId: file.filename, // useful if you want to delete later
          mimetype: file.mimetype,
          size: file.size
        }));
        submission.files = [...(submission.files || []), ...newFiles];
      }

      await submission.save();
      console.log('✅ Updated draft');
    } else {
      // Create new draft
      submission = new Submission({
        assignment: assignmentId,
        student: userId,
        content: text || '',
        status: 'draft',
        files: files ? files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path || `/uploads/assignments/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        })) : []
      });

      await submission.save();
      console.log('✅ Created new draft');
    }

    res.status(200).json({ 
      success: true,
      message: 'Draft saved',
      submission
    });
  } catch (error) {
    console.error('💥 Save draft error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== SUBMIT ASSIGNMENT (HAND IN) ====================
exports.submitAssignment = async (req, res) => {
  try {
    const { id: courseId, assignmentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const file = req.file; // 👈 read uploaded file

    console.log('📦 Submission Request:');
    console.log('  - Course ID:', courseId);
    console.log('  - Assignment ID:', assignmentId);
    console.log('  - Student ID:', userId);
    console.log('  - Text Content:', text ? `${text.substring(0, 50)}...` : 'None');
    console.log('  - File:', file ? file.filename : 'None'); // 👈 log file

    // ✅ Require either text OR a file
    if ((!text || text.trim().length === 0) && !file) {
      return res.status(400).json({ 
        success: false,
        message: 'Please write your answer or attach a PDF before submitting' 
      });
    }
    
    // ✅ Step 2: Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ 
        success: false,
        message: 'Assignment not found' 
      });
    }

    // ✅ Step 3: Verify assignment belongs to this course
    if (assignment.course.toString() !== courseId) {
      return res.status(400).json({ 
        success: false,
        message: 'Assignment does not belong to this course' 
      });
    }

    // ✅ Step 4: Verify student enrollment
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const isEnrolled = user.enrolledCourses.some(enrolled => {
      const cId = enrolled.course ? enrolled.course.toString() : enrolled.toString();
      return cId === courseId;
    });
    
    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be enrolled in this course to submit assignments' 
      });
    }

    // ✅ Step 5: Check for existing submission
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    });
  if (submission) {
      if (submission.status === 'submitted') {
        return res.status(400).json({ 
          success: false,
          message: 'You have already submitted this assignment' 
        });
      }

      submission.content = text || '';
      submission.status = 'submitted';
      submission.submittedAt = new Date();

      // 👇 Add file if uploaded
      if (file) {
        submission.files = [{
          filename: file.filename,
          originalName: file.originalname,
          path: file.path || `/uploads/assignments/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        }];
      }

    } else {
      submission = new Submission({
        assignment: assignmentId,
        student: userId,
        course: courseId,
        content: text || '',
        status: 'submitted',
        submittedAt: new Date(),
        graded: false,
        // 👇 Add file if uploaded
        files: file ? [{
          filename: file.filename,
          originalName: file.originalname,
          path: file.path || `/uploads/assignments/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        }] : []
      });
    
      console.log('📝 Creating new submission');
    }

    await submission.save();

    // ✅ Step 6: Add submission to assignment's submissions array
    if (!assignment.submissions.includes(submission._id)) {
      assignment.submissions.push(submission._id);
      await assignment.save();
      console.log('✅ Added submission to assignment');
    }

    console.log('✅ Assignment submitted successfully:', submission._id);

    res.status(200).json({ 
      success: true,
      message: 'Assignment submitted successfully! 🎉',
      submission: {
        _id: submission._id,
        content: submission.content,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    });

  } catch (error) {
    console.error('💥 Assignment submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit assignment. Please try again.', 
      error: error.message 
    });
  }
};
// ==================== UNSUBMIT ASSIGNMENT ====================
exports.unsubmitAssignment = async (req, res) => {
  try {
    const { id: courseId, assignmentId } = req.params;
    const userId = req.user._id;

    console.log('↩️ Unsubmitting assignment:', { assignmentId, userId });

    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    });

    if (!submission) {
      return res.status(404).json({ 
        success: false,
        message: 'Submission not found' 
      });
    }

    if (submission.status !== 'submitted') {
      return res.status(400).json({ 
        success: false,
        message: 'Assignment is not submitted' 
      });
    }

    if (submission.graded) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot unsubmit a graded assignment' 
      });
    }

    // Revert to draft
    submission.status = 'draft';
    submission.submittedAt = null;
    
    await submission.save();

    console.log('✅ Assignment unsubmitted');

    res.status(200).json({ 
      success: true,
      message: 'Assignment unsubmitted',
      submission
    });
  } catch (error) {
    console.error('💥 Unsubmit error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== GET SUBMISSION ====================
exports.getSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;

    console.log('📄 Fetching submission:', { assignmentId, userId });

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    })
    .populate('assignment')
    .populate('student', 'name email')
    .populate('privateComments.user', 'name email role');

    // Return null if no submission exists (not an error)
    res.status(200).json({ 
      success: true,
      submission: submission || null
    });
  } catch (error) {
    console.error('💥 Get submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== ADD PRIVATE COMMENT ====================
exports.addPrivateComment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    console.log('💬 Adding comment:', { submissionId, userId });

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Comment cannot be empty' 
      });
    }

    const submission = await Submission.findById(submissionId)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ 
        success: false,
        message: 'Submission not found' 
      });
    }

    // Check authorization - student or teacher
    const isStudent = submission.student.toString() === userId.toString();
    const course = await Course.findById(submission.assignment.course);
    const isTeacher = course.instructor.toString() === userId.toString();

    if (!isStudent && !isTeacher) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Add comment
    submission.privateComments.push({
      user: userId,
      comment: comment.trim(),
      createdAt: new Date()
    });

    await submission.save();
    await submission.populate('privateComments.user', 'name email role');

    console.log('✅ Comment added');

    res.status(200).json({ 
      success: true,
      message: 'Comment added',
      submission
    });
  } catch (error) {
    console.error('💥 Add comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== DELETE FILE FROM SUBMISSION ====================
exports.deleteSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    });

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.graded) return res.status(400).json({ success: false, message: 'Cannot delete a graded submission' });

    await Submission.deleteOne({ _id: submission._id });

    // Remove from assignment submissions array
    await Assignment.findByIdAndUpdate(assignmentId, {
      $pull: { submissions: submission._id }
    });

    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const file = req.file;

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: userId
    });

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.graded) return res.status(400).json({ success: false, message: 'Cannot edit a graded submission' });

    const assignment = await Assignment.findById(assignmentId);
    const isLate = new Date() > new Date(assignment.deadline);

    if (text !== undefined) submission.content = text;
    if (file) {
      submission.files = [{
        filename: file.filename,
        originalName: file.originalname,
        path: file.path || `/uploads/assignments/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      }];
    }
    submission.submittedAt = new Date();
    submission.status = 'submitted';
    submission.isLate = isLate;

    await submission.save();
    res.json({ success: true, message: 'Submission updated successfully', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== DELETE FILE FROM SUBMISSION ====================
exports.deleteSubmissionFile = async (req, res) => {
  try {
    const { submissionId, fileId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.student.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (submission.status === 'submitted' || submission.graded) {
      return res.status(400).json({ success: false, message: 'Cannot delete files from submitted or graded assignments' });
    }

    submission.files = submission.files.filter(f => f._id.toString() !== fileId);
    await submission.save();

    res.json({ success: true, message: 'File deleted', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMyProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const enrollment = user.enrolledCourses.find(e => {
      const cId = e.course ? e.course.toString() : e.toString();
      return cId === courseId;
    });

    if (!enrollment) {
      return res.json({ completedLessons: [], progress: 0 });
    }

    // ✅ Always recalculate from real lesson count, never trust stale stored value
    const course = await Course.findById(courseId);
    const totalLessons = course?.lessons?.length || 0;
    const completedLessons = enrollment.completedLessons || [];
    const recalculatedProgress = totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

    // ✅ Auto-fix stale value in DB silently
    if (enrollment.progress !== recalculatedProgress) {
      enrollment.progress = recalculatedProgress;
      if (recalculatedProgress >= 100) {
        enrollment.completed = true;
        enrollment.completionDate = enrollment.completionDate || new Date();
      }
       user.markModified('enrolledCourses'); 
      await user.save();
    }

    res.json({
      completedLessons,
      progress: recalculatedProgress,
        completed: enrollment.completed || false 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
      thumbnail: req.file ? req.file.path : null,
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

// controllers/courses.js — updateCourse
exports.updateCourse = async (req, res) => {
  try {
    const update = { ...req.body };

    // ✅ If a new file was uploaded via multer, use the Cloudinary URL
    if (req.file) {
      // Optionally delete old Cloudinary image
      const existing = await Course.findById(req.params.id).select('thumbnail');
      if (existing?.thumbnail && existing.thumbnail.startsWith('https://res.cloudinary.com')) {
        const publicId = existing.thumbnail.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`lms/thumbnails/${publicId}`);
      }

      update.thumbnail = req.file.path; // ✅ Cloudinary URL
    }

    // ❌ Remove any base64 handling entirely
    delete update.thumbnailBase64;

    if (update.price !== undefined) {
      update.isPaid = parseFloat(update.price) > 0;
    }

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user._id },
      update,
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json({ success: true, course });
  } catch (error) {
    console.error('💥 Error updating course:', error);
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
    if (course.price > 0) {
      console.log('💰 Paid course - creating checkout session');
      const session = await createCheckoutSession(course, user);
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
    const userId = req.user._id;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lesson = course.lessons.find(l => l._id.toString() === lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const user = await User.findById(userId);
    const enrollment = user.enrolledCourses.find(e => {
      const cId = e.course ? e.course.toString() : e.toString();
      return cId === courseId;
    });

    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    if (!enrollment.completedLessons) enrollment.completedLessons = [];

    const alreadyCompleted = enrollment.completedLessons.some(
      l => l.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId);
    }

    // ✅ Deduplicate then recalculate from real count
    enrollment.completedLessons = [
      ...new Set(enrollment.completedLessons.map(l => l.toString()))
    ];

    const totalLessons = course.lessons.length;
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    if (enrollment.progress >= 100) {
      enrollment.completed = true;
      enrollment.completionDate = enrollment.completionDate || new Date();
    }

    user.markModified('enrolledCourses'); 
    await user.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completed: enrollment.completed || false,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
