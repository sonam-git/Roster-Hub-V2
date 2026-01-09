# RosterHub Onboarding Flow - Testing Checklist

## 🎯 Complete Testing Guide

Use this checklist to systematically test the new onboarding flow.

---

## Pre-Test Setup

- [ ] Backend server is running (`npm start` in `/server`)
- [ ] Frontend dev server is running (`npm run dev` in `/client`)
- [ ] Database is connected and accessible
- [ ] Browser console is open for monitoring errors
- [ ] Browser localStorage is cleared (or use incognito)

---

## Test Suite 1: Team Creation (Signup Page)

### TC1.1: Basic Team Creation
- [ ] Navigate to `http://localhost:3000/signup`
- [ ] Page loads without errors
- [ ] See "CREATE YOUR TEAM 🚀" heading
- [ ] See 4 input fields: Name, Email, Password, Team Name
- [ ] Fill out form:
  - Name: "Test Creator"
  - Email: "creator@test.com"
  - Password: "test123"
  - Team Name: "Test Eagles FC"
- [ ] Click "CREATE TEAM" button
- [ ] Success message appears with invite code
- [ ] Invite code is 8 characters long
- [ ] "Copy" button works (copies to clipboard)
- [ ] Auto-redirect occurs after ~2 seconds
- [ ] Land on dashboard
- [ ] Token stored in localStorage (check DevTools → Application → Local Storage)

### TC1.2: Team Creation with Default Name
- [ ] Clear localStorage and refresh
- [ ] Navigate to `/signup`
- [ ] Fill out form but leave "Team Name" blank:
  - Name: "Second Creator"
  - Email: "creator2@test.com"
  - Password: "test123"
  - Team Name: (empty)
- [ ] Submit form
- [ ] Verify team is created with default name "Second Creator's Team"
- [ ] Verify invite code is generated
- [ ] Verify redirect works

### TC1.3: Error Handling
- [ ] Try to create account with existing email
  - [ ] Error message appears: "Email already exists" or similar
  - [ ] Error auto-dismisses after 3 seconds
- [ ] Try to submit with empty required fields
  - [ ] Browser validation prevents submission
- [ ] Try weak password (less than 6 chars)
  - [ ] Browser validation prevents submission

### TC1.4: UI/UX
- [ ] All form fields are properly labeled
- [ ] Placeholder text is helpful
- [ ] Loading spinner shows during submission
- [ ] Button disables during submission
- [ ] Dark mode works correctly
- [ ] Mobile responsive (test on small screen/device)
- [ ] Animations and transitions are smooth
- [ ] Link to login page works

**Save Invite Code:** _________________ (for next tests)

---

## Test Suite 2: Team Join (Login Page - Join Mode)

### TC2.1: Basic Team Join
- [ ] Clear localStorage and refresh
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Page loads without errors
- [ ] See "WELCOME BACK! 👋" heading (default mode)
- [ ] See mode toggle: "🔑 Sign In" and "👥 Join Team"
- [ ] Click "👥 Join Team" tab
- [ ] Heading changes to "JOIN YOUR TEAM! 🎯"
- [ ] See 4 input fields: Name, Email, Password, Team Code
- [ ] Fill out form:
  - Name: "Test Player"
  - Email: "player@test.com"
  - Password: "test123"
  - Team Code: (use invite code from TC1.1)
- [ ] Click "JOIN TEAM" button
- [ ] No errors occur
- [ ] Redirect to dashboard
- [ ] Token stored in localStorage
- [ ] Both creator and player are in same organization

### TC2.2: Join with Invalid Code
- [ ] Clear localStorage and refresh
- [ ] Go to `/login`, click "Join Team"
- [ ] Fill out form with invalid code: "INVALID1"
- [ ] Submit
- [ ] Error message appears: "Invalid invitation code"
- [ ] Error auto-dismisses after 3 seconds
- [ ] User remains on login page

### TC2.3: Join Team - Member Limit
- [ ] (If applicable) Create organization with member limit
- [ ] Try to join when limit is reached
- [ ] Verify error: "Organization has reached member limit"

### TC2.4: Mode Switching
- [ ] Start on "Sign In" mode
- [ ] Switch to "Join Team" mode
  - [ ] Form fields change appropriately
  - [ ] Name and Team Code fields appear
  - [ ] Forgot Password link disappears
  - [ ] Google login disappears
- [ ] Switch back to "Sign In" mode
  - [ ] Form resets to email + password only
  - [ ] Forgot Password link reappears
  - [ ] Google login reappears
