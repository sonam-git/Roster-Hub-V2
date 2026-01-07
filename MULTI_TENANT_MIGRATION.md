# Multi-Tenant Migration Plan

## Overview
This document outlines the complete plan to migrate the Roster Hub application from a single-tenant to a multi-tenant (multi-organization) architecture.

## Phase 1: Database Models ✅ COMPLETED

### Models Updated:
1. ✅ **Organization** - New model created
2. ✅ **Profile** - Added `currentOrganization` and `organizations[]` fields
3. ✅ **Game** - Added `organizationId` field
4. ✅ **Formation** - Added `organizationId` field  
5. ✅ **Post** - Added `organizationId` field

### Still Need to Update:
- [ ] **Comment** - Add `organizationId`
- [ ] **Chat** - Add `organizationId`
- [ ] **Message** - Add `organizationId`
- [ ] **Skill** - Add `organizationId`
- [ ] **SocialMediaLink** - Add `organizationId`

## Phase 2: GraphQL Schema (Next Step)

### Type Definitions
- [ ] Add Organization types (see ORGANIZATION_TYPEDEF.md)
- [ ] Update existing types to include organizationId
- [ ] Add organization queries
- [ ] Add organization mutations
- [ ] Add organization subscriptions

### Resolvers
- [ ] Implement organization resolvers
- [ ] Update ALL existing resolvers to filter by organizationId
- [ ] Add organization context to resolver context
- [ ] Update authentication to include organization info

## Phase 3: Authentication & Authorization

### JWT Token Updates
```javascript
// Current token payload:
{
  userId: "xxx",
  email: "user@example.com"
}

// New token payload:
{
  userId: "xxx",
  email: "user@example.com",
  organizationId: "yyy",
  organizations: ["yyy", "zzz"],
  role: "admin" // in current organization
}
```

### Middleware Updates
- [ ] Create `requireOrganization` middleware
- [ ] Create `requireAdmin` middleware  
- [ ] Update `authMiddleware` to include organization
- [ ] Add organization validation to all protected routes

## Phase 4: Backend Resolvers

### Critical: Update ALL Query Resolvers

Every resolver MUST filter by organizationId:

```javascript
// ❌ BEFORE (DANGEROUS):
games: async () => {
  return await Game.find({});
}

// ✅ AFTER (SAFE):
games: async (parent, args, context) => {
  const { organizationId } = context.user;
  if (!organizationId) throw new Error("No organization selected");
  return await Game.find({ organizationId });
}
```

### Resolvers to Update:
- [ ] profiles
- [ ] games
- [ ] formations
- [ ] posts
- [ ] comments
- [ ] chats
- [ ] messages
- [ ] skills
- [ ] All other queries

### Mutation Resolvers
- [ ] Add organizationId to all create mutations
- [ ] Add organization validation to all mutations
- [ ] Update subscriptions to include organizationId filter

## Phase 5: Data Migration Script

Create script to migrate existing data:

```javascript
// scripts/migrateToMultiTenant.js

const mongoose = require('mongoose');
const { Organization, Profile, Game, Formation, Post } = require('./models');

async function migrate() {
  // 1. Create default organization
  const defaultOrg = await Organization.create({
    name: "Default Organization",
    slug: "default",
    subdomain: "app",
    owner: /* first user ID */,
    subscription: { plan: 'free', status: 'active' }
  });

  // 2. Update all profiles
  await Profile.updateMany(
    {},
    {
      $set: {
        currentOrganization: defaultOrg._id,
        organizations: [{
          organization: defaultOrg._id,
          role: 'member',
          joinedAt: new Date()
        }]
      }
    }
  );

  // 3. Update all games
  await Game.updateMany(
    {},
    { $set: { organizationId: defaultOrg._id } }
  );

  // 4. Update all formations
  await Formation.updateMany(
    {},
    { $set: { organizationId: defaultOrg._id } }
  );

  // 5. Update all posts
  await Post.updateMany(
    {},
    { $set: { organizationId: defaultOrg._id } }
  );

  // Continue for all other models...
  
  console.log('Migration complete!');
}
```

## Phase 6: Frontend Updates

### Context & State Management
- [ ] Create `OrganizationContext`
- [ ] Create `useOrganization` hook
- [ ] Add organization provider to App.jsx
- [ ] Add organization state management

