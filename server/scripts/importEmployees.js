/**
 * Script to import sample employee data to MongoDB Atlas
 * Run with: node server/scripts/importEmployees.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

// Helper function to parse date format DD-MMM-YY
function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  
  // Handle special case
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  
  try {
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const parts = dateStr.split('-');
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    let year = parts[2];
    
    // Handle 2-digit year
    if (year.length === 2) {
      // Assume 20xx for years less than 50, 19xx for years >= 50
      year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    }
    
    return new Date(`${year}-${month}-${day}`);
  } catch (e) {
    console.error(`Error parsing date: ${dateStr}`, e);
    return null;
  }
}

// Employee data from the table
const sampleEmployees = [
  {
    empNo: 'FEM001',
    name: 'Ahmed Sinaz',
    idNumber: 'A132309',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('22-Oct-89'),
    mobileNumber: '9991960',
    workNo: '',
    designation: 'Managing Director',
    department: 'Admin',
    workSite: 'Office',
    joinedDate: parseDate('21-Mar-11'),
    salaryUSD: 1000,
    salaryMVR: 1000,
    image: '',
    active: true
  },
  {
    empNo: 'FEM002',
    name: 'Ibrahim Jaleel',
    idNumber: 'A312547',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('27-Feb-90'),
    mobileNumber: '9911077',
    workNo: '',
    designation: 'Chief Operating Officer',
    department: 'Operations',
    workSite: 'Office',
    joinedDate: parseDate('01-Jan-20'),
    salaryUSD: 1223,
    salaryMVR: 1223,
    image: '',
    active: true
  },
  {
    empNo: 'FEM003',
    name: 'Aishath Fazaa Fazeel',
    idNumber: 'A158962',
    gender: 'Female',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('09-Dec-99'),
    mobileNumber: '7822324',
    workNo: '',
    designation: 'Accountant',
    department: 'Finance',
    workSite: 'Office',
    joinedDate: parseDate('04-Mar-21'),
    salaryUSD: 1446,
    salaryMVR: 1446,
    image: '',
    active: true
  },
  {
    empNo: 'FEM006',
    name: 'Ahmed Hussain',
    idNumber: 'A060935',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('22-May-70'),
    mobileNumber: '7962250',
    workNo: '',
    designation: 'Captain',
    department: 'Operations',
    workSite: 'Express 3',
    joinedDate: parseDate('10-Aug-21'),
    salaryUSD: 1669,
    salaryMVR: 1669,
    image: '',
    active: true
  },
  {
    empNo: 'FEM007',
    name: 'Ahmed Hasnain',
    idNumber: 'A133567',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('22-May-70'),
    mobileNumber: '7646454',
    workNo: '',
    designation: 'Captain',
    department: 'Operations',
    workSite: 'Express 1',
    joinedDate: parseDate('28-Jul-21'),
    salaryUSD: 1892,
    salaryMVR: 1892,
    image: '',
    active: true
  },
  {
    empNo: 'FEM008',
    name: 'Mohamed Jamer Uddin',
    idNumber: 'EL0110781',
    gender: 'Male',
    nationality: 'Bangladeshi',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('07-Jan-81'),
    mobileNumber: '7706226',
    workNo: '',
    designation: 'Driver',
    department: 'Operations',
    workSite: 'Bowser',
    joinedDate: parseDate('11-Jan-21'),
    salaryUSD: 2115,
    salaryMVR: 2115,
    image: '',
    active: true
  },
  {
    empNo: 'FEM009',
    name: 'Abdul Kalam Azad',
    idNumber: 'EG0459449',
    gender: 'Male',
    nationality: 'Bangladeshi',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('15-Jul-85'),
    mobileNumber: '9141139',
    workNo: '',
    designation: 'Driver',
    department: 'Operations',
    workSite: 'Bowser',
    joinedDate: parseDate('18-Oct-22'),
    salaryUSD: 2338,
    salaryMVR: 2338,
    image: '',
    active: true
  },
  {
    empNo: 'FEM010',
    name: 'Dinahar Jojo Trimothy',
    idNumber: 'L9299054',
    gender: 'Male',
    nationality: 'Indian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('20-Apr-74'),
    mobileNumber: '9651444',
    workNo: '',
    designation: 'Driver',
    department: 'Operations',
    workSite: 'Bowser',
    joinedDate: parseDate('16-May-22'),
    salaryUSD: 2561,
    salaryMVR: 2561,
    image: '',
    active: true
  },
  {
    empNo: 'FEM012',
    name: 'Md Rubel',
    idNumber: 'BL0607967',
    gender: 'Male',
    nationality: 'Bangladeshi',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('03-Jan-84'),
    mobileNumber: '9193552',
    workNo: '',
    designation: 'Crew',
    department: 'Operations',
    workSite: 'Express 1',
    joinedDate: parseDate('27-Oct-21'),
    salaryUSD: 2784,
    salaryMVR: 2784,
    image: '',
    active: true
  },
  {
    empNo: 'FEM014',
    name: 'MD Edres Ali Salail',
    idNumber: 'BJ0402989',
    gender: 'Male',
    nationality: 'Bangladeshi',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('23-Jul-72'),
    mobileNumber: '7588367',
    workNo: '',
    designation: 'Driver',
    department: 'Operations',
    workSite: 'Bowser',
    joinedDate: parseDate('18-Oct-22'),
    salaryUSD: 3007,
    salaryMVR: 3007,
    image: '',
    active: true
  }
];

// Add the rest of the employees (we'll add 10 more here to keep the script manageable)
const additionalEmployees = [
  {
    empNo: 'FEM015',
    name: 'Aishath Zaina Zubair',
    idNumber: 'A282699',
    gender: 'Female',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('02-Dec-01'),
    mobileNumber: '9658800',
    workNo: '',
    designation: 'Admin Excecutive',
    department: 'Admin',
    workSite: 'Office',
    joinedDate: parseDate('28-Feb-23'),
    salaryUSD: 3230,
    salaryMVR: 3230,
    image: '',
    active: true
  },
  {
    empNo: 'FEM016',
    name: 'Aishath Shifnee',
    idNumber: 'A316572',
    gender: 'Female',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('16-Nov-91'),
    mobileNumber: '9151511',
    workNo: '',
    designation: 'Legal Officer',
    department: 'Admin',
    workSite: 'Office',
    joinedDate: parseDate('06-Mar-23'),
    salaryUSD: 3453,
    salaryMVR: 3453,
    image: '',
    active: true
  },
  {
    empNo: 'FEM017',
    name: 'Ajith Shankarna',
    idNumber: 'N10034127',
    gender: 'Female',
    nationality: 'Sri Lankan',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('03-Jul-74'),
    mobileNumber: '9908211',
    workNo: '',
    designation: 'Mechanic',
    department: 'Engineering',
    workSite: 'Express 10',
    joinedDate: parseDate('20-Feb-23'),
    salaryUSD: 3676,
    salaryMVR: 3676,
    image: '',
    active: true
  },
  {
    empNo: 'FEM020',
    name: 'Mohamed Nazeeh',
    idNumber: 'A124237',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('28-Dec-83'),
    mobileNumber: '9762222',
    workNo: '',
    designation: 'Captain',
    department: 'Operations',
    workSite: 'Express 7',
    joinedDate: parseDate('05-Jun-23'),
    salaryUSD: 3899,
    salaryMVR: 3899,
    image: '',
    active: true
  },
  {
    empNo: 'FEM023',
    name: 'Thilak Shantha',
    idNumber: 'N9908617',
    gender: 'Male',
    nationality: 'Sri Lankan',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('30-Apr-76'),
    mobileNumber: '7806521',
    workNo: '',
    designation: 'Chief Engineer',
    department: 'Engineering',
    workSite: 'Express 10',
    joinedDate: parseDate('14-Sep-23'),
    salaryUSD: 4122,
    salaryMVR: 4122,
    image: '',
    active: true
  },
  {
    empNo: 'FEM027',
    name: 'Mohamed Fazmy Mohamed Faleel',
    idNumber: 'N2769966',
    gender: 'Male',
    nationality: 'Sri Lankan',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('06-Jan-85'),
    mobileNumber: '7206696',
    workNo: '',
    designation: 'Sales Manager',
    department: 'Sales & Marketing',
    workSite: 'Office',
    joinedDate: parseDate('03-Jan-24'),
    salaryUSD: 4345,
    salaryMVR: 4345,
    image: '',
    active: true
  },
  {
    empNo: 'FEM028',
    name: 'Mohamed Nishan',
    idNumber: 'A146198',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('10-Dec-83'),
    mobileNumber: '9703322',
    workNo: '',
    designation: 'Chief Officer',
    department: 'Operations',
    workSite: 'Express 10',
    joinedDate: parseDate('17-Jan-24'),
    salaryUSD: 4568,
    salaryMVR: 4568,
    image: '',
    active: true
  },
  {
    empNo: 'FEM029',
    name: 'Ismail Ali Manik',
    idNumber: 'A049728',
    gender: 'Male',
    nationality: 'Maldivian',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('15-Oct-52'),
    mobileNumber: '9656157',
    workNo: '',
    designation: 'Chief Engineer',
    department: 'Operations',
    workSite: 'Express 10',
    joinedDate: parseDate('17-Jan-24'),
    salaryUSD: 4791,
    salaryMVR: 4791,
    image: '',
    active: true
  },
  {
    empNo: 'FEM032',
    name: 'MD Shaarif',
    idNumber: 'A02231101',
    gender: 'Male',
    nationality: 'Bangladeshi',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('17-May-93'),
    mobileNumber: '',
    workNo: '',
    designation: 'Crew',
    department: 'Operations',
    workSite: 'Express 7',
    joinedDate: parseDate('10-Feb-24'),
    salaryUSD: 5014,
    salaryMVR: 5014,
    image: '',
    active: true
  },
  {
    empNo: 'FEM035',
    name: 'Sumith Upul Kumara',
    idNumber: 'N8485954',
    gender: 'Male',
    nationality: 'Sri Lankan',
    cityIsland: 'hinnavaru',
    dateOfBirth: parseDate('08-Mar-69'),
    mobileNumber: '9908611',
    workNo: '',
    designation: 'Engineer Manager',
    department: 'Engineering',
    workSite: 'Office',
    joinedDate: parseDate('26-Feb-24'),
    salaryUSD: 5237,
    salaryMVR: 5237,
    image: '',
    active: true
  }
];

// Combine all employees
sampleEmployees.push(...additionalEmployees);

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
