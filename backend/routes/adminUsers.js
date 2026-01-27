// routes/adminUsers.js
const express = require('express');
const User = require('../models/User');
const sendEmail = require('../utils/sendemail_temp');
const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// APPROVE teacher with email notification
router.put('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isActive: true }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Send congratulatory email
    let emailSent = false;
    if (user.email) {
      try {
        await sendEmail({
          email: user.email,
          template: 'teacherApproval',
          templateData: [user.name]
        });
        emailSent = true;
        console.log(`✅ Approval email sent to ${user.email}`);
      } catch (emailError) {
        console.warn(`⚠️ Failed to send email to ${user.email}:`, emailError.message);
        // Don't fail the whole request if email fails
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Teacher approved successfully',
      emailSent: emailSent,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error approving teacher:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// REJECT teacher with email notification
router.put('/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Send rejection email before deleting
    let emailSent = false;
    if (user.email) {
      try {
        await sendEmail({
          email: user.email,
          template: 'teacherRejection',
          templateData: [user.name]
        });
        emailSent = true;
        console.log(`✅ Rejection email sent to ${user.email}`);
      } catch (emailError) {
        console.warn(`⚠️ Failed to send email to ${user.email}:`, emailError.message);
      }
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Teacher rejected successfully',
      emailSent: emailSent
    });
  } catch (error) {
    console.error('❌ Error rejecting teacher:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;