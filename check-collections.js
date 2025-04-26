const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Get all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // For each collection, get a sample document to examine structure
    console.log('\nSample document from each collection:');
    for (const collection of collections) {
      const sample = await mongoose.connection.db.collection(collection.name).findOne({});
      console.log(`\n${collection.name} sample:`, sample ? JSON.stringify(sample, null, 2).slice(0, 500) + '...' : 'No documents');
    }
    
  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkCollections();
