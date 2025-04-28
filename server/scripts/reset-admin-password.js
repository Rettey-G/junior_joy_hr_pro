const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function resetAdminPassword() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const username = 'admin';
  const newPassword = 'Admin@123';
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.error('Admin user not found.');
      process.exit(1);
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log('Admin password has been reset successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin password:', err);
    process.exit(1);
  }
}

resetAdminPassword(); 