const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please log in first' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'viewer') {
      return res.status(403).json({ message: 'Viewer access only' });
    }

    req.viewer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired login session' });
  }
};