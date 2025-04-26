const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function addFuelTrainingPrograms() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Fuel-related training programs
    const fuelTrainingPrograms = [
      {
        id: uuidv4(),
        name: "Fuel Station Safety Fundamentals",
        description: "Essential safety practices for fuel station operations",
        category: "Safety",
        duration: 16,
        targetAudience: "Fuel Station Staff",
        objectives: [
          "Understand fuel hazards and risk mitigation",
          "Master emergency response procedures",
          "Learn proper handling of petroleum products",
          "Implement safety inspection protocols"
        ],
        materialUrl: "https://example.com/training/fuel-station-safety",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Fuel Quality Management",
        description: "Standards and testing procedures for ensuring fuel quality",
        category: "Technical",
        duration: 12,
        targetAudience: "Quality Control Personnel",
        objectives: [
          "Understand fuel quality standards",
          "Learn testing methods and equipment usage",
          "Implement quality assurance protocols",
          "Handle fuel contamination issues"
        ],
        materialUrl: "https://example.com/training/fuel-quality-management",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Fuel Dispenser Maintenance",
        description: "Technical training for maintenance of fuel dispensers and pumps",
        category: "Technical",
        duration: 24,
        targetAudience: "Maintenance Technicians",
        objectives: [
          "Troubleshoot common dispenser issues",
          "Perform preventive maintenance",
          "Calibrate fuel metering systems",
          "Replace dispenser components"
        ],
        materialUrl: "https://example.com/training/dispenser-maintenance",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Fuel Transportation Safety",
        description: "Safe practices for transporting petroleum products",
        category: "Safety",
        duration: 20,
        targetAudience: "Transport Staff",
        objectives: [
          "Understand hazmat regulations",
          "Learn defensive driving techniques",
          "Implement loading/unloading safety procedures",
          "Handle fuel spill emergencies"
        ],
        materialUrl: "https://example.com/training/fuel-transport-safety",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Petroleum Retail Management",
        description: "Business management for fuel retail operations",
        category: "Management",
        duration: 32,
        targetAudience: "Station Managers",
        objectives: [
          "Optimize fuel inventory management",
          "Implement pricing strategies",
          "Enhance customer service in fuel retail",
          "Conduct retail performance analysis"
        ],
        materialUrl: "https://example.com/training/petroleum-retail-management",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Additional diverse training programs
    const additionalTrainingPrograms = [
      {
        id: uuidv4(),
        name: "Environmental Compliance for Fuel Operations",
        description: "Regulatory compliance for environmental protection in fuel handling",
        category: "Compliance",
        duration: 16,
        targetAudience: "Operations Managers",
        objectives: [
          "Understand environmental regulations",
          "Implement leak detection and prevention",
          "Manage hazardous waste properly",
          "Conduct environmental site assessments"
        ],
        materialUrl: "https://example.com/training/environmental-compliance",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Customer Service Excellence",
        description: "Enhancing customer experience in retail operations",
        category: "Soft Skills",
        duration: 8,
        targetAudience: "Customer-Facing Staff",
        objectives: [
          "Deliver exceptional customer service",
          "Handle difficult customer situations",
          "Increase customer loyalty and satisfaction",
          "Upsell products and services effectively"
        ],
        materialUrl: "https://example.com/training/customer-service-excellence",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Digital Transformation in Retail",
        description: "Implementing technology solutions in modern retail operations",
        category: "Technical",
        duration: 24,
        targetAudience: "Management & IT Staff",
        objectives: [
          "Understand retail technology trends",
          "Implement digital payment systems",
          "Leverage data analytics for business decisions",
          "Enhance customer engagement through digital platforms"
        ],
        materialUrl: "https://example.com/training/digital-retail",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "First Aid and CPR Certification",
        description: "Essential life-saving skills for workplace emergencies",
        category: "Safety",
        duration: 8,
        targetAudience: "All Employees",
        objectives: [
          "Perform CPR correctly",
          "Provide first aid for common injuries",
          "Respond to medical emergencies",
          "Use AED (Automated External Defibrillator)"
        ],
        materialUrl: "https://example.com/training/first-aid-cpr",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Loss Prevention Strategies",
        description: "Preventing theft and reducing shrinkage in retail operations",
        category: "Security",
        duration: 12,
        targetAudience: "Managers & Security Personnel",
        objectives: [
          "Identify common theft methods",
          "Implement effective security procedures",
          "Reduce employee theft and fraud",
          "Use surveillance systems effectively"
        ],
        materialUrl: "https://example.com/training/loss-prevention",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Add new fuel-specific trainers
    const newTrainers = [
      {
        id: uuidv4(),
        name: "Robert Anderson",
        specialization: "Petroleum Safety",
        contact: "+1-555-789-0123",
        email: "robert.anderson@fuelexperts.com",
        company: "Fuel Safety Consultants",
        experience: 15,
        rating: 4.9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "Maria Rodriguez",
        specialization: "Fuel Quality Management",
        contact: "+1-555-456-7890",
        email: "maria.rodriguez@petrocert.com",
        company: "PetroCert Inc.",
        experience: 12,
        rating: 4.7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "James Wilson",
        specialization: "Petroleum Retail Operations",
        contact: "+1-555-321-6543",
        email: "james.wilson@retailfuel.com",
        company: "Retail Fuel Success",
        experience: 18,
        rating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Combine all new training programs
    const allNewPrograms = [...fuelTrainingPrograms, ...additionalTrainingPrograms];
    
    // Insert new training programs
    await db.collection('trainingprograms').insertMany(allNewPrograms);
    console.log(`Inserted ${allNewPrograms.length} new training programs`);
    
    // Insert new trainers
    await db.collection('trainers').insertMany(newTrainers);
    console.log(`Inserted ${newTrainers.length} new trainers`);
    
    // Create some training sessions for the new programs
    const currentDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(currentDate.getMonth() + 1);
    
    // Get some employee IDs for participants
    const employees = await db.collection('employees').find().limit(10).toArray();
    const employeeIds = employees.map(emp => emp._id);
    
    // Get program and trainer IDs
    const programs = await db.collection('trainingprograms').find().toArray();
    const trainers = await db.collection('trainers').find().toArray();
    
    // Create sample training sessions
    const trainingSessions = [
      {
        id: uuidv4(),
        programId: programs.find(p => p.name === "Fuel Station Safety Fundamentals")?._id || programs[0]._id,
        trainerId: trainers.find(t => t.name === "Robert Anderson")?._id || trainers[0]._id,
        startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15, 9, 0, 0),
        endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 16, 17, 0, 0),
        location: "Training Center - Room A",
        maxParticipants: 20,
        status: "Scheduled",
        participants: employeeIds.slice(0, 5).map(id => ({ employeeId: id, status: "Registered" })),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        programId: programs.find(p => p.name === "Petroleum Retail Management")?._id || programs[1]._id,
        trainerId: trainers.find(t => t.name === "James Wilson")?._id || trainers[2]._id,
        startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20, 9, 0, 0),
        endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 22, 17, 0, 0),
        location: "Online - Zoom",
        maxParticipants: 30,
        status: "Scheduled",
        participants: employeeIds.slice(3, 8).map(id => ({ employeeId: id, status: "Registered" })),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        programId: programs.find(p => p.name === "Customer Service Excellence")?._id || programs[2]._id,
        trainerId: trainers.find(t => t.name === "Amy Chen")?._id || trainers[1]._id,
        startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10, 13, 0, 0),
        endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10, 17, 0, 0),
        location: "Branch Office - Conference Room",
        maxParticipants: 15,
        status: "Scheduled",
        participants: employeeIds.slice(2, 7).map(id => ({ employeeId: id, status: "Registered" })),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('trainingsessions').insertMany(trainingSessions);
    console.log(`Created ${trainingSessions.length} new training sessions`);
    
    console.log('Successfully added fuel-related training programs and associated data');
    
  } catch (error) {
    console.error('Error adding fuel training programs:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the function
addFuelTrainingPrograms();
