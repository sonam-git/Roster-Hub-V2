# Visual Testing Checklist

## Overview
This checklist ensures all responsive changes work correctly across devices, browsers, and themes.

## Pre-Testing Setup

### Browser Tools Setup
- [ ] Chrome DevTools open (F12 / Cmd+Opt+I)
- [ ] Device toolbar enabled (Cmd+Shift+M / Ctrl+Shift+M)
- [ ] Network throttling set to "Fast 3G" or "Slow 3G" for mobile testing
- [ ] Clear browser cache and local storage

### Test User Accounts
- [ ] Logged-in user account ready
- [ ] Non-logged-in session prepared (incognito/private window)
- [ ] User who created games available
- [ ] User who did not create games available

---

## Section 1: TopHeader Component

### Desktop View (≥976px)

#### Logged-In State
- [ ] Top navigation bar visible
- [ ] Navigation links visible: Roster, Game Schedule, Game Create, Game Search, Scoreboard, Message
- [ ] Roster button visible on left
- [ ] Theme toggle button visible on right
- [ ] No bottom navigation visible
- [ ] All links navigate correctly
- [ ] Theme toggle switches between light/dark
- [ ] Sidebar button works

#### Non-Logged-In State
- [ ] Navigation links HIDDEN
- [ ] Promotional banner visible
- [ ] Theme toggle visible
- [ ] Sidebar toggle visible
- [ ] Banner text readable
- [ ] Login/Signup prominent

### Mobile View (<976px)

#### Logged-In State
- [ ] Top navigation bar HIDDEN
- [ ] Bottom navigation bar visible
- [ ] Bottom nav fixed at bottom of screen
- [ ] Bottom nav icons visible: Roster, Game Schedule, Game Create, Game Search, Scoreboard, Message
- [ ] Vertical separators between items
- [ ] Theme toggle NOT in bottom nav
- [ ] All bottom nav items navigate correctly
- [ ] Bottom nav doesn't overlap content
- [ ] Active states work on tap

#### Non-Logged-In State
- [ ] Bottom nav visible
- [ ] Theme toggle in sidebar only
- [ ] Promotional banner visible
- [ ] Login/Signup accessible

---

## Section 2: ChatPopup Component

### Desktop View (≥976px)

#### Chat Icon
- [ ] Chat icon HIDDEN

#### Chat Popup (when opened via other means)
- [ ] Chat panel appears on right side
- [ ] Width approximately 384px (24rem)
- [ ] Positioned correctly (right-8, bottom-8)
- [ ] Doesn't overlap with navigation
- [ ] Messages list scrollable
- [ ] Input field functional
- [ ] Send button works

### Mobile View (<976px)

#### Chat Icon
- [ ] Chat icon VISIBLE
- [ ] Positioned at bottom-right
- [ ] Above bottom navigation (z-index check)
- [ ] Tappable with good hit area
- [ ] Badge/notification indicator visible if needed

#### Chat Popup
- [ ] Opens to full width on small screens
- [ ] Positioned correctly at bottom
- [ ] Header with close button visible
- [ ] Messages list scrollable
- [ ] Input field above keyboard
- [ ] Send button accessible
- [ ] Close button works

### Modal Overlay

#### All Screen Sizes
- [ ] Modal appears centered
- [ ] Background darkened (black/50)
- [ ] Modal on top of all other content (z-index 9999)
- [ ] Click outside closes modal
- [ ] Close button (X) works
- [ ] Modal content not cut off
- [ ] Modal scrollable if content too tall

#### Mobile Specific
- [ ] Modal max-width: 20rem (320px) on xs
- [ ] Smaller padding on mobile
- [ ] Touch-friendly close button

#### Tablet Specific
- [ ] Modal max-width: 28rem (448px) on sm
- [ ] Modal max-width: 32rem (512px) on md
- [ ] Comfortable padding

---

## Section 3: Game Update Flow

### GameDetails Page

#### Update Button (Creator Only)
- [ ] "Update Game" button visible for game creator
- [ ] Button NOT visible for non-creators
- [ ] Button has proper styling and icon
- [ ] Hover state works (desktop)
- [ ] Click navigates to `/game-update/:gameId`

### GameUpdatePage

