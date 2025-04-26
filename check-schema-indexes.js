const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkSchemaAndIndexes() {
  let client;
  
  try {
    // Connect directly with MongoDB driver
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }
    
    // Check indexes on each collection
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`\nIndexes for ${collection.name}:`);
      console.log(JSON.stringify(indexes, null, 2));
      
      // Get a sample document to see the structure
      const sampleDoc = await db.collection(collection.name).findOne({});
      if (sampleDoc) {
        console.log(`\nSample document from ${collection.name}:`);
        console.log(JSON.stringify(sampleDoc, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error checking schema and indexes:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the script
checkSchemaAndIndexes();
