const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');
const Training = require('../models/Training');
const bcrypt = require('bcryptjs');
const config = require('../package.json');

const MONGODB_URI = process.env.MONGODB_URI || config.config.mongodbUri;

// Default Users
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

// Default Leave Types
const defaultLeaveTypes = [
    {
        name: 'Annual Leave',
        defaultDays: 30,
        description: 'Regular annual leave entitlement',
        active: true
    },
    {
        name: 'Sick Leave',
        defaultDays: 15,
        description: 'Medical and health-related leave',
        active: true
    },
    {
        name: 'Casual Leave',
        defaultDays: 10,
        description: 'Short-term personal leave',
        active: true
    },
    {
        name: 'Maternity Leave',
        defaultDays: 60,
        description: 'Leave for childbirth and early childcare',
        active: true
    },
    {
        name: 'Paternity Leave',
        defaultDays: 10,
        description: 'Leave for new fathers',
        active: true
    }
];

function parseDate(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return new Date(2000 + parseInt(year), months[month], parseInt(day));
}

// Create corresponding employee records
const employees = [
    {
        empNo: 'FEM001',
        name: 'Ahmed Sinaz',
        idNumber: 'A132309',
        gender: 'Male',
        nationality: 'Maldivian',
        dateOfBirth: new Date('1989-10-22'),
        mobileNumber: '9991960',
        designation: 'Managing Director',
        department: 'Admin',
        workSite: 'Office',
        joinedDate: new Date('2011-03-21'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    },
    {
        empNo: 'FEM002',
        name: 'Ibrahim Jaleel',
        idNumber: 'A312547',
        gender: 'Male',
        nationality: 'Maldivian',
        dateOfBirth: new Date('1990-02-27'),
        mobileNumber: '9911077',
        designation: 'Chief Operating Officer',
        department: 'Operations',
        workSite: 'Office',
        joinedDate: new Date('2020-01-01'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    },
    {
        empNo: 'FEM003',
        name: 'Aishath Fazaa Fazeel',
        idNumber: 'A158962',
        gender: 'Female',
        nationality: 'Maldivian',
        dateOfBirth: new Date('1999-12-09'),
        mobileNumber: '7822324',
        designation: 'Accountant',
        department: 'Finance',
        workSite: 'Office',
        joinedDate: new Date('2021-03-04'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    },
    {
        empNo: 'FEM006',
        name: 'Ahmed Hussain',
        idNumber: 'A060935',
        gender: 'Male',
        nationality: 'Maldivian',
        dateOfBirth: new Date('1970-05-22'),
        mobileNumber: '7962250',
        designation: 'Captain',
        department: 'Operations',
        workSite: 'Express 3',
        joinedDate: new Date('2021-08-10'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    },
    {
        empNo: 'FEM007',
        name: 'Ahmed Hasnain',
        idNumber: 'A133567',
        gender: 'Male',
        nationality: 'Maldivian',
        dateOfBirth: new Date('1970-05-22'),
        mobileNumber: '7646454',
        designation: 'Captain',
        department: 'Operations',
        workSite: 'Express 1',
        joinedDate: new Date('2021-07-28'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    },
    {
        empNo: 'FEM008',
        name: 'Mohamed Jamer Uddin',
        idNumber: 'EL0110781',
        gender: 'Male',
        nationality: 'Bangladeshi',
        dateOfBirth: new Date('1981-01-07'),
        mobileNumber: '7706226',
        designation: 'Driver',
        department: 'Operations',
        workSite: 'Bowser',
        joinedDate: new Date('2021-01-11'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    }
];

// Add the rest of the employees (continuing the pattern)
const additionalEmployees = [
    {
        empNo: 'FEM009',
        name: 'Abdul Kalam Azad',
        idNumber: 'EG0459449',
        gender: 'Male',
        nationality: 'Bangladeshi',
        dateOfBirth: new Date('1985-07-15'),
        mobileNumber: '9141139',
        designation: 'Driver',
        department: 'Operations',
        workSite: 'Bowser',
        joinedDate: new Date('2022-10-18'),
        salaryMVR: 2000,
        salaryUSD: 2000,
        accountMVR: '7705328542101',
        accountUSD: '7705328542102',
        active: true
    },
    // ... Adding more employees in chunks to avoid message length limits
];

// Combine all employees
employees.push(...additionalEmployees);

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

        // Create default leave types
        for (const leaveTypeData of defaultLeaveTypes) {
            const existingLeaveType = await LeaveType.findOne({ name: leaveTypeData.name });
            if (!existingLeaveType) {
                const leaveType = new LeaveType(leaveTypeData);
                await leaveType.save();
                console.log(`Created leave type: ${leaveTypeData.name}`);
            }
        }

        // Create employee records
        for (const employeeData of employees) {
            const existingEmployee = await Employee.findOne({ empNo: employeeData.empNo });
            if (!existingEmployee) {
                const employee = new Employee(employeeData);
                await employee.save();
                console.log(`Created employee: ${employeeData.name}`);
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