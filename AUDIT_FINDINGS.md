# Material Solutions - Code Audit Report

**Date:** 2026-03-28
**Scope:** Full-stack application audit (backend + frontend)
**Files Reviewed:** 33 source files across backend (server, routes, services, scripts, schema) and frontend (pages, components, configuration)

---

## 🔧 PATCH LOG

### 2026-03-28 07:12 EDT (Scan #4)

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| H1. Wide-open CORS | ✅ FIXED | Restricted CORS to `ALLOWED_ORIGINS` env var |
| H2. No rate limiting | ✅ FIXED | Added global (100/min) + strict (10/min for SMS/Vision/Drip) rate limiters |

**Files updated:**
- `backend/server.js` — CORS config + express-rate-limit middleware
- `backend/package.json` — added express-rate-limit dependency
- `backend/.env.example` — documented ALLOWED_ORIGINS + DATABASE_SSL

### 2026-03-28 06:00 EDT (Scan #3)

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| C7. Hardcoded localhost URLs | ✅ FIXED | Created `frontend/src/api.js` with env-configurable baseURL, updated all 5 files |

**Files updated:**
- Created `frontend/src/api.js` — centralized axios instance with `REACT_APP_API_URL`
- Created `frontend/.env.example` — documents the env var
- Updated `pages/Dashboard.js`, `pages/Leads.js`, `pages/Intake.js`, `pages/Inventory.js`, `components/LeadForm.js`

### 2026-03-28 05:00 EDT (Scan #2)

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| C5. HTML injection in emails | ✅ FIXED | Created `utils/html-escape.js`, escaped all user data in email.js + all 12 drip templates |

### 2026-03-28 04:10 EDT (Scan #1)

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| C1. SQL Injection (inventory PATCH) | ✅ FIXED | Added allowlist filter for column names |
| C2. SQL Injection (market-scraper) | ✅ FIXED | Parameterized query + input sanitization |
| C6. Broken drip import | ✅ FIXED | Added `sendEmail` export to email.js |
| C8. SSL cert validation disabled | ✅ FIXED | Set `rejectUnauthorized: true` in production |

**Also fixed in leads.js:** PATCH endpoint now uses allowlist (same fix as C1)

**Remaining CRITICAL issues (require design decisions):**
- C3. Zero authentication (needs auth strategy discussion)
- C4. Unauthenticated webhooks (needs signature verification implementation)

---

## Executive Summary

The Material Solutions application is a forklift inventory management and lead tracking system built with Express.js (backend) and React (frontend), using PostgreSQL for persistence and integrating with Twilio, OpenAI, GoHighLevel, and HubSpot.

**Overall Assessment: NOT PRODUCTION-READY** _(6 critical + 2 high issues fixed, 2 critical remain)_

The codebase has **critical security vulnerabilities** that must be resolved before any production deployment. The most severe issues are: ~~SQL injection vectors in multiple locations~~, zero authentication/authorization on all endpoints, ~~a broken drip email pipeline due to a bad import~~, and ~~HTML injection in email templates~~. There are also significant gaps in input validation, rate limiting, error handling, and accessibility.

| Severity | Count | Fixed |
|----------|-------|-------|
| CRITICAL | 8 | 6 |
| HIGH | 12 | 0 |
| MEDIUM | 14 | 0 |
| LOW | 16 | 0 |

---

## Critical Issues (Severity: CRITICAL)

### C1. SQL Injection via Dynamic Column Names in PATCH Endpoints

**Files:** `backend/routes/inventory.js:75-80`, `backend/routes/leads.js:94-99`

Both PATCH handlers build SQL SET clauses by interpolating user-controlled object keys directly into the query:

```js
const fields = Object.keys(updates);
const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
const result = await db.query(
  `UPDATE inventory SET ${setClause} WHERE id = $1 RETURNING *`,
  [id, ...values]
);
```

While values are parameterized, column names are injected directly. An attacker can send `{"id = 1; DROP TABLE inventory; --": "x"}` to execute arbitrary SQL.

**Fix:** Maintain an allowlist of valid column names and reject any key not in the list.

---

### C2. SQL Injection via String Interpolation in Market Scraper

**File:** `backend/services/market-scraper.js:232`

```js
WHERE scraped_at >= NOW() - INTERVAL '${daysBack} days'
```

The `daysBack` parameter is string-interpolated directly into SQL with an empty parameter array `[]`. While `parseInt` in the route provides partial protection, string interpolation in SQL is inherently unsafe.

