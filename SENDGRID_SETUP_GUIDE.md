# SendGrid Setup Guide for RosterHub Email Delivery

## 🎯 Overview
This guide helps you set up SendGrid for production email delivery on Railway. Gmail SMTP is blocked by Railway, so we use SendGrid for production and Gmail for local development.

---

## 📋 Step 1: Create SendGrid Account

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com/
   - Click "Start for Free"
   - Create an account (use your RosterHub email)
   - Verify your email address

2. **Choose Free Plan**
   - Free tier includes 100 emails/day
   - Perfect for team invites and password resets
   - No credit card required

---

## 🔑 Step 2: Create API Key

1. **Navigate to API Keys**
   - Log in to SendGrid dashboard
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**

2. **Configure API Key**
   - Name: `RosterHub Production`
   - Permission: **Full Access** (or "Mail Send" only)
   - Click **Create & View**
   - **⚠️ IMPORTANT:** Copy the API key immediately (you won't see it again)

3. **Save Your API Key**
   ```
   SG.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## ✉️ Step 3: Verify Sender Email

SendGrid requires you to verify the email address you'll send from.

### Option A: Single Sender Verification (Recommended for Free Tier)

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Name:** RosterHub Team
   - **From Email:** sherpa.sjs@gmail.com (or your preferred email)
   - **Reply To:** Same as From Email
   - **Company Address:** Your address
4. Click **Create**
5. Check your email and click the verification link
6. Wait for verification to complete (usually instant)

### Option B: Domain Authentication (For Custom Domain)

If you own a domain (e.g., rosterhub.com):
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. This allows you to send from any email @yourdomain.com

---

## 🚀 Step 4: Configure Railway Environment Variables

1. **Go to Your Railway Project**
   - Open https://railway.app
   - Select your RosterHub project
   - Go to the **server** service
   - Click **Variables** tab

2. **Add SendGrid Variables**
   
   Click **+ New Variable** and add:

   ```
   SENDGRID_API_KEY
   ```
   Value: Your API key from Step 2 (starts with `SG.`)

   ```
   EMAIL_FROM
   ```
   Value: The email you verified in Step 3 (e.g., `sherpa.sjs@gmail.com`)

   ```
   APP_URL
   ```
   Value: Your production URL (e.g., `https://roster-hub-v2-y6j2.vercel.app`)

3. **Remove Old Gmail Variables** (Optional but recommended)
   - Remove or keep `EMAIL_USER` (not used when SENDGRID_API_KEY exists)
   - Remove or keep `EMAIL_PASSWORD` (not used when SENDGRID_API_KEY exists)
   - **Delete** `EMAIL_HOST` (not needed)
   - **Delete** `EMAIL_PORT` (not needed)

4. **Verify Variable Names**
   - ⚠️ Make sure there are NO spaces, equals signs, or special characters in variable NAMES
   - Variable names should be exactly: `SENDGRID_API_KEY`, `EMAIL_FROM`, `APP_URL`
   - Values can contain anything

5. **Deploy**
   - Railway will automatically redeploy with the new variables
   - Or click **Deploy** to trigger a manual deployment

---

## 🧪 Step 5: Test Email Sending

### Test Password Reset Email

1. Go to your production site: https://roster-hub-v2-y6j2.vercel.app/login
2. Click "Forgot Password?"
3. Enter a test email address
4. Check the email inbox
5. Check Railway logs for success messages:
   ```
   ✅ Using SendGrid SMTP for production
   📧 Sending from: sherpa.sjs@gmail.com
   ✅ Password reset email sent
   ```

### Test Team Invite Email

1. Log in to your production site
2. Go to Team Settings or Admin Panel
3. Send a team invite to a test email
4. Check the email inbox
5. Check Railway logs for success messages:
   ```
   ✅ Using SendGrid SMTP for production
   📧 Sending from: sherpa.sjs@gmail.com
   📧 Sending invite to: test@example.com
   ✅ Email sent to test@example.com
   ✅ All 1 invitation emails sent successfully
   ```

---

## 🔍 Step 6: Monitor and Troubleshoot

### Check SendGrid Dashboard

1. Go to **Activity** in SendGrid dashboard
2. View email delivery status:
   - ✅ **Delivered:** Email sent successfully
   - ⏳ **Processing:** Email is being sent
   - ❌ **Dropped:** Email blocked (check reason)
   - ❌ **Bounced:** Invalid recipient email

### Check Railway Logs

```bash
# View logs in Railway dashboard
# Look for these messages:
✅ Using SendGrid SMTP for production
📧 Sending from: sherpa.sjs@gmail.com
✅ Password reset email sent
✅ Email sent to: recipient@example.com
```

### Common Issues

**Issue:** "550 Unauthenticated senders not allowed"
- **Solution:** Verify your sender email in SendGrid (Step 3)

**Issue:** "Invalid API key"
- **Solution:** Check that SENDGRID_API_KEY is correct and has no extra spaces

**Issue:** "Emails not arriving"
- **Solution:** Check spam folder, verify recipient email is valid

**Issue:** Still using Gmail in production
- **Solution:** Make sure SENDGRID_API_KEY variable exists in Railway

---

## 📊 Code Logic Summary

Your code automatically detects the environment:

```javascript
// In production (Railway with SENDGRID_API_KEY):
const useSendGrid = !!process.env.SENDGRID_API_KEY;

if (useSendGrid) {
  // Use SendGrid SMTP
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    }
  });
} else {
  // Use Gmail SMTP (local development)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });
}
```

---

## ✅ Checklist

- [ ] Created SendGrid account
- [ ] Generated SendGrid API key
- [ ] Verified sender email address in SendGrid
- [ ] Added SENDGRID_API_KEY to Railway
- [ ] Added EMAIL_FROM to Railway
- [ ] Added/verified APP_URL in Railway
- [ ] Removed EMAIL_HOST and EMAIL_PORT from Railway (optional)
- [ ] Deployed to Railway
- [ ] Tested password reset email
- [ ] Tested team invite email
- [ ] Verified emails arrive in inbox
- [ ] Checked Railway logs for success messages
- [ ] Checked SendGrid Activity dashboard

---

## 🎉 Success!

Once all tests pass, your email system is production-ready! 

- ✅ SendGrid for production (Railway)
- ✅ Gmail for local development
- ✅ Automatic environment detection
- ✅ No more SMTP timeout errors
- ✅ All invite URLs use production URL

---

## 📞 Support

If you run into issues:
1. Check Railway logs for error messages
2. Check SendGrid Activity dashboard
3. Verify all environment variables are set correctly
4. Make sure sender email is verified in SendGrid
5. Check spam folder for test emails

Happy emailing! 🚀
