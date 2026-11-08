const express = require('express');
const Content = require('../models/Content');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/stats (creator only)
router.get('/stats', auth, async (req, res, next) => {
  try {
    const [total, published, drafts, scheduled, comments, pendingComments, totals, popular] = await Promise.all([
      Content.countDocuments(),
      Content.countDocuments({ status: 'Published' }),
      Content.countDocuments({ status: 'Draft' }),
      Content.countDocuments({ status: 'Scheduled' }),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Content.aggregate([{ $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likesCount' } } }]),
      Content.find().sort({ views: -1 }).limit(3).select('title views likesCount')
    ]);
    res.json({
      total, published, drafts, scheduled, comments, pendingComments,
      totalViews: totals[0] ? totals[0].views : 0,
      totalLikes: totals[0] ? totals[0].likes : 0,
      popular
    });
  } catch (err) { next(err); }
});

module.exports = router;
