# Testing Guide - After Index Fix 🧪

## Quick Test Checklist

### ✅ **Critical Path: Team Creation & Signup**

#### Test 1: Create New Team (No Errors Expected)
1. Go to Signup page
2. Fill in:
   - Email: `newteam@test.com`
   - Password: `Password123!`
   - Name: `Test User`
   - Team Name: `Test Team`
3. Click "Sign Up"
4. **Expected:** ✅ Success, redirected to home
5. **Not Expected:** ❌ Duplicate key error

#### Test 2: Create Another Team (Test Multiple Null Values)
1. Logout
2. Signup again with different email: `team2@test.com`
3. **Expected:** ✅ Both teams exist with auto-generated codes
4. **Not Expected:** ❌ `E11000 duplicate key error`

#### Test 3: Join Existing Team
1. Logout
2. Go to Signup
3. Click "Join Existing Team"
4. Enter invite code: `44MXKPWE` (david's team)
5. Fill in player details
6. **Expected:** ✅ Successfully join team
7. **Not Expected:** ❌ Orphaned profile

#### Test 4: Invalid Invite Code
1. Logout
2. Try to join with code: `INVALID`
3. **Expected:** ⚠️ Error message: "Invalid invite code"
4. **Not Expected:** ❌ Profile created without organization

### ✅ **Admin Panel Tests**

#### Test 5: Owner Access
1. Login as `d@email.com` (owner of david's team)
2. Check sidebar for "Admin Panel" link
3. Click Admin Panel
4. **Expected:** ✅ See roster management interface
5. **Not Expected:** ❌ 404 or access denied

#### Test 6: Non-Owner Access
1. Login as a regular player (not owner)
2. Check sidebar
3. **Expected:** ⚠️ No "Admin Panel" link visible
4. Try to access `/admin` directly
5. **Expected:** ⚠️ Redirected or access denied

#### Test 7: Send Email Invite
1. As owner, go to Admin Panel
2. Click "Invite Players"
3. Enter email: `newplayer@test.com`
4. Click Send
5. **Expected:** ✅ Success message
6. Check terminal logs for email sent
7. **Expected:** ✅ See invite email details in logs

### ✅ **Database Health Checks**

#### Test 8: Verify Indexes
```bash
cd server && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const { Organization } = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const indexes = await Organization.collection.listIndexes().toArray();
  const critical = indexes.filter(i => 
    ['subdomain_1', 'inviteCode_1', 'invitations.code_1'].includes(i.name)
  );
  critical.forEach(idx => {
    console.log(\`\${idx.name}: unique=\${idx.unique}, sparse=\${idx.sparse}\`);
  });
  await mongoose.disconnect();
})();
"
```
**Expected Output:**
```
subdomain_1: unique=true, sparse=true
inviteCode_1: unique=true, sparse=true
invitations.code_1: unique=true, sparse=true
```

#### Test 9: Check for Orphaned Profiles
```bash
cd server && node cleanup-orphaned-profiles.js
```
**Expected Output:**
```
✨ No orphaned profiles found. Database is clean!
```

### ✅ **Load Testing (Optional)**

#### Test 10: Rapid Team Creation
```bash
# Create 5 teams in quick succession
for i in {1..5}; do
  curl -X POST http://localhost:3001/graphql \
    -H "Content-Type: application/json" \
    -d '{
      "query": "mutation { addProfile(email: \"team'$i'@test.com\", password: \"Pass123!\", name: \"Team'$i'\", teamName: \"Test Team '$i'\") { token profile { _id email } } }"
    }'
  echo ""
done
```
**Expected:** ✅ All 5 succeed without duplicate key errors

## Server Status Check

### Backend
```bash
curl http://localhost:3001/graphql -I
```
**Expected:** `HTTP/1.1 400 Bad Request` (means server is up, just no query)

### Frontend
```bash
curl http://localhost:5173 -I
```
**Expected:** `HTTP/1.1 200 OK`

## Common Issues & Solutions

### Issue: "Module not found"
**Solution:**
```bash
cd server && npm install
cd ../client && npm install
```

### Issue: MongoDB connection error
**Solution:**
```bash
# Check .env file exists
cat server/.env | grep MONGODB_URI
# Should show your MongoDB connection string
```

### Issue: Indexes not sparse
**Solution:**
```bash
cd server && node fix-all-indexes.js
# Then restart backend
```

### Issue: Orphaned profiles
**Solution:**
```bash
cd server && node cleanup-orphaned-profiles.js
```

### Issue: Backend not running
**Solution:**
```bash
cd server
pkill -f "node server.js"
node server.js
```

### Issue: Frontend not running
**Solution:**
```bash
cd client
npm run dev
```

## Expected Terminal Logs

### Successful Signup
```
[GraphQL] Mutation: addProfile
Organization created: 507f1f77bcf86cd799439011
Profile created: 507f1f77bcf86cd799439012
Token generated
```

### Successful Email Invite
```
Email sent successfully
To: newplayer@test.com
Subject: Join Test Team on Roster Hub
Invite code: 44MXKPWE
```

### Successful Join
```
[GraphQL] Mutation: addProfile
Profile created: 507f1f77bcf86cd799439013
Added to organization: 507f1f77bcf86cd799439011
```

## Test Results Log

Date: _____________

| Test | Status | Notes |
|------|--------|-------|
| Create New Team | ☐ Pass ☐ Fail | |
| Create Another Team | ☐ Pass ☐ Fail | |
| Join Existing Team | ☐ Pass ☐ Fail | |
| Invalid Invite Code | ☐ Pass ☐ Fail | |
| Owner Access Admin | ☐ Pass ☐ Fail | |
| Non-Owner No Access | ☐ Pass ☐ Fail | |
| Send Email Invite | ☐ Pass ☐ Fail | |
| Verify Indexes | ☐ Pass ☐ Fail | |
| Check Orphaned Profiles | ☐ Pass ☐ Fail | |
| Rapid Team Creation | ☐ Pass ☐ Fail | |

## Success Metrics

- **0** duplicate key errors
- **0** orphaned profiles
- **100%** team creation success rate
- **All** indexes have `sparse: true`
- **All** admin features accessible to owners
- **No** unauthorized access to admin panel

---

## Next Steps After Testing

1. ✅ If all tests pass → Deploy to production
2. ⚠️ If tests fail → Check logs and run cleanup scripts
3. 📝 Document any edge cases found
4. 🔄 Re-test after fixes

## Support

If you encounter issues:
1. Check `MONGODB_INDEX_FIX_COMPLETE.md` for solutions
2. Review `ADMIN_PANEL_DOCUMENTATION.md` for admin features
3. Check `EMAIL_INVITE_SYSTEM.md` for invite flow
4. Run verification scripts in `/server` folder

---

**Last Updated:** January 8, 2025  
**Status:** Ready for testing ✅  
**Backend:** http://localhost:3001  
**Frontend:** http://localhost:5173
