# 🎯 Quick Testing Guide - Admin Game & Formation Access

## 🚀 Quick Test Scenarios

### Scenario 1: Owner Tests Full Access
**User Role:** Organization Owner

**Test Steps:**
1. Navigate to "Game Schedule" or "My Games"
2. Find a game created by another member
3. Click on the game to view details
4. ✅ Verify you see "Edit Game" button
5. ✅ Click "Edit Game" and verify you can modify game details
6. ✅ Verify you see "Cancel Game", "Confirm Game", "Complete Game" buttons
7. ✅ Navigate to Formation section
8. ✅ Verify you can create/update/delete formations
9. ✅ Test drag & drop functionality for player assignments

**Expected Result:** Full access to all game and formation management features

---

### Scenario 2: Admin Tests Full Access
**User Role:** Organization Admin

**Test Steps:**
1. Login as a user with admin role
2. Navigate to "Game Schedule"
3. Find a game created by another member or owner
4. Click on the game to view details
5. ✅ Verify you see "Edit Game" button
6. ✅ Click "Edit Game" and verify you can modify game details
7. ✅ Verify you see "Cancel Game", "Confirm Game", "Complete Game" buttons
8. ✅ Navigate to Formation section
9. ✅ Verify you can create/update/delete formations
10. ✅ Test all game management operations

**Expected Result:** Same full access as organization owner

---

### Scenario 3: Creator Tests Own Game Access
**User Role:** Regular Member (Game Creator)

**Test Steps:**
1. Login as regular member
2. Navigate to your created game
3. ✅ Verify you see "Edit Game" button for your own game
4. ✅ Verify you can manage your own game (cancel, confirm, complete)
5. ✅ Verify you can manage formations for your own game
6. Navigate to another member's game
7. ❌ Verify you do NOT see "Edit Game" button
8. ❌ Verify you cannot access game update page (redirected)
9. ❌ Verify you cannot manage formations for others' games

**Expected Result:** Full access to own games, view-only for others' games

---

### Scenario 4: Member Tests Read-Only Access
**User Role:** Regular Member (Non-Creator)

**Test Steps:**
1. Login as regular member
2. Navigate to "Game Schedule"
3. Find a game created by someone else
4. Click on the game to view details
5. ❌ Verify you do NOT see "Edit Game" button
6. ❌ Verify you do NOT see formation create/update/delete buttons
7. ✅ Verify you can view formation if one exists
8. ✅ Verify you can vote (Available/Unavailable)
9. ✅ Verify you can leave feedback after game completion
10. Try to access `/game-update/{gameId}` directly
11. ❌ Verify you're redirected to game schedule

**Expected Result:** View and vote access only, no management features

---

## 🔍 Quick Visual Checks

### Admin/Owner Viewing Any Game:
```
✅ [Edit Game] button visible
✅ [Cancel Game] button visible (if applicable)
✅ [Confirm Game] button visible (if applicable)
✅ [Complete Game] button visible (if applicable)
✅ [Delete Game] option available
✅ Formation section shows create/update options
✅ Formation drag & drop enabled
```

### Creator Viewing Own Game:
```
✅ [Edit Game] button visible
✅ [Cancel Game] button visible (if applicable)
✅ [Confirm Game] button visible (if applicable)
✅ [Complete Game] button visible (if applicable)
✅ [Delete Game] option available
✅ Formation section shows create/update options
✅ Formation drag & drop enabled
```

### Member Viewing Others' Game:
```
❌ [Edit Game] button NOT visible
❌ [Cancel Game] button NOT visible
❌ [Confirm Game] button NOT visible
❌ [Complete Game] button NOT visible
❌ [Delete Game] option NOT available
❌ Formation create/update options NOT visible
❌ Formation drag & drop disabled
✅ Can vote Available/Unavailable
✅ Can view formations
✅ Can leave feedback (after completion)
```

---

## 🧪 Formation Section Tests