**Fix:** Use parameterized query: `WHERE scraped_at >= NOW() - INTERVAL '1 day' * $1` with `[daysBack]`.

---

### C3. Zero Authentication or Authorization on All Endpoints

**File:** `backend/server.js:32-42`

Every API route is completely unauthenticated. No JWT, API key, session, or any access control exists. This means:
- Anyone can read/modify/delete all inventory (including purchase prices and floor prices)
- Anyone can read all leads with PII (names, emails, phones, companies)
- Anyone can send SMS messages and emails to leads via the API
- Anyone can trigger CRM syncs and cancel drip campaigns
- Anyone can view dashboard revenue and KPI data

This is the single most critical issue in the codebase.

---

### C4. Unauthenticated Webhook Endpoints

**File:** `backend/routes/crm.js:41-61`

GoHighLevel and HubSpot webhook endpoints accept any POST request without verifying HMAC signatures or shared secrets:

```js
router.post('/webhooks/gohighlevel', async (req, res, next) => {
  const result = handleGoHighLevelWebhook(req.body);
```

Anyone can spoof webhook events to manipulate lead data.

**Fix:** Verify `X-HubSpot-Signature` header and GoHighLevel HMAC signatures.

---

### C5. HTML Injection / Stored XSS in Email Templates

**Files:** `backend/services/email.js:22-38`, `backend/services/drip.js:90-260`

User-supplied data is interpolated directly into HTML email templates without sanitization:

```js
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
```

An attacker submitting a lead with `name: "<img src=x onerror=alert(1)>"` can inject HTML into emails viewed by staff. All 12 drip templates have the same vulnerability with `lead.name`.

**Fix:** HTML-encode all user-supplied values before template insertion.

---

### C6. Broken Import Renders Entire Drip System Non-Functional

**File:** `backend/services/drip.js:3`

```js
const { sendEmail } = require('./email');
```

`email.js` exports `sendNewLeadNotification`, `sendWelcomeEmail`, and `testEmailConfig` -- but NOT `sendEmail`. This means `sendEmail` is `undefined`, and every call in `processDripEmails()` throws `TypeError: sendEmail is not a function`. **The entire drip email pipeline is broken and will fail silently at runtime.**

**Fix:** Export a generic `sendEmail` function from `email.js`, or refactor drip.js to use the existing exports.

---

### C7. Hardcoded localhost URLs in Frontend (Cannot Deploy)

**Files:** All frontend API calls (`Dashboard.js:12`, `Leads.js:13-14`, `Intake.js:35,84`, `Inventory.js:16-17`, `LeadForm.js:39`)

Every API call uses hardcoded `http://localhost:3001`:

```js
const response = await axios.get('http://localhost:3001/api/dashboard/kpis');
```

The application cannot function in any deployed environment. Also uses plain HTTP, exposing all data in transit.

**Fix:** Create a shared axios instance with `baseURL` from `process.env.REACT_APP_API_URL`.

---

### C8. SSL Certificate Validation Disabled in Production

**File:** `backend/db.js:7`

```js
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

Setting `rejectUnauthorized: false` in production disables SSL certificate verification on the database connection, making it vulnerable to man-in-the-middle attacks.

**Fix:** Use `{ rejectUnauthorized: true }` with proper CA certificate configuration.

---

## High Priority (Severity: HIGH)

### H1. Wide-Open CORS Configuration

**File:** `backend/server.js:16`

```js
app.use(cors());
```

Allows requests from any origin. Any website can make API requests to this backend.

**Fix:** Restrict to known origins: `cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') })`.

---

### H2. No Rate Limiting on Any Endpoint

**File:** `backend/server.js`

No rate limiting exists anywhere. This enables:
- SMS/email flooding via `/api/sms/send` (incurring Twilio charges)
- Vision API abuse (draining OpenAI budget)
- Data scraping of all inventory and leads
- Brute-force and DoS attacks

**Fix:** Add `express-rate-limit` with strict limits on SMS, email, and vision endpoints.

---

### H3. No Input Validation on Any Endpoint

**Files:** `backend/routes/inventory.js:6-30`, `backend/routes/leads.js:10-43`

Neither POST endpoint validates required fields, data types, or value ranges:
- No email format validation
- No phone number format validation
- `year` accepts negative numbers; `condition_score` has no range check
- `status` and `source` accept arbitrary values
- No field length limits

