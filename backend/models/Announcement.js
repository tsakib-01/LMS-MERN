const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please provide content']
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
    importance: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    readBy: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
announcementSchema.index({ course: 1, createdAt: -1 });
announcementSchema.index({ teacher: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);