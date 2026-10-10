const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'resolvetrack_super_secure_jwt_secret_key_2026_xyz', {
    expiresIn: '7d'
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Role cannot be self-escalated to admin during standard registration
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'user'
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to register account.',
      error: error.message
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login error.',
      error: error.message
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user profile.',
      error: error.message
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
