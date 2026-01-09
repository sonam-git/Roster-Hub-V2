# Component Update Quick Reference Card

## 🎯 Quick Steps to Update Any Component

### 1. Add Import
```jsx
import { useOrganization } from '../../contexts/OrganizationContext';
```

### 2. Get Organization
```jsx
const { currentOrganization } = useOrganization();
```

### 3. Update Query
```jsx
const { data, loading, error, refetch } = useQuery(YOUR_QUERY, {
  variables: { 
    organizationId: currentOrganization?._id,
    // ...other variables
  },
  skip: !currentOrganization
});
```

### 4. Add Refetch Effect
```jsx
useEffect(() => {
  if (currentOrganization) {
    refetch({ organizationId: currentOrganization._id });
  }
}, [currentOrganization, refetch]);
```

### 5. Add Loading Check
```jsx
if (!currentOrganization) {
  return <LoadingSpinner message="Loading organization..." />;
}
```

---

## 📋 Updated Queries Reference

| Query | Variables Required | Usage |
|-------|-------------------|-------|
| `QUERY_ME` | none | Auto includes org data |
| `QUERY_PROFILES` | `organizationId` | Roster/team list |
| `QUERY_SINGLE_PROFILE` | `profileId`, `organizationId` | Profile page |
| `GET_POSTS` | `organizationId` | Home/feed |
| `QUERY_GAMES` | `organizationId`, `status?` | Game schedule |
| `QUERY_GAME` | `gameId`, `organizationId` | Game details |
| `QUERY_FORMATION` | `gameId`, `organizationId` | Formation board |

---

## 🔍 Complete Example: Game Component

```jsx
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useOrganization } from '../../contexts/OrganizationContext';
import { QUERY_GAMES } from '../../utils/queries';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import GameCard from '../GameCard';

function GameList() {
  // 1. Get organization context
  const { currentOrganization } = useOrganization();
  
  // 2. Query with organizationId
  const { data, loading, error, refetch } = useQuery(QUERY_GAMES, {
    variables: { 
      organizationId: currentOrganization?._id,
      status: 'SCHEDULED' // optional
    },
    skip: !currentOrganization,
    fetchPolicy: 'cache-and-network'
  });
  
  // 3. Refetch on organization change
  useEffect(() => {
    if (currentOrganization) {
      refetch({ 
        organizationId: currentOrganization._id,
        status: 'SCHEDULED'
      });
    }
  }, [currentOrganization, refetch]);
  
  // 4. Handle loading states
  if (!currentOrganization) {
    return <LoadingSpinner message="Loading organization..." />;
  }
  
  if (loading) return <LoadingSpinner message="Loading games..." />;
  if (error) return <ErrorMessage error={error} />;
  
  // 5. Render data
  return (
    <div className="game-list">
      <h2>{currentOrganization.name} - Games</h2>
      <p className="text-gray-500">
        {data.games.length} games | Plan: {currentOrganization.subscription.plan}
      </p>
      
      {data.games.length === 0 ? (
        <p>No games scheduled yet.</p>
      ) : (
        <div className="grid gap-4">
          {data.games.map(game => (
            <GameCard 
              key={game._id} 
              game={game} 
              organizationId={currentOrganization._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GameList;
```

---

## 🎨 With Multiple Queries

