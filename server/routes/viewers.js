const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Viewer = require('../models/Viewer');
const viewerAuth = require('../middleware/viewerAuth');

const router = express.Router();

// VIEWER REGISTRATION
router.post('/register', async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body;

    if (!displayName || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Enter a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingViewer = await Viewer.findOne({ email: normalizedEmail });

    if (existingViewer) {
      return res.status(409).json({
        message: 'This email is already registered. Please log in.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const viewer = await Viewer.create({
      displayName,
      email: normalizedEmail,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: viewer._id, role: 'viewer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      viewer: {
        id: viewer._id,
        displayName: viewer.displayName,
        email: viewer.email
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered'
      });
    }
    next(err);
  }
});

// VIEWER LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const viewer = await Viewer.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!viewer || !(await bcrypt.compare(password, viewer.password))) {
      return res.status(401).json({
        message: 'Incorrect email or password'
      });
    }

    const token = jwt.sign(
      { id: viewer._id, role: 'viewer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      viewer: {
        id: viewer._id,
        displayName: viewer.displayName,
        email: viewer.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET LOGGED-IN VIEWER
router.get('/me', viewerAuth, async (req, res, next) => {
  try {
    const viewer = await Viewer.findById(req.viewer.id).select(
      'displayName email'
    );

    if (!viewer) {
      return res.status(404).json({
        message: 'Viewer account not found'
      });
    }

    res.json(viewer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;