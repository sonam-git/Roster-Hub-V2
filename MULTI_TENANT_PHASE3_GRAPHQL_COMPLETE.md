# Phase 3: GraphQL Schema & Resolver Updates - Complete Guide

## Overview
Phase 3 involves updating the GraphQL schema and resolvers to support multi-tenant architecture. This document provides a complete guide for implementation.

---

## ✅ Completed: GraphQL Schema Updates

### Updated File: `/server/schemas/typeDefs.js`

#### 1. Updated Existing Types with `organizationId`

All existing types now include the `organizationId` field:

```graphql
type Profile {
  # ... existing fields ...
  organizations: [Organization]
  currentOrganization: Organization
  roleInOrganization(organizationId: ID!): String
}

type Game {
  # ... existing fields ...
  organizationId: ID!
}

type Formation {
  # ... existing fields ...
  organizationId: ID!
}

type Post {
  # ... existing fields ...
  organizationId: ID!
}

type Comment {
  # ... existing fields ...
  organizationId: ID!
}

type Message {
  # ... existing fields ...
  organizationId: ID!
}

type Chat {
  # ... existing fields ...
  organizationId: ID!
}

type Skill {
  # ... existing fields ...
  organizationId: ID!
}

type SocialMediaLink {
  # ... existing fields ...
  organizationId: ID!
}
```

#### 2. Added Organization Types

Complete organization schema with all nested types:

```graphql
type Organization {
  _id: ID!
  name: String!
  slug: String!
  description: String
  logo: String
  subdomain: String
  customDomain: String
  settings: OrganizationSettings
  owner: Profile!
  admins: [Profile!]
  members: [Profile!]
  subscription: OrganizationSubscription
  limits: OrganizationLimits
  usage: OrganizationUsage
  invitations: [Invitation]
  isActive: Boolean!
  isVerified: Boolean!
  createdAt: String!
  updatedAt: String!
}

type OrganizationSettings { ... }
type OrganizationSubscription { ... }
type OrganizationLimits { ... }
type OrganizationUsage { ... }
type Invitation { ... }
```

#### 3. Added Organization Queries

```graphql
extend type Query {
  myOrganizations: [Organization]
  organization(organizationId: ID!): Organization
  organizationBySlug(slug: String!): Organization
  organizationBySubdomain(subdomain: String!): Organization
  isSlugAvailable(slug: String!): Boolean!
  organizationMembers(organizationId: ID!): [Profile]
  organizationInvitations(organizationId: ID!): [Invitation]
}
```

#### 4. Added Organization Mutations

```graphql
extend type Mutation {
  createOrganization(input: OrganizationInput!): Auth!
  updateOrganization(organizationId: ID!, input: OrganizationInput!): Organization!
  updateOrganizationSettings(organizationId: ID!, settings: OrganizationSettingsInput!): Organization!
  addOrganizationMember(organizationId: ID!, userId: ID!, role: String): Organization!
  removeOrganizationMember(organizationId: ID!, userId: ID!): Organization!
  updateMemberRole(organizationId: ID!, userId: ID!, role: String!): Organization!
  createInvitation(organizationId: ID!, email: String, role: String): Invitation!
  acceptInvitation(invitationCode: String!): Auth!
  deleteInvitation(organizationId: ID!, invitationCode: String!): Boolean!
  switchOrganization(organizationId: ID!): Auth!
  deleteOrganization(organizationId: ID!): Boolean!
}
```

#### 5. Added Organization Subscriptions

```graphql
extend type Subscription {
  organizationMemberAdded(organizationId: ID!): Profile!
  organizationMemberRemoved(organizationId: ID!): Profile!
  organizationUpdated(organizationId: ID!): Organization!
}
```

#### 6. Updated Auth Type

```graphql
type Auth {
  token: ID!
  profile: Profile
  organization: Organization  # NEW
}
```

---

## ✅ Created: Organization Resolvers

### New File: `/server/schemas/organizationResolvers.js`

Complete resolver implementation with:
- ✅ All 7 organization queries
- ✅ All 12 organization mutations
- ✅ Field resolvers for Profile
- ✅ Proper authentication and authorization checks
- ✅ Member limit enforcement
- ✅ Invitation system
- ✅ Organization switching

---

## 🔄 TODO: Integrate Organization Resolvers

### Step 1: Update resolvers.js to import Organization model

Add to the imports at the top of `/server/schemas/resolvers.js`:

```javascript
const {
  Profile,
  Skill,
  Message,
  SocialMediaLink,
  Post,
  Comment,
  Chat,
  Game,
  Formation,
  Organization, // ADD THIS
} = require("../models");
```

