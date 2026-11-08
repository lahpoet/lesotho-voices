const mongoose = require('mongoose');

const viewerSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address']
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Viewer', viewerSchema);