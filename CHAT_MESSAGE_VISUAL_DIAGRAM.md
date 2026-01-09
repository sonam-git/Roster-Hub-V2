# 🎨 Chat vs Message Visual Flow Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ROSTERHUB MESSAGING SYSTEMS                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│        CHAT SYSTEM               │  │      MESSAGE SYSTEM               │
│     (Real-time Messaging)        │  │    (Profile/Kudos Messages)       │
└──────────────────────────────────┘  └──────────────────────────────────┘

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Frontend Components             │  │  Frontend Components              │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│  • ChatPopup                     │  │  • MessageBox                     │
│    - User list                   │  │    - Compose modal                │
│    - Conversation view           │  │    - Send button                  │
│    - Notification badges         │  │  • MessageList                    │
│  • ChatMessage                   │  │    - Conversation groups          │
│    - Message bubbles             │  │    - Sent/received tabs           │
│    - Seen/delivered status       │  │  • MessageCard                    │
│    - Timestamps                  │  │    - Message display              │
│                                  │  │    - Delete button                │
└──────────────────────────────────┘  └──────────────────────────────────┘
         │                                       │
         │ GraphQL Operations                   │ GraphQL Operations
         ▼                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Queries                         │  │  Queries                          │
│  ━━━━━━━━                         │  │  ━━━━━━━━                         │
│  • getChatByUser                 │  │  • receivedMessages               │
│    (to, organizationId)          │  │    (from context.user)            │
│  • getAllChats                   │  │                                   │
│    (organizationId)              │  │                                   │
│  • getChatsBetweenUsers          │  │                                   │
│    (userId1, userId2, orgId)     │  │                                   │
│                                  │  │                                   │
│  Mutations                       │  │  Mutations                        │
│  ━━━━━━━━━━                       │  │  ━━━━━━━━━━                       │
│  • createChat                    │  │  • sendMessage                    │
│    (from, to, content, orgId)    │  │    (recipientId, text, orgId)     │
│  • deleteConversation            │  │  • removeMessage                  │
│    (userId, organizationId)      │  │    (messageId, organizationId)    │
│  • markChatAsSeen                │  │                                   │
│    (userId, organizationId)      │  │                                   │
└──────────────────────────────────┘  └──────────────────────────────────┘
         │                                       │
         │ GraphQL Resolvers                    │ GraphQL Resolvers
         ▼                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Backend Validation              │  │  Backend Validation               │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│  1. Check authentication         │  │  1. Check authentication          │
│  2. Validate organizationId      │  │  2. Validate organizationId       │
│  3. Check org membership         │  │  3. Check org membership          │
│  4. Scope to organization        │  │  4. Scope to organization         │
└──────────────────────────────────┘  └──────────────────────────────────┘
         │                                       │
         │ Database Operations                  │ Database Operations
         ▼                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Chat Model (Chat.js)            │  │  Message Model (Message.js)       │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│  • from: ObjectId                │  │  • sender: ObjectId               │
│  • to: ObjectId                  │  │  • recipient: ObjectId            │
│  • content: String               │  │  • text: String                   │
│  • seen: Boolean                 │  │  • createdAt: Date                │
│  • createdAt: Date               │  │  • organizationId: ObjectId       │
│  • deletedBy: [ObjectId]         │  │                                   │
│  • organizationId: ObjectId      │  │  [Hard Delete on Remove]          │
│                                  │  │                                   │
│  [Soft Delete - marks deletedBy] │  │                                   │
└──────────────────────────────────┘  └──────────────────────────────────┘
         │                                       │
         │ Real-time Updates                    │ Standard CRUD
         ▼                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Subscriptions                   │  │  Direct Database                  │
│  ━━━━━━━━━━━━━━                   │  │  ━━━━━━━━━━━━━━━━                  │
│  • chatCreated                   │  │  • Find messages by recipient     │
│    → Update UI in real-time      │  │  • Update profile references      │
│  • chatSeen                      │  │  • Delete from database           │
│    → Update seen status          │  │                                   │
│  • onlineStatusChanged           │  │                                   │
│    → Update user online status   │  │                                   │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

---

## Data Flow: Sending a Chat Message

