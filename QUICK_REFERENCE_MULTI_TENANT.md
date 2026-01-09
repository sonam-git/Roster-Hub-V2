# 🎯 Multi-Tenant Quick Reference Card

## 📋 For New Developers Joining the Project

### Current State (January 7, 2026)
```
✅ Backend: 100% complete - All models and resolvers organization-aware
✅ Frontend Reads: 100% complete - All queries organization-aware
⏳ Frontend Writes: 0% complete - Mutations need updating (NEXT)
```

---

## 🏗️ Architecture at a Glance

### How Multi-Tenancy Works
```
Organization (e.g., "Team A")
  └── Members (Users in this org)
  └── Games (Only Team A's games)
  └── Posts (Only Team A's posts)
  └── Formations (Only Team A's formations)
  └── Skills (Only Team A's skills)
  └── Messages (Only Team A's messages)
```

Each user can belong to multiple organizations and switch between them.

---

## 🔑 Key Concepts

### 1. Organization Context
Every component that queries data needs organization context:

```jsx
import { useOrganization } from '../contexts/OrganizationContext';

const { currentOrganization } = useOrganization();
// currentOrganization._id is used in all queries
```

### 2. The Standard Pattern
**EVERY component follows this 4-step pattern:**

```jsx
function MyComponent() {
  // STEP 1: Get organization
  const { currentOrganization } = useOrganization();
  
  // STEP 2: Query with organizationId
  const { data, loading, error, refetch } = useQuery(MY_QUERY, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  // STEP 3: Refetch when org changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  // STEP 4: Loading states
  if (!currentOrganization) return <Loading text="Loading organization..." />;
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  // STEP 5: Render
  return <YourUI />;
}
```

### 3. Mutations (Not Yet Updated)
**What NEEDS to happen (Phase 8):**

```jsx
// BAD (current state - will be fixed)
const [createGame] = useMutation(CREATE_GAME);
await createGame({ variables: { name, date } });

// GOOD (target state - Phase 8)
const { currentOrganization } = useOrganization();
const [createGame] = useMutation(CREATE_GAME);
await createGame({ 
  variables: { 
    name, 
    date,
    organizationId: currentOrganization._id  // ← Add this
  } 
});
```

---

## 📁 File Organization

### Backend
```
/server/models/
  └── Organization.js          ← The main model
  └── All other models         ← Have organizationId field

/server/schemas/
  └── typeDefs.js              ← Organization types defined
  └── resolvers.js             ← All resolvers organization-aware
  └── organizationResolvers.js ← Org-specific resolvers

/server/utils/
  └── auth.js                  ← JWT includes organizationId
```

### Frontend
```
/client/src/contexts/
  └── OrganizationContext.jsx  ← The source of truth

/client/src/components/
  └── OrganizationSelector/    ← UI for switching orgs
  └── TopHeader/               ← Desktop org selector
  └── MainHeader/              ← Mobile org selector

/client/src/pages/
  └── All pages/*.jsx          ← All use organization context

/client/src/components/
  └── All components/*.jsx     ← Most use organization context
```

---

## 🎯 Common Tasks

### Adding Organization Context to a New Component

1. **Import the hook**:
```jsx
import { useOrganization } from '../contexts/OrganizationContext';
```

2. **Use it in your component**:
```jsx
const { currentOrganization } = useOrganization();
```

3. **Add to your query**:
```jsx
const { data, refetch } = useQuery(MY_QUERY, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization
});
```

4. **Add refetch effect**:
```jsx
useEffect(() => {
  if (currentOrganization) {
    refetch({ organizationId: currentOrganization._id });
  }
}, [currentOrganization, refetch]);
```

5. **Add loading state**:
```jsx
if (!currentOrganization) return <Loading />;
```

---

## 🔍 Debugging Tips

### Problem: Data not loading
**Check**:
1. Is `currentOrganization` defined? (console.log it)
2. Is `organizationId` in the query variables?
3. Is `skip: !currentOrganization` set on the query?

### Problem: Data not updating on org switch
**Check**:
1. Do you have the useEffect with refetch?
2. Is `currentOrganization` in the dependency array?
3. Check browser network tab for refetch calls

### Problem: Creating items fails
**This is expected!** Mutations haven't been updated yet (Phase 8).
The error will say something like "organizationId required".

---

## 📊 What Each File Type Should Have

