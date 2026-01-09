# Formation Real-Time: Quick Troubleshooting Card

## 🚨 Quick Diagnostics

### Problem: Create/Update doesn't work real-time

**Check Backend:**
```javascript
// server/schemas/gameResolvers.js - createFormation/updateFormation
console.log('📡 Publishing FORMATION_CREATED for gameId:', gameId);
pubsub.publish(FORMATION_CREATED, { 
  formationCreated: updatedFormation,
  gameId: gameId 
});
```

**Check Frontend:**
```javascript
// FormationSection - useSubscription callback
onSubscriptionData: ({ subscriptionData }) => {
  console.log('📥 FORMATION_CREATED raw subscription data:', subscriptionData);
  const created = subscriptionData.data?.formationCreated;
  if (created && created.game === gameId) {
    setFormation(created);
    setAssignments(/* extract from created.assignments */);
  }
}
```

**Fix:** Ensure backend publishes with `gameId` and frontend extracts assignments

---

### Problem: Delete doesn't work real-time

**Check Backend:**
```javascript
// server/schemas/gameResolvers.js - deleteFormation
pubsub.publish(FORMATION_DELETED, { 
  formationDeleted: gameId,  // ✅ Must be gameId, not formation._id
  gameId: gameId 
});
```

**Check Frontend:**
```javascript
// FormationSection - useSubscription callback
if (subscriptionData.data?.formationDeleted) {
  const deleted = subscriptionData.data.formationDeleted;
  if (deleted === gameId) {  // ✅ Compare with gameId
    setFormation(null);
    setAssignments({});
  }
}
```

**Fix:** Backend must send `formationDeleted: gameId`, not `formation._id`

---

### Problem: Players disappear after create/update

**Root Cause:** Not extracting assignments from backend response

**Fix in FormationSection:**
```javascript
const handleSubmitFormation = async () => {
  // ... mutation call ...
  
  if (formation?._id) {
    const result = await updateFormation({ /* ... */ });
    
    // ✅ Extract assignments from response
    if (result.data?.updateFormation?.assignments) {
      const newAssignments = {};
      result.data.updateFormation.assignments.forEach(a => {
        newAssignments[a.slot] = a.player;
      });
      setAssignments(newAssignments);
    }
  }
};
```

**Also Fix in Subscription:**
```javascript
onSubscriptionData: ({ subscriptionData }) => {
  const updated = subscriptionData.data?.formationUpdated;
  if (updated) {
    setFormation(updated);
    
    // ✅ Extract assignments from subscription
    if (updated.assignments) {
      const newAssignments = {};
      updated.assignments.forEach(a => {
        newAssignments[a.slot] = a.player;
      });
      setAssignments(newAssignments);
    }
  }
}
```

---

### Problem: Goalkeeper not showing

**Fix in FormationSection:**
```javascript
const rows = React.useMemo(() => {
  if (!formationType) return [];
  
  // ✅ Always include goalkeeper row (slot 0)
  const goalkeeperRow = { 
    rowIndex: -1, 
    slotIds: [0], 
    isGoalkeeper: true 
  };
  
  // Outfield rows
  const outfieldRows = formationType.split('-').map((count, idx) => ({
    rowIndex: idx,
    slotIds: Array.from({ length: parseInt(count) }, (_, i) => 
      outfieldRows.slice(0, idx).reduce((sum, r) => sum + r.slotIds.length, 0) + i + 1
    ),
    isGoalkeeper: false
  }));
  
  return [goalkeeperRow, ...outfieldRows];  // ✅ GK first
}, [formationType]);
```

---

### Problem: Multiple PubSub instances (no real-time)

**Root Cause:** Each file creates its own PubSub

**Fix:** Create shared instance

**1. Create `/server/pubsub.js`:**
```javascript
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
console.log('🎯 Shared PubSub instance created');
module.exports = pubsub;
```

**2. Update all files:**
```javascript
// ❌ OLD (creates separate instances)
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

// ✅ NEW (uses shared instance)
const pubsub = require("../pubsub");
```

**Files to update:**
- `/server/schemas/gameResolvers.js`
- `/server/schemas/resolvers.js`
- `/server/server.js`
- Any other files using PubSub

---

### Problem: Success alerts instead of popup

**Fix in FormationSection:**

**1. Add state:**
```javascript
const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
```

**2. Replace alert in handler:**
```javascript
const handleSubmitFormation = async () => {
  // ... mutation ...
  
  // ❌ OLD
  alert('Formation created successfully!');
  
  // ✅ NEW
  setSuccessMessage('Formation created successfully!');
  setShowSuccessPopup(true);
  setTimeout(() => setShowSuccessPopup(false), 3000);
};
```

