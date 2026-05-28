const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');
const { sendCertificateEmail } = require('../utils/sendemail_temp');

// ── GET all certificates (admin) ─────────────────────────────────────────────
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;

    let certificates = await Certificate.find(query)
      .populate('student', 'name email avatar')
      .populate('course', 'title thumbnail category')
      .populate('teacher', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      certificates = certificates.filter(c =>
        c.student?.name?.toLowerCase().includes(q) ||
        c.course?.title?.toLowerCase().includes(q) ||
        c.certificateNumber?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET eligible students ────────────────────────────────────────────────────
router.get('/eligible', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      'enrolledCourses.completed': true
    }).populate('enrolledCourses.course', 'title instructor thumbnail category');

    const eligible = [];

    for (const student of students) {
      for (const enrollment of student.enrolledCourses) {
        if (!enrollment.completed || !enrollment.course) continue;

        const existing = await Certificate.findOne({
          student: student._id,
          course: enrollment.course._id
        });
        if (existing) continue;

        const course = await Course.findById(enrollment.course._id).populate('instructor', 'name email');

        eligible.push({
          studentId:      student._id,
          studentName:    student.name,
          studentEmail:   student.email,
          studentAvatar:  student.avatar,
          courseId:       enrollment.course._id,
          courseTitle:    enrollment.course.title || course?.title,
          courseThumbnail:enrollment.course.thumbnail || course?.thumbnail,
          courseCategory: enrollment.course.category || course?.category,
          instructorId:   course?.instructor?._id,
          instructorName: course?.instructor?.name,
          completionDate: enrollment.completionDate || enrollment.enrolledAt,
          progress:       enrollment.progress
        });
      }
    }

    res.json({ success: true, data: eligible });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST issue a certificate + send congratulation email ─────────────────────
router.post('/issue', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId, courseId, grade } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: 'studentId and courseId are required' });
    }

    const existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Certificate already issued for this student/course' });
    }

    const student = await User.findById(studentId);
    const course  = await Course.findById(courseId).populate('instructor', 'name');

    if (!student || !course) {
      return res.status(404).json({ success: false, message: 'Student or course not found' });
    }

    const enrollment = student.enrolledCourses.find(
      e => e.course?.toString() === courseId
    );
    const completionDate = enrollment?.completionDate || new Date();

    const cert = new Certificate({
      student:     studentId,
      course:      courseId,
      teacher:     course.instructor._id,
      completionDate,
      grade:       grade != null ? grade : undefined,
      status:      'issued',
      approvedBy:  req.user._id,
      approvedAt:  new Date()
    });

    await cert.save();
    await cert.populate([
      { path: 'student', select: 'name email avatar' },
      { path: 'course',  select: 'title category thumbnail' },
      { path: 'teacher', select: 'name' }
    ]);

    // ── Send congratulation email ────────────────────────────────────────
    let emailSent = false;
    if (student.email) {
      try {
        // ✅ CORRECT — use the imported sendCertificateEmail directly
await sendCertificateEmail(
  student.email,
  student.name,
  course.title,
  cert.certificateNumber,
  cert.verificationCode,
  new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }),
  grade != null ? `${grade}%` : 'N/A',
  course.instructor?.name || 'Your Instructor'
);
        emailSent = true;
        console.log(`✅ Certificate congratulation email sent to ${student.email}`);
      } catch (emailErr) {
        console.warn(`⚠️ Email failed for ${student.email}:`, emailErr.message);
      }
    }

    res.json({
      success: true,
      data: cert,
      emailSent,
      message: emailSent
        ? `Certificate issued & congratulation email sent to ${student.email} 🎉`
        : `Certificate issued but email failed to send`
    });
  } catch (err) {
    console.error('❌ Issue certificate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH approve ────────────────────────────────────────────────────────────
router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status: 'issued', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    ).populate('student', 'name email').populate('course', 'title');

    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE revoke ────────────────────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate revoked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET student's own certificates ───────────────────────────────────────────
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user._id, status: 'issued' })
      .populate('course',  'title thumbnail category')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET verify by code (public) ──────────────────────────────────────────────
router.get('/verify/:code', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ verificationCode: req.params.code })
      .populate('student', 'name')
      .populate('course',  'title category')
      .populate('teacher', 'name');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;