### Step 2: Merge Organization Resolvers

At the end of `/server/schemas/resolvers.js`, before `module.exports = resolvers;`:

```javascript
const organizationResolvers = require('./organizationResolvers');

// Merge organization resolvers
resolvers.Query = {
  ...resolvers.Query,
  ...organizationResolvers.Query,
};

resolvers.Mutation = {
  ...resolvers.Mutation,
  ...organizationResolvers.Mutation,
};

// Add Profile field resolver
if (!resolvers.Profile) {
  resolvers.Profile = {};
}
resolvers.Profile = {
  ...resolvers.Profile,
  ...organizationResolvers.Profile,
};

module.exports = resolvers;
```

---

## 🔄 TODO: Update Existing Resolvers with organizationId

All existing resolvers need to be updated to:
1. Filter queries by `context.organizationId`
2. Add `organizationId` to all create/update operations
3. Validate organization membership before operations

### Critical Changes Needed

#### 1. Update Auth Context
File: `/server/utils/auth.js`

Update the `authMiddleware` to extract `organizationId` from JWT:

```javascript
authMiddleware: function (context) {
  let token = context.req.body.token || context.req.query.token || context.req.headers.authorization;

  if (context.req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return context;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    context.user = data;
    context.organizationId = data.organizationId; // ADD THIS
  } catch {
    console.log('Invalid token');
  }

  return context;
},
```

#### 2. Update signToken Function
File: `/server/utils/auth.js`

```javascript
signToken: function ({ email, name, _id, organizationId }) {
  const payload = { email, name, _id, organizationId }; // ADD organizationId
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
},
```

#### 3. Update Game Queries

Example for `games` query in `/server/schemas/resolvers.js`:

```javascript
// BEFORE
games: async (parent, { status }) => {
  const filter = status ? { status } : {};
  return Game.find(filter)
    .populate('creator')
    .populate('responses.user')
    .populate('feedbacks.user')
    .populate('feedbacks.playerOfTheMatch')
    .sort({ date: 1, time: 1 });
},

// AFTER
games: async (parent, { status }, context) => {
  if (!context.user || !context.organizationId) {
    throw new AuthenticationError("You need to be logged in and have an active organization!");
  }

  const filter = { 
    organizationId: context.organizationId,
    ...(status && { status })
  };
  
  return Game.find(filter)
    .populate('creator')
    .populate('responses.user')
    .populate('feedbacks.user')
    .populate('feedbacks.playerOfTheMatch')
    .sort({ date: 1, time: 1 });
},
```

#### 4. Update Game Mutations

Example for `createGame` mutation:

```javascript
// BEFORE
createGame: async (parent, { input }, context) => {
  if (!context.user) {
    throw new AuthenticationError("You need to be logged in!");
  }

  const game = await Game.create({
    ...input,
    creator: context.user._id,
  });

  // ... rest of code
},

// AFTER
createGame: async (parent, { input }, context) => {
  if (!context.user || !context.organizationId) {
    throw new AuthenticationError("You need to be logged in and have an active organization!");
  }

  // Check if organization has reached game limit
  const org = await Organization.findById(context.organizationId);
  if (org.hasReachedGameLimit()) {
    throw new UserInputError("Organization has reached its game limit!");
  }

  const game = await Game.create({
    ...input,
    creator: context.user._id,
    organizationId: context.organizationId, // ADD THIS
  });

  // Update organization usage
  org.usage.gameCount += 1;
  await org.save();

  // ... rest of code
},
```

---

## 🔄 TODO: Update All Queries to Filter by organizationId

### Queries to Update:

1. **profiles** - Filter by current organization members
```javascript
profiles: async (parent, args, context) => {
  if (!context.organizationId) {
    throw new AuthenticationError("No active organization!");
  }
  
  const org = await Organization.findById(context.organizationId);
  return Profile.find({ _id: { $in: org.members } })
    .populate('receivedMessages')
    .populate('skills')
    .populate('socialMediaLinks')
    .populate('sentMessages')
    .populate('posts');
},
```

2. **posts** - Filter by organizationId
```javascript
posts: async (parent, args, context) => {
  if (!context.organizationId) {
    throw new AuthenticationError("No active organization!");
  }
  
  return Post.find({ organizationId: context.organizationId })
    .populate('userId')
    .populate('comments')
    .populate('likedBy')
    .sort({ createdAt: -1 });
},
```

3. **skills** - Filter by organizationId
```javascript
skills: async (parent, args, context) => {
  if (!context.organizationId) {
    throw new AuthenticationError("No active organization!");
  }
  
  return Skill.find({ organizationId: context.organizationId })
    .populate('recipient')
    .populate('reactions.user')
    .sort({ createdAt: -1 });
},
```

