# Chat Mobile Modal - Testing Guide

## Quick Test Checklist

### ✅ Mobile View Testing (< 976px width)

#### 1. Opening the Chat
- [ ] Click the floating chat button (bottom right)
- [ ] Modal should slide up from bottom with smooth animation
- [ ] Backdrop should fade in with dark overlay
- [ ] Modal should cover entire screen
- [ ] No content should be visible under the header
- [ ] Body scroll should be disabled

#### 2. User List View
- [ ] See list of team members
- [ ] User avatars display correctly
- [ ] Online/offline status indicators work
- [ ] Notification badges show on users with unread messages
- [ ] Can scroll user list if many users
- [ ] Clicking a user opens their chat

#### 3. Chat View
- [ ] Back button returns to user list
- [ ] User name and status display in header
- [ ] Messages display correctly with proper styling
- [ ] Message bubbles align correctly (sent right, received left)
- [ ] Timestamps show properly
- [ ] Can scroll through message history
- [ ] Message input field is accessible
- [ ] Send button works
- [ ] Delete conversation button present

#### 4. Closing the Chat
- [ ] Clicking X button closes modal
- [ ] Clicking backdrop (dark area) closes modal
- [ ] Modal slides down smoothly
- [ ] Body scroll is re-enabled
- [ ] Chat button remains visible

#### 5. Dark Mode
- [ ] Test all above in dark mode
- [ ] Colors and contrast are appropriate
- [ ] All text is readable
- [ ] Backdrop is darker in dark mode

### ✅ Desktop View Testing (>= 976px width)

#### 1. Chat Button & Header
- [ ] Full chat header visible in bottom-right
- [ ] Shows "ChatBox" title
- [ ] Notification badge displays if there are new messages
- [ ] Chevron icon indicates expand/collapse state

#### 2. Opening/Closing
- [ ] Clicking header toggles chat open/closed
- [ ] Chat expands upward from bottom-right
- [ ] Chat has fixed height (500px)
- [ ] Chat has fixed width (320px)
- [ ] Chat doesn't cover important content

#### 3. Functionality
- [ ] User list displays
- [ ] Can select users and chat
- [ ] Messages display correctly
- [ ] All chat features work as before
- [ ] No regression in existing functionality

### ✅ Responsive Breakpoint Testing

#### At 976px (lg breakpoint)
- [ ] Resize browser to cross the 976px breakpoint
- [ ] Below 976px: Modal view activates
- [ ] Above 976px: Popup view activates
- [ ] Transition is smooth (may need to close/reopen chat)
- [ ] No visual glitches during transition

### ✅ Edge Cases

#### 1. No Internet Connection
- [ ] Chat handles connection errors gracefully
- [ ] Error messages display properly in modal
- [ ] Can still close the modal

#### 2. Long Messages
- [ ] Long messages wrap correctly
- [ ] Don't break layout in mobile modal
- [ ] Scrolling works as expected

#### 3. Many Messages
- [ ] Can scroll through long message history
- [ ] Auto-scroll to bottom on new message
- [ ] Performance remains smooth

#### 4. Many Users
- [ ] User list scrolls if many users
- [ ] Performance remains good
- [ ] Search/filter works if implemented

#### 5. Notifications
- [ ] Badge counts update correctly
- [ ] Clicking user clears their notification
- [ ] Notifications persist across refreshes

### ✅ Accessibility Testing

#### Keyboard Navigation
- [ ] Can tab to chat button
- [ ] Enter key opens chat
- [ ] Can tab through user list
- [ ] Enter key selects user
- [ ] Can tab to message input
- [ ] Enter key sends message
- [ ] Escape key closes modal (if implemented)

#### Screen Reader
- [ ] Chat button has proper aria-label
- [ ] Modal has proper role
- [ ] Close button is announced
- [ ] User list items are accessible

### ✅ Cross-Browser Testing

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile Safari (iPhone)
- [ ] Chrome Mobile (Android)

### ✅ Performance Testing

- [ ] Modal opens quickly (< 300ms)
- [ ] Animations are smooth (60fps)
- [ ] No lag when typing
- [ ] No lag when scrolling messages
- [ ] No memory leaks after opening/closing multiple times

## Testing Tools

### Browser DevTools
```javascript
// Test mobile view in Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device or set custom width < 976px
4. Test the chat functionality

// Force dark mode
document.documentElement.classList.add('dark')

// Check if portal root exists
document.getElementById('chat-portal-root')

// Check body overflow when modal is open
getComputedStyle(document.body).overflow // Should be 'hidden' when modal open
```

### Manual Resize Test
```
1. Open app in browser
2. Open chat
3. Slowly resize browser from wide to narrow
4. Observe behavior at 976px breakpoint
5. Close and reopen chat at different sizes
```

## Known Issues to Watch For

### Potential Issues
1. **Body scroll re-enabling**: Ensure body scroll is restored when modal closes
2. **Z-index conflicts**: Verify nothing appears above the modal (z-99999)
3. **Animation performance**: Watch for janky animations on slower devices
4. **Touch scrolling**: Ensure smooth touch scrolling on mobile
5. **Keyboard visibility**: Modal should adjust for mobile keyboard

### Quick Fixes if Issues Found

#### Issue: Body still scrolls with modal open
```javascript
// Check ChatPortal useEffect is running
// Verify overflow: hidden is applied to body
```

#### Issue: Modal appears under header
```javascript
// Verify portal root is direct child of body
// Check z-index is 99999
```

#### Issue: Animations are janky
```javascript
// Check if will-change CSS property could help
// Verify transform/opacity animations (GPU accelerated)
```

## Test Data Setup

### Create test scenario
1. Create multiple user accounts
2. Send messages between users
3. Test with 0, 1, 5, 20+ messages
4. Test with online and offline users
5. Test with and without profile pictures

## Success Criteria

✅ **Mobile View**
- Modal overlays entire screen
- No header overlap
- All functionality works
- Smooth animations
- Body scroll disabled when open

✅ **Desktop View**
- Traditional popup works as before
- No regression in functionality
- Maintains previous behavior

✅ **Performance**
- Opens in < 300ms
- Smooth 60fps animations
- No memory leaks

✅ **Accessibility**
- Keyboard navigable
- Screen reader compatible
- Proper ARIA labels

✅ **Browser Support**
- Works in all major browsers
- Mobile browsers included
- No console errors

## Reporting Issues

If you find issues, note:
1. **Device**: Browser, OS, screen size
2. **Steps**: How to reproduce
3. **Expected**: What should happen
4. **Actual**: What actually happens
5. **Screenshots**: Visual proof of issue
6. **Console**: Any error messages

## Next Steps After Testing

1. ✅ All tests pass → Deploy to production
2. ⚠️ Minor issues → Create tickets for fixes
3. ❌ Critical issues → Rollback and investigate
