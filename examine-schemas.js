const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function examineSchemas() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Examine all collections schema
    const collections = ['employees', 'trainers', 'trainingprograms', 'trainingsessions', 'leavetypes', 'leaverequests'];
    
    for (const collectionName of collections) {
      console.log(`\nExamining collection: ${collectionName}`);
      
      // Get one sample document
      const collection = db.collection(collectionName);
      const sample = await collection.findOne({});
      
      if (sample) {
        console.log(`Sample document structure: ${JSON.stringify(sample, null, 2)}`);
        
        // Get all indexes for this collection
        const indexes = await collection.indexes();
        console.log(`Indexes for ${collectionName}:`, JSON.stringify(indexes, null, 2));
      } else {
        console.log(`No documents found in ${collectionName}`);
      }
    }
    
  } catch (error) {
    console.error('Error examining schemas:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the script
examineSchemas();
