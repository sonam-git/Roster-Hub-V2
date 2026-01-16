# ⚠️ URGENT: Railway is Running OLD CODE!

## Current Problem

Railway is **NOT running the latest code** from GitHub. Testing shows:
- ❌ `/health` endpoint returns 404 (should exist)
- ❌ `/` root endpoint returns 404 (should exist)
- ❌ `createOrganization` mutation missing (should exist)
- ✅ GraphQL server IS running (but with old schema)

## Why This Happens

Railway has NOT picked up your latest commits. Possible reasons:
1. Auto-deploy is disabled
2. Build cache is stuck
3. Railway is watching the wrong branch
4. Manual deployment needed

## IMMEDIATE ACTION REQUIRED

### Step 1: Check Railway Deployment Settings

1. Go to Railway dashboard: https://railway.app
2. Find your project
3. Click on your service
4. Check **Settings** tab:
   - ✅ **Source**: Should be connected to your GitHub repo
   - ✅ **Branch**: Should be `main`
   - ✅ **Auto Deploy**: Should be enabled
   - ✅ **Root Directory**: Should be empty or `/`

### Step 2: Force Manual Redeploy

**Option A: Redeploy Latest (RECOMMENDED)**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots menu** (⋮)
4. Select **"Redeploy"**
5. Wait ~3-5 minutes for build to complete

**Option B: Trigger New Deployment**
1. Go to **Settings** tab
2. Scroll to **Service** section
3. Click **"Redeploy"** button
4. Select **"Deploy Latest"**

**Option C: Clear Cache & Redeploy**
1. Go to **Settings** tab
2. Scroll down to **Danger** section
3. Click **"Clear Build Cache"**
4. Then go to **Deployments** and redeploy

### Step 3: Verify Environment Variables

In Railway **Variables** tab, verify these exist:
- ✅ `MONGODB_URI` - Your MongoDB connection string
- ✅ `JWT_SECRET` - A secure random string (at least 32 characters)
- ⚠️ `NODE_ENV=production` - Optional but recommended
- ⚠️ `GOOGLE_CLIENT_ID` - For Google OAuth (if using)

**Example values:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rosterhub?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-at-least-32-characters
NODE_ENV=production
```

### Step 4: Monitor Railway Logs

After redeployment, watch the logs for:

**✅ SUCCESS Indicators (NEW code with emojis):**
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
✅ MongoDB connected
```

**❌ FAILURE Indicators (OLD code without emojis):**
```
API server running on port 8080!
Use GraphQL at http://localhost:8080/graphql
```

### Step 5: Test the Deployment

After seeing SUCCESS logs, test these endpoints:

**1. Health Check:**
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

**2. Root Endpoint:**
```bash
curl https://rosterhub-production.up.railway.app/
```
Should return:
```json
{
  "message": "RosterHub API Server",
  "status": "running",
  "graphql": "/graphql",
  "health": "/health"
}
```

**3. GraphQL createOrganization:**
```bash
curl -X POST https://rosterhub-production.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { __type(name: \"Mutation\") { fields { name } } }"}'
```
Should include `createOrganization` in the list of mutations.

## Google OAuth 403 Error

The error: `"The given origin is not allowed for the given client ID"`

**Fix:**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   - `https://roster-hub-v2-y6j2.vercel.app`
   - `https://rosterhub-production.up.railway.app`
6. Under **Authorized redirect URIs**, add:
   - `https://roster-hub-v2-y6j2.vercel.app`
   - `https://rosterhub-production.up.railway.app/graphql`
7. Click **Save**
8. Wait 5-10 minutes for changes to propagate

## After Successful Redeployment

1. **Test Team Creation:**
   - Go to: https://roster-hub-v2-y6j2.vercel.app
   - Try signup with new team
   - Should work without 400 errors

2. **Test Login:**
   - Try regular email/password login
   - Try Google OAuth login (after fixing authorized origins)

3. **Monitor for Stability:**
   - Keep Railway logs open for 5-10 minutes
   - Ensure no SIGTERM crashes
   - Check `/health` endpoint periodically

## Still Not Working?

### Check Railway Build Command
In Railway settings, verify:
- **Build Command**: Should be empty (uses nixpacks.toml)
- **Start Command**: Should be `cd server && npm start`
- OR rely on railway.json configuration

### Check nixpacks.toml
Should have:
```toml
[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["cd server && npm install"]

[start]
cmd = "cd server && npm start"
```

### Check railway.json
Should have:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

## Expected Timeline

- **Now**: Force redeploy on Railway
- **+2 min**: Build starts
- **+5 min**: Deployment completes
- **+6 min**: Health check passes
- **+7 min**: Test endpoints work
- **+10 min**: Frontend can create teams

## Critical Success Criteria

✅ Railway logs show emoji logging (🚀, ✅, etc.)
✅ `/health` endpoint returns JSON
✅ `/` endpoint returns JSON
✅ `createOrganization` mutation exists
✅ MongoDB shows "connected" in health check
✅ No SIGTERM crashes
✅ Frontend signup works without 400 errors

---

**Status**: Code is ready and pushed to GitHub.
**Required Action**: Manual redeploy on Railway dashboard.
**Priority**: URGENT - Railway must redeploy to fix 400 errors.