Raw Postgres errors leak to clients when constraints are violated.

**Fix:** Use `zod` or `joi` for schema validation on all inputs.

---

### H4. Sensitive Financial Data Exposed Without Access Control

**Files:** `backend/routes/inventory.js:33-51`, `frontend/src/components/InventoryDetailModal.js:165-176`

`SELECT *` returns `purchase_price` and `floor_price` to any unauthenticated caller. Combined with zero auth, any visitor can see cost basis and minimum negotiable prices.

**Fix:** Separate internal/external views; exclude sensitive fields from public endpoints.

---

### H5. Sensitive Data Logged to Console

**Files:** `backend/services/sms.js:38`, `backend/services/drip.js:348`, `backend/services/crm.js:55,96,157,190,207`

PII (phone numbers, email addresses, names, full SMS content) is logged to stdout:

```js
console.log(`SMS sent to ${to}: ${message}`);
console.log(`Sent: ${email.subject} to ${email.name} (${email.email})`);
```

In production with log aggregation, this creates a compliance and privacy risk.

**Fix:** Redact PII from all log output; use structured logging with appropriate log levels.

---

### H6. No Phone Number Validation (SMS Toll Fraud Risk)

**File:** `backend/services/sms.js:14-43`

The `sendSMS` function accepts any string as the `to` parameter with zero validation. No E.164 format check, no premium-rate number blocking, no country code restriction. An attacker could supply premium-rate numbers to trigger toll fraud.

**Fix:** Validate phone numbers against E.164 format and restrict to allowed country codes.

---

### H7. Sensitive Error Messages Exposed in Production

**File:** `backend/server.js:50-56`

```js
res.status(err.status || 500).json({
  error: err.message || 'Something went wrong!',
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
```

`err.message` is always returned regardless of environment. Database connection strings and internal error details can leak to clients.

**Fix:** Return generic error messages in production; log full details server-side only.

---

### H8. No Error Boundary in Frontend

**File:** `frontend/src/App.js`

No React Error Boundary wraps the application. A single malformed API response or null property access crashes the entire UI with a white screen and no recovery.

**Fix:** Add error boundaries at the route level minimum.

---

### H9. Unsafe Property Access Leading to Runtime Crashes

**File:** `frontend/src/pages/Dashboard.js:43,77`

```js
const { inventory, leads } = kpiData;
// later:
${inventory.revenue_30d.toLocaleString()}
```

If the API returns unexpected data shapes, this throws TypeError and crashes the component (and the entire app, given H8).

**Fix:** Use optional chaining and provide fallback values.

---

### H10. No File Upload Size or Count Limits

**File:** `frontend/src/pages/Intake.js:57-66`

The dropzone accepts any number of files with no size limit:

```js
const { getRootProps, getInputProps } = useDropzone({
  onDrop, accept: { 'image/*': [] }, multiple: true
});
```

No `maxSize`, no `maxFiles`. Users can upload hundreds of arbitrarily large files.

---

### H11. No `helmet` Security Headers

**File:** `backend/server.js`

The server sets no security headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy). The `helmet` package is a standard Express security addition.

---

### H12. CAN-SPAM Non-Compliance in Drip Campaigns

**File:** `backend/services/drip.js`

Marketing emails ("Special Pricing", "Financing Options") contain no unsubscribe link, no physical mailing address, and no opt-out mechanism -- all required by the CAN-SPAM Act. `cancelDripCampaign` exists but there is no self-service unsubscribe endpoint for recipients.

---

## Medium Priority (Severity: MEDIUM)

### M1. SQL Operator Precedence Bug

**File:** `backend/routes/chat-old.js:16-20`

```sql
WHERE LOWER(model) LIKE '%reach%' OR LOWER(make) = 'raymond'
AND status = 'listed'
```

`AND` binds tighter than `OR`, so this returns ALL reach trucks regardless of status. Should be: `WHERE (LOWER(model) LIKE '%reach%' OR LOWER(make) = 'raymond') AND status = 'listed'`.

---

### M2. Chat Errors Swallowed with 200 Status

**File:** `backend/routes/chat.js:107-113`

Database errors and API failures return 200 OK with a friendly message. This hides server errors from monitoring systems and makes debugging impossible.

---

### M3. No Pagination on List Endpoints

**Files:** `backend/routes/inventory.js:37`, `backend/routes/leads.js:50`

