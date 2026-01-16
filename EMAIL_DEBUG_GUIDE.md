# 🔍 Debug Email Environment Variables

## Issue

Railway keeps showing `hostname: '=smtp.gmail.com'` even after fixing variable names.

## Debug Logging Added

Added extensive debug logging to see what's actually in the environment variables:

```javascript
console.log('📧 Email Configuration Debug:');
console.log('  EMAIL_HOST raw:', JSON.stringify(process.env.EMAIL_HOST));
console.log('  EMAIL_HOST trimmed:', JSON.stringify((process.env.EMAIL_HOST || 'smtp.gmail.com').trim()));
console.log('  EMAIL_PORT raw:', JSON.stringify(process.env.EMAIL_PORT));
console.log('  EMAIL_USER raw:', JSON.stringify(process.env.EMAIL_USER));
console.log('  APP_URL raw:', JSON.stringify(process.env.APP_URL));
console.log('  Final host:', JSON.stringify(emailHost));
console.log('  Final port:', emailPort);
```

## Next Steps

1. **Wait for Railway to deploy** (~2 min)
2. **Try sending an email invite** from admin panel
3. **Check Railway logs** for the debug output
4. **Look for the line**: `📧 Email Configuration Debug:`
5. **Share the debug output** to see what's actually in the variables

## Alternative Solution: Bypass Environment Variables

If the issue persists, we can hardcode Gmail settings:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Uses Gmail's built-in config
  auth: {
    user: process.env.EMAIL_USER?.trim() || 'sherpa.sjs@gmail.com',
    pass: process.env.EMAIL_PASSWORD?.trim() || 'zdzc huax sqyf fcdf',
  }
});
```

This completely bypasses the `EMAIL_HOST` and `EMAIL_PORT` variables.

## If Debug Shows the `=` is in the variable:

Then the issue is in Railway's variable storage, not our code. Solutions:

### Option 1: Use Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set variables via CLI
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set EMAIL_PORT=587
railway variables set EMAIL_USER=sherpa.sjs@gmail.com
railway variables set EMAIL_PASSWORD="zdzc huax sqyf fcdf"
railway variables set APP_URL=https://roster-hub-v2-y6j2.vercel.app
```

### Option 2: Use Gmail Service Config (Hardcoded)

Let me know if you want me to implement this - it will completely bypass the environment variable issue.

### Option 3: Contact Railway Support

If variables keep having `=` no matter what, this might be a Railway platform bug.

## What to Look For

After deployment, when you try to send an invite, Railway logs should show:

```
📧 Email Configuration Debug:
  EMAIL_HOST raw: "smtp.gmail.com"  ✅ Good
  EMAIL_HOST trimmed: "smtp.gmail.com"  ✅ Good

OR

  EMAIL_HOST raw: "=smtp.gmail.com"  ❌ Bad - still has =
  EMAIL_HOST trimmed: "smtp.gmail.com"  ✅ Trim worked
```

If you see the `=` in the raw value, then Railway is storing it incorrectly and we need to use the alternative solution.

---

**Wait for deployment, try sending invite, then share the debug logs!**
