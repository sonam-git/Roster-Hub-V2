# Multi-Tenant Architecture - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    App Component                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │        Organization Provider (Context)            │ │   │
│  │  │  • Current Organization State                     │ │   │
│  │  │  • Organization List                              │ │   │
│  │  │  • Switch Organization Function                   │ │   │
│  │  │  • Plan Limits & Usage                            │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │         Organization Selector (UI)                │ │   │
│  │  │  • Dropdown in Header                             │ │   │
│  │  │  • Organization List                              │ │   │
│  │  │  • Plan Badges                                    │ │   │
│  │  │  • Member Count                                   │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │            Page Components                        │ │   │
│  │  │  • Home (Posts)                                   │ │   │
│  │  │  • Game Schedule                                  │ │   │
│  │  │  • Roster (Profiles)                              │ │   │
│  │  │  • Messages                                       │ │   │
│  │  │  • Skills                                         │ │   │
│  │  │  • Formations                                     │ │   │
│  │  │                                                    │ │   │
│  │  │  Each uses: useOrganization() hook                │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ GraphQL Queries/Mutations
                            │ (with organizationId)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + GraphQL)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                  Authentication Layer                   │   │
│  │  • JWT Token with organizationId                        │   │
│  │  • User Context (user + organization)                   │   │
│  │  • Auth Middleware                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                  GraphQL Resolvers                      │   │
│  │                                                          │   │
│  │  Query Resolvers:                                       │   │
│  │  • profiles(organizationId) → Filter by org            │   │
│  │  • games(organizationId) → Filter by org               │   │
│  │  • posts(organizationId) → Filter by org               │   │
│  │  • formations(organizationId) → Filter by org          │   │
│  │  • skills(organizationId) → Filter by org              │   │
│  │  • messages(organizationId) → Filter by org            │   │
│  │                                                          │   │
│  │  Mutation Resolvers:                                    │   │
│  │  • createGame(organizationId) → Add to org             │   │
│  │  • addPost(organizationId) → Add to org                │   │
│  │  • sendMessage(organizationId) → Add to org            │   │
│  │  • All mutations validate organization access          │   │
│  │                                                          │   │
│  │  Organization Resolvers:                                │   │
│  │  • getOrganization(id)                                 │   │
│  │  • getUserOrganizations(userId)                        │   │
│  │  • createOrganization(input)                           │   │
│  │  • updateOrganization(id, input)                       │   │
│  │  • inviteMember(orgId, email)                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                   MongoDB Models                        │   │
│  │                                                          │   │
│  │  Organization Model:                                    │   │
│  │  • _id, name, slug, subdomain                          │   │
│  │  • owner, admins, members                              │   │
│  │  • subscription (plan, status)                         │   │
│  │  • limits (maxMembers, maxGames)                       │   │
│  │  • usage (memberCount, gameCount)                      │   │
│  │  • settings (features, branding)                       │   │
│  │                                                          │   │
│  │  Profile Model:                                         │   │
│  │  • organizationId (indexed)                            │   │
│  │  • name, email, position                               │   │
│  │                                                          │   │
│  │  Game Model:                                            │   │
│  │  • organizationId (indexed)                            │   │
│  │  • gameName, date, location                            │   │
│  │                                                          │   │
│  │  Post Model:                                            │   │
│  │  • organizationId (indexed)                            │   │
│  │  • postText, author                                    │   │
│  │                                                          │   │
│  │  Formation, Chat, Message, Skill, Comment:             │   │
│  │  • All have organizationId (indexed)                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Database                           │
│  • Single database with tenant isolation via organizationId     │
│  • Indexes on organizationId for all collections                │
│  • Compound indexes for optimized queries                       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: User Login to Data Display

```
1. USER LOGS IN
   ↓
2. Backend creates JWT with { userId, organizationId }
   ↓
3. Frontend stores JWT in localStorage
   ↓
4. Frontend OrganizationContext initializes
   ↓
5. Fetches user's organizations from backend
   ↓
6. Sets currentOrganization (from JWT or first in list)
   ↓
7. OrganizationSelector displays in header
   ↓
8. Components useOrganization() hook to get organizationId
   ↓
9. Queries include organizationId in variables
   ↓
10. Backend resolvers filter by organizationId
    ↓
11. Only organization's data returned
    ↓
12. UI displays organization-scoped data
```

## Organization Switching Flow

