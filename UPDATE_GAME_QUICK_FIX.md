# UPDATE_GAME Quick Reference 🎮

## The Problem
**Symptom:** 400 error when updating games
**Message:** "Response not successful: Received status code 400"
**Cause:** Missing `organizationId` in refetch queries

## The Fix (One-Line Summary)
Always pass `organizationId: currentOrganization?._id` to ALL game queries in refetch configuration.

---

## Code Pattern to Follow

### ❌ WRONG - Will cause 400 error
```jsx
const [updateGame] = useMutation(UPDATE_GAME, {
  refetchQueries: [
    { query: QUERY_GAME, variables: { gameId } },  // Missing organizationId!
    { query: QUERY_GAMES },                        // Missing organizationId!
  ],
});
```

### ✅ CORRECT - Works perfectly
```jsx
const [updateGame] = useMutation(UPDATE_GAME, {
  refetchQueries: [
    { 
      query: QUERY_GAME, 
      variables: { 
        gameId,
        organizationId: currentOrganization?._id  // ✅ Required!
      } 
    },
    { 
      query: QUERY_GAMES, 
      variables: { 
        organizationId: currentOrganization?._id  // ✅ Required!
      } 
    },
  ],
});
```

---

## Multi-Tenant Rule
**Golden Rule:** In a multi-tenant app, EVERY query that fetches organization-specific data MUST include `organizationId`.

### Queries that ALWAYS need organizationId:
- ✅ `QUERY_GAME` → needs `organizationId`
- ✅ `QUERY_GAMES` → needs `organizationId`
- ✅ `QUERY_PROFILES` → needs `organizationId`
- ✅ `QUERY_POSTS` → needs `organizationId`
- ✅ `QUERY_FORMATIONS` → needs `organizationId`
- ✅ Any custom game/player queries

### How to get organizationId:
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";

const { currentOrganization } = useOrganization();
const orgId = currentOrganization?._id;  // Use optional chaining!
```

---

## When Updating Any Game Mutation

### Checklist:
1. ✅ Import `useOrganization` hook
2. ✅ Get `currentOrganization` from context
3. ✅ Pass `organizationId` to mutation variables
4. ✅ Pass `organizationId` to ALL refetch queries
5. ✅ Use optional chaining (`?.`) for safety
6. ✅ Test in browser console (should see no 400 errors)

### Template:
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";

const MyGameComponent = () => {
  const { currentOrganization } = useOrganization();
  
  const [updateGame] = useMutation(UPDATE_GAME, {
    refetchQueries: [
      { 
        query: QUERY_GAME, 
        variables: { 
          gameId,
          organizationId: currentOrganization?._id 
        } 
      },
      { 
        query: QUERY_GAMES, 
        variables: { 
          organizationId: currentOrganization?._id 
        } 
      },
    ],
    onCompleted: () => {
      console.log('✅ Update successful!');
    },
  });
  
  const handleUpdate = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    await updateGame({
      variables: {
        gameId,
        organizationId: currentOrganization._id,
        input: { /* your updates */ }
      }
    });
  };
};
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting organizationId in refetchQueries
```jsx
refetchQueries: [
  { query: QUERY_GAME, variables: { gameId } },  // 400 error!
]
```

### ❌ Mistake 2: Not using optional chaining
```jsx
organizationId: currentOrganization._id  // Can crash if null!
```

### ❌ Mistake 3: Hardcoding status filters
```jsx
{ query: QUERY_GAMES, variables: { status: "PENDING" } }  // Missing orgId!
```

### ✅ Correct Approach
```jsx
refetchQueries: [
  { 
    query: QUERY_GAME, 
    variables: { 
      gameId,
      organizationId: currentOrganization?._id 
    } 
  },
]
```

---

## Debugging 400 Errors

### If you see 400 error:
1. Open browser DevTools → Network tab
2. Find the failing GraphQL request
3. Check "Request Payload"
4. Look for missing `organizationId` in query variables
5. Add it using the pattern above
6. Test again

### Expected Request Payload:
```json
{
  "query": "query Game($gameId: ID!, $organizationId: ID!) { ... }",
  "variables": {
    "gameId": "123abc",
    "organizationId": "456def"  // ← This must be present!
  }
}
```

---

## Files Fixed
- ✅ `/client/src/components/GameUpdate/index.jsx`
- ✅ `/client/src/components/GameUpdateModal/index.jsx`

## See Also
- `UPDATE_GAME_FIX_COMPLETE.md` - Full documentation
- `MULTI_TENANT_ARCHITECTURE.md` - Architecture overview
- `GAME_FEATURE_QUICK_REFERENCE.md` - Game system guide

---

**Last Updated:** January 9, 2026
**Status:** ✅ Production Ready
