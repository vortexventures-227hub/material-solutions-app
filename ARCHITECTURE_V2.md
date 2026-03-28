# Material Solutions — A+ Architecture Blueprint

**Created:** 2026-03-28 07:50 EDT  
**Author:** Axis  
**Purpose:** Complete spec for production-ready deployment with premium UX

---

## Executive Summary

This document defines every decision needed to take Material Solutions from 55% (functional MVP) to A+ (production-ready, premium-feeling, secure). Follow this sequentially — each phase builds on the previous.

**Total estimated work:** 8-10 hours of focused execution  
**Deployment target:** Railway (backend) + Vercel (frontend)  
**Auth model:** JWT with refresh tokens  
**Design language:** Professional industrial — clean, confident, efficient

---

## Phase 1: Security & Auth Foundation (2-3 hours)

### 1.1 Authentication Strategy

**Approach:** JWT access tokens (15 min) + HTTP-only refresh tokens (7 days)

**Why JWT over sessions:**
- Stateless scaling (no session store needed)
- Works with Railway/Vercel serverless
- Simple implementation with `jsonwebtoken`

**Schema addition:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'readonly')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**New files:**
- `backend/middleware/auth.js` — JWT verification middleware
- `backend/routes/auth.js` — login, logout, refresh, me
- `frontend/src/context/AuthContext.js` — React auth state
- `frontend/src/pages/Login.js` — login page

**Role-based access:**
| Role | Inventory | Leads | Pricing (floor/purchase) | Settings |
|------|-----------|-------|--------------------------|----------|
| admin | full CRUD | full CRUD | visible | full |
| staff | full CRUD | full CRUD | hidden | read |
| readonly | read | read | hidden | none |

**Implementation notes:**
- Password hashing: `bcrypt` with cost factor 12
- Access token in memory (React state)
- Refresh token in HTTP-only cookie
- CSRF protection via `csurf` middleware on state-changing endpoints
- All API routes require auth except `/api/auth/*` and `/api/leads POST` (public form)

### 1.2 Remaining Critical Fixes

| Issue | Fix | File |
|-------|-----|------|
| C4: Webhook signatures | Verify `X-HubSpot-Signature-v3` and GHL HMAC | `routes/crm.js` |
| C5: HTML injection | `he.encode()` all user data in email templates | `services/email.js`, `services/drip.js` |
| H1: CORS | Already configured, verify `ALLOWED_ORIGINS` env var set | `server.js` |
| H2: Rate limiting | Already added, verify limits are appropriate | `server.js` |
| H3: Input validation | Add `zod` schemas for all POST/PATCH bodies | all routes |
| H11: Helmet | `app.use(helmet())` | `server.js` |

### 1.3 Input Validation Schemas

```javascript
// backend/validation/schemas.js
const { z } = require('zod');

const inventorySchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  serial: z.string().max(50).optional(),
  hours: z.number().int().min(0).max(100000).optional(),
  capacity_lbs: z.number().int().min(0).max(50000).optional(),
  mast_type: z.string().max(50).optional(),
  lift_height_inches: z.number().int().min(0).max(600).optional(),
  power_type: z.enum(['electric', 'propane', 'diesel', 'gas']).optional(),
  battery_info: z.string().max(200).optional(),
  attachments: z.array(z.string()).optional(),
  condition_score: z.number().int().min(1).max(10).optional(),
  condition_notes: z.string().max(2000).optional(),
  purchase_price: z.number().min(0).max(500000).optional(),
  listing_price: z.number().min(0).max(500000).optional(),
  floor_price: z.number().min(0).max(500000).optional(),
  additional_context: z.string().max(5000).optional(),
});

const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  company: z.string().max(200).optional(),
  source: z.enum(['website', 'facebook', 'craigslist', 'referral', 'cold_outreach']).optional(),
  interest: z.array(z.string()).optional(),
  budget: z.number().min(0).max(1000000).optional(),
  timeline: z.string().max(100).optional(),
  is_decision_maker: z.boolean().optional(),
});
```

---

## Phase 2: Design System (1 hour setup, apply throughout)

### 2.1 Brand Identity

**Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-600` | `#1E3A5F` | Primary navy — headers, nav, CTAs |
| `brand-500` | `#2C5282` | Primary hover state |
| `brand-50` | `#EBF4FF` | Light backgrounds |
| `accent-500` | `#DD6B20` | Orange accent — success, highlights, prices |
| `accent-600` | `#C05621` | Accent hover |
| `surface` | `#FFFFFF` | Cards, modals |
| `background` | `#F7FAFC` | Page background |
| `text-primary` | `#1A202C` | Body text |
| `text-muted` | `#718096` | Secondary text |
| `success` | `#38A169` | Positive states |
| `warning` | `#D69E2E` | Caution states |
| `danger` | `#E53E3E` | Error states |

**Why this palette:**
- Navy conveys trust and professionalism (industrial equipment)
- Orange provides energy and urgency (sales, CTAs)
- High contrast for readability in warehouse lighting (phone screens)

