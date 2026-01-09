# RosterHub Onboarding Flow - Final Implementation

## Overview
The onboarding flow has been completely transformed to provide a clear, intuitive experience for both team creators and players joining teams.

## Flow Architecture

### 1. **Signup Page** - Team Creation Only
**URL:** `/signup`
**Purpose:** Exclusively for creating a new team/organization

**Fields:**
- Name (required) - Team creator's name
- Email (required) - Team creator's email
- Password (required, min 6 chars) - Account password
- Team Name (optional) - If blank, defaults to "{Name}'s Team"

**Process:**
1. User fills out the form
2. Backend mutation `ADD_PROFILE` is called with:
   - `name`, `email`, `password`
   - `organizationName` (if provided)
3. Backend creates:
   - New Profile for the user
   - New Organization with auto-generated 8-digit invite code
   - Links user as owner of the organization
4. Success message displays with the invite code
5. User can copy the invite code to share with team members
6. Auto-redirect after 2 seconds with JWT token

**Backend Mutation:**
```graphql
mutation addProfile(
  $name: String!, 
  $email: String!, 
  $password: String!, 
  $organizationName: String
) {
  addProfile(
    name: $name, 
    email: $email, 
    password: $password, 
    organizationName: $organizationName
  ) {
    token
    profile { _id, name }
    organization { _id, name, inviteCode }
  }
}
```

---

### 2. **Login Page** - Dual Purpose
**URL:** `/login`
**Purpose:** Both existing user login AND new player team join

#### Mode A: Sign In (Default)
For existing users who already have accounts.

**Fields:**
- Email (required)
- Password (required)

**Process:**
1. User enters email and password
2. Backend mutation `LOGIN_USER` is called
3. Returns JWT token with user and organization info
4. User is logged in and redirected to dashboard

**Backend Mutation:**
```graphql
mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    profile { _id, name }
  }
}
```

#### Mode B: Join Team
For new players joining an existing team via invite code.

**Fields:**
- Name (required) - Player's name
- Email (required) - Player's email
- Password (required, min 6 chars) - New account password
- Team Invite Code (required, 8 digits) - Code from team admin

**Process:**
1. User switches to "Join Team" mode
2. User fills out all fields including the invite code
3. Backend mutation `ADD_PROFILE` is called with:
   - `name`, `email`, `password`
   - `inviteCode` (uppercase, validated)
4. Backend:
   - Validates invite code
   - Checks member limit for organization's plan
   - Creates new Profile for the player
   - Adds player to existing Organization as a member
   - Sets currentOrganization reference
5. Returns JWT token and user is logged in
6. Player is redirected to team dashboard

**Backend Mutation:**
```graphql
mutation addProfile(
  $name: String!, 
  $email: String!, 
  $password: String!, 
  $inviteCode: String
) {
  addProfile(
    name: $name, 
    email: $email, 
    password: $password, 
    inviteCode: $inviteCode
  ) {
    token
    profile { _id, name }
    organization { _id, name, inviteCode }
  }
}
```

---

## User Journeys

### Journey 1: Team Creator
1. Navigate to `/signup`
2. Fill in name, email, password, optional team name
3. Click "CREATE TEAM"
4. See success message with invite code
5. Copy invite code to share with players
6. Auto-redirect to dashboard as team owner

### Journey 2: Player Joining Team
1. Navigate to `/login`
2. Click "Join Team" tab
3. Fill in name, email, password, and team code (received from admin)
4. Click "JOIN TEAM"
5. Backend validates code and adds player to team
6. Redirect to team dashboard as team member

### Journey 3: Existing User Login
1. Navigate to `/login`
2. Ensure "Sign In" tab is selected (default)
3. Enter email and password
4. Click "SIGN IN"
5. Redirect to dashboard

---

## Backend Logic

### `addProfile` Resolver (server/schemas/resolvers.js)
This resolver handles both team creation AND team joining based on parameters:

