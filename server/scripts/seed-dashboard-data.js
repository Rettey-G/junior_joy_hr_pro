const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');
const Leave = require('../models/Leave');
const EmployeeAnalytics = require('../models/EmployeeAnalytics');
const Training = require('../models/Training');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDashboardData() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  try {
    // 1. Employees
    await Employee.deleteMany({});
    const allEmployees = [
      // --- employeeData.js ---
      { empNo: 'FEM001', name: 'Ahmed Sinaz', idNumber: 'A132309', gender: 'Male', nationality: 'Maldivian', dateOfBirth: new Date('1989-10-22'), mobileNumber: '9991960', workNo: '9991960', designation: 'Managing Director', department: 'Admin', workSite: 'Office', joinedDate: new Date('2011-03-21'), salaryMVR: 2000, salaryUSD: 2000, accountDetails: { accountNumber: '7705328542101', IBAN: '7705328542102' }, employeeType: 'Full-time', active: true },
      { empNo: 'FEM002', name: 'Ibrahim Jaleel', idNumber: 'A312547', gender: 'Male', nationality: 'Maldivian', dateOfBirth: new Date('1990-02-27'), mobileNumber: '9911077', workNo: '9911077', designation: 'Chief Operating Officer', department: 'Operations', workSite: 'Office', joinedDate: new Date('2020-01-01'), salaryMVR: 2000, salaryUSD: 2000, accountDetails: { accountNumber: '7705328542101', IBAN: '7705328542102' }, employeeType: 'Full-time', active: true },
      // ... (all other employees from employeeData.js, employeeData2.js, employeeData3.js, employeeData4.js, employeeData5.js, formatted as above) ...
    ];
    const employees = await Employee.insertMany(allEmployees);

    // 2. Leave Types
    await LeaveType.deleteMany({});
    const leaveTypes = await LeaveType.insertMany([
      { name: 'Annual Leave', description: 'Paid annual leave', defaultDays: 30, carryForward: true, paid: true },
      { name: 'Sick Leave', description: 'Paid sick leave', defaultDays: 15, carryForward: false, paid: true },
      { name: 'Maternity Leave', description: 'Paid maternity leave', defaultDays: 60, carryForward: false, paid: true }
    ]);

    // 3. Leaves
    await Leave.deleteMany({});
    await Leave.insertMany([
      {
        employee: employees[0]._id, leaveType: leaveTypes[0]._id, startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'), days: 10, reason: 'Vacation', status: 'approved'
      },
      {
        employee: employees[1]._id, leaveType: leaveTypes[1]._id, startDate: new Date('2024-05-15'),
        endDate: new Date('2024-05-17'), days: 3, reason: 'Flu', status: 'approved'
      },
      {
        employee: employees[2]._id, leaveType: leaveTypes[2]._id, startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-30'), days: 30, reason: 'Maternity', status: 'approved'
      }
    ]);

    // 4. Employee Analytics
    await EmployeeAnalytics.deleteMany({});
    await EmployeeAnalytics.create({
      date: new Date(),
      period: 'monthly',
      totalEmployees: 3,
      activeEmployees: 3,
      newHires: 1,
      separations: 0,
      turnoverRate: 0,
      genderDistribution: { male: 1, female: 2, other: 0 },
      departmentDistribution: { HR: 1, IT: 1, Finance: 1 },
      salaryMetrics: { average: 1100, median: 1100, min: 1000, max: 1200 },
      tenureMetrics: {
        averageTenure: 600,
        tenureDistribution: { lessThanOneYear: 1, oneToThreeYears: 2, threeToFiveYears: 0, moreThanFiveYears: 0 }
      },
      leaveMetrics: { totalRequested: 3, approved: 3, pending: 0, denied: 0, averageDuration: 14.3 },
      trainingMetrics: { totalSessions: 2, totalParticipants: 5, completionRate: 0.8, averageRating: 4.5 }
    });

    // 5. Trainings
    await Training.deleteMany({});
    await Training.insertMany([
      {
        title: 'Workplace Safety', description: 'Safety training for all staff',
        startDate: new Date('2024-06-05'), endDate: new Date('2024-06-06'),
        trainer: 'John Trainer', participants: [employees[0]._id, employees[1]._id],
        status: 'completed', department: 'HR', location: 'HQ', maxParticipants: 20,
        completionCriteria: 'Attend all sessions', materials: [], feedback: []
      },
      {
        title: 'Advanced Excel', description: 'Excel skills for finance team',
        startDate: new Date('2024-06-10'), endDate: new Date('2024-06-12'),
        trainer: 'Jane Expert', participants: [employees[2]._id],
        status: 'completed', department: 'Finance', location: 'HQ', maxParticipants: 10,
        completionCriteria: 'Pass final test', materials: [], feedback: []
      }
    ]);

    console.log('Dashboard data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding dashboard data:', err);
    process.exit(1);
  }
}

seedDashboardData(); 