const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdminUser() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const username = 'admin';
  const password = 'Admin@123';
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      username,
      password: hashedPassword,
      role: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@juniorjoy.com',
      active: true
    });
    await user.save();
    console.log('Admin user created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdminUser(); 