### Components to Create
- [ ] OrganizationSwitcher
- [ ] OrganizationOnboarding
- [ ] OrganizationSettings
- [ ] OrganizationMemberList
- [ ] InviteMemberModal
- [ ] OrganizationBranding

### Components to Update
- [ ] Header - Add organization switcher
- [ ] All pages - Add organization context
- [ ] All queries - Add organizationId variable
- [ ] All mutations - Add organizationId

### Routing Updates
- [ ] Add subdomain detection
- [ ] Add organization-based routing
- [ ] Update navigation based on organization

## Phase 7: Subscription System (Optional but Recommended)

### Stripe Integration
- [ ] Set up Stripe account
- [ ] Create subscription products
- [ ] Implement checkout flow
- [ ] Add webhook handlers
- [ ] Create billing portal

### Usage Tracking
- [ ] Track member count
- [ ] Track game count
- [ ] Track storage usage
- [ ] Enforce limits based on plan

## Phase 8: Infrastructure & Deployment

### DNS & Subdomains
- [ ] Configure wildcard DNS (*.rosterhub.com)
- [ ] Set up SSL for subdomains
- [ ] Configure Vercel/hosting for subdomains

### Environment Variables
```
MONGODB_URI=mongodb://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
BASE_DOMAIN=rosterhub.com
```

### Monitoring
- [ ] Set up error tracking per organization
- [ ] Add usage analytics per organization
- [ ] Configure alerts for limits

## Phase 9: Testing

### Unit Tests
- [ ] Test organization CRUD
- [ ] Test multi-tenant data isolation
- [ ] Test invitation system
- [ ] Test role-based access

### Integration Tests
- [ ] Test user switching organizations
- [ ] Test data isolation between orgs
- [ ] Test subscription limits
- [ ] Test invitation acceptance

### Security Tests
- [ ] Test unauthorized access
- [ ] Test cross-organization data leaks
- [ ] Test SQL injection (NoSQL injection)
- [ ] Penetration testing

## Phase 10: Documentation

- [ ] API documentation for organization endpoints
- [ ] User guide for creating organizations
- [ ] Admin guide for managing organizations
- [ ] Developer guide for multi-tenant patterns

## Timeline Estimate

| Phase | Estimated Time | Priority |
|-------|----------------|----------|
| Phase 1 | ✅ Complete | Critical |
| Phase 2 | 1 week | Critical |
| Phase 3 | 3-4 days | Critical |
| Phase 4 | 1-2 weeks | Critical |
| Phase 5 | 2-3 days | Critical |
| Phase 6 | 2-3 weeks | Critical |
| Phase 7 | 1 week | High |
| Phase 8 | 3-5 days | High |
| Phase 9 | 1 week | High |
| Phase 10 | 2-3 days | Medium |

**Total Estimated Time: 8-12 weeks**

## Critical Security Checklist

Before going live, ensure:

- [ ] ALL queries filter by organizationId
- [ ] ALL mutations validate organizationId
- [ ] ALL subscriptions filter by organizationId
- [ ] No global queries exist
- [ ] Authorization checks on every sensitive operation
- [ ] Proper error messages (don't leak info)
- [ ] Rate limiting per organization
- [ ] Input validation on all mutations
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

## Next Immediate Steps

1. **Update remaining models** (Comment, Chat, Message, Skill, SocialMediaLink)
2. **Add Organization types to typeDefs.js**
3. **Create organization resolvers**
4. **Update auth middleware**
5. **Run migration script on development database**
6. **Test data isolation**
7. **Create organization onboarding flow in frontend**

## Questions to Answer

- [ ] Will existing users be migrated to a default organization?
- [ ] Will you offer a free trial period?
- [ ] What are the exact limits for each subscription tier?
- [ ] Custom domain support immediately or later?
- [ ] Allow users to be in multiple organizations?
- [ ] How to handle organization deletion (hard delete or soft delete)?

## Resources Created

- `server/models/Organization.js` - Organization model
- `ORGANIZATION_TYPEDEF.md` - GraphQL type definitions
- `MULTI_TENANT_MIGRATION.md` - This file

## Status: Phase 1 Complete ✅

Ready to proceed to Phase 2: GraphQL Schema updates.
