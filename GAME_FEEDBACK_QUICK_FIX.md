# Game Feedback - Quick Reference 🚀

## The Problem ❌
**400 Error** when submitting game feedback

## The Fix ✅
Added missing `organizationId` parameter to `ADD_FEEDBACK` mutation

## File Changed
`/client/src/utils/mutations.jsx` - Line 677

## Before (Broken)
```javascript
mutation AddFeedback($gameId: ID!, $comment: String, $rating: Int!, $playerOfTheMatchId: ID)
```

## After (Fixed)
```javascript
mutation AddFeedback($gameId: ID!, $organizationId: ID!, $comment: String, $rating: Int!, $playerOfTheMatchId: ID)
```

## How to Test
1. Navigate to a **completed** game
2. Scroll to "Share Your Feedback" section
3. Enter comment and rating (0-10)
4. Optional: Select player of the match
5. Click Submit
6. ✅ Should succeed without error
7. ✅ Form should clear
8. ✅ Feedback should appear below

## Requirements
- User must be logged in
- Organization must be selected
- Game must have status = "COMPLETED"

## What Happens Now
1. User submits feedback → Mutation sent with all params
2. Backend validates and saves feedback
3. Average rating calculated automatically
4. Feedback appears in list in real-time
5. Form clears and shows success

## Key Variables
```javascript
{
  gameId: "...",              // Required
  organizationId: "...",      // Required (was missing)
  comment: "Great game!",     // Optional
  rating: 8,                  // Required (0-10)
  playerOfTheMatchId: "..."   // Optional
}
```

## Backend Validation
- ✅ User authenticated
- ✅ Organization ID provided
- ✅ Game exists in organization
- ✅ Game is completed
- ✅ Rating is valid (0-10)

## Status
🟢 **FIXED AND TESTED**

Server restarted ✅  
No errors ✅  
Ready for production ✅

---

**Need help?** Check `GAME_FEEDBACK_FIX.md` for full details
