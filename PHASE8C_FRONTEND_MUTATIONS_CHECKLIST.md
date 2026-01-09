# Phase 8C: Frontend Mutation Updates - Checklist

## Overview
Update all frontend mutation calls to include organizationId and handle organization context validation errors.

---

## 📋 Mutations Checklist

### 🎮 Game Mutations (7)

- [ ] **createGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameForm`, `Game.jsx`
  - Add: `organizationId: ID!`
  
- [ ] **respondToGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameDetails`, `GameList`
  - Add: `organizationId: ID!`

- [ ] **confirmGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameDetails`, `GameList`
  - Add: `organizationId: ID!`

- [ ] **cancelGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameDetails`, `GameList`
  - Add: `organizationId: ID!`

- [ ] **completeGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameComplete`, `GameDetails`
  - Add: `organizationId: ID!`

- [ ] **updateGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameUpdate`, `GameUpdateModal`
  - Add: `organizationId: ID!`

- [ ] **deleteGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameDetails`, `GameList`
  - Add: `organizationId: ID!`

- [ ] **unvoteGame**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameDetails`, `GameList`
  - Add: `organizationId: ID!`

- [ ] **addFeedback**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `GameFeedback`, `GameFeedbackList`
  - Add: `organizationId: ID!`

---

### 📝 Post Mutations (6)

- [ ] **addPost**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `PostForm`, `PostsList`
  - Add: `organizationId: ID!`

- [ ] **updatePost**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `Post`, `PostsList`
  - Add: `organizationId: ID!`

- [ ] **removePost**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `Post`, `PostsList`
  - Add: `organizationId: ID!`

- [ ] **likePost**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `Post`, `PostsList`
  - Add: `organizationId: ID!`

- [ ] **addComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `CommentList`, `Post`
  - Add: `organizationId: ID!`

- [ ] **updateComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `CommentList`, `Post`
  - Add: `organizationId: ID!`

- [ ] **removeComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `CommentList`, `Post`
  - Add: `organizationId: ID!`

- [ ] **likeComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `CommentList`, `Post`
  - Add: `organizationId: ID!`

---

### 📊 Formation Mutations (7)

- [ ] **createFormation**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationBoard`, `FormationSection`
  - Add: `organizationId: ID!`

- [ ] **updateFormation**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationBoard`, `FormationSection`
  - Add: `organizationId: ID!`

- [ ] **deleteFormation**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationSection`
  - Add: `organizationId: ID!`

- [ ] **addFormationComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationCommentInput`, `FormationCommentList`
  - Add: `organizationId: ID!`

- [ ] **updateFormationComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationCommentItem`, `FormationCommentList`
  - Add: `organizationId: ID!`

- [ ] **deleteFormationComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationCommentItem`, `FormationCommentList`
  - Add: `organizationId: ID!`

