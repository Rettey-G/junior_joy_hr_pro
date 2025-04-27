const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourjwtsecretkey');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

// Get all users (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user by ID (admin or self)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin or requesting their own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if username already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      role: role || 'employee'
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user (admin or self)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin or updating their own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { username, email, role, password } = req.body;
    const updateData = { username, email };

    // Only admin can update roles
    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }

    // If password is provided, it will be hashed by the pre-save middleware
    if (password) {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password endpoint (for own account or admin)
router.post('/change-password/:id', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourjwtsecretkey');
    
    // Only allow admins or the user themselves to change their password
    if (decoded.role !== 'admin' && decoded._id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only change your own password' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Admin can change password without current password
    if (decoded.role === 'admin' && decoded._id !== userId) {
      // Admin changing someone else's password
      user.password = newPassword;
      await user.save();
      return res.json({ message: 'Password changed successfully by admin' });
    }
    
    // User changing their own password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
