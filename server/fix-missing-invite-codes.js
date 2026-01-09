// Script to fix organizations with missing invite codes
const mongoose = require('mongoose');
const Organization = require('./models/Organization');
const Profile = require('./models/Profile'); // Need to load Profile model for populate

// Generate unique invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

mongoose.connect('mongodb://127.0.0.1:27017/roster-hub-v2')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Find organizations without invite codes
      const orgsWithoutCode = await Organization.find({
        $or: [
          { inviteCode: null },
          { inviteCode: undefined },
          { inviteCode: '' }
        ]
      }).populate('owner');
      
      console.log(`\n📊 Found ${orgsWithoutCode.length} organization(s) without invite codes`);
      
      if (orgsWithoutCode.length > 0) {
        for (const org of orgsWithoutCode) {
          // Generate unique invite code
          let inviteCodeUnique = false;
          let newInviteCode;
          
          while (!inviteCodeUnique) {
            newInviteCode = generateInviteCode();
            const existing = await Organization.findOne({ inviteCode: newInviteCode });
            if (!existing) inviteCodeUnique = true;
          }
          
          org.inviteCode = newInviteCode;
          await org.save();
          
          console.log(`  ✅ Fixed: ${org.name} - New code: ${newInviteCode}`);
        }
      } else {
        console.log('✨ All organizations have valid invite codes!');
      }
      
      // List all organizations
      const allOrgs = await Organization.find({}).populate('owner');
      console.log(`\n🏢 All organizations (${allOrgs.length}):`);
      allOrgs.forEach(org => {
        console.log(`  - ${org.name}`);
        console.log(`    Code: ${org.inviteCode || 'MISSING!'}`);
        console.log(`    Owner: ${org.owner?.name || 'Unknown'}`);
        console.log(`    Members: ${org.members.length}`);
        console.log(`    Slug: ${org.slug}`);
        console.log(`    Subdomain: ${org.subdomain || 'null (OK)'}`);
        console.log('');
      });
      
      console.log('✅ All organizations verified!');
      
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  });
