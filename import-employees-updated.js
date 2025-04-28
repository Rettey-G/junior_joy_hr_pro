const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Function to extract employee data from JavaScript files
async function extractEmployeeData() {
  try {
    const dataDir = path.join(__dirname, 'client', 'src', 'data');
    
    // Read each employee data file directly
    const files = [
      path.join(dataDir, 'employeeData.js'),
      path.join(dataDir, 'employeeData2.js'),
      path.join(dataDir, 'employeeData3.js'),
      path.join(dataDir, 'employeeData4.js'),
      path.join(dataDir, 'employeeData5.js')
    ];
    
    let allEmployees = [];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        // Read file content
        const content = fs.readFileSync(file, 'utf8');
        
        // Extract the array data using regex
        const arrayMatch = content.match(/const\s+\w+\s*=\s*\[([\s\S]*)\];/);
        if (arrayMatch && arrayMatch[1]) {
          // Transform content into evaluable JavaScript
          const dataString = `[${arrayMatch[1]}]`;
          
          // Use Function constructor to safely evaluate the JavaScript array
          const extractedData = new Function(`return ${dataString}`)();
          
          if (Array.isArray(extractedData)) {
            console.log(`Extracted ${extractedData.length} employees from ${path.basename(file)}`);
            allEmployees = [...allEmployees, ...extractedData];
          }
        }
      }
    }
    
    return allEmployees;
  } catch (error) {
    console.error('Error extracting employee data:', error);
    return [];
  }
}

async function importEmployees() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('jjoyHR');
    
    // Extract employee data from files
    const employeeData = await extractEmployeeData();
    
    if (!employeeData || employeeData.length === 0) {
      console.error('No employee data found or could not extract from files');
      return;
    }
    
    console.log(`Total employees extracted: ${employeeData.length}`);
    
    // Delete existing employees to avoid duplicates
    const deleteResult = await db.collection('employees').deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing employees`);
    
    // Transform the data to match MongoDB schema
    const processedEmployees = employeeData.map(emp => ({
      id: uuidv4(), // Generate a unique ID for each employee
      employeeId: emp.empNo, // Ensure employeeId is unique and set from empNo
      empNo: emp.empNo,
      name: emp.name,
      idNumber: emp.idNumber || emp.id || '',
      gender: emp.gender,
      nationality: emp.nationality,
      cityIsland: emp.cityIsland || '',
      dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth) : null,
      mobileNumber: emp.mobileNumber || emp.mobile || '',
      workNo: emp.workNo || '',
      designation: emp.designation,
      department: emp.department,
      workSite: emp.workSite,
      joinedDate: emp.joinedDate ? new Date(emp.joinedDate) : null,
      salaryUSD: parseFloat(emp.salaryUSD) || 0,
      salaryMVR: parseFloat(emp.salaryMVR) || 0,
      accountUSD: emp.accountUSD || '',
      accountMVR: emp.accountMVR || '',
      image: emp.image || '',
      active: true,
      email: emp.email || `${emp.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '.')}@juniorjoy.com`,
      address: emp.address || '',
      employeeType: emp.employeeType || 'Full-time',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert the employees in batches to avoid exceeding MongoDB limits
    const BATCH_SIZE = 100;
    let inserted = 0;
    
    for (let i = 0; i < processedEmployees.length; i += BATCH_SIZE) {
      const batch = processedEmployees.slice(i, i + BATCH_SIZE);
      await db.collection('employees').insertMany(batch);
      inserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}, total: ${inserted} employees`);
    }
    
    console.log(`Successfully imported ${inserted} employees into the database`);
    
    // Verify the count
    const count = await db.collection('employees').countDocuments();
    console.log(`Total employees in database after import: ${count}`);
    
  } catch (error) {
    console.error('Error importing employees:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Execute the import function
importEmployees();
