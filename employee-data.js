// CommonJS version of the employee data for Node.js scripts
const fs = require('fs');
const path = require('path');

// Attempt to read the raw file content and extract the data
let employeeData = [];
try {
  const filePath = path.join(__dirname, 'client', 'src', 'data', 'allEmployeeData.js');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Extract the array data
  const startMarker = 'export default';
  const startIndex = fileContent.indexOf(startMarker) + startMarker.length;
  const contentString = fileContent.substring(startIndex).trim();
  
  // Remove wrapping export syntax and evaluate as JSON if possible
  let jsonString = contentString;
  if (jsonString.startsWith('[') && jsonString.endsWith(';')) {
    jsonString = jsonString.slice(0, -1);
  }
  
  // Use a safe evaluation approach (safer than eval)
  try {
    employeeData = JSON.parse(jsonString);
  } catch (parseError) {
    console.log('Could not parse as JSON, using sample data instead');
    // Provide sample employee data as fallback
    employeeData = [
      {
        id: "EMP001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@juniorjoy.com",
        phoneNumber: "+1-202-555-0123",
        gender: "Male",
        nationality: "American",
        dateOfBirth: "1985-05-15",
        address: "123 Main Street, New York, NY",
        department: "Engineering",
        designation: "Senior Software Engineer",
        workSite: "Headquarters",
        employeeType: "Full-time",
        joinDate: "2020-01-15",
        salary: 95000,
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        accountDetails: {
          bankName: "Chase Bank",
          accountNumber: "12345678901",
          IBAN: "US12345678901234567890"
        },
        emergencyContact: {
          name: "Jane Doe",
          relationship: "Spouse",
          phoneNumber: "+1-202-555-0124"
        }
      },
      {
        id: "EMP002",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice.smith@juniorjoy.com",
        phoneNumber: "+1-202-555-0125",
        gender: "Female",
        nationality: "Canadian",
        dateOfBirth: "1990-08-22",
        address: "456 Oak Avenue, Toronto, Canada",
        department: "Marketing",
        designation: "Marketing Manager",
        workSite: "Branch Office",
        employeeType: "Full-time",
        joinDate: "2019-03-10",
        salary: 85000,
        image: "https://randomuser.me/api/portraits/women/2.jpg",
        accountDetails: {
          bankName: "TD Bank",
          accountNumber: "23456789012",
          IBAN: "CA23456789012345678901"
        },
        emergencyContact: {
          name: "Bob Smith",
          relationship: "Spouse",
          phoneNumber: "+1-202-555-0126"
        }
      },
      {
        id: "EMP003",
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@juniorjoy.com",
        phoneNumber: "+1-202-555-0127",
        gender: "Male",
        nationality: "British",
        dateOfBirth: "1988-11-30",
        address: "789 Pine Road, London, UK",
        department: "Finance",
        designation: "Financial Analyst",
        workSite: "Headquarters",
        employeeType: "Full-time",
        joinDate: "2021-06-05",
        salary: 80000,
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        accountDetails: {
          bankName: "Barclays",
          accountNumber: "34567890123",
          IBAN: "GB34567890123456789012"
        },
        emergencyContact: {
          name: "Sarah Johnson",
          relationship: "Spouse",
          phoneNumber: "+1-202-555-0128"
        }
      },
      {
        id: "EMP004",
        firstName: "Emily",
        lastName: "Brown",
        email: "emily.brown@juniorjoy.com",
        phoneNumber: "+1-202-555-0129",
        gender: "Female",
        nationality: "Australian",
        dateOfBirth: "1992-04-18",
        address: "321 Eucalyptus Street, Sydney, Australia",
        department: "Human Resources",
        designation: "HR Specialist",
        workSite: "Branch Office",
        employeeType: "Part-time",
        joinDate: "2022-02-15",
        salary: 65000,
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        accountDetails: {
          bankName: "Commonwealth Bank",
          accountNumber: "45678901234",
          IBAN: "AU45678901234567890123"
        },
        emergencyContact: {
          name: "James Brown",
          relationship: "Brother",
          phoneNumber: "+1-202-555-0130"
        }
      },
      {
        id: "EMP005",
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@juniorjoy.com",
        phoneNumber: "+1-202-555-0131",
        gender: "Male",
        nationality: "German",
        dateOfBirth: "1980-09-25",
        address: "567 Birch Lane, Berlin, Germany",
        department: "Executive",
        designation: "CTO",
        workSite: "Headquarters",
        employeeType: "Full-time",
        joinDate: "2018-07-01",
        salary: 150000,
        image: "https://randomuser.me/api/portraits/men/5.jpg",
        accountDetails: {
          bankName: "Deutsche Bank",
          accountNumber: "56789012345",
          IBAN: "DE56789012345678901234"
        },
        emergencyContact: {
          name: "Emma Wilson",
          relationship: "Spouse",
          phoneNumber: "+1-202-555-0132"
        }
      },
      {
        id: "EMP006",
        firstName: "Sofia",
        lastName: "Martinez",
        email: "sofia.martinez@juniorjoy.com",
        phoneNumber: "+1-202-555-0133",
        gender: "Female",
        nationality: "Spanish",
        dateOfBirth: "1993-12-12",
        address: "890 Cedar Avenue, Madrid, Spain",
        department: "Sales",
        designation: "Sales Representative",
        workSite: "Branch Office",
        employeeType: "Full-time",
        joinDate: "2021-09-15",
        salary: 70000,
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        accountDetails: {
          bankName: "Santander",
          accountNumber: "67890123456",
          IBAN: "ES67890123456789012345"
        },
        emergencyContact: {
          name: "Carlos Martinez",
          relationship: "Father",
          phoneNumber: "+1-202-555-0134"
        }
      },
      {
        id: "EMP007",
        firstName: "Liam",
        lastName: "Anderson",
        email: "liam.anderson@juniorjoy.com",
        phoneNumber: "+1-202-555-0135",
        gender: "Male",
        nationality: "Swedish",
        dateOfBirth: "1987-07-07",
        address: "234 Elm Court, Stockholm, Sweden",
        department: "Engineering",
        designation: "Frontend Developer",
        workSite: "Remote",
        employeeType: "Contract",
        joinDate: "2022-04-01",
        salary: 90000,
        image: "https://randomuser.me/api/portraits/men/7.jpg",
        accountDetails: {
          bankName: "Nordea",
          accountNumber: "78901234567",
          IBAN: "SE78901234567890123456"
        },
        emergencyContact: {
          name: "Olivia Anderson",
          relationship: "Sister",
          phoneNumber: "+1-202-555-0136"
        }
      },
      {
        id: "EMP008",
        firstName: "Olivia",
        lastName: "Taylor",
        email: "olivia.taylor@juniorjoy.com",
        phoneNumber: "+1-202-555-0137",
        gender: "Female",
        nationality: "French",
        dateOfBirth: "1989-03-14",
        address: "456 Maple Drive, Paris, France",
        department: "Marketing",
        designation: "Content Strategist",
        workSite: "Headquarters",
        employeeType: "Full-time",
        joinDate: "2020-08-15",
        salary: 75000,
        image: "https://randomuser.me/api/portraits/women/8.jpg",
        accountDetails: {
          bankName: "BNP Paribas",
          accountNumber: "89012345678",
          IBAN: "FR89012345678901234567"
        },
        emergencyContact: {
          name: "Ethan Taylor",
          relationship: "Spouse",
          phoneNumber: "+1-202-555-0138"
        }
      },
      {
        id: "EMP009",
        firstName: "Noah",
        lastName: "Thomas",
        email: "noah.thomas@juniorjoy.com",
        phoneNumber: "+1-202-555-0139",
        gender: "Male",
        nationality: "Italian",
        dateOfBirth: "1991-01-23",
        address: "789 Cherry Street, Rome, Italy",
        department: "Customer Support",
        designation: "Support Lead",
        workSite: "Branch Office",
        employeeType: "Full-time",
        joinDate: "2019-11-10",
        salary: 72000,
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        accountDetails: {
          bankName: "UniCredit",
          accountNumber: "90123456789",
          IBAN: "IT90123456789012345678"
        },
        emergencyContact: {
          name: "Ava Thomas",
          relationship: "Spouse",
          phoneNumber: "+1-202-555-0140"
        }
      },
      {
        id: "EMP010",
        firstName: "Ava",
        lastName: "Garcia",
        email: "ava.garcia@juniorjoy.com",
        phoneNumber: "+1-202-555-0141",
        gender: "Female",
        nationality: "Mexican",
        dateOfBirth: "1986-06-30",
        address: "123 Saguaro Road, Mexico City, Mexico",
        department: "Operations",
        designation: "Operations Manager",
        workSite: "Headquarters",
        employeeType: "Full-time",
        joinDate: "2018-03-01",
        salary: 95000,
        image: "https://randomuser.me/api/portraits/women/10.jpg",
        accountDetails: {
          bankName: "BBVA",
          accountNumber: "01234567890",
          IBAN: "MX01234567890123456789"
        },
        emergencyContact: {
          name: "Lucas Garcia",
          relationship: "Brother",
          phoneNumber: "+1-202-555-0142"
        }
      }
    ];
  }
} catch (error) {
  console.error('Error reading employee data file:', error);
  // Provide a smaller set of sample data if file can't be read
  employeeData = [
    {
      id: "EMP001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@juniorjoy.com",
      phoneNumber: "+1-202-555-0123",
      gender: "Male",
      nationality: "American",
      department: "Engineering",
      designation: "Senior Software Engineer",
      workSite: "Headquarters",
      employeeType: "Full-time",
      joinDate: "2020-01-15",
      salary: 95000
    },
    {
      id: "EMP002",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice.smith@juniorjoy.com",
      phoneNumber: "+1-202-555-0125",
      gender: "Female",
      nationality: "Canadian",
      department: "Marketing",
      designation: "Marketing Manager",
      workSite: "Branch Office",
      employeeType: "Full-time",
      joinDate: "2019-03-10",
      salary: 85000
    }
  ];
}

module.exports = employeeData;
