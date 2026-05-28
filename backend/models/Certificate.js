const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    certificateNumber: {
      type: String,
      unique: true
    },
    completionDate: {
      type: Date,
      required: true
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'issued'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    certificateUrl: {
      type: String
    },
    verificationCode: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

// Generate certificate number and verification code before saving
certificateSchema.pre('save', function() {
  const crypto = require('crypto');

  if (!this.certificateNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.certificateNumber = `CERT-${timestamp}-${random}`;
  }

  if (!this.verificationCode) {
    this.verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  }
});


// Index for efficient querying
certificateSchema.index({ student: 1, course: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ verificationCode: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
