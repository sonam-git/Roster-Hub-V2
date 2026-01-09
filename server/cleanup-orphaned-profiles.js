// Script to clean up orphaned profiles (profiles without organizations)
const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const Organization = require('./models/Organization');

mongoose.connect('mongodb://127.0.0.1:27017/roster-hub-v2')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Find all profiles
      const allProfiles = await Profile.find({});
      console.log(`\n📊 Found ${allProfiles.length} profiles in database`);
      
      let orphanedProfiles = [];
      let validProfiles = [];
      
      for (const profile of allProfiles) {
        const hasCurrentOrg = profile.currentOrganization;
        const hasOrganizations = profile.organizations && profile.organizations.length > 0;
        
        if (!hasCurrentOrg && !hasOrganizations) {
          orphanedProfiles.push(profile);
        } else {
          validProfiles.push(profile);
        }
      }
      
      console.log(`\n📋 Analysis:`);
      console.log(`  ✅ Valid profiles: ${validProfiles.length}`);
      console.log(`  ⚠️  Orphaned profiles (no organization): ${orphanedProfiles.length}`);
      
      if (orphanedProfiles.length > 0) {
        console.log(`\n🗑️  Orphaned profiles to delete:`);
        orphanedProfiles.forEach(profile => {
          console.log(`  - ${profile.name} (${profile.email}) - ID: ${profile._id}`);
        });
        
        console.log(`\n🧹 Cleaning up orphaned profiles...`);
        const result = await Profile.deleteMany({
          _id: { $in: orphanedProfiles.map(p => p._id) }
        });
        console.log(`✅ Deleted ${result.deletedCount} orphaned profile(s)`);
      } else {
        console.log(`\n✨ No orphaned profiles found. Database is clean!`);
      }
      
      // List all organizations
      const orgs = await Organization.find({}).populate('owner');
      console.log(`\n🏢 Current organizations (${orgs.length}):`);
      orgs.forEach(org => {
        console.log(`  - ${org.name} (Code: ${org.inviteCode}) - Owner: ${org.owner?.name || 'Unknown'} - Members: ${org.members.length}`);
      });
      
      console.log('\n✅ Cleanup complete!');
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
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
