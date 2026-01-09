# Game Components - 400 Error Fix

## Issue Found
The **ComingGames** component was making a `QUERY_GAMES` GraphQL query **without** the required `organizationId` parameter, causing 400 Bad Request errors.

## Root Cause
The `QUERY_GAMES` query requires `organizationId` as a mandatory parameter:

```graphql
query Games($organizationId: ID!, $status: GameStatus) {
  games(organizationId: $organizationId, status: $status) {
    # ... fields
  }
}
```

But the ComingGames component was calling it without any variables:
```javascript
const { loading, error, data } = useQuery(QUERY_GAMES); // ❌ Missing organizationId!
```

## Fix Applied

### File: `client/src/components/ComingGames/index.jsx`

**Changes:**
1. ✅ Added `useOrganization` hook import
2. ✅ Added `currentOrganization` context
3. ✅ Added `organizationId` to query variables
4. ✅ Added `skip` condition to prevent query when organization is not loaded
5. ✅ Added `refetch` when organization changes
6. ✅ Added loading state for organization

**Before:**
```javascript
import React, { useContext, useMemo } from "react";
// ... imports

export default function ComingGames() {
  const { isDarkMode } = useContext(ThemeContext);
  const client = useApolloClient();

  // Query games
  const { loading, error, data } = useQuery(QUERY_GAMES);
```

**After:**
```javascript
import React, { useContext, useMemo, useEffect } from "react";
// ... imports
import { useOrganization } from "../../contexts/OrganizationContext";

export default function ComingGames() {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const client = useApolloClient();

  // Query games with organization context
  const { loading, error, data, refetch } = useQuery(QUERY_GAMES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  // ... rest of component
  
  // Loading state for organization
  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
            Loading games...
          </p>
        </div>
      </div>
    );
  }
```

## Game-Related Components Analysis

### ✅ Game.jsx (Page)
**Status:** Already correct
- Uses `organizationId` in QUERY_GAME
- Has organization context
- Refetches on organization change
- Added debug logging

### ✅ GameList Component
**Status:** Already correct
- Uses `organizationId` in QUERY_GAMES
- Has organization context
- Refetches on organization change

### ✅ GameDetails Component
**Status:** Already correct
- Uses `organizationId` in QUERY_GAME
- Uses `organizationId` in QUERY_FORMATION
- Has organization context
- Refetches on organization change

### ❌ ComingGames Component
**Status:** FIXED
- Was missing `organizationId` in QUERY_GAMES
- Was missing organization context
- Now fixed with all required changes

## GraphQL Queries Used

### 1. QUERY_GAMES
**Location:** `client/src/utils/queries.jsx` (Line 476)
**Variables:** 
- `organizationId: ID!` (required)
- `status: GameStatus` (optional)

**Used By:**
- ✅ GameList component
- ✅ ComingGames component (now fixed)

### 2. QUERY_GAME
**Location:** `client/src/utils/queries.jsx` (Line 557)
**Variables:**
- `gameId: ID!` (required)
- `organizationId: ID!` (required)

**Used By:**
- ✅ Game.jsx page
- ✅ GameDetails component

### 3. QUERY_FORMATION
**Location:** `client/src/utils/queries.jsx` (Line 683)
**Variables:**
- `gameId: ID!` (required)
- `organizationId: ID!` (required)

**Used By:**
- ✅ GameDetails component

## Schema Verification

### TypeDefs (Server)
```graphql
type Query {
  games(organizationId: ID!, status: GameStatus): [Game]
  game(gameId: ID!, organizationId: ID!): Game
  formation(gameId: ID!, organizationId: ID!): Formation
}
```

All queries properly defined with `organizationId` parameter.

### Resolvers (Server)
All resolvers properly handle `organizationId`:
- ✅ `games` resolver (Line 325)
- ✅ `game` resolver (Line 379)
- ✅ `formation` resolver (Line 592)

## Components Using Game Queries

| Component | Query | organizationId | Status |
|-----------|-------|----------------|--------|
| Game.jsx | QUERY_GAME | ✅ Required | ✅ Correct |
| GameList | QUERY_GAMES | ✅ Required | ✅ Correct |
| GameDetails | QUERY_GAME, QUERY_FORMATION | ✅ Required | ✅ Correct |
| ComingGames | QUERY_GAMES | ✅ Required | ✅ Fixed |

## Testing Checklist

### ComingGames Component
- [ ] Component loads without 400 errors
- [ ] Shows loading state when organization is loading
- [ ] Displays upcoming games correctly
- [ ] Games are filtered by organization
- [ ] Refetches when switching organizations

### Game Page
- [ ] Game details load correctly
- [ ] No 400 errors in console
- [ ] Formation displays if available
- [ ] Game actions work (respond, vote, etc.)

### GameList Component
- [ ] Games list loads correctly
- [ ] Filtered by current organization
- [ ] Create game button works
- [ ] Delete game works

## Debug Logging Added

### Game.jsx
```javascript
console.log('🎮 Game Page Debug:', {
  gameId,
  organizationId: currentOrganization?._id,
  organizationName: currentOrganization?.name,
  hasOrganization: !!currentOrganization,
  locationState: location.state
});

console.log('🎮 Game Query Debug:', {
  loading: loadingGame,
  hasData: !!gameData,
  hasError: !!gameError,
  errorMessage: gameError?.message,
  gameData: gameData?.game
});
```

## Files Modified

| File | Changes |
|------|---------|
| `client/src/components/ComingGames/index.jsx` | Added organizationId, context, refetch logic, loading state |
| `client/src/pages/Game.jsx` | Added debug logging |

## Related Documentation

- `GRAPHQL_400_ERROR_FIX.md` - Initial profile query fixes
- `PROFILE_VIEW_FIX_SUMMARY.md` - Profile view fixes
- `PROFILE_400_ERROR_DEBUGGING.md` - Debugging guide

## Current Status

✅ All game-related components now properly use `organizationId`
✅ ComingGames component fixed
✅ Debug logging added
✅ Loading states added
✅ Refetch logic implemented

**Expected Result:** No more 400 errors from game-related queries. All game components should load correctly with proper organization filtering.

---
**Date:** January 8, 2026
**Status:** ✅ Fixed
**Impact:** Resolves 400 errors in ComingGames component and ensures all game queries work correctly
