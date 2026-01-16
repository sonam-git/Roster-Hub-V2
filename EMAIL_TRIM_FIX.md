# 🔧 Fix Applied: Email Environment Variable Trimming

## Error Analysis

The Railway error showed:
```
hostname: ' =smtp.gmail.com'
```

The space and equals sign suggest the environment variable has:
- Leading/trailing whitespace
- Hidden characters
- Copy-paste artifacts

## Solution Applied

Updated code to **trim all email environment variables**:

```javascript
// Before
host: process.env.EMAIL_HOST || 'smtp.gmail.com',
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASSWORD,

// After
host: (process.env.EMAIL_HOST || 'smtp.gmail.com').trim(),
user: (process.env.EMAIL_USER || '').trim(),
pass: (process.env.EMAIL_PASSWORD || '').trim(),
```

Also trimmed `APP_URL` to prevent URL issues.

## What This Fixes

✅ Removes leading/trailing spaces from environment variables
✅ Prevents `EDNS` and `EBADNAME` DNS lookup errors
✅ Ensures clean SMTP hostname resolution
✅ Prevents malformed URLs in emails

## Next Steps

### 1. Wait for Railway Auto-Deploy
The code changes have been pushed. Railway should redeploy automatically in 2-3 minutes.

### 2. Double-Check Railway Variables

Even though we added `.trim()`, it's still good practice to verify:

**In Railway → Variables tab:**

Check that each variable has NO extra spaces:

```
EMAIL_HOST
smtp.gmail.com
(no spaces before or after)

EMAIL_PORT
587

EMAIL_USER
your-email@gmail.com

EMAIL_PASSWORD
your-16-character-app-password

APP_URL
https://roster-hub-v2-y6j2.vercel.app
```

### 3. If Variables Look Wrong

**Delete and recreate them:**
1. Click the X to delete each email variable
2. Click "New Variable"
3. Type the name manually (don't copy-paste): `EMAIL_HOST`
4. Type the value manually: `smtp.gmail.com`
5. Press Enter/Save
6. Repeat for all email variables

### 4. Test After Deployment

Once Railway shows the new deployment is live:

1. **Go to Admin Panel**: https://roster-hub-v2-y6j2.vercel.app
2. **Click "Send Email Invites"**
3. **Enter your email** (for testing)
4. **Click Send**
5. **Check Railway logs** for success message

**Expected logs:**
```
✅ Invitations sent successfully to 1 email(s)
```

**NOT:**
```
❌ Error: queryA EBADNAME =smtp.gmail.com
❌ Error: Connection timeout
```

### 5. Verify Email Received

Check your inbox:
- ✅ Email should arrive within 1-2 minutes
- ✅ Subject: "You're invited to join [Team Name] on RosterHub!"
- ✅ Contains invite code
- ✅ "Join Team" button with production URL
- ✅ All links use `https://roster-hub-v2-y6j2.vercel.app` (not localhost)

## Alternative: Use Gmail App-Specific Configuration

If issues persist, we can hardcode Gmail settings and only use env vars for credentials:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Uses Gmail's built-in settings
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASSWORD?.trim(),
  }
});
```

This bypasses the host/port entirely and uses Gmail's pre-configured settings.

## Troubleshooting

### Still getting EDNS error after trim()?

**Option A: Check Variable Names**
The variable NAME itself might have issues:
- Open Railway Variables tab
- Hover over each variable name
- Make sure it's exactly: `EMAIL_HOST` (no extra characters)

**Option B: Screenshot Your Variables**
Take a screenshot of your Railway Variables tab and share it - there might be something subtle we're missing.

**Option C: Use Service-Based Config**
Let me know and I'll update the code to use `service: 'gmail'` instead of explicit host/port.

### Email still not sending?

**Check Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Make sure 2-Step Verification is enabled
3. Generate a NEW app password
4. Copy it (no spaces): `abcdefghijklmnop`
5. Paste into Railway's `EMAIL_PASSWORD` variable

### Want to use a different email provider?

**SendGrid (Recommended for production):**
```
EMAIL_HOST: smtp.sendgrid.net
EMAIL_PORT: 587
EMAIL_USER: apikey
EMAIL_PASSWORD: <your-sendgrid-api-key>
```

**Mailgun:**
```
EMAIL_HOST: smtp.mailgun.org
EMAIL_PORT: 587
EMAIL_USER: <your-mailgun-username>
EMAIL_PASSWORD: <your-mailgun-password>
```

## Status

- ✅ Code updated with `.trim()` on all email env vars
- ✅ Changes pushed to GitHub
- ⏳ Waiting for Railway auto-deploy (~2-3 min)
- 📋 Next: Test email sending after deployment

---

**Deployment will happen automatically. Test in ~3 minutes!**
