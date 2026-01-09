require('dotenv').config();
const mongoose = require('mongoose');
const { Organization, Profile } = require('./models');

async function verifyIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Get all indexes
    const indexes = await Organization.collection.getIndexes();
    console.log('📋 Current Organization Indexes:');
    
    Object.entries(indexes).forEach(([name, spec]) => {
      const unique = spec.unique ? '(unique)' : '';
      const sparse = spec.sparse ? '(sparse)' : '';
      const keys = JSON.stringify(spec);
      console.log(`  - ${name}: ${unique} ${sparse}`.trim());
    });

    // Verify critical indexes are sparse
    const criticalIndexes = ['subdomain_1', 'inviteCode_1', 'invitations.code_1'];
    console.log('\n🔍 Verifying Critical Indexes:');
    
    let allGood = true;
    for (const indexName of criticalIndexes) {
      const index = indexes[indexName];
      if (!index) {
        console.log(`  ❌ ${indexName} - MISSING!`);
        allGood = false;
      } else if (!index.sparse) {
        console.log(`  ⚠️  ${indexName} - NOT SPARSE!`);
        allGood = false;
      } else {
        console.log(`  ✅ ${indexName} - OK (unique + sparse)`);
      }
    }

    // Check database state
    console.log('\n📊 Database State:');
    const profileCount = await Profile.countDocuments();
    const orgCount = await Organization.countDocuments();
    console.log(`  - Profiles: ${profileCount}`);
    console.log(`  - Organizations: ${orgCount}`);

    // Check for orphaned profiles
    const profiles = await Profile.find().select('email organization');
    let orphanedCount = 0;
    for (const profile of profiles) {
      if (!profile.organization) {
        orphanedCount++;
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`  ⚠️  Orphaned profiles: ${orphanedCount} (consider running cleanup)`);
    } else {
      console.log(`  ✅ No orphaned profiles`);
    }

    // List organizations
    if (orgCount > 0) {
      console.log('\n🏢 Organizations:');
      const orgs = await Organization.find()
        .select('name inviteCode subdomain owner')
        .populate('owner', 'email');
      
      for (const org of orgs) {
        const ownerEmail = org.owner?.email || 'N/A';
        console.log(`  - ${org.name}`);
        console.log(`    Code: ${org.inviteCode || 'N/A'}`);
        console.log(`    Subdomain: ${org.subdomain || 'N/A'}`);
        console.log(`    Owner: ${ownerEmail}`);
      }
    }

    if (allGood && orphanedCount === 0) {
      console.log('\n✅ ALL CHECKS PASSED! Database is healthy.\n');
    } else {
      console.log('\n⚠️  Some issues found. Review above.\n');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyIndexes();
