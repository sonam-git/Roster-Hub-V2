# Game-Related Components and Pages Architecture
## Complete Inspection from Backend to Frontend

*Generated: January 8, 2026*

---

## Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [GraphQL Layer](#graphql-layer)
3. [Frontend Pages](#frontend-pages)
4. [Frontend Components](#frontend-components)
5. [Data Flow](#data-flow)
6. [Key Features](#key-features)

---

## 1. Backend Architecture

### 1.1 Database Model (`server/models/Game.js`)

The Game model is the core data structure with the following schema:

```javascript
{
  // Multi-tenant field
  organizationId: ObjectId (ref: 'Organization', required, indexed)
  
  // Game Details
  creator: ObjectId (ref: 'Profile', required)
  date: Date (required)
  time: String (required)
  venue: String (required, trimmed)
  city: String (required, trimmed)
  notes: String (default: "")
  opponent: String (required, trimmed)
  
  // Game Results
  score: String (default: "0 - 0")
  result: Enum ["HOME_WIN", "AWAY_WIN", "DRAW", "NOT_PLAYED"] (default: "NOT_PLAYED")
  status: Enum ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] (default: "PENDING")
  averageRating: Number (default: 0)
  
  // Responses & Feedback
  responses: [ResponseSchema] // Array of user availability responses
  feedbacks: [FeedbackSchema] // Array of post-game feedback
  
  // Timestamps
  timestamps: true (createdAt, updatedAt)
}
```

#### ResponseSchema:
```javascript
{
  user: ObjectId (ref: 'Profile', required)
  isAvailable: Boolean (required)
}
```

#### FeedbackSchema:
```javascript
{
  user: ObjectId (ref: 'Profile', required)
  comment: String (trimmed)
  rating: Number (0-10, required)
  playerOfTheMatch: ObjectId (ref: 'Profile')
  createdAt: Date (default: Date.now)
}
```

---

## 2. GraphQL Layer

### 2.1 Type Definitions (`server/schemas/typeDefs.js`)

#### Game Type:
```graphql
type Game {
  _id: ID!
  creator: Profile!
  date: String!
  time: String!
  venue: String!
  city: String!
  notes: String
  opponent: String!
  score: String
  result: GameResult!
  status: GameStatus!
  responses: [Response!]!
  availableCount: Int!
  unavailableCount: Int!
  createdAt: String!
  updatedAt: String!
  feedbacks: [Feedback!]!
  averageRating: Float!
  formation: Formation
  organizationId: ID!
}

enum GameStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum GameResult {
  HOME_WIN
  AWAY_WIN
  DRAW
  NOT_PLAYED
}

type Response {
  user: Profile!
  isAvailable: Boolean!
}

type Feedback {
  _id: ID!
  user: Profile!
  comment: String
  rating: Int!
  playerOfTheMatch: Profile
  createdAt: String!
}
```

### 2.2 Queries

```graphql
type Query {
  # Get all games (optionally filter by status)
  games(organizationId: ID!, status: GameStatus): [Game!]!
  
  # Get single game by ID
  game(gameId: ID!, organizationId: ID!): Game
  
  # Get formation for a game
  formation(gameId: ID!, organizationId: ID!): Formation
}
```

**Implementation Location:** `server/schemas/resolvers.js` lines 368-433

Key Features:
- Multi-tenant support (organizationId required)
- Status filtering capability
- Populated references (creator, responses, feedbacks)
- Formation relationship

### 2.3 Mutations

```graphql
type Mutation {
  # Create new game
  createGame(input: CreateGameInput!, organizationId: ID!): Game!
  
  # Respond to game availability
  respondToGame(input: RespondToGameInput!, organizationId: ID!): Game!
  
  # Change game status
  confirmGame(gameId: ID!, organizationId: ID!, note: String): Game
  cancelGame(gameId: ID!, organizationId: ID!, note: String): Game
  completeGame(
    gameId: ID!
    organizationId: ID!
    score: String!
    note: String
    result: GameResult!
  ): Game!
  
  # Vote management
  unvoteGame(gameId: ID!, organizationId: ID!): Game!
  
  # Game management
  deleteGame(gameId: ID!, organizationId: ID!): Game!
  updateGame(gameId: ID!, organizationId: ID!, input: UpdateGameInput!): Game!
  
  # Feedback
  addFeedback(
    gameId: ID!
    organizationId: ID!
    comment: String
    rating: Int!
    playerOfTheMatchId: ID
  ): Game!
  
  # Formation management
  createFormation(gameId: ID!, formationType: String!, organizationId: ID!): Formation!
  updateFormation(gameId: ID!, positions: [PositionInput!]!, organizationId: ID!): Formation!
  deleteFormation(gameId: ID!, organizationId: ID!): Boolean!
  
  # Formation comments & likes
  addFormationComment(formationId: ID!, commentText: String!, organizationId: ID!): Formation
  updateFormationComment(commentId: ID!, commentText: String!, organizationId: ID!): FormationComment
  deleteFormationComment(formationId: ID!, commentId: ID!, organizationId: ID!): ID!
  likeFormationComment(commentId: ID!, organizationId: ID!): FormationComment
  likeFormation(formationId: ID!, organizationId: ID!): Formation
}
```

**Implementation Location:** `server/schemas/gameResolvers.js` - Complete implementations for all 19 game-related mutations, merged into main resolvers.

✅ **Status:** All game mutations are now fully implemented and functional!

### 2.4 Subscriptions

```graphql
type Subscription {
  gameCreated: Game
  gameConfirmed: Game
  gameCompleted: Game
  gameCancelled: Game
  gameDeleted: ID
  gameUpdated: Game
  
  formationCreated(gameId: ID!): Formation
  formationUpdated(gameId: ID!): Formation
  formationDeleted(gameId: ID!): ID
  formationLiked(formationId: ID!): Formation
  
  formationCommentAdded(formationId: ID!): FormationComment
  formationCommentUpdated(formationId: ID!): FormationComment
  formationCommentDeleted(formationId: ID!): ID!
  formationCommentLiked(formationId: ID!): FormationComment
}
```

**Implementation Location:** `server/schemas/resolvers.js` lines 1942-2049

These subscriptions use PubSub for real-time updates.

### 2.5 Field Resolvers

```javascript
Game: {
  availableCount: (parent) => {
    return parent.responses.filter((r) => r.user && r.isAvailable).length;
  },
  unavailableCount: (parent) => {
    return parent.responses.filter((r) => r.user && !r.isAvailable).length;
  },
  creator: (parent) => parent.creator,
  responses: (parent) => {
    // Filter out orphaned responses
    return parent.responses.filter((r) => r.user != null);
  },
  averageRating(game) {
    return typeof game.averageRating === "number" ? game.averageRating : 0;
  },
  formation: async (parent) => {
    return await Formation.findOne({ game: parent._id })
      .populate("positions.player");
  }
}
```

**Location:** `server/schemas/resolvers.js` lines 2061-2082

---

## 3. Frontend Pages

### 3.1 Game Page (`client/src/pages/Game.jsx`)

**Purpose:** Main game management page with dynamic routing

**Key Features:**
- Shows GameList when no gameId
- Shows GameDetails when gameId is present
- Shows GameForm when "Create Game" is clicked
- Multi-tenant organization context
- Auto-refetch on organization change

**Route:** `/game-schedule/:gameId?`

**State Management:**
```javascript
- gameId (from URL params)
- currentOrganization (from OrganizationContext)
- showCreateGame (boolean)
- shouldRedirect (boolean)
```

**Queries:**
```javascript
useQuery(QUERY_GAME, {
  variables: { gameId, organizationId },
  skip: !gameId || !currentOrganization
})
```

**Components Rendered:**
- `<GameList />` - Default view
- `<GameForm />` - Create game mode
- `<GameDetails />` - Single game view

### 3.2 GameCreate Page (`client/src/pages/GameCreate.jsx`)

**Purpose:** Dedicated page for creating new games

**Route:** `/game-create`

**Features:**
- Simple wrapper around GameForm
- Beautiful gradient UI
- Redirects to game details after creation

**Props Passed to GameForm:**
```javascript
onGameCreated={(newGame) => navigate(`/game-schedule/${newGame._id}`)}
onBackToGames={() => navigate('/game-schedule')}
```

### 3.3 GameSearch Page (`client/src/pages/GameSearch.jsx`)

**Purpose:** Advanced game search and filtering

**Route:** `/game-search`

**Features:**
- GameSearch component with filters
- Dynamic GameList based on filters
- Filter state management
- Clear filters button

**Search Filters:**
```javascript
{
  searchText: String,
  status: GameStatus,
  dateFrom: Date,
  dateTo: Date,
  timeFrom: Time,
  timeTo: Time,
  venue: String,
  opponent: String
}
```

### 3.4 GameUpdatePage (`client/src/pages/GameUpdatePage.jsx`)

**Purpose:** Edit existing game details (creator only)

**Route:** `/game-schedule/:gameId/edit`

**Security:**
- Auth check
- Creator-only access (redirects non-creators)
- Organization validation

**Key Logic:**
```javascript
const isCreator = game.creator._id === currentUser._id;
if (!isCreator) {
  navigate("/game-schedule", { replace: true });
}
```

**Components:**
- `<GameUpdate />` - Main update form

---

## 4. Frontend Components

### 4.1 GameList (`client/src/components/GameList/`)

**Purpose:** Display list of games with filtering and status tabs

**Key Features:**
- Status-based tabs (ALL, PENDING, CONFIRMED, CANCELLED, COMPLETED, EXPIRED)
- Real-time status counts using `getStatusCounts()`
- Pagination (3 items per page)
- Delete game with confirmation modal
- Empty state with "Create Game" button
- Search filter integration
- Expired game handling

**Props:**
```javascript
{
  onCreateGame: Function,
  searchFilters: Object | null
}
```

**Queries:**
```javascript
useQuery(QUERY_GAMES, {
  variables: { organizationId },
  pollInterval: 10000 // Refetch every 10 seconds
})
```

**Mutations:**
```javascript
useMutation(DELETE_GAME)
```

**Status Filtering:**
```javascript
const STATUS_OPTIONS = [
  { key: 'ALL', label: 'All', count, color },
  { key: 'PENDING', label: 'Pending', count, color },
  { key: 'CONFIRMED', label: 'Confirmed', count, color },
  { key: 'CANCELLED', label: 'Cancelled', count, color },
  { key: 'COMPLETED', label: 'Completed', count, color },
  { key: 'EXPIRED', label: 'Expired', count, color }
]
```

### 4.2 GameForm (`client/src/components/GameForm/`)

**Purpose:** Create new game with validation

**Features:**
- Date/time pickers
- City autocomplete (US cities)
- Venue and opponent fields
- Notes (optional)
- Real-time validation
- Past date prevention

**Form Fields:**
```javascript
{
  date: String (required),
  time: String (required),
  venue: String (required),
  city: String (required, autocomplete),
  notes: String (optional),
  opponent: String (required)
}
```

**Validation:**
- All required fields
- Date not in past
- City suggestions from US cities database

**Mutations:**
```javascript
useMutation(CREATE_GAME, {
  update(cache, { data: { createGame } }) {
    // Update cache with new game
  },
  refetchQueries: [{ query: QUERY_GAMES }]
})
```

**Props:**
```javascript
{
  onGameCreated: Function,
  onBackToGames: Function
}
```

### 4.3 GameDetails (`client/src/components/GameDetails/`)

**Purpose:** Comprehensive single game view with all functionality

**File Size:** 1880 lines (large component)

**Key Sections:**

#### A. Game Information Display
- Date, time, venue, city
- Opponent details
- Status badges
- Creator information
- Score (if completed)

#### B. Availability Voting
- Vote Yes/No for availability
- Unvote option
- Real-time vote counts
- VotersList component

#### C. Status Management (Creator Only)
- Confirm Game button
- Cancel Game button
- Complete Game modal
- Status-based UI changes

#### D. Formation Management
- FormationSection component
- Only visible for CONFIRMED games
- Creator can create/edit formation
- Players can view formation

#### E. Feedback System (Completed Games)
- GameFeedback component
- GameFeedbackList component
- Rating (0-10)
- Comments
- Player of the Match selection
- Thank you message after submission

#### F. Weather Forecast
- WeatherForecast component
- Based on game location and date

**Subscriptions Used:**
```javascript
- GAME_UPDATED_SUBSCRIPTION
- GAME_CONFIRMED_SUBSCRIPTION
- GAME_CANCELLED_SUBSCRIPTION
- GAME_COMPLETED_SUBSCRIPTION
- FORMATION_CREATED_SUBSCRIPTION
- FORMATION_UPDATED_SUBSCRIPTION
- FORMATION_DELETED_SUBSCRIPTION
```

**Mutations Available:**
```javascript
- RESPOND_TO_GAME
- UNVOTE_GAME
- CONFIRM_GAME
- CANCEL_GAME
- COMPLETE_GAME
```

**State Management:**
```javascript
{
  formation: Formation | null,
  showThankYou: boolean,
  feedbackGiven: boolean,
  userId: String,
  isCreator: boolean
}
```

### 4.4 GameUpdate (`client/src/components/GameUpdate/`)

**Purpose:** Edit game details (creator only)

**Similar to GameForm but:**
- Pre-populated with existing data
- Update instead of create
- Can modify all fields except creator

**Mutation:**
```javascript
useMutation(UPDATE_GAME)
```

### 4.5 GameComplete (`client/src/components/GameComplete/`)

**Purpose:** Modal for completing a game

**Features:**
- Score input
- Result selection (HOME_WIN, AWAY_WIN, DRAW)
- Notes field
- Form validation

**Mutation:**
```javascript
useMutation(COMPLETE_GAME)
```

### 4.6 GameFeedback (`client/src/components/GameFeedback/`)

**Purpose:** Submit post-game feedback

**Features:**
- Rating slider (0-10)
- Comment textarea
- Player of the Match selector
- One feedback per user

**Mutation:**
```javascript
useMutation(ADD_FEEDBACK)
```

### 4.7 GameFeedbackList (`client/src/components/GameFeedbackList/`)

**Purpose:** Display all game feedbacks

**Features:**
- Shows all player ratings
- Comments
- Player of the Match highlights
- Average rating display

### 4.8 GameSearch (`client/src/components/GameSearch/`)

**Purpose:** Advanced search filters

**Filters:**
- Text search (venue/opponent)
- Status dropdown
- Date range (from/to)
- Time range (from/to)
- Venue filter
- Opponent filter

**Props:**
```javascript
{
  onSearch: Function,
  onReset: Function,
  initialFilters: Object
}
```

### 4.9 Additional Game Components

#### VotersList (`client/src/components/VotersList/`)
- Shows who voted available/unavailable
- Real-time updates

#### FormationSection (`client/src/components/FormationSection/`)
- Formation board UI
- Drag-and-drop player positioning
- Formation type selector (4-3-3, 4-4-2, etc.)

#### FormationBoard (`client/src/components/FormationBoard/`)
- Visual representation of formation
- Player positions
- Interactive for creators

#### FormationCommentList (`client/src/components/FormationCommentList/`)
- Comments on formation
- Like/unlike functionality
- Add/edit/delete comments

#### WeatherForecast (`client/src/components/WeatherForecast/`)
- Weather API integration
- Shows forecast for game date/location

---

## 5. Data Flow

### 5.1 Create Game Flow

```
User Action
  ↓
GameForm Component
  ↓
CREATE_GAME Mutation
  ↓
Backend Resolver
  ↓
Game.create() in MongoDB
  ↓
PubSub.publish(GAME_CREATED)
  ↓
Update Apollo Cache
  ↓
Navigate to Game Details
  ↓
All Subscribed Clients Receive Update
```

### 5.2 Vote on Game Flow

```
User Clicks Available/Unavailable
  ↓
GameDetails Component
  ↓
RESPOND_TO_GAME Mutation
  ↓
Backend Resolver
  - Validates organization
  - Checks for existing response
  - Updates/adds response
  ↓
Game.save()
  ↓
PubSub.publish(GAME_UPDATED)
  ↓
Real-time UI Update
  ↓
Vote counts recalculated
```

### 5.3 Confirm Game Flow

```
Creator Clicks "Confirm Game"
  ↓
GameDetails Component
  ↓
CONFIRM_GAME Mutation
  ↓
Backend Resolver
  - Validates creator
  - Changes status to CONFIRMED
  ↓
Game.save()
  ↓
PubSub.publish(GAME_CONFIRMED)
  ↓
UI Updates
  - Shows formation section
  - Hides confirm button
  ↓
All Users See Updated Status
```

### 5.4 Complete Game Flow

```
Creator Opens Complete Modal
  ↓
GameComplete Component
  ↓
Enters Score + Result
  ↓
COMPLETE_GAME Mutation
  ↓
Backend Resolver
  - Validates creator
  - Updates score, result, status
  ↓
Game.save()
  ↓
PubSub.publish(GAME_COMPLETED)
  ↓
UI Transitions
  - Shows feedback section
  - Hides formation section
  ↓
Players Can Submit Feedback
```

### 5.5 Formation Management Flow

```
Creator Clicks "Create Formation"
  ↓
FormationSection Component
  ↓
CREATE_FORMATION Mutation
  ↓
Backend Resolver
  - Creates formation with game reference
  ↓
Formation.create()
  ↓
PubSub.publish(FORMATION_CREATED)
  ↓
FormationBoard Appears
  ↓
Creator Drags Players
  ↓
UPDATE_FORMATION Mutation
  ↓
Formation.save()
  ↓
PubSub.publish(FORMATION_UPDATED)
  ↓
All Users See Updated Formation
```

---

## 6. Key Features

### 6.1 Multi-Tenant Architecture

Every game operation requires `organizationId`:
- All queries include `organizationId` parameter
- All mutations validate organization membership
- Games are scoped to organizations
- Users can only see games from their current organization

### 6.2 Real-Time Updates

Using GraphQL Subscriptions:
- Game status changes broadcast immediately
- Formation updates sync across all clients
- Vote counts update in real-time
- Comments and likes propagate instantly

### 6.3 Role-Based Permissions

**Game Creator:**
- Edit game details
- Confirm game
- Cancel game
- Complete game
- Create formation
- Update formation
- Delete game

**Regular Members:**
- View games
- Vote availability
- View formation
- Add feedback (completed games)
- Add formation comments

### 6.4 Game Lifecycle States

```
PENDING (default)
  ↓ (Creator confirms)
CONFIRMED
  ↓ (Creator completes with score)
COMPLETED
  
  OR
  
PENDING
  ↓ (Creator cancels)
CANCELLED

Special State:
EXPIRED (auto-calculated, not stored)
  - PENDING games past their date/time
```

### 6.5 Expiration Handling

**Utility:** `client/src/utils/gameExpiration.js`

Functions:
- `isGameExpired(game)` - Check if game date/time has passed
- `getGameEffectiveStatus(game)` - Return EXPIRED for past PENDING games
- `getStatusCounts(games)` - Calculate counts including expired
- `filterGamesByStatus(games, status)` - Filter with expiration logic

### 6.6 Validation & Error Handling

**Backend:**
- Organization membership validation
- Creator-only actions enforcement
- Past date prevention
- Required field validation

**Frontend:**
- Form validation before submission
- Real-time error messages
- Loading states
- Network error handling
- Permission-based UI rendering

### 6.7 Caching Strategy

Apollo Client cache management:
- `cache-first` for game details (reduce flickering)
- `network-only` for formations (ensure freshness)
- Manual cache updates after mutations
- RefetchQueries for critical updates
- Poll interval for game list (10 seconds)

### 6.8 UI/UX Features

**Responsive Design:**
- Mobile-first approach
- Tailwind CSS utilities
- Dark mode support (ThemeContext)
- Touch-friendly interactions

**Visual Feedback:**
- Loading skeletons
- Success messages
- Error notifications
- Animated transitions
- Status badges with colors

**Accessibility:**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

---

## 7. File Structure Summary

```
server/
├── models/
│   └── Game.js                          # Game model schema
├── schemas/
│   ├── typeDefs.js                      # GraphQL type definitions
│   ├── resolvers.js                     # Main resolvers (includes game)
│   ├── gameResolvers.js                 # ✅ NEW - Game mutation implementations
│   └── organizationResolvers.js         # Organization-specific resolvers

client/src/
├── pages/
│   ├── Game.jsx                         # Main game page
│   ├── GameCreate.jsx                   # Create game page
│   ├── GameSearch.jsx                   # Search games page
│   └── GameUpdatePage.jsx               # Update game page
├── components/
│   ├── GameList/                        # List of games
│   ├── GameForm/                        # Create game form
│   ├── GameDetails/                     # Single game view
│   ├── GameUpdate/                      # Update game form
│   ├── GameComplete/                    # Complete game modal
│   ├── GameFeedback/                    # Submit feedback
│   ├── GameFeedbackList/                # View feedbacks
│   ├── GameSearch/                      # Search filters
│   ├── VotersList/                      # Show voters
│   ├── FormationSection/                # Formation management
│   ├── FormationBoard/                  # Visual formation
│   ├── FormationCommentList/            # Formation comments
│   └── WeatherForecast/                 # Weather widget
├── utils/
│   ├── queries.jsx                      # GraphQL queries
│   ├── mutations.jsx                    # GraphQL mutations
│   ├── subscription.jsx                 # GraphQL subscriptions
│   └── gameExpiration.js                # Expiration utilities
└── contexts/
    └── OrganizationContext.jsx          # Multi-tenant context
```

---

## 8. Technical Stack

**Backend:**
- Node.js + Express
- Apollo Server (GraphQL)
- MongoDB + Mongoose
- PubSub (subscriptions)
- JWT Authentication

**Frontend:**
- React 18
- React Router v6
- Apollo Client
- Tailwind CSS
- Context API
- React Hooks

**Additional Libraries:**
- date-fns (date handling)
- Font Awesome (icons)
- Cloudinary (images)
- Weather API

---

## 9. Best Practices Implemented

1. **Multi-tenant isolation:** All queries/mutations enforce organizationId
2. **Real-time sync:** Subscriptions for collaborative features
3. **Optimistic UI:** Cache updates before server response
4. **Error boundaries:** Graceful error handling
5. **Loading states:** Skeleton loaders and spinners
6. **Type safety:** GraphQL schema enforcement
7. **Security:** JWT tokens, role-based access
8. **Performance:** Pagination, polling limits, cache strategies
9. **Code organization:** Component composition, hooks, utilities
10. **Accessibility:** WCAG compliance efforts

---

## 10. Future Enhancements Possible

1. **Game Templates:** Save common game configurations
2. **Recurring Games:** Schedule repeating matches
3. **Player Statistics:** Track individual performance across games
4. **Team Performance:** Analytics dashboard
5. **Notifications:** Email/SMS for game updates
6. **Calendar Integration:** Export to Google Calendar, iCal
7. **Live Scoring:** Real-time score updates during game
8. **Video Highlights:** Upload and share game clips
9. **Referee Assignment:** Assign officials to games
10. **Venue Management:** Track favorite venues

---

## Conclusion

The game-related architecture in Roster-Hub is a comprehensive, production-ready system with:
- ✅ Multi-tenant support
- ✅ Real-time collaboration
- ✅ Role-based permissions
- ✅ Complete CRUD operations
- ✅ Advanced search/filtering
- ✅ Formation management
- ✅ Feedback system
- ✅ Weather integration
- ✅ Responsive design
- ✅ Dark mode support

The codebase demonstrates professional software engineering practices with clear separation of concerns, proper error handling, and excellent user experience considerations.

---

## ⚠️ CRITICAL FIX APPLIED (January 8, 2026)

### Issue Found
The game mutations were **DEFINED** in GraphQL schema but **NOT IMPLEMENTED** in resolvers. This caused all game creation and management features to fail.

### Solution Implemented
Created `server/schemas/gameResolvers.js` with complete implementations for:
- ✅ All 19 game-related mutations
- ✅ Multi-tenant security validation
- ✅ Role-based permission checks
- ✅ Real-time subscription publishing
- ✅ Proper error handling

### Files Created/Modified
1. **NEW:** `server/schemas/gameResolvers.js` - Complete game mutation implementations (800+ lines)
2. **MODIFIED:** `server/schemas/resolvers.js` - Integrated game resolvers
3. **MODIFIED:** `server/models/Formation.js` - Fixed formation types

### Result
✅ Users can now CREATE games
✅ Users can VOTE on game availability
✅ Creators can CONFIRM/CANCEL/COMPLETE games
✅ Creators can manage FORMATIONS
✅ All users can add FEEDBACK
✅ All game features are FULLY FUNCTIONAL

See `GAME_FEATURE_FIX.md` for complete details.

---
