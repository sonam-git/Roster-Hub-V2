# 🔨 Force Railway to Rebuild

## Issue: Railway is using cached/old build

The logs show "API server running on port 8080!" instead of our new "✅ HTTP server running on port 8080!"

This means Railway is running old cached code that:
- ❌ Waits for MongoDB before starting HTTP server
- ❌ Gets killed with SIGTERM when MongoDB is slow

## Solution: Force a Clean Rebuild

### Option 1: Redeploy from Dashboard (RECOMMENDED)
1. Go to Railway dashboard
2. Find your deployment
3. Click the **three dots menu** (⋮)
4. Select **"Redeploy"** 
5. Wait for new build to complete

### Option 2: Clear Build Cache
1. Go to Railway dashboard
2. Settings → **"Clear Build Cache"**
3. Then trigger a new deployment

### Option 3: Add a Dummy Commit
```bash
# Add an empty commit to force rebuild
cd /Users/sonamjsherpa/Desktop/Roster-Hub\ copy
echo "" >> server/server.js
git add server/server.js
git commit -m "Force rebuild"
git push
```

## After Rebuild, Look for These Logs:

### ✅ NEW (Correct) Logs:
```
🚀 Starting RosterHub Server...
📝 Environment: production
🔌 Port: 8080
🗄️  MongoDB URI exists: true
🔑 JWT Secret exists: true
⚙️  Starting Apollo Server...
✅ Apollo Server started
✅ GraphQL middleware applied
✅ HTTP server running on port 8080!
🔗 GraphQL endpoint: http://localhost:8080/graphql
🔌 WebSocket endpoint: ws://localhost:8080/graphql
```

### ❌ OLD (Incorrect) Logs:
```
API server running on port 8080!
Use GraphQL at http://localhost:8080/graphql
[Then crashes with SIGTERM]
```

## Verify the Fix Worked:

1. **Check Logs** - Should see emoji logging (🚀, ✅, etc.)
2. **Test Health Endpoint**:
   ```bash
   curl https://rosterhub-production.up.railway.app/health
   ```
   Should return:
   ```json
   {
     "uptime": 123.45,
     "status": "OK",
     "timestamp": 1234567890,
     "mongodb": "connected"
   }
   ```

3. **Test Root Endpoint**:
   ```bash
   curl https://rosterhub-production.up.railway.app/
   ```

4. **Server Should Stay Running** - No more SIGTERM crashes!

## If Still Crashing After Rebuild:

Check these in Railway dashboard:

1. **Environment Variables**:
   - `MONGODB_URI` - Must be set and valid
   - `JWT_SECRET` - Must be set
   - `NODE_ENV=production` - Optional but recommended

2. **MongoDB Access**:
   - Go to MongoDB Atlas
   - Network Access → Add IP: `0.0.0.0/0`
   - Ensure cluster is not paused

3. **Railway Service Settings**:
   - Check that the service is set to "Public"
   - Verify PORT is automatically assigned by Railway

## Timeline:
- Latest commit pushed: Just now
- Railway should auto-deploy in ~2-3 minutes
- If using cached build, do manual "Redeploy"
