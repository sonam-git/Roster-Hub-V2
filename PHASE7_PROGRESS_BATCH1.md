# Phase 7 Progress: Query Updates Complete (Batch 1)

## ✅ Queries Updated

### 1. QUERY_ME ✅
**Status**: Complete  
**Changes**:
- Added `organizationId` field
- Added `currentOrganization` with full details (subscription, usage, limits)
- Added `organizations` array for all user's organizations
- Ready for organization context integration

**Impact**: Foundation query used throughout app now includes organization data

---

### 2. QUERY_PROFILES ✅
**Status**: Complete  
**Changes**:
- Added `$organizationId: ID!` parameter
- Added `organizationId` field to profile data
- Added `organizationId` to nested posts and skills
- Filters profiles by organization

**Usage**: 
```jsx
const { data } = useQuery(QUERY_PROFILES, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization
});
```

---

### 3. QUERY_SINGLE_PROFILE ✅
**Status**: Complete  
**Changes**:
- Added `$organizationId: ID!` parameter
- Added `organizationId` field to profile data
- Added `organizationId` to nested posts and skills
- Requires both profileId and organizationId

**Usage**:
```jsx
const { data } = useQuery(QUERY_SINGLE_PROFILE, {
  variables: { 
    profileId: id,
    organizationId: currentOrganization?._id 
  },
  skip: !currentOrganization
});
```

---

### 4. GET_POSTS ✅
**Status**: Complete  
**Changes**:
- Added `$organizationId: ID!` parameter
- Added `organizationId` field to post data
- Filters posts by organization

**Usage**:
```jsx
const { data } = useQuery(GET_POSTS, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization
});
```

---

### 5. QUERY_GAMES ✅
**Status**: Complete  
**Changes**:
- Added `$organizationId: ID!` parameter (now required)
- Kept optional `$status: GameStatus` parameter
- Added `organizationId` field to game data
- Added `organizationId` to nested formation data
- Filters games by organization

**Usage**:
```jsx
const { data } = useQuery(QUERY_GAMES, {
  variables: { 
    organizationId: currentOrganization?._id,
    status: 'SCHEDULED' // optional
  },
  skip: !currentOrganization
});
```

---

### 6. QUERY_GAME ✅
**Status**: Complete  
**Changes**:
- Added `$organizationId: ID!` parameter
- Added `organizationId` field to game data
- Added `organizationId` to nested formation data
- Requires both gameId and organizationId

**Usage**:
```jsx
const { data } = useQuery(QUERY_GAME, {
  variables: { 
    gameId: id,
    organizationId: currentOrganization?._id 
  },
  skip: !currentOrganization
});
```

---

### 7. QUERY_FORMATION ✅
**Status**: Complete  
**Changes**:
- Added `$organizationId: ID!` parameter
- Added `organizationId` field to formation data
- Requires both gameId and organizationId

**Usage**:
```jsx
const { data } = useQuery(QUERY_FORMATION, {
  variables: { 
    gameId: id,
    organizationId: currentOrganization?._id 
  },
  skip: !currentOrganization
});
```

---

## 📊 Progress Summary

### Queries Updated: 7/10+ ✅
- ✅ QUERY_ME
- ✅ QUERY_PROFILES
- ✅ QUERY_SINGLE_PROFILE
- ✅ GET_POSTS
- ✅ QUERY_GAMES
- ✅ QUERY_GAME
- ✅ QUERY_FORMATION

### Queries Remaining:
- ⏳ RECEIVED_MESSAGES (needs update)
- ⏳ GET_POST (single post query)
- ⏳ Chat/Message queries (need to find)
- ⏳ Skills queries (need to find)

---

## 🎯 Next Steps

### Phase 7B: Update Remaining Queries
1. **RECEIVED_MESSAGES** - Add organizationId filter
2. **GET_POST** - Add organizationId parameter
3. **Skills Queries** - Find and update
4. **Chat Queries** - Find and update
5. **Message Queries** - Find and update

### Phase 7C: Update Components to Use New Queries

#### High Priority Components:
1. **Game Components** ⚡ START HERE
   - `/client/src/pages/Game.jsx`
   - `/client/src/components/GameList/`
   - `/client/src/components/CustomComingGames/`
   
