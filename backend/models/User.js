const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {

name: {
  type: String,
  required: [true, 'Please provide a name'],
  trim: true
},

// ✅ Add these two fields
avatar: {
  type: String,
  default: null
},

bio: {
  type: String,
  default: ''
},

    email: {
      type: String,
      required: function () {
        return this.role !== 'teacher';
      },
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },

    teacherId: {
      type: String,
      unique: true,
      sparse: true
    },

    password: {
      type: String,
      // Not required for invited teachers — they set it via the invite link
      required: function () {
        return !this.inviteToken;
      },
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student'
    },

    isActive: {
      type: Boolean,
      default: false
    },

    // ── Invite flow ──────────────────────────────────────────────────────────
    inviteToken: {
      type: String,
      select: false
    },

    inviteExpires: {
      type: Date,
      select: false
    },
    // ────────────────────────────────────────────────────────────────────────

    enrolledCourses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      progress: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      },
      enrolledAt: {
        type: Date,
        default: Date.now
      },
        completionDate: Date,
  certificate: String,

  // ← ADD THIS
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }]
  
    }],

    // user.model.js

bookmarks: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Course'
}],

recentlyViewed: [{
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
}],

    createdCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }]
  },
  {
    timestamps: true
  }
);

/* ======================
   PASSWORD HASHING
   Only hash if password exists and was modified
====================== */
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* ======================
   PASSWORD COMPARE
====================== */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model('User', userSchema);