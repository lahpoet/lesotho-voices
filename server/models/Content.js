const mongoose = require('mongoose');

const CATEGORIES = ['Culture', 'Travel', 'Current Affairs', 'Education', 'Technology', 'Lifestyle', 'Entertainment'];
const TYPES = ['article', 'video', 'image', 'podcast'];
const STATUSES = ['Draft', 'Published', 'Scheduled'];

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 500 },
    category: { type: String, required: [true, 'Category is required'], enum: CATEGORIES },
    contentType: { type: String, required: [true, 'Content type is required'], enum: TYPES },
    thumbnailUrl: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    articleBody: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'Draft' },
    publishDate: { type: Date },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 }
  },
  { timestamps: true } // createdAt = date created
);

// Validation rules for status, publish date and media
contentSchema.pre('validate', function (next) {
  if (this.status === 'Published' && !this.publishDate) this.publishDate = new Date();
  if (this.status === 'Scheduled' && !this.publishDate) {
    this.invalidate('publishDate', 'Scheduled content needs a publish date and time');
  }
  if (this.contentType === 'article' && !this.articleBody && !this.mediaUrl) {
    this.invalidate('articleBody', 'Articles need article text or a link');
  }
  if (this.contentType !== 'article' && !this.mediaUrl) {
    this.invalidate('mediaUrl', 'Add a media link for this content type');
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.TYPES = TYPES;
