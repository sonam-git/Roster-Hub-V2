# 🔴 URGENT: Clear Vercel Cache & Force Redeploy

## The Problem

Your frontend is still calling the OLD endpoint:
```
❌ https://roster-hub-v2-y6j2.vercel.app/api/graphql
```

Instead of the NEW Railway endpoint:
```
✅ https://rosterhub-production.up.railway.app/graphql
```

This means Vercel is serving a **cached old build**.

---

## Solution 1: Force Redeploy in Vercel Dashboard (FASTEST)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: **roster-hub-v2**

### Step 2: Go to Deployments
1. Click on the **Deployments** tab
2. Find the LATEST deployment (should be from a few minutes ago)

### Step 3: Redeploy WITHOUT Cache
1. Click the **⋯** (three dots) on the right side of the latest deployment
2. Click **"Redeploy"**
3. **IMPORTANT**: Click on **"Use existing Build Cache"** to UNCHECK it
4. Click **"Redeploy"** button

This will force Vercel to rebuild from scratch with the new code!

---

## Solution 2: Clear Build Cache in Settings

### Alternative Method:
1. Go to your Vercel project
2. Click **Settings** → **General**
3. Scroll down to **Build & Development Settings**
4. Look for **"Clear Build Cache"** or similar option
5. Click it and redeploy

---

## Solution 3: Via Vercel CLI (If you have it)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy with force flag
vercel --prod --force
```

---

## Verification: Check if It's Working

### After Vercel finishes redeploying:

1. **Clear your browser cache**:
   - Chrome/Edge: `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Or open an **Incognito/Private window**

2. **Visit your app**:
   ```
   https://roster-hub-v2-y6j2.vercel.app
   ```

3. **Open browser console** (F12)
   - Network tab
   - Try to signup/login
   - Check the API calls

4. **You should see**:
   ```
   ✅ POST https://rosterhub-production.up.railway.app/graphql
   ```

   **NOT**:
   ```
   ❌ POST https://roster-hub-v2-y6j2.vercel.app/api/graphql
   ```

---

## If It Still Shows 405 Error

### Check Vercel Build Logs:

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check the **"Build Logs"**
4. Look for:
   ```
   ✓ built in Xs
   ✓ Deployment completed
   ```

5. Check the **"Output Directory"**:
   - Should be: `client/dist`

### Verify Environment Variables (Just in Case):

1. Go to **Settings** → **Environment Variables**
2. You DON'T need any backend variables on Vercel
3. If you see any `API_URL` or similar, remove them

---

## Emergency: Hard Reset Vercel Configuration

If nothing works:

### 1. Delete Current Vercel Project
1. Go to Vercel Dashboard
2. Select your project
3. Settings → General → scroll to bottom
4. Click **"Delete Project"**

### 2. Reconnect from GitHub
1. Go to Vercel Dashboard
2. Click **"Add New Project"**
3. Import from GitHub
4. Select: **Roster-Hub-V2**
5. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Deploy

---

## Quick Diagnostics

### Test Railway Backend Directly:

Open this URL in your browser:
```
https://rosterhub-production.up.railway.app/graphql
```

**Expected**: You should see GraphQL Playground or an error about GET requests

**If you see this, Railway is working!** ✅

### Check Railway Status:

```bash
railway status
```

Should show:
```
✅ Service: Active
✅ Latest deployment: Successful
```

---

## Timeline

1. **GitHub push**: ✅ Done (3 minutes ago)
2. **Vercel detecting push**: ⏳ In progress
3. **Vercel building**: ⏳ Waiting...
4. **Vercel deploying**: ⏳ Waiting...
5. **Cache cleared**: ❌ Need to force

**Typical Vercel build time**: 2-5 minutes

---

## Current Status Check

Run this command to see Vercel deployment status:

```bash
# If you have Vercel CLI
vercel ls

# Or check the dashboard:
```
Visit: https://vercel.com/dashboard

Look for your project and check:
- ⏳ Building...
- ✅ Ready

Once it shows **"Ready"**, wait 1-2 minutes for CDN propagation, then test!

---

## 🎯 Summary

**The issue**: Vercel is caching the old build with `/api/graphql` endpoint

**The fix**: Force redeploy WITHOUT cache in Vercel dashboard

**Steps**:
1. Vercel Dashboard → Deployments
2. Latest deployment → ⋯ → Redeploy
3. Uncheck "Use existing Build Cache"
4. Click Redeploy
5. Wait 2-5 minutes
6. Clear browser cache
7. Test!

---

**Once this is done, your 405 error will be fixed and the app will work!** 🚀
