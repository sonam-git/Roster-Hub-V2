# SoccerAsset Feature - Team Equipment Management

## Overview
The SoccerAsset feature allows teams to manage their soccer equipment and assets (soccer balls, jerseys, cones, pug goals, etc.) with full CRUD operations. Only admins can add, edit, and delete items, while all team members can view the equipment inventory.

## Features
- ✅ Dynamic asset management (Add, Edit, Delete)
- ✅ Category-based organization (Balls, Training Equipment, Goals, Jerseys, Other)
- ✅ Condition tracking (Excellent, Good, Fair, Poor, Needs Replacement)
- ✅ Quantity management
- ✅ Search and filter functionality
- ✅ Admin-only edit/delete permissions
- ✅ Real-time updates via GraphQL subscriptions
- ✅ Organization-scoped assets
- ✅ Responsive UI with modern design

## File Structure

### Backend
```
server/
├── models/
│   ├── Asset.js                    # Mongoose model for assets
│   └── index.js                    # Updated to export Asset model
└── schemas/
    ├── assetTypeDefs.js            # GraphQL type definitions for assets
    ├── assetResolvers.js           # GraphQL resolvers for asset operations
    ├── typeDefs.js                 # Updated to include assetTypeDefs
    └── resolvers.js                # Updated to integrate asset resolvers
```

### Frontend
```
client/src/
├── components/
│   └── SoccerAsset/
│       ├── SoccerAsset.jsx         # Main component for equipment management
│       └── index.jsx               # Component export
├── utils/
│   ├── queries.jsx                 # Added QUERY_ASSETS and QUERY_ASSET
│   └── mutations.jsx               # Added CREATE_ASSET, UPDATE_ASSET, DELETE_ASSET
└── App.jsx                         # Added /equipment route
```

## Backend Implementation

### 1. Asset Model (`server/models/Asset.js`)
- **Fields:**
  - `name`: String (required) - Name of the equipment
  - `quantity`: Number (required, min: 0) - Number of items
  - `category`: Enum - Balls, Training Equipment, Goals, Jerseys, Other
  - `condition`: Enum - Excellent, Good, Fair, Poor, Needs Replacement
  - `notes`: String - Additional notes
  - `organizationId`: ObjectId (required) - Organization reference
  - `createdBy`: ObjectId (required) - Profile reference
  - `timestamps`: Auto-managed createdAt/updatedAt

### 2. GraphQL Schema (`server/schemas/assetTypeDefs.js`)
- **Types:**
  - `Asset`: Main asset type with all fields
  - `AssetCategory`: Enum for categories
  - `AssetCondition`: Enum for condition states
  
- **Inputs:**
  - `CreateAssetInput`: For creating new assets
  - `UpdateAssetInput`: For updating existing assets

- **Queries:**
  - `assets(organizationId: ID!)`: Get all assets for an organization
  - `asset(assetId: ID!, organizationId: ID!)`: Get a single asset

- **Mutations:**
  - `createAsset(input: CreateAssetInput!, organizationId: ID!)`: Create new asset (Admin only)
  - `updateAsset(assetId: ID!, input: UpdateAssetInput!, organizationId: ID!)`: Update asset (Admin only)
  - `deleteAsset(assetId: ID!, organizationId: ID!)`: Delete asset (Admin only)

- **Subscriptions:**
  - `assetCreated(organizationId: ID!)`: Real-time asset creation
  - `assetUpdated(organizationId: ID!)`: Real-time asset updates
  - `assetDeleted(organizationId: ID!)`: Real-time asset deletion

### 3. Resolvers (`server/schemas/assetResolvers.js`)
- **Admin Authorization:** All mutations check if user is owner or admin
- **Organization Scoping:** All operations are scoped to the user's organization
- **Real-time Updates:** PubSub integration for subscriptions
- **Error Handling:** Comprehensive error messages

## Frontend Implementation

### 1. SoccerAsset Component
**Location:** `client/src/components/SoccerAsset/SoccerAsset.jsx`

