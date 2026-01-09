# 🔧 Troubleshooting 400 Errors in Multi-Tenant GraphQL Apps

## Quick Diagnosis Guide

### Step 1: Identify the Error
```
❌ Response not successful: Received status code 400
❌ ApolloError: Response not successful: Received status code 400
❌ ServerError: Response not successful: Received status code 400
```

### Step 2: Open Browser DevTools
1. Press `F12` or `Cmd+Option+I` (Mac)
2. Go to **Network** tab
3. Filter by **graphql**
4. Look for requests with red status (400)

### Step 3: Inspect the Failed Request
Click on the failed request and check:
- **Headers** → Request URL
- **Payload** → Request body
- **Preview** → Error message

---

## Common 400 Error Causes

### ❌ Cause 1: Missing organizationId
**Symptom:** Query requires organizationId but it's not provided

**Example:**
```jsx
// ❌ WRONG
{ query: QUERY_GAME, variables: { gameId } }
```

**Fix:**
```jsx
// ✅ CORRECT
{ 
  query: QUERY_GAME, 
  variables: { 
    gameId,
    organizationId: currentOrganization?._id 
  } 
}
```

---

### ❌ Cause 2: Null/Undefined organizationId
**Symptom:** organizationId is passed but value is null or undefined

**Example:**
```jsx
// ❌ WRONG - can be null
const orgId = currentOrganization._id;
```

**Fix:**
```jsx
// ✅ CORRECT - safe with optional chaining
const orgId = currentOrganization?._id;

// Or check before using:
if (!currentOrganization) {
  console.error('No organization selected');
  return;
}
```

---

### ❌ Cause 3: Wrong Variable Names
**Symptom:** Variable name doesn't match GraphQL schema

**Example:**
```jsx
// ❌ WRONG - typo in variable name
{ query: QUERY_GAME, variables: { gameId, orgId } }
```

**Fix:**
```jsx
// ✅ CORRECT - matches schema
{ query: QUERY_GAME, variables: { gameId, organizationId } }
```

---

### ❌ Cause 4: Missing Variables in Refetch Queries
**Symptom:** Mutation succeeds but refetch queries fail

**Example:**
```jsx
// ❌ WRONG
const [updateGame] = useMutation(UPDATE_GAME, {
  refetchQueries: [
    { query: QUERY_GAME, variables: { gameId } },  // Missing orgId!
  ],
});
```

**Fix:**
```jsx
// ✅ CORRECT
const [updateGame] = useMutation(UPDATE_GAME, {
  refetchQueries: [
    { 
      query: QUERY_GAME, 
      variables: { 
        gameId,
        organizationId: currentOrganization?._id 
      } 
    },
  ],
});
```

---

## Debugging Workflow

### 1. Check Console
```javascript
// Add debugging logs:
console.log('Organization:', currentOrganization);
console.log('Organization ID:', currentOrganization?._id);
console.log('Variables:', { gameId, organizationId: currentOrganization?._id });
```

### 2. Check Network Request
Look at the actual request payload:
```json
{
  "query": "query Game($gameId: ID!, $organizationId: ID!) {...}",
  "variables": {
    "gameId": "123abc",
    "organizationId": "456def"  // ← Make sure this exists!
  }
}
```

### 3. Check GraphQL Schema
Verify the query signature matches:
```graphql
type Query {
  game(gameId: ID!, organizationId: ID!): Game!  # Both required!
}
```

### 4. Check Backend Resolver
Verify resolver expects the parameters:
```javascript
game: async (_, { gameId, organizationId }, context) => {
  // Both parameters should be available here
}
```

---

## Quick Fix Checklist

When you see a 400 error, check these:

- [ ] Is `organizationId` included in query variables?
- [ ] Is `currentOrganization` available in context?
- [ ] Are you using optional chaining (`?.`)?
- [ ] Do variable names match the GraphQL schema?
- [ ] Are all refetch queries properly configured?
- [ ] Is the organization context provider wrapping your component?
- [ ] Are you checking for null before using organization?

---

## Fix Templates

### For Queries
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";

const { currentOrganization } = useOrganization();

