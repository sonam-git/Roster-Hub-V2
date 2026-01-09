# Formation Comments Real-Time Debug Guide 🔍

## Current Status: Subscriptions Not Triggering in Real-Time

---

## 🧪 Step-by-Step Testing Protocol

### Test 1: Verify Server is Publishing Events

**Open Server Terminal** and run:
```bash
cd server && node server.js
```

**Expected Logs when you perform actions:**

1. **Add Comment:**
   ```
   ➕ Publishing ADD subscription for formationId: 67xxxxx
   ```

2. **Update Comment:**
   ```
   🔄 Publishing UPDATE subscription for formationId: 67xxxxx
   ```

3. **Delete Comment:**
   ```
   🗑️ Publishing DELETE subscription for formationId: 67xxxxx
   ```

4. **Like Comment:**
   ```
   ❤️ Publishing LIKE subscription for formationId: 67xxxxx likes: X
   ```

✅ **If you see these logs:** Server pubsub is working correctly
❌ **If you DON'T see these logs:** Mutations are failing - check browser console for errors

---

### Test 2: Verify Client is Subscribed

**Open Browser Console (F12)** and look for:

```
🎯 Subscribed to formationId: 67xxxxx skip: false
```

**This should appear when:**
- GameDetails component renders
- FormationCommentList component renders
- A formation exists

✅ **If you see this log:** Client is attempting to subscribe
❌ **If you DON'T see this log:** formationId is null or FormationCommentList isn't rendering

---

### Test 3: Verify Subscription is Receiving Data

**In Browser Console, after performing an action, look for:**

1. **After Adding Comment:**
   ```
   ➕ ADD subscription received: {commentData} for formationId: 67xxxxx
   ➕ Comment exists? false Adding: true
   ```

2. **After Updating Comment:**
   ```
   🔄 UPDATE subscription received: {commentData} for formationId: 67xxxxx
   🔄 Comments after update: [...]
   ```

3. **After Deleting Comment:**
   ```
   🗑️ DELETE subscription received: 67yyyyy for formationId: 67xxxxx
   🗑️ Comments after delete: X remaining (deleted: 67yyyyy)
   ```

4. **After Liking Comment:**
   ```
   ❤️ LIKE subscription received: {commentData} for formationId: 67xxxxx
   ❤️ Comments after like update: [...]
   ```

✅ **If you see these logs:** Subscriptions are working!
❌ **If you DON'T see these logs:** Subscriptions aren't receiving data

---

### Test 4: Check for WebSocket Connection

**In Browser Console Network Tab:**

1. Filter by `WS` (WebSocket)
2. Look for a connection to your GraphQL endpoint
3. Status should be `101 Switching Protocols` (green)
4. Connection should stay open (not closing)

✅ **If WebSocket is connected:** Subscription transport is working
❌ **If NO WebSocket connection:** Check Apollo Client setup

---

### Test 5: Check for Subscription Errors

**In Browser Console, look for red error messages:**

```
➕ ADD subscription error: ...
🔄 UPDATE subscription error: ...
🗑️ DELETE subscription error: ...
❤️ LIKE subscription error: ...
```

✅ **If NO errors:** Subscriptions are set up correctly
❌ **If you see errors:** Copy the error and investigate

---

## 🐛 Common Issues & Solutions

### Issue 1: "Changes only appear after refresh"

**Symptoms:**
- Server logs show "Publishing" messages ✅
- Browser console shows NO subscription received messages ❌
- Data appears after F5 refresh

**Likely Causes:**
1. WebSocket connection not established
2. Subscription variables (formationId) don't match
3. Apollo Client subscriptions not configured

