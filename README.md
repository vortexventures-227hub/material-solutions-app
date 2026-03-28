# Material Solutions - Forklift Sales Automation

Full-stack app for automating forklift sales pipeline: intake → listing → lead management → dashboard.

## 🎉 Status: Phase 5 Complete (March 27, 2026)

**All MVP + Advanced Features Built:**
- ✅ MVP Backend & Frontend (Phase 1)
- ✅ Vision AI + Pricing + David AI + Listing Templates (Phase 2)
- ✅ Email Integration (Phase 3)
- ✅ Database Seeding + Lead Form + Detail Modal (Phase 4)
- ✅ Drip Campaigns + SMS + Market Scraping + CRM Integration (Phase 5)

**App is now enterprise-ready with full automation!**

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- REST API

**Frontend:**
- React
- Tailwind CSS
- Axios
- React Router
- React Dropzone

---

## Setup Instructions

### 1. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb material_solutions

# Run schema
psql material_solutions < backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your DATABASE_URL:
# DATABASE_URL=postgresql://localhost:5432/material_solutions

# Start backend server
npm run dev
# Server will run on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
# App will open on http://localhost:3000
```

---

## Features (MVP)

### ✅ Intake Panel
- Drag-and-drop photo upload
- Form with all forklift specs
- Submits to backend API

### ✅ Dashboard
- Total inventory count
- Listed items count
- Leads this week
- Conversion rate
- 30-day revenue

### ✅ Inventory List
- View all inventory
- Filter by status (intake, listed, reserved, pending, sold)
- Display key specs and pricing

### ✅ Leads List
- View all leads
- Filter by status
- Lead scoring with color coding
- Contact info display

### ✅ Backend API
- CRUD endpoints for inventory
- CRUD endpoints for leads
- Dashboard KPIs endpoint
- Simple David AI chat (keyword matching for MVP)

---

## API Endpoints

### Inventory
- `POST /api/inventory` - Create inventory
- `GET /api/inventory` - List all (optional ?status filter)
- `GET /api/inventory/:id` - Get single
- `PATCH /api/inventory/:id` - Update
- `DELETE /api/inventory/:id` - Delete

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - List all (optional ?status, ?minScore filters)
- `GET /api/leads/:id` - Get single
- `PATCH /api/leads/:id` - Update
- `POST /api/leads/:id/interaction` - Add interaction

### Chat (David AI)
- `POST /api/chat/message` - Send message, get AI response
- `GET /api/chat/history/:leadId` - Get chat history

### Dashboard
- `GET /api/dashboard/kpis` - Get KPI summary
- `GET /api/dashboard/pipeline` - Get pipeline counts

---

## Completed Features

### Phase 1: MVP (✅ Complete)
- [x] Backend API (inventory, leads, dashboard)
- [x] PostgreSQL database with full schema
- [x] Frontend React app with routing
- [x] Dashboard with KPI cards
- [x] Intake form with drag-drop photo upload
- [x] Inventory list with status filters
- [x] Leads table with scoring

### Phase 2: Advanced Features (✅ Complete)
- [x] Vision AI integration (GPT-4V) for photo analysis
- [x] Pricing logic (Lens) with formula-based calculations
- [x] Advanced David AI with intent classification
- [x] Listing templates (Facebook, Craigslist, LinkedIn)

### Phase 3: Email Integration (✅ Complete)
- [x] Email automation (Nodemailer)
- [x] New lead notifications to company
- [x] Welcome emails to leads
- [x] HTML email templates

### Phase 4: Final Polish (✅ Complete)
- [x] Database seeding script (15 realistic forklift records)
- [x] Lead capture form component
- [x] Inventory detail modal with full specs

### Phase 5: Advanced Automation (✅ Complete)
- [x] Drip email campaigns (3 campaign types: welcome, nurture, re-engagement)
- [x] SMS automation via Twilio (notifications, follow-ups, reminders)
- [x] Market comp scraping (Craigslist + Facebook Marketplace)
- [x] CRM integration (GoHighLevel + HubSpot with webhook support)

## Future Enhancements (Backlog)

### Integration Opportunities
- [ ] Market comp scraper for real-time pricing data
- [ ] Multi-platform auto-posting APIs (Facebook, Craigslist)
- [ ] SMS automation (Twilio)
- [ ] Calendly integration for scheduling
- [ ] CRM integration (GoHighLevel or HubSpot)
- [ ] Drip email campaigns

### Frontend Enhancements
- [ ] Real-time WebSocket updates
- [ ] Charts and graphs on dashboard
- [ ] Advanced search and filtering
- [ ] User authentication
- [ ] Mobile app (React Native)

### Backend Enhancements
- [ ] File upload to S3/storage
- [ ] Background job processing (Bull/Redis)
- [ ] Webhook support
- [ ] Rate limiting
- [ ] Advanced logging and monitoring

---

## Architecture

```
USER → Intake Form (drag-drop photos)
    ↓
GATE validates & creates record
    ↓
LENS (future: pricing automation)
    ↓
BLAST (future: multi-platform posting)
    ↓
DAVID handles inquiries
    ↓
DRIP nurtures leads
    ↓
FOREMAN monitors dashboard
```

---

## Built With

- **Minimax M2.7** (code generation via OpenRouter)
- **Claude Opus 4.5** (architecture & orchestration)
- Designed by Axis for Vortex Ventures

---

## License

Private - Vortex Ventures © 2026
