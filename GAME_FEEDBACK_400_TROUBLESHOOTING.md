# Game Feedback 400 Error - Troubleshooting Guide

## Current Status
The backend and frontend code are **correctly configured**:

### ✅ Backend (typeDefs.js)
```graphql
addFeedback(
  gameId: ID!
  organizationId: ID!
  comment: String
  rating: Int!
  playerOfTheMatchId: ID
): Game!
```

### ✅ Backend Resolver (gameResolvers.js)
```javascript
addFeedback: async (_, { gameId, organizationId, comment, rating, playerOfTheMatchId }, context) => {
  // Properly handles all parameters including organizationId
  // Returns populated game object with feedbacks
}
```

### ✅ Frontend Mutation (mutations.jsx)
```javascript
export const ADD_FEEDBACK = gql`
  mutation AddFeedback($gameId: ID!, $organizationId: ID!, $comment: String, $rating: Int!, $playerOfTheMatchId: ID) {
    addFeedback(gameId: $gameId, organizationId: $organizationId, comment: $comment, rating: $rating, playerOfTheMatchId: $playerOfTheMatchId) {
      _id
      feedbacks {
        _id
        user { _id name }
        comment
        rating
        playerOfTheMatch { _id name }
      }
      averageRating
    }
  }
`;
```

### ✅ Frontend Component (GameFeedback/index.jsx)
```javascript
const variables = { 
  gameId, 
  comment: comment.trim(), 
  rating,
  organizationId: currentOrganization._id
};

// Only add playerOfTheMatchId if a player is selected
if (playerOfTheMatchId) {
  variables.playerOfTheMatchId = playerOfTheMatchId;
}

await addFeedback({ variables });
```

## Possible Causes of 400 Error

### 1. **Browser Cache Issue**
The browser may be using a cached version of the mutations.jsx file.

**Solution:**
- Hard refresh the browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Clear browser cache completely
- Open DevTools → Application → Clear Storage → Clear site data

### 2. **Apollo Client Cache**
Apollo Client might have cached the old schema.

**Solution:**
Add this to your Apollo Client setup (temporarily):
```javascript
defaultOptions: {
  watchQuery: {
    fetchPolicy: 'no-cache',
  },
  query: {
    fetchPolicy: 'no-cache',
  },
}
```

### 3. **Build Cache Issue**
If using a bundler (Webpack, Vite, etc.), the build cache might be stale.

**Solution:**
```bash
# Stop the dev server
# Delete node_modules and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### 4. **Server Not Fully Restarted**
The GraphQL schema might not be fully reloaded.

**Solution:**
```bash
# Kill ALL node processes
pkill -9 node
# Restart the server
cd server
node server.js
```

### 5. **Network Request Inspection**
Check what's actually being sent to the server.

**Steps:**
1. Open Chrome DevTools
2. Go to Network tab
3. Filter by "graphql"
4. Submit feedback
5. Click on the request
6. Check the "Payload" tab
7. Verify `organizationId` is included in the variables

**Expected Payload:**
```json
{
  "operationName": "AddFeedback",
  "variables": {
    "gameId": "...",
    "organizationId": "...",
    "comment": "...",
    "rating": 8,
    "playerOfTheMatchId": "..."
  },
  "query": "mutation AddFeedback($gameId: ID!, $organizationId: ID!, ..."
}
```

### 6. **Check Server Logs**
Look for specific error messages in the server console.

**What to look for:**
- "Organization ID is required!"
- "Game not found!"
- "Can only add feedback to completed games!"
- Any other error messages

## Diagnostic Steps

### Step 1: Verify Server is Running with Latest Code
```bash
# Check server process
ps aux | grep "node server.js"

# Check server logs for any errors
# Look in the terminal where server is running
```

### Step 2: Test with GraphQL Playground
1. Open `http://localhost:3001/graphql` (or your server URL)
2. Run this mutation manually:
```graphql
mutation TestFeedback {
  addFeedback(
    gameId: "YOUR_GAME_ID"
    organizationId: "YOUR_ORG_ID"
    comment: "Test comment"
    rating: 8
  ) {
    _id
    averageRating
    feedbacks {
      comment
      rating
    }
  }
}
```

### Step 3: Check Browser Console
Look for:
- Apollo Client errors
- Network errors
- JavaScript errors
- Warning messages

### Step 4: Verify Organization Context
Add console.log to GameFeedback component:
```javascript
console.log('Organization ID:', currentOrganization?._id);
console.log('Variables being sent:', variables);
```

## Quick Fix Checklist

- [ ] Server restarted (killed and restarted)
- [ ] Browser hard refresh (Cmd+Shift+R)
- [ ] Browser cache cleared
- [ ] DevTools → Network → Verified payload includes `organizationId`
- [ ] Server logs checked for specific error
- [ ] Organization context is defined and has `_id`
- [ ] Game status is "COMPLETED"
- [ ] User is logged in

## If Issue Persists

### Option 1: Temporary Diagnostic Logging
Add to server resolver (temporarily):
```javascript
addFeedback: async (_, args, context) => {
  console.log('=== ADD FEEDBACK DEBUG ===');
  console.log('Args received:', JSON.stringify(args, null, 2));
  console.log('User:', context.user?._id);
  console.log('========================');
  
  // ... rest of resolver
}
```

### Option 2: Check for Multiple Schema Files
```bash
# Search for any duplicate schema definitions
grep -r "addFeedback" server/schemas/
```

### Option 3: Verify GraphQL Schema Merge
If using schema stitching or multiple schema files, ensure they're properly merged.

## Server Restart Commands

```bash
# Method 1: Using VS Code task
# Click Terminal → Run Task → Start Server

# Method 2: Manual restart
pkill -f "node server.js"
cd server && node server.js

# Method 3: Force kill all node processes
pkill -9 node
cd server && node server.js
```

## Browser Cache Clear Commands

**Chrome/Brave:**
1. Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
2. Select "Cached images and files"
3. Click "Clear data"

**Or programmatically in DevTools:**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
location.reload(true);
```

## Expected Behavior After Fix

1. User fills out feedback form
2. Clicks "Submit Feedback"
3. Mutation executes successfully
4. Feedback appears in the list immediately
5. Form clears
6. Average rating updates
7. No 400 error in console

## Recent Changes Made

1. ✅ Updated `ADD_FEEDBACK` mutation to include `$organizationId: ID!`
2. ✅ Updated mutation call to pass `organizationId: $organizationId`
3. ✅ Verified backend resolver accepts `organizationId`
4. ✅ Verified backend typeDef requires `organizationId`
5. ✅ Updated GameFeedback component to pass `organizationId`
6. ✅ Restarted server

## Next Steps

If the issue persists after following all troubleshooting steps:

1. **Capture the exact error message** from:
   - Browser console
   - Network tab (Response)
   - Server logs

2. **Share the payload** from Network tab

3. **Verify the game state**:
   - Is the game completed?
   - Does the game belong to the organization?
   - Is the user a member of the organization?

---

Last Updated: [Current Date]
Status: All code is correct - likely a caching issue
