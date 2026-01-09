# Admin Panel - Quick Reference 🛡️

## Access
- **URL**: `/admin`
- **Permission**: Owner only
- **Sidebar**: "🛡️ Admin Panel" (visible to owners)

## Features

### 📊 Statistics (4 Cards)
1. Total Members
2. Regular Members  
3. Players with Jersey #
4. Players with Position

### 📋 Team Info
- Team Name
- Invite Code (with copy button)
- Team Owner
- Team Slug

### 👥 Roster Table
- Profile pictures
- Names & emails
- Jersey numbers
- Positions
- Roles (Owner/Member badges)
- Delete button (except owner & self)

### 🔍 Search & Filter
- Search by name or email
- Filter: All/Owner/Members
- Real-time results

### 📧 Invite Players
- Button opens invite modal
- Send email invitations
- Copy invite code

### 🗑️ Delete Players
- Click trash icon
- Confirm deletion
- Cannot delete owner or yourself

## Screenshots

```
┌──────────────────────────────────────────────────────────┐
│  🛡️ Admin Panel                    [Invite Players] │
│  Manage your team: Warriors FC                           │
├──────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ Total:  │ │Regular: │ │Jersey#: │ │Position:│        │
│  │   15    │ │   14    │ │   12    │ │   10    │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├──────────────────────────────────────────────────────────┤
│  Team Info: Warriors FC | Code: ABC123 [Copy]            │
├──────────────────────────────────────────────────────────┤
│  Search: [____] Filter: [All ▼]                          │
├──────────────────────────────────────────────────────────┤
│  Player      │ Email       │ #  │ Position │ Role │ ⚡    │
│  John Smith  │ john@...    │ 10 │ Forward  │ 👑   │      │
│  Jane Doe    │ jane@...    │ 7  │ Midfield │ ✓    │ 🗑️   │
└──────────────────────────────────────────────────────────┘
```

## Components
- `/client/src/components/AdminPanel/AdminPanel.jsx`
- Route in `/client/src/App.jsx`
- Link in `/client/src/components/Header/index.jsx`

## Key Code
```javascript
// Check if user is owner
const isOwner = organization.owner?._id === currentUser._id;

// Redirect non-owners
if (!isOwner) {
  navigate("/dashboard");
}
```

## Benefits
✅ Centralized team management
✅ Owner-only secure access
✅ Real-time roster statistics
✅ Easy player removal
✅ Integrated invite system
✅ Professional UI/UX
✅ Mobile responsive
✅ Dark mode support

## Status
🟢 **Production Ready**

## Documentation
- Full docs: `ADMIN_PANEL_DOCUMENTATION.md`
- Option 3 (Email Invites): `EMAIL_INVITE_SYSTEM.md`

---

**Perfect for managing your team!** 🏆
