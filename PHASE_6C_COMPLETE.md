# Phase 6C: Marketplace Automation — Backend Core Complete

**Project:** Vortex Forklift Sales Machine  
**Status:** Backend Core Implemented ✅  
**Date:** 2026-03-29

---

## Overview

Phase 6C builds the backend infrastructure for automated marketplace publishing. The system generates AI content once and distributes to multiple platforms simultaneously.

---

## Database Schema (`migrations/006_marketplace.sql`)

### Tables Created

| Table | Purpose |
|-------|---------|
| `marketplace_configs` | Platform credentials & settings |
| `inventory_listings` | Per-platform listings for each inventory item |
| `publish_jobs` | Job queue with progress tracking |
| `email_campaigns` | Lead nurture sequences |
| `inventory_seo` | AEO/SEO content (schema, FAQ, meta) |
| `platform_templates` | Custom platform templates |

### Indexes

- `idx_marketplace_configs_active` - Active platforms lookup
- `idx_listings_inventory` - Inventory listings lookup
- `idx_listings_platform` - Platform queries
- `idx_listings_status` - Status filtering
- `idx_jobs_status` - Job queue management
- `idx_campaigns_scheduled` - Email queue

---

## Core Services

### Orchestrator (`services/marketplace/orchestrator.js`)

Main publish workflow controller:
- Initializes platform handlers
- Creates job records
- Generates AI content (single call for all platforms)
- Publishes to multiple platforms
- Tracks progress and errors
- Provides retry logic

### Content Generator (`services/marketplace/contentGenerator.js`)

Enhanced AI content generator using Gemini 2.5 Flash:
- Single AI call generates content for ALL platforms
- Platform-specific templates:
  - **Website**: Full HTML with schema, FAQ, meta, OG tags
  - **Facebook**: Short post with headline + body + CTA
  - **Craigslist**: Plain text listing format
  - **eBay**: SEO-optimized title + HTML description
  - **LinkedIn**: Professional post format
- Fallback content for each platform if AI fails

### Base Platform (`services/marketplace/platforms/base.js`)

Abstract base class for platform integrations:
- Error types: PlatformError, RateLimitError, AuthError, ValidationError
- Retry logic with exponential backoff
- Rate limit checking
- Result formatting

### Website Platform (`services/marketplace/platforms/website.js`) — PRIORITY

Direct database insert (always available):
- Inserts SEO content to `inventory_seo` table
- Creates listing record in `inventory_listings`
- Returns live URL
- No external API needed

---

## Browser Automation

### Browser Manager (`services/marketplace/automation/browser.js`)

Playwright instance manager:
- Headless Chrome for browser automation
- Context isolation for each job
- Automatic screenshot on errors
- Graceful shutdown

### Rate Limiter (`services/marketplace/automation/rateLimiter.js`)

Prevents platform bans:
- Per-platform rate limits
- Configurable limits (requests/window)
- Automatic wait-for-slot
- Status monitoring

Default limits:
| Platform | Requests | Window |
|----------|----------|--------|
| Facebook | 10 | 1 min |
| Craigslist | 5 | 1 min |
| eBay | 30 | 1 min |
| LinkedIn | 15 | 1 min |
| Website | 100 | 1 min |

---

## API Endpoints

### POST `/api/inventory/:id/publish`

Publish inventory to marketplace platforms.

**Request:**
```json
{
  "platforms": ["website", "facebook", "craigslist"],
  "regenerateContent": true
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid",
  "message": "Publishing to website, facebook, craigslist",
  "platforms": {
    "website": { "success": true, "url": "..." },
    "facebook": { "success": true, "url": "..." }
  }
}
```

### GET `/api/inventory/:id/publish/status/:jobId`

Get job status.

**Response:**
```json
{
  "jobId": "uuid",
  "status": "completed",
  "progress": { ... },
  "errorCount": 0,
  "startedAt": "2026-03-29T...",
  "completedAt": "2026-03-29T..."
}
```

### GET `/api/inventory/:id/listings`

Get all listings for an inventory item.

### POST `/api/inventory/:id/republish/:platform`

Republish to a single platform.

### GET `/api/marketplace/stats`

Get marketplace statistics.

### GET `/api/marketplace/platforms`

Get available platforms and their status.

---

## Platform Status

| Platform | Status | Notes |
|----------|--------|-------|
| **Website** | ✅ Ready | Direct DB insert |
| Facebook | 🔜 Next | Playwright automation |
| Craigslist | 🔜 Next | Playwright automation |
| eBay | 📋 Planned | Trading API |
| LinkedIn | 📋 Planned | OAuth API |

---

## Files Created

```
backend/
├── migrations/
│   └── 006_marketplace.sql
├── routes/
│   └── marketplace.js
├── services/
│   └── marketplace/
│       ├── orchestrator.js
│       ├── contentGenerator.js
│       ├── platforms/
│       │   ├── base.js
│       │   └── website.js
│       └── automation/
│           ├── browser.js
│           └── rateLimiter.js
```

---

## Environment Variables

```env
# Required
GEMINI_API_KEY=your-gemini-api-key

# Optional
WEBSITE_URL=https://materialsolutionsnj.com
REDIS_URL=redis://localhost:6379  # For future job queue
```

---

## Coordination

- **Stark**: Frontend (PublishButton, progress UI) + email/SEO services
- **This Phase**: Core publish infrastructure + website platform

---

## Next Steps

1. Run migration: `node backend/migrations/006_marketplace.sql`
2. Set `GEMINI_API_KEY` in environment
3. Stark builds frontend PublishButton + progress UI
4. Implement Craigslist platform (browser automation)
5. Implement eBay Trading API

---

**Cipher**  
Head of Engineering, VAlphaOps
