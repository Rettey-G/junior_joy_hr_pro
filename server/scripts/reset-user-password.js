const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function resetUserPassword(username, newPassword) {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.error('User not found:', username);
      process.exit(1);
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log(`Password for ${username} has been reset successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
}

// Change these values as needed:
resetUserPassword('Saudhoon', 'Saudhoon@123'); 