const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const defaultEmployees = [
  {
    empNo: 'EMP001',
    name: 'John Doe',
    idNumber: 'ID001',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'Male',
    dateOfBirth: new Date('1990-01-01'),
    mobileNumber: '+9607777777',
    workNo: 'W001',
    designation: 'Manager',
    department: 'Administration',
    workSite: 'Head Office',
    joinedDate: new Date('2020-01-01'),
    salaryUSD: 2000,
    salaryMVR: 30800,
    active: true
  },
  {
    empNo: 'EMP002',
    name: 'Jane Smith',
    idNumber: 'ID002',
    gender: 'Female',
    nationality: 'Maldivian',
    cityIsland: 'Male',
    dateOfBirth: new Date('1992-05-15'),
    mobileNumber: '+9607777778',
    workNo: 'W002',
    designation: 'HR Officer',
    department: 'Human Resources',
    workSite: 'Head Office',
    joinedDate: new Date('2021-02-01'),
    salaryUSD: 1500,
    salaryMVR: 23100,
    active: true
  }
];

async function setupDefaultEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Create employees if they don't exist
    for (const employeeData of defaultEmployees) {
      const existingEmployee = await Employee.findOne({ empNo: employeeData.empNo });
      if (!existingEmployee) {
        const employee = new Employee(employeeData);
        await employee.save();
        console.log(`Created employee: ${employeeData.name}`);
      } else {
        console.log(`Employee ${employeeData.name} already exists`);
      }
    }

    console.log('Default employees setup completed');
  } catch (error) {
    console.error('Error setting up default employees:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupDefaultEmployees(); 