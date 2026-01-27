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
      required: [true, 'Please provide submission content']
    },
    file: {
      type: String // URL or path to uploaded file
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
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

// Index for faster queries
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ graded: 1 });

module.exports = mongoose.model('Submission', submissionSchema);