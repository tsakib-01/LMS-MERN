const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  adminFee: {
    type: Number,
    required: true // 20% of amount
  },
  teacherEarnings: {
    type: Number,
    required: true // 80% of amount
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'simulated'],
    default: 'simulated'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
