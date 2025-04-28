const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Create and sign JWT token
    const token = jwt.sign(
      { 
        _id: user._id, 
        username: user.username, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET || 'yourjwtsecretkey',
      { expiresIn: '24h' }
    );
    
    // Send token and user info (without password)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error occurred during login' });
  }
});

// Fallback to demo users if no User collection exists yet
router.post('/demo-login', (req, res) => {
  const { username, password } = req.body;
  
  // Demo users with hardcoded passwords
  const demoUsers = [
    { id: '1', username: 'admin', password: 'Admin@123', role: 'admin' },
    { id: '2', username: 'hr', password: 'Hr@123', role: 'hr' },
    { id: '3', username: 'employee', password: 'Employee@123', role: 'employee' },
    // Keep the old demo credentials as fallback
    { id: '4', username: 'user', password: 'password', role: 'admin' }
  ];
  
  // Find user by username
  const user = demoUsers.find(u => u.username === username);
  
  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create and sign JWT token
  const token = jwt.sign(
    { _id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'yourjwtsecretkey',
    { expiresIn: '1d' }
  );
  
  // Send token and user info (without password)
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourjwtsecretkey');
    const userId = decoded._id || decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ valid: false, message: 'Invalid token payload' });
    }
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ valid: true, user });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
