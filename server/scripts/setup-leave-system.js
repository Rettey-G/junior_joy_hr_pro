const mongoose = require('mongoose');
const LeaveType = require('../models/LeaveType');
const PublicHoliday = require('../models/PublicHoliday');

const defaultLeaveTypes = [
  {
    name: 'Annual Leave',
    defaultDays: 30,
    description: 'Standard annual leave entitlement',
    proRated: true
  },
  {
    name: 'Emergency Leave',
    defaultDays: 10,
    description: 'Leave for emergency situations',
    proRated: true
  },
  {
    name: 'Sick Leave',
    defaultDays: 30,
    description: 'Leave for medical reasons',
    proRated: true
  },
  {
    name: 'Paternity Leave',
    defaultDays: 3,
    description: 'Leave for male employees upon child birth',
    genderSpecific: true,
    gender: 'male',
    proRated: false
  },
  {
    name: 'Maternity Leave',
    defaultDays: 60,
    description: 'Leave for female employees for childbirth and care',
    genderSpecific: true,
    gender: 'female',
    proRated: false
  },
  {
    name: 'Family Care Leave',
    defaultDays: 10,
    description: 'Leave for family-related responsibilities',
    proRated: true
  }
];

const publicHolidays2025 = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-01', name: 'First Day of Ramazan' },
  { date: '2025-03-31', name: 'Eid-ul-Fithr' },
  { date: '2025-04-01', name: 'Eid-ul-Fithr Holiday' },
  { date: '2025-04-02', name: 'Eid-ul-Fithr Holiday' },
  { date: '2025-05-01', name: "International Worker's Day" },
  { date: '2025-06-05', name: 'Haji Day' },
  { date: '2025-06-06', name: 'Eid-ul-Alhaa' },
  { date: '2025-06-08', name: 'Eid-ul-Alhaa Holiday' },
  { date: '2025-06-09', name: 'Eid-ul-Alhaa Holiday' },
  { date: '2025-06-26', name: 'Islamic New Year' },
  { date: '2025-07-26', name: 'Independence Day' },
  { date: '2025-07-27', name: 'Independence Day Holiday' },
  { date: '2025-08-24', name: 'Rabi al-awwal' },
  { date: '2025-09-04', name: 'Milad Un Nabi (Mawlid)' },
  { date: '2025-09-24', name: 'The Day Maldives Embraced Islam' },
  { date: '2025-11-03', name: 'Victory Day' },
  { date: '2025-11-11', name: 'Republic Day' }
];

async function setupLeaveSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Setup leave types
    for (const leaveType of defaultLeaveTypes) {
      const existingType = await LeaveType.findOne({ name: leaveType.name });
      if (!existingType) {
        await LeaveType.create(leaveType);
        console.log(`Created leave type: ${leaveType.name}`);
      } else {
        console.log(`Leave type ${leaveType.name} already exists`);
      }
    }

    // Setup public holidays
    for (const holiday of publicHolidays2025) {
      const holidayDate = new Date(holiday.date);
      const existingHoliday = await PublicHoliday.findOne({
        date: holidayDate,
        year: 2025
      });

      if (!existingHoliday) {
        await PublicHoliday.create({
          date: holidayDate,
          name: holiday.name,
          year: 2025
        });
        console.log(`Created public holiday: ${holiday.name}`);
      } else {
        console.log(`Public holiday ${holiday.name} already exists`);
      }
    }

    console.log('Leave system setup completed');
  } catch (error) {
    console.error('Error setting up leave system:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupLeaveSystem(); 