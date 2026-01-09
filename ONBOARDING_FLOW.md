# 🚀 Onboarding Flow - Multi-Tenant Organization Setup

## Overview

The new onboarding flow allows users to either **create a new organization** or **join an existing organization** during the signup process. This ensures every user is properly associated with an organization from the start.

---

## 🎯 Features

### 1. **Create Organization Mode** (Default)
When a user signs up and selects "Create Organization":

- **User provides:**
  - Full Name
  - Email Address
  - Password
  - Organization Name (optional - defaults to "{Name}'s Team")

- **Backend automatically:**
  - Creates a new user profile
  - Creates a new organization with a unique 8-character invite code
  - Sets the user as the organization owner
  - Adds the user to the organization's member list
  - Returns the organization details including the invite code

- **Frontend displays:**
  - Success message with the organization name
  - A prominent display of the invite code
  - Copy button to easily share the invite code with team members

### 2. **Join Organization Mode**
When a user signs up and selects "Join Organization":

- **User provides:**
  - Full Name
  - Email Address
  - Password
  - Organization Invite Code (required, 8-character code)

- **Backend automatically:**
  - Creates a new user profile
  - Validates the invite code
  - Checks if the organization has reached its member limit (based on plan)
  - Adds the user to the existing organization as a member
  - Returns the organization details

- **Frontend displays:**
  - Success message confirming they've joined the organization
  - Redirects to the dashboard with the organization context

---

## 🔑 Organization Invite Codes

### Generation
- **Format:** 8 uppercase alphanumeric characters
- **Characters used:** A-Z, 2-9 (excludes confusing characters like 0, O, 1, I, L)
- **Example:** `AB34XY7Q`
- **Uniqueness:** Verified unique before creation

### Usage
1. Organization owner receives the code immediately after creating their organization
2. Owner shares this code with team members (via any communication channel)
3. Team members use this code during signup to join the organization
4. Code can be found later in the organization settings/profile

### Security
- Codes are case-insensitive (automatically converted to uppercase)
- Codes are validated against the database before allowing join
- Member limits are enforced based on the organization's subscription plan

---

## 📊 Member Limits by Plan

| Plan | Max Members |
|------|-------------|
| Free | 10 |
| Starter | 50 |
| Pro | 200 |
| Enterprise | Unlimited |

When joining an organization, the backend checks if the organization has reached its member limit and rejects the signup if full.

---

## 🎨 UI/UX Flow

### Signup Page Components

1. **Mode Selector Toggle**
   - Two-button toggle: "🚀 Create Organization" | "👥 Join Organization"
   - Changes form fields and button styling dynamically

2. **Dynamic Form Fields**
   - **Always shown:** Name, Email, Password
   - **Create mode only:** Organization Name (optional)
   - **Join mode only:** Invite Code (required)

3. **Success Modal** (Create mode only)
   - Shows organization name
   - Displays invite code in a prominent, copyable format
   - Includes copy-to-clipboard button
   - Auto-redirects to dashboard after 2 seconds

4. **Error Handling**
   - Invalid invite code
   - Organization at member limit
   - Duplicate email
   - Network errors

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. **Organization Model** (`/server/models/Organization.js`)
```javascript
inviteCode: {
  type: String,
  unique: true,
  sparse: true,
  uppercase: true,
  trim: true,
  minlength: 6,
  maxlength: 12
}
```

#### 2. **GraphQL Type Definitions** (`/server/schemas/typeDefs.js`)
```graphql
type Organization {
  # ...existing fields
  inviteCode: String
}

type Mutation {
  addProfile(
    name: String!
    email: String!
    password: String!
    organizationName: String
    inviteCode: String
  ): Auth
}
```

#### 3. **Resolver Logic** (`/server/schemas/resolvers.js`)
- Enhanced `addProfile` mutation to accept `organizationName` and `inviteCode`
- Generates unique 8-character invite codes
- Validates invite codes and member limits
- Assigns appropriate roles (owner vs member)

