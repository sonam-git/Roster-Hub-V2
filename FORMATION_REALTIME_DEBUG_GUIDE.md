# Formation Real-Time Debugging Guide

## 🔧 Changes Made

### 1. Added Error Handling to Subscriptions
**File**: `/client/src/components/FormationSection/index.jsx`

Added `onError` handlers and `skip` conditions to subscriptions:
```javascript
useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
  variables: { gameId },
  skip: !gameId,  // ✅ NEW: Skip if no gameId
  onData: ({ data }) => { /* ... */ },
  onError: (error) => {  // ✅ NEW: Error handler
    console.error('❌ Formation created subscription error:', error);
  },
});
```

### 2. Added Success Messages
**File**: `/client/src/components/FormationSection/index.jsx`

Now shows alert messages:
- ✅ "Formation created successfully!" (on create)
- ✅ "Formation updated successfully!" (on update)

### 3. Added Backend Logging
**Files**: 
- `/server/schemas/gameResolvers.js`
- `/server/schemas/resolvers.js`

Added console logs to track subscription flow:
```javascript
// When publishing
console.log('📡 Publishing FORMATION_CREATED for gameId:', gameId);

// When filtering
console.log('🔍 FORMATION_CREATED filter:', {
  payloadGameId: payload?.formationCreated?.game?._id.toString(),
  variableGameId: variables?.gameId?.toString(),
  match
});
```

---

## 🧪 Testing Steps

### Step 1: Restart Server
```bash
cd server && node server.js
```

**Expected Console Output:**
```
Server running on port 3001
Connected to MongoDB
```

### Step 2: Open Two Browser Tabs

**Tab 1** (Creator):
- Login as game creator
- Navigate to game details page
- Open browser console (F12)

**Tab 2** (Observer):
- Login as different user (or same user in different browser)
- Navigate to SAME game details page
- Open browser console (F12)

### Step 3: Test Formation Creation

**In Tab 1:**
1. Select formation type (e.g., "1-4-3-3")
2. Drag players to positions
3. Click "Create Formation"
4. **Check console for:**
   ```
   ✅ Formation created successfully!
   ```
5. **Check alert:** Should show success message

**In Tab 2 Console:**
Look for:
```
🔔 Formation created subscription received: {object}
```

**In Server Console:**
Look for:
```
📡 Publishing FORMATION_CREATED for gameId: [id]
🔍 FORMATION_CREATED filter: { payloadGameId: '[id]', variableGameId: '[id]', match: true }
```

### Step 4: Test Formation Update

**In Tab 1:**
1. Change player positions (drag new players)
2. Click "Update Formation"
3. **Check console for:**
   ```
   ✅ Formation updated successfully!
   ```
4. **Check alert:** Should show update success message

**In Tab 2 Console:**
Look for:
```
🔔 Formation updated subscription received: {object}
```

**In Server Console:**
Look for:
```
📡 Publishing FORMATION_UPDATED for gameId: [id]
🔍 FORMATION_UPDATED filter: { payloadGameId: '[id]', variableGameId: '[id]', match: true }
```

### Step 5: Test Formation Deletion

**In Tab 1:**
1. Click "Delete Formation"
2. Confirm deletion

**In Tab 2 Console:**
Look for:
```
🔔 Formation deleted subscription received
```

**In Server Console:**
Look for:
```
📡 Publishing FORMATION_DELETED for gameId: [id]
🔍 FORMATION_DELETED filter: { payloadGameId: '[id]', variableGameId: '[id]', match: true }
```

---

## 🐛 Troubleshooting

### Issue: No subscription messages in Tab 2

#### Check 1: WebSocket Connection
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. Look for connection to: `ws://localhost:3001/graphql`
5. **Status should be:** 101 Switching Protocols (green)

**If no WebSocket connection:**
- Server may not be running
- CORS issues
- Firewall blocking WebSocket

#### Check 2: GraphQL Subscription Active
1. In Network tab, click on the WebSocket connection
2. Go to **Messages** sub-tab
3. Look for subscription initialization messages:
   ```json
   {"type":"connection_init"}
   {"type":"connection_ack"}
   {"type":"subscribe","payload":{"query":"subscription formationCreated..."}}
   ```

**If no subscribe messages:**
- Subscription might not be initialized
- Check for JavaScript errors in console

#### Check 3: Server Console Logs
Server should show:
```
📡 Publishing FORMATION_CREATED for gameId: [id]
🔍 FORMATION_CREATED filter: { ... match: true }
```

**If "match: false":**
- GameId mismatch between tabs
- Check both tabs are on same game
- Verify gameId is correct in subscription variables

**If no publishing logs:**
- Mutation may be failing
- Check for mutation errors
- Verify pubsub is configured

#### Check 4: Frontend Console Errors
Look for errors like:
```
❌ Formation created subscription error: [error]
```

