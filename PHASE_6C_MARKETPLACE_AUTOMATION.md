# Phase 6C: Marketplace Automation System

## Overview
Comprehensive publish-button system that acts as an entire marketing department.

**When user clicks "Publish" on inventory:**
1. AI generates platform-specific content
2. Posts to 10+ marketplaces automatically
3. Creates SEO/AEO optimized website listing
4. Sends personalized emails to matching leads
5. Tracks performance across all channels

---

## Database Schema

```sql
-- Marketplace configurations
CREATE TABLE marketplace_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL UNIQUE,
  api_key TEXT,
  api_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  account_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  rate_limit_remaining INTEGER,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Listing records per platform
CREATE TABLE inventory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  external_id VARCHAR(255),
  external_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  content JSONB,
  posted_at TIMESTAMP,
  expires_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(inventory_id, platform)
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sequence_step INTEGER DEFAULT 1,
  subject TEXT,
  body TEXT,
  status VARCHAR(20) DEFAULT 'queued',
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SEO/AEO content
CREATE TABLE inventory_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE UNIQUE,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  og_title VARCHAR(100),
  og_description VARCHAR(300),
  schema_json JSONB,
  faq_json JSONB,
  keywords TEXT[],
  alt_texts JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Publish job queue
CREATE TABLE publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  platforms TEXT[],
  progress JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Target Platforms

### Tier 1: Primary (Automated)
1. **Website** - MaterialSolutionsNJ.com (direct database)
2. **Facebook Marketplace** - Templates + deep links
3. **Craigslist** - Browser automation (Playwright)
4. **eBay** - eBay Trading API
5. **LinkedIn** - LinkedIn Marketing API

### Tier 2: Industry (Form Automation)
6. **MachineryTrader.com** - Form submission
7. **EquipmentTrader.com** - Form submission
8. **ForkliftAction.com** - API or form
9. **Machinio.com** - API available
10. **Rock & Dirt** - Form submission

### Tier 3: Community (Manual Templates)
11. **Reddit** - r/Forklifts, r/Warehousing (careful approach)
12. **YouTube** - Video descriptions
13. **Google Business Profile** - Posts

---

## Backend Services Structure

```
/backend/services/
├── marketplace/
│   ├── orchestrator.js        # Main publish workflow
│   ├── contentGenerator.js    # AI content (Gemini)
│   ├── platforms/
│   │   ├── base.js           # Base platform class
│   │   ├── website.js        # Direct to website
│   │   ├── facebook.js       # FB Marketplace
│   │   ├── craigslist.js     # Browser automation
│   │   ├── ebay.js           # eBay API
│   │   ├── linkedin.js       # LinkedIn API
│   │   ├── machineryTrader.js
│   │   ├── equipmentTrader.js
│   │   └── forkliftAction.js
│   └── automation/
│       ├── browser.js        # Playwright instance
│       ├── captcha.js        # 2captcha integration
│       └── rateLimiter.js    # Prevent platform bans
├── seo/
│   ├── schemaGenerator.js    # JSON-LD Product schema
│   ├── metaGenerator.js      # Title, description, OG
│   ├── sitemapManager.js     # Auto-update sitemap
│   └── faqGenerator.js       # AEO FAQ content
├── email/
│   ├── matcher.js            # Match inventory to leads
│   ├── sequenceBuilder.js    # Email sequences
│   ├── sender.js             # SendGrid integration
│   └── tracking.js           # Open/click tracking
└── analytics/
    ├── listingTracker.js     # Per-platform stats
    └── leadAttribution.js    # Which channel drove lead
```

---

## API Endpoints

```javascript
// Main publish endpoint
POST /api/inventory/:id/publish
Body: {
  platforms: ['all'] | ['website', 'facebook', 'craigslist', ...],
  includeEmail: true,
  customizations: {
    facebook: { price_negotiable: true },
    email: { sequence: 'new_inventory' }
  }
}
Returns: { jobId, estimatedTime: '2-3 minutes' }

// Real-time status (WebSocket preferred)
GET /api/inventory/:id/publish/status/:jobId
Returns: {
  status: 'in_progress',
  progress: {
    website: { status: 'complete', url: '...' },
    facebook: { status: 'posting' },
    craigslist: { status: 'queued' }
  },
  emailsSent: 8,
  emailsQueued: 4
}

// Get all listings for inventory
GET /api/inventory/:id/listings
Returns: [{
  platform: 'facebook',
  url: 'https://...',
  status: 'active',
  views: 124,
  inquiries: 3,
  postedAt: '2026-03-29T...',
  expiresAt: '2026-04-29T...'
}]

// Republish single platform
POST /api/inventory/:id/republish/:platform

// Marketplace settings
GET /api/settings/marketplaces
POST /api/settings/marketplaces/:platform