### 2.2 Typography

```javascript
// tailwind.config.js additions
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  display: ['Inter', 'system-ui', 'sans-serif'], // Same but heavier weights
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
},
fontSize: {
  'display-lg': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
  'display-md': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
  'display-sm': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
  'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'body-md': ['1rem', { lineHeight: '1.5rem' }],
  'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'caption': ['0.75rem', { lineHeight: '1rem' }],
},
```

### 2.3 Component Patterns

**Card:**
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

**Button variants:**
```jsx
// Primary
<button className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 rounded-lg transition-colors">

// Secondary
<button className="bg-white border border-gray-300 hover:border-brand-500 text-gray-700 hover:text-brand-600 font-medium px-4 py-2 rounded-lg transition-colors">

// Accent (high priority CTA)
<button className="bg-accent-500 hover:bg-accent-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">

// Danger
<button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
```

**Badge:**
```jsx
// Status variants - use static classes for Tailwind purge
const statusClasses = {
  intake: 'bg-gray-100 text-gray-700 border-gray-200',
  listed: 'bg-green-50 text-green-700 border-green-200',
  reserved: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  sold: 'bg-blue-50 text-blue-700 border-blue-200',
};
<span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}>
```

**Toast notifications:**
Create `frontend/src/components/Toast.js` — slide in from top-right, auto-dismiss after 4s.

**Empty states:**
Every list page needs an empty state with icon + message + CTA.

**Loading states:**
- Skeleton loaders for cards (not just spinners)
- Disabled buttons with spinner during submission

### 2.4 Spacing Scale

Use Tailwind's default scale consistently:
- Component padding: `p-4` (mobile), `p-6` (desktop)
- Section gaps: `gap-6` (cards), `gap-8` (sections)
- Page max-width: `max-w-7xl mx-auto`

---

## Phase 3: Mobile-First Responsive (1.5 hours)

### 3.1 Breakpoint Strategy

| Breakpoint | Target | Notes |
|------------|--------|-------|
| Default | Mobile (portrait) | 320-479px — Bill's phone in warehouse |
| `sm:` | Mobile (landscape) | 480-639px |
| `md:` | Tablet | 640-1023px — iPad on desk |
| `lg:` | Desktop | 1024px+ — Office computer |

**Mobile-first rule:** All base styles are mobile. Add complexity at larger breakpoints.

### 3.2 Critical Mobile Fixes

**Navigation:**
- Current: horizontal nav pills
- Fix: Sticky bottom tab bar on mobile (`fixed bottom-0 left-0 right-0`)
- 4 tabs max (Dashboard, Intake, Inventory, Leads)
- Add menu icon for settings/logout

**Inventory grid:**
```jsx
// Single column on mobile, expand outward
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

**Forms:**
- Full-width inputs on mobile
- Large touch targets (min 44px height)
- Stack labels above inputs (not inline)

**Dashboard KPIs:**
- 2 columns on mobile (current has 3)
- Scrollable row of cards as alternative

**Inventory detail modal:**
- Full-screen on mobile (`fixed inset-0` not centered modal)
- Sticky header with close button
- Scrollable content area

### 3.3 Touch Optimizations

- All tap targets minimum 44x44px
- Swipe actions on inventory cards (swipe right = mark sold)
- Pull-to-refresh on list pages
- Bottom sheet for filters instead of dropdown

---

## Phase 4: UX Polish (2 hours)

### 4.1 Micro-Interactions

**Loading:**
- Page transition: fade in (already have `animate-fade-in`)
- Card hover: subtle lift (`hover:-translate-y-1`)
- Button press: scale down (`active:scale-95`)
- Form submit: button shows spinner, disables

**Feedback:**
- Toast on success: "Inventory saved" with checkmark
- Toast on error: red with retry action
- Inline validation: red border + message below field
- Optimistic updates: update UI immediately, rollback on error

### 4.2 Empty States

**Inventory (no items):**
```jsx
<div className="text-center py-16">
  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
    <span className="text-3xl">🚜</span>
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment yet</h3>
  <p className="text-gray-500 mb-6">Add your first forklift to get started.</p>
  <Link to="/intake" className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-medium">
    Add Equipment
  </Link>
</div>
```

**Leads (no leads):**
Same pattern with "No leads yet" + "Share your lead form" CTA.

### 4.3 Keyboard Navigation

- Tab order logical through forms
- Enter submits forms
- Escape closes modals
- Focus visible rings on all interactive elements

### 4.4 Error Boundaries

```jsx
// frontend/src/components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <div className="text-5xl mb-4">😵</div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-4">We're on it. Try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="bg-brand-600 text-white px-4 py-2 rounded-lg">
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap `<App>` in `<ErrorBoundary>` in index.js.

---

## Phase 5: Deployment (1.5 hours)

### 5.1 Backend → Railway

