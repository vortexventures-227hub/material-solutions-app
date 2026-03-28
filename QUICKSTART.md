# Material Solutions — Quick Start

## First Time Setup

### Backend

```bash
cd ~/Desktop/VVAxeOps/material-solutions-app/backend

# Install dependencies
npm install

# Create database and run schema
node setup-db.js

# Start server
npm start
# Server runs on http://localhost:3001
```

### Frontend

```bash
cd ~/Desktop/VVAxeOps/material-solutions-app/frontend

# Install dependencies
npm install

# Start dev server
npm start
# App runs on http://localhost:3000
```

---

## Test Login

**Email:** `admin@test.com`  
**Password:** `password123`

---

## Environment Variables

Backend `.env` is already configured with:
- Database connection
- JWT secrets (auto-generated)
- CORS allowed origins

Frontend uses default `REACT_APP_API_URL=http://localhost:3001`

---

## Quick Tests

### Health Check
```bash
curl http://localhost:3001/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Create Inventory (with token)
```bash
TOKEN="<paste-token-from-login>"
curl -X POST http://localhost:3001/api/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"7FBE15","year":2019}'
```

---

## Architecture

- **Auth:** JWT (15min access token) + HTTP-only refresh cookie (7 days)
- **Validation:** Zod schemas on all inputs
- **Security:** Helmet headers, rate limiting, CORS restrictions
- **Database:** PostgreSQL with uuid-ossp extension

---

## Phase 1 Status: ✅ COMPLETE

See `PHASE1_COMPLETE.md` for full details.

**Next:** Phase 2 — Design System