```jsx
function MyComponent() {
  const { currentOrganization } = useOrganization();
  
  // Multiple queries with same organizationId
  const { data: gamesData } = useQuery(QUERY_GAMES, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  const { data: profilesData } = useQuery(QUERY_PROFILES, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  if (!currentOrganization) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>{currentOrganization.name}</h1>
      <GamesList games={gamesData?.games} />
      <MembersList members={profilesData?.profiles} />
    </div>
  );
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Query without skip
```jsx
// BAD - Will error if no organization
const { data } = useQuery(QUERY_GAMES, {
  variables: { organizationId: currentOrganization?._id }
});
```

### ✅ DO: Use skip condition
```jsx
// GOOD - Waits for organization
const { data } = useQuery(QUERY_GAMES, {
  variables: { organizationId: currentOrganization?._id },
  skip: !currentOrganization // <-- Important!
});
```

### ❌ DON'T: Forget loading check
```jsx
// BAD - Will crash before org loads
return <div>{data.games.map(...)}</div>
```

### ✅ DO: Check loading state
```jsx
// GOOD - Handle all states
if (!currentOrganization) return <LoadingSpinner />;
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
return <div>{data.games.map(...)}</div>
```

---

## 🔄 Organization Switching Pattern

```jsx
function MyComponent() {
  const { currentOrganization } = useOrganization();
  const { data, refetch } = useQuery(QUERY_GAMES, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  // Automatically refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  // Rest of component...
}
```

---

## 📱 With Mutations

```jsx
function CreateGameForm() {
  const { currentOrganization, canCreateGame } = useOrganization();
  
  const [createGame] = useMutation(CREATE_GAME, {
    refetchQueries: [
      { 
        query: QUERY_GAMES, 
        variables: { organizationId: currentOrganization._id }
      }
    ]
  });
  
  const handleSubmit = async (formData) => {
    // Check limits first
    if (!canCreateGame()) {
      alert('Game limit reached! Please upgrade your plan.');
      return;
    }
    
    try {
      await createGame({
        variables: {
          gameInput: formData,
          organizationId: currentOrganization._id
        }
      });
      toast.success('Game created!');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎯 Components to Update (Priority Order)

### 🔴 HIGH PRIORITY
1. **Game Components**
   - [ ] `/client/src/pages/Game.jsx`
   - [ ] `/client/src/components/GameList/index.jsx`
   - [ ] `/client/src/components/CustomComingGames/index.jsx`
   - [ ] `/client/src/pages/GameUpdatePage.jsx`

2. **Profile Components**
   - [ ] `/client/src/pages/Roster.jsx`
   - [ ] `/client/src/pages/Profile.jsx`
   - [ ] `/client/src/components/ProfileList/index.jsx`

3. **Post Components**
   - [ ] `/client/src/pages/Home.jsx`
   - [ ] `/client/src/components/PostsList/index.jsx`

### 🟡 MEDIUM PRIORITY
4. **Formation Components**
   - [ ] `/client/src/components/FormationBoard/index.jsx`
   - [ ] `/client/src/components/FormationSection/index.jsx`

5. **Skill Components**
   - [ ] `/client/src/pages/Skill.jsx`
   - [ ] `/client/src/components/AllSkillsList/index.jsx`

### 🟢 LOW PRIORITY
6. **Message Components**
   - [ ] `/client/src/pages/Message.jsx`
   - [ ] `/client/src/components/ChatPopup/index.jsx`

---

## 🧪 Testing Each Component

After updating each component:

1. **Open in Browser**
   - Navigate to the component's page
   - Check data loads correctly

2. **Check Console**
   - No GraphQL errors
   - No React errors
   - Query includes organizationId

3. **Test Organization Switching**
   - Click organization selector
   - Switch to different organization
   - Verify data updates

4. **Test Edge Cases**
   - No organization selected
   - Empty data
   - Network errors

---

## 💾 Save This Pattern

```jsx
// Copy this template for every component update:

import { useOrganization } from '../../contexts/OrganizationContext';

function MyComponent() {
  const { currentOrganization } = useOrganization();
  
  const { data, loading, error, refetch } = useQuery(MY_QUERY, {
    variables: { organizationId: currentOrganization?._id },
    skip: !currentOrganization
  });
  
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  if (!currentOrganization) return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <YourComponent data={data} />;
}
```

---

## 📞 Need Help?

- Check `/PHASE7_PROGRESS_BATCH1.md` for query updates
- Check `/MULTI_TENANT_PHASE7_QUERY_UPDATE_GUIDE.md` for detailed patterns
- Check `/PHASE7_IMPLEMENTATION_CHECKLIST.md` for full checklist

---

**Keep this card handy while updating components!** 🚀
