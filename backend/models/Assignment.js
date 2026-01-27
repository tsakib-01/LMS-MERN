const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline']
    },
    maxGrade: {
      type: Number,
      default: 100
    },
    attachments: [{
      type: String
    }],
    submissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);