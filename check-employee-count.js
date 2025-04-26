const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkEmployeeCount() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Get count of employees
    const employeeCount = await db.collection('employees').countDocuments();
    console.log(`Total employees in database: ${employeeCount}`);
    
    // Get a sample of employees
    const sampleEmployees = await db.collection('employees')
      .find()
      .limit(3)
      .toArray();
    
    console.log('Sample employees:');
    console.log(JSON.stringify(sampleEmployees, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the function
checkEmployeeCount();
