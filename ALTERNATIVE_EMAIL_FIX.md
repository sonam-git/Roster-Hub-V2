# Alternative Email Configuration (Gmail Service)

This version bypasses EMAIL_HOST and EMAIL_PORT entirely by using Gmail's built-in service configuration.

## Changes to Make

Replace the email transporter configuration in `server/schemas/resolvers.js`:

### Current (Lines ~1833-1845):
```javascript
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

### Replace With:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: (process.env.EMAIL_USER || 'sherpa.sjs@gmail.com').trim(),
    pass: (process.env.EMAIL_PASSWORD || '').trim(),
  }
});
```

## What This Does

- ✅ Uses Gmail's pre-configured SMTP settings
- ✅ Bypasses EMAIL_HOST and EMAIL_PORT completely
- ✅ Only needs EMAIL_USER and EMAIL_PASSWORD
- ✅ Nodemailer knows Gmail's host/port automatically
- ✅ No more EDNS/hostname errors

## Railway Variables Needed

Only these two:
```
EMAIL_USER: sherpa.sjs@gmail.com
EMAIL_PASSWORD: zdzc huax sqyf fcdf
```

You can DELETE these variables from Railway:
- EMAIL_HOST (not needed)
- EMAIL_PORT (not needed)

## Apply This Fix?

If the debug logs confirm the `=` is still in EMAIL_HOST after fixing variables, let me know and I'll apply this alternative solution. It's simpler and more reliable for Gmail.

This is the recommended approach for Gmail anyway - using `service: 'gmail'` instead of manual host/port configuration.
