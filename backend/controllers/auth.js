// controllers/auth.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── REGISTER (Students only) ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role && role.toLowerCase() === 'teacher') {
      return res.status(403).json({ message: 'Teacher registration is not allowed.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Server error during registration', details: error.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const user = await User.findOne({ email, role }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Guard: teacher was invited but never set their password yet
    if (!user.password) {
      return res.status(403).json({
        message: 'Please check your email and set your password before logging in.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is not active. Please contact admin.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role,avatar: user.avatar || null, }
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── FORGOT PASSWORD (placeholder) ────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  res.status(200).json({ message: 'Forgot password logic placeholder' });
};

// ── RESET PASSWORD (placeholder) ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  res.status(200).json({ message: 'Reset password logic placeholder' });
};

// ── SET PASSWORD — teacher uses invite link ───────────────────────────────────
// POST /api/auth/set-password/:token
exports.setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Basic validation
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Find user by token, making sure it hasn't expired
    const user = await User.findOne({
      inviteToken: token,
      inviteExpires: { $gt: Date.now() }
    }).select('+inviteToken +inviteExpires');

    if (!user) {
      return res.status(400).json({
        message: 'This invite link is invalid or has expired. Please ask the admin to resend the invite.'
      });
    }

    // Set the password and activate the account
    user.password = password;        // pre-save hook will hash it
    user.inviteToken = undefined;    // clear token
    user.inviteExpires = undefined;  // clear expiry
    user.isActive = true;            // activate account

    await user.save();

    console.log(`✅ Teacher ${user.email} set their password and is now active`);

    res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Set Password Error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// ── CREATE TEACHER (legacy — kept for any direct usage) ───────────────────────
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      role: 'teacher',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      user: { id: teacher._id, name: teacher.name, email: teacher.email, role: teacher.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// ── GET ALL USERS (admin only) ────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $in: ['student', 'teacher'] } };
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// ── TOGGLE USER STATUS (admin only) ──────────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};