### Frontend Changes

#### 1. **Mutations** (`/client/src/utils/mutations.jsx`)
```graphql
mutation addProfile(
  $name: String!
  $email: String!
  $password: String!
  $organizationName: String
  $inviteCode: String
) {
  addProfile(
    name: $name
    email: $email
    password: $password
    organizationName: $organizationName
    inviteCode: $inviteCode
  ) {
    token
    profile { _id name }
    organization {
      _id
      name
      slug
      inviteCode
      owner { _id name }
      members { _id name }
    }
  }
}
```

#### 2. **Signup Page** (`/client/src/pages/Signup.jsx`)
- Added `signupMode` state ("create" | "join")
- Added mode selector toggle
- Conditional form fields based on mode
- Success modal with invite code display
- Copy-to-clipboard functionality
- Dynamic button text and styling

#### 3. **Queries** (`/client/src/utils/queries.jsx`)
- Added `inviteCode` to `QUERY_ME` for current and all organizations

---

## 📝 Usage Examples

### Scenario 1: Team Captain Creates Organization

1. Sarah visits the signup page
2. Keeps "Create Organization" mode selected (default)
3. Enters:
   - Name: "Sarah Johnson"
   - Email: "sarah@example.com"
   - Password: "********"
   - Organization Name: "Lightning FC"
4. Clicks "🚀 CREATE ORGANIZATION"
5. Sees success message: "Your organization 'Lightning FC' has been created!"
6. Sees invite code: **LG8HT9FC**
7. Copies code and shares with her team via WhatsApp
8. Auto-redirected to dashboard

### Scenario 2: Team Member Joins Organization

1. Mike receives invite code **LG8HT9FC** from Sarah
2. Visits the signup page
3. Clicks "👥 Join Organization" toggle
4. Enters:
   - Name: "Mike Davis"
   - Email: "mike@example.com"
   - Password: "********"
   - Invite Code: "lg8ht9fc" (case-insensitive)
5. Clicks "👥 JOIN ORGANIZATION"
6. Successfully joins "Lightning FC"
7. Auto-redirected to dashboard with organization context

---

## 🧪 Testing Checklist

- [ ] Create organization with custom name
- [ ] Create organization without custom name (uses default)
- [ ] Join organization with valid invite code
- [ ] Join organization with invalid invite code (should fail)
- [ ] Try to join organization at member limit (should fail)
- [ ] Verify invite code is displayed correctly
- [ ] Test copy-to-clipboard functionality
- [ ] Verify case-insensitive invite code entry
- [ ] Check that owner has 'owner' role
- [ ] Check that joined members have 'member' role
- [ ] Verify organization context is set correctly after signup
- [ ] Test error messages display correctly
- [ ] Verify success modal shows and auto-redirects

---

## 🔒 Security Considerations

1. **Invite codes are not passwords:** They're meant for easy sharing among team members
2. **Member limits enforced:** Prevents organizations from exceeding their plan limits
3. **Unique codes:** Each organization gets a unique invite code
4. **Code validation:** Backend validates codes before allowing joins
5. **Role-based access:** Owners have full control, members have limited permissions

---

## 🎯 Future Enhancements

- [ ] Add invite code regeneration (for security reasons)
- [ ] Email invitation system (send invite codes via email)
- [ ] Invite code expiration
- [ ] One-time use invite codes
- [ ] Invite code analytics (track who joined via which code)
- [ ] QR code generation for invite codes
- [ ] Public organization directory (optional)
- [ ] Organization verification badges

---

## 📚 Related Documentation

- [Multi-Tenant Master Status](MULTI_TENANT_MASTER_STATUS.md)
- [Phase 8D Completion](PHASE8D_FINAL_COMPLETE.md)
- [Phase 9 Quick Start](PHASE9_QUICK_START.md)

---

**Last Updated:** January 7, 2026  
**Status:** ✅ Implemented and Ready for Testing