```
USER CLICKS ORGANIZATION SELECTOR
   ↓
DROPDOWN SHOWS ORGANIZATION LIST
   ↓
USER SELECTS NEW ORGANIZATION
   ↓
OrganizationContext.switchOrganization(newOrgId)
   ↓
Updates currentOrganization state
   ↓
Saves to localStorage
   ↓
All components using useOrganization() re-render
   ↓
Queries refetch with new organizationId
   ↓
Backend returns data for new organization
   ↓
UI updates with new organization's data
```

## Component Integration Pattern

```jsx
┌──────────────────────────────────────────────────────────┐
│                    Any Component                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  import { useOrganization } from '../contexts/Org...';   │
│  import { useQuery } from '@apollo/client';              │
│  import { QUERY_GAMES } from '../utils/queries';         │
│                                                           │
│  function MyComponent() {                                │
│    // 1. Get organization context                        │
│    const { currentOrganization, canCreateGame } =        │
│      useOrganization();                                  │
│                                                           │
│    // 2. Query with organizationId                       │
│    const { data, loading } = useQuery(QUERY_GAMES, {     │
│      variables: {                                        │
│        organizationId: currentOrganization?._id          │
│      },                                                  │
│      skip: !currentOrganization // Wait for org          │
│    });                                                   │
│                                                           │
│    // 3. Check loading states                            │
│    if (!currentOrganization) return <Loading />;         │
│    if (loading) return <Loading />;                      │
│                                                           │
│    // 4. Check limits before actions                     │
│    const handleCreate = () => {                          │
│      if (!canCreateGame()) {                             │
│        alert('Game limit reached. Upgrade plan!');       │
│        return;                                           │
│      }                                                   │
│      // ... create game                                  │
│    };                                                    │
│                                                           │
│    // 5. Render data                                     │
│    return (                                              │
│      <div>                                               │
│        <h1>{currentOrganization.name}</h1>               │
│        {data.games.map(game => <GameCard />)}            │
│      </div>                                              │
│    );                                                    │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: JWT Authentication                                │
│  • Token includes userId + organizationId                   │
│  • Verified on every request                                │
│  • Expired tokens rejected                                  │
│                                                              │
│  Layer 2: Organization Membership Check                     │
│  • Resolver verifies user is member of organization         │
│  • Rejects requests from non-members                        │
│  • Checks admin/owner roles for privileged actions          │
│                                                              │
│  Layer 3: Data Filtering                                    │
│  • All queries filtered by organizationId                   │
│  • User can only see their organization's data              │
│  • No cross-organization data leaks                         │
│                                                              │
│  Layer 4: Mutation Validation                               │
│  • Create: Adds organizationId automatically                │
│  • Update: Verifies resource belongs to organization        │
│  • Delete: Verifies resource belongs to organization        │
│  • All operations check permissions                         │
│                                                              │
│  Layer 5: Plan Limits Enforcement                           │
│  • Backend validates against plan limits                    │
│  • Rejects operations exceeding limits                      │
│  • Frontend shows warnings before hitting limits            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Subscription Plans & Limits

```
┌────────────────────┬──────────────┬──────────────┬──────────────┐
│     Feature        │     Free     │     Pro      │  Enterprise  │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│  Max Members       │      20      │     100      │   Unlimited  │
│  Max Games         │      50      │     500      │   Unlimited  │
│  Storage (MB)      │     100      │    1000      │   Unlimited  │
│  Formations        │      ✓       │      ✓       │      ✓       │
│  Chat              │      ✓       │      ✓       │      ✓       │
│  Posts             │      ✓       │      ✓       │      ✓       │
│  Skills            │      ✓       │      ✓       │      ✓       │
│  Weather           │      ✓       │      ✓       │      ✓       │
│  Custom Branding   │      ✗       │      ✓       │      ✓       │
│  Custom Domain     │      ✗       │      ✗       │      ✓       │
│  Analytics         │    Basic     │   Advanced   │  Enterprise  │
│  Support           │   Community  │    Email     │    Priority  │
│  Price/Month       │     $0       │     $29      │    $99+      │
└────────────────────┴──────────────┴──────────────┴──────────────┘
```

## File Structure

```
Roster-Hub/
├── client/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── OrganizationContext.jsx ✅ (NEW)
│   │   ├── components/
│   │   │   ├── OrganizationSelector/ ✅ (NEW)
│   │   │   │   └── OrganizationSelector.jsx
│   │   │   ├── MainHeader/
│   │   │   │   └── index.jsx ✅ (UPDATED)
│   │   │   ├── TopHeader/
│   │   │   │   └── index.jsx ✅ (UPDATED)
│   │   │   ├── GameList/ ⏳ (TODO: Add org context)
│   │   │   ├── ProfileList/ ⏳ (TODO: Add org context)
│   │   │   └── ... (all need org context)
│   │   ├── pages/
│   │   │   ├── Game.jsx ⏳ (TODO: Add org context)
│   │   │   ├── Roster.jsx ⏳ (TODO: Add org context)
│   │   │   ├── Home.jsx ⏳ (TODO: Add org context)
│   │   │   └── ... (all need org context)
│   │   ├── utils/
│   │   │   ├── queries.jsx ⏳ (TODO: Add organizationId)
│   │   │   └── mutations.jsx ⏳ (TODO: Add organizationId)
│   │   └── main.jsx ✅ (UPDATED)
│   └── ...
├── server/
│   ├── models/
│   │   ├── Organization.js ✅ (NEW)
│   │   ├── Profile.js ✅ (UPDATED: has organizationId)
│   │   ├── Game.js ✅ (UPDATED: has organizationId)
│   │   ├── Post.js ✅ (UPDATED: has organizationId)
│   │   ├── Formation.js ✅ (UPDATED: has organizationId)
│   │   ├── Chat.js ✅ (UPDATED: has organizationId)
│   │   ├── Message.js ✅ (UPDATED: has organizationId)
│   │   ├── Skill.js ✅ (UPDATED: has organizationId)
│   │   └── ... (all updated)
│   ├── schemas/
│   │   ├── typeDefs.js ✅ (UPDATED: org types)
│   │   ├── resolvers.js ✅ (UPDATED: org resolvers)
│   │   └── organizationResolvers.js ✅ (NEW)
│   ├── utils/
│   │   └── auth.js ✅ (UPDATED: org in JWT)
│   └── ...
└── Documentation/
    ├── MULTI_TENANT_MIGRATION.md ✅
    ├── MULTI_TENANT_PHASE6_FRONTEND_INTEGRATION.md ✅
    ├── MULTI_TENANT_PHASE7_QUERY_UPDATE_GUIDE.md ✅
    ├── FRONTEND_QUICK_START.md ✅
    └── MULTI_TENANT_ARCHITECTURE.md ✅ (THIS FILE)
