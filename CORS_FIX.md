# CORS Issue Fix

## Problem
Your Vercel frontend (`https://roster-hub-v2-y6j2.vercel.app`) was unable to communicate with your Heroku backend (`https://roster-hub-v2-240f2b371524.herokuapp.com/graphql`) due to CORS policy restrictions.

**Error Message:**
```
Access to fetch at 'https://roster-hub-v2-240f2b371524.herokuapp.com/graphql' 
from origin 'https://roster-hub-v2-y6j2.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution Applied

### 1. Added CORS Package
Installed the `cors` npm package to handle Cross-Origin Resource Sharing properly.

### 2. Updated server.js
- Added `cors` middleware to Express before Apollo middleware
- Configured allowed origins to include:
  - Your Vercel production URL: `https://roster-hub-v2-y6j2.vercel.app`
  - Local development URLs for testing
- Set `credentials: true` to allow cookies/authentication headers
- Updated Apollo Server to use `cors: false` since CORS is now handled by Express

## Next Steps

### Deploy to Heroku
You need to push these changes to Heroku:

```bash
# Commit the changes
git add .
git commit -m "Fix CORS issue for Vercel frontend"

# Push to Heroku
git push heroku main
```

### If you have multiple Vercel deployment URLs
If Vercel gives you different URLs (preview deployments, etc.), you can add them to the `allowedOrigins` array in `server/server.js`:

```javascript
const allowedOrigins = [
  "https://roster-hub-v2-y6j2.vercel.app",
  "https://your-other-vercel-url.vercel.app", // Add more as needed
  "http://localhost:5173",
  "http://localhost:3000",
];
```

### Alternative: Allow all Vercel domains (less secure)
If you want to allow all Vercel preview deployments, you can use a wildcard pattern:

```javascript
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      // Allow localhost and vercel.app domains
      if (
        origin.includes('localhost') || 
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
```

## Testing
After deploying to Heroku:
1. Clear your browser cache or open an incognito window
2. Visit your Vercel app
3. Try to create an account
4. The CORS error should be resolved

## What is CORS?
CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers to prevent malicious websites from making requests to your API. Since your frontend and backend are on different domains, you need to explicitly tell the browser that your backend allows requests from your frontend's domain.