```javascript
addProfile: async (parent, { name, email, password, organizationName, inviteCode }) => {
  // Create user profile
  const profile = await Profile.create({ name, email, password });
  
  let organization;
  let role = 'owner';

  if (inviteCode) {
    // JOIN EXISTING TEAM
    organization = await Organization.findOne({ inviteCode });
    if (!organization) {
      throw new AuthenticationError('Invalid invitation code');
    }
    
    // Check member limit
    const planLimits = { free: 10, starter: 50, pro: 200, enterprise: Infinity };
    const memberLimit = planLimits[organization.plan] || 10;
    if (organization.members.length >= memberLimit) {
      throw new AuthenticationError(`Organization has reached member limit`);
    }
    
    // Add user as member
    organization.members.push(profile._id);
    organization.usage.memberCount = organization.members.length;
    await organization.save();
    role = 'member';
    
  } else {
    // CREATE NEW TEAM
    const orgName = organizationName || `${name}'s Team`;
    
    // Generate unique 8-digit invite code
    let newInviteCode;
    let inviteCodeUnique = false;
    while (!inviteCodeUnique) {
      newInviteCode = generateInviteCode(); // Random 8-char alphanumeric
      const existing = await Organization.findOne({ inviteCode: newInviteCode });
      if (!existing) inviteCodeUnique = true;
    }
    
    // Create organization
    organization = await Organization.create({
      name: orgName,
      slug: `${slugBase}-${Date.now()}`,
      owner: profile._id,
      members: [profile._id],
      inviteCode: newInviteCode,
      usage: { memberCount: 1, gameCount: 0, storageUsed: 0 },
    });
  }

  // Update profile with organization
  profile.organizations = [{ organization: organization._id, role: role }];
  profile.currentOrganization = organization._id;
  await profile.save();

  // Generate JWT
  const token = signToken({
    email: profile.email,
    name: profile.name,
    _id: profile._id,
    organizationId: organization._id,
  });

  return { token, profile, organization };
}
```

---

## UI/UX Features

### Signup Page
- ✅ Clear "CREATE YOUR TEAM" heading
- ✅ Clean 4-field form (name, email, password, team name)
- ✅ Success message with shareable invite code
- ✅ Copy-to-clipboard functionality for invite code
- ✅ Auto-redirect after 2 seconds
- ✅ Link to login page for existing users
- ✅ Beautiful gradient design with animations
- ✅ Error handling with auto-dismiss

### Login Page
- ✅ Mode toggle: "Sign In" vs "Join Team"
- ✅ Dynamic form fields based on mode
- ✅ Clear instructions for each mode
- ✅ Team code validation (uppercase, max 12 chars)
- ✅ Different button colors per mode (green for login, blue for join)
- ✅ Google login option (login mode only)
- ✅ Link to signup page ("Create New Team")
- ✅ Forgot password link (login mode only)
- ✅ Error handling with auto-dismiss
- ✅ Form state clears when switching modes

---

## Security & Validation

### Frontend Validation
- Email format validation (HTML5)
- Password minimum length (6 characters for new accounts)
- Required field validation
- Invite code format (uppercase, 8-12 chars)
- Form disabling during submission

### Backend Validation
- Email uniqueness check
- Invite code existence and validity
- Member limit enforcement by plan tier
- Password hashing (bcrypt)
- JWT token generation and validation

---

## Error Handling

### Common Errors
1. **Invalid invite code** - "Invalid invitation code"
2. **Member limit reached** - "Organization has reached its member limit (X members)"
3. **Duplicate email** - MongoDB unique constraint error
4. **Weak password** - Frontend validation (min 6 chars)
5. **Invalid credentials** - "No profile with this email and password found!"

### Error Display
- Red alert banner with icon
- Auto-dismiss after 3 seconds
- Pulse animation for visibility
- Clear error messages

---

## Testing Checklist

### Team Creation Flow
- [ ] Create team with custom name
- [ ] Create team without custom name (uses default)
- [ ] Verify invite code is generated
- [ ] Copy invite code to clipboard
- [ ] Verify auto-redirect after 2 seconds
- [ ] Check token is stored in localStorage
- [ ] Verify user role is 'owner'
- [ ] Check organization appears in database

### Team Join Flow
- [ ] Switch to "Join Team" mode
- [ ] Enter valid invite code
- [ ] Complete all required fields
- [ ] Submit and verify success
- [ ] Check user added as 'member'
- [ ] Verify member count incremented
- [ ] Test with invalid invite code (should error)
- [ ] Test member limit enforcement

### Existing User Login
- [ ] Enter valid credentials
- [ ] Verify successful login
- [ ] Check token stored
- [ ] Test with invalid credentials (should error)
- [ ] Test Google login option
- [ ] Verify forgot password link works

### UI/UX Testing
- [ ] Mode toggle switches correctly
- [ ] Form fields clear when switching modes
- [ ] Errors display and auto-dismiss
- [ ] Responsive design on mobile
- [ ] Dark mode works correctly
- [ ] Animations and transitions smooth
- [ ] Loading states show during submission

---

## Files Modified

### Frontend
1. **client/src/pages/Signup.jsx**
   - Removed mode toggle logic
   - Simplified to team creation only
   - Updated form fields (teamName instead of organizationName)
   - Improved success message display

2. **client/src/pages/Login.jsx**
   - Added mode toggle (login vs join)
   - Added conditional form fields
   - Implemented team join logic via ADD_PROFILE mutation
   - Updated button styles and labels per mode
   - Added invite code field with validation

3. **client/src/utils/mutations.jsx**
   - ADD_PROFILE mutation (already exists, supports both flows)
   - LOGIN_USER mutation (already exists)
   - LOGIN_WITH_GOOGLE mutation (already exists)

### Backend
1. **server/schemas/resolvers.js**
   - addProfile resolver (already implements both create and join logic)
   - login resolver (already exists)
   - loginWithGoogle resolver (already exists)

2. **server/schemas/typeDefs.js**
   - addProfile mutation signature (already correct)

3. **server/models/Profile.js**
   - organizations field structure (already correct)
   - currentOrganization reference (already correct)

---

## Next Steps

### Immediate
1. Test the complete flow end-to-end
2. Verify all error cases are handled
3. Check responsive design on various devices
4. Test dark mode rendering

### Future Enhancements
1. Email verification for new accounts
2. Password strength indicator
3. Invite code expiration dates
4. Multiple organization support per user
5. Social media login (Facebook, Twitter)
6. Password reset flow
7. Team discovery (public teams)
8. QR code generation for invite codes

---

## Success Metrics

The onboarding flow is successful when:
- ✅ No more 400 errors or blank screens
- ✅ Clear separation between team creation and team joining
- ✅ Intuitive user experience with minimal confusion
- ✅ Robust error handling prevents app crashes
- ✅ Invite codes work reliably
- ✅ JWT tokens are properly generated and stored
- ✅ All defensive checks in place (skip, null checks, try-catch)

---

## Conclusion

The new onboarding flow provides a crystal-clear user experience:
- **Signup** = Create a new team (team creators)
- **Login "Sign In"** = Existing users logging in
- **Login "Join Team"** = New players joining via invite code

This separation eliminates confusion and provides a streamlined, professional onboarding experience while maintaining all security and validation requirements.
