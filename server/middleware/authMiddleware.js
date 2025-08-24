const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, isAdmin? }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function admin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
}

module.exports = { protect, admin };
