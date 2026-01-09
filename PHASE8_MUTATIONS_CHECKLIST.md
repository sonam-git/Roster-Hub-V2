# Phase 8: Mutations Update - Implementation Checklist

## 🎯 Objective
Update all mutations to include organizationId and ensure proper organization context validation.

---

## 📋 Mutation Categories

### Priority 1: Game Mutations 🎮
- [ ] **CREATE_GAME**
  - [ ] Add organizationId parameter
  - [ ] Update resolver to use organizationId
  - [ ] Update frontend components using this mutation
  - [ ] Test game creation in organization
  
- [ ] **UPDATE_GAME**
  - [ ] Add organizationId validation
  - [ ] Ensure user can only update games in their org
  - [ ] Update frontend components
  - [ ] Test game updates
  
- [ ] **DELETE_GAME**
  - [ ] Add organizationId validation
  - [ ] Ensure user can only delete games in their org
  - [ ] Update frontend components
  - [ ] Test game deletion
  
- [ ] **RESPOND_TO_GAME**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test game responses
  
- [ ] **CONFIRM_GAME**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test game confirmation
  
- [ ] **CANCEL_GAME**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test game cancellation
  
- [ ] **COMPLETE_GAME**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test game completion

### Priority 2: Post Mutations 📝
- [ ] **ADD_POST**
  - [ ] Add organizationId parameter
  - [ ] Update resolver to use organizationId
  - [ ] Update PostForm component
  - [ ] Test post creation in organization
  
- [ ] **UPDATE_POST**
  - [ ] Add organizationId validation
  - [ ] Ensure user can only update posts in their org
  - [ ] Update frontend components
  - [ ] Test post updates
  
- [ ] **DELETE_POST**
  - [ ] Add organizationId validation
  - [ ] Ensure user can only delete posts in their org
  - [ ] Update frontend components
  - [ ] Test post deletion
  
- [ ] **LIKE_POST**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test post likes

### Priority 3: Comment Mutations 💬
- [ ] **ADD_COMMENT**
  - [ ] Add organizationId parameter
  - [ ] Update resolver to use organizationId
  - [ ] Update comment form components
  - [ ] Test comment creation
  
- [ ] **DELETE_COMMENT**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test comment deletion
  
- [ ] **LIKE_COMMENT**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test comment likes

### Priority 4: Formation Mutations ⚽
- [ ] **CREATE_FORMATION**
  - [ ] Add organizationId parameter
  - [ ] Update resolver to use organizationId
  - [ ] Update FormationSection component
  - [ ] Test formation creation
  
- [ ] **UPDATE_FORMATION**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test formation updates
  
- [ ] **DELETE_FORMATION**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test formation deletion
  
- [ ] **ADD_FORMATION_COMMENT**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test formation comments
  
- [ ] **LIKE_FORMATION**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test formation likes

### Priority 5: Skill Mutations 🌟
- [ ] **ADD_SKILL**
  - [ ] Add organizationId parameter
  - [ ] Update resolver to use organizationId
  - [ ] Update AllSkillsList component (already done)
  - [ ] Test skill endorsement
  
- [ ] **REMOVE_SKILL**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test skill removal
  
- [ ] **REACT_TO_SKILL**
  - [ ] Add organizationId validation
  - [ ] Update frontend components (already done)
  - [ ] Test skill reactions

### Priority 6: Message/Chat Mutations 💌
- [ ] **SEND_MESSAGE**
  - [ ] Add organizationId parameter
  - [ ] Update resolver to use organizationId
  - [ ] Update MessageInput component
  - [ ] Test message sending
  
- [ ] **DELETE_MESSAGE**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test message deletion
  
- [ ] **CREATE_CHAT**
  - [ ] Add organizationId parameter
  - [ ] Update frontend components
  - [ ] Test chat creation

### Priority 7: Profile Mutations 👤
- [ ] **UPDATE_PROFILE**
  - [ ] Keep existing functionality
  - [ ] Ensure profile updates work across orgs
  - [ ] Test profile updates
  
- [ ] **UPLOAD_PROFILE_PICTURE**
  - [ ] Keep existing functionality
  - [ ] Test profile picture upload

### Priority 8: Organization Mutations 🏢 (NEW)
- [ ] **CREATE_ORGANIZATION**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver
  - [ ] Create frontend form
  - [ ] Test organization creation
  
- [ ] **UPDATE_ORGANIZATION**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver
  - [ ] Create settings page
  - [ ] Test organization updates
  
- [ ] **INVITE_MEMBER**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver
  - [ ] Create invitation UI
  - [ ] Test member invitation
  
- [ ] **ACCEPT_INVITATION**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver
  - [ ] Create invitation acceptance UI
  - [ ] Test invitation acceptance
  
- [ ] **REMOVE_MEMBER**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver
  - [ ] Create member management UI
  - [ ] Test member removal
  
- [ ] **LEAVE_ORGANIZATION**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver
  - [ ] Create UI for leaving
  - [ ] Test leaving organization
  
- [ ] **DELETE_ORGANIZATION**
  - [ ] Create mutation in typeDefs
  - [ ] Implement resolver (owner only)
  - [ ] Create deletion confirmation UI
  - [ ] Test organization deletion

