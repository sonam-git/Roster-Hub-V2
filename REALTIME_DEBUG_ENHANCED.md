# Real-Time Debugging - Enhanced Server Logs

## 🔍 New Server Logging Added

### What to Look For in Server Console

When you create a formation, you should now see these logs:

```
📡 Publishing FORMATION_CREATED for gameId: 6961255ef57c34d3784ca814

🔍 Formation.game after populate: {
  hasGame: true,
  gameId: '6961255ef57c34d3784ca814',
  gameType: 'object'
}

🔍 FORMATION_CREATED filter called with: {
  hasPayload: true,
  hasFormationCreated: true,
  hasGame: true,
  payloadGameId: '6961255ef57c34d3784ca814',
  payloadGameType: 'object',
  variableGameId: '6961255ef57c34d3784ca814',
  variablesKeys: ['gameId']
}

🔍 FORMATION_CREATED filter result: { match: true }
```

---

## 🧪 Test Again with Enhanced Logging

### Step 1: Restart Server
```bash
cd server && node server.js
```

### Step 2: Open 2 Browser Tabs
- **Tab 1**: Creator (makes changes)
- **Tab 2**: Observer (watches for updates)
- Both on: `/game/6961255ef57c34d3784ca814`

### Step 3: Create Formation in Tab 1

**Tab 1 Actions:**
1. Select formation (e.g., "1-4-3-3")
2. Drag players to positions
3. Click "Create Formation"

---

## 📊 Expected Logs

### Server Console (Most Important!):

**1. Publishing Event:**
```
📡 Publishing FORMATION_CREATED for gameId: 6961255ef57c34d3784ca814
```

**2. Formation Structure:**
```
🔍 Formation.game after populate: {
  hasGame: true,
  gameId: '6961255ef57c34d3784ca814',
  gameType: 'object'
}
```

**3. Filter Called (THIS IS KEY!):**
```
🔍 FORMATION_CREATED filter called with: {
  hasPayload: true,
  hasFormationCreated: true,
  hasGame: true,
  payloadGameId: '6961255ef57c34d3784ca814',
  payloadGameType: 'object',
  variableGameId: '6961255ef57c34d3784ca814',
  variablesKeys: ['gameId']
}
```

**4. Filter Result:**
```
🔍 FORMATION_CREATED filter result: { match: true }
```

### Tab 2 Console (Frontend):

**Should see:**
```
🔗 Setting up subscriptions for gameId: 6961255ef57c34d3784ca814
📥 FORMATION_CREATED raw subscription data: {...}
🔔 Formation created subscription received: {...}
```

---

## 🐛 Troubleshooting Based on Server Logs

### Scenario 1: Filter NOT Called
**Server shows:**
```
📡 Publishing FORMATION_CREATED for gameId: 6961255ef57c34d3784ca814
🔍 Formation.game after populate: {...}
```
**BUT NO `🔍 FORMATION_CREATED filter called` message**

**Problem**: No subscriptions active or pubsub not working
**Fix**: 
- Check if Tab 2 has subscription active
- Check server WebSocket connections
- Restart server

### Scenario 2: Filter Called but match: false
**Server shows:**
```
🔍 FORMATION_CREATED filter called with: {
  payloadGameId: '6961255ef57c34d3784ca814',
  variableGameId: '5961255ef57c34d3784ca814',  ← Different!
  ...
}
🔍 FORMATION_CREATED filter result: { match: false }
```

**Problem**: GameId mismatch between tabs
**Fix**: 
- Verify both tabs on same game URL
- Check gameId in Tab 2 console logs

### Scenario 3: formation.game is undefined
**Server shows:**
```
🔍 Formation.game after populate: {
  hasGame: false,
  gameId: undefined,
  gameType: 'undefined'
}
```

**Problem**: Formation not properly linked to game
**Fix**: 
- Check Formation model has `game` field
- Verify game ID is valid
- Check database for formation document

### Scenario 4: Filter Called, match: true, but no frontend log
**Server shows:**
```
🔍 FORMATION_CREATED filter result: { match: true }
```

**Tab 2 shows:**
```
🔗 Setting up subscriptions for gameId: 6961255ef57c34d3784ca814
```
**BUT NO `📥 FORMATION_CREATED raw subscription data`**

**Problem**: WebSocket not delivering data to frontend
**Fix**:
- Check WebSocket connection in Network tab
- Check for WebSocket errors in console
- Verify `onSubscriptionData` callback exists
- Check Apollo Client configuration

---

## 📋 Diagnostic Checklist

### Server Logs (After Create Formation):
- [ ] `📡 Publishing FORMATION_CREATED` appears
- [ ] `🔍 Formation.game after populate` shows `hasGame: true`
- [ ] `🔍 Formation.game after populate` shows correct `gameId`
- [ ] `🔍 FORMATION_CREATED filter called` appears
- [ ] `payloadGameId` matches `variableGameId`
- [ ] `🔍 FORMATION_CREATED filter result: { match: true }`

### Tab 2 Console Logs:
- [ ] `🔗 Setting up subscriptions` appears
- [ ] `📥 FORMATION_CREATED raw subscription data` appears
- [ ] `🔔 Formation created subscription received` appears

### Tab 2 UI:
- [ ] Formation appears on the page
- [ ] Players are visible
- [ ] Goalkeeper shown in first row

---

## 🎯 What Each Log Tells Us

### `📡 Publishing FORMATION_CREATED`
✅ **Good**: Backend mutation completed successfully  
❌ **Missing**: Mutation failed or didn't complete

### `🔍 Formation.game after populate`
✅ **Good**: `hasGame: true, gameId: '[correct-id]'`  
❌ **Bad**: `hasGame: false` or `gameId: undefined`

### `🔍 FORMATION_CREATED filter called`
✅ **Good**: Filter is being executed (subscription active)  
❌ **Missing**: No active subscriptions or pubsub issue

### `🔍 FORMATION_CREATED filter result: { match: true }`
✅ **Good**: Filter passed, data should be sent to client  
❌ **Bad**: `match: false` means gameId mismatch

### `📥 FORMATION_CREATED raw subscription data` (Tab 2)
✅ **Good**: Frontend received WebSocket data  
❌ **Missing**: WebSocket not delivering or frontend not subscribed

---

## 🔧 Quick Fixes

### If filter never called:
```bash
# Restart server
cd server && node server.js

# Hard reload both tabs
Ctrl+Shift+R
```

### If match: false:
- Check both tabs have same gameId in URL
- Check Tab 2 console for correct gameId
- Verify no typos in game URL

### If filter passes but Tab 2 doesn't receive:
- Check Network tab → WS → Messages
- Look for JSON message with formation data
- Check for WebSocket errors

---

## 🚀 Test Now!

1. **Restart server** to load new logs
2. **Open 2 tabs** on same game
3. **Create formation** in Tab 1
4. **Check server console** for all 4 log types
5. **Report back** what you see!

---

**Key Question**: Does the server console show `🔍 FORMATION_CREATED filter called`?
- **Yes + match: true** = WebSocket issue
- **Yes + match: false** = GameId mismatch
- **No** = Subscription not active

Let me know what you see! 🔍
