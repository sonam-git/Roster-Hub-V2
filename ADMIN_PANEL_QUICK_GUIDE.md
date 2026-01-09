# Admin Panel - Quick Reference Guide 📱💻

## Mobile vs Desktop View

### 📱 MOBILE (< 768px)
```
┌─────────────────────────┐
│   🛡️ Admin Panel       │
│   Manage your team      │
│   ┌──────────────────┐  │
│   │ Send Email...    │  │
│   └──────────────────┘  │
│                         │
│ ┌───────┐  ┌───────┐   │
│ │  12   │  │   8    │   │
│ │Total  │  │Regular │   │
│ └───────┘  └───────┘   │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔍 Search...        │ │
│ │ Filter: All ▼       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 👤 John Doe         │ │
│ │ john@email.com      │ │
│ │ #10  |  Forward     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 👤 Jane Smith       │ │
│ │ jane@email.com      │ │
│ │ #7   |  Midfielder  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 💻 DESKTOP (≥ 768px)
```
┌────────────────────────────────────────────────────┐
│ 🛡️ Admin Panel            [Send Email Invites]    │
│ Manage your team: FC Barcelona                     │
│                                                     │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│ │  12  │  │   8   │  │  10  │  │   9  │           │
│ │Total │  │Regular│  │Jersey│  │Posit.│           │
│ └──────┘  └──────┘  └──────┘  └──────┘           │
│                                                     │
│ ┌──────────────────────────┐  ┌────────────┐      │
│ │ 🔍 Search...             │  │ Filter: ▼  │      │
│ └──────────────────────────┘  └────────────┘      │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Player      │ Email   │ # │ Pos  │ Role │ ✕│   │
│ ├─────────────────────────────────────────────┤   │
│ │ 👤 John Doe│john@... │10 │FWD   │👑    │  │   │
│ │ 👤 Jane S. │jane@... │7  │MID   │Member│🗑│   │
│ └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

## Quick Actions

### Navigate to Profile
**Desktop:**
- Click player name → Opens `/profiles/{id}`
- Click avatar → Opens `/profiles/{id}`
- Hover shows visual feedback

**Mobile:**
- Tap player card header → Opens `/profiles/{id}`
- Tap avatar → Opens `/profiles/{id}`

### Remove Player
**Desktop:**
- Click 🗑️ trash icon in Actions column
- Confirm in modal

**Mobile:**
- Tap 🗑️ button in top-right of card
- Confirm in modal

### Send Invites
**All Devices:**
- Click "Send Email Invites" button
- Opens InvitePlayersModal with invite code

## Responsive Breakpoints

| Device | Size | Layout |
|--------|------|--------|
| 📱 Phone | < 640px | Stack all, 2-col stats, cards |
| 📱 Tablet Portrait | 640-767px | Some side-by-side, cards |
| 💻 Tablet Landscape | 768-1023px | Table view, 2-col stats |
| 💻 Desktop | 1024px+ | Full table, 4-col stats |

## Component States

### Light Mode
- White backgrounds
- Gray text on white
- Emerald/blue accents
- Light shadows

### Dark Mode
- Dark gray backgrounds
- White text on dark
- Brighter accents
- Subtle shadows

### Hover (Desktop)
- Gray background on rows
- Emerald ring on avatars
- Color change on names

### Active (Mobile)
- Slight background change
- Smooth transitions
- Touch feedback

## Color Palette

### Roles
- **Owner**: `emerald-100` / `emerald-900/30` (dark)
- **Member**: `blue-100` / `blue-900/30` (dark)

### Stats Cards
- **Total**: Emerald
- **Regular**: Blue
- **Jersey**: Purple
- **Position**: Orange

### Actions
- **Success**: Green (`green-100`)
- **Error**: Red (`red-100`)
- **Delete**: Red (`red-600`)
- **Primary**: Purple-Pink gradient

## Keyboard Shortcuts
*(Native browser support)*
- `Tab` - Navigate between inputs
- `Enter` - Submit search/filter
- `Escape` - Close modals

## API Calls
- `QUERY_ME` - Fetches organization + members
- `DELETE_PROFILE` - Removes player from team

## Error Handling
- Auto-dismiss after 5 seconds
- Success messages (green)
- Error messages (red)
- Positioned above content

## Performance Tips
1. Uses CSS-only responsive design
2. Minimal re-renders with proper React patterns
3. Efficient Tailwind utility classes
4. Optimized images with proper sizes

## Browser Testing
✅ Chrome, Firefox, Safari, Edge
✅ iOS Safari, Android Chrome
✅ Tablet modes in DevTools

---
**Quick Start:** Resize browser to test responsive views!
**Pro Tip:** Use browser DevTools device mode to preview mobile layouts
