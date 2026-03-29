# Phase 6A Fixes - User Feedback

**Date:** 2026-03-29 19:00 EDT  
**Feedback from:** Chris  

---

## Issues to Fix

### 1. Top Left Branding (Navigation)
**Current state:** Text too small, "A Vortex Ventures Product" wrapping incorrectly, MS logo pill-shaped

**Required:**
- Increase font size for "Material Solutions Forklift Sales Machine"
- "A Vortex Ventures Product" must be on one line
- "A Vortex Ventures Product" font smaller than main text (but both larger than current)
- MS logo: change from pill shape to box/square
- Entire top toolbar can be larger overall

**File:** `frontend/src/components/Navigation.js`

### 2. Dashboard Welcome Message
**Current state:** Says "Welcome Back Admin"

**Required:** "Welcome Back Chris. Here's your sales overview."
- Extract first name from logged-in user (`user.name` or `user.firstName`)
- If user is "admin@test.com", hardcode "Chris" for now
- Future: properly set user's first name in database

**File:** `frontend/src/components/Dashboard.js`

### 3. Publish Button Missing
**Current state:** Not visible in any tab

**Expected location:** Inventory detail modal (when clicking an item)

**Investigate:**
- Is `PublishModal.js` component imported?
- Is button rendering but hidden (CSS issue)?
- Is button only showing for certain item statuses?
- Check console for React errors

**Files:**
- `frontend/src/components/InventoryDetailModal.js`
- `frontend/src/components/PublishModal.js`

### 4. Pipeline Page Error
**Current state:** Clicking Pipeline tab shows "Something went wrong - unexpected error occurred"

**Investigate:**
- Check React error boundaries
- Look for missing imports or undefined variables
- Verify API endpoint exists (if Pipeline fetches data)
- Check browser console for JavaScript errors

**File:** `frontend/src/pages/Pipeline.js`

### 5. David Tab Missing
**Current state:** No David tab in navigation

**Expected:** David tab should appear after Leads tab

**Status:** Was in Phase 6B spec, not yet implemented

**Action:** Note for Phase 6B implementation (not blocking Phase 6A)

**File:** `frontend/src/components/Navigation.js`

### 6. Background Video (Not Implemented)
**Current state:** No video

**Required:**
- Warehouse forklift operations loop
- Low opacity overlay (20-30%)
- Subtle motion, not distracting
- Fallback to static gradient if video fails

**Implementation:**
- Find or generate warehouse forklift video (stock footage or AI-generated)
- Add to `frontend/public/` or host on CDN
- Update `Layout.js` to include video background
- CSS: `position: fixed`, `z-index: -1`, `opacity: 0.3`

**Files:**
- `frontend/src/components/Layout.js`
- `frontend/src/index.css`

---

## Priority Order

1. **Critical:**
   - Dashboard welcome message (easy fix)
   - Publish button visibility (blocks core functionality)
   - Pipeline page error (breaks navigation)

2. **Important:**
   - Top branding size/layout (visual polish)

3. **Nice to have:**
   - Background video (enhancement, not blocking)

---

## Testing Checklist

After fixes:
- [ ] Top branding larger and properly formatted
- [ ] MS logo is box-shaped
- [ ] Dashboard says "Welcome Back Chris. Here's your sales overview."
- [ ] Publish button visible in inventory detail modal
- [ ] Clicking Publish button opens modal and works
- [ ] Pipeline page loads without error
- [ ] Pipeline page shows inventory stages
- [ ] Background video plays (if implemented)

---

## Notes

- Publish button was built in commit `015549b` (marketplace automation)
- Pipeline page was started in commit `f7edc72` (Phase 6A)
- Background video was marked "Nice to Have (Phase 6C)" in spec
