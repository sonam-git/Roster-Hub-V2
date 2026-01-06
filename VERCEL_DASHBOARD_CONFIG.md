# 🔧 Vercel Dashboard Configuration

## The Build Error

```
Error: No Output Directory named "build" found after the Build completed.
```

This error occurs because Vercel is looking for a `build` folder, but Vite creates a `dist` folder.

## ✅ Solution: Configure in Vercel Dashboard

You need to configure the build settings in **Vercel's Project Settings**, not just in `vercel.json`.

### Step-by-Step Instructions:

#### 1. Go to Your Project Settings
1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **roster-hub-v2**
3. Click **Settings** (top navigation)

#### 2. Configure Build & Development Settings
1. In the left sidebar, click **General**
2. Scroll down to **Build & Development Settings**
3. Configure as follows:

**Framework Preset:**
```
Other
```

**Root Directory:**
```
client
```
_(Click "Edit" and type `client`, then check "Include source files outside of the Root Directory")_

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

#### 3. Save Changes
Click **Save** at the bottom of the page.

#### 4. Redeploy
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache"
5. Click **Redeploy**

---

## Alternative: Simple vercel.json (If Above Doesn't Work)

If the dashboard configuration doesn't work, use this simpler `vercel.json`:

```json
{
  "buildCommand": "npm run build --prefix client",
  "outputDirectory": "client/dist",
  "installCommand": "npm install --prefix client"
}
```

Then commit and push:
```bash
git add vercel.json
git commit -m "Simplify Vercel configuration"
git push origin main
```

---

## ⚠️ Important: API Routes Won't Work Yet

With this configuration, you're deploying **ONLY THE FRONTEND** to Vercel.

Your GraphQL API (`/api/graphql`) is NOT included. This means:
- ✅ Frontend will load
- ❌ API calls will fail
- ❌ You'll still see CORS/connection errors

### Why?
Vercel's free tier and serverless architecture don't support your WebSocket-heavy backend.

### Complete Solution:

**You need a HYBRID deployment:**

1. **Frontend on Vercel** (current)
   - Fast CDN delivery
   - Free hosting
   - Auto-deploys from GitHub

2. **Backend on Railway/Render** (next step)
   - Full Node.js server
   - WebSocket support
   - MongoDB connection
   - Real-time features work

---

## 🚀 Quick Backend Deployment to Railway

After fixing the frontend build, deploy your backend:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Deploy (will deploy the server folder)
railway up

# Add environment variables in Railway dashboard
# Then get your backend URL
```

Update `client/src/App.jsx`:
```javascript
const httpUri = import.meta.env.MODE === "production"
  ? "https://your-app.railway.app/graphql"  // Your Railway URL
  : "http://localhost:3001/graphql";
```

Commit, push, and Vercel will redeploy with the correct API URL!

---

## 📋 Checklist

- [ ] Configure Root Directory in Vercel Dashboard → `client`
- [ ] Set Output Directory → `dist`
- [ ] Set Build Command → `npm run build`
- [ ] Check "Include source files outside Root Directory"
- [ ] Save settings
- [ ] Trigger redeploy
- [ ] Frontend should now build successfully ✅
- [ ] Deploy backend to Railway/Render
- [ ] Update API URLs in `App.jsx`
- [ ] Final deployment with working API ✅

---

## 🆘 If It Still Doesn't Work

Try this in your Vercel dashboard:

1. **Settings** → **General** → **Build & Development Settings**
2. **Override** the build settings:
   - ✅ Root Directory: `client`
   - ✅ Build Command: `npm run build`
   - ✅ Output Directory: `dist`
   - ✅ Install Command: `npm install`
3. Check: **"Include source files outside of the Root Directory in the Build Step"**
4. Click **Save**
5. Go to **Deployments** → Click **⋯** → **Redeploy**

This should work! 🎉