**Solutions:**
```javascript
// Check Apollo Client setup in your main App file
// Ensure wsLink is set up correctly

import { split, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3001/graphql', // WebSocket URL
  })
);

const httpLink = new HttpLink({
  uri: 'http://localhost:3001/graphql',
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

---

### Issue 2: "Delete doesn't work at all"

**Symptoms:**
- Click delete button
- Nothing happens (comment doesn't disappear)
- No errors in console
- Mutation might complete successfully

**Likely Causes:**
1. Subscription not filtering correctly by formationId
2. Comment ID doesn't match
3. Local state not updating

**Debug Steps:**

1. **Check mutation completion:**
   ```
   🗑️ DELETE mutation completed: 67yyyyy
   ```

2. **Check server publishing:**
   ```
   🗑️ Publishing DELETE subscription for formationId: 67xxxxx
   ```

3. **Check subscription receiving:**
   ```
   🗑️ DELETE subscription received: 67yyyyy for formationId: 67xxxxx
   ```

4. **Check state update:**
   ```
   🗑️ Comments after delete: 2 remaining (deleted: 67yyyyy)
   ```

**If any step is missing, that's where the problem is!**

---

### Issue 3: "Subscription receives data but UI doesn't update"

**Symptoms:**
- Server publishes ✅
- Browser receives subscription ✅
- Console shows "Comments after update" ✅
- But UI doesn't change ❌

**Likely Causes:**
1. React not re-rendering
2. State update not triggering useEffect
3. Props not being passed correctly

**Solutions:**

1. **Check FormationCommentItem receives new props:**
   ```javascript
   useEffect(() => {
     console.log('🔄 FormationCommentItem syncing from props:', {
       commentId: comment._id,
       oldLikes: localLikes,
       newLikes: comment.likes,
     });
     // ...
   }, [comment.likes, comment.likedBy]);
   ```

2. **Verify comment object has required fields:**
   ```javascript
   console.log('Full comment object:', comment);
   ```

---

### Issue 4: "FormationId is undefined"

**Symptoms:**
- Console shows: `🎯 Subscribed to formationId: undefined skip: true`
- No subscriptions work

**Solutions:**

1. **Check GameDetails is passing formationId:**
   ```jsx
   <FormationCommentList gameId={gameId} formationId={formation?._id} />
   ```

2. **Check QUERY_FORMATION is returning formation:**
   ```javascript
   const formation = data?.formation || { _id: "", comments: [] };
   console.log('Formation from query:', formation._id);
   ```

3. **Ensure formation exists in database**

---

## 📋 Quick Checklist

Run through this checklist:

**Backend:**
- [ ] Server console shows "Publishing" logs when actions are performed
- [ ] pubsub is imported and initialized correctly
- [ ] Subscription resolvers exist in resolvers.js
- [ ] Subscription resolvers use `withFilter` with correct formationId matching

**Frontend:**
- [ ] Apollo Client has WebSocket link configured
- [ ] WebSocket connection is active in Network tab
- [ ] FormationCommentList receives formationId prop
- [ ] Console shows "Subscribed to formationId: XXX skip: false"
- [ ] Subscriptions are not skipped (formationId exists)
- [ ] useSubscription hooks have onError handlers
- [ ] No subscription errors in console

**Real-Time Flow:**
- [ ] Mutation completes (console log)
- [ ] Server publishes (server console log)
- [ ] Subscription receives (browser console log)
- [ ] State updates (browser console log)
- [ ] Component re-renders
- [ ] UI reflects change

---

## 🔧 Emergency Fix: Force Subscription Reconnection

If subscriptions stop working, try:

```javascript
// In FormationCommentList
useEffect(() => {
  if (formationId) {
    console.log('🔌 Reconnecting subscriptions for formationId:', formationId);
    // Subscriptions will automatically reconnect when formationId changes
  }
}, [formationId]);
```

---

## 📞 Next Steps

1. **Run through all test steps above**
2. **Copy all console logs** (both server and browser)
3. **Note which step fails**
4. **Share the logs to identify the exact issue**

---

**Debug Guide Created:** January 9, 2026  
**Status:** AWAITING TEST RESULTS
