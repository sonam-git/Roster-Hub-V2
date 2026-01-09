# Formation Mutations - Quick Fix Reference 🎯

## The Problem
**Symptom:** 400 error when creating formations  
**Message:** "Response not successful: Received status code 400"  
**Cause:** Missing `organizationId` in mutation definitions  

---

## The Fix (One-Line Summary)
Add `$organizationId: ID!` parameter to all formation mutation definitions and pass it to the mutation call.

---

## What Was Fixed

### ❌ Before (Broken)
```jsx
export const CREATE_FORMATION = gql`
  mutation createFormation($gameId: ID!, $formationType: String!) {
    createFormation(gameId: $gameId, formationType: $formationType) {
      // ...
    }
  }
`;
```

### ✅ After (Fixed)
```jsx
export const CREATE_FORMATION = gql`
  mutation createFormation($gameId: ID!, $formationType: String!, $organizationId: ID!) {
    createFormation(gameId: $gameId, formationType: $formationType, organizationId: $organizationId) {
      // ...
    }
  }
`;
```

---

## All Fixed Mutations

1. ✅ **CREATE_FORMATION** - Added `$organizationId: ID!`
2. ✅ **UPDATE_FORMATION** - Added `$organizationId: ID!`
3. ✅ **DELETE_FORMATION** - Added `$organizationId: ID!`
4. ✅ **LIKE_FORMATION** - Added `$organizationId: ID!`
5. ✅ **ADD_FORMATION_COMMENT** - Added `$organizationId: ID!`
6. ✅ **UPDATE_FORMATION_COMMENT** - Added `$organizationId: ID!`
7. ✅ **DELETE_FORMATION_COMMENT** - Added `$organizationId: ID!`
8. ✅ **LIKE_FORMATION_COMMENT** - Added `$organizationId: ID!`

---

## Pattern to Follow

### For Any Formation Mutation
```jsx
// 1. Define mutation with organizationId parameter
export const SOME_FORMATION_MUTATION = gql`
  mutation SomeMutation($param1: Type!, $organizationId: ID!) {
    someMutation(param1: $param1, organizationId: $organizationId) {
      // fields
    }
  }
`;

// 2. Use mutation in component
const { currentOrganization } = useOrganization();

const [mutate] = useMutation(SOME_FORMATION_MUTATION, {
  variables: {
    param1: value,
    organizationId: currentOrganization._id  // Always include!
  }
});
```

---

## Quick Test

1. Open a game details page
2. Select a formation type (e.g., 1-4-3-3)
3. Click "Create Formation"
4. ✅ Should work without 400 errors!

---

## Components That Use These Mutations

- **FormationSection** - CREATE, UPDATE, DELETE
- **FormationLikeButton** - LIKE_FORMATION
- **FormationCommentInput** - ADD_COMMENT
- **FormationCommentItem** - UPDATE, DELETE, LIKE comment

All components were already passing `organizationId` correctly!  
Only the mutation definitions needed fixing.

---

## Common Mistake to Avoid

### ❌ Don't Do This
```jsx
// Missing organizationId in mutation definition
export const CREATE_FORMATION = gql`
  mutation createFormation($gameId: ID!, $formationType: String!) {
    // Even if component passes it, this will fail!
  }
`;
```

### ✅ Do This
```jsx
// Include organizationId in BOTH places
export const CREATE_FORMATION = gql`
  mutation createFormation($gameId: ID!, $formationType: String!, $organizationId: ID!) {
    createFormation(gameId: $gameId, formationType: $formationType, organizationId: $organizationId) {
      // Now it works!
    }
  }
`;
```

---

## Verification Checklist

After fixing any formation mutation:

- [ ] Added `$organizationId: ID!` to mutation parameters
- [ ] Passed `organizationId: $organizationId` to mutation call
- [ ] No TypeScript/linting errors
- [ ] Tested in browser (no 400 errors)
- [ ] Multi-tenant isolation verified

---

## Related Docs

- **FORMATION_MUTATIONS_FIX_COMPLETE.md** - Complete documentation
- **TROUBLESHOOTING_400_ERRORS.md** - General 400 error debugging
- **MULTI_TENANT_ARCHITECTURE.md** - Architecture overview

---

**Last Updated:** January 9, 2026  
**Status:** ✅ Production Ready  
**Impact:** 8 mutations fixed, formation system fully functional