- [ ] Form state clears when switching modes

---

## Test Suite 3: Existing User Login

### TC3.1: Standard Login
- [ ] Clear localStorage and refresh
- [ ] Navigate to `/login`
- [ ] Ensure "Sign In" mode is active (default)
- [ ] See 2 input fields: Email, Password
- [ ] Fill out form:
  - Email: "creator@test.com"
  - Password: "test123"
- [ ] Click "SIGN IN" button
- [ ] No errors occur
- [ ] Redirect to dashboard
- [ ] Token stored in localStorage

### TC3.2: Login with Wrong Password
- [ ] Clear localStorage and refresh
- [ ] Go to `/login` (Sign In mode)
- [ ] Enter valid email but wrong password
- [ ] Submit
- [ ] Error message appears: "Invalid credentials" or similar
- [ ] Error auto-dismisses after 3 seconds
- [ ] User remains on login page

### TC3.3: Login with Non-Existent Email
- [ ] Clear localStorage and refresh
- [ ] Go to `/login` (Sign In mode)
- [ ] Enter non-existent email
- [ ] Submit
- [ ] Error message appears
- [ ] User remains on login page

### TC3.4: Google Login (if configured)
- [ ] Click Google login button
- [ ] Google OAuth flow initiates
- [ ] (Complete Google authentication)
- [ ] Redirect to dashboard
- [ ] Token stored in localStorage

---

## Test Suite 4: Navigation & Links

### TC4.1: Signup to Login
- [ ] Go to `/signup`
- [ ] Click "Already have an account? Sign in here" link
- [ ] Navigate to `/login`
- [ ] "Sign In" mode is active (default)

### TC4.2: Login to Signup
- [ ] Go to `/login`
- [ ] Click "🆕 Create New Team" link
- [ ] Navigate to `/signup`
- [ ] Team creation form is displayed

### TC4.3: Forgot Password Link
- [ ] Go to `/login` (Sign In mode)
- [ ] Click "🔑 Forgot Password?" link
- [ ] Navigate to forgot password page (or appropriate action occurs)

---

## Test Suite 5: Security & Data Integrity

### TC5.1: Token Validation
- [ ] Create account and get token
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify token exists
- [ ] Decode token at jwt.io
- [ ] Verify token contains: _id, email, name, organizationId

### TC5.2: Organization Membership
- [ ] Create team as "creator@test.com"
- [ ] Join team as "player@test.com" using invite code
- [ ] Query database (or check API):
  - [ ] Organization has 2 members
  - [ ] Creator has role: "owner"
  - [ ] Player has role: "member"
  - [ ] Both profiles have currentOrganization set
  - [ ] memberCount is 2

### TC5.3: Invite Code Uniqueness
- [ ] Create multiple teams
- [ ] Verify each team gets unique 8-digit invite code
- [ ] No duplicate codes exist in database

---

## Test Suite 6: UI/UX & Responsive Design

### TC6.1: Desktop View
- [ ] Test on large screen (1920x1080)
- [ ] Layout is centered and well-proportioned
- [ ] Left branding panel visible on signup/login pages
- [ ] All elements readable and accessible

### TC6.2: Tablet View
- [ ] Test on tablet size (768px width)
- [ ] Layout adjusts appropriately
- [ ] Form remains usable
- [ ] Buttons and inputs are touch-friendly

### TC6.3: Mobile View
- [ ] Test on mobile size (375px width)
- [ ] Left branding panel hides (if designed to)
- [ ] Form takes full width
- [ ] All inputs and buttons are thumb-friendly
- [ ] Text is readable without zooming

### TC6.4: Dark Mode
- [ ] Enable dark mode in OS or browser
- [ ] Revisit signup page
  - [ ] Background, text, and inputs adjust to dark theme
  - [ ] Contrast is sufficient for readability
- [ ] Revisit login page
  - [ ] Dark theme applied correctly
  - [ ] Mode toggle works in dark mode

### TC6.5: Animations & Transitions
- [ ] Form inputs have focus states
- [ ] Buttons have hover effects
- [ ] Loading spinner animates smoothly
- [ ] Success/error alerts animate in/out
- [ ] Mode toggle transitions smoothly

---

## Test Suite 7: Error Recovery & Edge Cases

### TC7.1: Network Errors
- [ ] Start signup/login with network disconnected
- [ ] Submit form
- [ ] Verify error handling (e.g., "Network error" message)
- [ ] Reconnect network
- [ ] Retry submission
- [ ] Verify success

