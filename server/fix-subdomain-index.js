// Script to fix the subdomain index issue
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/roster-hub-v2')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Get the organizations collection
      const db = mongoose.connection.db;
      const collection = db.collection('organizations');
      
      // Try to drop the old subdomain index
      try {
        await collection.dropIndex('subdomain_1');
        console.log('✅ Dropped old subdomain_1 index');
      } catch (error) {
        if (error.code === 27) {
          console.log('ℹ️  Index subdomain_1 does not exist (already dropped or never created)');
        } else {
          console.log('⚠️  Error dropping index:', error.message);
        }
      }
      
      // Create the new sparse index
      await collection.createIndex(
        { subdomain: 1 }, 
        { unique: true, sparse: true, name: 'subdomain_1' }
      );
      console.log('✅ Created new sparse subdomain_1 index');
      
      // List all indexes to verify
      const indexes = await collection.listIndexes().toArray();
      console.log('\n📋 Current indexes on organizations collection:');
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''} ${index.sparse ? '(sparse)' : ''}`);
      });
      
      console.log('\n✅ Index migration complete!');
      
    } catch (error) {
      console.error('❌ Error during migration:', error);
    } finally {
      await mongoose.connection.close();
      console.log('\n🔌 Disconnected from MongoDB');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  });
