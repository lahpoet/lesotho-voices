const express = require('express');
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const auth = require('../middleware/auth');
const router = express.Router();

// Content that viewers are allowed to see
const visible = () => ({
  $or: [{ status: 'Published' }, { status: 'Scheduled', publishDate: { $lte: new Date() } }]
});

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
  next();
};

const sendValidation = (err, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  next(err);
};

// GET /api/contents?search=&category=&featured=true  (public)
router.get('/', async (req, res, next) => {
  try {
    const and = [visible()];
    if (req.query.category && req.query.category !== 'All') and.push({ category: req.query.category });
    if (req.query.featured === 'true') and.push({ isFeatured: true });
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      and.push({ $or: [{ title: rx }, { description: rx }, { articleBody: rx }] });
    }
    const items = await Content.find({ $and: and }).select('-articleBody').sort({ publishDate: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

// GET /api/contents/admin/all (creator only) - includes drafts and scheduled
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    res.json(await Content.find().sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

// GET /api/contents/:id (public) - also adds 1 to the view count
router.get('/:id', checkId, async (req, res, next) => {
  try {
    const item = await Content.findOneAndUpdate(
      { _id: req.params.id, ...visible() },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Content not found' });
    res.json(item);
  } catch (err) { next(err); }
});

// POST /api/contents (creator only)
router.post('/', auth, async (req, res, next) => {
  try {
    const { views, likesCount, ...data } = req.body; // counters cannot be set by hand
    res.status(201).json(await Content.create(data));
  } catch (err) { sendValidation(err, res, next); }
});

// PUT /api/contents/:id (creator only)
router.put('/:id', auth, checkId, async (req, res, next) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    const { views, likesCount, ...data } = req.body;
    item.set(data);
    await item.save(); // runs validation again
    res.json(item);
  } catch (err) { sendValidation(err, res, next); }
});

// DELETE /api/contents/:id (creator only)
router.delete('/:id', auth, checkId, async (req, res, next) => {
  try {
    const item = await Content.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    await Comment.deleteMany({ contentId: item._id });
    await Like.deleteMany({ contentId: item._id });
    res.json({ message: 'Content deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
