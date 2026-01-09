# Phase 7 Implementation Checklist

## Overview
This checklist guides you through updating all queries and mutations to support organization context. Complete tasks in order for best results.

---

## 🎯 Phase 7 Goals
- [ ] Update all GraphQL queries to include `organizationId`
- [ ] Update all GraphQL mutations to include `organizationId`
- [ ] Update components to use organization context
- [ ] Test organization switching
- [ ] Ensure no data leaks between organizations

---

## 📋 Step-by-Step Implementation

### Step 1: Update QUERY_ME (Foundation) ⚡ START HERE
**File**: `/client/src/utils/queries.jsx` (line ~151)

- [ ] Add organization fields to QUERY_ME
```graphql
query me {
  me {
    _id
    name
    email
    # ADD THESE:
    currentOrganization {
      _id
      name
      slug
      subscription { plan status }
      usage { memberCount gameCount }
      limits { maxMembers maxGames }
    }
    organizations {
      _id
      name
      slug
      role
    }
  }
}
```

- [ ] Test in browser
- [ ] Verify organization data loads
- [ ] Check console for errors

---

### Step 2: Update Game Queries

#### QUERY_GAMES
**File**: `/client/src/utils/queries.jsx` (line ~434)

- [ ] Add `organizationId` parameter
```graphql
query allGames($organizationId: ID!) {
  games(organizationId: $organizationId) {
    _id
    gameName
    organizationId
    # ...other fields
  }
}
```

#### QUERY_GAME
**File**: `/client/src/utils/queries.jsx` (line ~513)

- [ ] Add `organizationId` parameter
```graphql
query singleGame($gameId: ID!, $organizationId: ID!) {
  game(gameId: $gameId, organizationId: $organizationId) {
    _id
    organizationId
    # ...other fields
  }
}
```

**Components to Update**:
- [ ] `/client/src/pages/Game.jsx`
- [ ] `/client/src/components/GameList/`
- [ ] `/client/src/components/CustomComingGames/`

**Update Pattern**:
```jsx
import { useOrganization } from '../../contexts/OrganizationContext';

function GameComponent() {
  const { currentOrganization } = useOrganization();
  
  const { data, loading } = useQuery(QUERY_GAMES, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  if (!currentOrganization) return <LoadingSpinner />;
  // ...rest of component
}
```

**Testing**:
- [ ] Game list loads correctly
- [ ] Switching organizations updates game list
- [ ] No games from other organizations visible

---

### Step 3: Update Profile Queries

#### QUERY_PROFILES
**File**: `/client/src/utils/queries.jsx` (line ~3)

- [ ] Add `organizationId` parameter
```graphql
query allProfiles($organizationId: ID!) {
  profiles(organizationId: $organizationId) {
    _id
    name
    organizationId
    # ...other fields
  }
}
```

#### QUERY_SINGLE_PROFILE
**File**: `/client/src/utils/queries.jsx` (line ~77)

- [ ] Add `organizationId` parameter
```graphql
query singleProfile($profileId: ID!, $organizationId: ID!) {
  profile(profileId: $profileId, organizationId: $organizationId) {
    _id
    organizationId
    # ...other fields
  }
}
```

**Components to Update**:
- [ ] `/client/src/pages/Roster.jsx`
- [ ] `/client/src/pages/Profile.jsx`
- [ ] `/client/src/components/ProfileList/`

**Testing**:
- [ ] Roster page loads correctly
- [ ] Profile page loads correctly
- [ ] Switching organizations updates profiles

---

### Step 4: Update Post Queries

**Components to Check**:
- [ ] `/client/src/pages/Home.jsx`
- [ ] `/client/src/components/PostsList/`
- [ ] `/client/src/components/Post/`

**Tasks**:
- [ ] Find/create GET_POSTS query
- [ ] Add `organizationId` parameter
- [ ] Update components to use organization context
- [ ] Test post creation
- [ ] Test post list filtering

---

### Step 5: Update Formation Queries

#### QUERY_FORMATION
**File**: `/client/src/utils/queries.jsx` (line ~637)

- [ ] Add `organizationId` parameter
```graphql
query getFormation($gameId: ID!, $organizationId: ID!) {
  formation(gameId: $gameId, organizationId: $organizationId) {
    _id
    organizationId
    # ...other fields
  }
}
```

