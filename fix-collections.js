const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixCollections() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Start with trainers collection
    const trainersCollection = db.collection('trainers');
    await trainersCollection.deleteMany({}); // Clear existing data
    console.log('Cleared trainers collection');
    
    // Insert trainers with proper format
    const trainersData = [
      {
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
    
    const trainerResult = await trainersCollection.insertMany(trainersData);
    console.log(`Inserted ${trainerResult.insertedCount} trainers`);
    
    // Training programs collection
    const programsCollection = db.collection('trainingprograms');
    await programsCollection.deleteMany({}); // Clear existing data
    console.log('Cleared training programs collection');
    
    // Insert training programs with proper format
    const programsData = [
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
        materialUrl: "https://example.com/training/leadership-essentials",
        createdAt: new Date(),
        updatedAt: new Date()
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
        materialUrl: "https://example.com/training/advanced-js",
        createdAt: new Date(),
        updatedAt: new Date()
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
        materialUrl: "https://example.com/training/effective-communication",
        createdAt: new Date(),
        updatedAt: new Date()
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
        materialUrl: "https://example.com/training/data-privacy",
        createdAt: new Date(),
        updatedAt: new Date()
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
        materialUrl: "https://example.com/training/pm-fundamentals",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const programResult = await programsCollection.insertMany(programsData);
    console.log(`Inserted ${programResult.insertedCount} training programs`);
    
    // Leave types collection
    const leaveTypesCollection = db.collection('leavetypes');
    await leaveTypesCollection.deleteMany({}); // Clear existing data
    console.log('Cleared leave types collection');
    
    // Insert leave types with proper format
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
        documents: false,
        createdAt: new Date(),
        updatedAt: new Date()
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
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        documents: false,
        createdAt: new Date(),
        updatedAt: new Date()
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
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        documents: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        documents: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const leaveTypeResult = await leaveTypesCollection.insertMany(leaveTypesData);
    console.log(`Inserted ${leaveTypeResult.insertedCount} leave types`);
    
    // Add more employees if needed
    const employeesCollection = db.collection('employees');
    const existingEmployees = await employeesCollection.find({}).toArray();
    
    if (existingEmployees.length < 10) {
      console.log('Adding more employees...');
      
      // Add additional employees in the correct format
      const employeesToAdd = [
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
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
          employeeType: "Part-time",
          createdAt: new Date(),
          updatedAt: new Date()
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
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
          employeeType: "Full-time",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Insert each employee individually to handle potential duplicates
      let addedCount = 0;
      for (const emp of employeesToAdd) {
        try {
          // Check if employee with this empNo already exists
          const exists = await employeesCollection.findOne({ empNo: emp.empNo });
          
          if (!exists) {
            await employeesCollection.insertOne(emp);
            addedCount++;
          }
        } catch (err) {
          console.warn(`Skipping employee ${emp.empNo}: ${err.message}`);
        }
      }
      
      console.log(`Added ${addedCount} new employees`);
    }
    
    // Now get all inserted data to create relationships for training sessions and leave requests
    const allEmployees = await employeesCollection.find({}).toArray();
    const allTrainers = await trainersCollection.find({}).toArray();
    const allPrograms = await programsCollection.find({}).toArray();
    const allLeaveTypes = await leaveTypesCollection.find({}).toArray();
    
    console.log(`Found ${allEmployees.length} employees, ${allTrainers.length} trainers, ${allPrograms.length} programs, and ${allLeaveTypes.length} leave types`);
    
    // Training sessions collection
    const sessionsCollection = db.collection('trainingsessions');
    await sessionsCollection.deleteMany({}); // Clear existing data
    console.log('Cleared training sessions collection');
    
    if (allEmployees.length > 0 && allTrainers.length > 0 && allPrograms.length > 0) {
      // Create training sessions with proper format and references
      const sessionsData = [
        {
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
          programId: allPrograms[1]._id,
          trainerId: allTrainers[1]._id,
          startDate: new Date('2025-06-10T09:00:00'),
          endDate: new Date('2025-06-13T17:00:00'),
          location: 'Virtual - Zoom',
          maxParticipants: 20,
          status: 'Scheduled',
          participants: [
            { employeeId: allEmployees[0]._id, status: 'Registered' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
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
        sessionsData[0].participants.push({ employeeId: allEmployees[1]._id, status: 'Registered' });
        
        if (allEmployees.length > 2) {
          sessionsData[1].participants.push({ employeeId: allEmployees[2]._id, status: 'Registered' });
          
          if (allEmployees.length > 3) {
            sessionsData[2].participants = [
              { employeeId: allEmployees[3]._id, status: 'Completed' }
            ];
            
            sessionsData[2].feedback = [
              { 
                employeeId: allEmployees[3]._id, 
                rating: 4, 
                comments: 'Very helpful session', 
                submittedDate: new Date('2025-05-06T10:30:00') 
              }
            ];
          }
        }
      }
      
      const sessionResult = await sessionsCollection.insertMany(sessionsData);
      console.log(`Inserted ${sessionResult.insertedCount} training sessions`);
    } else {
      console.log('Not enough reference data to create training sessions');
    }
    
    // Leave requests collection
    const leaveRequestsCollection = db.collection('leaverequests');
    await leaveRequestsCollection.deleteMany({}); // Clear existing data
    console.log('Cleared leave requests collection');
    
    if (allEmployees.length > 0 && allLeaveTypes.length > 0) {
      // Create leave requests with proper format and references
      const leaveRequestsData = [
        {
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
      if (allEmployees.length > 1) {
        leaveRequestsData.push({
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
        
        if (allEmployees.length > 2 && allLeaveTypes.length > 2) {
          leaveRequestsData.push({
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
      }
      
      const leaveResult = await leaveRequestsCollection.insertMany(leaveRequestsData);
      console.log(`Inserted ${leaveResult.insertedCount} leave requests`);
    } else {
      console.log('Not enough reference data to create leave requests');
    }
    
    console.log('Successfully fixed all database collections!');
    
  } catch (error) {
    console.error('Error fixing collections:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the script
fixCollections();
