const User = require('../models/User');
const Course = require('../models/Course');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('createdCourses', 'title thumbnail')
      .populate('enrolledCourses.course', 'title thumbnail');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    
    await user.save();
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    
    // Get enrolled courses with progress
    const enrolledCourses = await Course.find({
      _id: { $in: user.enrolledCourses.map(e => e.course) }
    }).select('title thumbnail lessons');
    
    // Calculate progress for each course
    const coursesWithProgress = enrolledCourses.map(course => {
      const enrolled = user.enrolledCourses.find(e => e.course.toString() === course._id.toString());
      return {
        ...course.toObject(),
        progress: enrolled ? enrolled.progress : 0,
        completed: enrolled ? enrolled.completed : false
      };
    });
    
    // Get created courses
    const createdCourses = await Course.find({
      instructor: user._id
    }).select('title thumbnail enrolledStudents');
    
    res.json({
      success: true,
      enrolledCourses: coursesWithProgress,
      createdCourses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort('-createdAt');
    
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};