Both return all records with no LIMIT or OFFSET. As data grows, these become expensive and return unbounded result sets.

---

### M4. `process.on('exit')` Handler Cannot Run Async Code

**File:** `backend/db.js:19-23`

The `'exit'` event handler calls `pool.end()` (async), but the exit handler runs synchronously. The Promise callbacks will never execute.

**Fix:** Use `SIGINT`/`SIGTERM` handlers instead.

---

### M5. Missing `.env.example` Entries

**File:** `backend/.env.example`

Missing entries for: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `COMPANY_PHONE`, `GHL_API_KEY`, `GHL_LOCATION_ID`, `HUBSPOT_API_KEY`.

---

### M6. HubSpot Webhook Handler Type Confusion Bug

**File:** `backend/services/crm.js:226-234`

Line 227 treats `webhookData` as an object (`.subscriptionType`), line 230 iterates it as an array (`for...of`). This will either log `undefined` or crash, depending on input shape.

---

### M7. Null Dereference in Drip Email Processing

**File:** `backend/services/drip.js:323-324`

```js
const campaign = campaigns[email.campaign_type];
const emailConfig = campaign[email.email_index]; // crashes if campaign is undefined
```

If `campaign_type` doesn't match any key, the next line throws TypeError.

---

### M8. Dynamic Tailwind Classes Won't Work in Production

**File:** `frontend/src/components/ListingTemplates.js:96`

```js
className={`bg-${template.color}-600 hover:bg-${template.color}-700`}
```

Tailwind purges dynamically constructed class names at build time. These buttons will have no background color in production.

**Fix:** Use a static mapping object.

---

### M9. No CSRF Protection

**Files:** All frontend POST requests

Plain axios POST requests with no CSRF tokens. Combined with open CORS (H1), this is exploitable via cross-site request forgery.

---

### M10. Stale Closure Bug in Photo Analysis

**File:** `frontend/src/pages/Intake.js:42-48`

```js
setFormData({ ...formData, make: make || formData.make, ... });
```

Captures `formData` from closure. If the user types while the vision API call is in flight, their changes are overwritten.

**Fix:** Use functional updater: `setFormData(prev => ({ ...prev, ... }))`.

---

### M11. No Request Timeouts on External HTTP Calls

**Files:** `backend/services/sms.js`, `backend/services/crm.js`

All `axios` calls to external APIs lack `timeout` options. A hanging API could block Node.js indefinitely.

---

### M12. No Retry Logic or Circuit Breakers

**Files:** All service files

Every external API call (SMTP, Twilio, GoHighLevel, HubSpot) is fire-once with no retry on transient failures. Drip emails are permanently marked `failed` on first failure.

---

### M13. Photos Only Send Filenames, Not Files

**File:** `frontend/src/pages/Intake.js:81`

```js
images: photos.map(p => p.name) // In production, upload to storage first
```

Inventory submission sends only filenames. The actual image data is lost.

---

### M14. `console.error` Calls in Production Frontend

**Files:** `Dashboard.js:16`, `Leads.js:19`, `Intake.js:52,98`, `Inventory.js:22`

Error details and stack traces leak in the browser console.

---

## Low Priority (Severity: LOW)

### L1. Deprecated `body-parser` Package

**File:** `backend/package.json`

`body-parser` is bundled with Express 4.16+. Use `express.json()` instead.

### L2. Redundant `dotenv.config()` Calls

**Files:** `backend/server.js:7`, `backend/db.js:2`

Both call `require('dotenv').config()`. Harmless but redundant.

### L3. Seed Script Deletes All Data Without Safety Check

**File:** `backend/scripts/seed.js:303`

`DELETE FROM inventory` runs with no environment check. Accidental production run destroys all data.

### L4. No Database Connection Pool Configuration

**File:** `backend/db.js:5-8`

Uses default pg Pool settings (max 10 connections, no timeouts). Production should explicitly configure pool size, idle timeout, connection timeout, and statement timeout.

### L5. Deprecated chat-old.js Still in Codebase

**File:** `backend/routes/chat-old.js`

Dead code that could be accidentally re-enabled. Contains bugs (M1, missing null check).

### L6. No Request Logging / Audit Trail

**File:** `backend/server.js`

No `morgan` or equivalent logging. Destructive operations leave no audit trail.

### L7. Inconsistent Error Response Formats