**Features:**
- Clean, responsive UI with grid layout
- Search bar for filtering by name
- Category filter dropdown
- Modal for add/edit operations
- Category icons and condition color coding
- Success/error message notifications
- Admin-only edit/delete buttons

**State Management:**
- Uses Apollo Client's `useQuery` and `useMutation` hooks
- Real-time refetch after mutations
- Form state management for add/edit operations

### 2. GraphQL Queries & Mutations
**Location:** `client/src/utils/queries.jsx` and `client/src/utils/mutations.jsx`

```javascript
// Queries
QUERY_ASSETS        // Get all assets for organization
QUERY_ASSET         // Get single asset by ID

// Mutations
CREATE_ASSET        // Create new asset
UPDATE_ASSET        // Update existing asset
DELETE_ASSET        // Delete asset
```

## Usage

### Admin View
1. Navigate to `/equipment` in the app
2. Click "Add Equipment" button
3. Fill in the form:
   - Equipment Name (required)
   - Quantity (required, must be >= 0)
   - Category (dropdown)
   - Condition (dropdown)
   - Notes (optional)
4. Click "Add" to create the asset
5. Use "Edit" button on any asset card to modify
6. Use "Delete" button to remove (with confirmation)

### Member View
1. Navigate to `/equipment` in the app
2. View all team equipment
3. Use search bar to find specific items
4. Use category filter to filter by type
5. No edit/delete buttons visible

## Navigation
The Equipment page is accessible via:
- Header navigation menu (Equipment item with cube icon)
- Direct URL: `/equipment`

## Security & Authorization

### Backend Security
- All mutations require authentication
- Only organization owners and admins can create/update/delete assets
- All operations are scoped to the user's current organization
- Organization membership is validated for all operations

### Frontend Security
- Edit/Delete buttons only shown to admins
- Non-admins can view equipment but not modify

## Design Decisions

### Why Separate Schema Files?
- **Modularity:** Keeps asset-related code isolated
- **Maintainability:** Easy to update without affecting other features
- **Scalability:** Simple to add more features in the future

### Why Admin-Only Editing?
- **Data Integrity:** Prevents accidental or unauthorized modifications
- **Accountability:** Tracks who added each item via `createdBy` field
- **Organization:** Maintains consistent equipment records

### Category & Condition Enums
- **Data Consistency:** Ensures standardized values
- **UI Simplification:** Easy dropdown selections
- **Filtering:** Enables category-based filtering

## Testing Checklist

- [ ] Create asset as admin
- [ ] View assets as member (no edit/delete buttons)
- [ ] Edit asset as admin
- [ ] Delete asset as admin (with confirmation)
- [ ] Search functionality works
- [ ] Category filter works
- [ ] Form validation (empty name, negative quantity)
- [ ] Success messages display
- [ ] Error messages display
- [ ] Navigation link in header works
- [ ] Responsive design on mobile
- [ ] Organization scoping (assets only from current org)

## Future Enhancements
- Image upload for equipment
- Checkout/checkin system for equipment borrowing
- Maintenance schedule tracking
- Low stock alerts
- Equipment history/audit log
- Bulk import/export functionality
- Equipment location tracking

## Troubleshooting

### Assets Not Showing
- Ensure user is logged in
- Check that user has an active organization
- Verify organizationId is being passed correctly

### Cannot Edit/Delete
- Verify user is admin or owner in current organization
- Check browser console for GraphQL errors
- Ensure organizationId matches current organization

### GraphQL Errors
- Check server logs for resolver errors
- Verify all required fields are provided
- Ensure user has proper permissions

## Migration Notes
This feature does not require any database migrations as it uses a new collection. Simply start the server and the Asset collection will be created automatically when the first asset is added.

## Summary
The SoccerAsset feature is fully integrated, modular, and does not affect any existing functionality. It provides a clean, intuitive interface for managing team equipment with proper authorization and real-time updates.
