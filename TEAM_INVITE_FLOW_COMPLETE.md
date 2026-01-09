# Team Invite Flow - Complete Implementation

## Overview

The RosterHub now supports a complete team invite flow where:
1. **Team Creators** can create teams and get invite codes
2. **Players** can join teams using invite codes (even if they already have an account)
3. **Users** can be members of multiple teams

---

## Complete User Flow

### Scenario 1: Team Creator Creates New Team

```
Team Creator (new user)
    ↓
Go to /signup
    ↓
Fill: Name, Email, Password, Team Name
    ↓
Click "CREATE TEAM"
    ↓
Backend:
  - Check if email exists
  - If exists → Error: "Email already registered, please login"
  - If new → Create Profile + Organization
  - Generate unique 8-digit invite code
  - Link Profile to Organization as Owner
    ↓
Frontend:
  - Display invite code
  - Allow copy to clipboard
  - Auto-redirect to dashboard after 2s
    ↓
Team Creator is logged in as Owner
Team Creator has invite code to share
```

---

### Scenario 2: Player Joins Team (New User)

```
Player receives invite code from Team Creator
    ↓
Go to /login
    ↓
Click "Join Team" tab
    ↓
Fill: Name, Email, Password, Invite Code
    ↓
Click "JOIN TEAM"
    ↓
Backend:
  - Validate invite code
  - Check if email exists
  - If NEW email:
    → Create new Profile
    → Add Profile to Organization as Member
  - If EXISTING email:
    → Use existing Profile
    → Add Profile to Organization as Member
    → Check if already a member (prevent duplicates)
  - Check member limit
  - Link Profile to Organization
    ↓
Frontend:
  - Store JWT token
  - Redirect to dashboard
    ↓
Player is logged in as Member
Player can access team features
```

---

### Scenario 3: Existing User Joins Another Team

```
User already has account (logged out)
    ↓
Receives invite code for Team B
    ↓
Go to /login
    ↓
Click "Join Team" tab
    ↓
Fill: Name, Email (existing), Password, Invite Code
    ↓
Click "JOIN TEAM"
    ↓
Backend:
  - Validate invite code
  - Find existing Profile by email
  - Check if already member of this team
  - If not a member:
    → Add Profile to Organization
    → Update organizations array
    → Set as currentOrganization
  - If already a member:
    → Error: "Already a member of this team"
    ↓
Frontend:
  - Store JWT token
  - Redirect to dashboard
    ↓
User is now member of multiple teams
User can switch between teams
```

---

## Backend Logic Changes

### File: `/server/schemas/resolvers.js`

#### Key Improvements:

1. **Check for Existing Profile First**
```javascript
let existingProfile = await Profile.findOne({ email });
```

2. **Different Behavior Based on Invite Code**

**WITH Invite Code (Joining Team):**
```javascript
if (inviteCode) {
  // Validate code
  organization = await Organization.findOne({ inviteCode });
  
  if (existingProfile) {
    // User exists, just add to team
    profile = existingProfile;
    
    // Prevent duplicate membership
    if (alreadyMember) {
      throw new Error('Already a member of this team');
    }
  } else {
    // New user, create profile
    profile = await Profile.create({ name, email, password });
  }
  
  // Add to organization
  organization.members.push(profile._id);
  role = 'member';
}
```

**WITHOUT Invite Code (Creating Team):**
```javascript
else {
  // Must be a new user
  if (existingProfile) {
    throw new Error('Email already registered. Please login.');
  }
  
  // Create new profile and organization
  profile = await Profile.create({ name, email, password });
  organization = await Organization.create({...});
  role = 'owner';
}
```

3. **Support Multiple Organizations per Profile**
```javascript
// Check if profile already has this organization
const hasOrg = profile.organizations?.some(
  org => org.organization.toString() === organization._id.toString()
);

if (!hasOrg) {
  // Add new organization to profile
  if (!profile.organizations) {
    profile.organizations = [];
  }
  profile.organizations.push({
    organization: organization._id,
    role: role,
  });
}

// Set as current organization
if (!profile.currentOrganization || role === 'owner') {
  profile.currentOrganization = organization._id;
}
```

---

## Frontend Changes

### File: `/client/src/pages/Login.jsx`

Added error handling for:
- Duplicate membership detection
- Clear messaging for existing users

```javascript
if (err.message && err.message.includes("already a member")) {
  friendlyError.message = "You are already a member of this team. Please use 'Sign In' mode to login.";
}
```

---

## Database Schema

### Profile Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  organizations: [
    {
      organization: ObjectId (ref: Organization),
      role: String // 'owner' or 'member'
    }
  ],
  currentOrganization: ObjectId (ref: Organization)
}
```

### Organization Model
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  inviteCode: String (unique, 8 chars),
  owner: ObjectId (ref: Profile),
  members: [ObjectId] (ref: Profile),
  plan: String, // 'free', 'starter', 'pro', 'enterprise'
  usage: {
    memberCount: Number,
    gameCount: Number,
    storageUsed: Number
  }
}
```

---

## Error Handling

### Error Messages Map

| Scenario | Error | User Message |
|----------|-------|--------------|
| **Signup with existing email** | Email exists, no invite code | "This email is already registered. Please use the login page to sign in, or use a different email address." |
| **Join team with existing email** | Email exists, has invite code | ✅ Allowed - Uses existing profile |
| **Join team already member** | Already in organization | "You are already a member of this team. Please use 'Sign In' mode to login." |
| **Invalid invite code** | Code doesn't exist | "Invalid team code. Please check the code and try again." |
| **Member limit reached** | Too many members | "This team has reached its member limit. Please contact the team administrator." |