Some routes use `{ error: 'message' }`, others use `{ message: 'message' }`. Makes frontend error handling fragile.

### L8. Unvalidated `id` Parameters

All routes pass `req.params.id` to the database without format validation. Causes confusing Postgres type-cast errors on invalid input.

### L9. Fire-and-Forget Promise in Lead Creation

**File:** `backend/routes/leads.js:30-36`

`Promise.all([...])` without `await`. Edge-case unhandled rejections could crash Node.js.

### L10. No 404/Catch-All Route in Frontend

**File:** `frontend/src/App.js:29-34`

Invalid URLs render a blank page with no feedback.

### L11. Comprehensive Accessibility Failures

- No `<label>` elements on form inputs (Intake.js uses only placeholders)
- Modal lacks `role="dialog"`, `aria-modal`, focus trapping, and Escape key handling (InventoryDetailModal.js)
- No `aria-label` on navigation, filters, or tables
- Loading states not announced to screen readers (no `aria-live`)
- No skip navigation links

### L12. No Mobile Navigation

**File:** `frontend/src/App.js:10-21`

Horizontal flex nav with no responsive breakpoint handling. No hamburger menu.

### L13. Missing Error States in List Views

**Files:** `frontend/src/pages/Leads.js:18-21`, `frontend/src/pages/Inventory.js:21-24`

Failed fetches are logged to console only. Users see an empty table with no error indication.

### L14. LeadForm Component Is Dead Code

**File:** `frontend/src/components/LeadForm.js`

Defined but never imported or rendered anywhere.

### L15. Clipboard API Call Without Error Handling

**File:** `frontend/src/components/ListingTemplates.js:7-8`

`navigator.clipboard.writeText()` can reject (no HTTPS, permission denied). Rejection is unhandled.

### L16. No Testing Infrastructure

No test files exist. No testing libraries beyond default `react-scripts test`. No CI/CD pipeline detected.

---

## Recommendations

### Immediate (Before Any Deployment)

1. **Add authentication middleware** -- Implement JWT or session-based auth on all API routes. This is the #1 priority. (C3)
2. **Fix SQL injection vulnerabilities** -- Whitelist column names in PATCH endpoints; parameterize all queries. (C1, C2)
3. **Fix the broken drip import** -- Export `sendEmail` from `email.js` or refactor `drip.js`. (C6)
4. **Environment-based API URLs** -- Replace all hardcoded `localhost:3001` with `REACT_APP_API_URL`. (C7)
5. **Fix SSL validation** -- Use `rejectUnauthorized: true` with proper CA certs. (C8)
6. **Sanitize email template inputs** -- HTML-encode all user data before insertion. (C5)

### Short-Term (First Sprint)

7. **Add rate limiting** -- `express-rate-limit` globally, with strict limits on SMS/email/vision endpoints. (H2)
8. **Add input validation** -- Use `zod` or `joi` on all POST/PATCH endpoints. (H3)
9. **Restrict CORS** -- Allow only known frontend origins. (H1)
10. **Add `helmet` middleware** -- One-line addition for security headers. (H11)
11. **Add React Error Boundary** -- Prevent full-app crashes from component errors. (H8)
12. **Verify webhook signatures** -- Check HMAC on GoHighLevel and HubSpot webhooks. (C4)
13. **Add CAN-SPAM compliance** -- Unsubscribe links and physical address in all marketing emails. (H12)

### Medium-Term (Next 2-4 Weeks)

14. **Add pagination** to all list endpoints. (M3)
15. **Implement request logging** with `morgan` or equivalent. (L6)
16. **Add request timeouts** to all external HTTP calls. (M11)
17. **Implement retry logic** with exponential backoff for external APIs. (M12)
18. **Fix frontend accessibility** -- Add labels, ARIA attributes, focus management, keyboard navigation. (L11)
19. **Redact PII from logs.** (H5)
20. **Add comprehensive test suite** -- Unit and integration tests. (L16)

### Longer-Term

21. **Implement CSRF protection.** (M9)
22. **Add structured logging** with log levels and centralized collection.
23. **Implement audit trail** for destructive operations.
24. **Add mobile-responsive navigation.** (L12)
25. **Remove dead code** (`chat-old.js`, `LeadForm.js`). (L5, L14)

---

*This audit was performed via static analysis of all 33 source files. A dynamic penetration test and dependency vulnerability scan (`npm audit`) are recommended as follow-up activities.*
