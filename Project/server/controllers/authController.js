const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phone, city, providerInfo } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists.' 
      });
    }

    // Create user
    const userData = { name, email, password, phone, city };
    
    if (role === 'provider' || role === 'customer') {
      userData.role = role;
    }

    if (role === 'provider' && providerInfo) {
      userData.providerInfo = {
        ...providerInfo,
        isVerified: false,
        rating: 0,
        totalReviews: 0
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        providerInfo: user.providerInfo
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        providerInfo: user.providerInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('providerInfo.category', 'name icon');
    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, city, avatar, providerInfo } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (avatar) updateData.avatar = avatar;

    if (req.user.role === 'provider' && providerInfo) {
      updateData['providerInfo.skills'] = providerInfo.skills || req.user.providerInfo.skills;
      updateData['providerInfo.bio'] = providerInfo.bio || req.user.providerInfo.bio;
      updateData['providerInfo.experience'] = providerInfo.experience || req.user.providerInfo.experience;
      updateData['providerInfo.category'] = providerInfo.category || req.user.providerInfo.category;
      updateData['providerInfo.hourlyRate'] = providerInfo.hourlyRate || req.user.providerInfo.hourlyRate;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { 
      new: true, 
      runValidators: true 
    }).populate('providerInfo.category', 'name icon');

    res.json({ success: true, user, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('UpdateMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
