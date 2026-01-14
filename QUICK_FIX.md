# 🚨 Quick Fix for Railway 400 Error

## Most Likely Issue: Missing Environment Variables

### Check Railway Dashboard NOW:
1. Open Railway → Your Project → **Variables** tab
2. Verify these exist:
   - ✅ **MONGODB_URI** (your MongoDB connection string)
   - ✅ **JWT_SECRET** (any secure random string)

### If Missing:
```bash
# Add these variables in Railway dashboard:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
NODE_ENV=production
```

### Test After Railway Redeploys:
```bash
# Should return server status:
curl https://rosterhub-production.up.railway.app/health

# Should return API info:
curl https://rosterhub-production.up.railway.app/
```

## If MongoDB Connection Fails:
1. Go to MongoDB Atlas
2. Click **Network Access**
3. Add IP: `0.0.0.0/0` (allow all)
4. Wait 2-3 minutes for Railway to reconnect

## Check Railway Logs:
Look for:
- ✅ `✅ HTTP server running on port 3001!` = Server started
- ✅ `✅ MongoDB connected` = Database connected
- ❌ `❌ MongoDB connection failed` = Check MONGODB_URI
- ❌ `JWT_SECRET` undefined = Add JWT_SECRET variable

Your changes have been pushed. Railway should redeploy automatically in ~2 minutes.
