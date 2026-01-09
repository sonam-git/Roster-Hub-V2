# Admin Panel Documentation 🛡️

## Overview
The Admin Panel is a comprehensive management interface that allows team owners to manage their organization, view roster statistics, invite players, and remove members. Only the team owner can access this page.

---

## 🎯 Features

### 1. **Access Control** 🔐
- Only the team owner can access the admin panel
- Non-owners are automatically redirected to the dashboard
- Access via: `/admin` route

### 2. **Roster Statistics** 📊
Four key metrics displayed in beautiful cards:
- **Total Members**: Total number of players in the team
- **Regular Members**: Members excluding the owner
- **With Jersey #**: Players who have set their jersey number
- **With Position**: Players who have set their position

### 3. **Team Information** 📋
Displays essential team details:
- Team Name
- Invite Code (with copy-to-clipboard functionality)
- Team Owner
- Team Slug

### 4. **Player Management** 👥
- View all team members in a detailed table
- Search players by name or email
- Filter by role (All, Owner, Members)
- View player details: Profile picture, email, jersey number, position, role
- **Delete players** (except owner and yourself)

### 5. **Invite System** 📧
- Direct access to the email invite modal
- Send professional email invitations to multiple players
- Alternative: Copy and share the invite code

---

## 🎨 UI Components

### Statistics Cards
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Total Members   │ Regular Members  │  With Jersey #   │  With Position   │
│       15         │       14         │       12         │       10         │
│  [emerald icon]  │   [blue icon]    │ [purple icon]    │  [orange icon]   │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### Team Information Panel
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Team Information                                     │
├─────────────────────────────────────────────────────────┤
│ Team Name: Warriors FC                                  │
│ Invite Code: [ABC12345] [Copy]                         │
│ Team Owner: John Smith                                  │
│ Team Slug: warriors-fc-1234567890                      │
└─────────────────────────────────────────────────────────┘
```

### Search and Filter
```
┌─────────────────────────────────────────────────────────┐
│ Search: [Search by name or email...        ] 🔍        │
│ Filter: [All Members ▼]                                │
└─────────────────────────────────────────────────────────┘
```

### Members Table
```
┌────────────┬──────────────────┬─────────┬──────────┬─────────┬─────────┐
│ Player     │ Email            │ Jersey# │ Position │ Role    │ Actions │
├────────────┼──────────────────┼─────────┼──────────┼─────────┼─────────┤
│ 👤 John    │ john@email.com   │   10    │ Forward  │ 👑Owner │         │
│ 👤 Jane    │ jane@email.com   │   7     │ Midfield │ Member  │   🗑️    │
│ 👤 Mike    │ mike@email.com   │   -     │ -        │ Member  │   🗑️    │
└────────────┴──────────────────┴─────────┴──────────┴─────────┴─────────┘
```

---

## 🚀 How to Use

### Accessing the Admin Panel

#### For Team Owners:
1. **Login** to your account
2. **Navigate** to the sidebar
3. **Click** "🛡️ Admin Panel" (only visible to owners)
4. **View** comprehensive team management interface

#### URL Access:
- Direct URL: `http://localhost:3000/admin`
- Production: `https://yourapp.com/admin`

### Managing Players

#### Viewing the Roster:
1. All team members are displayed in a table
2. See profile pictures, emails, jersey numbers, positions, and roles
3. Owner is marked with 👑 crown badge
4. Current user is marked with "(You)" tag

#### Searching Players:
1. Use the **search bar** to find players by name or email
2. Search is **case-insensitive** and **real-time**
3. Results update as you type

#### Filtering Players:
1. Use the **Filter dropdown** to show:
   - **All Members**: Everyone in the team
   - **Owner**: Only the team owner
   - **Members**: Everyone except the owner

#### Deleting a Player:
1. **Locate** the player in the table
2. **Click** the trash icon (🗑️) in the Actions column
3. **Confirm** deletion in the modal
4. **Success**: Player is removed and you see a success message

**Note**: You cannot delete:
- The team owner
- Yourself

### Inviting Players

#### Method 1: Email Invites (Recommended)
1. **Click** "Invite Players" button (top-right)
2. **Enter** player email addresses
3. **Add** multiple emails (press Enter or click Add)
4. **Review** the email list
5. **Click** "Send X Invites"
6. **Success**: Players receive professional invitation emails

#### Method 2: Share Invite Code
1. **View** the invite code in Team Information section
2. **Click** "Copy" button
3. **Share** the code via WhatsApp, SMS, or other channels
4. **Players** enter the code during signup

---

## 🔒 Security & Permissions

### Access Control
```javascript
// Only owners can access
const isOwner = organization.owner?._id === currentUser._id;

// Redirect non-owners
if (!isOwner) {
  navigate("/dashboard");
}
```

### Protected Actions
- ❌ **Cannot delete owner**: Owner account is protected
- ❌ **Cannot delete yourself**: Self-deletion is prevented
- ❌ **Cannot access without auth**: Must be logged in
- ❌ **Cannot access as non-owner**: Automatic redirect

---

## 📱 Responsive Design

### Desktop View (≥1024px)
- Full sidebar navigation
- 4-column statistics grid
- Full-width table
- Spacious layout

### Tablet View (768px - 1023px)
- Collapsible sidebar
- 2-column statistics grid
- Horizontal scroll for table
- Optimized spacing

