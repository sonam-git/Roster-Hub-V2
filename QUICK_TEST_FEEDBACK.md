# Quick Test: Game Feedback Mutation

## Test the Mutation Directly

### Option 1: GraphQL Playground/Apollo Studio

1. **Open GraphQL Playground:**
   - URL: `http://localhost:3001/graphql`
   - Or wherever your server is running

2. **Get your auth token:**
   - Open browser DevTools → Application → Local Storage
   - Copy the value of `id_token`

3. **Add auth header:**
   ```json
   {
     "Authorization": "Bearer YOUR_TOKEN_HERE"
   }
   ```

4. **Run this mutation:**
   ```graphql
   mutation TestFeedback {
     addFeedback(
       gameId: "REPLACE_WITH_ACTUAL_GAME_ID"
       organizationId: "REPLACE_WITH_ACTUAL_ORG_ID"
       comment: "Test feedback from GraphQL Playground"
       rating: 8
     ) {
       _id
       averageRating
       feedbacks {
         _id
         user {
           _id
           name
         }
         comment
         rating
         playerOfTheMatch {
           _id
           name
         }
       }
     }
   }
   ```

5. **Get real IDs:**
   - For `gameId`: Look in browser DevTools → Network → Find a game query → Copy game `_id`
   - For `organizationId`: Run this query first:
   ```graphql
   query GetMe {
     me {
       _id
       currentOrganization {
         _id
         name
       }
     }
   }
   ```

### Option 2: Browser Console Test

1. Open the game detail page in your browser
2. Open DevTools → Console
3. Run this test:

```javascript
// Get the current game ID from the URL or page
const gameId = window.location.pathname.split('/').pop();

// Get organization from localStorage or context
const orgId = "PASTE_ORG_ID_HERE"; // Get from user context

// Test mutation
fetch('http://localhost:3001/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('id_token')
  },
  body: JSON.stringify({
    query: `
      mutation TestFeedback($gameId: ID!, $organizationId: ID!, $comment: String, $rating: Int!) {
        addFeedback(gameId: $gameId, organizationId: $organizationId, comment: $comment, rating: $rating) {
          _id
          averageRating
        }
      }
    `,
    variables: {
      gameId: gameId,
      organizationId: orgId,
      comment: "Test from console",
      rating: 8
    }
  })
})
.then(r => r.json())
.then(result => {
  console.log('Success:', result);
})
.catch(err => {
  console.error('Error:', err);
});
```

## Check Network Request

### What to Look For:

1. **Open DevTools → Network tab**
2. **Filter by "graphql"**
3. **Submit feedback from the UI**
4. **Click on the request**
5. **Check these tabs:**

#### Request Headers
Should include:
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Payload
Should look like:
```json
{
  "operationName": "AddFeedback",
  "variables": {
    "gameId": "65abc123...",
    "organizationId": "65xyz789...",
    "comment": "Great game!",
    "rating": 8,
    "playerOfTheMatchId": "65player..."  // Optional
  },
  "query": "mutation AddFeedback($gameId: ID!, $organizationId: ID!, ..."
}
```

#### Response
**If successful (200):**
```json
{
  "data": {
    "addFeedback": {
      "_id": "...",
      "feedbacks": [...],
      "averageRating": 7.5
    }
  }
}
```

**If error (400):**
```json
{
  "errors": [
    {
      "message": "Specific error message here",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

## Common Issues & Solutions

### Issue 1: "organizationId is required"
**Check:**
- Is `currentOrganization._id` defined?
- Add this console.log in GameFeedback:
```javascript
console.log('Org ID:', currentOrganization?._id);
```

### Issue 2: "Game not found"
**Check:**
- Does the game exist?
- Does it belong to the current organization?
- Query the game first:
```graphql
query GetGame($gameId: ID!) {
  game(gameId: $gameId) {
    _id
    organizationId
    status
  }
}
```

### Issue 3: "Can only add feedback to completed games"
**Check:**
- Game status must be "COMPLETED"
- Update game status first if needed

### Issue 4: Browser cache
**Try:**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Issue 5: Apollo cache
**Try adding this temporarily to GameFeedback:**
```javascript
const [addFeedback, { loading, error }] = useMutation(ADD_FEEDBACK, {
  refetchQueries: [{ query: QUERY_GAME, variables: { gameId } }],
  awaitRefetchQueries: true,
  fetchPolicy: 'no-cache', // Add this temporarily
  onCompleted: () => {
    // ...
  }
});
```

## Verify Current Code

### 1. Check mutations.jsx has the fix:
```bash
grep -A 3 "export const ADD_FEEDBACK" client/src/utils/mutations.jsx
```

Expected output:
```javascript
export const ADD_FEEDBACK = gql`
  mutation AddFeedback($gameId: ID!, $organizationId: ID!, $comment: String, $rating: Int!, $playerOfTheMatchId: ID) {
    addFeedback(gameId: $gameId, organizationId: $organizationId, comment: $comment, rating: $rating, playerOfTheMatchId: $playerOfTheMatchId) {
```

### 2. Check GameFeedback passes organizationId:
```bash
grep -A 5 "const variables" client/src/components/GameFeedback/index.jsx
```

Expected output:
```javascript
const variables = { 
  gameId, 
  comment: comment.trim(), 
  rating,
  organizationId: currentOrganization._id
};
```

### 3. Check server is using latest code:
```bash
ps aux | grep "node server.js"
```

If running, restart it:
```bash
pkill -f "node server.js"
cd server && node server.js
```

## Force Fresh Start

If nothing works, do a complete reset:

```bash
# 1. Kill all node processes
pkill -9 node

# 2. Clear client cache and rebuild
cd client
rm -rf node_modules .cache build
npm install

# 3. Restart server
cd ../server
node server.js

# 4. In browser:
# - Clear all storage (DevTools → Application → Clear storage)
# - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
# - Log out and log back in
```

## Monitor Server Logs

While testing, watch the server logs for these messages:

**Success:**
```
(No error messages)
```

**Errors to look for:**
```
Organization ID is required!
Game not found!
Can only add feedback to completed games!
User not authenticated!
```

## Expected Flow

1. ✅ User opens completed game
2. ✅ GameFeedback component loads
3. ✅ Organization context provides `currentOrganization._id`
4. ✅ User fills form and clicks Submit
5. ✅ `handleSubmit` creates variables object with `organizationId`
6. ✅ `addFeedback` mutation called with variables
7. ✅ Request sent to server with all required fields
8. ✅ Server validates and saves feedback
9. ✅ Response returns updated game
10. ✅ UI updates with new feedback
11. ✅ Form clears

## Debug Checklist

- [ ] Server running with latest code
- [ ] Browser cache cleared
- [ ] Hard refresh done (Cmd+Shift+R)
- [ ] User logged in
- [ ] Organization selected
- [ ] Game is completed
- [ ] Network tab checked (payload includes organizationId)
- [ ] Server logs checked
- [ ] Console has no errors
- [ ] Auth token is valid

---

**If all else fails, try the GraphQL Playground test first** - it will tell you if the problem is in the frontend or backend.
