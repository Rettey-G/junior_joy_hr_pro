const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

// GET all users (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    // Do not return password field
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET user by ID (admin only)
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE user (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const newUser = new User(req.body);
    await newUser.save();
    
    // Do not return password
    const savedUser = await User.findById(newUser._id).select('-password');
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create user', error: err.message });
  }
});

// UPDATE user (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // If changing username, check if new username already exists
    if (userData.username) {
      const existingUser = await User.findOne({ 
        username: userData.username,
        _id: { $ne: req.params.id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    // If updating password, it will be auto-hashed by the pre-save hook
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      userData,
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user', error: err.message });
  }
});

// DELETE user (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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