```
User types message in ChatPopup
         │
         ▼
[1] Component validates input
         │
         ├─── Text not empty?
         ├─── User selected?
         └─── Organization exists?
         │
         ▼
[2] createChat mutation called
    Variables: {
      from: userId,
      to: selectedUserId,
      content: messageText,
      organizationId: currentOrganization._id  ← REQUIRED
    }
         │
         ▼
[3] Backend resolver receives request
         │
         ├─── Check authentication (context.user exists?)
         ├─── Validate organizationId provided
         ├─── Check user is member of organization
         └─── Validate recipient is also member
         │
         ▼
[4] Create Chat document in MongoDB
    {
      from: userId,
      to: recipientId,
      content: messageText,
      seen: false,
      createdAt: Date.now(),
      deletedBy: [],
      organizationId: orgId
    }
         │
         ▼
[5] Publish subscription event
    pubsub.publish("CHAT_CREATED", { chatCreated: newChat })
         │
         ▼
[6] All subscribed clients receive update
         │
         ├─── Sender's ChatPopup: Remove optimistic message
         ├─── Recipient's ChatPopup (if open): Add message to conversation
         └─── Recipient's notification: Increment badge (if not viewing)
         │
         ▼
[7] Return created chat to sender
         │
         ▼
[8] Sender's UI updates with confirmed message
```

---

## Data Flow: Sending a Profile Message

```
User opens MessageBox from profile
         │
         ▼
[1] Component validates input
         │
         ├─── Message text not empty?
         └─── Organization exists?
         │
         ▼
[2] sendMessage mutation called
    Variables: {
      recipientId: recipient._id,
      text: messageText,
      organizationId: currentOrganization._id  ← REQUIRED
    }
         │
         ▼
[3] Backend resolver receives request
         │
         ├─── Check authentication (context.user exists?)
         ├─── Validate organizationId provided
         ├─── Check user is member of organization
         └─── Validate recipient exists and is member
         │
         ▼
[4] Create Message document in MongoDB
    {
      sender: userId,
      recipient: recipientId,
      text: messageText,
      createdAt: Date.now(),
      organizationId: orgId
    }
         │
         ▼
[5] Update Profile references
         │
         ├─── Add to sender.sentMessages[]
         └─── Add to recipient.receivedMessages[]
         │
         ▼
[6] Return created message
         │
         ▼
[7] Show success modal (or close if skipSuccessModal)
         │
         ▼
[8] Refetch QUERY_ME to update message lists
```

---

## Organization Scoping Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION CONTEXT                         │
├─────────────────────────────────────────────────────────────────┤
│  OrganizationContext provides currentOrganization               │
│  ↓                                                               │
│  Components access via: const { currentOrganization } = ...     │
│  ↓                                                               │
│  All operations include: organizationId: currentOrganization._id│
└─────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────┴────────────────────┐
         ↓                                         ↓
┌──────────────────────┐              ┌──────────────────────┐
│  Frontend Validation │              │  Backend Validation  │
├──────────────────────┤              ├──────────────────────┤
│  if (!orgId) {       │              │  if (!orgId) {       │
│    error & return    │              │    throw AuthError   │
│  }                   │              │  }                   │
└──────────────────────┘              └──────────────────────┘
                                                 ↓
                              ┌──────────────────────────────┐
                              │  Organization.findById()     │
                              │  Check: isUserMember(userId) │
                              └──────────────────────────────┘
                                                 ↓
                              ┌──────────────────────────────┐
                              │  Database Query              │
                              │  { organizationId: orgId }   │
                              └──────────────────────────────┘
```

---

## Notification Badge Flow (Chat Only)

```
User A sends message to User B
         │
         ▼
ChatPopup publishes chatCreated event
         │
         ▼
All clients with CHAT_SUBSCRIPTION receive event
         │
         ├─── User A's client: Remove optimistic message
         │
         └─── User B's client:
                   │
                   ▼
              Is chat with User A open?
                   │
                   ├─── YES → Add message to conversation
                   │          Don't increment badge
                   │          Mark as seen
                   │
                   └─── NO → Increment notification badge
                             Store in localStorage
                             Show badge on chat icon
         │
         ▼
User B clicks on User A's chat
         │
         ▼
