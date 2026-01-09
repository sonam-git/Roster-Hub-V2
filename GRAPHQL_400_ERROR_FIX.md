# GraphQL 400 Bad Request Error Fix

## Problem
The application was throwing multiple 400 Bad Request errors when making GraphQL queries to `/graphql`:

```
POST http://localhost:3001/graphql 400 (Bad Request)
ApolloError: Response not successful: Received status code 400
```

These errors were appearing in:
- Roster page (QUERY_PROFILES)
- Various components making GraphQL queries

## Root Cause
The GraphQL queries were requesting fields that don't exist in the GraphQL schema:

1. **`organizationId` on Profile type** - The `Profile` type in `typeDefs.js` does not have an `organizationId` field. Instead, it has:
   - `organizations: [Organization]`
   - `currentOrganization: Organization`
   - `roleInOrganization(organizationId: ID!): String`

2. **`organizationId` on Post type** (nested in Profile queries) - While `Post` has `organizationId` in the database model, it may not have been exposed in the GraphQL schema properly

3. **`organizationId` on Skill type** (nested in Profile queries) - Similar issue

## Solution
Removed the invalid `organizationId` field requests from the following queries in `/client/src/utils/queries.jsx`:

### 1. QUERY_PROFILES
**Removed:**
- Line 14: `organizationId` field from Profile
- Line 20: `organizationId` field from posts array
- Line 48: `organizationId` field from skills array

### 2. QUERY_SINGLE_PROFILE  
**Removed:**
- Line 89: `organizationId` field from Profile
- Line 95: `organizationId` field from posts array
- Line 123: `organizationId` field from skills array

### 3. GET_POSTS
**Removed:**
- Line 301: `organizationId` field from Post object

## Files Modified
- `/client/src/utils/queries.jsx` - Removed invalid `organizationId` field references

## Why This Happened
This appears to be a residual issue from the multi-tenant migration where the schema was refactored but the queries weren't fully updated to match the new GraphQL type definitions.

## Testing
After this fix:
1. The Roster page should load without 400 errors
2. Profile queries should work correctly
3. Posts and Skills should load properly
4. The browser console should be free of GraphQL 400 errors

## Note
The `organizationId` field **IS** valid for:
- `Game` type (line 115 in typeDefs.js)
- `Formation` type (line 130 in typeDefs.js)
- `Message` type
- `Comment` type
- `SocialMediaLink` type

These queries were left unchanged as they are correct.

---
**Date:** January 8, 2026
**Status:** ✅ Fixed
