require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB Connection
const MONGODB_URI = process.env.DB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initial demo users with USD and MVR account numbers
const demoUsers = [
  {
    username: 'user',
    password: 'password',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    accountUSD: 'USD123456789',
    accountMVR: 'MVR123456789',
    active: true
  },
  {
    username: 'hr',
    password: 'password',
    role: 'hr',
    firstName: 'HR',
    lastName: 'Manager',
    email: 'hr@example.com',
    accountUSD: 'USD234567890',
    accountMVR: 'MVR234567890',
    active: true
  },
  {
    username: 'employee',
    password: 'password',
    role: 'employee',
    firstName: 'Demo',
    lastName: 'Employee',
    email: 'employee@example.com',
    accountUSD: 'USD345678901',
    accountMVR: 'MVR345678901',
    active: true
  },
  // Additional 41 sample users with random account numbers
  ...Array.from({ length: 41 }, (_, i) => ({
    username: `user${i + 4}`,
    password: 'password',
    role: i % 5 === 0 ? 'hr' : 'employee',
    firstName: `User${i + 4}`,
    lastName: `Sample${i + 4}`,
    email: `user${i + 4}@example.com`,
    accountUSD: `USD${Math.floor(100000000 + Math.random() * 900000000)}`,
    accountMVR: `MVR${Math.floor(100000000 + Math.random() * 900000000)}`,
    active: true
  }))
];

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    
    try {
      // Check if users collection exists and has content
      const existingUsers = await User.countDocuments();
      
      if (existingUsers > 0) {
        // Drop the collection to start fresh
        console.log(`Found ${existingUsers} existing users, dropping collection...`);
        await mongoose.connection.db.dropCollection('users');
        console.log('Dropped users collection to remove old data');
      }
      
      // Insert users
      const result = await User.insertMany(demoUsers);
      console.log(`Successfully imported ${result.length} users`);
      
      // Display sample data
      const sampleUser = await User.findOne().select('-password');
      console.log('Sample user data:');
      console.log(JSON.stringify(sampleUser, null, 2));
      
    } catch (error) {
      console.error('Error importing users:', error.message);
    } finally {
      // Close MongoDB connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
