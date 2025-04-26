const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function populateDatabase() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data from collections
    await Promise.all([
      db.collection('trainers').deleteMany({}),
      db.collection('trainingprograms').deleteMany({}),
      db.collection('leavetypes').deleteMany({}),
      db.collection('trainingsessions').deleteMany({}),
      db.collection('leaverequests').deleteMany({})
    ]);
    console.log('Cleared existing data from collections');
    
    // Populate trainers collection
    const trainersData = [
      {
        id: uuidv4(), // Generate unique ID
        name: "Sarah Johnson",
        specialization: "Leadership Development",
        contact: "+1-555-123-4567",
        email: "sarah.johnson@example.com",
        company: "Excel Training Solutions",
        experience: 8,
        rating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "John Martinez",
        specialization: "Technical Skills",
        contact: "+1-555-987-6543",
        email: "john.martinez@example.com",
        company: "TechTrain Inc.",
        experience: 10,
        rating: 4.9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Amy Chen",
        specialization: "Soft Skills",
        contact: "+1-555-234-5678",
        email: "amy.chen@example.com",
        company: "People First Training",
        experience: 7,
        rating: 4.7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Michael Roberts",
        specialization: "Compliance & Regulations",
        contact: "+1-555-876-5432",
        email: "michael.roberts@example.com",
        company: "Regulatory Experts LLC",
        experience: 12,
        rating: 4.6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Priya Sharma",
        specialization: "Cross-Cultural Communication",
        contact: "+1-555-345-6789",
        email: "priya.sharma@example.com",
        company: "Global Mindset Training",
        experience: 9,
        rating: 4.9,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('trainers').insertMany(trainersData);
    console.log(`Inserted ${trainersData.length} trainers`);
    
    // Populate training programs collection
    const programsData = [
      {
        id: uuidv4(),
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
        materialUrl: "https://example.com/training/leadership-essentials",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
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
        materialUrl: "https://example.com/training/advanced-js",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
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
        materialUrl: "https://example.com/training/effective-communication",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
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
        materialUrl: "https://example.com/training/data-privacy",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
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
        materialUrl: "https://example.com/training/pm-fundamentals",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('trainingprograms').insertMany(programsData);
    console.log(`Inserted ${programsData.length} training programs`);
    
    // Populate leave types collection
    const leaveTypesData = [
      {
        id: uuidv4(),
        name: "Annual Leave",
        description: "Regular vacation leave for all employees",
        daysPerYear: 20,
        isPaid: true,
        accrual: "Annual",
        carryOver: true,
        maxCarryOver: 5,
        requiresApproval: true,
        documents: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Sick Leave",
        description: "Leave for health-related reasons",
        daysPerYear: 12,
        isPaid: true,
        accrual: "Monthly",
        carryOver: false,
        maxCarryOver: 0,
        requiresApproval: true,
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Maternity Leave",
        description: "Leave for childbirth and child care for mothers",
        daysPerYear: 84,
        isPaid: true,
        accrual: "OneTime",
        carryOver: false,
        maxCarryOver: 0,
        requiresApproval: true,
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Paternity Leave",
        description: "Leave for child care for fathers",
        daysPerYear: 14,
        isPaid: true,
        accrual: "OneTime",
        carryOver: false,
        maxCarryOver: 0,
        requiresApproval: true,
        documents: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Bereavement Leave",
        description: "Leave for family bereavement",
        daysPerYear: 5,
        isPaid: true,
        accrual: "OneTime",
        carryOver: false,
        maxCarryOver: 0,
        requiresApproval: true,
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Study Leave",
        description: "Leave for professional development and education",
        daysPerYear: 10,
        isPaid: true,
        accrual: "Annual",
        carryOver: false,
        maxCarryOver: 0,
        requiresApproval: true,
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Unpaid Leave",
        description: "Leave without pay for personal reasons",
        daysPerYear: 30,
        isPaid: false,
        accrual: "Annual",
        carryOver: false,
        maxCarryOver: 0,
        requiresApproval: true,
        documents: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('leavetypes').insertMany(leaveTypesData);
    console.log(`Inserted ${leaveTypesData.length} leave types`);
    
    // Check if we need to add employees
    const employees = await db.collection('employees').find({}).toArray();
    console.log(`Found ${employees.length} existing employees`);
    
    // Add more employees if needed (with the required id field)
    if (employees.length < 5) {
      const employeesToAdd = [
        {
          id: uuidv4(),
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
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
          employeeType: "Part-time",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Insert employees individually to handle potential duplicates
      let addedCount = 0;
      for (const emp of employeesToAdd) {
        try {
          // Check if employee with this empNo already exists
          const exists = await db.collection('employees').findOne({ empNo: emp.empNo });
          
          if (!exists) {
            await db.collection('employees').insertOne(emp);
            addedCount++;
          }
        } catch (err) {
          console.warn(`Skipping employee ${emp.empNo}: ${err.message}`);
        }
      }
      
      console.log(`Added ${addedCount} new employees`);
    }
    
    // Get all documents from collections to create relationships
    const allEmployees = await db.collection('employees').find({}).toArray();
    const allTrainers = await db.collection('trainers').find({}).toArray();
    const allPrograms = await db.collection('trainingprograms').find({}).toArray();
    const allLeaveTypes = await db.collection('leavetypes').find({}).toArray();
    
    // Populate training sessions collection
    if (allEmployees.length > 0 && allTrainers.length > 0 && allPrograms.length > 0) {
      const trainingSessions = [
        {
          id: uuidv4(),
          programId: allPrograms[0]._id,
          trainerId: allTrainers[0]._id,
          startDate: new Date('2025-05-15T09:00:00'),
          endDate: new Date('2025-05-16T17:00:00'),
          location: 'Head Office - Conference Room A',
          maxParticipants: 15,
          status: 'Scheduled',
          participants: [
            { employeeId: allEmployees[0]._id, status: 'Registered' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          programId: allPrograms[1]._id,
          trainerId: allTrainers[1]._id,
          startDate: new Date('2025-06-10T09:00:00'),
          endDate: new Date('2025-06-13T17:00:00'),
          location: 'Virtual - Zoom',
          maxParticipants: 20,
          status: 'Scheduled',
          participants: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          programId: allPrograms[2]._id,
          trainerId: allTrainers[2]._id,
          startDate: new Date('2025-05-05T13:00:00'),
          endDate: new Date('2025-05-05T17:00:00'),
          location: 'Branch Office - Training Room',
          maxParticipants: 25,
          status: 'Completed',
          participants: [],
          feedback: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Add participants if we have multiple employees
      if (allEmployees.length > 1) {
        trainingSessions[0].participants.push({ employeeId: allEmployees[1]._id, status: 'Registered' });
        trainingSessions[1].participants.push({ employeeId: allEmployees[0]._id, status: 'Registered' });
        
        if (allEmployees.length > 2) {
          trainingSessions[2].participants = [
            { employeeId: allEmployees[2]._id, status: 'Completed' }
          ];
          
          trainingSessions[2].feedback = [
            { 
              employeeId: allEmployees[2]._id, 
              rating: 4, 
              comments: 'Very helpful session', 
              submittedDate: new Date('2025-05-06T10:30:00') 
            }
          ];
        }
      }
      
      await db.collection('trainingsessions').insertMany(trainingSessions);
      console.log(`Inserted ${trainingSessions.length} training sessions`);
    } else {
      console.log('Not enough reference data to create training sessions');
    }
    
    // Populate leave requests collection
    if (allEmployees.length > 0 && allLeaveTypes.length > 0) {
      const leaveRequests = [
        {
          id: uuidv4(),
          employeeId: allEmployees[0]._id,
          leaveTypeId: allLeaveTypes[0]._id,
          startDate: new Date('2025-06-10'),
          endDate: new Date('2025-06-15'),
          days: 6,
          reason: 'Family vacation',
          status: 'Approved',
          approvedBy: allEmployees.length > 1 ? allEmployees[1]._id : null,
          approvedDate: new Date('2025-05-25'),
          documents: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Add more leave requests if we have multiple employees
      if (allEmployees.length > 1 && allLeaveTypes.length > 1) {
        leaveRequests.push({
          id: uuidv4(),
          employeeId: allEmployees[1]._id,
          leaveTypeId: allLeaveTypes[1]._id,
          startDate: new Date('2025-05-03'),
          endDate: new Date('2025-05-04'),
          days: 2,
          reason: 'Feeling unwell',
          status: 'Approved',
          approvedBy: allEmployees[0]._id,
          approvedDate: new Date('2025-05-02'),
          documents: [
            { name: 'Doctor Note', file: 'doc_note.pdf', uploadDate: new Date('2025-05-02') }
          ],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      if (allEmployees.length > 2 && allLeaveTypes.length > 2) {
        leaveRequests.push({
          id: uuidv4(),
          employeeId: allEmployees[2]._id,
          leaveTypeId: allLeaveTypes[2]._id,
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-07-14'),
          days: 14,
          reason: 'Maternity Leave',
          status: 'Pending',
          documents: [],
          comments: [
            { 
              user: allEmployees[0].name, 
              text: 'Please submit required documentation', 
              date: new Date('2025-05-10') 
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await db.collection('leaverequests').insertMany(leaveRequests);
      console.log(`Inserted ${leaveRequests.length} leave requests`);
    } else {
      console.log('Not enough reference data to create leave requests');
    }
    
    console.log('Successfully populated all database collections!');
    
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the script
populateDatabase();
