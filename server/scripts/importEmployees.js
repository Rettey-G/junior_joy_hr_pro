/**
 * Script to import sample employee data to MongoDB Atlas
 * Run with: node server/scripts/importEmployees.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

// Sample employee data matching the table
const sampleEmployees = [
  {
    empNo: 'FEM001',
    name: 'Ahmed Sinaz',
    idNumber: 'A132309',
    gender: 'Male',
    nationality: 'Maldivian',
    dateOfBirth: new Date('1999-10-22'),
    mobileNumber: '9991960',
    workNo: '5991960',
    designation: 'Managing Director',
    department: 'Admin',
    workSite: 'Office',
    joinedDate: new Date('2021-03-21'),
    active: true
  },
  {
    empNo: 'FEM002',
    name: 'Ibrahim Jaleel',
    idNumber: 'A312547',
    gender: 'Male',
    nationality: 'Maldivian',
    dateOfBirth: new Date('1990-02-27'),
    mobileNumber: '9910772',
    workNo: '',
    designation: 'Chief Operating Officer',
    department: 'Operations',
    workSite: 'Office',
    joinedDate: new Date('2020-01-01'),
    active: true
  },
  {
    empNo: 'FEM003',
    name: 'Aishath Fazla Fazeel',
    idNumber: 'A158962',
    gender: 'Female',
    nationality: 'Maldivian',
    dateOfBirth: new Date('1999-12-09'),
    mobileNumber: '7822824',
    workNo: '',
    designation: 'Accountant',
    department: 'Finance',
    workSite: 'Office',
    joinedDate: new Date('2021-04-04'),
    active: true
  },
  {
    empNo: 'FEM005',
    name: 'Ahmed Hussain',
    idNumber: 'A060935',
    gender: 'Male',
    nationality: 'Maldivian',
    dateOfBirth: new Date('1970-05-22'),
    mobileNumber: '7962250',
    workNo: '',
    designation: 'Captain',
    department: 'Operations',
    workSite: 'Express 3',
    joinedDate: new Date('2021-08-01'),
    active: true
  },
  {
    empNo: 'FEM007',
    name: 'Ahmed Hasnain',
    idNumber: 'A133667',
    gender: 'Male',
    nationality: 'Maldivian',
    dateOfBirth: new Date('1970-05-22'),
    mobileNumber: '7646454',
    workNo: '',
    designation: 'Captain',
    department: 'Operations',
    workSite: 'Express 1',
    joinedDate: new Date('2021-07-28'),
    active: true
  }
];

// MongoDB Connection string
const MONGODB_URI = process.env.DB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    
    try {
      // First, drop the collection completely to remove any indexes from the old schema
      await mongoose.connection.dropCollection('employees').catch(err => {
        // Ignore error if collection doesn't exist
        if (err.codeName !== 'NamespaceNotFound') {
          console.error('Error dropping collection:', err);
        }
      });
      console.log('Dropped employees collection to remove old indexes');
      
      // Import Employee model - this will recreate the collection with the new schema
      const Employee = require('../models/Employee');
      
      // Import sample data
      const result = await Employee.insertMany(sampleEmployees);
      console.log(`Successfully imported ${result.length} employees`);
      
      console.log('Sample data:');
      console.table(sampleEmployees.map(emp => ({
        empNo: emp.empNo,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        workSite: emp.workSite
      })));
      
    } catch (error) {
      console.error('Error importing data:', error);
    } finally {
      // Close connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
