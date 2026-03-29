# Phase 6: UI Enhancements + Pipeline Feature

## Color Scheme Overhaul

**From:** Blue/gray industrial
**To:** Vortex Ventures neon theme (cool blue/purple/green)

**Reference colors:**
- Cool blue: `#00D4FF` (cyan)
- Purple: `#8B5CF6` (violet)
- Neon green: `#10B981` (emerald)
- Background: Dark (`#0F172A` slate-900)
- Accent: Neon yellow `#FDE047`

**Button hover effects:**
- Zoom (scale 1.05-1.1)
- 3D lift effect (translateY + shadow)
- Neon glow border

## Background Video
- Warehouse forklift operations loop
- Low opacity overlay (20-30%)
- Subtle motion, not distracting
- Fallback to static gradient if video fails

## Navigation Updates

### Top Left: Branding
- **Line 1:** "Material Solutions Forklift Sales Machine"
- **Line 2:** "A Vortex Ventures Product" (smaller, subdued)

### Top Right: Email Actions
- **Default button:** "Email Bill"
- **Toggle options:**
  - Email Bill
  - Email Chris
  - Email Both
- **Persistence:** Save toggle preference to user settings (database)
- Chris's email: `chris@vortexventures.com` (confirm with Chris)

### New Tabs
**Pipeline:**
- Add "Pipeline" to main navigation (after Inventory)
- Icon: flow/workflow symbol

**David:**
- Add "David" to main navigation (after Leads)
- Icon: user/avatar symbol

## Dashboard Updates

### Welcome Message
- **Above stats cards:** "Welcome back, Chris! Here's your sales overview."
- Personalized with logged-in user's name
- Optional: "Pipeline" quick-link button (if makes sense for layout)

## Pipeline Feature (New Page)

### Page Layout
**Top bar (filters):**
- Search box (top right): Search by inventory ID, vendor name, lead name, keywords
- Dropdown (next to search): "All Inventory" → select specific item

**Main area:**
- Visual pipeline diagram showing stages:
  1. **Intake** → uploaded to system
  2. **Listed** → published to marketplaces
  3. **Leads** → inquiries received
  4. **Qualified** → David conversation completed
  5. **Closed** → sold

**Per-item pipeline view:**
- Click any inventory in dropdown → shows that item's journey
- Each stage: status indicator (complete/in-progress/pending)
- **Leads section:** Show contact cards for leads tied to this inventory
  - Name, company, phone, email
  - Last contact date
  - Conversation summary (from David logs if available)

**All-inventory overview:**
- Default view: all items grouped by pipeline stage
- Drag/move items between stages (optional future enhancement)
- Color-coded status (green = complete, yellow = in-progress, gray = pending)

### Data Sources
- **Inventory:** `inventory` table
- **Listings:** `marketplace_listings` table (shows "Listed" stage)
- **Leads:** `leads` table (filter by `inventory_id` if exists, else match by keywords)
- **Conversations:** David call logs (future integration)

## Publish Button Fix

**Location:** Inventory detail modal (when clicking an item from inventory list)
**Component:** `InventoryDetailModal.js` → "Publish to Marketplaces" button
**Issue to check:**
- Is button rendering but hidden?
- Does it only show for certain statuses?
- Missing from build?

**Expected behavior:**
- Button visible for all inventory items not yet published
- Disabled with "Already Published" if `marketplace_listings` has entries for this item

## David Interface Page (Phase 6B)

### Layout
**Right half:** David avatar
- Static professional headshot
- Subtle pulse/glow effect when "speaking"
- Future: Animated lip-sync (HeyGen/D-ID)

**Left half:** Conversation list
- Scrollable list of past calls
- Each entry shows:
  - Lead name
  - Date/time
  - Inventory item discussed
  - Outcome badge (interested/callback/not-interested)
  - Duration

### Conversation View
**On click:**
- AI-generated summary displays
- David "reads" summary aloud (OpenAI TTS)
- Full transcript expandable below
- "Ask David" chat box at bottom

### Chat Interaction
- User types question: "Did he mention financing?"
- David responds (GPT + conversation context)
- Future: TTS audio responses

### Data Integration
**Backend requirements:**
- `conversations` table:
  ```sql
  CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    lead_id UUID REFERENCES leads(id),
    inventory_id UUID REFERENCES inventory(id),
    call_date TIMESTAMP,
    transcript TEXT,
    summary TEXT,
    outcome VARCHAR(50),
    duration INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- API endpoint: `GET /api/conversations` (list)
- API endpoint: `GET /api/conversations/:id` (detail)
- API endpoint: `POST /api/conversations/:id/ask` (chat with David)

**Vocode integration (if available):**
- Fetch call history from Vocode API
- Webhook to log new calls to our database

## Implementation Priority

### Must Have (Phase 6A)
1. Color scheme change (Vortex neon theme)
2. Button hover effects (zoom + 3D + glow)
3. Navigation updates (branding + email toggle)
4. Dashboard welcome message
5. Publish button investigation + fix

### Should Have (Phase 6B)
1. Pipeline page (basic view)
2. Search + dropdown filters
3. Lead contact cards in pipeline
4. David page (MVP):
   - Static avatar + glow
   - Conversation list
   - Text summaries
   - Basic chat (no audio yet)

### Nice to Have (Phase 6C)
1. Background warehouse video
2. Drag-and-drop pipeline stages
3. David TTS audio responses
4. Animated David avatar
5. Recorded call audio playback

## Design Guidance

**Use Google Stitch to generate:**
1. Color scheme mockups (3-5 variants)
2. Button hover state examples
3. Pipeline page layout options

**Then implement winner in code.**

## Files to Modify

**Frontend:**
- `src/index.css` — color variables, button styles
- `src/components/Navigation.js` — branding text, email toggle
- `src/components/Dashboard.js` — welcome message
- `src/components/InventoryDetailModal.js` — publish button visibility
- `src/pages/Pipeline.js` — NEW (pipeline feature)
- `src/App.js` — add Pipeline route

**Backend:**
- `backend/routes/user.js` — add endpoint for email preference toggle
- `backend/schema.sql` — add `email_preference` column to users table

## Success Metrics
- Color scheme matches Vortex Ventures branding
- Button interactions feel premium (not amateur)
- Pipeline page loads in < 2 seconds
- Email toggle persists across sessions
- Publish button works on first inventory test

---

**Delegation target:** Cipher (Claude Code)
**Estimated time:** 2-3 hours (Phase 6A), 4-6 hours (Phase 6A+B)
**Deploy:** After each phase completes