```

## Progress Tracker

```
Backend Implementation:
███████████████████████████████████████████████████████ 100%

Frontend Context & UI:
███████████████████████████████████████████████████████ 100%

Frontend Query Updates:
██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 5%

Frontend Component Updates:
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%

Organization Management UI:
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%

Overall Progress:
████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 25%
```

## Key Benefits

### For Users
✅ **Multiple Organizations**: Manage multiple teams/groups
✅ **Easy Switching**: One-click organization switching
✅ **Clear Context**: Always know which organization you're viewing
✅ **Data Isolation**: Each organization's data is completely separate
✅ **Plan Flexibility**: Choose plan that fits your needs

### For Developers
✅ **Clean Architecture**: Separation of concerns
✅ **Type Safety**: GraphQL schema enforcement
✅ **Easy to Use**: Simple `useOrganization()` hook
✅ **Scalable**: Supports unlimited organizations
✅ **Maintainable**: Clear patterns and documentation

### For Business
✅ **Revenue Model**: Subscription-based plans
✅ **Scalability**: Single codebase, unlimited tenants
✅ **Security**: Robust data isolation
✅ **Analytics**: Per-organization usage tracking
✅ **Growth**: Easy to add new features per plan

## Next Immediate Steps

1. ✅ **Phase 6 Complete**: Organization context and UI integrated
2. 🔴 **Phase 7 Next**: Update all queries to include organizationId
3. ⏳ **Phase 8 Waiting**: Update all components to use organization context
4. ⏳ **Phase 9 Waiting**: Build organization management UI
5. ⏳ **Phase 10 Waiting**: Add advanced features and analytics

**Current Task**: Start with updating `QUERY_ME` in `/client/src/utils/queries.jsx`

---

**Documentation Last Updated**: January 7, 2026
**Architecture Status**: Phase 6 Complete, Phase 7 Ready to Start