Badge clears for User A
Notification count decreases
localStorage updated
```

---

## Delete Operations Comparison

```
┌────────────────────────────────┐  ┌────────────────────────────────┐
│  CHAT: Soft Delete             │  │  MESSAGE: Hard Delete          │
├────────────────────────────────┤  ├────────────────────────────────┤
│  User clicks delete            │  │  User clicks delete            │
│       ↓                        │  │       ↓                        │
│  deleteConversation mutation   │  │  removeMessage mutation        │
│       ↓                        │  │       ↓                        │
│  Update Chat documents:        │  │  Delete Message document:      │
│  $push: { deletedBy: userId }  │  │  findOneAndDelete({ _id })     │
│       ↓                        │  │       ↓                        │
│  Messages stay in database     │  │  Message removed from DB       │
│  but hidden for this user      │  │  permanently                   │
│       ↓                        │  │       ↓                        │
│  Other user still sees them    │  │  Removed from all profiles     │
│       ↓                        │  │       ↓                        │
│  Can be "undeleted" by query   │  │  Cannot be recovered           │
│  without deletedBy filter      │  │                                │
└────────────────────────────────┘  └────────────────────────────────┘
```

---

## Error Handling Flow

```
User attempts operation
         │
         ▼
Frontend Validation
         │
         ├─── ✅ Pass → Send to backend
         │
         └─── ❌ Fail → Show error message
                        "Please select a user"
                        "No organization selected"
                        "Message cannot be empty"
         │
         ▼
Backend Receives Request
         │
         ▼
Authentication Check
         │
         ├─── ✅ Pass → Continue
         │
         └─── ❌ Fail → throw AuthenticationError
                        "You need to be logged in"
         │
         ▼
Organization ID Check
         │
         ├─── ✅ Pass → Continue
         │
         └─── ❌ Fail → throw AuthenticationError
                        "Organization ID is required"
         │
         ▼
Organization Membership Check
         │
         ├─── ✅ Pass → Continue
         │
         └─── ❌ Fail → throw AuthenticationError
                        "You are not a member of this organization"
         │
         ▼
Database Operation
         │
         ├─── ✅ Success → Return data
         │
         └─── ❌ Error → throw Error
                         "Failed to create chat"
                         "Message not found"
         │
         ▼
Frontend Receives Response
         │
         ├─── ✅ Success → Update UI, show success
         │
         └─── ❌ Error → Show error message
                        Parse error.message
                        Display to user
```

---

## Component Hierarchy

```
App
 │
 ├── OrganizationContext.Provider
 │    │
 │    └── currentOrganization: { _id, name, ... }
 │         │
 │         ├── Navigation/Header
 │         │    │
 │         │    └── ChatPopup (floating button or icon)
 │         │         │
 │         │         ├── User List
 │         │         │    │
 │         │         │    └── foreach user: notification badge
 │         │         │
 │         │         └── Conversation View
 │         │              │
 │         │              └── foreach message: ChatMessage
 │         │
 │         ├── Profile Page
 │         │    │
 │         │    ├── "Send Message" button
 │         │    │    │
 │         │    │    └── Opens: MessageBox modal
 │         │    │
 │         │    └── MessageList
 │         │         │
 │         │         └── foreach conversation:
 │         │              │
 │         │              └── foreach message: MessageCard
 │         │
 │         └── Other Pages...
 │
 └── Apollo Client
      │
      ├── Queries (GET_CHAT_BY_USER, etc.)
      ├── Mutations (CREATE_CHAT, SEND_MESSAGE, etc.)
      └── Subscriptions (CHAT_CREATED, CHAT_SEEN, etc.)
```

---

## Use Case Decision Tree

```
Do you need to send a message?
         │
         ▼
Is it urgent/conversational?
         │
         ├─── YES → Use CHAT SYSTEM
         │         • Real-time delivery
         │         • Notification badges
         │         • Seen status
         │         • Quick back-and-forth
         │
         └─── NO → Use MESSAGE SYSTEM
                   • Profile-based
                   • Formal feedback
                   • Kudos/recognition
                   • Persistent record
```

---

**Visual Guide Complete!** 🎨  
Use this diagram to understand the flow of data through both systems.