### Admin/Owner Permissions:
1. **No Formation Exists:**
   - ✅ See formation type selector dropdown
   - ✅ Can select formation type (1-4-3-3, etc.)
   - ✅ See "Create Formation" button

2. **Formation Exists:**
   - ✅ See available players list
   - ✅ Can drag players to positions
   - ✅ See "Update Formation" button
   - ✅ See "Delete Formation" button
   - ✅ Get success messages after updates

3. **Real-time Updates:**
   - ✅ Formation updates appear instantly
   - ✅ Subscriptions work correctly
   - ✅ No page refresh needed

### Member Permissions:
1. **No Formation Exists:**
   - ❌ Do NOT see formation type selector
   - ❌ Do NOT see create option
   - ✅ See message "Formation is being prepared..."

2. **Formation Exists:**
   - ✅ Can view formation
   - ❌ Cannot drag players
   - ❌ Do NOT see update/delete buttons
   - ✅ Can like formation
   - ✅ Can comment on formation

---

## 🎯 Critical Test Points

### Permission Boundaries:
- [ ] Non-admin member cannot access `/game-update/{gameId}` for others' games
- [ ] Navigation guards redirect unauthorized users
- [ ] Edit buttons only appear for authorized users
- [ ] Formation drag & drop only works for authorized users

### Data Integrity:
- [ ] Admins can modify games without breaking data
- [ ] Formation updates save correctly
- [ ] Real-time subscriptions deliver updates to all users
- [ ] organizationId is passed with all mutations

### UI/UX:
- [ ] Admin tools are clearly visible
- [ ] Success messages appear after operations
- [ ] Error handling works correctly
- [ ] Dark mode works for all admin features
- [ ] Responsive design works on mobile/tablet

---

## 🐛 Common Issues to Watch For

1. **Permission Check Failures:**
   - If admin tools don't appear, check browser console for errors
   - Verify QUERY_ME returns admins field
   - Check if user is actually in admins array

2. **Formation Updates:**
   - If drag & drop doesn't work, verify isCreator logic
   - Check organizationId is passed to mutations
   - Verify subscriptions are working

3. **Navigation Guards:**
   - If redirects fail, check useEffect dependencies
   - Verify isOrganizationAdmin is included in permission checks

---

## 📱 Device-Specific Tests

### Desktop:
- [ ] All buttons visible and clickable
- [ ] Drag & drop works smoothly
- [ ] Modals display correctly
- [ ] Admin panel fully functional

### Tablet:
- [ ] Touch interactions work for drag & drop
- [ ] Buttons are appropriately sized
- [ ] Responsive layout adapts correctly
- [ ] No UI overlap or cutoff

### Mobile:
- [ ] Touch sensors work for formations
- [ ] Buttons are easily tappable
- [ ] Modals fit screen properly
- [ ] Navigation is smooth

---

## ✅ Quick Success Indicators

If everything is working correctly, you should see:

1. **Console Logs:**
   ```
   ✅ User IS the creator or admin, staying on page
   🎮 FormationSection Debug: { isCreator: true, ... }
   Permission check: { isOrganizationAdmin: true, isCreator: true }
   ```

2. **UI Elements:**
   - Admin buttons visible for all games
   - Formation tools enabled
   - Success messages after operations
   - Real-time updates without refresh

3. **No Errors:**
   - No GraphQL 400 errors
   - No permission denied errors
   - No navigation issues
   - No console errors

---

## 🚨 Report Issues

If you find any issues during testing, please document:
- **User Role:** (Owner/Admin/Creator/Member)
- **Action Attempted:** (e.g., "Tried to edit game")
- **Expected Result:** (e.g., "Should see edit button")
- **Actual Result:** (e.g., "No edit button visible")
- **Browser Console Errors:** (Copy any error messages)
- **Steps to Reproduce:** (List exact steps)

---

**Last Updated:** January 9, 2026
**Test Priority:** 🔴 High - Core Functionality
