const mongoose = require('mongoose');

// MongoDB connection string from the project
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Schema definitions that match the server models
const EmployeeSchema = new mongoose.Schema({
  empNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  idNumber: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  nationality: { type: String, default: 'Maldivian' },
  cityIsland: { type: String, default: 'hinnavaru' },
  dateOfBirth: { type: Date },
  mobileNumber: { type: String },
  workNo: { type: String },
  designation: { type: String },
  department: { type: String },
  workSite: { type: String },
  joinedDate: { type: Date },
  salaryUSD: { type: Number },
  salaryMVR: { type: Number },
  image: { type: String },
  active: { type: Boolean, default: true },
  email: { type: String },
  address: { type: String },
  employeeType: { type: String }
}, { timestamps: true });

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  contact: { type: String },
  email: { type: String },
  company: { type: String },
  experience: { type: Number },
  rating: { type: Number }
}, { timestamps: true });

const TrainingProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  duration: { type: Number },
  targetAudience: { type: String },
  objectives: [String],
  materialUrl: { type: String }
}, { timestamps: true });

const TrainingSessionSchema = new mongoose.Schema({
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingProgram', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String },
  maxParticipants: { type: Number },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
  participants: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['Registered', 'Attended', 'Completed', 'No-Show'], default: 'Registered' }
  }],
  feedback: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    rating: { type: Number },
    comments: { type: String },
    submittedDate: { type: Date }
  }]
}, { timestamps: true });

const LeaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  daysPerYear: { type: Number },
  isPaid: { type: Boolean, default: true },
  accrual: { type: String, enum: ['Annual', 'Monthly', 'OneTime'], default: 'Annual' },
  carryOver: { type: Boolean, default: false },
  maxCarryOver: { type: Number },
  requiresApproval: { type: Boolean, default: true },
  documents: { type: Boolean, default: false }
}, { timestamps: true });

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedDate: { type: Date },
  documents: [{ 
    name: { type: String },
    file: { type: String },
    uploadDate: { type: Date }
  }],
  comments: [{
    user: { type: String },
    text: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Define models
const Employee = mongoose.model('Employee', EmployeeSchema);
const Trainer = mongoose.model('Trainer', TrainerSchema);
const TrainingProgram = mongoose.model('TrainingProgram', TrainingProgramSchema);
const TrainingSession = mongoose.model('TrainingSession', TrainingSessionSchema);
const LeaveType = mongoose.model('LeaveType', LeaveTypeSchema);
const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

// Sample employee data that matches the schema
const employeeData = [
  {
    empNo: "EMP001",
    name: "John Doe",
    idNumber: "A1234567",
    gender: "Male",
    nationality: "American",
    cityIsland: "New York",
    dateOfBirth: new Date("1985-05-15"),
    mobileNumber: "+1-202-555-0123",
    workNo: "EXT-1001",
    designation: "Senior Software Engineer",
    department: "Engineering",
    workSite: "Headquarters",
    joinedDate: new Date("2020-01-15"),
    salaryUSD: 95000,
    salaryMVR: 1463000,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    active: true,
    email: "john.doe@juniorjoy.com",
    address: "123 Main Street, New York, NY",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP002",
    name: "Alice Smith",
    idNumber: "B2345678",
    gender: "Female",
    nationality: "Canadian",
    cityIsland: "Toronto",
    dateOfBirth: new Date("1990-08-22"),
    mobileNumber: "+1-202-555-0125",
    workNo: "EXT-1002",
    designation: "Marketing Manager",
    department: "Marketing",
    workSite: "Branch Office",
    joinedDate: new Date("2019-03-10"),
    salaryUSD: 85000,
    salaryMVR: 1308900,
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    active: true,
    email: "alice.smith@juniorjoy.com",
    address: "456 Oak Avenue, Toronto, Canada",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP003",
    name: "Michael Johnson",
    idNumber: "C3456789",
    gender: "Male",
    nationality: "British",
    cityIsland: "London",
    dateOfBirth: new Date("1988-11-30"),
    mobileNumber: "+1-202-555-0127",
    workNo: "EXT-1003",
    designation: "Financial Analyst",
    department: "Finance",
    workSite: "Headquarters",
    joinedDate: new Date("2021-06-05"),
    salaryUSD: 80000,
    salaryMVR: 1232000,
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    active: true,
    email: "michael.johnson@juniorjoy.com",
    address: "789 Pine Road, London, UK",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP004",
    name: "Emily Brown",
    idNumber: "D4567890",
    gender: "Female",
    nationality: "Australian",
    cityIsland: "Sydney",
    dateOfBirth: new Date("1992-04-18"),
    mobileNumber: "+1-202-555-0129",
    workNo: "EXT-1004",
    designation: "HR Specialist",
    department: "Human Resources",
    workSite: "Branch Office",
    joinedDate: new Date("2022-02-15"),
    salaryUSD: 65000,
    salaryMVR: 1001000,
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    active: true,
    email: "emily.brown@juniorjoy.com",
    address: "321 Eucalyptus Street, Sydney, Australia",
    employeeType: "Part-time"
  },
  {
    empNo: "EMP005",
    name: "David Wilson",
    idNumber: "E5678901",
    gender: "Male",
    nationality: "German",
    cityIsland: "Berlin",
    dateOfBirth: new Date("1980-09-25"),
    mobileNumber: "+1-202-555-0131",
    workNo: "EXT-1005",
    designation: "CTO",
    department: "Executive",
    workSite: "Headquarters",
    joinedDate: new Date("2018-07-01"),
    salaryUSD: 150000,
    salaryMVR: 2310000,
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    active: true,
    email: "david.wilson@juniorjoy.com",
    address: "567 Birch Lane, Berlin, Germany",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP006",
    name: "Sofia Martinez",
    idNumber: "F6789012",
    gender: "Female",
    nationality: "Spanish",
    cityIsland: "Madrid",
    dateOfBirth: new Date("1993-12-12"),
    mobileNumber: "+1-202-555-0133",
    workNo: "EXT-1006",
    designation: "Sales Representative",
    department: "Sales",
    workSite: "Branch Office",
    joinedDate: new Date("2021-09-15"),
    salaryUSD: 70000,
    salaryMVR: 1078000,
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    active: true,
    email: "sofia.martinez@juniorjoy.com",
    address: "890 Cedar Avenue, Madrid, Spain",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP007",
    name: "Liam Anderson",
    idNumber: "G7890123",
    gender: "Male",
    nationality: "Swedish",
    cityIsland: "Stockholm",
    dateOfBirth: new Date("1987-07-07"),
    mobileNumber: "+1-202-555-0135",
    workNo: "EXT-1007",
    designation: "Frontend Developer",
    department: "Engineering",
    workSite: "Remote",
    joinedDate: new Date("2022-04-01"),
    salaryUSD: 90000,
    salaryMVR: 1386000,
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    active: true,
    email: "liam.anderson@juniorjoy.com",
    address: "234 Elm Court, Stockholm, Sweden",
    employeeType: "Contract"
  },
  {
    empNo: "EMP008",
    name: "Olivia Taylor",
    idNumber: "H8901234",
    gender: "Female",
    nationality: "French",
    cityIsland: "Paris",
    dateOfBirth: new Date("1989-03-14"),
    mobileNumber: "+1-202-555-0137",
    workNo: "EXT-1008",
    designation: "Content Strategist",
    department: "Marketing",
    workSite: "Headquarters",
    joinedDate: new Date("2020-08-15"),
    salaryUSD: 75000,
    salaryMVR: 1155000,
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    active: true,
    email: "olivia.taylor@juniorjoy.com",
    address: "456 Maple Drive, Paris, France",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP009",
    name: "Noah Thomas",
    idNumber: "I9012345",
    gender: "Male",
    nationality: "Italian",
    cityIsland: "Rome",
    dateOfBirth: new Date("1991-01-23"),
    mobileNumber: "+1-202-555-0139",
    workNo: "EXT-1009",
    designation: "Support Lead",
    department: "Customer Support",
    workSite: "Branch Office",
    joinedDate: new Date("2019-11-10"),
    salaryUSD: 72000,
    salaryMVR: 1108800,
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    active: true,
    email: "noah.thomas@juniorjoy.com",
    address: "789 Cherry Street, Rome, Italy",
    employeeType: "Full-time"
  },
  {
    empNo: "EMP010",
    name: "Ava Garcia",
    idNumber: "J0123456",
    gender: "Female",
    nationality: "Mexican",
    cityIsland: "Mexico City",
    dateOfBirth: new Date("1986-06-30"),
    mobileNumber: "+1-202-555-0141",
    workNo: "EXT-1010",
    designation: "Operations Manager",
    department: "Operations",
    workSite: "Headquarters",
    joinedDate: new Date("2018-03-01"),
    salaryUSD: 95000,
    salaryMVR: 1463000,
    image: "https://randomuser.me/api/portraits/women/10.jpg",
    active: true,
    email: "ava.garcia@juniorjoy.com",
    address: "123 Saguaro Road, Mexico City, Mexico",
    employeeType: "Full-time"
  }
];

// Sample trainers data
const trainersData = [
  {
    name: "Sarah Johnson",
    specialization: "Leadership Development",
    contact: "+1-555-123-4567",
    email: "sarah.johnson@example.com",
    company: "Excel Training Solutions",
    experience: 8,
    rating: 4.8
  },
  {
    name: "John Martinez",
    specialization: "Technical Skills",
    contact: "+1-555-987-6543",
    email: "john.martinez@example.com",
    company: "TechTrain Inc.",
    experience: 10,
    rating: 4.9
  },
  {
    name: "Amy Chen",
    specialization: "Soft Skills",
    contact: "+1-555-234-5678",
    email: "amy.chen@example.com",
    company: "People First Training",
    experience: 7,
    rating: 4.7
  },
  {
    name: "Michael Roberts",
    specialization: "Compliance & Regulations",
    contact: "+1-555-876-5432",
    email: "michael.roberts@example.com",
    company: "Regulatory Experts LLC",
    experience: 12,
    rating: 4.6
  },
  {
    name: "Priya Sharma",
    specialization: "Cross-Cultural Communication",
    contact: "+1-555-345-6789",
    email: "priya.sharma@example.com",
    company: "Global Mindset Training",
    experience: 9,
    rating: 4.9
  }
];

// Sample training program data
const trainingProgramsData = [
  {
    name: "Leadership Essentials",
    description: "Foundational leadership skills for new and aspiring managers",
    category: "Leadership",
    duration: 16,
    targetAudience: "New Managers",
    objectives: [
      "Develop essential leadership skills",
      "Learn effective delegation techniques",
      "Master giving constructive feedback"
    ],
    materialUrl: "https://example.com/training/leadership-essentials"
  },
  {
    name: "Advanced JavaScript",
    description: "Deep dive into modern JavaScript features and frameworks",
    category: "Technical",
    duration: 24,
    targetAudience: "Developers",
    objectives: [
      "Master ES6+ features",
      "Learn React fundamentals",
      "Build complex web applications"
    ],
    materialUrl: "https://example.com/training/advanced-js"
  },
  {
    name: "Effective Communication",
    description: "Improve workplace communication and conflict resolution",
    category: "Soft Skills",
    duration: 8,
    targetAudience: "All Employees",
    objectives: [
      "Improve verbal and written communication",
      "Develop active listening skills",
      "Learn conflict resolution techniques"
    ],
    materialUrl: "https://example.com/training/effective-communication"
  },
  {
    name: "Data Privacy Compliance",
    description: "Understanding GDPR, CCPA and other data privacy regulations",
    category: "Compliance",
    duration: 12,
    targetAudience: "Data Handlers",
    objectives: [
      "Understand key data privacy regulations",
      "Learn compliance best practices",
      "Implement data protection measures"
    ],
    materialUrl: "https://example.com/training/data-privacy"
  },
  {
    name: "Project Management Fundamentals",
    description: "Core project management methodologies and practices",
    category: "Management",
    duration: 20,
    targetAudience: "Project Leads",
    objectives: [
      "Learn key project management methodologies",
      "Master project planning techniques",
      "Develop risk management strategies"
    ],
    materialUrl: "https://example.com/training/pm-fundamentals"
  }
];

// Sample leave types
const leaveTypesData = [
  {
    name: "Annual Leave",
    description: "Regular vacation leave for all employees",
    daysPerYear: 20,
    isPaid: true,
    accrual: "Annual",
    carryOver: true,
    maxCarryOver: 5,
    requiresApproval: true,
    documents: false
  },
  {
    name: "Sick Leave",
    description: "Leave for health-related reasons",
    daysPerYear: 12,
    isPaid: true,
    accrual: "Monthly",
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    name: "Maternity Leave",
    description: "Leave for childbirth and child care for mothers",
    daysPerYear: 84,
    isPaid: true,
    accrual: "OneTime",
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    name: "Paternity Leave",
    description: "Leave for child care for fathers",
    daysPerYear: 14,
    isPaid: true,
    accrual: "OneTime",
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: false
  },
  {
    name: "Bereavement Leave",
    description: "Leave for family bereavement",
    daysPerYear: 5,
    isPaid: true,
    accrual: "OneTime",
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    name: "Study Leave",
    description: "Leave for professional development and education",
    daysPerYear: 10,
    isPaid: true,
    accrual: "Annual",
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: true
  },
  {
    name: "Unpaid Leave",
    description: "Leave without pay for personal reasons",
    daysPerYear: 30,
    isPaid: false,
    accrual: "Annual",
    carryOver: false,
    maxCarryOver: 0,
    requiresApproval: true,
    documents: false
  }
];

// Connect to MongoDB and populate all collections
async function setupDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data in collections (except User)
    await Promise.all([
      Employee.deleteMany({}),
      Trainer.deleteMany({}),
      TrainingProgram.deleteMany({}),
      TrainingSession.deleteMany({}),
      LeaveType.deleteMany({}),
      LeaveRequest.deleteMany({})
    ]);
    
    console.log('Cleared existing data in collections');

    // Insert employee data first
    const insertedEmployees = await Employee.insertMany(employeeData);
    console.log(`Inserted ${insertedEmployees.length} employees`);

    // Insert trainers data
    const insertedTrainers = await Trainer.insertMany(trainersData);
    console.log(`Inserted ${insertedTrainers.length} trainers`);

    // Insert training programs data
    const insertedPrograms = await TrainingProgram.insertMany(trainingProgramsData);
    console.log(`Inserted ${insertedPrograms.length} training programs`);

    // Insert leave types data
    const insertedLeaveTypes = await LeaveType.insertMany(leaveTypesData);
    console.log(`Inserted ${insertedLeaveTypes.length} leave types`);

    // Now create training sessions with proper references
    const trainingSessions = [
      {
        programId: insertedPrograms[0]._id,
        trainerId: insertedTrainers[0]._id,
        startDate: new Date('2025-05-15T09:00:00'),
        endDate: new Date('2025-05-16T17:00:00'),
        location: 'Head Office - Conference Room A',
        maxParticipants: 15,
        status: 'Scheduled',
        participants: [
          { employeeId: insertedEmployees[0]._id, status: 'Registered' },
          { employeeId: insertedEmployees[4]._id, status: 'Registered' },
          { employeeId: insertedEmployees[7]._id, status: 'Registered' }
        ]
      },
      {
        programId: insertedPrograms[1]._id,
        trainerId: insertedTrainers[1]._id,
        startDate: new Date('2025-06-10T09:00:00'),
        endDate: new Date('2025-06-13T17:00:00'),
        location: 'Virtual - Zoom',
        maxParticipants: 20,
        status: 'Scheduled',
        participants: [
          { employeeId: insertedEmployees[1]._id, status: 'Registered' },
          { employeeId: insertedEmployees[2]._id, status: 'Registered' },
          { employeeId: insertedEmployees[3]._id, status: 'Registered' }
        ]
      },
      {
        programId: insertedPrograms[2]._id,
        trainerId: insertedTrainers[2]._id,
        startDate: new Date('2025-05-05T13:00:00'),
        endDate: new Date('2025-05-05T17:00:00'),
        location: 'Branch Office - Training Room',
        maxParticipants: 25,
        status: 'Completed',
        participants: [
          { employeeId: insertedEmployees[5]._id, status: 'Completed' },
          { employeeId: insertedEmployees[6]._id, status: 'Completed' },
          { employeeId: insertedEmployees[8]._id, status: 'No-Show' }
        ],
        feedback: [
          { 
            employeeId: insertedEmployees[5]._id, 
            rating: 4, 
            comments: 'Very helpful session', 
            submittedDate: new Date('2025-05-06T10:30:00') 
          },
          { 
            employeeId: insertedEmployees[6]._id, 
            rating: 5, 
            comments: 'Excellent training!', 
            submittedDate: new Date('2025-05-06T09:15:00') 
          }
        ]
      }
    ];
    
    const insertedSessions = await TrainingSession.insertMany(trainingSessions);
    console.log(`Inserted ${insertedSessions.length} training sessions`);

    // Create leave requests with proper references
    const leaveRequests = [
      {
        employeeId: insertedEmployees[0]._id,
        leaveTypeId: insertedLeaveTypes[0]._id,
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        days: 6,
        reason: 'Family vacation',
        status: 'Approved',
        approvedBy: insertedEmployees[4]._id,
        approvedDate: new Date('2025-05-25')
      },
      {
        employeeId: insertedEmployees[7]._id,
        leaveTypeId: insertedLeaveTypes[1]._id,
        startDate: new Date('2025-05-03'),
        endDate: new Date('2025-05-04'),
        days: 2,
        reason: 'Feeling unwell',
        status: 'Approved',
        approvedBy: insertedEmployees[4]._id,
        approvedDate: new Date('2025-05-02'),
        documents: [
          { name: 'Doctor Note', file: 'doc_note_emp008.pdf', uploadDate: new Date('2025-05-02') }
        ]
      },
      {
        employeeId: insertedEmployees[1]._id,
        leaveTypeId: insertedLeaveTypes[0]._id,
        startDate: new Date('2025-07-20'),
        endDate: new Date('2025-08-02'),
        days: 14,
        reason: 'Summer vacation',
        status: 'Pending',
        comments: [
          { user: insertedEmployees[4]._id, text: 'Please confirm if critical work handover is done', date: new Date('2025-05-15') }
        ]
      }
    ];
    
    const insertedLeaveRequests = await LeaveRequest.insertMany(leaveRequests);
    console.log(`Inserted ${insertedLeaveRequests.length} leave requests`);

    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error during database setup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the database setup
setupDatabase();
