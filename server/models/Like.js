const mongoose = require('mongoose');

// viewerId is a random id saved in the viewer's browser (no registration needed)
const likeSchema = new mongoose.Schema(
  {
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    viewerId: { type: String, required: true }
  },
  { timestamps: true }
);

likeSchema.index({ contentId: 1, viewerId: 1 }, { unique: true }); // one like per viewer per item

module.exports = mongoose.model('Like', likeSchema);
