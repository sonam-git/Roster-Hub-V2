# Profile View Functionality Documentation

## Overview
The Roster Hub application has a complete profile viewing system that allows users to view team member profiles from the roster page.

## User Flow

### 1. Roster Page (`/roster`)
- Displays all team members in the organization
- Shows profile cards with:
  - Profile picture
  - Name
  - Jersey number
  - Position
  - Average rating
  - Action buttons: **View Profile**, **Rate Player**, **Send Message**

### 2. View Profile Button
Located in: `client/src/components/ProfileList/index.jsx` (Line 272-282)

```jsx
<Link
  to={`/profiles/${profile._id}`}
  className="..."
>
  <RiProfileLine className="text-xl" />
  <span>View Profile</span>
</Link>
```

When clicked, navigates to: `http://localhost:3000/profiles/{profileId}`

### 3. Profile Page (`/profiles/:profileId`)
**File:** `client/src/pages/Profile.jsx`

**Functionality:**
- Fetches profile data using `QUERY_SINGLE_PROFILE` GraphQL query
- Requires `organizationId` from context
- Displays different views:
  - **Other User's Profile:** Shows `UserProfile` component
  - **Own Profile:** Redirects to `/me` and shows `MyProfile` component

**Query Variables:**
```javascript
{
  profileId: profileId,
  organizationId: currentOrganization?._id 
}
```

### 4. UserProfile Component
**File:** `client/src/components/UserProfile/index.jsx`

**Features:**
- Tabbed interface with 3 sections:
  - **Skills Tab:** Shows skills/endorsements for the user
  - **Posts Tab:** Shows user's social posts
  - **Games Tab:** Shows games the user participated in

- **Action Buttons:**
  - Send Message button (opens MessageBox modal)
  - Rate Player button (opens RatingModal)
  - Add Skill button (opens SkillForm)

- **Profile Information Displayed:**
  - Profile picture
  - Name
  - Jersey number
  - Position
  - Phone number
  - Average rating
  - Social media links
  - Skills with reactions
  - Posts with comments and likes
  - Game participation history

## Recent Fix (January 8, 2026)

### Problem
The profile pages were returning **400 Bad Request** errors due to GraphQL schema mismatches.

### Root Cause
The `QUERY_SINGLE_PROFILE` query was requesting `organizationId` field on:
- `Profile` type (line 89)
- `Post` objects in posts array (line 95)
- `Skill` objects in skills array (line 123)

These fields don't exist in the GraphQL schema.

### Solution
Removed invalid `organizationId` field references from `QUERY_SINGLE_PROFILE` in:
`client/src/utils/queries.jsx`

### Result
✅ Profile pages now load without errors
✅ Users can view other members' profiles
✅ All profile data displays correctly

## Related Components

### ProfileCard
Displays user's basic information in a card format

### SkillsList
Shows paginated list of skills/endorsements with:
- Skill text
- Author
- Reactions (emoji support)
- Creation date

### PostsList
Shows user's social media posts with:
- Post text
- Comments
- Likes
- Creation date

### FriendGames
Shows games the user has participated in with:
- Game details
- Attendance status
- Game results

### MessageBox
Modal for sending direct messages to the user

### RatingModal
Modal for rating the player's performance

## Navigation Flow

```
Roster Page (/roster)
    ↓
    [View Profile Button]
    ↓
Profile Page (/profiles/:profileId)
    ↓
UserProfile Component
    ├── Skills Tab
    ├── Posts Tab
    └── Games Tab
```

## Multi-Tenant Support

The profile system is fully integrated with the multi-tenant architecture:
- All queries filter by `organizationId`
- Users only see profiles from their current organization
- Organization context is maintained throughout the navigation
- Refetch occurs when organization changes

## Key Files

| File | Purpose |
|------|---------|
| `/client/src/pages/Profile.jsx` | Main profile page route |
| `/client/src/components/UserProfile/index.jsx` | User profile display component |
| `/client/src/components/ProfileList/index.jsx` | Roster grid with profile cards |
| `/client/src/components/ProfileCard/index.jsx` | Individual profile card |
| `/client/src/utils/queries.jsx` | GraphQL queries (QUERY_SINGLE_PROFILE) |
| `/server/schemas/resolvers.js` | Profile resolver (line 153) |
| `/server/schemas/typeDefs.js` | Profile type definition (line 5) |

## Current Status
✅ Fully functional
✅ No 400 errors
✅ Multi-tenant aware
✅ Mobile responsive
✅ Dark mode supported

---
**Last Updated:** January 8, 2026
**Status:** ✅ Working
