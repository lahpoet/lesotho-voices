
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true
    },
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Viewer'
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: 50
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'hidden'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
