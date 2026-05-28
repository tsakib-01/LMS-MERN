// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'returned', 'graded'],
      default: 'draft'
    },
    submittedAt: {
      type: Date
    },
    privateComments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }],
    grade: {
      type: Number,
      min: 0
    },
    feedback: {
      type: String
    },
    graded: {
      type: Boolean,
      default: false
    },
    gradedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);