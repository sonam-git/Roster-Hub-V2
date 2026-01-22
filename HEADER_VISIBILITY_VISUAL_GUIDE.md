# Header Visibility Visual Guide

## Current Behavior

### Large Screen (Desktop ≥ 1024px)

#### When User is NOT Logged In ❌
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  [NO HEADERS SHOWN]                     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │                                               │     │
│  │        Clean Professional Login Page          │     │
│  │                                               │     │
│  │     ┌─────────────────────────────┐          │     │
│  │     │                             │          │     │
│  │     │      Sign In Form           │          │     │
│  │     │                             │          │     │
│  │     │  Email: _______________     │          │     │
│  │     │                             │          │     │
│  │     │  Password: ____________     │          │     │
│  │     │                             │          │     │
│  │     │    [Sign in button]         │          │     │
│  │     │                             │          │     │
│  │     └─────────────────────────────┘          │     │
│  │                                               │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  Footer                                                 │
└─────────────────────────────────────────────────────────┘
```

#### When User IS Logged In ✅
```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐     │
│ │ TopHeader: [Logo] [Organization] [Dark] [User]  │     │
│ └─────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ MainHeader: [Nav Links] [Actions]               │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│  ┌────────┐  ┌───────────────────────────────────┐     │
│  │        │  │                                   │     │
│  │ Header │  │     Dashboard Content             │     │
│  │ (Side  │  │                                   │     │
│  │  bar)  │  │  Welcome to RosterHub!            │     │
│  │        │  │                                   │     │
│  │ • Home │  │  Your team statistics...          │     │
│  │ • Team │  │                                   │     │
│  │ • Game │  │                                   │     │
│  │ • More │  │                                   │     │
│  │        │  │                                   │     │
│  └────────┘  └───────────────────────────────────┘     │
│                                                         │
│  Footer                                                 │
└─────────────────────────────────────────────────────────┘
```

---

### Small/Medium Screen (Mobile/Tablet < 1024px)

#### When User is NOT Logged In ❌
```
┌───────────────────────────┐
│ ┌───────────────────────┐ │
│ │ TopHeader             │ │
│ │ [☰] RosterHub  [🌙]  │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ MainHeader            │ │
│ │ [Quick Actions]       │ │
│ └───────────────────────┘ │
│                           │
│ [Header Sidebar - Hidden] │
│ (Available via ☰ button)  │
│                           │
│  ┌─────────────────────┐  │
│  │                     │  │
│  │   Sign In Form      │  │
│  │                     │  │
│  │  Email:             │  │
│  │  ________________   │  │
│  │                     │  │
│  │  Password:          │  │
│  │  ________________   │  │
│  │                     │  │
│  │  [Sign in]          │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
│  Footer                   │
└───────────────────────────┘
```

#### When User IS Logged In ✅
```
┌───────────────────────────┐
│ ┌───────────────────────┐ │
│ │ TopHeader             │ │
│ │ [☰] RosterHub  [🌙]  │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ MainHeader            │ │
│ │ [Quick Actions]       │ │
│ └───────────────────────┘ │
│                           │
│ [Header Sidebar]          │
│ ┌───────────────────────┐ │
│ │ • Dashboard           │ │
│ │ • Team                │ │
│ │ • Games               │ │
│ │ • Skills              │ │
│ │ • Messages            │ │
│ └───────────────────────┘ │
│                           │
│  Dashboard Content        │
│                           │
│  Footer                   │
└───────────────────────────┘
```

---

## Component Breakdown

### 1. TopHeader
- **Location**: Fixed at top of page
- **Content**: Logo, organization selector, dark mode toggle, user menu
- **Large Screen (Not Logged In)**: ❌ Hidden
- **Large Screen (Logged In)**: ✅ Visible
- **Small Screen (All States)**: ✅ Always Visible

### 2. MainHeader
- **Location**: Below TopHeader
- **Content**: Main navigation links, action buttons
- **Large Screen (Not Logged In)**: ❌ Hidden
- **Large Screen (Logged In)**: ✅ Visible
- **Small Screen (All States)**: ✅ Always Visible

### 3. Header (Sidebar)
- **Location**: Left side of page (large) or overlay (small)
- **Content**: Navigation menu, user profile
- **Large Screen (Not Logged In)**: ❌ Hidden
- **Large Screen (Logged In)**: ✅ Visible
- **Small Screen (All States)**: ✅ Always Visible (toggleable)

---

## Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Small       Medium          Large          X-Large    │
│  ─────       ──────          ─────          ───────    │
│  0-640px     640-1024px      1024-1280px    1280px+    │
│                                                         │
│  📱          💻              🖥️             🖥️🖥️      │
│  Mobile      Tablet         Desktop        Large Desk  │
│                                                         │
│  Headers     Headers         Headers        Headers    │
│  Always      Always          Conditional   Conditional │
│  Visible     Visible         on Auth       on Auth     │
│                                                         │
└─────────────────────────────────────────────────────────┘

Breakpoint Used: 1024px (lg in Tailwind)
```

