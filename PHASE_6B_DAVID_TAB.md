# Phase 6B: David Tab Implementation

## Objective
Add a "David" navigation tab to the Vortex Forklift Sales Machine that provides AI sales agent insights and conversation tracking.

## Requirements

### 1. Navigation Tab
- Add "David" tab to sidebar navigation (between "Leads" and "Services")
- Icon: 🤖 or similar AI/agent icon
- Active state styling consistent with other tabs

### 2. David Dashboard Page
Create new page: `frontend/src/pages/David.js`

**Key Features:**
- **Conversation Log** — Recent David interactions with leads
- **Active Conversations** — Currently ongoing chats
- **Lead Handoffs** — Leads David has qualified and passed to human sales
- **Performance Metrics:**
  - Total conversations
  - Qualified leads
  - Conversion rate
  - Response time average

### 3. Data Structure
Backend API endpoints needed:
- `GET /api/david/conversations` — List recent conversations
- `GET /api/david/conversations/:id` — Full conversation transcript
- `GET /api/david/metrics` — Performance stats
- `GET /api/david/handoffs` — Leads ready for human followup

### 4. UI Components

**Conversation Card:**
```
[Avatar] Lead Name
        Last message preview...
        2 hours ago | Status: Active
```

**Metrics Dashboard:**
```
Total Conversations: 47
Qualified Leads: 12
Avg Response Time: 45s
Conversion Rate: 25.5%
```

**Handoff Queue:**
```
[!] High Priority Lead
    John Doe - Acme Logistics
    Looking for: 3x reach trucks
    Budget: $50k
    [View Conversation] [Call Now]
```

### 5. Integration Points
- Link to existing Leads table (mark David-generated leads)
- Connect to David's Telegram group data (if available)
- Show David's conversation history with each lead in Lead detail view

### 6. Design Notes
- Use Vortex neon theme (cyan/electric blue accents)
- Consistent with existing Dashboard/Pipeline styling
- Dark mode support
- Mobile responsive

## Data Source
If David conversation data is not yet in backend:
1. Create placeholder/mock data structure
2. Document API contract for future integration
3. Show sample conversations to demonstrate UI

## Success Criteria
- David tab loads without errors
- Conversation log displays (mock or real data)
- Metrics render correctly
- Handoff queue is actionable
- Styling matches Vortex theme

---

**Assignee:** Cipher  
**Priority:** Phase 6B (after 6A deployment verified)  
**Estimated time:** 2-3 hours