**Why Railway:**
- Persistent PostgreSQL included
- Automatic SSL
- Environment variable management
- $5/month base, scales with usage
- Simple GitHub deploy

**Setup:**
1. Create Railway project
2. Add PostgreSQL addon
3. Connect GitHub repo (`material-solutions-app/backend`)
4. Set environment variables:
   - `DATABASE_URL` (auto-set by Railway)
   - `NODE_ENV=production`
   - `JWT_SECRET` (generate 64-char random)
   - `JWT_REFRESH_SECRET` (generate 64-char random)
   - `ALLOWED_ORIGINS=https://materialsolutions.vercel.app`
   - All API keys (OpenAI, Twilio, etc.)
5. Add custom domain later if desired

**Railway config (`railway.toml`):**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node server.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
```

### 5.2 Frontend → Vercel

**Why Vercel:**
- Instant deploys
- Edge network
- Free tier sufficient
- Built for React

**Setup:**
1. Connect GitHub repo (`material-solutions-app/frontend`)
2. Set environment variable:
   - `REACT_APP_API_URL=https://material-solutions-backend.up.railway.app`
3. Deploy
4. Add custom domain later

**Build settings:**
- Framework: Create React App
- Build command: `npm run build`
- Output directory: `build`

### 5.3 Domain Configuration (Future)

When ready:
- `app.materialsolutionsnj.com` → Vercel frontend
- `api.materialsolutionsnj.com` → Railway backend (or use Railway subdomain)

---

## Phase 6: Quality Checklist

### Before Deploy

**Security:**
- [ ] All routes require auth except public lead form
- [ ] JWT secrets are strong random strings (not in code)
- [ ] `helmet` middleware enabled
- [ ] Rate limiting on all expensive endpoints
- [ ] Input validation on all POST/PATCH
- [ ] HTML encoding on all email templates
- [ ] Webhook signatures verified

**UX:**
- [ ] All pages have loading states
- [ ] All lists have empty states
- [ ] All forms have validation feedback
- [ ] All modals close with ESC and outside click
- [ ] Error boundary catches crashes
- [ ] Toast notifications for actions

**Mobile:**
- [ ] All pages tested at 375px width
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Forms are usable with keyboard

**Accessibility:**
- [ ] All images have alt text
- [ ] Focus rings visible
- [ ] Color contrast ≥ 4.5:1
- [ ] Form labels associated with inputs

---

## Execution Order

| Order | Task | Time | Blocker |
|-------|------|------|---------|
| 1 | Add `helmet`, verify rate limiting | 15 min | None |
| 2 | Add zod validation to inventory/leads routes | 30 min | None |
| 3 | HTML encode email templates | 20 min | None |
| 4 | Create auth schema + routes | 1 hr | None |
| 5 | Create Login page + AuthContext | 45 min | #4 |
| 6 | Wire auth middleware to all routes | 30 min | #4 |
| 7 | Update Tailwind config with design tokens | 15 min | None |
| 8 | Create Toast component | 20 min | None |
| 9 | Create ErrorBoundary | 15 min | None |
| 10 | Update Navigation for mobile | 30 min | None |
| 11 | Add empty states to all pages | 20 min | None |
| 12 | Make all grids responsive | 30 min | None |
| 13 | Full-screen mobile modal | 20 min | None |
| 14 | Deploy backend to Railway | 30 min | #1-6 |
| 15 | Deploy frontend to Vercel | 15 min | #14 |
| 16 | E2E smoke test | 30 min | #14, #15 |

**Total:** ~8.5 hours

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 85 |
| Lighthouse Accessibility | ≥ 90 |
| Time to First Contentful Paint | < 1.5s |
| All routes authenticated | ✓ |
| Mobile usability | ✓ |
| Zero critical/high security issues | ✓ |

---

## Appendix: File Tree After Phase 6

```
material-solutions-app/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # NEW: JWT verification
│   ├── routes/
│   │   ├── auth.js              # NEW: login/logout/refresh
│   │   ├── inventory.js
│   │   ├── leads.js
│   │   └── ...
│   ├── validation/
│   │   └── schemas.js           # NEW: zod schemas
│   ├── services/
│   │   ├── email.js             # Updated: HTML encoding
│   │   └── ...
│   ├── db.js
│   ├── server.js                # Updated: helmet, auth middleware
│   ├── schema.sql               # Updated: users, refresh_tokens
│   └── railway.toml             # NEW
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.js # NEW
│   │   │   ├── Toast.js         # NEW
│   │   │   ├── Navigation.js    # Updated: mobile
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.js   # NEW
│   │   ├── pages/
│   │   │   ├── Login.js         # NEW
│   │   │   └── ...
│   │   └── ...
│   └── tailwind.config.js       # Updated: design tokens
│
├── ARCHITECTURE_V2.md           # This file
├── AUDIT_FINDINGS.md
└── ...
```

---

**Ready for execution.** Each task is atomic — can be delegated to Cipher or done in focused chunks.
