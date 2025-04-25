const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Example: Dummy user for demonstration
const users = [
  { email: 'admin@hr.com', password: '$2a$10$dummyhash', role: 'admin' }
];

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ msg: 'Invalid credentials' });
  // In production, use bcrypt.compare
  const isMatch = password === 'admin123'; // Replace with bcrypt.compare
  if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// POST /logout (dummy endpoint)
router.post('/logout', (req, res) => {
  // On client: remove token
  res.json({ msg: 'Logged out' });
});

module.exports = router;
