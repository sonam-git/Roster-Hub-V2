# Real-Time Subscription Fix - onSubscriptionData Pattern

## ✅ Changes Made

### Switched from useEffect Pattern to onSubscriptionData

**Before (useEffect pattern):**
```javascript
const { data: createdData } = useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
  variables: { gameId },
});

useEffect(() => {
  if (createdData?.formationCreated) {
    // Handle data
  }
}, [createdData]);
```

**After (onSubscriptionData pattern):**
```javascript
useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
  variables: { gameId },
  skip: !gameId,
  onSubscriptionData: ({ subscriptionData }) => {
    console.log('📥 Raw subscription data:', subscriptionData);
    if (subscriptionData.data?.formationCreated) {
      // Handle data immediately
    }
  },
  onError: (error) => {
    console.error('❌ Subscription error:', error);
  },
});
```

### Why This Should Work Better

1. **Immediate callback**: Data is processed as soon as it arrives
2. **No dependency issues**: No useEffect dependency array problems
3. **Standard pattern**: Uses Apollo Client's recommended subscription callback
4. **Better debugging**: Logs raw subscription data before processing

---

## 🧪 Testing Real-Time (2 Tabs)

### Setup:
1. **Tab 1**: Creator (makes changes) - Open console (F12)
2. **Tab 2**: Observer (watches updates) - Open console (F12)
3. Both on same game page: `/game/6961255ef57c34d3784ca814`

### Test Create Formation:

**Tab 1 Actions:**
1. Select formation type (e.g., "1-4-3-3")
2. Drag players to positions
3. Click "Create Formation"

**Tab 1 Console - Should show:**
```
🔗 Setting up subscriptions for gameId: 6961255ef57c34d3784ca814
✅ Formation created successfully!
```

**Tab 2 Console - Should show:**
```
🔗 Setting up subscriptions for gameId: 6961255ef57c34d3784ca814
📥 FORMATION_CREATED raw subscription data: {
  data: {
    formationCreated: {
      _id: "...",
      formationType: "4-3-3",
      positions: [...]
    }
  }
}
🔔 Formation created subscription received: {_id: "...", ...}
```

**Tab 2 UI - Should show:**
- Formation appears instantly
- All players visible on formation board
- Goalkeeper in first row

### Test Update Formation:

**Tab 1 Actions:**
1. Change player positions (drag different players)
2. Click "Update Formation"

**Tab 1 Console:**
```
✅ Formation updated successfully!
```

**Tab 2 Console:**
```
📥 FORMATION_UPDATED raw subscription data: {...}
🔔 Formation updated subscription received: {...}
```

**Tab 2 UI:**
- Formation updates instantly
- New player positions visible
- No page refresh needed

---

## 🔍 Debugging Console Logs

### When Subscription is Active:
```
🔗 Setting up subscriptions for gameId: 6961255ef57c34d3784ca814
```

### When Data Arrives:
```
📥 FORMATION_CREATED raw subscription data: {
  data: { formationCreated: {...} },
  loading: false,
  error: undefined
}
🔔 Formation created subscription received: {_id: "...", ...}
```

### If Error Occurs:
```
❌ Formation created subscription error: Error: [details]
```

### Server Console:
```
📡 Publishing FORMATION_CREATED for gameId: 6961255ef57c34d3784ca814
🔍 FORMATION_CREATED filter: {
  payloadGameId: '6961255ef57c34d3784ca814',
  variableGameId: '6961255ef57c34d3784ca814',
  match: true
}
```

---

## 🐛 If Still Not Working

### Check 1: WebSocket Connection
**Tab 2 → DevTools → Network → WS**
- Should see: `ws://localhost:3001/graphql`
- Status: 101 Switching Protocols (green)
- Messages tab should show:
  ```json
  {"type":"connection_init"}
  {"type":"connection_ack"}
  {"type":"subscribe","payload":{"query":"subscription formationCreated..."}}
  ```

### Check 2: Subscription Setup Log
**Tab 2 Console should show:**
```
🔗 Setting up subscriptions for gameId: 6961255ef57c34d3784ca814
```
- If missing: Component not mounting or gameId undefined
- If gameId is wrong: Check URL or game state

