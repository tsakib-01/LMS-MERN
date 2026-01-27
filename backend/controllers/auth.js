const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- REQUIRE MULTER ---
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cv'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: CV must be PDF or DOC!');
    }
  }
});

// EXPORT THE UPLOAD MIDDLEWARE
exports.uploadCV = upload.single('cv');

// --- REGISTER ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Body:", req.body); 
    console.log("File:", req.file);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
// Normalize role to capitalize first letter
// Normalize role to lowercase
const normalizedRole = role ? role.toLowerCase() : 'student';

// Set active status
let isActive = false;
if (normalizedRole === 'student') {
  isActive = true;
}

    const userData = {
      name,
      email,
      password,
      role: normalizedRole,
      isActive
    };

    if (req.file) {
      userData.cv = req.file.path;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: isActive 
        ? 'Registration successful! You can now login.' 
        : 'Registration successful! Please wait for Admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration Error Details:", error);
    
    // Handle validation errors more gracefully
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration', 
      details: error.message 
    });
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not active. Wait for approval.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h'
    });

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// --- FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
  res.status(200).json({ message: 'Forgot password logic placeholder' });
};

// --- RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  res.status(200).json({ message: 'Reset password logic placeholder' });
};