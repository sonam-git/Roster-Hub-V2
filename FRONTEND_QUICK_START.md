# Multi-Tenant Frontend Work - Quick Start Guide

## What We've Completed ✅

### Phase 6: Organization Context & UI (COMPLETE)
1. ✅ Created `OrganizationContext.jsx` - State management for organizations
2. ✅ Created `OrganizationSelector.jsx` - UI component for switching
3. ✅ Integrated into `main.jsx` - Added provider wrapper
4. ✅ Added to `TopHeader` - Desktop header integration
5. ✅ Added to `MainHeader` - Mobile header integration

**Result**: Users can now see and switch between organizations in the UI!

## What's Next 🚀

### Phase 7: Update Queries & Mutations (NEXT)

This is the critical phase where we make all data organization-aware.

#### Quick Start Steps:

1. **Update Core Queries First** (Start Here!)
   ```bash
   # Edit this file:
   /client/src/utils/queries.jsx
   ```

2. **Priority Order**:
   - Start with `QUERY_ME` (add organization fields)
   - Then `QUERY_GAMES` (most visible to users)
   - Then `QUERY_PROFILES` (roster page)
   - Then others (posts, formations, skills)

3. **Pattern to Follow**:
   ```jsx
   // BEFORE
   export const QUERY_GAMES = gql`
     query allGames {
       games {
         _id
         gameName
       }
     }
   `;
   
   // AFTER
   export const QUERY_GAMES = gql`
     query allGames($organizationId: ID!) {
       games(organizationId: $organizationId) {
         _id
         gameName
         organizationId
       }
     }
   `;
   ```

4. **Update Components Using Queries**:
   ```jsx
   // BEFORE
   const { data } = useQuery(QUERY_GAMES);
   
   // AFTER
   import { useOrganization } from '../../contexts/OrganizationContext';
   
   function GameList() {
     const { currentOrganization } = useOrganization();
     
     const { data, loading } = useQuery(QUERY_GAMES, {
       variables: { organizationId: currentOrganization?._id },
       skip: !currentOrganization
     });
     
     if (!currentOrganization) return <LoadingSpinner />;
     // ... rest of component
   }
   ```

### Phase 8: Update Components (AFTER Phase 7)

After queries are updated, update components to use them:

1. **Game Components**:
   - `/client/src/pages/Game.jsx`
   - `/client/src/components/GameList/`
   - `/client/src/components/CustomComingGames/`

2. **Profile Components**:
   - `/client/src/pages/Roster.jsx`
   - `/client/src/components/ProfileList/`

3. **Post Components**:
   - `/client/src/pages/Home.jsx`
   - `/client/src/components/PostsList/`

### Phase 9: Organization Management UI

Create pages for:
1. Organization settings page
2. Member management page
3. Invitation system
4. Usage/analytics dashboard

## Testing Checklist

After each phase, test:
- [ ] Can switch organizations
- [ ] Data updates correctly
- [ ] No console errors
- [ ] Loading states work
- [ ] Error handling works
- [ ] Mobile view works
- [ ] Dark mode works

## Common Issues & Quick Fixes

### Issue: "organizationId is required"
**Fix**: Add `skip: !currentOrganization` to useQuery

### Issue: Data doesn't update on org switch
**Fix**: Add refetch on organization change:
```jsx
useEffect(() => {
  if (currentOrganization) {
    refetch({ organizationId: currentOrganization._id });
  }
}, [currentOrganization]);
```

### Issue: Apollo cache shows old data
**Fix**: Add cache key policies:
```jsx
typePolicies: {
  Query: {
    fields: {
      games: {
        keyArgs: ['organizationId'],
      },
    },
  },
}
```

## Files to Reference

### Context & Components (Already Done)
- `/client/src/contexts/OrganizationContext.jsx` - Hook: `useOrganization()`
- `/client/src/components/OrganizationSelector/OrganizationSelector.jsx` - UI

### Queries (Need to Update)
- `/client/src/utils/queries.jsx` - All queries here
- Check components for inline queries too

### Documentation
- `/MULTI_TENANT_PHASE6_FRONTEND_INTEGRATION.md` - What we just completed
- `/MULTI_TENANT_PHASE7_QUERY_UPDATE_GUIDE.md` - Detailed guide for Phase 7

## Quick Commands

### Start Development Server
```bash
cd client
npm run dev
```

### Check for Inline Queries
```bash
grep -r "useQuery" client/src/components/ | grep -v "node_modules"
grep -r "useMutation" client/src/components/ | grep -v "node_modules"
```

### Find Components Using Specific Query
```bash
grep -r "QUERY_GAMES" client/src/
```

## Development Flow

1. **Update Query in queries.jsx**
2. **Find all components using that query**
3. **Add `useOrganization()` hook to component**
4. **Pass organizationId to query variables**
5. **Test in browser**
6. **Check organization switching works**
7. **Move to next query**

## Example: Complete Update for QUERY_GAMES

### Step 1: Update Query
```jsx
// In /client/src/utils/queries.jsx
export const QUERY_GAMES = gql`
  query allGames($organizationId: ID!) {
    games(organizationId: $organizationId) {
      _id
      gameName
      location
      date
      time
      organizationId
      createdBy {
        _id
        name
      }
    }
  }
`;
```

### Step 2: Update Component
```jsx
// In /client/src/components/GameList/index.jsx
import { useOrganization } from '../../contexts/OrganizationContext';
import { QUERY_GAMES } from '../../utils/queries';
import { useQuery } from '@apollo/client';

function GameList() {
  const { currentOrganization } = useOrganization();
  
  const { data, loading, error, refetch } = useQuery(QUERY_GAMES, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  if (!currentOrganization) {
    return <div>Loading organization...</div>;
  }
  
  if (loading) return <div>Loading games...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Games for {currentOrganization.name}</h2>
      {data.games.map(game => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
}
```

### Step 3: Test
1. Open browser to game page
2. Check data loads
3. Switch organization
4. Verify data updates
5. Check console for errors

## Tips for Success

1. **Start Small**: Update one query at a time
2. **Test Often**: Check browser after each change
3. **Use Console**: Watch for GraphQL errors
4. **Reference Docs**: Check Phase 7 guide for patterns
5. **Ask for Help**: If stuck, review the documentation

## Current Status

```
Phase 1: Backend Models          ✅ COMPLETE
Phase 2: GraphQL Schema          ✅ COMPLETE
Phase 3: Resolvers              ✅ COMPLETE
Phase 4: Authentication         ✅ COMPLETE
Phase 5: Backend Integration    ✅ COMPLETE
Phase 6: Frontend Context & UI  ✅ COMPLETE
Phase 7: Query Updates          🔴 READY TO START
Phase 8: Component Updates      ⏳ WAITING
Phase 9: Management UI          ⏳ WAITING
Phase 10: Advanced Features     ⏳ WAITING
```

## Let's Get Started! 🎯

**Recommended First Task**: Update `QUERY_ME` to include organization fields

This is the foundation query used throughout the app. Once this works, the pattern is established for all other queries.

**File to Edit**: `/client/src/utils/queries.jsx`
**Line**: Around line 151 (search for "export const QUERY_ME")

Good luck! You've got this! 💪

---

**Need Help?** 
- Check `/MULTI_TENANT_PHASE7_QUERY_UPDATE_GUIDE.md` for detailed examples
- Review `/MULTI_TENANT_PHASE6_FRONTEND_INTEGRATION.md` to understand the context setup
- Look at `/client/src/contexts/OrganizationContext.jsx` for available hooks and functions