#### Header Section
- [ ] Back button visible and functional
- [ ] Page title card displays properly
- [ ] Gradient background looks good
- [ ] Current game info summary shows:
  - [ ] Current date
  - [ ] Current time
  - [ ] Current venue
- [ ] Info layout responsive (3 cols on desktop, stacked on mobile)

#### Form Section
- [ ] All form fields visible
- [ ] Fields pre-filled with current values
- [ ] Date picker works
- [ ] Time picker works
- [ ] Text inputs functional
- [ ] Textarea resizes properly
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Submit button works
- [ ] Cancel button returns to previous page

#### Responsive Behavior
- [ ] Single column layout on mobile (<480px)
- [ ] Two columns for date/time and venue/city on desktop
- [ ] Buttons stack on mobile
- [ ] Buttons side-by-side on desktop
- [ ] Proper spacing at all breakpoints
- [ ] No horizontal scrolling

#### Info Box
- [ ] Important note visible
- [ ] Icon and text readable
- [ ] Proper color contrast
- [ ] Responsive padding

---

## Section 4: Sidebar Navigation

### Desktop View (≥976px)
- [ ] Sidebar accessible via hamburger/toggle button
- [ ] All menu items visible including Home
- [ ] Smooth open/close animation
- [ ] Click outside closes sidebar
- [ ] Menu items navigate correctly

### Mobile View (<976px)
- [ ] Sidebar accessible
- [ ] Home menu item HIDDEN
- [ ] Other menu items visible
- [ ] Doesn't duplicate bottom nav items
- [ ] Smooth animation
- [ ] Full screen or nearly full screen
- [ ] Easy to close

---

## Section 5: Z-Index & Stacking

### Layer Testing
Test by opening multiple UI elements simultaneously:

- [ ] Bottom nav (z-1000) below chat icon
- [ ] Chat icon (z-1001) below chat popup
- [ ] Chat popup (z-1002) below modal overlay
- [ ] Modal overlay (z-9999) below modal content
- [ ] Modal content (z-10000) on top of everything
- [ ] No unexpected overlaps
- [ ] All interactive elements remain clickable
- [ ] Proper stacking in both light and dark modes

---

## Section 6: Dark Mode Testing

### All Components in Dark Mode

#### TopHeader
- [ ] Background dark gray/black
- [ ] Text white/light gray
- [ ] Borders subtle and visible
- [ ] Icons visible
- [ ] Hover states work
- [ ] Active states clear

#### ChatPopup
- [ ] Chat panel dark background
- [ ] Messages readable
- [ ] Input field dark themed
- [ ] Modal dark overlay
- [ ] Modal content dark themed
- [ ] Proper contrast throughout

#### GameUpdatePage
- [ ] Page background dark
- [ ] Cards have dark backgrounds
- [ ] Form fields dark themed
- [ ] Buttons have proper contrast
- [ ] Text readable
- [ ] Info box properly themed

#### Sidebar
- [ ] Dark background
- [ ] Light text
- [ ] Hover effects visible
- [ ] Icons clear

### Theme Toggle
- [ ] Toggle button visible and accessible
- [ ] Clicking toggles theme immediately
- [ ] Theme persists on page refresh
- [ ] Theme consistent across all pages
- [ ] Smooth transition between themes

---

## Section 7: Cross-Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] CSS Grid layouts correct
- [ ] Flexbox layouts correct
- [ ] Animations smooth
- [ ] No console errors

### Safari (Desktop)
- [ ] Webkit-specific styles work
- [ ] Date/time pickers functional
- [ ] Animations smooth
- [ ] No rendering issues

### Safari (iOS)
- [ ] Touch interactions work
- [ ] Fixed positioning correct
- [ ] Keyboard doesn't break layout
- [ ] Scrolling smooth
- [ ] No webkit rendering bugs

### Firefox
- [ ] All features functional
- [ ] CSS renders correctly
- [ ] Animations work
- [ ] No console errors

### Mobile Chrome (Android)
- [ ] Touch targets appropriate size
- [ ] Fixed elements stay fixed
- [ ] Keyboard behavior correct
- [ ] Scrolling smooth

---

## Section 8: Device-Specific Testing

### iPhone SE (320px - 375px)
- [ ] All content visible
- [ ] No horizontal scroll
- [ ] Text readable
- [ ] Buttons tappable
- [ ] Forms usable
- [ ] Navigation accessible

