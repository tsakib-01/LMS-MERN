const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  progress: {
    type: Number,
    default: 0 // 0 - 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date
  }
}, { timestamps: true });

// auto-mark completed if progress hits 100
enrollmentSchema.pre('save', function (next) {
  if (this.progress === 100 && !this.completed) {
    this.completed = true;
    this.completionDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);