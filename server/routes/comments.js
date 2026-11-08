
const express = require('express');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Content = require('../models/Content');
const Viewer = require('../models/Viewer');
const auth = require('../middleware/auth');
const viewerAuth = require('../middleware/viewerAuth');

const router = express.Router();

// POST /api/comments - registered viewers only
router.post('/', viewerAuth, async (req, res, next) => {
  try {
    const { contentId, text } = req.body;

    if (!mongoose.isValidObjectId(contentId)) {
      return res.status(400).json({ message: 'Invalid content id' });
    }

    if (!(await Content.exists({ _id: contentId }))) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const viewer = await Viewer.findById(req.viewer.id);

    if (!viewer) {
      return res.status(404).json({ message: 'Viewer account not found' });
    }

    const comment = await Comment.create({
      contentId,
      viewerId: viewer._id,
      displayName: viewer.displayName,
      text
    });

    res.status(201).json({
      message: 'Thank you! Your comment will appear after the creator approves it.',
      comment
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    next(err);
  }
});

// GET /api/comments/admin/all - creator only
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    res.json(
      await Comment.find()
        .populate('contentId', 'title')
        .sort({ createdAt: -1 })
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/comments/:contentId - approved comments only
router.get('/:contentId', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.contentId)) {
      return res.status(400).json({ message: 'Invalid content id' });
    }

    res.json(
      await Comment.find({
        contentId: req.params.contentId,
        status: 'approved'
      }).sort({ createdAt: -1 })
    );
  } catch (err) {
    next(err);
  }
});

// PUT /api/comments/:id/status - creator only
router.put('/:id/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }

    if (!['approved', 'hidden', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id - creator only
router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }

    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