### Mobile View (<768px)
- Hidden sidebar (toggle menu)
- Single-column statistics
- Horizontal scroll for table
- Touch-optimized buttons
- Compact layout

---

## 🎨 Design Features

### Color Scheme
- **Emerald**: Primary actions, owner badge
- **Blue**: Secondary actions, member badge
- **Purple**: Jersey number statistics
- **Orange**: Position statistics
- **Red**: Delete actions, warnings
- **Gray**: Neutral elements, backgrounds

### Dark Mode Support
- All components support dark mode
- Automatic theme detection
- Consistent styling across themes
- High contrast for accessibility

### Animations & Interactions
- Smooth hover effects on cards
- Scale transform on buttons
- Fade-in/out for messages
- Smooth modal transitions
- Loading spinners
- Success/error notifications

---

## 🗂️ File Structure

```
client/src/
├── components/
│   └── AdminPanel/
│       ├── AdminPanel.jsx    # Main admin panel component
│       └── index.jsx          # Export file
├── App.jsx                    # Route added: /admin
└── components/Header/
    └── index.jsx              # Admin Panel link (owner only)
```

---

## 🔗 Integration

### Routes
```javascript
// App.jsx
<Route path="/admin" element={<AdminPanel />} />
```

### Navigation
```javascript
// Header/index.jsx
...(isOwner ? [{ 
  title: "Admin Panel", 
  icon: HiShieldCheck, 
  path: "/admin" 
}] : [])
```

### Queries Used
```javascript
import { QUERY_ME } from "../../utils/queries";

// Gets current user and organization data
const { data } = useQuery(QUERY_ME);
```

### Mutations Used
```javascript
import { 
  DELETE_PROFILE, 
  SEND_TEAM_INVITE 
} from "../../utils/mutations";

// Delete a player
const [deleteProfile] = useMutation(DELETE_PROFILE);

// Send email invites
const [sendTeamInvite] = useMutation(SEND_TEAM_INVITE);
```

---

## 📊 Statistics Calculation

### Total Members
```javascript
const totalMembers = organization.members.length;
```

### Regular Members
```javascript
const regularMembers = members.filter(
  m => m._id !== organization.owner?._id
).length;
```

### With Jersey Number
```javascript
const withJerseyNumber = members.filter(
  m => m.jerseyNumber
).length;
```

### With Position
```javascript
const withPosition = members.filter(
  m => m.position
).length;
```

---

## 🎯 User Experience Features

### Success Messages
- ✅ Player deleted successfully
- ✅ Invite code copied to clipboard
- ✅ Invites sent successfully

### Error Handling
- ❌ Failed to delete player
- ❌ Failed to send invites
- ❌ Access denied (non-owners)

### Loading States
- Spinner while fetching data
- Disabled buttons during actions
- Loading text indicators

### Auto-hide Messages
- Success messages: 5 seconds
- Error messages: 5 seconds
- Can be manually dismissed

---

## 🧪 Testing Checklist

### Access Control
- [ ] Owner can access /admin
- [ ] Non-owner redirected to dashboard
- [ ] Logged-out users redirected to login

### Statistics Display
- [ ] Total members count is correct
- [ ] Regular members count excludes owner
- [ ] Jersey number count is accurate
- [ ] Position count is accurate

### Player Management
- [ ] All members displayed in table
- [ ] Search works by name and email
- [ ] Filter works for all options
- [ ] Owner cannot be deleted
- [ ] Current user cannot delete self
- [ ] Regular members can be deleted

### Invite System
- [ ] Invite modal opens on button click
- [ ] Email validation works
- [ ] Multiple emails can be added
- [ ] Invites send successfully
- [ ] Invite code can be copied

### Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] Dark mode works correctly
- [ ] All buttons are clickable

---

## 🚀 Future Enhancements

### Potential Features
1. **Bulk Actions**: Select multiple players for batch operations
2. **Export Data**: Download roster as CSV/PDF
3. **Player Analytics**: View detailed player statistics
4. **Activity Log**: Track all admin actions
5. **Role Management**: Assign custom roles (admin, moderator, etc.)
6. **Email Templates**: Customize invitation emails
7. **Pending Invites**: View sent invitations and their status
8. **Player Import**: Upload CSV to add multiple players
9. **Team Settings**: Configure team preferences
10. **Notifications**: Email admins when players join/leave

---

## 📞 Support & Troubleshooting

### Common Issues

#### "Admin Panel" link not showing
**Solution**: Only team owners see this link. Verify you're the owner.

#### Cannot delete player
**Solution**: You cannot delete yourself or the owner. These are protected.

#### Loading forever
**Solution**: Check internet connection and backend server status.

#### Invite code not copying
**Solution**: Browser may block clipboard access. Copy manually.

---

## ✨ Summary

The Admin Panel provides team owners with:
- 📊 **Comprehensive Statistics**: Real-time roster metrics
- 👥 **Player Management**: View, search, filter, and remove members
- 📧 **Invite System**: Send professional email invitations
- 🔐 **Secure Access**: Owner-only permissions
- 🎨 **Beautiful UI**: Modern, responsive, dark-mode design
- ⚡ **Fast Performance**: Real-time updates and optimized queries

**Perfect for managing your team professionally!** 🏆

---

**Status**: ✅ **Complete and Production-Ready**
