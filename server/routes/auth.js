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
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Create and sign JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'yourjwtsecretkey',
      { expiresIn: '1d' }
    );
    
    // Send token and user info (without password)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fallback to demo users if no User collection exists yet
router.post('/demo-login', (req, res) => {
  const { username, password } = req.body;
  
  // Demo users with hardcoded passwords
  const demoUsers = [
    { id: '1', username: 'user', password: 'password', role: 'admin' },
    { id: '2', username: 'hr', password: 'password', role: 'hr' },
    { id: '3', username: 'employee', password: 'password', role: 'employee' }
  ];
  
  // Find user by username
  const user = demoUsers.find(u => u.username === username);
  
  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create and sign JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
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
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ valid: true, user });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // On client: remove token
  res.json({ msg: 'Logged out' });
});

module.exports = router;
