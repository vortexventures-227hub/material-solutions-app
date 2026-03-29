# Marketplace Automation Specification

## Overview
One-click publishing system that takes Vortex Forklift inventory and distributes it across multiple marketplaces with SEO/AEO optimization and warm outreach.

## Phase 1: Core Publishing Button

### UI Component
- **Location:** Inventory detail page (individual item view)
- **Button:** "Publish to Marketplaces" 
- **Behavior:** 
  - Disabled if item already published
  - Shows progress modal during publishing
  - Confirms completion with marketplace URLs

### Backend Endpoint
**POST /api/inventory/:id/publish**

**Response:**
```json
{
  "status": "success",
  "listings": [
    {
      "platform": "facebook_marketplace",
      "listing_id": "fb_123456789",
      "url": "https://facebook.com/marketplace/...",
      "status": "active",
      "published_at": "2026-03-29T20:00:00Z"
    },
    {
      "platform": "craigslist",
      "listing_id": "cl_987654321",
      "url": "https://newjersey.craigslist.org/...",
      "status": "active",
      "published_at": "2026-03-29T20:01:00Z"
    }
  ]
}
```

## Phase 2: Marketplace Integrations

### Target Platforms
1. **Facebook Marketplace** (API or automation)
2. **Craigslist** (automation - no official API)
3. **OfferUp** (API)
4. **eBay** (API)
5. **Company website** (own listing page)

### Integration Strategy
- Use official APIs where available
- Use browser automation (Puppeteer/Playwright) for Craigslist
- Store listing IDs and URLs in database for tracking

### Database Schema
```sql
CREATE TABLE marketplace_listings (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER REFERENCES inventory(id),
  platform VARCHAR(50) NOT NULL,
  listing_id VARCHAR(255),
  url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  published_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Phase 3: SEO/AEO Content Generation

### Content Requirements
For each listing, generate:
1. **Title** (60-80 chars, keyword-rich)
2. **Description** (300-500 words, structured)
   - Key specs at top (bullet points)
   - Detailed features
   - Benefits/use cases
   - Call to action
3. **Meta tags** (for website listing)
4. **FAQ section** (5-7 common questions)
5. **Structured data** (Schema.org markup)

### AEO Optimization
- Clear, concise answers to "what/why/when/how" questions
- E-E-A-T signals (expertise, authority)
- Schema markup for Product type
- FAQ schema for common questions

### Tools to Use
- **Surfer SEO** or **MarketMuse** (content optimization)
- **Jasper AI** or **ChatGPT** (content generation)
- Internal: Use Gemini 2.5 Flash for generation

## Phase 4: Warm Email Outreach

### Target Audience
- Previous Material Solutions customers (from leads table)
- Industry contacts
- Referral sources

### Email Flow
1. **Day 1:** New inventory announcement
   - Subject: "Just In: [Make Model Year] - [Key Feature]"
   - Preview forklift specs
   - Link to listing
   - Contact David button

2. **Day 7:** Follow-up (if no response)
   - Subject: "Still available: [Make Model]"
   - Price drop or special offer
   - Urgency ("interest from 2 other buyers")

3. **Day 14:** Final outreach
   - Subject: "Last chance: [Make Model]"
   - Final price
   - Link to similar inventory

### Tools
- **AgentMail** (AI-first email API)
- **Apollo.io** (B2B contact enrichment)
- Internal: Track in `email_campaigns` table

### Database Schema
```sql
CREATE TABLE email_campaigns (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER REFERENCES inventory(id),
  sent_to TEXT[], -- array of email addresses
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0
);
```

## Phase 5: David Integration

### Requirements
- Each marketplace listing includes phone number
- Phone number routes to David (AI phone agent)
- David has context: inventory details, pricing, lead source

### Implementation
- Use David's phone number in listings
- Send webhook to David service when listing published
- Payload: `{inventory_id, make, model, year, price, listing_url}`

## Implementation Priority

**Must Have (MVP):**
1. Publish button (UI)
2. Backend endpoint
3. Facebook Marketplace integration
4. Basic SEO content generation
5. Database tracking

**Should Have (Phase 2):**
1. Craigslist automation
2. AEO optimization
3. Email campaign (Day 1 only)

**Nice to Have (Future):**
1. OfferUp/eBay integrations
2. Multi-day email sequences
3. Campaign analytics dashboard

## Tools & APIs Needed

### From Database
- **AgentMail** - Email infrastructure
- **Apollo.io** - Contact enrichment
- Gemini 2.5 Flash - Content generation

### External
- **Facebook Graph API** - Marketplace posting
- **Puppeteer/Playwright** - Craigslist automation
- **Surfer SEO API** (optional) - Content scoring

## Success Metrics
- Time to publish: < 2 minutes per item
- Marketplace coverage: 3+ platforms per item
- SEO score: 80+ (Surfer/MarketMuse)
- Email open rate: > 20%
- Lead conversion: Track in CRM

---

**Next Steps:**
1. Cipher implements Phase 1 (button + endpoint + Facebook integration)
2. Test with 1 inventory item
3. Iterate on content quality
4. Add remaining platforms
