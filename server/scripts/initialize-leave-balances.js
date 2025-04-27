const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');

async function initializeLeaveBalances() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({ active: true });
    const leaveTypes = await LeaveType.find({ active: true });
    const currentYear = new Date().getFullYear();

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        // Skip gender-specific leaves that don't apply
        if (leaveType.genderSpecific && leaveType.gender !== employee.gender) {
          continue;
        }

        // Calculate pro-rated days if applicable
        let totalDays = leaveType.defaultDays;
        if (leaveType.proRated) {
          const joinDate = new Date(employee.joinedDate);
          if (joinDate.getFullYear() === currentYear) {
            const monthsWorked = 12 - joinDate.getMonth();
            totalDays = Math.floor((leaveType.defaultDays / 12) * monthsWorked);
          }
        }

        // Check if balance already exists
        const existingBalance = await LeaveBalance.findOne({
          employee: employee._id,
          leaveType: leaveType._id,
          year: currentYear
        });

        if (!existingBalance) {
          // Create new balance
          await LeaveBalance.create({
            employee: employee._id,
            leaveType: leaveType._id,
            year: currentYear,
            totalDays,
            remainingDays: totalDays,
            usedDays: 0
          });
          console.log(`Created leave balance for ${employee.name} - ${leaveType.name}`);
        } else {
          console.log(`Leave balance already exists for ${employee.name} - ${leaveType.name}`);
        }
      }
    }

    console.log('Leave balance initialization completed');
  } catch (error) {
    console.error('Error initializing leave balances:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initializeLeaveBalances(); 