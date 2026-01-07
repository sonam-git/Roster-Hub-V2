# 🔴 URGENT: Add Environment Variables to Railway

Your backend deployed successfully but is crashing because it's missing the **MONGODB_URI** environment variable!

## Quick Fix - Add Environment Variables Now

### Option 1: Via Railway Dashboard (EASIEST)

1. **Go to Railway Dashboard**
   - Visit: https://railway.com/project/977d6786-af71-4abb-ab17-28a4e2151128

2. **Click on your service** (rosterhub)

3. **Go to "Variables" tab**

4. **Add these variables ONE BY ONE:**

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
PORT=3001
NODE_ENV=production
```

5. **Click "Add"** after each variable

6. **Redeploy** - Railway will automatically redeploy with the new variables

---

### Option 2: Via Railway CLI

```bash
# Set MongoDB URI (MOST IMPORTANT)
railway variables set MONGODB_URI="your_mongodb_connection_string_here"

# Set other variables
railway variables set JWT_SECRET="your_jwt_secret"
railway variables set EMAIL_USER="your_email@gmail.com"
railway variables set EMAIL_PASSWORD="your_gmail_app_password"
railway variables set CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
railway variables set CLOUDINARY_API_KEY="your_cloudinary_key"
railway variables set CLOUDINARY_API_SECRET="your_cloudinary_secret"
railway variables set GOOGLE_CLIENT_ID="your_google_client_id"
railway variables set PORT="3001"
railway variables set NODE_ENV="production"
```

---

## Where to Find Your MongoDB URI?

### If you're using MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual database password
6. It should look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority
   ```

### If you need a NEW MongoDB database:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user
5. Whitelist all IPs (0.0.0.0/0) for Railway access
6. Get your connection string

---

## After Adding Variables

Railway will automatically redeploy. Check the logs:

```bash
railway logs
```

You should see:
```
API server running on port 3001!
Use GraphQL at http://localhost:3001/graphql
```

---

## Get Your Railway Backend URL

Once it's running:

```bash
railway status
```

Or check the Railway dashboard for your deployment URL (something like):
```
https://rosterhub-production.up.railway.app
```

---

## Next: Update Frontend

Once you have your Railway URL, update `client/src/App.jsx`:

```javascript
const httpUri = import.meta.env.MODE === "production"
  ? "https://your-railway-url.up.railway.app/graphql"
  : "http://localhost:3001/graphql";

const wsUri = import.meta.env.MODE === "production"
  ? "wss://your-railway-url.up.railway.app/graphql"
  : "ws://localhost:3001/graphql";
```

Then commit and push to trigger Vercel redeploy!

---

## 🎯 Quick Checklist

- [ ] Add MONGODB_URI to Railway (CRITICAL!)
- [ ] Add all other environment variables
- [ ] Wait for Railway to redeploy (automatic)
- [ ] Check logs: `railway logs`
- [ ] Get Railway URL: `railway status`
- [ ] Update `App.jsx` with Railway URL
- [ ] Commit and push
- [ ] Test your app! ✅