- [ ] **likeFormationComment**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationCommentItem`
  - Add: `organizationId: ID!`

- [ ] **likeFormation**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `FormationLikeButton`, `FormationSection`
  - Add: `organizationId: ID!`

---

### 🎯 Skill Mutations (3)

- [ ] **addSkill**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `Skill.jsx`, `SkillForm`
  - Add: `organizationId: ID!`

- [ ] **removeSkill**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `AllSkillsList`, `Skill.jsx`
  - Add: `organizationId: ID!`

- [ ] **reactToSkill**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `AllSkillsList`, `SkillReactions`
  - Add: `organizationId: ID!`

---

### 💬 Message Mutations (2)

- [ ] **sendMessage**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `MessageInput`, `Message.jsx`
  - Add: `organizationId: ID!`

- [ ] **removeMessage**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `MessageCard`, `MessageList`
  - Add: `organizationId: ID!`

---

### 💬 Chat Mutations (3)

- [ ] **createChat**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `ChatPopup`, `ChatMessage`
  - Add: `organizationId: ID!`

- [ ] **deleteConversation**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `MessageBox`, `ChatPopup`
  - Add: `organizationId: ID!`

- [ ] **markChatAsSeen**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `ChatPopup`, `MessageList`
  - Add: `organizationId: ID!`

---

### 🔗 Social Media Mutations (2)

- [ ] **saveSocialMediaLink**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `ProfileSettings`, `SocialMediaForm`
  - Add: `organizationId: ID!`

- [ ] **removeSocialMediaLink**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `ProfileSettings`, `SocialMediaList`
  - Add: `organizationId: ID!`

---

### 👤 Profile/Rating Mutations (1)

- [ ] **ratePlayer**
  - File: `client/src/utils/mutations.jsx`
  - Components using: `PlayerRating`, `ProfileCard`
  - Add: `organizationId: ID!`

---

## 🎯 Component Update Pattern

For each component using mutations:

### 1. Import useOrganization Hook
```javascript
import { useOrganization } from '../../contexts/OrganizationContext';
```

### 2. Get currentOrganization
```javascript
const { currentOrganization } = useOrganization();
```

### 3. Check Organization Before Mutation
```javascript
const handleSubmit = async () => {
  if (!currentOrganization) {
    alert('Please select an organization first');
    return;
  }
  
  try {
    await mutationFunction({
      variables: {
        // ...other variables
        organizationId: currentOrganization._id
      }
    });
  } catch (error) {
    handleError(error);
  }
};
```

### 4. Add Error Handling
```javascript
const [mutationFunction] = useMutation(MUTATION, {
  onError: (error) => {
    if (error.message.includes('organization')) {
      alert('Organization access error: ' + error.message);
    } else {
      alert('Error: ' + error.message);
    }
  }
});
```

---

## 📁 Files to Modify

### Primary File
- `client/src/utils/mutations.jsx` - Update all mutation definitions

### Component Files (Estimated 40+ components)

#### Game Components
- `client/src/components/GameForm/`
- `client/src/components/GameDetails/`
- `client/src/components/GameList/`
- `client/src/components/GameComplete/`
- `client/src/components/GameUpdate/`
- `client/src/components/GameUpdateModal/`
- `client/src/components/GameFeedback/`
- `client/src/components/GameFeedbackList/`
- `client/src/pages/Game.jsx`

#### Post Components
- `client/src/components/PostForm/`
- `client/src/components/Post/`
- `client/src/components/PostsList/`
- `client/src/components/CommentList/`
- `client/src/pages/Home.jsx`

#### Formation Components
- `client/src/components/FormationBoard/`
- `client/src/components/FormationSection/`
- `client/src/components/FormationCommentInput/`
- `client/src/components/FormationCommentItem/`
- `client/src/components/FormationCommentList/`
- `client/src/components/FormationLikeButton/`

#### Skill Components
- `client/src/components/AllSkillsList/`
- `client/src/pages/Skill.jsx`

#### Message/Chat Components
- `client/src/components/ChatPopup/`
- `client/src/components/ChatMessage/`
- `client/src/components/MessageBox/`
- `client/src/components/MessageCard/`
- `client/src/components/MessageList/`
- `client/src/components/MessageInput/`
- `client/src/pages/Message.jsx`

#### Profile Components
- `client/src/components/ProfileSettings/`
- `client/src/components/ProfileCard/`

---

## 🧪 Testing Strategy

### Per Component
1. Load component in organization A
2. Perform mutation
3. Verify success
4. Switch to organization B
5. Verify data isolated
6. Perform same mutation
7. Switch back to A
8. Verify B's data not in A

### Specific Tests

#### Game Mutations
- [ ] Create game in org A, verify not in org B
- [ ] Respond to game in org A, verify isolated
- [ ] Complete game in org A, verify isolated
- [ ] Delete game in org A, verify org B unchanged

#### Post Mutations
- [ ] Create post in org A, verify not in org B
- [ ] Like post in org A, verify counts isolated
- [ ] Comment in org A, verify not in org B
- [ ] Delete post in org A, verify org B unchanged

#### Formation Mutations
- [ ] Create formation in org A, verify not in org B
- [ ] Update formation in org A, verify isolated
- [ ] Add comment in org A, verify not in org B
- [ ] Like formation in org A, verify counts isolated

#### Chat/Message Mutations
- [ ] Send message in org A, verify not in org B
- [ ] Create chat in org A, verify isolated
- [ ] Delete conversation in org A, verify org B unchanged
- [ ] Mark as seen in org A, verify isolated

---

## ⚠️ Common Issues & Solutions

### Issue 1: currentOrganization is undefined
**Solution**: Add loading check and default organization selection
```javascript
if (!currentOrganization) {
  return <div>Please select an organization</div>;
}
```

### Issue 2: organizationId validation fails
**Solution**: Ensure organizationId from context matches mutation parameter
```javascript
organizationId: currentOrganization._id // Must be same as context
```

### Issue 3: Mutations fail after org switch
**Solution**: Add refetch or reset cache after organization switch
```javascript
const { refetch } = useQuery(QUERY);
useEffect(() => {
  if (currentOrganization) {
    refetch();
  }
}, [currentOrganization]);
```

### Issue 4: Stale data showing
**Solution**: Update cache or refetch queries after mutations
```javascript
const [mutation] = useMutation(MUTATION, {
  refetchQueries: [{ query: RELEVANT_QUERY, variables: { organizationId } }]
});
```

---

## 📊 Progress Tracking

**Total Mutations**: 31  
**Updated**: 0  
**Remaining**: 31  

### By Category
- Games: 0/9 ⏳
- Posts: 0/8 ⏳
- Formations: 0/8 ⏳
- Skills: 0/3 ⏳
- Messages: 0/2 ⏳
- Chats: 0/3 ⏳
- Social: 0/2 ⏳
- Profile: 0/1 ⏳

---

## 🎯 Priority Order

### Phase 1 (Critical - Do First) 🔴
1. Game mutations (9) - Core functionality
2. Post mutations (8) - Core functionality

### Phase 2 (Important - Do Second) 🟡
3. Formation mutations (8) - Important feature
4. Skill mutations (3) - Important feature

### Phase 3 (Nice to Have - Do Third) 🟢
5. Message mutations (2) - Secondary feature
6. Chat mutations (3) - Secondary feature
7. Social mutations (2) - Secondary feature
8. Profile mutations (1) - Secondary feature

---

## ✅ Success Criteria

- [ ] All 31 mutations updated
- [ ] All components pass organizationId
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Organization checks before mutations
- [ ] Data isolation verified
- [ ] Org switching works smoothly
- [ ] No errors in console
- [ ] All tests pass

---

## 📝 Notes

- Backend mutations are 100% complete ✅
- All mutations require organizationId
- All mutations validate membership
- Data isolation is enforced server-side
- Frontend must pass correct organizationId
- Error messages are clear and actionable

---

## Next Steps

1. Start with `client/src/utils/mutations.jsx`
2. Update all mutation definitions
3. Work through components by priority
4. Test each component thoroughly
5. Verify data isolation
6. Document any issues
7. Create bug fixes as needed

**Estimated Time**: 6-8 hours  
**Difficulty**: Medium  
**Impact**: High - Enables all write operations

Ready to start! 🚀
