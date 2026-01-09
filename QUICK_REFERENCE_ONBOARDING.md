# 🎯 RosterHub Onboarding - Quick Reference Card

## For Users

### 🆕 Creating a New Team?
**Go to:** `/signup`

**What you need:**
- Your name
- Your email
- A password (min 6 characters)
- Team name (optional)

**What happens:**
1. You create your account
2. Your team is created automatically
3. You get a unique 8-digit invite code
4. Share the code with your teammates
5. You become the team owner

---

### 👥 Joining an Existing Team?
**Go to:** `/login` → Click "Join Team" tab

**What you need:**
- Your name
- Your email
- A password (min 6 characters)
- The team's invite code (get from team admin)

**What happens:**
1. You create your account
2. You're added to the team automatically
3. You can access all team features immediately
4. You become a team member

---

### 🔑 Already Have an Account?
**Go to:** `/login` (default "Sign In" mode)

**What you need:**
- Your email
- Your password

**What happens:**
1. You log in to your account
2. You're taken to your dashboard
3. All your team data is available

---

## For Developers

### Signup Page - Team Creation
```javascript
// File: client/src/pages/Signup.jsx
// Mutation: ADD_PROFILE
// Fields: name, email, password, teamName (optional)
// Returns: token, profile, organization { inviteCode }
```

### Login Page - Join Team Mode
```javascript
// File: client/src/pages/Login.jsx
// Mutation: ADD_PROFILE
// Fields: name, email, password, inviteCode (required)
// Returns: token, profile, organization
```

### Login Page - Sign In Mode
```javascript
// File: client/src/pages/Login.jsx
// Mutation: LOGIN_USER
// Fields: email, password
// Returns: token, profile
```

---

## API Endpoints

### Create Team & Account
```graphql
mutation AddProfile {
  addProfile(
    name: "John Doe"
    email: "john@example.com"
    password: "password123"
    organizationName: "Eagles FC"  # optional
  ) {
    token
    profile { _id name }
    organization { _id name inviteCode }
  }
}
```

### Join Team & Create Account
```graphql
mutation AddProfile {
  addProfile(
    name: "Jane Smith"
    email: "jane@example.com"
    password: "password123"
    inviteCode: "ABC12345"  # required
  ) {
    token
    profile { _id name }
    organization { _id name }
  }
}
```

### Login Existing User
```graphql
mutation Login {
  login(
    email: "john@example.com"
    password: "password123"
  ) {
    token
    profile { _id name }
  }
}
```

---

## URLs

| Page | URL | Purpose |
|------|-----|---------|
| Signup | `/signup` | Create new team |
| Login | `/login` | Sign in OR join team |
| Dashboard | `/dashboard` | Main app (after auth) |

---

## Invite Codes

- **Format:** 8 characters (letters + numbers)
- **Case:** Uppercase (automatically converted)
- **Example:** `ABC12345`
- **Usage:** One-time use per user (users can reuse to add to same org)
- **Location:** Displayed after team creation

---

## User Roles

| Role | Who | Permissions |
|------|-----|-------------|
| **Owner** | Team creator | Full control, manage members |
| **Member** | Players who joined | View/edit team content |

---

## Testing Quick Start

1. **Test Team Creation:**
   ```
   1. Go to /signup
   2. Fill form and submit
   3. Note the invite code
   4. Verify redirect to dashboard
   ```

2. **Test Team Join:**
   ```
   1. Go to /login
   2. Click "Join Team"
   3. Use invite code from step 1
   4. Fill form and submit
   5. Verify redirect to dashboard
   ```

3. **Test Login:**
   ```
   1. Log out
   2. Go to /login (Sign In mode)
   3. Enter credentials from step 1 or 2
   4. Verify redirect to dashboard
   ```

---

## Common Issues & Solutions

### "Invalid invitation code"
- **Cause:** Code doesn't exist or mistyped
- **Solution:** Double-check code with team admin

### "Email already exists"
- **Cause:** Account already created with that email
- **Solution:** Use login instead, or use different email

### "Organization has reached member limit"
- **Cause:** Team plan has member cap
- **Solution:** Team owner needs to upgrade plan

### Blank page after login
- **Cause:** Token or org context issue
- **Solution:** Check console for errors, verify backend is running

---

## File Locations

### Frontend
- `/client/src/pages/Signup.jsx` - Team creation page
- `/client/src/pages/Login.jsx` - Login and team join page
- `/client/src/utils/mutations.jsx` - GraphQL mutations
- `/client/src/utils/auth.jsx` - JWT token management

### Backend
- `/server/schemas/resolvers.js` - addProfile and login logic
- `/server/schemas/typeDefs.js` - GraphQL schema
- `/server/models/Profile.js` - User model
- `/server/models/Organization.js` - Team model

### Documentation
- `/ONBOARDING_COMPLETE.md` - Complete summary
- `/ONBOARDING_FLOW_FINAL.md` - Detailed documentation
- `/ONBOARDING_VISUAL_GUIDE.md` - Visual diagrams
- `/TESTING_CHECKLIST_ONBOARDING.md` - Test cases

---

## Key Features

✅ **Clear separation:** Signup = create, Login = join/signin  
✅ **Mode toggle:** Visual distinction between login and join  
✅ **Auto-redirect:** Smooth transition to dashboard  
✅ **Error handling:** Graceful error messages  
✅ **Responsive:** Works on all devices  
✅ **Dark mode:** Full theme support  
✅ **Secure:** Password hashing, JWT tokens  

---

## Status

**✅ COMPLETE AND READY FOR TESTING**

All code is implemented, tested for errors, and documented. Ready for end-to-end testing and deployment.

---

*Keep this card handy for quick reference during development and testing!*
