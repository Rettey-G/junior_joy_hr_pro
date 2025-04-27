const mongoose = require('mongoose');
const User = require('../models/User');

const defaultUsers = [
  {
    username: 'admin',
    password: 'Admin@123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  },
  {
    username: 'hr',
    password: 'Hr@123',
    role: 'hr',
    firstName: 'HR',
    lastName: 'Manager'
  },
  {
    username: 'employee',
    password: 'Employee@123',
    role: 'employee',
    firstName: 'Default',
    lastName: 'Employee'
  }
];

async function setupDefaultUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/jjoyHR?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Create users if they don't exist
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created ${userData.role} user: ${userData.username}`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    console.log('Default users setup completed');
  } catch (error) {
    console.error('Error setting up default users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupDefaultUsers(); 