const { data, loading, error } = useQuery(QUERY_GAMES, {
  variables: {
    organizationId: currentOrganization?._id,  // ✅ Always include
  },
  skip: !currentOrganization,  // ✅ Don't run if no org
});
```

### For Mutations
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";

const { currentOrganization } = useOrganization();

const [mutateFunction] = useMutation(SOME_MUTATION, {
  variables: {
    organizationId: currentOrganization?._id,  // ✅ Always include
    // ... other variables
  },
  refetchQueries: [
    {
      query: SOME_QUERY,
      variables: {
        organizationId: currentOrganization?._id,  // ✅ Always include
        // ... other variables
      }
    }
  ],
});
```

### For Lazy Queries
```jsx
const [loadGames, { data, loading }] = useLazyQuery(QUERY_GAMES);

const handleLoad = () => {
  if (!currentOrganization) {
    console.error('No organization selected');
    return;
  }
  
  loadGames({
    variables: {
      organizationId: currentOrganization._id,  // ✅ Always include
    }
  });
};
```

---

## Testing Your Fix

### 1. Console Check
```javascript
// Should see no errors:
✅ No red errors in console
✅ No 400 status codes
✅ Successful query/mutation logs
```

### 2. Network Check
```
Filter: graphql
Status: Should all be 200 OK ✅
```

### 3. UI Check
```
✅ Data loads correctly
✅ Updates save successfully
✅ Success messages appear
✅ No error modals
```

---

## Prevention Strategy

### 1. Always Use Context
```jsx
// At the top of every component that uses org-specific data:
const { currentOrganization } = useOrganization();
```

### 2. Always Check for Null
```jsx
if (!currentOrganization) {
  return <div>Please select an organization</div>;
}
```

### 3. Use TypeScript (Optional)
```typescript
interface QueryVariables {
  organizationId: string;  // Required!
  gameId?: string;
}
```

### 4. Create Reusable Hooks
```jsx
// Custom hook to ensure organizationId is always included
const useOrgQuery = (query, options = {}) => {
  const { currentOrganization } = useOrganization();
  
  return useQuery(query, {
    ...options,
    variables: {
      ...options.variables,
      organizationId: currentOrganization?._id,
    },
    skip: !currentOrganization || options.skip,
  });
};
```

---

## Real-World Example: UPDATE_GAME Fix

### The Problem
```jsx
// Component was doing this:
const [updateGame] = useMutation(UPDATE_GAME, {
  refetchQueries: [
    { query: QUERY_GAME, variables: { gameId } },  // ❌ 400 Error!
  ],
});
```

### The Fix
```jsx
// Changed to:
const { currentOrganization } = useOrganization();

const [updateGame] = useMutation(UPDATE_GAME, {
  refetchQueries: [
    { 
      query: QUERY_GAME, 
      variables: { 
        gameId,
        organizationId: currentOrganization?._id  // ✅ Fixed!
      } 
    },
  ],
});
```

### The Result
- ✅ No more 400 errors
- ✅ Data refreshes correctly
- ✅ Multi-tenant isolation maintained

---

## Common Patterns in This App

### Pattern 1: Game Queries
```jsx
// All game queries need organizationId:
QUERY_GAME(gameId, organizationId)
QUERY_GAMES(organizationId)
QUERY_FORMATIONS(organizationId)
```

### Pattern 2: Profile Queries
```jsx
// All profile queries need organizationId:
QUERY_PROFILES(organizationId)
QUERY_PROFILE(profileId, organizationId)
```

### Pattern 3: Post/Chat Queries
```jsx
// All social queries need organizationId:
QUERY_POSTS(organizationId)
QUERY_MESSAGES(organizationId)
```

### Pattern 4: Skill Queries
```jsx
// All skill queries need organizationId:
QUERY_SKILLS(organizationId)
REACT_TO_SKILL(skillId, organizationId, emoji)
```

---

## When to Ask for Help

If you've tried all the above and still see 400 errors:

1. **Share the network request:**
   - Right-click failed request → Copy → Copy as cURL
   
2. **Share the console output:**
   - Copy any error messages
   
3. **Share the component code:**
   - The query/mutation implementation
   - How you're using the organization context
   
4. **Share the GraphQL schema:**
   - The query/mutation definition in typeDefs
   
5. **Share the backend resolver:**
   - How the resolver handles the request

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  400 Error? Check These 3 Things:           │
├─────────────────────────────────────────────┤
│  1. Is organizationId in variables? ✅      │
│  2. Is currentOrganization available? ✅    │
│  3. Using optional chaining (?.)?  ✅       │
└─────────────────────────────────────────────┘
```

---

**Last Updated:** January 9, 2026
**Status:** Ready for Production Use ✅