2. **Profile Components**
   - `/client/src/pages/Roster.jsx`
   - `/client/src/pages/Profile.jsx`
   - `/client/src/components/ProfileList/`

3. **Post Components**
   - `/client/src/pages/Home.jsx`
   - `/client/src/components/PostsList/`

4. **Formation Components**
   - `/client/src/components/FormationBoard/`
   - `/client/src/components/FormationSection/`

---

## 🔧 Component Update Pattern

### Standard Pattern:
```jsx
import { useOrganization } from '../../contexts/OrganizationContext';
import { useQuery } from '@apollo/client';
import { QUERY_GAMES } from '../../utils/queries';

function MyComponent() {
  // 1. Get organization context
  const { currentOrganization } = useOrganization();
  
  // 2. Query with organizationId
  const { data, loading, error, refetch } = useQuery(QUERY_GAMES, {
    variables: { 
      organizationId: currentOrganization?._id 
    },
    skip: !currentOrganization
  });
  
  // 3. Refetch on organization change
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  // 4. Handle loading states
  if (!currentOrganization) {
    return <LoadingSpinner message="Loading organization..." />;
  }
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 5. Render with data
  return (
    <div>
      <h1>Games for {currentOrganization.name}</h1>
      {data.games.map(game => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### For Each Updated Query:
- [ ] Query loads with organizationId
- [ ] Data is filtered by organization
- [ ] No errors in console
- [ ] Switching organizations updates data
- [ ] No cross-organization data leaks

### Completed Tests:
- [ ] QUERY_ME - Test in browser
- [ ] QUERY_PROFILES - Test roster page
- [ ] QUERY_SINGLE_PROFILE - Test profile page
- [ ] GET_POSTS - Test home page
- [ ] QUERY_GAMES - Test game schedule
- [ ] QUERY_GAME - Test game details
- [ ] QUERY_FORMATION - Test formation board

---

## 📁 Files Modified

### `/client/src/utils/queries.jsx`
**Lines Modified**: ~450 lines updated
**Breaking Changes**: Yes - all queries now require organizationId
**Backward Compatible**: No - components must be updated

---

## ⚠️ Important Notes

### Breaking Changes:
All updated queries now **require** `organizationId` as a variable. Components using these queries will need to:
1. Import `useOrganization` hook
2. Pass `organizationId` in variables
3. Handle loading state with `skip: !currentOrganization`

### No Backward Compatibility:
These changes are **not** backward compatible. All components using these queries **must** be updated to include organization context.

### Migration Path:
1. ✅ Update queries (DONE)
2. ⏳ Update components (NEXT)
3. ⏳ Test thoroughly
4. ⏳ Deploy

---

## 🚀 Quick Start for Component Updates

### Start with Game Page:
```bash
# File to edit:
/client/src/pages/Game.jsx
```

**Steps**:
1. Import useOrganization hook
2. Get currentOrganization
3. Pass to QUERY_GAMES
4. Add skip condition
5. Add refetch on org change
6. Test in browser

---

## 📊 Overall Progress

```
Phase 7: Frontend Query Updates

Core Queries:          ███████████████████░░░ 70% (7/10)
Component Updates:     ░░░░░░░░░░░░░░░░░░░░░░  0% (0/15)
Testing:               ░░░░░░░░░░░░░░░░░░░░░░  0%

Overall Phase 7:       ██████░░░░░░░░░░░░░░░░ 25%
```

---

## 💡 Tips for Success

1. **Test Frequently**: Check browser after each component update
2. **Use Console**: Watch for GraphQL errors in console
3. **Check Network Tab**: Verify queries include organizationId
4. **Clear Cache**: Sometimes need to clear Apollo cache
5. **One at a Time**: Update one component at a time

---

## 🎉 Achievements So Far

✅ **Foundation Established**: QUERY_ME includes full organization data  
✅ **Core Queries Updated**: Games, Profiles, Posts all organization-aware  
✅ **Consistent Pattern**: All queries follow same pattern  
✅ **Type Safety**: GraphQL enforces organizationId requirement  
✅ **Ready for Integration**: Components can now use organization context  

---

**Status**: 🟡 Phase 7 - 70% Complete (Queries), 0% Complete (Components)  
**Date**: January 7, 2026  
**Next Step**: Start updating Game components to use new queries  
**Estimated Time Remaining**: 3-4 hours for component updates
