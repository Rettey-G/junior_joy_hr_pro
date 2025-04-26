const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Direct MongoDB client to avoid schema conflicts
async function updateCollections() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB using direct client');
    
    const db = client.db();
    
    // Check and populate trainers collection
    const trainersCollection = db.collection('trainers');
    const trainerCount = await trainersCollection.countDocuments();
    
    if (trainerCount === 0) {
      console.log('Populating trainers collection...');
      await trainersCollection.insertMany([
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
      ]);
      console.log('Successfully populated trainers collection');
    } else {
      console.log(`${trainerCount} trainers already exist in database`);
    }

    // Check and populate training programs collection
    const programsCollection = db.collection('trainingprograms');
    const programCount = await programsCollection.countDocuments();
    
    if (programCount === 0) {
      console.log('Populating training programs collection...');
      await programsCollection.insertMany([
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
      ]);
      console.log('Successfully populated training programs collection');
    } else {
      console.log(`${programCount} training programs already exist in database`);
    }
    
    // Check and populate leave types collection
    const leaveTypesCollection = db.collection('leavetypes');
    const leaveTypeCount = await leaveTypesCollection.countDocuments();
    
    if (leaveTypeCount === 0) {
      console.log('Populating leave types collection...');
      await leaveTypesCollection.insertMany([
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
      ]);
      console.log('Successfully populated leave types collection');
    } else {
      console.log(`${leaveTypeCount} leave types already exist in database`);
    }
    
    // Check if we need to add more employees
    const employeesCollection = db.collection('employees');
    const employeeCount = await employeesCollection.countDocuments();
    console.log(`Found ${employeeCount} employees in database`);
    
    if (employeeCount < 5) {
      console.log('Adding more employees to the database...');
      const additionalEmployees = [
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
        }
      ];
      
      const result = await employeesCollection.insertMany(additionalEmployees, { ordered: false });
      console.log(`Added ${result.insertedCount} more employees to the database`);
    }
    
    // Get all sample data from collections to create relationships
    const employees = await employeesCollection.find({}).toArray();
    const trainers = await trainersCollection.find({}).toArray();
    const programs = await programsCollection.find({}).toArray();
    const leaveTypes = await leaveTypesCollection.find({}).toArray();
    
    // Check and populate training sessions collection
    const sessionsCollection = db.collection('trainingsessions');
    const sessionCount = await sessionsCollection.countDocuments();
    
    if (sessionCount === 0 && trainers.length > 0 && programs.length > 0 && employees.length > 0) {
      console.log('Populating training sessions collection...');
      
      // Create training sessions with references to existing data
      const trainingSessions = [
        {
          programId: programs[0]._id,
          trainerId: trainers[0]._id,
          startDate: new Date('2025-05-15T09:00:00'),
          endDate: new Date('2025-05-16T17:00:00'),
          location: 'Head Office - Conference Room A',
          maxParticipants: 15,
          status: 'Scheduled',
          participants: [
            { employeeId: employees[0]._id, status: 'Registered' },
            { employeeId: employees[1]._id, status: 'Registered' },
            { employeeId: employees[2]._id, status: 'Registered' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          programId: programs[1]._id,
          trainerId: trainers[1]._id,
          startDate: new Date('2025-06-10T09:00:00'),
          endDate: new Date('2025-06-13T17:00:00'),
          location: 'Virtual - Zoom',
          maxParticipants: 20,
          status: 'Scheduled',
          participants: [
            { employeeId: employees[0]._id, status: 'Registered' },
            { employeeId: employees[1]._id, status: 'Registered' },
            { employeeId: employees[2]._id, status: 'Registered' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          programId: programs[2]._id,
          trainerId: trainers[2]._id,
          startDate: new Date('2025-05-05T13:00:00'),
          endDate: new Date('2025-05-05T17:00:00'),
          location: 'Branch Office - Training Room',
          maxParticipants: 25,
          status: 'Completed',
          participants: [
            { employeeId: employees[0]._id, status: 'Completed' },
            { employeeId: employees[1]._id, status: 'Completed' },
            { employeeId: employees[2]._id, status: 'No-Show' }
          ],
          feedback: [
            { 
              employeeId: employees[0]._id, 
              rating: 4, 
              comments: 'Very helpful session', 
              submittedDate: new Date('2025-05-06T10:30:00') 
            },
            { 
              employeeId: employees[1]._id, 
              rating: 5, 
              comments: 'Excellent training!', 
              submittedDate: new Date('2025-05-06T09:15:00') 
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await sessionsCollection.insertMany(trainingSessions);
      console.log('Successfully populated training sessions collection');
    } else {
      console.log(`${sessionCount} training sessions already exist in database`);
    }
    
    // Check and populate leave requests collection
    const leaveRequestsCollection = db.collection('leaverequests');
    const leaveRequestCount = await leaveRequestsCollection.countDocuments();
    
    if (leaveRequestCount === 0 && leaveTypes.length > 0 && employees.length > 0) {
      console.log('Populating leave requests collection...');
      
      // Create leave requests with references to existing data
      const leaveRequests = [
        {
          employeeId: employees[0]._id,
          leaveTypeId: leaveTypes[0]._id,
          startDate: new Date('2025-06-10'),
          endDate: new Date('2025-06-15'),
          days: 6,
          reason: 'Family vacation',
          status: 'Approved',
          approvedBy: employees[2]._id,
          approvedDate: new Date('2025-05-25'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          employeeId: employees[1]._id,
          leaveTypeId: leaveTypes[1]._id,
          startDate: new Date('2025-05-03'),
          endDate: new Date('2025-05-04'),
          days: 2,
          reason: 'Feeling unwell',
          status: 'Approved',
          approvedBy: employees[2]._id,
          approvedDate: new Date('2025-05-02'),
          documents: [
            { name: 'Doctor Note', file: 'doc_note_emp002.pdf', uploadDate: new Date('2025-05-02') }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          employeeId: employees[2]._id,
          leaveTypeId: leaveTypes[0]._id,
          startDate: new Date('2025-07-20'),
          endDate: new Date('2025-08-02'),
          days: 14,
          reason: 'Summer vacation',
          status: 'Pending',
          comments: [
            { user: employees[0].name, text: 'Please confirm if critical work handover is done', date: new Date('2025-05-15') }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await leaveRequestsCollection.insertMany(leaveRequests);
      console.log('Successfully populated leave requests collection');
    } else {
      console.log(`${leaveRequestCount} leave requests already exist in database`);
    }

    console.log('Successfully updated all database collections!');
    
  } catch (error) {
    console.error('Error during database update:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the script
updateCollections();
