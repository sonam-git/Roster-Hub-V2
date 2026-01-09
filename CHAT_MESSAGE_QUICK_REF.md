# 🚀 Chat vs Message Quick Reference Card

## At a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHAT vs MESSAGE SYSTEMS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CHAT SYSTEM                    MESSAGE SYSTEM                  │
│  ━━━━━━━━━━━                    ━━━━━━━━━━━━━━                  │
│  💬 Real-time messaging         📧 Profile/Kudos messages       │
│  🔴 Live notifications          📝 Formal feedback              │
│  ✓ Seen/Delivered status        💬 Wall-style display           │
│  🗑️ Soft delete conversations   🗑️ Hard delete messages         │
│                                                                 │
│  Model: Chat.js                 Model: Message.js               │
│  Component: ChatPopup           Component: MessageBox           │
│              ChatMessage                    MessageList         │
│                                             MessageCard         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend GraphQL Operations

### 🟦 CHAT QUERIES
```graphql
# Get chat history with a user
getChatByUser(to: ID!, organizationId: ID!): [Chat]

# Get all chats in organization
getAllChats(organizationId: ID!): [Chat]

# Get chats between two specific users
getChatsBetweenUsers(userId1: ID!, userId2: ID!, organizationId: ID!): [Chat]
```

### 🟩 CHAT MUTATIONS
```graphql
# Send a chat message
createChat(from: ID!, to: ID!, content: String!, organizationId: ID!): Chat

# Delete chat conversation (soft delete)
deleteConversation(userId: ID!, organizationId: ID!): Boolean!

# Mark messages as seen
markChatAsSeen(userId: ID!, organizationId: ID!): Boolean
```

### 🟨 MESSAGE QUERIES
```graphql
# Get messages received by current user
receivedMessages: [Message]!
```

### 🟧 MESSAGE MUTATIONS
```graphql
# Send a profile message
sendMessage(recipientId: ID!, text: String!, organizationId: ID!): Message!

# Delete a message (hard delete)
removeMessage(messageId: ID!, organizationId: ID!): Message
```

---

## Frontend Component Usage

### 💬 ChatPopup (Real-time Chat)
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";

const { currentOrganization } = useOrganization();

// Query chat history
const { data } = useQuery(GET_CHAT_BY_USER, {
  variables: { 
    to: selectedUserId,
    organizationId: currentOrganization._id  // REQUIRED!
  }
});

// Send chat message
await createChat({
  variables: { 
    from: userId, 
    to: recipientId, 
    content: messageText,
    organizationId: currentOrganization._id  // REQUIRED!
  }
});

// Delete conversation
await deleteConversation({ 
  variables: { 
    userId: otherUserId,
    organizationId: currentOrganization._id  // REQUIRED!
  } 
});
```

### 📧 MessageBox (Profile Messages)
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";

const { currentOrganization } = useOrganization();

// Send message
await sendMessage({
  variables: {
    recipientId: recipient._id,
    text: messageText,
    organizationId: currentOrganization._id,  // REQUIRED!
  }
});

// Remove message
await removeMessage({ 
  variables: { 
    messageId: msgId,
    organizationId: currentOrganization._id  // REQUIRED!
  } 
});
```

---

## Data Models

### Chat Document
```javascript
{
  from: Profile._id,           // Sender
  to: Profile._id,             // Recipient
  content: "Message text",     // Chat message
  seen: false,                 // Seen status
  createdAt: Date,             // Timestamp
  deletedBy: [Profile._id],    // Users who deleted this
  organizationId: Org._id      // Organization scope
}
```

### Message Document
```javascript
{
  sender: Profile._id,         // Sender
  recipient: Profile._id,      // Recipient
  text: "Message text",        // Message content
  createdAt: Date,             // Timestamp
  organizationId: Org._id      // Organization scope
}
```

---

## Validation Flow

### Backend Resolver Pattern
```javascript
// ✅ Standard pattern for all Chat/Message operations
async (parent, { ...args, organizationId }, context) => {
  // 1. Check authentication
  if (!context.user) {
    throw new AuthenticationError("You need to be logged in");
  }

  // 2. Validate organizationId is provided
  if (!organizationId) {
    throw new AuthenticationError("Organization ID is required");
  }

  // 3. Validate user is member of organization
  const org = await Organization.findById(organizationId);
  if (!org || !org.isUserMember(context.user._id)) {
    throw new AuthenticationError("You are not a member of this organization");
  }

  // 4. Perform operation with organization scope
  const result = await Model.find({ 
    organizationId: organizationId,
    // ...other conditions
  });

  return result;
}
```