### iPhone 12/13/14 (375px - 390px)
- [ ] Layout optimized
- [ ] Chat icon positioned well
- [ ] Bottom nav comfortable
- [ ] Modals sized appropriately

### iPad (768px - 1024px)
- [ ] Hybrid layout works
- [ ] Not too mobile, not too desktop
- [ ] Good use of space
- [ ] Touch-friendly but sophisticated

### Desktop (1440px+)
- [ ] Full desktop experience
- [ ] Multi-column layouts
- [ ] Hover effects enabled
- [ ] Maximum visual polish
- [ ] No wasted space

---

## Section 9: Performance Testing

### Page Load
- [ ] Initial load under 3 seconds
- [ ] Progressive content loading
- [ ] No layout shift
- [ ] Smooth animations from start

### Navigation
- [ ] Route changes instant or near-instant
- [ ] No white flash between pages
- [ ] Smooth transitions
- [ ] Back button works correctly

### Interactions
- [ ] Button clicks responsive
- [ ] Form submissions quick
- [ ] Modal open/close smooth
- [ ] Chat messages send/receive fast
- [ ] Theme toggle immediate

---

## Section 10: Accessibility Testing

### Keyboard Navigation
- [ ] Tab order logical
- [ ] All interactive elements reachable
- [ ] Focus indicators visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Navigation possible without mouse

### Screen Reader Testing
- [ ] Proper heading hierarchy
- [ ] ARIA labels present
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Status updates announced
- [ ] Navigation landmarks clear

### Color Contrast
- [ ] Text meets WCAG AA standards (4.5:1 for normal text)
- [ ] Large text meets standards (3:1)
- [ ] Interactive elements clearly visible
- [ ] Focus indicators high contrast
- [ ] Error messages distinguishable without color alone

---

## Section 11: Edge Cases

### Empty States
- [ ] No games: proper empty state message
- [ ] No messages: empty chat indicator
- [ ] No form data: placeholders helpful
- [ ] Error states: clear messaging

### Long Content
- [ ] Long game titles: truncated or wrapped properly
- [ ] Many messages: chat scrollable
- [ ] Long form notes: textarea expands appropriately
- [ ] Many menu items: sidebar scrollable

### Network Issues
- [ ] Slow connection: loading indicators
- [ ] Failed requests: error messages
- [ ] Retry mechanisms work
- [ ] Offline indicator (if implemented)

### Rapid Interactions
- [ ] Double-click prevention on submit buttons
- [ ] Rapid route changes don't break app
- [ ] Quick theme toggles work
- [ ] Spamming buttons doesn't cause errors

---

## Section 12: Final Verification

### Regression Testing
- [ ] Existing features still work
- [ ] No broken functionality
- [ ] Data saves correctly
- [ ] Subscriptions update in real-time
- [ ] Authentication works
- [ ] Permissions enforced

### User Flow Testing
- [ ] Can complete common tasks easily
- [ ] Navigation intuitive
- [ ] No dead ends
- [ ] Back navigation sensible
- [ ] Success states clear

---

## Bug Reporting Template

When you find an issue, record:

```
**Issue**: [Brief description]
**Severity**: [Critical/High/Medium/Low]
**Device**: [iPhone 12, Desktop Chrome, etc.]
**Screen Size**: [375px, 1440px, etc.]
**Browser**: [Chrome 120, Safari 17, etc.]
**Theme**: [Light/Dark]
**Auth State**: [Logged in/Logged out]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots**: [Attach if possible]

**Console Errors**: [If any]
```

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All sections above tested and passing
- [ ] No critical or high-severity bugs
- [ ] Medium/low bugs documented for future fix
- [ ] Cross-browser testing complete
- [ ] Real device testing complete
- [ ] Performance acceptable
- [ ] Accessibility verified
- [ ] Stakeholder approval received
- [ ] Documentation updated
- [ ] Team informed of changes

---

## Notes Section

Use this space to record any observations, issues found, or suggestions:

```
Date: ___________
Tester: ___________

Notes:




Issues Found:




Follow-up Required:



```

---

**Remember**: This is a living document. Update it as you discover new test cases or edge cases that need verification.