// Analytics
GET /api/analytics/listings/:inventoryId
GET /api/analytics/channels/summary
```

---

## Content Generation (AI)

Generate platform-specific content in one AI call:

```javascript
const prompt = `Generate marketplace listings for this forklift:
${JSON.stringify(inventory)}

Return JSON with content for each platform:
{
  "website": {
    "title": "SEO title 60-70 chars",
    "metaDescription": "155 chars",
    "h1": "Main heading",
    "description": "500+ words with specs, benefits, CTA",
    "faq": [{"q": "...", "a": "..."}],
    "schema": { Product schema.org }
  },
  "facebook": {
    "post": "Casual, emoji-friendly, 200-300 words with key specs"
  },
  "craigslist": {
    "title": "Year Make Model - $Price (Location)",
    "body": "Structured format with all specs, warranty info"
  },
  "ebay": {
    "title": "eBay optimized title 80 chars",
    "description": "Professional, complete specs, condition, warranty",
    "itemSpecifics": { "Make": "...", "Model": "..." }
  },
  "linkedin": {
    "post": "B2B professional tone, 150-200 words"
  },
  "email": {
    "subject": "New Arrival: Year Make Model",
    "body": "Personalized template with {{firstName}} merge tags"
  }
}`;
```

---

## SEO Package Generation

For each published item, generate:

1. **Meta Tags**
   - Title: `2019 Raymond 9600 Reach Truck | 3,500 lbs | NJ Dealer`
   - Description: `Used 2019 Raymond 9600, 3,500 lb capacity, 4,200 hrs. 90-day warranty. NJ/PA/NYC delivery. Call (973) 500-1010.`

2. **Schema Markup** (JSON-LD)
   - @type: Product
   - Offers with price, availability
   - Seller as LocalBusiness
   - AdditionalProperty for specs

3. **Open Graph**
   - og:title, og:description, og:image
   - For social sharing

4. **FAQ for AEO**
   - 5+ Q&A pairs targeting voice search
   - "What is the lift capacity of this forklift?"
   - "Does this come with a warranty?"
   - "Can you deliver to my location?"

---

## Email Outreach System

### Lead Matching
```javascript
function matchLeadsToInventory(inventory) {
  return db.query(`
    SELECT * FROM leads WHERE
      (equipment_interest ILIKE $1 OR equipment_interest ILIKE $2)
      AND (budget_max >= $3 OR budget_max IS NULL)
      AND location IN ('NJ', 'PA', 'NY')
      AND status NOT IN ('closed', 'unsubscribed')
    ORDER BY lead_score DESC
    LIMIT 50
  `, [inventory.make, inventory.model, inventory.floor_price]);
}
```

### Email Sequence
1. **Email 1** (Immediate): New inventory alert
2. **Email 2** (Day 2): Follow-up if no reply
3. **Email 3** (Day 5): Value-add content

### SendGrid Integration
- Transactional sends via API
- Open/click tracking via webhooks
- Unsubscribe handling

---

## Frontend Components

### PublishButton.js
- Shows on inventory detail modal/page
- Opens PublishModal on click

### PublishModal.js (Enhanced)
- Platform selection checkboxes
- Email outreach toggle
- Content preview/customization
- "Publish Now" button

### PublishProgress.js
- Real-time status via WebSocket
- Platform-by-platform progress
- Email send counter
- Completion animation

### PublishResults.js
- Links to all live listings
- Email campaign stats
- SEO summary
- "View Analytics" button

### ListingAnalytics.js (New)
- Per-listing performance
- Channel comparison chart
- Lead attribution
- ROI calculator

---

## Implementation Priority

### Week 1: Core Infrastructure
- [ ] Database migrations
- [ ] Orchestrator service
- [ ] Enhanced content generator
- [ ] Website listing (direct)
- [ ] Basic publish UI

### Week 2: Major Platforms
- [ ] Craigslist automation (Playwright)
- [ ] eBay API integration
- [ ] Facebook templates + links
- [ ] LinkedIn posting

### Week 3: Industry Platforms
- [ ] MachineryTrader
- [ ] EquipmentTrader
- [ ] ForkliftAction
- [ ] Machinio

### Week 4: SEO/AEO
- [ ] Schema generator
- [ ] FAQ generator
- [ ] Sitemap auto-update
- [ ] Google Business Profile

### Week 5: Email System
- [ ] Lead matcher
- [ ] Sequence builder
- [ ] SendGrid integration
- [ ] Tracking webhooks

### Week 6: Analytics
- [ ] Listing tracker
- [ ] Channel comparison
- [ ] ROI dashboard
- [ ] Automated reports

---

## Success Metrics

- **Time to publish**: < 3 minutes for all platforms
- **Platform coverage**: 10+ marketplaces per listing
- **Email match rate**: 80%+ of inventory matches leads
- **SEO completeness**: 100% have schema + FAQ
- **Error rate**: < 5% failed posts

---

## Notes for Cipher

1. Use Playwright for browser automation (more reliable than Puppeteer)
2. Use Bull + Redis for job queue
3. Implement retry logic with exponential backoff
4. Rate limit all platform APIs
5. Store all credentials encrypted
6. Use WebSocket for real-time progress updates
7. Generate all platform content in single AI call (cost efficient)
8. Test each platform integration independently before full workflow
