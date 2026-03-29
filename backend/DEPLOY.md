# Material Solutions — Backend Deployment Guide

**Railway** | PostgreSQL | Node.js

---

## Pre-Flight Checklist

| Item | Status | Notes |
|------|--------|-------|
| Helmet middleware | ✅ | `server.js` line 18 — `app.use(helmet())` |
| Rate limiting | ✅ | Global: 100/min, Strict: 10/min on expensive ops |
| Input validation (POST/PATCH) | ✅ | Zod schemas in `validation/schemas.js` |
| JWT secrets strong | ✅ | 64-char hex, stored in env, never in code |
| Health endpoint | ✅ | `GET /health` — DB ping + uptime |
| Database schema | ✅ | `schema.sql` + `setup-db.js` |

---

## Step 1 — Railway Project Setup

### 1.1 Create Railway Account & Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project (from backend directory)
cd ~/Desktop/VVAxeOps/material-solutions-app/backend
railway init
# Select: "Empty Project" → give it a name like "material-solutions-api"
```

### 1.2 Add PostgreSQL Addon

```bash
# Add PostgreSQL to the project
railway add
# Select: PostgreSQL
```

Railway will auto-set `DATABASE_URL` in your environment variables.

### 1.3 Connect GitHub (Optional — or deploy via CLI)

```bash
# Link to GitHub repo for automatic deployments
railway connect github
# Select the repo: vortexventures/material-solutions-app
# Branch: main
# Root directory: backend/
```

---

## Step 2 — Set Environment Variables

In the **Railway Dashboard** → your project → **Variables**, add:

```
NODE_ENV=production
ALLOWED_ORIGINS=https://material-solutions.vercel.app
JWT_SECRET=<generate below>
JWT_REFRESH_SECRET=<generate below>
```

**Generate JWT secrets locally (Mac/Linux):**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

**Or use these as one-liners:**
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Optional — only set if using these services:**
```
OPENAI_API_KEY=<your-key>
GEMINI_API_KEY=<your-key>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-gmail>
EMAIL_PASS=<your-app-password>
COMPANY_EMAIL=notifications@materialsolutions.com
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>
HUNTER_API_KEY=<your-key>
GOHIGHLEVEL_API_KEY=<your-key>
GOHIGHLEVEL_LOCATION_ID=<your-location>
HUBSPOT_API_KEY=<your-key>
GOOGLE_PLACES_API_KEY=<your-key>
```

> **Note:** `DATABASE_URL` is auto-set by Railway when you add the PostgreSQL addon. Do NOT set it manually unless using an external DB.

---

## Step 3 — Deploy

### Option A: CLI Deploy (Fastest)
```bash
cd ~/Desktop/VVAxeOps/material-solutions-app/backend
railway up
```

### Option B: GitHub Auto-Deploy
Push to your linked branch and Railway deploys automatically:
```bash
git add .
git commit -m "deploy: backend to Railway"
git push origin main
```

Watch the deployment:
```bash
railway status
railway logs
```

---

## Step 4 — Verify Deployment

### Health Check
```bash
curl https://<your-railway-url>.up.railway.app/health
```
**Expected response:**
```json
{"status":"ok","timestamp":"2026-03-29T...","uptime":123.45,"database":"connected"}
```

### Smoke Test — Auth Flow
```bash
# Register a user
curl -X POST https://<your-railway-url.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@materialsolutions.com","password":"StrongPass123!","name":"Admin"}'

# Login
curl -X POST https://<your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@materialsolutions.com","password":"StrongPass123!"}'

# Should return: access token + user object
```

### Protected Route Test
```bash
curl https://<your-railway-url.up.railway.app/api/inventory \
  -H "Authorization: Bearer <your-token>"
# Should return: [] (empty array, no inventory yet)
```

---

## Step 5 — Initialize the Database

Once deployed, run the schema setup:
```bash
# Method 1: Via Railway CLI (exec into the container)
railway run node setup-db.js

# Method 2: Connect a local Postgres client to Railway's DB
# Get the connection string from Railway dashboard → PostgreSQL → Connection
psql "<DATABASE_URL>"
# Then run:
# \i schema.sql
# \i setup-db.js (if it works)
```

The `setup-db.js` script creates:
- All tables (`inventory`, `leads`, `drip_emails`, `market_comps`, `users`, `refresh_tokens`)
- All indexes
- Test user: `admin@test.com` / `password123`

---

## Step 6 — Vercel Frontend Deployment

Once the backend is live, set the API URL for the frontend:

```bash
# In the frontend directory
cd ~/Desktop/VVAxeOps/material-solutions-app/frontend
```

In **Vercel Dashboard** → your frontend project → **Environment Variables**:
```
REACT_APP_API_URL=https://<your-railway-url.up.railway.app
```

Then redeploy or push a commit to trigger Vercel.

---

## Railway Configuration File

The `railway.toml` in this directory is pre-configured:

```toml
[build]
builder = "NIXPACKS"          # Auto-detects Node.js

[deploy]
startCommand = "node server.js" # Starts the Express server
healthcheckPath = "/health"    # Railway pings this to confirm liveness
healthcheckTimeout = 300        # 5 min timeout for cold starts
```

---

## Troubleshooting

### Deploy Failed
```bash
railway logs --tail 100
```
Common causes: missing env vars, syntax errors, wrong Node version.

### Database Connection Error
- Verify `DATABASE_URL` is set in Railway Variables (auto-set by PostgreSQL addon)
- Check the PostgreSQL addon is active (Railway Dashboard → Plugins)

### CORS Errors After Deploy
- Verify `ALLOWED_ORIGINS` includes your exact Vercel frontend URL
- Must include `https://` protocol
- For multiple origins, comma-separate them

### Auth Not Working
- `JWT_SECRET` and `JWT_REFRESH_SECRET` must be set
- Both must be 64-character hex strings
- Generate fresh ones if unsure: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Production URLs (Update When Available)

| Service | URL |
|---------|-----|
| **Backend (Railway)** | `https://material-solutions-api.up.railway.app` |
| **Frontend (Vercel)** | `https://material-solutions.vercel.app` |
| **Health Endpoint** | `https://material-solutions-api.up.railway.app/health` |
| **Public Lead Form** | `https://material-solutions-api.up.railway.app/api/leads` (POST) |

---

## Rollback

```bash
# List recent deployments
railway deployments

# Rollback to a previous deployment
railway rollback <deployment-id>
```
