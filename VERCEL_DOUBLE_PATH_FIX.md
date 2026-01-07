# 🔴 URGENT: Clear Old Build Command in Vercel

## The Problem

Vercel is STILL using the old build command from the deleted `vercel.json`:
```
npm install --prefix client && npm run build --prefix client
```

This creates `client/client/package.json` (double path) ❌

## ✅ SOLUTION: Override in Vercel Dashboard

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Select your project**: `roster-hub-v2`

3. **Click "Settings"** (top navigation)

4. **Click "General"** (left sidebar)

5. **Scroll to "Build & Development Settings"**

6. **Click "Override"** next to the settings

7. **Set EXACTLY these values:**

   ```
   Framework Preset: Other (or Vite if available)
   
   Root Directory: client
     ☑️ Include source files outside of the Root Directory in the Build Step
   
   Build Command: npm run build
   
   Output Directory: dist
   
   Install Command: npm install
   ```

   **CRITICAL**: Do NOT use `--prefix client` anywhere!

8. **Click "Save"** at the bottom

9. **Go to "Deployments" tab**

10. **Click ⋯** on the latest failed deployment

11. **Click "Redeploy"**

12. **UNCHECK** "Use existing Build Cache"

13. **Click "Redeploy"**

---

## Why This Happens

When you set `Root Directory: client`, Vercel automatically:
- Changes to the `client` folder
- Runs `npm install` there
- Runs `npm run build` there
- Looks for output in `dist` folder

You do NOT need `--prefix client` because Vercel already changed to that directory!

---

## Expected Build Log (Correct)

After fixing, you should see:
```
Root Directory: client
Running "install" command: `npm install`...
✓ Installed packages
Running "build" command: `npm run build`...
✓ built in 15s
Output directory: client/dist
```

NOT:
```
❌ Running "install" command: `npm install --prefix client`...
❌ Could not read /vercel/path0/client/client/package.json
```

---

## Alternative: Delete All Environment Variables

Sometimes old build commands are cached in environment variables.

1. Go to **Settings** → **Environment Variables**
2. Delete ANY variables related to:
   - `BUILD_COMMAND`
   - `INSTALL_COMMAND`
   - `OUTPUT_DIRECTORY`
3. Save and redeploy

---

## If Dashboard Settings Don't Stick

**Last Resort: Use vercel.json with CORRECT settings**

Create this file ONLY if dashboard doesn't work:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist"
}
```

Note: NO `--prefix` and NO `installCommand`!

---

## 🎯 Quick Action Checklist

- [ ] Go to Vercel Dashboard
- [ ] Settings → General → Build & Development Settings
- [ ] Click "Override"
- [ ] Set Root Directory: `client`
- [ ] Set Build Command: `npm run build` (no prefix!)
- [ ] Set Output Directory: `dist`
- [ ] Set Install Command: `npm install` (no prefix!)
- [ ] Save
- [ ] Go to Deployments
- [ ] Redeploy WITHOUT cache
- [ ] Wait 5 minutes
- [ ] Test!

---

## Screenshot Reference

When configuring, it should look like:

```
┌─────────────────────────────────────────────┐
│ Framework Preset                            │
│ [Other ▼]                                   │
│                                             │
│ Root Directory                              │
│ [client                               ] ✓   │
│ ☑️ Include source files outside...          │
│                                             │
│ Build Command                               │
│ [npm run build                        ]     │
│                                             │
│ Output Directory                            │
│ [dist                                 ]     │
│                                             │
│ Install Command                             │
│ [npm install                          ]     │
└─────────────────────────────────────────────┘
```

**NO `--prefix client` ANYWHERE!**

---

## This WILL Fix Your Issue! 🚀

Once you set these correctly in the dashboard, Vercel will:
1. ✅ Change to `client` directory
2. ✅ Run `npm install` (finds `client/package.json`)
3. ✅ Run `npm run build` (uses vite.config.js)
4. ✅ Output to `client/dist`
5. ✅ Deploy successfully!

Then your app will work perfectly! 🎉
