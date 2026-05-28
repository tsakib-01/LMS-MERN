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
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline']
    },
    maxGrade: {
      type: Number,
      default: 100,
      min: [1, 'Max grade must be at least 1']
    },
    attachments: [{
      type: String  // Stores file paths like '/uploads/assignments/1234567890-document.pdf'
    }],
    submissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  }
);

// Index for faster queries
assignmentSchema.index({ course: 1, deadline: -1 });
assignmentSchema.index({ teacher: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.deadline;
});

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions ? this.submissions.length : 0;
});

// Method to check if a student has submitted
assignmentSchema.methods.hasStudentSubmitted = function(studentId) {
  return this.submissions.some(sub => sub.student.toString() === studentId.toString());
};

// Static method to find assignments by course
assignmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId, isActive: true })
    .populate('course', 'title')
    .populate('teacher', 'name email')
    .sort({ deadline: 1 });
};

// Static method to find assignments by teacher
assignmentSchema.statics.findByTeacher = function(teacherId) {
  return this.find({ teacher: teacherId, isActive: true })
    .populate('course', 'title')
    .populate({
      path: 'submissions',
      populate: {
        path: 'student',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 });
};

// Configure virtuals to be included in JSON
assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assignment', assignmentSchema);