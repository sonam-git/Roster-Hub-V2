# Vercel Deployment Guide

## Overview
Your Roster Hub application is now configured to deploy entirely on Vercel (both frontend and backend).

## Changes Made

### 1. Removed Heroku Configuration
- ✅ Deleted `Procfile` (Heroku-specific)
- ✅ Removed `heroku-postbuild` script from `package.json`
- ✅ Updated all Heroku URLs to Vercel URLs

### 2. Added Vercel Configuration
- ✅ Created `vercel.json` with proper routing for full-stack app
- ✅ Added `vercel-build` script to `package.json`

### 3. Updated CORS Configuration
- ✅ Server now allows all Vercel preview deployments (*.vercel.app)
- ✅ Automatically handles Vercel environment URLs
- ✅ Supports local development

### 4. Updated API Endpoints
- ✅ `client/src/App.jsx` - GraphQL endpoints now point to Vercel
- ✅ `server/schemas/resolvers.js` - Password reset emails use Vercel URL

## Environment Variables

Make sure to set these in your Vercel project settings:

### Backend Variables (from your .env file)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### How to Add Environment Variables in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for Production, Preview, and Development

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd "/Users/sonamjsherpa/Desktop/Roster-Hub copy"
vercel
```

4. **Deploy to Production**:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub Integration (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

## How It Works

The `vercel.json` configuration tells Vercel to:
1. Build and serve your Node.js backend (`server/server.js`) for `/graphql` routes
2. Build and serve your React frontend (from `client/dist`) for all other routes
3. Handle both HTTP and WebSocket connections for GraphQL

## CORS Configuration

Your server now accepts requests from:
- ✅ `https://roster-hub-v2-y6j2.vercel.app` (your production URL)
- ✅ Any Vercel preview deployment (`*.vercel.app`)
- ✅ `http://localhost:5173` (local development)
- ✅ `http://localhost:3000` (alternative local port)

## Testing After Deployment

1. Visit your Vercel URL: `https://roster-hub-v2-y6j2.vercel.app`
2. Try to create an account
3. The CORS error should be resolved
4. Test all features including:
   - User authentication
   - GraphQL queries/mutations
   - Real-time subscriptions (WebSockets)
   - Image uploads

## Troubleshooting

### If you still see CORS errors:
1. Check that environment variables are set in Vercel
2. Verify the MongoDB connection string is correct
3. Check Vercel function logs for errors

### If the API doesn't respond:
1. Check Vercel function logs
2. Ensure `vercel.json` routes are correct
3. Verify environment variables are set

### If WebSockets don't work:
Vercel has limitations with WebSocket connections. You may need to:
- Use a separate service for WebSocket subscriptions (e.g., Railway, Render)
- Or upgrade to Vercel Pro for better WebSocket support

## Important Notes

⚠️ **Vercel Serverless Functions have a 10-second timeout on Hobby plan**
- Long-running operations may timeout
- Consider upgrading to Pro if needed

⚠️ **WebSocket Limitations**
- Vercel's serverless architecture may not fully support persistent WebSocket connections
- Consider using polling or a separate WebSocket service if real-time features don't work

## Alternative: Hybrid Deployment

If you encounter issues with WebSockets or serverless timeouts, consider:
- **Frontend**: Vercel (as is)
- **Backend**: Railway, Render, or DigitalOcean (for better WebSocket support)

This would require updating the URLs in `App.jsx` to point to your backend service.