### Priority 9: Feedback Mutations 📊
- [ ] **ADD_GAME_FEEDBACK**
  - [ ] Add organizationId validation
  - [ ] Update frontend components
  - [ ] Test feedback submission

---

## 🔍 Implementation Pattern

For each mutation, follow this pattern:

### 1. Update GraphQL Schema (typeDefs)
```graphql
type Mutation {
  createGame(
    name: String!
    date: String!
    organizationId: ID!  # Add this
    # ...other fields
  ): Game
}
```

### 2. Update Resolver
```javascript
createGame: async (parent, args, context) => {
  const { organizationId, ...gameData } = args;
  
  // Validate user is in organization
  if (!context.organizationId || context.organizationId !== organizationId) {
    throw new AuthenticationError('Invalid organization access');
  }
  
  // Validate user is member
  const organization = await Organization.findById(organizationId);
  if (!organization.isUserMember(context.user._id)) {
    throw new AuthenticationError('You are not a member of this organization');
  }
  
  // Check limits
  if (organization.hasReachedGameLimit()) {
    throw new UserInputError('Organization has reached game limit');
  }
  
  // Create game
  const game = await Game.create({
    ...gameData,
    organizationId,
    creator: context.user._id
  });
  
  // Update usage
  organization.usage.gameCount += 1;
  await organization.save();
  
  return game;
}
```

### 3. Update Frontend Component
```jsx
import { useOrganization } from '../contexts/OrganizationContext';

function MyComponent() {
  const { currentOrganization } = useOrganization();
  
  const [createGame] = useMutation(CREATE_GAME, {
    refetchQueries: [{ 
      query: QUERY_GAMES,
      variables: { organizationId: currentOrganization._id }
    }]
  });
  
  const handleSubmit = async (formData) => {
    await createGame({
      variables: {
        ...formData,
        organizationId: currentOrganization._id
      }
    });
  };
}
```

### 4. Test
- Test with valid organization
- Test with invalid organization
- Test without organization
- Test with non-member user
- Test limit enforcement

---

## 📊 Progress Tracking

```
Priority 1 (Games):      ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/7)
Priority 2 (Posts):      ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/4)
Priority 3 (Comments):   ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3)
Priority 4 (Formations): ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/5)
Priority 5 (Skills):     ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3)
Priority 6 (Messages):   ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3)
Priority 7 (Profile):    ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/2)
Priority 8 (Org Mgmt):   ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/7)
Priority 9 (Feedback):   ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/1)

Overall Progress:        ░░░░░░░░░░░░░░░░░░░░░░░   0% (0/35)
```

---

## 🎯 Goals

### Phase 8A (First Session)
- Complete Priority 1: Game Mutations (7 mutations)
- Complete Priority 2: Post Mutations (4 mutations)
- **Target**: 31% completion (11/35 mutations)

### Phase 8B (Second Session)
- Complete Priority 3: Comment Mutations (3 mutations)
- Complete Priority 4: Formation Mutations (5 mutations)
- Complete Priority 5: Skill Mutations (3 mutations)
- **Target**: 63% completion (22/35 mutations)

### Phase 8C (Third Session)
- Complete Priority 6: Message Mutations (3 mutations)
- Complete Priority 7: Profile Mutations (2 mutations)
- Complete Priority 8: Organization Mutations (7 mutations)
- Complete Priority 9: Feedback Mutations (1 mutation)
- **Target**: 100% completion (35/35 mutations)

---

## 🧪 Testing Strategy

### Unit Testing
- Test each mutation resolver independently
- Test validation logic
- Test error handling
- Test limit enforcement

### Integration Testing
- Test full workflows (create → read → update → delete)
- Test organization switching
- Test data isolation
- Test permissions

### End-to-End Testing
- Test user journeys
- Test cross-component interactions
- Test real-time updates
- Test edge cases

---

## 📚 Files to Update

### Backend Files
- `/server/schemas/typeDefs.js` - Add organizationId to mutations
- `/server/schemas/resolvers.js` - Update mutation resolvers
- `/server/schemas/organizationResolvers.js` - Add new org mutations

### Frontend Files (Estimated)
- `/client/src/components/GameForm/index.jsx`
- `/client/src/components/PostForm/index.jsx`
- `/client/src/components/GameUpdate/index.jsx`
- `/client/src/components/FormationSection/index.jsx`
- `/client/src/components/MessageInput/index.jsx`
- `/client/src/components/CommentInput/index.jsx`
- And many more...

### Documentation Files
- Create `PHASE8_MUTATIONS_PROGRESS.md` for tracking
- Update `MULTI_TENANT_ARCHITECTURE.md` with mutation patterns
- Create testing documentation

---

## 💡 Key Considerations

### Security
✅ Validate organizationId in every mutation  
✅ Check user membership  
✅ Enforce plan limits  
✅ Prevent data leakage  

### Performance
✅ Efficient queries  
✅ Proper indexing  
✅ Cache invalidation  
✅ Optimistic updates  

### User Experience
✅ Clear error messages  
✅ Loading states  
✅ Success feedback  
✅ Rollback on errors  

### Code Quality
✅ Consistent patterns  
✅ Proper error handling  
✅ Clean code  
✅ Good documentation  

---

**Status**: 📋 Ready to Begin  
**Estimated Time**: 6-8 hours total (2-3 sessions)  
**Next Step**: Start with Priority 1 - Game Mutations

