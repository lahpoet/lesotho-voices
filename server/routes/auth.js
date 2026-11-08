const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/login  - creator login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Wrong email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Wrong email or password' });

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, name: user.name });
  } catch (err) { next(err); }
});

// GET /api/auth/creator - public creator profile for the home page
router.get('/creator', async (req, res, next) => {
  try {
    const user = await User.findOne().select('name bio avatarUrl');
    if (!user) return res.status(404).json({ message: 'Creator not set up yet. Run npm run seed.' });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
