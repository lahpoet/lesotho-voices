const express = require('express');
const mongoose = require('mongoose');
const Like = require('../models/Like');
const Content = require('../models/Content');
const router = express.Router();

// POST /api/likes  { contentId, viewerId }  - like, or unlike if already liked
router.post('/', async (req, res, next) => {
  try {
    const { contentId, viewerId } = req.body;
    if (!mongoose.isValidObjectId(contentId) || !viewerId) {
      return res.status(400).json({ message: 'contentId and viewerId are required' });
    }
    if (!(await Content.exists({ _id: contentId }))) return res.status(404).json({ message: 'Content not found' });

    const existing = await Like.findOne({ contentId, viewerId });
    let liked;
    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await Like.create({ contentId, viewerId });
      liked = true;
    }
    const item = await Content.findByIdAndUpdate(contentId, { $inc: { likesCount: liked ? 1 : -1 } }, { new: true });
    res.status(liked ? 201 : 200).json({ liked, likesCount: item.likesCount });
  } catch (err) { next(err); }
});

// GET /api/likes/:contentId?viewerId=...  - has this viewer already liked it?
router.get('/:contentId', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.contentId)) return res.status(400).json({ message: 'Invalid id' });
    const liked = req.query.viewerId
      ? !!(await Like.exists({ contentId: req.params.contentId, viewerId: req.query.viewerId }))
      : false;
    res.json({ liked });
  } catch (err) { next(err); }
});

module.exports = router;
