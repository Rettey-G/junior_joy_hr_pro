const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Example: Dummy users for demonstration
const users = [
  { username: 'user', password: 'password', role: 'admin' },
  { username: 'hr', password: 'password', role: 'hr' },
  { username: 'employee', password: 'password', role: 'employee' }
];

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ msg: 'Invalid credentials' });
  // In production, use bcrypt.compare
  const isMatch = password === user.password; // Simple password check
  if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET || 'yourjwtsecretkey', { expiresIn: '1h' });
  res.json({ token, user: { username: user.username, role: user.role } });
});

// POST /logout (dummy endpoint)
router.post('/logout', (req, res) => {
  // On client: remove token
  res.json({ msg: 'Logged out' });
});

module.exports = router;
