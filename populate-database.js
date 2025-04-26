const { 
  Employee, 
  Trainer, 
  TrainingProgram, 
  TrainingSession, 
  LeaveType, 
  LeaveRequest, 
  mongoose, 
  MONGODB_URI 
} = require('./setup-database');
const path = require('path');

// Import the employee data from our Node.js compatible file
let allEmployees;
try {
  allEmployees = require('./employee-data.js');
  console.log(`Found ${allEmployees.length} employees in data file`);
} catch (error) {
  console.error('Error loading employee data:', error);
  process.exit(1);
}

// Sample data for trainers
const trainers = [
  {
    id: 'TR001',
    name: 'Sarah Johnson',
    specialization: 'Leadership Development',
    contact: '+1-555-123-4567',
    email: 'sarah.johnson@example.com',
    company: 'Excel Training Solutions',
    experience: 8,
    rating: 4.8
  },
  {
    id: 'TR002',
    name: 'John Martinez',
    specialization: 'Technical Skills',
    contact: '+1-555-987-6543',
    email: 'john.martinez@example.com',
    company: 'TechTrain Inc.',
    experience: 10,
    rating: 4.9
  },
  {
    id: 'TR003',
    name: 'Amy Chen',
    specialization: 'Soft Skills',
    contact: '+1-555-234-5678',
    email: 'amy.chen@example.com',
    company: 'People First Training',
    experience: 7,
    rating: 4.7
  },
  {
    id: 'TR004',
    name: 'Michael Roberts',
    specialization: 'Compliance & Regulations',
    contact: '+1-555-876-5432',
    email: 'michael.roberts@example.com',
    company: 'Regulatory Experts LLC',
    experience: 12,
    rating: 4.6
  },
  {
    id: 'TR005',
    name: 'Priya Sharma',
    specialization: 'Cross-Cultural Communication',
    contact: '+1-555-345-6789',
    email: 'priya.sharma@example.com',
    company: 'Global Mindset Training',
    experience: 9,
    rating: 4.9
  }
];

// Sample data for training programs
const trainingPrograms = [
  {
    id: 'TP001',
    name: 'Leadership Essentials',
    description: 'Foundational leadership skills for new and aspiring managers',
    category: 'Leadership',
    duration: 16,
    targetAudience: 'New Managers',
    objectives: [
      'Develop essential leadership skills',
      'Learn effective delegation techniques',
      'Master giving constructive feedback'
    ],
    materialUrl: 'https://example.com/training/leadership-essentials'
  },
  {
    id: 'TP002',
    name: 'Advanced JavaScript',
    description: 'Deep dive into modern JavaScript features and frameworks',
    category: 'Technical',
    duration: 24,
    targetAudience: 'Developers',
    objectives: [
      'Master ES6+ features',
      'Learn React fundamentals',
      'Build complex web applications'
    ],
    materialUrl: 'https://example.com/training/advanced-js'
  },
  {
    id: 'TP003',
    name: 'Effective Communication',
    description: 'Improve workplace communication and conflict resolution',
    category: 'Soft Skills',
    duration: 8,
    targetAudience: 'All Employees',
    objectives: [
      'Improve verbal and written communication',
      'Develop active listening skills',
      'Learn conflict resolution techniques'
    ],
    materialUrl: 'https://example.com/training/effective-communication'
  },
  {
    id: 'TP004',
    name: 'Data Privacy Compliance',
    description: 'Understanding GDPR, CCPA and other data privacy regulations',
    category: 'Compliance',
    duration: 12,
    targetAudience: 'Data Handlers',
    objectives: [
      'Understand key data privacy regulations',
      'Learn compliance best practices',
      'Implement data protection measures'
    ],
    materialUrl: 'https://example.com/training/data-privacy'
  },
  {
    id: 'TP005',
    name: 'Project Management Fundamentals',
    description: 'Core project management methodologies and practices',
    category: 'Management',
    duration: 20,
    targetAudience: 'Project Leads',
    objectives: [
      'Learn key project management methodologies',
      'Master project planning techniques',
      'Develop risk management strategies'
    ],
    materialUrl: 'https://example.com/training/pm-fundamentals'
  }
];

