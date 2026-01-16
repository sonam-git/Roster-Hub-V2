#!/bin/bash

echo "📧 Committing Email Configuration Fix..."

cd "/Users/sonamjsherpa/Desktop/Roster-Hub copy"

git add server/schemas/resolvers.js
git add EMAIL_CONFIGURATION_FIX.md

git commit -m "Fix email SMTP configuration for team invites

- Update SMTP transporter with explicit host/port configuration
- Add TLS settings for better compatibility
- Use EMAIL_HOST and EMAIL_PORT environment variables
- Fix connection timeout issues
- Production URLs already working via APP_URL variable

Fixes issue: Connection timeout when sending team invite emails
Requires: Gmail App Password (not regular password) in EMAIL_PASSWORD"

git push

echo "✅ Changes pushed to GitHub!"
echo "🚂 Railway will auto-deploy in ~2-3 minutes"
echo ""
echo "📋 IMPORTANT: Verify Railway Variables"
echo "   EMAIL_HOST=smtp.gmail.com"
echo "   EMAIL_PORT=587"
echo "   EMAIL_USER=your-email@gmail.com"
echo "   EMAIL_PASSWORD=your-16-char-app-password"
echo "   APP_URL=https://roster-hub-v2-y6j2.vercel.app"
echo ""
echo "🔑 Get Gmail App Password:"
echo "   https://myaccount.google.com/apppasswords"