### Check 3: Raw Subscription Data
**Tab 2 Console should show after Tab 1 creates formation:**
```
📥 FORMATION_CREATED raw subscription data: {...}
```
- If missing: Subscription not receiving data
- Check server is publishing
- Check WebSocket connection

### Check 4: Server Publishing
**Server Console should show when Tab 1 creates:**
```
📡 Publishing FORMATION_CREATED for gameId: 6961255ef57c34d3784ca814
🔍 FORMATION_CREATED filter: { match: true }
```
- If missing: Mutation not completing
- If match: false - gameId mismatch

---

## 📋 Quick Checklist

### Before Testing:
- [ ] Server is running (`cd server && node server.js`)
- [ ] Two browser tabs/windows open
- [ ] Both tabs on same game page
- [ ] Console open (F12) in both tabs
- [ ] Logged in as different users (or same user, different browser)

### Tab 1 (Creator):
- [ ] Can select formation type
- [ ] Can drag players to positions
- [ ] "Create Formation" button works
- [ ] Green success popup appears
- [ ] Console shows: `✅ Formation created successfully!`

### Tab 2 (Observer):
- [ ] Console shows: `🔗 Setting up subscriptions for gameId: [id]`
- [ ] Console shows: `📥 FORMATION_CREATED raw subscription data`
- [ ] Console shows: `🔔 Formation created subscription received`
- [ ] Formation appears on UI instantly
- [ ] Players are visible on formation board

### Server:
- [ ] Console shows: `📡 Publishing FORMATION_CREATED`
- [ ] Console shows: `🔍 FORMATION_CREATED filter: { match: true }`

---

## 🎯 Expected Behavior

### Subscription Flow:
1. **Tab 1**: User creates formation
2. **Backend**: Saves to database
3. **Backend**: Publishes `FORMATION_CREATED` event via pubsub
4. **WebSocket**: Broadcasts event to all connected clients
5. **Tab 2**: Receives event via WebSocket
6. **Tab 2**: `onSubscriptionData` callback fires
7. **Tab 2**: Logs `📥 FORMATION_CREATED raw subscription data`
8. **Tab 2**: Updates UI with new formation
9. **Tab 2**: Logs `🔔 Formation created subscription received`

### Success Indicators:
- ✅ Green popup in Tab 1
- ✅ Console logs in Tab 2
- ✅ UI updates in Tab 2 instantly
- ✅ No page refresh needed
- ✅ Players persist in both tabs

---

## 🔧 Additional Debugging

### Enable Verbose Logging
Add to subscription:
```javascript
onSubscriptionData: ({ subscriptionData, client }) => {
  console.log('🔍 Full subscription context:', {
    data: subscriptionData.data,
    loading: subscriptionData.loading,
    error: subscriptionData.error,
    client: client ? 'Connected' : 'Disconnected'
  });
}
```

### Check WebSocket Messages
1. DevTools → Network → WS tab
2. Click on WebSocket connection
3. Go to "Messages" sub-tab
4. Look for messages after creating formation
5. Should see JSON message with formation data

### Test WebSocket Connection
In Tab 2 console:
```javascript
// Check if WebSocket is active
console.log('WebSocket connections:', 
  performance.getEntriesByType('resource')
    .filter(r => r.name.includes('graphql'))
);
```

---

## ✅ What Changed

**File**: `/client/src/components/FormationSection/index.jsx`

1. **Removed**: `useEffect` pattern with separate data variables
2. **Added**: Direct `onSubscriptionData` callback
3. **Added**: More detailed logging (`📥 Raw subscription data`)
4. **Added**: Subscription setup log (`🔗 Setting up subscriptions`)
5. **Kept**: Error handling with `onError`
6. **Kept**: `skip: !gameId` to prevent unnecessary subscriptions

---

## 🚀 Ready to Test!

1. **Restart server** (to ensure all backend logs active)
2. **Hard reload both tabs** (Ctrl+Shift+R)
3. **Check console logs** appear in both tabs
4. **Create formation in Tab 1**
5. **Watch Tab 2 console** for subscription logs
6. **Verify Tab 2 UI** updates instantly

**If you see the logs but UI doesn't update, there may be an issue with `setFormation` or state management. Let me know what console logs you see!**

---

**Last Updated**: January 2026  
**Pattern**: `onSubscriptionData` callback (recommended Apollo Client pattern)  
**Status**: Ready for testing ✅
