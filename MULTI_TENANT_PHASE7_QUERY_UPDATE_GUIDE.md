# Multi-Tenant Phase 7: Query & Mutation Updates Guide

## Overview
This guide documents all GraphQL queries and mutations that need to be updated to support organization context. Each query/mutation should include `organizationId` as a variable and filter results accordingly.

## Status Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete

## Queries to Update

### 1. Profile Queries

#### QUERY_PROFILES 🔴
**File**: `client/src/utils/queries.jsx`
**Current**: `query allProfiles`
**Update**: Add `organizationId` parameter
```graphql
query allProfiles($organizationId: ID!) {
  profiles(organizationId: $organizationId) {
    # ...fields
  }
}
```
**Components Using**:
- Roster page
- TopHeader (for roster dropdown)
- ProfileList component

#### QUERY_SINGLE_PROFILE 🔴
**File**: `client/src/utils/queries.jsx`
**Current**: `query singleProfile($profileId: ID!)`
**Update**: Add `organizationId` parameter
```graphql
query singleProfile($profileId: ID!, $organizationId: ID!) {
  profile(profileId: $profileId, organizationId: $organizationId) {
    # ...fields
  }
}
```
**Components Using**:
- Profile page
- ProfileCard component

#### QUERY_ME 🔴
**File**: `client/src/utils/queries.jsx`
**Current**: `query me`
**Update**: Add optional `organizationId` parameter (backend already returns organization context)
```graphql
query me($organizationId: ID) {
  me(organizationId: $organizationId) {
    _id
    name
    email
    # ...fields
    currentOrganization {
      _id
      name
      slug
      subscription {
        plan
        status
      }
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
**Components Using**:
- App.jsx (main user data)
- Header components
- Auth flow

### 2. Game Queries

#### QUERY_GAMES 🔴
**File**: `client/src/utils/queries.jsx`
**Current**: `query allGames`
**Update**: Add `organizationId` parameter
```graphql
query allGames($organizationId: ID!) {
  games(organizationId: $organizationId) {
    _id
    gameName
    location
    date
    time
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- Game page
- GameList component
- CustomComingGames component

#### QUERY_GAME 🔴
**File**: `client/src/utils/queries.jsx`
**Current**: `query singleGame($gameId: ID!)`
**Update**: Add `organizationId` parameter
```graphql
query singleGame($gameId: ID!, $organizationId: ID!) {
  game(gameId: $gameId, organizationId: $organizationId) {
    _id
    gameName
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- GameDetails component
- GameUpdatePage

### 3. Post Queries

#### GET_POSTS 🔴
**File**: Check if this exists in queries.jsx or inline in components
**Current**: Likely `query getPosts`
**Update**: Add `organizationId` parameter
```graphql
query getPosts($organizationId: ID!) {
  posts(organizationId: $organizationId) {
    _id
    postText
    postAuthor
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- Home page
- PostsList component

### 4. Formation Queries

#### QUERY_FORMATION 🔴
**File**: `client/src/utils/queries.jsx`
**Current**: `query getFormation($gameId: ID!)`
**Update**: Add `organizationId` parameter
```graphql
query getFormation($gameId: ID!, $organizationId: ID!) {
  formation(gameId: $gameId, organizationId: $organizationId) {
    _id
    gameId
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- FormationBoard component
- FormationSection component

### 5. Skill Queries

#### GET_SKILLS 🔴
**File**: Check if exists in queries.jsx
**Current**: Likely inline in components
**Update**: Create centralized query with `organizationId`
```graphql
query getSkills($organizationId: ID!) {
  skills(organizationId: $organizationId) {
    _id
    skillText
    skillAuthor
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- Skill page
- AllSkillsList component

### 6. Message/Chat Queries

#### GET_CHATS 🔴
**File**: Check message components
**Current**: Likely inline
**Update**: Add `organizationId` parameter
```graphql
query getChats($organizationId: ID!) {
  chats(organizationId: $organizationId) {
    _id
    participants {
      _id
      name
    }
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- Message page
- ChatPopup component

#### GET_MESSAGES 🔴
**File**: Check message components
**Current**: Likely `query getMessages($chatId: ID!)`
**Update**: Add `organizationId` parameter
```graphql
query getMessages($chatId: ID!, $organizationId: ID!) {
  messages(chatId: $chatId, organizationId: $organizationId) {
    _id
    text
    sender {
      _id
      name
    }
    organizationId
    # ...fields
  }
}
```
**Components Using**:
- MessageList component
- ChatPopup component

## Mutations to Update

### 1. Game Mutations

#### CREATE_GAME 🔴
**File**: Check mutations file
**Update**: Add `organizationId` to input
```graphql
mutation createGame($gameInput: GameInput!, $organizationId: ID!) {
  createGame(gameInput: $gameInput, organizationId: $organizationId) {
    _id
    organizationId
    # ...fields
  }
}
```

#### UPDATE_GAME 🔴
**Update**: Add `organizationId` for validation
```graphql
mutation updateGame($gameId: ID!, $gameInput: GameInput!, $organizationId: ID!) {
  updateGame(gameId: $gameId, gameInput: $gameInput, organizationId: $organizationId) {
    _id
    organizationId
    # ...fields
  }
}
```

### 2. Post Mutations

#### ADD_POST 🔴
**Update**: Add `organizationId` to input
```graphql
mutation addPost($postText: String!, $organizationId: ID!) {
  addPost(postText: $postText, organizationId: $organizationId) {
    _id
    postText
    organizationId
    # ...fields
  }
}
```

### 3. Formation Mutations

#### CREATE_FORMATION 🔴
**Update**: Add `organizationId` to input
```graphql
mutation createFormation($gameId: ID!, $players: [PlayerPositionInput!]!, $organizationId: ID!) {
  createFormation(gameId: $gameId, players: $players, organizationId: $organizationId) {
    _id
    organizationId
    # ...fields
  }
}
```

### 4. Message Mutations

#### SEND_MESSAGE 🔴
**Update**: Add `organizationId` to input
```graphql
mutation sendMessage($chatId: ID!, $text: String!, $organizationId: ID!) {
  sendMessage(chatId: $chatId, text: $text, organizationId: $organizationId) {
    _id
    text
    organizationId
    # ...fields
  }
}
```

### 5. Skill Mutations

#### ADD_SKILL 🔴
**Update**: Add `organizationId` to input
```graphql
mutation addSkill($recipientId: ID!, $skillText: String!, $organizationId: ID!) {
  addSkill(recipientId: $recipientId, skillText: $skillText, organizationId: $organizationId) {
    _id
    skillText
    organizationId
    # ...fields
  }
}
```

## Implementation Pattern

### Step 1: Update Query/Mutation Definition
```jsx
// Before
export const QUERY_GAMES = gql`
  query allGames {
    games {
      _id
      gameName
    }
  }
`;

// After
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

### Step 2: Update Component Usage
```jsx
// Before
const { data } = useQuery(QUERY_GAMES);

// After
import { useOrganization } from '../../contexts/OrganizationContext';

function MyComponent() {
  const { currentOrganization } = useOrganization();
  
  const { data, loading, error } = useQuery(QUERY_GAMES, {
    variables: { 
      organizationId: currentOrganization?._id 
    },
    skip: !currentOrganization // Don't query until org is loaded
  });
  
  if (!currentOrganization) return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <GameList games={data.games} />;
}
```

### Step 3: Handle Organization Switching
```jsx
const { data, loading, error, refetch } = useQuery(QUERY_GAMES, {
  variables: { 
    organizationId: currentOrganization?._id 
  }
});

// Refetch when organization changes
useEffect(() => {
  if (currentOrganization) {
    refetch({ organizationId: currentOrganization._id });
  }
}, [currentOrganization, refetch]);
```

## Component Update Checklist

### High Priority (Data Display)
- [ ] GameList component
- [ ] ProfileList component
- [ ] PostsList component
- [ ] CustomComingGames component
- [ ] AllSkillsList component
- [ ] MessageList component

### Medium Priority (Detail Views)
- [ ] GameDetails component
- [ ] Profile page
- [ ] Post component
- [ ] FormationBoard component

### Low Priority (Create/Update)
- [ ] GameCreate page
- [ ] PostForm component
- [ ] MessageInput component
- [ ] GameUpdate page

## Testing Strategy

### For Each Updated Query
1. **Load Test**: Query loads with organizationId
2. **Switch Test**: Data updates when switching organizations
3. **Error Test**: Handles missing organizationId gracefully
4. **Cache Test**: Apollo cache updates correctly
5. **Performance Test**: No unnecessary re-fetches

### Integration Tests
1. Login → Select org → Data loads correctly
2. Switch org → All data updates
3. Create data → Appears in correct org
4. Switch org → Previous data doesn't show
5. Logout → Context clears

## Common Issues & Solutions

### Issue 1: Query Runs Before Organization Loads
**Solution**: Use `skip` option
```jsx
const { data } = useQuery(QUERY_GAMES, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization
});
```

### Issue 2: Data Doesn't Update on Organization Switch
**Solution**: Use refetch or cache invalidation
```jsx
useEffect(() => {
  if (currentOrganization) {
    refetch({ organizationId: currentOrganization._id });
  }
}, [currentOrganization]);
```

### Issue 3: Cache Pollution Across Organizations
**Solution**: Use cache field policies
```jsx
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          games: {
            keyArgs: ['organizationId'],
          },
        },
      },
    },
  }),
});
```

### Issue 4: Mutation Doesn't Update Cache
**Solution**: Use update function or refetchQueries
```jsx
const [createGame] = useMutation(CREATE_GAME, {
  refetchQueries: [
    { 
      query: QUERY_GAMES, 
      variables: { organizationId: currentOrganization._id }
    }
  ]
});
```

## Performance Optimization

### 1. Query Batching
```jsx
// Batch multiple queries for same organization
const { data: gamesData } = useQuery(QUERY_GAMES, { 
  variables: { organizationId } 
});
const { data: profilesData } = useQuery(QUERY_PROFILES, { 
  variables: { organizationId } 
});
```

### 2. Pagination Support
```jsx
export const QUERY_GAMES = gql`
  query allGames($organizationId: ID!, $limit: Int, $offset: Int) {
    games(organizationId: $organizationId, limit: $limit, offset: $offset) {
      # ...fields
    }
  }
`;
```

### 3. Field-Level Caching
```jsx
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Game: {
        keyFields: ['_id', 'organizationId'],
      },
    },
  }),
});
```

## Documentation for Developers

### Adding Organization Context to New Queries

1. **Import Organization Hook**
```jsx
import { useOrganization } from '../../contexts/OrganizationContext';
```

2. **Get Organization ID**
```jsx
const { currentOrganization } = useOrganization();
```

3. **Add to Query Variables**
```jsx
const { data } = useQuery(MY_QUERY, {
  variables: { 
    organizationId: currentOrganization?._id,
    // ...other variables
  },
  skip: !currentOrganization
});
```

4. **Handle Loading State**
```jsx
if (!currentOrganization) return <LoadingSpinner message="Loading organization..." />;
```

### Creating New Organization-Scoped Features

When creating new features that need organization context:

1. Add `organizationId` field to GraphQL schema
2. Add organization filter to resolver
3. Include `organizationId` in query variables
4. Use `useOrganization()` hook in component
5. Handle organization switching
6. Test with multiple organizations

## Timeline

### Week 1: Core Queries
- Update all profile queries
- Update all game queries
- Test organization switching

### Week 2: Secondary Queries
- Update post queries
- Update formation queries
- Update skill queries
- Update message/chat queries

### Week 3: Mutations & Testing
- Update all mutations
- Comprehensive testing
- Performance optimization
- Documentation updates

## Success Criteria

- [ ] All queries include organizationId parameter
- [ ] All mutations include organizationId parameter
- [ ] Data correctly filtered by organization
- [ ] Organization switching works seamlessly
- [ ] No data leaks between organizations
- [ ] Apollo cache works correctly
- [ ] Performance is acceptable
- [ ] Error handling is robust
- [ ] Documentation is complete

## Next Steps

After completing Phase 7:
1. **Phase 8**: Update all components to use organization-aware queries
2. **Phase 9**: Create organization management UI
3. **Phase 10**: Add organization analytics and advanced features

---

**Status**: 🔴 Not Started
**Estimated Time**: 4-6 hours
**Priority**: High
