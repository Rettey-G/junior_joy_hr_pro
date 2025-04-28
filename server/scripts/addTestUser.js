// Script to add a real user with known password to MongoDB Atlas
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.DB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/jjoyHR?retryWrites=true&w=majority&appName=Cluster0';

async function addTestUser() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const username = 'admin';
  const password = 'Admin@123';
  const role = 'admin';
  const firstName = 'Super';
  const lastName = 'Admin';
  const email = 'admin@juniorjoy.com';

  // Check if user exists
  const existing = await User.findOne({ username });
  if (existing) {
    console.log('User already exists:', username);
    await mongoose.connection.close();
    return;
  }

  const user = new User({
    username,
    password, // Will be hashed by pre-save hook
    role,
    firstName,
    lastName,
    email,
    active: true
  });
  await user.save();
  console.log('Test user created:', username);
  await mongoose.connection.close();
}

addTestUser().catch(err => {
  console.error('Error adding test user:', err);
  process.exit(1);
});