**Common errors:**
- Network error: Check server connection
- GraphQL error: Check subscription query syntax
- Authentication error: Check user is logged in

### Issue: Success message not showing

Check `handleSubmitFormation` logic:
- Alert should appear after mutation completes
- Check for try/catch errors
- Verify mutation returns data

### Issue: Players still disappear

This should be fixed! If not:
1. Verify backend change: `pos.playerId` (not `pos.player`)
2. Check mutation sends correct data
3. Verify database saves players
4. Check browser console for errors

---

## 📊 Expected Behavior Checklist

### Create Formation
- [ ] Tab 1: Alert shows "Formation created successfully!"
- [ ] Tab 1: Console logs success
- [ ] Tab 1: Players remain visible on board
- [ ] Tab 2: Console shows subscription received
- [ ] Tab 2: Formation appears instantly
- [ ] Tab 2: All players visible
- [ ] Server: Publish and filter logs appear

### Update Formation
- [ ] Tab 1: Alert shows "Formation updated successfully!"
- [ ] Tab 1: Console logs success
- [ ] Tab 1: Updated players visible
- [ ] Tab 2: Console shows subscription received
- [ ] Tab 2: Formation updates instantly
- [ ] Tab 2: Updated players visible
- [ ] Server: Publish and filter logs appear

### Delete Formation
- [ ] Tab 1: Formation removed from UI
- [ ] Tab 2: Console shows subscription received
- [ ] Tab 2: Formation removed instantly
- [ ] Server: Publish and filter logs appear

---

## 🔍 Debugging Commands

### Check WebSocket in Browser Console
```javascript
// Check if WebSocket is connected
performance.getEntriesByType('resource').filter(r => r.name.includes('graphql'))
```

### Check Subscription State
```javascript
// In React DevTools, find FormationSection component
// Check hooks state for subscription errors
```

### Server-Side Debugging
```javascript
// In server code, add more logs:
console.log('Mutation called with:', { gameId, positions });
console.log('Formation after populate:', formation);
console.log('Pubsub publish result:', pubsub.publish(...));
```

---

## 📝 Console Log Reference

### Frontend (Tab 1 - Creator)
```
✅ Formation created successfully!
✅ Formation updated successfully!
```

### Frontend (Tab 2 - Observer)
```
🔔 Formation created subscription received: {_id: '...', formationType: '4-3-3', ...}
🔔 Formation updated subscription received: {_id: '...', formationType: '4-3-3', ...}
🔔 Formation deleted subscription received
```

### Backend (Server)
```
📡 Publishing FORMATION_CREATED for gameId: 60a1b2c3d4e5f6g7h8i9j0k1
🔍 FORMATION_CREATED filter: {
  payloadGameId: '60a1b2c3d4e5f6g7h8i9j0k1',
  variableGameId: '60a1b2c3d4e5f6g7h8i9j0k1',
  match: true
}

📡 Publishing FORMATION_UPDATED for gameId: 60a1b2c3d4e5f6g7h8i9j0k1
🔍 FORMATION_UPDATED filter: {
  payloadGameId: '60a1b2c3d4e5f6g7h8i9j0k1',
  variableGameId: '60a1b2c3d4e5f6g7h8i9j0k1',
  match: true
}

📡 Publishing FORMATION_DELETED for gameId: 60a1b2c3d4e5f6g7h8i9j0k1
🔍 FORMATION_DELETED filter: {
  payloadGameId: '60a1b2c3d4e5f6g7h8i9j0k1',
  variableGameId: '60a1b2c3d4e5f6g7h8i9j0k1',
  match: true
}
```

---

## 🎯 Quick Fixes

### If nothing works:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart server** (stop and restart Node.js)
3. **Hard reload page** (Ctrl+Shift+R)
4. **Check different browsers** (Chrome, Firefox, Safari)
5. **Disable browser extensions** (ad blockers, etc.)

### If WebSocket won't connect:
1. Check server is running: `curl http://localhost:3001/graphql`
2. Check firewall settings
3. Try different port
4. Check nginx/proxy configuration (if any)

### If subscriptions timeout:
1. Increase WebSocket timeout in server config
2. Check network stability
3. Verify no proxy interference
4. Check server logs for disconnection messages

---

## ✅ Success Criteria

All of these should work:
1. ✅ Players persist after create/update
2. ✅ Success alerts appear
3. ✅ Real-time updates work across tabs
4. ✅ Console logs appear in all places
5. ✅ WebSocket connection stays active
6. ✅ No errors in console

---

## 📞 Still Not Working?

Provide these details:
1. **All console logs** (frontend Tab 1, Tab 2, and backend)
2. **WebSocket connection status** (from Network tab)
3. **Browser** and version
4. **Any error messages**
5. **Screenshots** of browser DevTools

---

**Last Updated**: January 2026
**Status**: Enhanced with debugging and error handling
