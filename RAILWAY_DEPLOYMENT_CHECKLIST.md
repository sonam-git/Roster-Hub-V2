# Railway Deployment Checklist

## Issue Identified
The Railway server was crashing with **SIGTERM** because:
1. The server was waiting indefinitely for MongoDB to connect before starting the HTTP server
2. No health check endpoint existed for Railway to verify the server was running
3. If MongoDB connection failed or was slow, Railway would timeout and kill the process

## Fixes Applied

### 1. MongoDB Connection (`server/config/connection.js`)
- ✅ Added proper error handling with `.then()` and `.catch()`
- ✅ Added connection timeout (5 seconds instead of default 30s)
- ✅ Added detailed logging for connection status
- ✅ Connection failures are logged but don't crash the app

### 2. Server Startup (`server/server.js`)
- ✅ HTTP server now starts **immediately** - doesn't wait for MongoDB
- ✅ MongoDB connects in the background
- ✅ Added `/health` endpoint that returns server and DB status
- ✅ Added `/` root endpoint with API information
- ✅ Enhanced startup logging with emojis for easy visual scanning

### 3. Railway Configuration (`server/railway.json`)
- ✅ Added `healthcheckPath: "/health"`
- ✅ Added `healthcheckTimeout: 100` seconds
- ✅ Railway will now monitor the `/health` endpoint

## Required Environment Variables on Railway

**CRITICAL:** Verify these are set in Railway dashboard:

1. **MONGODB_URI** - Your MongoDB connection string (required)
2. **JWT_SECRET** - Secret key for JWT tokens (required)
3. **NODE_ENV** - Set to `production`
4. **PORT** - Usually Railway sets this automatically
5. **CLOUDINARY_CLOUD_NAME** (if using image uploads)
6. **CLOUDINARY_API_KEY** (if using image uploads)
7. **CLOUDINARY_API_SECRET** (if using image uploads)

## Deployment Steps

### 1. Check Railway Dashboard
1. Go to your Railway project
2. Navigate to **Variables** tab
3. Verify all required environment variables are set
4. **Most Common Issue:** Missing or incorrect `MONGODB_URI`

### 2. Monitor Railway Logs
After the new deployment (automatic from GitHub):
```
✅ Look for these success messages:
🚀 Starting RosterHub Server...
📝 Environment: production
🔌 Port: [PORT]
🗄️  MongoDB URI exists: true
🔑 JWT Secret exists: true
⚙️  Starting Apollo Server...
✅ Apollo Server started
✅ GraphQL middleware applied
✅ HTTP server running on port [PORT]!
✅ MongoDB connected

❌ Look for these error messages:
❌ MongoDB connection failed: [error details]
❌ Failed to start server: [error details]
```

### 3. Test the Deployment
Once Railway shows "Deployed":

**Test Health Check:**
```bash
curl https://rosterhub-production.up.railway.app/health
```
Expected response:
```json
{
  "uptime": 123.45,
  "status": "OK",
  "timestamp": 1768414432923,
  "mongodb": "connected"
}
```

**Test Root Endpoint:**
```bash
curl https://rosterhub-production.up.railway.app/
```
Expected response:
```json
{
  "message": "RosterHub API Server",
  "status": "running",
  "graphql": "/graphql",
  "health": "/health"
}
```

**Test GraphQL:**
Visit: `https://rosterhub-production.up.railway.app/graphql`
Should show Apollo Server playground or GraphQL endpoint info

### 4. Test Team Creation from Frontend
1. Go to your Vercel frontend: `https://roster-hub-v2-y6j2.vercel.app`
2. Try to create a new team account
3. Open browser console (F12) to see any errors
4. The 400 Bad Request error should be gone if the server is running

## Troubleshooting

### If Railway still shows SIGTERM:
1. **Check Variables:** Missing `MONGODB_URI` or `JWT_SECRET`
2. **Check Logs:** Look for connection errors in the startup logs
3. **Check MongoDB:** Ensure your MongoDB cluster is accessible from Railway
   - MongoDB Atlas: Add `0.0.0.0/0` to IP whitelist
   - Check if MongoDB is paused/sleeping

### If MongoDB shows "disconnected" in health check:
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist
3. Check MongoDB cluster is running (not paused)
4. Verify MongoDB user credentials

### If GraphQL returns 500 errors:
1. MongoDB might not be connected yet - check `/health` endpoint
2. Check Railway logs for GraphQL resolver errors
3. Verify JWT_SECRET is set correctly

### If you still get 400 Bad Request:
1. Check Railway deployment status - is it actually running?
2. Check the health endpoint - if it fails, server isn't running
3. Verify Vercel's `VITE_API_URL` points to the correct Railway URL
4. Check browser console for CORS errors

## Next Steps After Deployment

1. **Monitor Logs:** Keep Railway logs open for ~5 minutes after deployment
2. **Test All Features:**
   - Team creation (signup)
   - Team joining (with invite code)
   - Login
   - Game creation
   - Chat/messaging
3. **Check Health Periodically:** Bookmark the health endpoint

## Additional Railway Settings (Optional but Recommended)

In Railway dashboard:
- **Restart Policy:** Already set to "ON_FAILURE" with 10 retries
- **Auto-Deploy:** Should be enabled for GitHub main branch
- **Resources:** Check if you need to increase memory/CPU
- **Networking:** Ensure the service is publicly accessible

## Files Changed
- ✅ `server/config/connection.js` - MongoDB connection with error handling
- ✅ `server/server.js` - Non-blocking startup + health endpoints
- ✅ `server/railway.json` - Health check configuration

All changes have been committed and pushed to GitHub.
Railway should automatically redeploy.