### TC7.2: Slow Network
- [ ] Throttle network in DevTools (Slow 3G)
- [ ] Submit signup/login form
- [ ] Verify loading spinner shows
- [ ] Verify button stays disabled during request
- [ ] Verify no double-submission occurs

### TC7.3: Invite Code Case Sensitivity
- [ ] Get invite code in uppercase (e.g., "ABC12345")
- [ ] Try joining with lowercase ("abc12345")
- [ ] Should still work (code converted to uppercase in frontend)

### TC7.4: Very Long Input
- [ ] Try entering 500 characters in name field
- [ ] Verify validation or truncation
- [ ] Same for email and team name fields

### TC7.5: Special Characters
- [ ] Try team name with emojis: "Eagles ⚽ FC"
- [ ] Try name with accents: "José García"
- [ ] Verify proper handling

---

## Test Suite 8: Multi-User Scenarios

### TC8.1: Two Creators, Two Teams
- [ ] User A creates Team A → gets invite code A
- [ ] User B creates Team B → gets invite code B
- [ ] User C joins Team A with code A
- [ ] User D joins Team B with code B
- [ ] Verify:
  - [ ] Team A has User A (owner) and User C (member)
  - [ ] Team B has User B (owner) and User D (member)
  - [ ] Teams are completely separate

### TC8.2: One Creator, Multiple Members
- [ ] User A creates team → gets invite code
- [ ] User B joins with code
- [ ] User C joins with code
- [ ] User D joins with code
- [ ] Verify:
  - [ ] Team has 4 members total
  - [ ] User A is owner
  - [ ] Users B, C, D are members
  - [ ] memberCount is 4

---

## Test Suite 9: Browser Compatibility

### TC9.1: Chrome
- [ ] Test entire flow on latest Chrome
- [ ] No console errors
- [ ] All features work

### TC9.2: Firefox
- [ ] Test entire flow on latest Firefox
- [ ] No console errors
- [ ] All features work

### TC9.3: Safari (if on Mac)
- [ ] Test entire flow on latest Safari
- [ ] No console errors
- [ ] All features work

### TC9.4: Edge
- [ ] Test entire flow on latest Edge
- [ ] No console errors
- [ ] All features work

---

## Test Suite 10: Regression Testing

### TC10.1: Existing Features Still Work
- [ ] Dashboard loads correctly
- [ ] User profile displays correctly
- [ ] Team management features work
- [ ] Game creation/management works
- [ ] Chat functionality works
- [ ] All other major features unchanged

### TC10.2: OrganizationContext Works
- [ ] After login, OrganizationContext provides currentOrg
- [ ] Components using organization data render correctly
- [ ] Switching organizations works (if multi-org feature exists)

---

## 📊 Testing Results Summary

### Pass/Fail Counts
- Total Test Cases: _____ / _____
- Passed: _____
- Failed: _____
- Skipped: _____

### Critical Issues Found
1. _____________________________
2. _____________________________
3. _____________________________

### Minor Issues Found
1. _____________________________
2. _____________________________
3. _____________________________

### Recommendations
1. _____________________________
2. _____________________________
3. _____________________________

---

## ✅ Sign-Off

- [ ] All critical test cases passed
- [ ] No breaking bugs found
- [ ] Performance is acceptable
- [ ] UI/UX is intuitive and polished
- [ ] Documentation is complete
- [ ] Ready for deployment

**Tested By:** _____________________
**Date:** _____________________
**Approval:** _____________________ (signature)

---

## 🚀 Post-Testing Actions

After successful testing:
1. [ ] Merge changes to main branch
2. [ ] Update CHANGELOG.md
3. [ ] Deploy to staging environment
4. [ ] Conduct user acceptance testing (UAT)
5. [ ] Deploy to production
6. [ ] Monitor for issues in first 24-48 hours
7. [ ] Gather user feedback
8. [ ] Plan any necessary refinements

---

## 📞 Support & Troubleshooting

If tests fail, refer to:
- `/ONBOARDING_FLOW_FINAL.md` - Complete flow documentation
- `/ONBOARDING_CHANGES_SUMMARY.md` - Summary of changes
- `/ONBOARDING_VISUAL_GUIDE.md` - Visual flow diagrams
- Browser console for error messages
- Network tab for API request/response details
- Backend logs for server-side errors

For help:
- Check documentation files
- Review error messages carefully
- Verify backend is running correctly
- Check database connections
- Verify environment variables are set