---

## State Transitions

### Login Flow
```
1. User on Login Page (Large Screen)
   ├─ NO headers visible ❌
   └─ Clean professional look

2. User Enters Credentials
   └─ Form validation...

3. User Clicks "Sign In"
   └─ Authentication in progress...

4. Success - Redirect to Dashboard
   ├─ TopHeader appears ✅
   ├─ MainHeader appears ✅
   ├─ Header (Sidebar) appears ✅
   └─ Full app interface shown
```

### Logout Flow
```
1. User on Dashboard (Large Screen)
   ├─ All headers visible ✅
   └─ Full navigation available

2. User Clicks Logout
   └─ Clear authentication token...

3. Redirect to Login/Home
   ├─ TopHeader disappears ❌
   ├─ MainHeader disappears ❌
   ├─ Header (Sidebar) disappears ❌
   └─ Clean login page shown
```

### Mobile Experience (Unchanged)
```
1. User on Any Page (Small Screen)
   ├─ TopHeader always visible ✅
   ├─ MainHeader always visible ✅
   └─ Header (Sidebar) toggleable ✅

2. Login/Logout Doesn't Affect Header Visibility
   └─ Headers remain visible regardless of auth state
```

---

## CSS Implementation

### Wrapper Div with Conditional Class
```jsx
<div className={!isLoggedIn ? "lg:hidden" : ""}>
  {/* Components here */}
</div>
```

### What This Means
```css
/* When NOT logged in, this class is applied: */
.lg\:hidden {
  @media (min-width: 1024px) {
    display: none;
  }
}

/* When logged in, no class is applied */
/* Components render normally */
```

---

## User Experience Benefits

### For New/Logged Out Users (Desktop)
```
✨ Professional First Impression
   └─ Clean, uncluttered interface

🎯 Focus on Authentication
   └─ No distracting navigation elements

📈 Better Conversion
   └─ Clear call-to-action for signup/login

🏢 Enterprise Look
   └─ Matches AWS/Azure style
```

### For Existing/Logged In Users (All Devices)
```
🧭 Full Navigation Access
   └─ Complete header functionality

💯 No Change in Experience
   └─ Everything works as before

📱 Mobile-Friendly
   └─ Headers available on all devices

⚡ Quick Access
   └─ All features readily accessible
```

### For Mobile Users (All States)
```
📱 Consistent Experience
   └─ Headers always available

👆 Touch-Friendly Navigation
   └─ Menu always accessible

🔄 No Confusion
   └─ Same interface logged in or out

✅ Best Practice
   └─ Mobile web standards followed
```

---

## Code Locations

### Modified Files
```
client/src/App.jsx
├─ Line ~208: App component
│  └─ Added isLoggedIn check
├─ Line ~220-230: MainHeader & TopHeader wrapper
│  └─ Conditional lg:hidden class
└─ Line ~150: Header wrapper in AppContent
   └─ Conditional lg:hidden class
```

### Helper Functions Used
```
Auth.loggedIn()
├─ Location: client/src/utils/auth.js
├─ Returns: boolean
├─ Checks: localStorage token
└─ Validates: Token expiration
```

---

## Testing Matrix

| Screen Size | Auth State | TopHeader | MainHeader | Header (Sidebar) |
|------------|------------|-----------|------------|------------------|
| 1920px     | Logged Out | ❌        | ❌         | ❌               |
| 1920px     | Logged In  | ✅        | ✅         | ✅               |
| 1024px     | Logged Out | ❌        | ❌         | ❌               |
| 1024px     | Logged In  | ✅        | ✅         | ✅               |
| 768px      | Logged Out | ✅        | ✅         | ✅               |
| 768px      | Logged In  | ✅        | ✅         | ✅               |
| 375px      | Logged Out | ✅        | ✅         | ✅               |
| 375px      | Logged In  | ✅        | ✅         | ✅               |

---

## Summary

✅ **Large screens**: Headers hidden when not logged in
✅ **Small screens**: Headers always visible
✅ **No breaking changes**: All functionality preserved
✅ **Better UX**: Professional look for auth pages
✅ **Mobile-first**: Responsive design maintained
