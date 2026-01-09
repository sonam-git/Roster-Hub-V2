require('dotenv').config();
const mongoose = require('mongoose');
const { Organization, Profile } = require('./models');

async function checkInviteCodes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Get all organizations
    const orgs = await Organization.find().populate('owner', 'name email');
    
    console.log(`📊 Found ${orgs.length} organization(s):\n`);
    
    for (const org of orgs) {
      console.log(`🏢 ${org.name}`);
      console.log(`   ID: ${org._id}`);
      console.log(`   Invite Code: ${org.inviteCode || '❌ MISSING!'}`);
      console.log(`   Owner: ${org.owner?.name} (${org.owner?.email})`);
      console.log(`   Members: ${org.members.length}`);
      console.log('');
    }

    // Get all profiles
    const profiles = await Profile.find().select('name email currentOrganization');
    
    console.log(`👥 Found ${profiles.length} profile(s):\n`);
    
    for (const profile of profiles) {
      console.log(`👤 ${profile.name} (${profile.email})`);
      console.log(`   Current Org ID: ${profile.currentOrganization || '❌ NONE'}`);
      console.log('');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkInviteCodes();