**Components to Update**:
- [ ] `/client/src/components/FormationBoard/`
- [ ] `/client/src/components/FormationSection/`

**Testing**:
- [ ] Formation loads for correct game
- [ ] Formation creates in correct organization
- [ ] Switching organizations updates formation view

---

### Step 6: Update Skill Queries

**Components to Check**:
- [ ] `/client/src/pages/Skill.jsx`
- [ ] `/client/src/components/AllSkillsList/`

**Tasks**:
- [ ] Find/create GET_SKILLS query
- [ ] Add `organizationId` parameter
- [ ] Update components
- [ ] Test skill creation
- [ ] Test skill list filtering

---

### Step 7: Update Message/Chat Queries

**Components to Check**:
- [ ] `/client/src/pages/Message.jsx`
- [ ] `/client/src/components/ChatPopup/`
- [ ] `/client/src/components/MessageList/`

**Tasks**:
- [ ] Find/create GET_CHATS query
- [ ] Find/create GET_MESSAGES query
- [ ] Add `organizationId` parameters
- [ ] Update components
- [ ] Test chat functionality
- [ ] Test message sending

---

### Step 8: Update Mutations

**File**: `/client/src/utils/mutations.jsx` (if exists) or inline in components

#### CREATE_GAME
- [ ] Add `organizationId` to input
```graphql
mutation createGame($gameInput: GameInput!, $organizationId: ID!) {
  createGame(gameInput: $gameInput, organizationId: $organizationId) {
    _id
    organizationId
  }
}
```

#### UPDATE_GAME
- [ ] Add `organizationId` for validation

#### ADD_POST
- [ ] Add `organizationId` to input

#### SEND_MESSAGE
- [ ] Add `organizationId` to input

#### CREATE_FORMATION
- [ ] Add `organizationId` to input

#### ADD_SKILL
- [ ] Add `organizationId` to input

**Testing for Each Mutation**:
- [ ] Creates data in correct organization
- [ ] Validates organization membership
- [ ] Updates UI immediately
- [ ] Appears in organization's data

---

## 🧪 Testing Checklist

### Functional Testing

#### Login Flow
- [ ] User can log in
- [ ] Organization context loads
- [ ] Default organization selected
- [ ] Organization selector appears

#### Data Display
- [ ] Games list shows correct organization's games
- [ ] Profiles list shows correct organization's members
- [ ] Posts show correct organization's posts
- [ ] All data is organization-scoped

#### Organization Switching
- [ ] Can open organization dropdown
- [ ] Can see all user's organizations
- [ ] Can click to switch organization
- [ ] All data updates on switch
- [ ] No errors in console
- [ ] Loading states show properly

#### Data Creation
- [ ] Can create game in current organization
- [ ] Can create post in current organization
- [ ] Can send message in current organization
- [ ] Created data appears immediately
- [ ] Created data only in current organization

#### Data Isolation
- [ ] Organization A's data not visible in Organization B
- [ ] Switching back shows Organization A's data again
- [ ] No cross-organization data leaks
- [ ] Each organization has independent data

### Edge Cases
- [ ] User with no organizations (handle gracefully)
- [ ] User with one organization (no need to switch)
- [ ] User with many organizations (dropdown scrolls)
- [ ] Switching while queries loading (no errors)
- [ ] Network errors during switch (error handling)
- [ ] Invalid organization IDs (validation)

### Performance
- [ ] Queries run efficiently
- [ ] No unnecessary re-fetches
- [ ] Organization switch is fast
- [ ] Apollo cache works correctly
- [ ] No memory leaks

### UI/UX
- [ ] Loading states show properly
- [ ] Error messages are user-friendly
- [ ] Organization selector is intuitive
- [ ] Plan badges show correct colors
- [ ] Mobile view works well
- [ ] Dark mode works correctly

---

## 🐛 Common Issues & Solutions

### Issue: "organizationId is required" Error
**Solution**: Add `skip: !currentOrganization` to useQuery
```jsx
const { data } = useQuery(QUERY_GAMES, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization // <-- Add this
});
```

### Issue: Data doesn't update on organization switch
**Solution**: Add refetch on organization change
```jsx
useEffect(() => {
  if (currentOrganization) {
    refetch({ organizationId: currentOrganization._id });
  }
}, [currentOrganization, refetch]);
```

