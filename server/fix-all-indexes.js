// Script to fix all problematic indexes in organizations collection
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/roster-hub-v2')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('organizations');
      
      console.log('\n📋 Current indexes:');
      const currentIndexes = await collection.listIndexes().toArray();
      currentIndexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''} ${index.sparse ? '(sparse)' : ''}`);
      });
      
      // List of problematic indexes to fix
      const indexesToFix = [
        {
          name: 'subdomain_1',
          key: { subdomain: 1 },
          options: { unique: true, sparse: true }
        },
        {
          name: 'invitations.code_1',
          key: { 'invitations.code': 1 },
          options: { unique: true, sparse: true }
        }
      ];
      
      console.log('\n🔧 Fixing problematic indexes...');
      
      for (const indexInfo of indexesToFix) {
        try {
          // Try to drop the old index
          await collection.dropIndex(indexInfo.name);
          console.log(`  ✅ Dropped ${indexInfo.name}`);
        } catch (error) {
          if (error.code === 27) {
            console.log(`  ℹ️  Index ${indexInfo.name} does not exist (already dropped or never created)`);
          } else {
            console.log(`  ⚠️  Error dropping ${indexInfo.name}:`, error.message);
          }
        }
        
        // Create new sparse index
        try {
          await collection.createIndex(
            indexInfo.key,
            { ...indexInfo.options, name: indexInfo.name }
          );
          console.log(`  ✅ Created new sparse index ${indexInfo.name}`);
        } catch (error) {
          console.log(`  ❌ Error creating ${indexInfo.name}:`, error.message);
        }
      }
      
      console.log('\n📋 Updated indexes:');
      const updatedIndexes = await collection.listIndexes().toArray();
      updatedIndexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''} ${index.sparse ? '(sparse)' : ''}`);
      });
      
      console.log('\n✅ All indexes fixed!');
      
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
