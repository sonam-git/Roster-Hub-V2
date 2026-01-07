# 🚀 Deploy Backend to Railway (REQUIRED)

## Why Railway?

Your 405 error happens because Vercel serverless functions CAN'T properly handle your backend needs:
- ❌ GraphQL subscriptions (WebSockets)
- ❌ Persistent MongoDB connections
- ❌ Apollo Server with Express
- ❌ File uploads
- ❌ Real-time features

Railway provides:
- ✅ Full Node.js server
- ✅ WebSocket support
- ✅ Always-on connections
- ✅ Free tier available
- ✅ Easy deployment

---

## Step-by-Step: Deploy to Railway

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### 3. Initialize Railway Project

```bash
cd "/Users/sonamjsherpa/Desktop/Roster-Hub copy"
railway init
```

Choose:
- Create a new project
- Give it a name (e.g., "roster-hub-backend")

### 4. Create railway.json Configuration

Create this file in your project root:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 5. Add Environment Variables

```bash
railway variables
```

Or add them in the Railway dashboard:

**Required Variables:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_CLIENT_ID=your_google_client_id
PORT=3001
NODE_ENV=production
```

### 6. Deploy!

```bash
railway up
```

This will:
- Build your server
- Deploy it to Railway
- Give you a URL (e.g., `https://roster-hub-backend-production.up.railway.app`)

### 7. Get Your Backend URL

```bash
railway status
```

Or check the Railway dashboard for your deployment URL.

---

## Update Frontend to Use Railway Backend

### 8. Update client/src/App.jsx

Replace the API URLs with your Railway URL:

```javascript
// Define HTTP and WebSocket URIs based on environment
const httpUri =
  import.meta.env.MODE === "production"
    ? "https://roster-hub-backend-production.up.railway.app/graphql"
    : "http://localhost:3001/graphql";

const wsUri =
  import.meta.env.MODE === "production"
    ? "wss://roster-hub-backend-production.up.railway.app/graphql"
    : "ws://localhost:3001/graphql";
```

### 9. Update server/server.js CORS

Make sure your backend allows requests from Vercel:

```javascript
const allowedOrigins = [
  "https://roster-hub-v2-y6j2.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];
```

(This should already be correct from earlier changes)

### 10. Commit and Push

```bash
git add .
git commit -m "Configure frontend to use Railway backend"
git push origin main
```

Vercel will auto-deploy with the new API URL!

---

## 🎯 Final Architecture

After this setup:

```
┌─────────────────────────────────────┐
│   USER'S BROWSER                    │
└──────────┬──────────────────────────┘
           │
           ├─── Static Files (HTML/JS/CSS)
           │    └──> Vercel CDN (Fast!)
           │
           └─── API/WebSocket Requests
                └──> Railway (Full Node.js Server)
                     ├─> MongoDB
                     ├─> Cloudinary
                     └─> Real-time features work!
```

**Benefits:**
- ✅ Frontend super fast (Vercel CDN)
- ✅ Backend fully functional (Railway)
- ✅ All features work (WebSockets, uploads, real-time)
- ✅ Both free tiers available
- ✅ Auto-deploy from GitHub

---

## 📋 Quick Checklist

- [ ] Install Railway CLI
- [ ] Login to Railway
- [ ] Initialize Railway project
- [ ] Add environment variables in Railway dashboard
- [ ] Deploy with `railway up`
- [ ] Get your Railway URL
- [ ] Update `client/src/App.jsx` with Railway URL
- [ ] Update `server/schemas/resolvers.js` password reset URL to Vercel
- [ ] Commit and push to GitHub
- [ ] Vercel redeploys frontend automatically
- [ ] Test signup/login ✅
- [ ] Test real-time features ✅

---

## Alternative: Render.com

If Railway doesn't work, try Render:

```bash
# No CLI needed, just:
1. Go to https://render.com
2. Sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - Root Directory: server
   - Build Command: npm install
   - Start Command: npm start
6. Add environment variables
7. Deploy!
```

---

## 🆘 Troubleshooting

### Railway deployment fails?
- Check that `server/package.json` has `"start": "node server.js"`
- Verify environment variables are set
- Check Railway logs: `railway logs`

### Frontend still shows 405 error?
- Make sure you updated the URL in `App.jsx`
- Clear browser cache
- Check that Railway deployment is running

### CORS errors?
- Verify `server/server.js` includes your Vercel URL in `allowedOrigins`
- Redeploy backend: `railway up`

---

## 💰 Cost

**Both are FREE for your use case:**
- Railway: $5 free credit/month (plenty for small apps)
- Render: Free tier (500 hours/month)

Choose whichever you prefer! 🎉