---

## Use Cases Supported

### ✅ Use Case 1: New User Creates Team
- User: alice@example.com (new)
- Action: Signup → Create team "Eagles FC"
- Result: Profile created, Organization created, invite code "ABC12345"

### ✅ Use Case 2: New User Joins Team
- User: bob@example.com (new)
- Action: Login → Join Team with "ABC12345"
- Result: Profile created, added to Eagles FC as member

### ✅ Use Case 3: Existing User Joins Another Team
- User: alice@example.com (exists)
- Action: Login → Join Team with "XYZ67890" (different team)
- Result: Existing profile used, added to new team, now member of 2 teams

### ✅ Use Case 4: Prevent Duplicate Signup
- User: alice@example.com (exists)
- Action: Signup → Create team (without invite)
- Result: Error - "Email already registered, please login"

### ✅ Use Case 5: Prevent Duplicate Join
- User: bob@example.com (already member of Eagles FC)
- Action: Login → Join Team with "ABC12345" (Eagles FC code)
- Result: Error - "Already a member of this team"

---

## Testing Checklist

### Test 1: Create Team (New User)
```
1. Go to /signup
2. Enter: John Doe, john@test.com, password123, "Hawks FC"
3. Submit
4. ✅ Team created with invite code
5. ✅ User logged in as owner
6. ✅ Dashboard shows Hawks FC
```

### Test 2: Join Team (New User)
```
1. Get invite code from Test 1 (e.g., "ABC12345")
2. Logout
3. Go to /login → "Join Team"
4. Enter: Jane Smith, jane@test.com, password123, "ABC12345"
5. Submit
6. ✅ User created and joined Hawks FC
7. ✅ User logged in as member
8. ✅ Dashboard shows Hawks FC
9. Check DB: Hawks FC has 2 members
```

### Test 3: Existing User Joins Another Team
```
1. Create Team A with alice@test.com (get invite code A)
2. Logout
3. Create Team B with bob@test.com (get invite code B)
4. Logout
5. Go to /login → "Join Team"
6. Enter: Alice, alice@test.com, password, code B
7. Submit
8. ✅ Alice joined Team B
9. ✅ Alice is now member of 2 teams
10. Check DB: alice profile has 2 organizations
```

### Test 4: Prevent Duplicate Signup
```
1. Create account: alice@test.com
2. Logout
3. Go to /signup
4. Try to create team with alice@test.com
5. ✅ Error: "Email already registered, please login"
```

### Test 5: Prevent Duplicate Join
```
1. Create Team with alice@test.com (get code)
2. Logout
3. Go to /login → "Join Team"
4. Try to join with alice@test.com and same code
5. ✅ Error: "Already a member of this team"
```

---

## Multi-Team Support

Users can now be part of multiple teams:

### Profile Structure
```javascript
{
  email: "alice@test.com",
  organizations: [
    {
      organization: "team-a-id",
      role: "owner"
    },
    {
      organization: "team-b-id",
      role: "member"
    }
  ],
  currentOrganization: "team-a-id" // Active team
}
```

### Future Enhancement: Team Switcher
Consider adding a team switcher in the dashboard:
```
[Hawks FC ▼]
  - Hawks FC (Owner)
  - Eagles FC (Member)
  - Lions FC (Member)
```

---

## Benefits

1. **Flexible Onboarding**
   - New users can join teams without prior account
   - Existing users can join additional teams

2. **No Duplicate Accounts**
   - Email uniqueness enforced
   - Clear error messages guide users

3. **Multi-Team Support**
   - Users can be in multiple teams
   - Different roles per team (owner, member)

4. **Secure Invite System**
   - 8-digit unique codes
   - Code validation before joining
   - Member limit enforcement

5. **Better UX**
   - Clear error messages
   - Guidance on what to do
   - Smooth flow for all scenarios

---

## API Examples

### Create Team (No Invite Code)
```graphql
mutation {
  addProfile(
    name: "John Doe"
    email: "john@example.com"
    password: "password123"
    organizationName: "Hawks FC"
  ) {
    token
    profile {
      _id
      name
      organizations {
        organization { _id name }
        role
      }
    }
    organization {
      _id
      name
      inviteCode
    }
  }
}
```

### Join Team (With Invite Code, New User)
```graphql
mutation {
  addProfile(
    name: "Jane Smith"
    email: "jane@example.com"
    password: "password123"
    inviteCode: "ABC12345"
  ) {
    token
    profile {
      _id
      name
      organizations {
        organization { _id name }
        role
      }
    }
  }
}
```

### Join Team (With Invite Code, Existing User)
```graphql
mutation {
  addProfile(
    name: "John Doe"
    email: "john@example.com" # Already exists
    password: "password123"
    inviteCode: "XYZ67890" # Different team
  ) {
    token
    profile {
      _id
      organizations {
        organization { _id name }
        role
      }
    }
  }
}
```

---

## Status

✅ **COMPLETE AND READY FOR TESTING**

Changes applied:
- ✅ Backend resolver updated
- ✅ Multi-team support added
- ✅ Duplicate prevention logic
- ✅ Error handling improved
- ✅ Frontend error messages updated

Ready for:
- End-to-end testing
- User acceptance testing
- Production deployment

---

## Next Steps

1. **Test all scenarios** (5 test cases above)
2. **Verify database state** after each test
3. **Check JWT tokens** contain correct organizationId
4. **Test team switching** (if implemented)
5. **Deploy to staging** for UAT
6. **Deploy to production** when approved

---

*Document created: January 7, 2026*
*Status: Complete and Ready for Testing*