**3. Add popup UI:**
```javascript
{showSuccessPopup && (
  <div style={{
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <span>✓ {successMessage}</span>
    <button onClick={() => setShowSuccessPopup(false)}>×</button>
  </div>
)}
```

---

### Problem: Subscription not firing at all

**Checklist:**
1. ✅ Server using shared PubSub instance?
2. ✅ WebSocket connection established? (DevTools → Network → WS)
3. ✅ Subscription variables match? (gameId/formationId)
4. ✅ withFilter returning true? (check server logs)
5. ✅ Frontend subscription not skipped? (`skip: !gameId`)

**Debug Commands:**

**Server:**
```javascript
// In subscription resolver
subscribe: withFilter(
  () => pubsub.asyncIterator([FORMATION_CREATED]),
  (payload, variables) => {
    console.log('🔍 FORMATION_CREATED filter:', {
      payloadGameId: payload.gameId,
      variableGameId: variables.gameId,
      match: payload.gameId === variables.gameId
    });
    return payload.gameId === variables.gameId;
  }
)
```

**Frontend:**
```javascript
useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
  variables: { gameId },
  skip: !gameId,
  onSubscriptionData: ({ subscriptionData }) => {
    console.log('📥 FORMATION_CREATED data:', subscriptionData);
  },
  onError: (error) => {
    console.error('❌ Subscription error:', error);
  }
});
```

---

## 🎯 Quick Fix Checklist

### For Create/Update Issues:
- [ ] Shared PubSub instance used everywhere
- [ ] Backend publishes with correct gameId
- [ ] Frontend extracts assignments from response
- [ ] Frontend extracts assignments from subscription
- [ ] Success popup (not alert) shown

### For Delete Issues:
- [ ] Backend sends `formationDeleted: gameId` (not formation._id)
- [ ] Frontend checks `deleted === gameId`
- [ ] Frontend clears formation and assignments
- [ ] Subscription filter matches gameId

### For Display Issues:
- [ ] Goalkeeper row always in `rows` useMemo
- [ ] Assignments state updated after all operations
- [ ] FormationBoard receives correct props
- [ ] Player dragging maintains assignments

### For Subscription Issues:
- [ ] Shared PubSub instance created
- [ ] All files import shared instance
- [ ] withFilter uses correct variables
- [ ] Frontend uses onSubscriptionData callback
- [ ] WebSocket connection active

---

## 🔧 Emergency Reset

If nothing works:

**1. Restart Server:**
```bash
cd server && node server.js
```

**2. Clear Browser Cache:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or: DevTools → Application → Clear storage

**3. Check All PubSub Files:**
```bash
grep -r "new PubSub()" server/
# Should only show: server/pubsub.js
```

**4. Verify Imports:**
```bash
grep -r "require.*pubsub" server/
# All should import from ../pubsub or ./pubsub
```

---

## 📊 Expected Console Output

### Server (Working):
```
🎯 Shared PubSub instance created
🚀 Server running on port 3001
📡 Publishing FORMATION_CREATED for gameId: 123
🔍 FORMATION_CREATED filter result: { match: true }
```

### Server (Broken):
```
🚀 Server running on port 3001
(No publishing logs - PubSub not shared)
```

### Browser (Working):
```
📥 FORMATION_CREATED raw subscription data: { data: {...} }
🔔 Formation created subscription received: {...}
✅ Formation created successfully
```

### Browser (Broken):
```
(No subscription logs - WebSocket issue or filter mismatch)
```

---

## 🚀 Test One Feature Quickly

```bash
# 1. Start server
cd server && node server.js

# 2. Open two tabs
# Tab 1: http://localhost:3000/game/[gameId]
# Tab 2: http://localhost:3000/game/[gameId]

# 3. In Tab 1: Create formation
# 4. In Tab 2: Should see formation instantly

# 5. Check server logs for:
📡 Publishing FORMATION_CREATED
🔍 FORMATION_CREATED filter result: { match: true }

# 6. Check Tab 2 console for:
📥 FORMATION_CREATED raw subscription data
```

---

## 📁 Files to Check

### Backend:
- `/server/pubsub.js` - Shared PubSub instance
- `/server/schemas/gameResolvers.js` - Mutations (publish events)
- `/server/schemas/resolvers.js` - Subscription resolvers (filters)
- `/server/server.js` - Apollo Server setup

### Frontend:
- `/client/src/components/FormationSection/index.jsx` - Main component
- `/client/src/utils/subscription.jsx` - Subscription queries
- `/client/src/utils/mutations.jsx` - Mutation queries

### Documentation:
- `FORMATION_REALTIME_FINAL_VERIFICATION.md` - Complete test guide
- `PUBSUB_SHARED_INSTANCE_FIX.md` - PubSub setup
- `FORMATION_DELETE_REALTIME_FIX.md` - Delete fix details

---

**Use this card for quick diagnosis and fixes!**