### Pages (Game.jsx, Roster.jsx, etc.)
✅ useOrganization hook  
✅ organizationId in queries  
✅ refetch on org change  
✅ loading state for org  

### Components (GameList, PostsList, etc.)
✅ useOrganization hook  
✅ organizationId in queries  
✅ refetch on org change  
✅ loading state for org  

### Forms (GameForm, PostForm, etc.)
⏳ Need to add organizationId to mutations (Phase 8)  
⏳ Need to pass currentOrganization._id (Phase 8)  

---

## 🚨 Critical Rules

### DO ✅
- Always use `currentOrganization?._id` (with optional chaining)
- Always add `skip: !currentOrganization` to queries
- Always add refetch effect
- Always add loading state for organization
- Always check if user is in organization (backend)

### DON'T ❌
- Don't query without organizationId
- Don't assume organization exists
- Don't skip the loading state
- Don't forget the refetch effect
- Don't use hardcoded organization IDs

---

## 🎓 Understanding the Flow

### User Logs In
1. JWT contains organizationId (their default org)
2. OrganizationContext initializes with that org
3. All components get currentOrganization
4. All queries automatically filter by org

### User Switches Organization
1. User clicks different org in dropdown
2. OrganizationContext updates currentOrganization
3. All useEffects fire (because dep changed)
4. All queries refetch with new organizationId
5. UI updates with new org's data

### User Creates Something (After Phase 8)
1. User fills form
2. Form submits with organizationId
3. Backend validates user is in org
4. Backend checks org limits
5. Backend creates item with organizationId
6. Subscription notifies all clients in org
7. UI updates

---

## 📈 Progress at a Glance

### ✅ Complete (Can use as examples)
- `client/src/pages/Game.jsx` - Full pattern
- `client/src/pages/Roster.jsx` - Full pattern
- `client/src/components/GameList/index.jsx` - Full pattern
- `client/src/components/PostsList/index.jsx` - Full pattern

### ⏳ In Progress (Phase 8)
- All mutation operations
- Organization management UI
- Member invitation system

### 📚 Documentation
- `MULTI_TENANT_MASTER_STATUS.md` - Overall status
- `PHASE7_COMPLETE_SUMMARY.md` - Queries/components done
- `PHASE8_MUTATIONS_CHECKLIST.md` - Next tasks
- `COMPONENT_UPDATE_QUICK_REFERENCE.md` - Patterns guide

---

## 💬 Need Help?

### Common Questions

**Q: Why skip query when no organization?**  
A: Prevents errors and unnecessary API calls. Organization is required.

**Q: Why use optional chaining (?.)?**  
A: currentOrganization might be null during loading.

**Q: Why refetch instead of letting Apollo cache handle it?**  
A: Organization change is not a typical cache scenario. Explicit refetch is clearer.

**Q: Do ALL components need this?**  
A: Only components that query/mutate organization-scoped data.

**Q: What about presentational components?**  
A: They receive data as props, no organization context needed.

---

## 🎯 Quick Checklist for Adding a New Feature

- [ ] Does it query data?
  - [ ] Add useOrganization hook
  - [ ] Add organizationId to query
  - [ ] Add refetch effect
  - [ ] Add loading state

- [ ] Does it create/update data?
  - [ ] Add organizationId to mutation (Phase 8)
  - [ ] Validate user is in org (backend)
  - [ ] Check org limits (backend)
  - [ ] Update org usage (backend)

- [ ] Does it affect organization?
  - [ ] Check permissions (owner/admin)
  - [ ] Validate limits
  - [ ] Update analytics

---

## 🔗 Key Links

- **Main Status**: `MULTI_TENANT_MASTER_STATUS.md`
- **Phase 7 Complete**: `PHASE7_COMPLETE_SUMMARY.md`
- **Phase 8 Next**: `PHASE8_MUTATIONS_CHECKLIST.md`
- **Architecture**: `MULTI_TENANT_ARCHITECTURE.md`
- **Quick Start**: `FRONTEND_QUICK_START.md`

---

**Last Updated**: January 7, 2026  
**For Questions**: Check documentation files or ask team lead  
**Status**: 60% Complete - Reads work, writes being updated

---

## 🎉 You've Got This!

The pattern is consistent everywhere. Once you understand it for one component, you understand it for all. Look at the completed examples and follow the same pattern!

