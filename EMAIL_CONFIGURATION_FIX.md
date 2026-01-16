# 📧 Email Configuration Fix for Team Invites

## Issues Fixed

1. ✅ **SMTP Connection Timeout** - Updated email transporter configuration
2. ✅ **Localhost URLs in Emails** - Already using `APP_URL` environment variable

## Changes Made

### Updated Email Transporter Configuration

Changed from:
```javascript
nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

To:
```javascript
nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

This provides:
- More explicit SMTP configuration
- Proper port handling
- TLS settings for better compatibility
- Uses environment variables from Railway

## Railway Environment Variables

Your Railway environment already has these variables set. Verify they are correct:

### For Gmail:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # NOT your regular Gmail password!
APP_URL=https://roster-hub-v2-y6j2.vercel.app
```

### For Other Email Providers:

**Outlook/Hotmail:**
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**Yahoo:**
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

**SendGrid:**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
```

## Important: Gmail App Password Setup

If you're using Gmail, you **CANNOT** use your regular Gmail password. You MUST create an "App Password":

### Steps to Create Gmail App Password:

1. **Go to Google Account**: https://myaccount.google.com/
2. **Security** → **2-Step Verification** (MUST be enabled first)
3. **App passwords** (at the bottom of the page)
4. **Select app**: Choose "Mail"
5. **Select device**: Choose "Other (Custom name)"
6. **Enter**: "RosterHub" or any name
7. **Generate**
8. **Copy the 16-character password** (no spaces)
9. **Use this as `EMAIL_PASSWORD` in Railway**

### Update Railway Variable:

```bash
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Example format (remove spaces when copying)
```

## Testing the Email Functionality

After updating the Railway variables and redeploying:

### 1. Check Railway Logs

After you click "Send Invites", Railway logs should show:
```
✅ Email sent successfully
```

NOT:
```
❌ Error sending team invites: Error: Connection timeout
```

### 2. Test Sending an Invite

1. Go to your admin panel: https://roster-hub-v2-y6j2.vercel.app
2. Click **"Send Email Invites"**
3. Enter an email address (use your own for testing)
4. Click **"Add"** then **"Send Invitations"**
5. Check the recipient's inbox

### 3. Verify Email Content

The email should contain:
- ✅ Team name and owner name
- ✅ Invite code
- ✅ **Production URL**: `https://roster-hub-v2-y6j2.vercel.app/login`
- ✅ NOT localhost URLs
- ✅ "Join Team" button that works

### 4. Test Join Link

Click the "Join [Team Name]" button in the email:
- Should go to: `https://roster-hub-v2-y6j2.vercel.app/login?inviteCode=XXXXX`
- Should pre-fill the invite code
- Should allow joining the team

## Troubleshooting

### If Still Getting Connection Timeout:

**1. Verify Email Variables in Railway:**
```bash
# Check these are set correctly
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**2. For Gmail - Enable Less Secure Apps** (Alternative):
- Go to: https://myaccount.google.com/lesssecureapps
- Turn ON "Allow less secure apps"
- **Note**: App Password method is more secure and recommended

**3. Check Gmail Account Settings:**
- Make sure 2-Step Verification is ON
- Make sure IMAP/SMTP is enabled in Gmail settings

**4. Try a Different Email Service:**
If Gmail doesn't work, consider:
- **SendGrid** (recommended for production) - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **AWS SES** - Very cheap and reliable

### If Emails Go to Spam:

1. **Use a custom domain** for sending emails
2. **Set up SPF, DKIM, and DMARC** records
3. **Verify your domain** with your email provider
4. **Use a professional email service** like SendGrid or Mailgun

### If URLs Still Show Localhost:

**Check Railway Environment Variable:**
```bash
APP_URL=https://roster-hub-v2-y6j2.vercel.app
```

Make sure there's NO trailing slash!

## Using SendGrid (Recommended for Production)

SendGrid is more reliable than Gmail for transactional emails:

### 1. Sign Up for SendGrid:
- Go to: https://sendgrid.com
- Sign up for free account
- Verify your email

### 2. Create API Key:
- Dashboard → Settings → API Keys
- Create API Key with "Mail Send" permissions
- Copy the API key

### 3. Update Railway Variables:
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### 4. Verify Sender:
- Settings → Sender Authentication
- Verify your email address

## Expected Behavior After Fix

1. **Click "Send Invites"** in admin panel
2. **Add email addresses** and click send
3. **No timeout errors** in Railway logs
4. **Emails arrive** in recipients' inboxes (within 1-2 minutes)
5. **Email contains**:
   - Invite code
   - Production URLs (not localhost)
   - Working "Join Team" button
6. **Clicking join link** goes to production site with pre-filled invite code

## Deployment

After setting up email configuration:

```bash
# Commit the code changes
git add server/schemas/resolvers.js
git commit -m "Fix email configuration for team invites"
git push

# Railway will auto-deploy
# Wait 2-3 minutes for deployment
```

## Testing Checklist

After deployment:
- [ ] Railway variables are set correctly (EMAIL_HOST, EMAIL_PORT, etc.)
- [ ] APP_URL is set to production URL
- [ ] Gmail App Password is created and used (if using Gmail)
- [ ] Send test invite from admin panel
- [ ] No timeout errors in Railway logs
- [ ] Email arrives in inbox
- [ ] Email contains production URLs (not localhost)
- [ ] "Join Team" button works
- [ ] Can successfully join team using invite code from email

---

**Status**: Code updated and ready for deployment.
**Next Step**: Verify EMAIL_PASSWORD uses Gmail App Password, then test!
