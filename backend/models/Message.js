const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
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
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['question', 'feedback', 'general'],
      default: 'general'
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread'
    },
    replies: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
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
messageSchema.index({ course: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.model('Message', messageSchema);