### Issue: Apollo cache shows stale data
**Solution**: Configure cache key policies
```jsx
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          games: { keyArgs: ['organizationId'] },
          profiles: { keyArgs: ['organizationId'] },
        },
      },
    },
  }),
});
```

### Issue: Component renders before organization loads
**Solution**: Add loading check
```jsx
if (!currentOrganization) {
  return <LoadingSpinner message="Loading organization..." />;
}
```

---

## 📝 Notes & Tips

### Development Tips
1. **Work incrementally**: Update one query at a time
2. **Test frequently**: Check browser after each change
3. **Use console**: Watch for GraphQL errors
4. **Clear cache**: Sometimes need to clear Apollo cache
5. **Check network**: Use Network tab to see queries

### Code Patterns

#### Standard Query Update
```jsx
// 1. Import hook
import { useOrganization } from '../../contexts/OrganizationContext';

// 2. Get organization
const { currentOrganization } = useOrganization();

// 3. Use in query
const { data, loading, error } = useQuery(MY_QUERY, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization
});

// 4. Handle loading
if (!currentOrganization) return <LoadingSpinner />;
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// 5. Use data
return <MyComponent data={data} />;
```

#### Standard Mutation Update
```jsx
const { currentOrganization } = useOrganization();

const [createGame] = useMutation(CREATE_GAME, {
  variables: {
    gameInput: formData,
    organizationId: currentOrganization._id
  },
  refetchQueries: [
    { 
      query: QUERY_GAMES, 
      variables: { organizationId: currentOrganization._id }
    }
  ]
});
```

---

## 📊 Progress Tracking

### Queries Updated
- [ ] QUERY_ME
- [ ] QUERY_GAMES
- [ ] QUERY_GAME
- [ ] QUERY_PROFILES
- [ ] QUERY_SINGLE_PROFILE
- [ ] QUERY_FORMATION
- [ ] GET_POSTS (if exists)
- [ ] GET_SKILLS (if exists)
- [ ] GET_CHATS (if exists)
- [ ] GET_MESSAGES (if exists)

### Mutations Updated
- [ ] CREATE_GAME
- [ ] UPDATE_GAME
- [ ] ADD_POST
- [ ] SEND_MESSAGE
- [ ] CREATE_FORMATION
- [ ] ADD_SKILL
- [ ] ADD_COMMENT

### Components Updated
- [ ] Game page
- [ ] GameList
- [ ] CustomComingGames
- [ ] Roster page
- [ ] Profile page
- [ ] ProfileList
- [ ] Home page
- [ ] PostsList
- [ ] FormationBoard
- [ ] Skill page
- [ ] AllSkillsList
- [ ] Message page
- [ ] ChatPopup

### Testing Complete
- [ ] Functional testing
- [ ] Edge case testing
- [ ] Performance testing
- [ ] UI/UX testing

---

## 🎯 Success Criteria

### Phase 7 is complete when:
- ✅ All queries include organizationId parameter
- ✅ All mutations include organizationId parameter
- ✅ All components use organization context
- ✅ Organization switching works perfectly
- ✅ No data leaks between organizations
- ✅ All tests pass
- ✅ No console errors
- ✅ Performance is acceptable

---

## 📚 Reference Documents

- `/MULTI_TENANT_PHASE6_FRONTEND_INTEGRATION.md` - Previous phase
- `/MULTI_TENANT_PHASE7_QUERY_UPDATE_GUIDE.md` - Detailed guide
- `/FRONTEND_QUICK_START.md` - Quick reference
- `/MULTI_TENANT_ARCHITECTURE.md` - Architecture overview
- `/PHASE6_COMPLETE_SUMMARY.md` - Phase 6 summary

---

## 🚀 After Phase 7

Once this checklist is complete, you'll be ready for:
- **Phase 8**: Organization management UI (settings, invitations)
- **Phase 9**: Advanced features (analytics, billing)
- **Phase 10**: Production deployment

---

**Start Date**: ________________
**Estimated Completion**: 4-6 hours
**Status**: 🔴 Not Started

**Good luck! You've got this!** 💪

---

_Checklist Last Updated: January 7, 2026_
