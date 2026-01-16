# Railway Environment Variables - Quick Reference

## 🔑 Required Variables for Email Sending

### SendGrid (Production Email)
```
SENDGRID_API_KEY
```
**Value:** Your SendGrid API key (starts with `SG.`)  
**Required:** Yes, for production email delivery  
**Get it:** https://app.sendgrid.com/settings/api_keys

```
EMAIL_FROM
```
**Value:** Verified sender email (e.g., `sherpa.sjs@gmail.com`)  
**Required:** Yes, must be verified in SendGrid  
**Verify at:** https://app.sendgrid.com/settings/sender_auth

```
APP_URL
```
**Value:** Your production frontend URL  
**Example:** `https://roster-hub-v2-y6j2.vercel.app`  
**Required:** Yes, for invite/reset links in emails

---

## 🧪 Optional Variables (Local Development Only)

### Gmail (Local Dev Email)
```
EMAIL_USER
```
**Value:** Your Gmail address  
**Required:** Only for local dev (ignored if SENDGRID_API_KEY exists)

```
EMAIL_PASSWORD
```
**Value:** Gmail app password  
**Required:** Only for local dev (ignored if SENDGRID_API_KEY exists)

---

## ❌ Variables to REMOVE

These are no longer needed and can cause issues:

```
EMAIL_HOST      ❌ DELETE - Not needed with SendGrid
EMAIL_PORT      ❌ DELETE - Not needed with SendGrid
```

---

## 📝 How to Set Variables in Railway

1. Go to https://railway.app
2. Select your project → **server** service
3. Click **Variables** tab
4. Click **+ New Variable**
5. Enter variable name (e.g., `SENDGRID_API_KEY`)
6. Enter value (your API key)
7. Click **Add**
8. Railway auto-deploys

---

## ⚠️ Important Rules

1. **Variable NAMES must be exact** - no spaces, no equals signs
2. **Variable VALUES can contain anything** - but trim leading/trailing spaces
3. **Don't use RAW EDITOR** - use individual variable inputs
4. **One variable per field** - don't combine multiple variables

### ✅ Correct Format
```
Name:  SENDGRID_API_KEY
Value: SG.xxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx
```

### ❌ Wrong Format
```
Name:  SENDGRID_API_KEY=SG.xxx    ❌ No equals in name
Name:  =SENDGRID_API_KEY          ❌ No equals in name
Name:   SENDGRID_API_KEY          ❌ No leading spaces
Value:  =SG.xxx                   ❌ No leading equals in value
```

---

## 🔍 Verify Your Setup

Run this in your Railway server logs to verify variables:

```bash
# Check if SendGrid is enabled
node -e "console.log('SendGrid enabled:', !!process.env.SENDGRID_API_KEY)"

# Check all email variables
node -e "console.log({
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY?.substring(0, 10) + '...',
  EMAIL_FROM: process.env.EMAIL_FROM,
  APP_URL: process.env.APP_URL
})"
```

---

## 📊 Current Production Setup

For RosterHub production on Railway:

| Variable | Value | Status |
|----------|-------|--------|
| `SENDGRID_API_KEY` | `SG.xxx...` | ✅ Required |
| `EMAIL_FROM` | `sherpa.sjs@gmail.com` | ✅ Required |
| `APP_URL` | `https://roster-hub-v2-y6j2.vercel.app` | ✅ Required |
| `EMAIL_USER` | (optional) | ℹ️ Ignored in production |
| `EMAIL_PASSWORD` | (optional) | ℹ️ Ignored in production |
| `EMAIL_HOST` | — | ❌ Delete |
| `EMAIL_PORT` | — | ❌ Delete |

---

## 🚀 Deployment Checklist

Before deploying:
- [ ] SENDGRID_API_KEY is set
- [ ] EMAIL_FROM matches verified SendGrid sender
- [ ] APP_URL points to production frontend
- [ ] EMAIL_HOST is removed
- [ ] EMAIL_PORT is removed
- [ ] No malformed variable names (no `=` prefix, no spaces)
- [ ] Sender email is verified in SendGrid dashboard

After deploying:
- [ ] Test password reset email
- [ ] Test team invite email
- [ ] Check Railway logs for "Using SendGrid"
- [ ] Check SendGrid Activity dashboard
- [ ] Verify emails arrive in inbox

---

## 🎯 Quick Test

Send a test email from Railway:

```bash
# In Railway terminal or using run_in_terminal
cd /app
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'sherpa.sjs@gmail.com',
  subject: 'Test from Railway',
  text: 'SendGrid is working!'
}).then(() => console.log('✅ Test email sent'))
  .catch(err => console.error('❌ Error:', err));
"
```

---

## 📞 Need Help?

1. Check `SENDGRID_SETUP_GUIDE.md` for detailed setup instructions
2. View Railway logs for error messages
3. Check SendGrid Activity dashboard for delivery status
4. Verify sender email is approved in SendGrid