// Sample data for training sessions
const trainingSessions = [
  {
    id: 'TS001',
    programId: 'TP001',
    trainerId: 'TR001',
    startDate: new Date('2025-05-15T09:00:00'),
    endDate: new Date('2025-05-16T17:00:00'),
    location: 'Head Office - Conference Room A',
    maxParticipants: 15,
    status: 'Scheduled',
    participants: [
      { employeeId: 'EMP001', status: 'Registered' },
      { employeeId: 'EMP005', status: 'Registered' },
      { employeeId: 'EMP008', status: 'Registered' }
    ],
    feedback: []
  },
  {
    id: 'TS002',
    programId: 'TP002',
    trainerId: 'TR002',
    startDate: new Date('2025-06-10T09:00:00'),
    endDate: new Date('2025-06-13T17:00:00'),
    location: 'Virtual - Zoom',
    maxParticipants: 20,
    status: 'Scheduled',
    participants: [
      { employeeId: 'EMP012', status: 'Registered' },
      { employeeId: 'EMP015', status: 'Registered' },
      { employeeId: 'EMP022', status: 'Registered' }
    ],
    feedback: []
  },
  {
    id: 'TS003',
    programId: 'TP003',
    trainerId: 'TR003',
    startDate: new Date('2025-05-05T13:00:00'),
    endDate: new Date('2025-05-05T17:00:00'),
    location: 'Branch Office - Training Room',
    maxParticipants: 25,
    status: 'Completed',
    participants: [
      { employeeId: 'EMP002', status: 'Completed' },
      { employeeId: 'EMP007', status: 'Completed' },
      { employeeId: 'EMP011', status: 'No-Show' }
    ],
    feedback: [
      { employeeId: 'EMP002', rating: 4, comments: 'Very helpful session', submittedDate: new Date('2025-05-06T10:30:00') },
      { employeeId: 'EMP007', rating: 5, comments: 'Excellent training!', submittedDate: new Date('2025-05-06T09:15:00') }
    ]
  },
  {
    id: 'TS004',
    programId: 'TP004',
    trainerId: 'TR004',
    startDate: new Date('2025-07-01T09:00:00'),
    endDate: new Date('2025-07-02T17:00:00'),
    location: 'Head Office - Conference Room B',
    maxParticipants: 18,
    status: 'Scheduled',
    participants: [
      { employeeId: 'EMP003', status: 'Registered' },
      { employeeId: 'EMP004', status: 'Registered' },
      { employeeId: 'EMP016', status: 'Registered' }
    ],
    feedback: []
  },
  {
    id: 'TS005',
    programId: 'TP005',
    trainerId: 'TR005',
    startDate: new Date('2025-06-20T09:00:00'),
    endDate: new Date('2025-06-23T17:00:00'),
    location: 'Virtual - Teams',
    maxParticipants: 12,
    status: 'Scheduled',
    participants: [
      { employeeId: 'EMP009', status: 'Registered' },
      { employeeId: 'EMP010', status: 'Registered' }
    ],
    feedback: []
  }
];

// Sample data for leave types
const leaveTypes = [
  {
    id: 'LT001',
    name: 'Annual Leave',
    description: 'Regular vacation leave for all employees',
    daysPerYear: 20,
    isPaid: true,
    accrual: 'Annual',
    carryOver: true,
    maxCarryOver: 5,
    requiresApproval: true,
    documents: false
  },
  {
    id: 'LT002',
    name: 'Sick Leave',
    description: 'Leave for health-related reasons',
    daysPerYear: 12,
    isPaid: true,
    accrual: 'Monthly',
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    id: 'LT003',
    name: 'Maternity Leave',
    description: 'Leave for childbirth and child care for mothers',
    daysPerYear: 84,
    isPaid: true,
    accrual: 'OneTime',
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    id: 'LT004',
    name: 'Paternity Leave',
    description: 'Leave for child care for fathers',
    daysPerYear: 14,
    isPaid: true,
    accrual: 'OneTime',
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: false
  },
  {
    id: 'LT005',
    name: 'Bereavement Leave',
    description: 'Leave for family bereavement',
    daysPerYear: 5,
    isPaid: true,
    accrual: 'OneTime',
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    id: 'LT006',
    name: 'Study Leave',
    description: 'Leave for professional development and education',
    daysPerYear: 10,
    isPaid: true,
    accrual: 'Annual',
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    id: 'LT007',
    name: 'Unpaid Leave',
    description: 'Leave without pay for personal reasons',
    daysPerYear: 30,
    isPaid: false,
    accrual: 'Annual',
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: false
  }
];

