// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
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
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide a duration'],
      min: 1
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    questions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number, // index of correct option
        required: true
      }
    }],
    attempts: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      answers: [{
        type: Number // index of selected option
      }],
      score: {
        type: Number
      },
      passed: {
        type: Boolean
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Method to calculate score
quizSchema.methods.calculateScore = function(answers) {
  let correct = 0;
  this.questions.forEach((q, index) => {
    if (q.correctAnswer === answers[index]) {
      correct++;
    }
  });
  
  const score = (correct / this.questions.length) * 100;
  const passed = score >= this.passingScore;
  
  return { score, passed, correct, total: this.questions.length };
};

module.exports = mongoose.model('Quiz', quizSchema);