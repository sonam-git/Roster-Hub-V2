# Quick Test: Admin Access for Games & Formations 🧪

## Test Setup (5 minutes)

### Prerequisites
- ✅ Server running
- ✅ Frontend running
- ✅ Organization with multiple members
- ✅ At least one game created

### Create Test Scenario
```javascript
// In MongoDB, add a user as admin:
db.organizations.updateOne(
  { _id: ObjectId("YOUR_ORG_ID") },
  { $addToSet: { admins: ObjectId("TEST_USER_ID") } }
)
```

## Test Cases

### 1️⃣ Admin Can Update Any Game (2 min)

**Steps:**
1. Login as admin (not game creator)
2. Go to "All Games" or "My Games"
3. Find a game created by someone else
4. Click "Edit" button (should be visible ✅)
5. Change game details (date, time, location)
6. Click "Update Game"

**Expected Result:**
- ✅ Edit button is visible
- ✅ Can access game update page
- ✅ Can save changes successfully
- ✅ No "Only the game creator..." error
- ✅ Success message shows

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 2️⃣ Admin Can Manage Game Status (2 min)

**Steps:**
1. Login as admin
2. Open game details for any game
3. Try each action:
   - Confirm game
   - Cancel game
   - Complete game (with score)

**Expected Result:**
- ✅ All action buttons visible
- ✅ Can perform all actions
- ✅ Status updates correctly
- ✅ No authentication errors

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 3️⃣ Admin Can Create Formation (2 min)

**Steps:**
1. Login as admin
2. Open game created by someone else
3. Scroll to Formation section
4. Select formation type (e.g., "1-4-3-3")
5. Click "Create Formation"

**Expected Result:**
- ✅ Formation type selector visible
- ✅ Can create formation successfully
- ✅ Formation board appears
- ✅ No "Only the game creator..." error

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 4️⃣ Admin Can Update Formation (2 min)

**Steps:**
1. Login as admin
2. Open game with existing formation (created by someone else)
3. Drag player to position
4. Click "Update Formation"

**Expected Result:**
- ✅ Can see formation board
- ✅ Can drag players
- ✅ Update button works
- ✅ Players appear in positions
- ✅ Success message shows

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 5️⃣ Admin Can Delete Formation (1 min)

**Steps:**
1. Login as admin
2. Open game with formation
3. Click "Delete Formation"
4. Confirm deletion

**Expected Result:**
- ✅ Delete button visible
- ✅ Confirmation modal appears
- ✅ Formation deleted successfully
- ✅ Formation section updates

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 6️⃣ Admin Can Delete Game (1 min)

**Steps:**
1. Login as admin
2. Go to game created by someone else
3. Click "Delete" button
4. Confirm deletion

**Expected Result:**
- ✅ Delete button visible
- ✅ Confirmation modal appears
- ✅ Game deleted successfully
- ✅ Redirected after deletion

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 7️⃣ Owner Has Same Access (2 min)

**Steps:**
1. Login as organization owner
2. Try updating someone else's game
3. Try managing formations

**Expected Result:**
- ✅ Owner has full access like admin
- ✅ All buttons visible
- ✅ All actions work

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 8️⃣ Regular Member Cannot Manage (2 min)

**Steps:**
1. Login as regular member (not owner, not admin, not creator)
2. Go to someone else's game
3. Check for edit/delete buttons

**Expected Result:**
- ❌ No edit button visible
- ❌ No delete button visible
- ❌ No formation creation option
- ❌ Cannot access update page directly
- ✅ Can still vote on game
- ✅ Can view game details

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

### 9️⃣ Game Creator Still Has Access (1 min)

**Steps:**
1. Login as game creator
2. Open your own game
3. Verify you can still manage it

**Expected Result:**
- ✅ Edit/delete buttons visible
- ✅ Can update game
- ✅ Can manage formations
- ✅ Same access as before

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe):

---

## Quick Checks

### UI Elements (Check in browser)
```
GameDetails:
[ ] Edit button shows for admin
[ ] Delete button shows for admin
[ ] Formation creation shows for admin

GameList:
[ ] Action menu shows for admin
[ ] Edit option visible
[ ] Delete option visible

MyGames:
[ ] Admin sees all games
[ ] Action buttons on all games
[ ] Can manage any game

GameUpdatePage:
[ ] Admin can access for any game
[ ] No redirect/error for admin
[ ] Form is editable
```

### Server Logs (Check terminal)
```
When admin updates game:
[ ] No "Only the game creator..." error
[ ] Mutation succeeds
[ ] No authentication errors

When admin creates formation:
[ ] No permission error
[ ] Formation created successfully
[ ] Subscription published
```

### Database (Check MongoDB)
```
After admin updates game:
[ ] Game document updated
[ ] Updated fields correct
[ ] Game still in organization

After admin creates formation:
[ ] Formation document created
[ ] Linked to correct game
[ ] organizationId correct
```

## Common Issues & Fixes

### ❌ "Only the game creator can..." error
**Cause:** Server not updated or not restarted
**Fix:**
```bash
# Stop server (Ctrl+C)
cd server
node server.js  # Restart
```

### ❌ Admin buttons not showing
**Cause:** Frontend not updated or cache issue
**Fix:**
- Hard refresh browser (Cmd+Shift+R)
- Clear browser cache
- Check QUERY_ME includes admins field

### ❌ User not recognized as admin
**Cause:** Not added to organization.admins array
**Fix:**
```javascript
// In MongoDB:
db.organizations.findOne({ _id: ObjectId("ORG_ID") })
// Check if user ID is in admins array

// If not, add:
db.organizations.updateOne(
  { _id: ObjectId("ORG_ID") },
  { $addToSet: { admins: ObjectId("USER_ID") } }
)
```

## Performance Tests

### Load Test (Optional)
```
Test with:
- [ ] 10 games
- [ ] 50 games
- [ ] 100 games

Check:
- [ ] Permission checks fast (<100ms)
- [ ] UI responsive
- [ ] No lag when loading games
```

## Browser Tests

Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Test Results Summary

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| 1. Update Game | | | |
| 2. Manage Status | | | |
| 3. Create Formation | | | |
| 4. Update Formation | | | |
| 5. Delete Formation | | | |
| 6. Delete Game | | | |
| 7. Owner Access | | | |
| 8. Member Restriction | | | |
| 9. Creator Access | | | |

**Total:** __/9 Passed

## Sign-Off

**Tester:** _______________  
**Date:** _______________  
**Version:** 1.0.0  
**Environment:** Production / Staging / Development  

**Overall Status:** ☐ PASS ☐ FAIL

**Notes:**
```
Add any additional observations or issues here
```

---

**Next Steps After Testing:**
1. ✅ All tests pass → Deploy to production
2. ⚠️ Some issues → Fix and retest
3. ❌ Major issues → Review implementation

**Related Docs:**
- `ADMIN_FULL_ACCESS_COMPLETE.md` - Implementation details
- `ADMIN_PANEL_COMPLETE_SUMMARY.md` - Admin panel features