### Frontend Component Pattern
```jsx
// ✅ Standard pattern for all Chat/Message components
import { useOrganization } from "../../contexts/OrganizationContext";

const MyComponent = () => {
  const { currentOrganization } = useOrganization();

  // 1. Check if organization is available
  if (!currentOrganization) {
    console.error('No organization selected');
    // Show error UI or return early
    return;
  }

  // 2. Pass organizationId to all operations
  const { data } = useQuery(MY_QUERY, {
    variables: { 
      // ...other vars
      organizationId: currentOrganization._id 
    }
  });

  // 3. Handle errors
  const handleAction = async () => {
    try {
      await myMutation({
        variables: { 
          // ...other vars
          organizationId: currentOrganization._id 
        }
      });
    } catch (error) {
      console.error('Error:', error);
      // Show error to user
    }
  };
};
```

---

## Common Patterns

### 🔍 Querying Chats/Messages
```javascript
// Backend: Always scope to organization
await Chat.find({ 
  organizationId: organizationId,  // Organization scope
  // Additional filters...
})
.sort({ createdAt: -1 })
.populate("from to");
```

### 📤 Sending Chats/Messages
```javascript
// Backend: Create with organization scope
const newChat = await Chat.create({
  from: userId,
  to: recipientId,
  content: messageText,
  organizationId: organizationId,  // Organization scope
});
```

### 🗑️ Deleting Conversations vs Messages

**Chat (Soft Delete)**:
```javascript
// Marks as deleted for current user only
await Chat.updateMany(
  {
    organizationId: organizationId,
    $or: [
      { from: userId, to: otherUserId },
      { from: otherUserId, to: userId },
    ],
    deletedBy: { $ne: userId },
  },
  { $push: { deletedBy: userId } }
);
```

**Message (Hard Delete)**:
```javascript
// Permanently deletes the message
await Message.findOneAndDelete({ 
  _id: messageId,
  organizationId: organizationId 
});
```

---

## Troubleshooting

### ❌ "Organization ID is required" Error
**Cause**: Frontend didn't pass `organizationId` to query/mutation  
**Fix**: Always get organization from context and pass to operations
```jsx
const { currentOrganization } = useOrganization();
// Then pass: organizationId: currentOrganization._id
```

### ❌ "You are not a member of this organization" Error
**Cause**: User trying to access data from different organization  
**Fix**: Ensure user is logged into correct organization context

### ❌ "You need to be logged in" Error
**Cause**: No authentication token or context.user is null  
**Fix**: Check Auth.loggedIn() and redirect to login if needed

### ❌ Chat not updating in real-time
**Cause**: Subscription not working or component not subscribed  
**Fix**: Check CHAT_SUBSCRIPTION is active in ChatPopup component

---

## Best Practices

### ✅ DO
- Always pass `organizationId` to all Chat/Message operations
- Use `currentOrganization` from OrganizationContext
- Validate organization exists before operations
- Handle errors gracefully with user-friendly messages
- Use Chat for real-time, Message for formal communication

### ❌ DON'T
- Don't rely on context.organizationId fallback (be explicit)
- Don't mix Chat and Message operations
- Don't forget to validate organization membership
- Don't show technical error messages to users
- Don't skip error handling

---

## Testing Commands

### Backend (GraphQL Playground)
```graphql
# Test getChatByUser
query {
  getChatByUser(
    to: "USER_ID_HERE"
    organizationId: "ORG_ID_HERE"
  ) {
    id
    content
    from { name }
    to { name }
  }
}

# Test createChat
mutation {
  createChat(
    from: "USER1_ID"
    to: "USER2_ID"
    content: "Test message"
    organizationId: "ORG_ID_HERE"
  ) {
    id
    content
  }
}
```

### Frontend (Browser Console)
```javascript
// Check current organization
localStorage.getItem('currentOrganization')

// Check authentication
localStorage.getItem('id_token')

// Test notification system
console.log(localStorage.getItem('chat_notifications'))
```

---

## File Locations

### Backend
```
server/
├── models/
│   ├── Chat.js              # Chat model
│   └── Message.js           # Message model
├── schemas/
│   ├── typeDefs.js          # GraphQL schema
│   └── resolvers.js         # GraphQL resolvers
```

### Frontend
```
client/src/
├── components/
│   ├── ChatPopup/           # Real-time chat
│   ├── ChatMessage/         # Chat message bubble
│   ├── MessageBox/          # Send message modal
│   ├── MessageList/         # Message list view
│   └── MessageCard/         # Message card display
├── utils/
│   ├── queries.jsx          # GraphQL queries
│   └── mutations.jsx        # GraphQL mutations
└── contexts/
    └── OrganizationContext.jsx  # Organization state
```

---

**Quick Access**: Use Cmd+F to search for specific operations or patterns!  
**Status**: ✅ All systems operational  
**Last Updated**: January 9, 2026
