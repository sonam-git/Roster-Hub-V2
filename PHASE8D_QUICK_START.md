# Quick Reference: Phase 8D Continuation Guide

**Date:** January 7, 2026  
**Current Progress:** 45% Complete (18/40 components)  
**Next Session Focus:** Message, Game, and Profile components

---

## 🎯 What We've Done

### ✅ Completed Areas (100%)
- **Posts & Comments:** All 4 components updated
- **Formations:** All 5 components updated
- **Skills:** All 4 components updated
- **Games:** 3/4 components updated

### 🔄 Partially Complete
- **Chat/Messages:** 1/3 components (ChatPopup done)
- **Game-related:** Missing GameComplete, GameUpdate, GameUpdateModal, GameFeedback, RatingModal
- **Profile/Social:** 0/10+ components

---

## 🚀 Next Components to Update

### Immediate Priority (Start Here):
1. **MessageBox** (`/client/src/components/MessageBox/index.jsx`)
   - Mutation: `SEND_MESSAGE`
   
2. **MessageList** (`/client/src/components/MessageList/index.jsx`)
   - Mutations: `REMOVE_MESSAGE`, `SEND_MESSAGE`, `DELETE_CONVERSATION`

3. **GameComplete** (`/client/src/components/GameComplete/index.jsx`)
   - Mutation: `COMPLETE_GAME`

4. **GameUpdate** (`/client/src/components/GameUpdate/index.jsx`)
   - Mutation: `UPDATE_GAME`

5. **GameUpdateModal** (`/client/src/components/GameUpdateModal/index.jsx`)
   - Mutation: `UPDATE_GAME`

---

## 📝 Update Pattern (Copy & Paste)

### Step 1: Add Import
```jsx
import { useOrganization } from "../../contexts/OrganizationContext";
```

### Step 2: Use Hook in Component
```jsx
const { currentOrganization } = useOrganization();
```

### Step 3: Update Mutation Call
```jsx
// Before:
await someMutation({
  variables: { someId: id }
});

// After:
if (!currentOrganization) {
  console.error('No organization selected');
  alert('Please select an organization.');
  return;
}

try {
  await someMutation({
    variables: { 
      someId: id,
      organizationId: currentOrganization._id
    }
  });
} catch (error) {
  console.error('Mutation error:', error);
  alert('Operation failed. Please try again.');
}
```

---

## 🔍 How to Find Mutation Calls

Use grep to find components with mutations:
```bash
# Find all useMutation calls
grep -r "useMutation" client/src/components/

# Find specific mutation usage
grep -r "SEND_MESSAGE" client/src/components/

# Find mutation call with variables
grep -r "await.*Mutation({" client/src/components/
```

---

## ✅ Validation Checklist

For each component updated:
- [ ] Import `useOrganization` hook
- [ ] Get `currentOrganization` from hook
- [ ] Check `if (!currentOrganization)` before mutations
- [ ] Pass `organizationId` in mutation variables
- [ ] Wrap mutation call in try-catch
- [ ] Add user-friendly error messages
- [ ] Test with no organization selected
- [ ] Test with organization selected
- [ ] Verify no linter errors

---

## 📊 Progress Tracking

Update after each batch:
- `/PHASE8D_PROGRESS.md` - Component checklist
- Session notes at bottom of progress doc

---

## 🔗 Key Files

### Documentation:
- `/PHASE8D_PROGRESS.md` - Detailed checklist
- `/PHASE8D_SESSION_COMPLETE.md` - Session summary
- `/MULTI_TENANT_MASTER_STATUS.md` - Overall project status

### Code Reference:
- `/client/src/contexts/OrganizationContext.jsx` - Organization context
- `/client/src/utils/mutations.jsx` - All mutation definitions (already updated)
- `/server/schemas/resolvers.js` - Backend resolvers (already updated)

---

## 💡 Common Issues & Solutions

### Issue: Linter Error "unused variable"
**Solution:** Make sure you're actually using `currentOrganization` in the mutation call.

### Issue: Mutation fails silently
**Solution:** Add try-catch block and log errors to console.

### Issue: Organization is null/undefined
**Solution:** Add check before mutation call:
```jsx
if (!currentOrganization) {
  console.error('No organization selected');
  return;
}
```

---

## 🎯 Goals for Next Session

1. Complete all Message components (2 remaining)
2. Complete all Game-related components (5 remaining)
3. Start Profile/Social components (10+ remaining)

**Estimated Time:** 2-3 hours for next batch

---

## 🚦 Quick Commands

```bash
# Search for specific component
find client/src/components -name "*Message*.jsx"

# Count remaining components
grep -c "useMutation" client/src/components/**/*.jsx

# Check for errors
npm run lint

# Run the app
npm run develop
```

---

**Remember:** Every mutation must have `organizationId` and proper error handling!

---

**Last Updated:** January 7, 2026, 12:00 PM PST
