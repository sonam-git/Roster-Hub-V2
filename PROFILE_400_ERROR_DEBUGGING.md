# Profile View 400 Error - Complete Troubleshooting Guide

## Issue
When clicking "View Profile" button from the Roster page to view a user profile at `/profiles/{profileId}`, a 400 Bad Request error occurs.

## Flow Analysis

### 1. User Action
- User navigates to `/roster`
- Clicks "View Profile" button on a profile card
- Browser navigates to `/profiles/69601d16b6e6a311f44d12a3`

### 2. What Should Happen
1. **Profile.jsx** component mounts
2. Extracts `profileId` from URL params
3. Gets `currentOrganization` from context
4. Executes `QUERY_SINGLE_PROFILE` with variables:
   ```javascript
   {
     profileId: "69601d16b6e6a311f44d12a3",
     organizationId: "69601b3aa3f990576ebeab96"
   }
   ```
5. Server resolver fetches profile data
6. **UserProfile** component renders with profile data

### 3. GraphQL Query (Client Side)

**File:** `client/src/utils/queries.jsx` (Line 77-143)

```graphql
query singleProfile($profileId: ID!, $organizationId: ID!) {
  profile(profileId: $profileId, organizationId: $organizationId) {
    _id
    name
    jerseyNumber
    position
    phoneNumber
    profilePic
    averageRating
    online
    posts { ... }
    socialMediaLinks { ... }
    skills { ... }
    receivedMessages { ... }
  }
}
```

### 4. GraphQL Schema (Server Side)

**File:** `server/schemas/typeDefs.js` (Line 369)

```graphql
type Query {
  profile(profileId: ID!, organizationId: ID): Profile
}
```

✅ **Status:** Schema accepts `organizationId` as optional parameter

### 5. Resolver (Server Side)

**File:** `server/schemas/resolvers.js` (Line 153-186)

```javascript
profile: async (parent, { profileId, organizationId }, context) => {
  console.log('🔍 profile resolver called with:', {
    profileId,
    organizationId,
    organizationIdFromContext: context.organizationId
  });
  
  const orgId = organizationId || context.organizationId;
  
  const profile = await Profile.findOne({ _id: profileId })
    .populate("receivedMessages")
    .populate("skills")
    .populate("socialMediaLinks")
    .populate("posts");
  
  // Verify profile is member of organization
  if (orgId && profile) {
    const org = await Organization.findById(orgId);
    if (org && !org.members.includes(profile._id)) {
      throw new UserInputError("Profile not found in organization");
    }
  }
  
  return profile;
}
```

✅ **Status:** Resolver properly handles organizationId

## Debugging Steps

### Step 1: Check Browser Console

Look for these logs when clicking "View Profile":

```javascript
🔍 Profile Page Debug: {
  profileId: "69601d16b6e6a311f44d12a3",
  organizationId: "69601b3aa3f990576ebeab96",
  organizationName: "Arsenal",
  hasOrganization: true
}
```

```javascript
🔍 Profile Query Debug: {
  loading: false,
  hasData: true,
  hasError: false,
  errorMessage: undefined,
  profileData: {...}
}
```

### Step 2: Check Server Logs

Look for:

```javascript
🔍 profile resolver called with: {
  profileId: '69601d16b6e6a311f44d12a3',
  organizationId: '69601b3aa3f990576ebeab96',
  organizationIdFromContext: '69601b3aa3f990576ebeab96'
}
```

### Step 3: Check Network Tab

**Request:**
- URL: `http://localhost:3001/graphql`
- Method: POST
- Headers: Should include `Authorization: Bearer {token}`
- Body: Should contain the query and variables

**Expected Response (200):**
```json
{
  "data": {
    "profile": {
      "_id": "69601d16b6e6a311f44d12a3",
      "name": "John Doe",
      ...
    }
  }
}
```

**Error Response (400):**
```json
{
  "errors": [{
    "message": "...",
    "extensions": {...}
  }]
}
```

## Common Causes of 400 Errors

### 1. ❌ Schema Mismatch
**Problem:** Query requests fields that don't exist in schema
**Solution:** ✅ Already fixed - removed invalid `organizationId` fields

### 2. ❌ Missing Required Variables
**Problem:** Query requires variables that aren't provided
**Check:** Both `profileId` and `organizationId` are being passed

### 3. ❌ Invalid Field Requests
**Problem:** Nested fields request non-existent properties
**Check:** All nested fields (posts, skills, etc.) should match schema

### 4. ❌ Authentication Issues
**Problem:** Token is invalid or missing
**Check:** `localStorage.getItem('id_token')` exists and is valid

### 5. ❌ Cached Invalid Queries
**Problem:** Apollo Client cached a query with old schema
**Solution:** Clear browser cache and localStorage

## Fixes Applied

### Fix 1: Removed Invalid organizationId Fields ✅
**Files Modified:**
- `client/src/utils/queries.jsx`
  - QUERY_PROFILES (removed organizationId from Profile, Post, Skill)
  - QUERY_SINGLE_PROFILE (removed organizationId from Profile, Post, Skill)
  - GET_POSTS (removed organizationId from Post)

### Fix 2: Updated Schema to Accept organizationId ✅
**File:** `server/schemas/typeDefs.js`
- Line 369: `profile(profileId: ID!, organizationId: ID): Profile`
- Line 371: `skills(organizationId: ID): [Skill]`
- Line 375: `posts(organizationId: ID): [Post]`
- Line 381: `games(organizationId: ID, status: GameStatus): [Game]`

### Fix 3: Updated Resolvers ✅
**File:** `server/schemas/resolvers.js`
- profile resolver: Accepts organizationId parameter
- games resolver: Accepts organizationId parameter
- posts resolver: Uses organizationId from args or context
- skills resolver: Uses organizationId from args or context

### Fix 4: Added Debug Logging ✅
**File:** `client/src/pages/Profile.jsx`
- Added logging for URL params and organization
- Added logging for query execution and results

## Manual Testing Checklist

- [ ] Navigate to `/roster`
- [ ] Click "View Profile" on any profile card
- [ ] Verify URL changes to `/profiles/{profileId}`
- [ ] Check browser console for debug logs
- [ ] Verify no 400 errors in Network tab
- [ ] Verify profile page renders with correct data
- [ ] Verify tabs work (Skills, Posts, Games)
- [ ] Verify action buttons work (Rate, Message)

## Emergency Fixes

### If Still Getting 400 Errors:

#### Option 1: Clear Apollo Cache
Add to `client/src/pages/Profile.jsx`:
```javascript
import { useApolloClient } from '@apollo/client';

const client = useApolloClient();
useEffect(() => {
  client.clearStore(); // Clear all cached queries
}, []);
```

#### Option 2: Force Network-Only Fetch
Update query options:
```javascript
const { loading, data, error, refetch } = useQuery(
  profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
  {
    variables: { 
      profileId: profileId,
      organizationId: currentOrganization?._id 
    },
    skip: !currentOrganization,
    fetchPolicy: 'network-only' // Force fresh fetch
  }
);
```

#### Option 3: Check Specific Error Message
Add to error display:
```javascript
if (error) {
  console.error('🔴 Full Error:', error);
  console.error('🔴 GraphQL Errors:', error.graphQLErrors);
  console.error('🔴 Network Error:', error.networkError);
  return <div>Error: {error.message}</div>;
}
```

## Current Status

✅ GraphQL schema updated
✅ Resolvers updated
✅ Client queries fixed
✅ Debug logging added
✅ Server restarted

**Next Step:** Test in browser and check console logs for specific error details.

---
**Date:** January 8, 2026
**Status:** 🔍 Investigating - Need browser console output
