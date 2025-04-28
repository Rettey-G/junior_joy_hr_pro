const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const config = require('../package.json');

const MONGODB_URI = process.env.MONGODB_URI || config.config.mongodbUri;

const defaultAdmin = {
    username: 'admin',
    password: 'Admin@123',
    email: 'admin@jjoyhr.com',
    role: 'admin',
    active: true
};

const defaultHR = {
    username: 'hr',
    password: 'Hr@123',
    email: 'hr@jjoyhr.com',
    role: 'hr',
    active: true
};

const defaultEmployee = {
    username: 'employee',
    password: 'Employee@123',
    email: 'employee@jjoyhr.com',
    role: 'employee',
    active: true
};

function generateEmployeeNumber() {
    return 'EMP' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

function generateIdNumber() {
    return 'A' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

async function initializeDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create default users if they don't exist
        for (const userData of [defaultAdmin, defaultHR, defaultEmployee]) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);
                
                const user = new User({
                    ...userData,
                    password: hashedPassword
                });
                
                await user.save();
                console.log(`Created default user: ${userData.username}`);
            }
        }

        // Create corresponding employee records for HR and regular employee
        for (const userData of [defaultHR, defaultEmployee]) {
            const user = await User.findOne({ username: userData.username });
            if (user) {
                const existingEmployee = await Employee.findOne({ email: userData.email });
                if (!existingEmployee) {
                    const firstName = userData.username.charAt(0).toUpperCase() + userData.username.slice(1);
                    const employee = new Employee({
                        empNo: generateEmployeeNumber(),
                        name: `${firstName} User`,
                        idNumber: generateIdNumber(),
                        gender: 'Male',
                        nationality: 'Maldivian',
                        cityIsland: 'Male',
                        department: userData.role === 'hr' ? 'Human Resources' : 'General',
                        designation: userData.role === 'hr' ? 'HR Manager' : 'Staff',
                        workSite: 'Head Office',
                        joinedDate: new Date(),
                        salaryUSD: userData.role === 'hr' ? 2000 : 1500,
                        salaryMVR: userData.role === 'hr' ? 30800 : 23100,
                        active: true
                    });
                    
                    await employee.save();
                    console.log(`Created employee record for: ${userData.username}`);
                }
            }
        }

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

initializeDB(); 