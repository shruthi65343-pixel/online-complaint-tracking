const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'resolvetrack_super_secure_jwt_secret_key_2026_xyz');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired.',
      error: error.message
    });
  }
};

const authenticateOptional = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'resolvetrack_super_secure_jwt_secret_key_2026_xyz');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Continue without setting req.user
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required.'
    });
  }
  next();
};

module.exports = {
  authenticate,
  authenticateOptional,
  requireAdmin
};