4. **getChatByUser** - Filter by organizationId
5. **getAllChats** - Filter by organizationId
6. **receivedMessages** - Filter by organizationId

---

## 🔄 TODO: Update All Mutations to Include organizationId

### Mutations to Update:

1. **addPost**
2. **addComment**
3. **addSkill**
4. **sendMessage**
5. **createChat**
6. **saveSocialMediaLink**
7. **createFormation**
8. **addFormationComment**

Each mutation needs:
```javascript
// Add organizationId from context
const item = await Model.create({
  ...input,
  organizationId: context.organizationId,
});
```

---

## 🔄 TODO: Update Login/Signup Mutations

### 1. Update addProfile (Signup)

```javascript
addProfile: async (parent, { name, email, password }) => {
  const profile = await Profile.create({ name, email, password });
  
  // Create default organization for new user
  const organization = await Organization.create({
    name: `${name}'s Team`,
    slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    owner: profile._id,
    members: [profile._id],
    usage: { memberCount: 1, gameCount: 0, storageUsed: 0 },
  });

  // Update profile with organization
  profile.organizations = [{
    organizationId: organization._id,
    role: 'owner',
  }];
  profile.currentOrganization = organization._id;
  await profile.save();

  const token = signToken({
    email: profile.email,
    name: profile.name,
    _id: profile._id,
    organizationId: organization._id,
  });

  return { token, profile, organization };
},
```

### 2. Update login

```javascript
login: async (parent, { email, password }) => {
  const profile = await Profile.findOne({ email }).populate('currentOrganization');

  if (!profile) {
    throw new AuthenticationError('Incorrect credentials');
  }

  const correctPw = await profile.isCorrectPassword(password);

  if (!correctPw) {
    throw new AuthenticationError('Incorrect credentials');
  }

  // Get current organization or first organization
  const orgId = profile.currentOrganization?._id || profile.organizations[0]?.organizationId;

  const token = signToken({
    email: profile.email,
    name: profile.name,
    _id: profile._id,
    organizationId: orgId,
  });

  return { token, profile, organization: profile.currentOrganization };
},
```

---

## 🔄 TODO: Add Organization Context Validation Helper

Create a helper function in resolvers.js:

```javascript
// Helper to validate organization context
const requireOrganizationContext = (context) => {
  if (!context.user) {
    throw new AuthenticationError("You need to be logged in!");
  }
  if (!context.organizationId) {
    throw new AuthenticationError("You need to have an active organization!");
  }
};
```

Use it in every resolver:

```javascript
someQuery: async (parent, args, context) => {
  requireOrganizationContext(context);
  // ... rest of code
},
```

---

## 📝 Testing Checklist

### Organization Management
- [ ] Create organization
- [ ] Update organization details
- [ ] Update organization settings
- [ ] Delete organization
- [ ] Get organization by ID
- [ ] Get organization by slug
- [ ] Check slug availability

### Member Management
- [ ] Add member to organization
- [ ] Remove member from organization
- [ ] Update member role
- [ ] List organization members
- [ ] Prevent adding beyond member limit

### Invitation System
- [ ] Create invitation
- [ ] Accept invitation
- [ ] Delete invitation
- [ ] List invitations
- [ ] Handle expired invitations

### Organization Switching
- [ ] Switch between organizations
- [ ] Token updated with new organizationId
- [ ] Context updated correctly

### Data Isolation
- [ ] Games filtered by organization
- [ ] Posts filtered by organization
- [ ] Chats filtered by organization
- [ ] Skills filtered by organization
- [ ] No cross-organization data visible

---

## 🚀 Deployment Steps

1. ✅ Update models (Phase 1 & 2 - Complete)
2. ✅ Update GraphQL schema (Phase 3 - Complete)
3. ✅ Create organization resolvers (Phase 3 - Complete)
4. 🔄 Integrate organization resolvers (In Progress)
5. 🔄 Update auth utilities
6. 🔄 Update existing resolvers
7. ⏳ Create migration script
8. ⏳ Test thoroughly
9. ⏳ Update frontend

---

## 📊 Progress Summary

### Completed
- ✅ All models updated with organizationId
- ✅ GraphQL schema updated with Organization types
- ✅ Organization resolvers created
- ✅ All type definitions include organizationId

### In Progress
- 🔄 Integration of organization resolvers
- 🔄 Updating existing resolvers

### Pending
- ⏳ Auth utility updates
- ⏳ Migration script
- ⏳ Frontend implementation

---

*Document Updated: Phase 3 - GraphQL Schema Complete*  
*Next: Integrate resolvers and update auth utilities*
