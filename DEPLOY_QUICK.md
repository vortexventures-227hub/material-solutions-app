# Vortex Forklift — Quick Deploy Steps

**Backend Status:** ✅ LIVE at https://vortex-forklift-api-production.up.railway.app
**Frontend Status:** ⏳ Ready to deploy

---

## Step 1: Add PostgreSQL Database (Railway)

1. Open: https://railway.com/project/f68652e9-45d6-4afa-99e2-50aba7027ef1
2. Click **+ New** → **Database** → **PostgreSQL**
3. Wait ~30 seconds for it to provision
4. Done — Railway auto-injects `DATABASE_URL`

---

## Step 2: Set Backend Environment Variables

In Railway dashboard, click on the `vortex-forklift-api` service → **Variables** tab:

```
NODE_ENV=production
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
ALLOWED_ORIGINS=https://material-solutions.vercel.app,https://vortex-forklift.vercel.app
```

Click **Redeploy** after setting variables.

---

## Step 3: Deploy Frontend (Vercel)

```bash
cd ~/Desktop/VVAxeOps/material-solutions-app/frontend
vercel login  # Browser OAuth
vercel --prod
```

When prompted:
- Link to existing project? **N** (create new)
- Project name: `material-solutions` or `vortex-forklift`
- Which directory? `.` (current)
- Modify settings? **N**

Then set environment variable:
```bash
vercel env add REACT_APP_API_URL production
# Enter: https://vortex-forklift-api-production.up.railway.app
```

Redeploy:
```bash
vercel --prod
```

---

## Step 4: Verify

- Backend health: https://vortex-forklift-api-production.up.railway.app/ping
- Frontend: https://material-solutions.vercel.app (or whatever domain Vercel assigns)

---

## Generated Secrets (for copy/paste)

Run this to generate JWT secrets:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

---

_Last updated: 2026-03-29 14:40 EDT by Axis_