// Sample data for leave requests
const leaveRequests = [
  {
    id: 'LR001',
    employeeId: 'EMP001',
    leaveTypeId: 'LT001',
    startDate: new Date('2025-06-10'),
    endDate: new Date('2025-06-15'),
    days: 6,
    reason: 'Family vacation',
    status: 'Approved',
    approvedBy: 'EMP005',
    approvedDate: new Date('2025-05-25'),
    documents: [],
    comments: []
  },
  {
    id: 'LR002',
    employeeId: 'EMP008',
    leaveTypeId: 'LT002',
    startDate: new Date('2025-05-03'),
    endDate: new Date('2025-05-04'),
    days: 2,
    reason: 'Feeling unwell',
    status: 'Approved',
    approvedBy: 'EMP005',
    approvedDate: new Date('2025-05-02'),
    documents: [
      { name: 'Doctor Note', file: 'doc_note_emp008.pdf', uploadDate: new Date('2025-05-02') }
    ],
    comments: []
  },
  {
    id: 'LR003',
    employeeId: 'EMP012',
    leaveTypeId: 'LT001',
    startDate: new Date('2025-07-20'),
    endDate: new Date('2025-08-02'),
    days: 14,
    reason: 'Summer vacation',
    status: 'Pending',
    documents: [],
    comments: [
      { user: 'EMP005', text: 'Please confirm if critical work handover is done', date: new Date('2025-05-15') }
    ]
  },
  {
    id: 'LR004',
    employeeId: 'EMP022',
    leaveTypeId: 'LT004',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-14'),
    days: 14,
    reason: 'Paternity leave for new baby',
    status: 'Approved',
    approvedBy: 'EMP005',
    approvedDate: new Date('2025-05-10'),
    documents: [
      { name: 'Birth Certificate', file: 'birth_cert_emp022.pdf', uploadDate: new Date('2025-05-10') }
    ],
    comments: []
  },
  {
    id: 'LR005',
    employeeId: 'EMP015',
    leaveTypeId: 'LT006',
    startDate: new Date('2025-09-15'),
    endDate: new Date('2025-09-19'),
    days: 5,
    reason: 'Attending JavaScript conference',
    status: 'Pending',
    documents: [
      { name: 'Conference Registration', file: 'conf_reg_emp015.pdf', uploadDate: new Date('2025-05-20') }
    ],
    comments: []
  }
];

// Function to convert frontend employee data to backend schema
const convertEmployeeFormat = (employee) => {
  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    gender: employee.gender,
    nationality: employee.nationality,
    dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined,
    address: employee.address,
    department: employee.department,
    designation: employee.designation,
    workSite: employee.workSite,
    employeeType: employee.employeeType,
    joinDate: employee.joinDate ? new Date(employee.joinDate) : undefined,
    salary: parseFloat(employee.salary),
    image: employee.image,
    accountDetails: {
      bankName: employee.accountDetails?.bankName,
      accountNumber: employee.accountDetails?.accountNumber,
      IBAN: employee.accountDetails?.IBAN
    },
    documents: employee.documents || [],
    emergencyContact: {
      name: employee.emergencyContact?.name,
      relationship: employee.emergencyContact?.relationship,
      phoneNumber: employee.emergencyContact?.phoneNumber
    }
  };
};

// Connect to MongoDB
async function populateDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    await Trainer.deleteMany({});
    await TrainingProgram.deleteMany({});
    await TrainingSession.deleteMany({});
    await LeaveType.deleteMany({});
    await LeaveRequest.deleteMany({});
    
    console.log('Cleared existing data in collections');

    // Convert and insert employee data
    const employeeData = allEmployees.map(convertEmployeeFormat);
    await Employee.insertMany(employeeData);
    console.log(`Inserted ${employeeData.length} employees`);
    
    // Insert other data
    await Trainer.insertMany(trainers);
    console.log(`Inserted ${trainers.length} trainers`);
    
    await TrainingProgram.insertMany(trainingPrograms);
    console.log(`Inserted ${trainingPrograms.length} training programs`);
    
    await TrainingSession.insertMany(trainingSessions);
    console.log(`Inserted ${trainingSessions.length} training sessions`);
    
    await LeaveType.insertMany(leaveTypes);
    console.log(`Inserted ${leaveTypes.length} leave types`);
    
    await LeaveRequest.insertMany(leaveRequests);
    console.log(`Inserted ${leaveRequests.length} leave requests`);

    console.log('Database population completed successfully');
    
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the population script
populateDatabase();
