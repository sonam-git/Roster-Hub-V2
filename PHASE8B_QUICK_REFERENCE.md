# Phase 8B Quick Reference - Chat/Social/Profile Mutations

## Updated Mutations Summary

### 🔷 Chat Mutations (3)

#### 1. createChat
```graphql
# Before
createChat(from: ID!, to: ID!, content: String!): Chat

# After
createChat(from: ID!, to: ID!, content: String!, organizationId: ID!): Chat
```

**Frontend Usage**:
```javascript
const { currentOrganization } = useOrganization();

const [createChat] = useMutation(CREATE_CHAT, {
  variables: {
    from: userId,
    to: recipientId,
    content: message,
    organizationId: currentOrganization._id // Add this
  }
});
```

---

#### 2. deleteConversation
```graphql
# Before
deleteConversation(userId: ID!): Boolean!

# After
deleteConversation(userId: ID!, organizationId: ID!): Boolean!
```

**Frontend Usage**:
```javascript
const { currentOrganization } = useOrganization();

const [deleteConversation] = useMutation(DELETE_CONVERSATION, {
  variables: {
    userId: otherUserId,
    organizationId: currentOrganization._id // Add this
  }
});
```

---

#### 3. markChatAsSeen
```graphql
# Before
markChatAsSeen(userId: ID!): Boolean

# After
markChatAsSeen(userId: ID!, organizationId: ID!): Boolean
```

**Frontend Usage**:
```javascript
const { currentOrganization } = useOrganization();

const [markChatAsSeen] = useMutation(MARK_CHAT_AS_SEEN, {
  variables: {
    userId: senderId,
    organizationId: currentOrganization._id // Add this
  }
});
```

---

### 🔷 Social Media Mutations (2)

#### 4. saveSocialMediaLink
```graphql
# Before
saveSocialMediaLink(userId: ID!, type: String!, link: String!): SocialMediaLink!

# After
saveSocialMediaLink(userId: ID!, type: String!, link: String!, organizationId: ID!): SocialMediaLink!
```

**Frontend Usage**:
```javascript
const { currentOrganization } = useOrganization();

const [saveSocialMediaLink] = useMutation(SAVE_SOCIAL_MEDIA_LINK, {
  variables: {
    userId: profileId,
    type: 'instagram',
    link: 'https://instagram.com/user',
    organizationId: currentOrganization._id // Add this
  }
});
```

---

#### 5. removeSocialMediaLink
```graphql
# Before
removeSocialMediaLink(userId: ID!, type: String!): Boolean

# After
removeSocialMediaLink(userId: ID!, type: String!, organizationId: ID!): Boolean
```

**Frontend Usage**:
```javascript
const { currentOrganization } = useOrganization();

const [removeSocialMediaLink] = useMutation(REMOVE_SOCIAL_MEDIA_LINK, {
  variables: {
    userId: profileId,
    type: 'instagram',
    organizationId: currentOrganization._id // Add this
  }
});
```

---

### 🔷 Rating Mutation (1)

#### 6. ratePlayer
```graphql
# Before
ratePlayer(profileId: ID!, ratingInput: RatingInput!): Profile

# After
ratePlayer(profileId: ID!, ratingInput: RatingInput!, organizationId: ID!): Profile
```

**Frontend Usage**:
```javascript
const { currentOrganization } = useOrganization();

const [ratePlayer] = useMutation(RATE_PLAYER, {
  variables: {
    profileId: playerId,
    ratingInput: { user: myId, rating: 5 },
    organizationId: currentOrganization._id // Add this
  }
});
```

---

## Components to Update

### Chat Components
- `ChatPopup/` - createChat, markChatAsSeen
- `MessageBox/` - deleteConversation
- `MessageList/` - markChatAsSeen
- `MessageInput/` - createChat
- Any other chat-related components

### Social Media Components
- `ProfileSettings/` - saveSocialMediaLink, removeSocialMediaLink
- `ProfileCard/` - Display social links
- Any social media management components

### Rating Components
- `PlayerRating/` - ratePlayer (if exists)
- `GameFeedback/` - May use ratePlayer
- Any rating/feedback components

---

## Error Handling Pattern

All mutations should handle organization-related errors:

```javascript
const [mutationFunction] = useMutation(MUTATION, {
  onError: (error) => {
    if (error.message.includes('organization')) {
      // Handle organization-specific errors
      alert('You must be a member of this organization');
      // Optionally redirect to organization selection
    } else {
      // Handle other errors
      console.error('Mutation error:', error);
    }
  }
});
```

---

## Testing Checklist

### Chat System
- [ ] Create chat in org A, verify not visible in org B
- [ ] Delete conversation in org A, verify org B unchanged
- [ ] Mark chats as seen in one org, verify isolation
- [ ] Switch organizations and verify chat history changes

### Social Media
- [ ] Add social link in org A, verify not in org B
- [ ] Remove social link from org A, verify org B unchanged
- [ ] View profile in different orgs, verify links are different

### Ratings
- [ ] Rate player in org A, verify rating isolated
- [ ] Check average rating is per-organization
- [ ] Switch orgs and verify different ratings

---

## Common Pitfalls

### ❌ Don't forget organizationId
```javascript
// BAD
const [createChat] = useMutation(CREATE_CHAT, {
  variables: { from, to, content }
});

// GOOD
const [createChat] = useMutation(CREATE_CHAT, {
  variables: { from, to, content, organizationId: currentOrganization._id }
});
```

### ❌ Don't forget to check for currentOrganization
```javascript
// BAD
const handleSubmit = () => {
  createChat({ variables: { from, to, content, organizationId: currentOrganization._id } });
};

// GOOD
const handleSubmit = () => {
  if (!currentOrganization) {
    alert('Please select an organization');
    return;
  }
  createChat({ variables: { from, to, content, organizationId: currentOrganization._id } });
};
```

### ❌ Don't forget error handling
```javascript
// BAD
const [createChat] = useMutation(CREATE_CHAT);

// GOOD
const [createChat] = useMutation(CREATE_CHAT, {
  onError: (error) => handleError(error),
  onCompleted: () => handleSuccess()
});
```

---

## Validation Backend Rules

All mutations validate:
1. ✅ User is authenticated
2. ✅ organizationId matches context.organizationId
3. ✅ User is member of organization
4. ✅ Data is filtered by organizationId

If any validation fails:
- `AuthenticationError` is thrown
- Clear error message returned
- Frontend should handle appropriately

---

## Next Steps

1. Update mutation definitions in `client/src/utils/mutations.jsx`
2. Update components that use these mutations
3. Add organizationId to all mutation calls
4. Test thoroughly in both organizations
5. Verify data isolation
6. Check error handling

---

## Files to Modify

### Backend (Already Complete ✅)
- `server/schemas/typeDefs.js`
- `server/schemas/resolvers.js`

### Frontend (To Do)
- `client/src/utils/mutations.jsx` - Update mutation definitions
- `client/src/components/ChatPopup/` - Update chat mutations
- `client/src/components/MessageBox/` - Update message mutations
- `client/src/components/ProfileSettings/` - Update social mutations
- Any rating/feedback components

---

## Summary

**Total Mutations Updated**: 6  
**Chat**: 3  
**Social**: 2  
**Rating**: 1  

All mutations now require organizationId and validate:
- User authentication
- Organization context
- Organization membership
- Data isolation

Ready for frontend integration! 🚀
