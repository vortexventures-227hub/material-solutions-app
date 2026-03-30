-- ============================================================
-- Phase 6C: Marketplace Automation Tables
-- Run after main schema.sql
-- ============================================================

-- ─── Inventory Listings (cross-platform publish state) ──────────
CREATE TABLE IF NOT EXISTS inventory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_listing_id VARCHAR(255),
  platform_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  options JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inventory_id, platform)
);

CREATE INDEX idx_inventory_listings_inventory ON inventory_listings(inventory_id);
CREATE INDEX idx_inventory_listings_status ON inventory_listings(status);
CREATE INDEX idx_inventory_listings_platform ON inventory_listings(platform);

-- ─── SEO Data per Listing ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  meta_description TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,
  schema_product JSONB,
  faq JSONB DEFAULT '[]',
  slug VARCHAR(255) UNIQUE,
  canonical_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_seo_inventory ON inventory_seo(inventory_id);
CREATE INDEX idx_inventory_seo_slug ON inventory_seo(slug);

-- ─── Email Campaigns ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sequence_number INT NOT NULL DEFAULT 1,
  template_body TEXT NOT NULL,
  template_html TEXT,
  variables JSONB DEFAULT '[]',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_sent INT DEFAULT 0,
  total_opens INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  total_bounces INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);

-- ─── Email Campaign Recipients ───────────────────────────────────
CREATE TABLE IF NOT EXISTS email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounced_reason TEXT,
  unsubscribe_token VARCHAR(64) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_recipients_campaign ON email_recipients(campaign_id);
CREATE INDEX idx_email_recipients_lead ON email_recipients(lead_id);
CREATE INDEX idx_email_recipients_status ON email_recipients(status);
CREATE INDEX idx_email_recipients_token ON email_recipients(unsubscribe_token);

-- ─── Email Sequences (lead → inventory match) ────────────────────
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  sequence_status VARCHAR(30) NOT NULL DEFAULT 'active',
  current_step INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, inventory_id)
);

CREATE INDEX idx_email_sequences_lead ON email_sequences(lead_id);
CREATE INDEX idx_email_sequences_inventory ON email_sequences(inventory_id);
CREATE INDEX idx_email_sequences_status ON email_sequences(sequence_status);

-- ─── Marketplace Analytics ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INT DEFAULT 0,
  inquiries INT DEFAULT 0,
  shares INT DEFAULT 0,
  leads_generated INT DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inventory_id, platform, date)
);

CREATE INDEX idx_marketplace_analytics_inventory ON marketplace_analytics(inventory_id);
CREATE INDEX idx_marketplace_analytics_date ON marketplace_analytics(date);
CREATE INDEX idx_marketplace_analytics_platform ON marketplace_analytics(platform);

-- ─── Platform Config ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  api_credentials JSONB DEFAULT '{}',
  default_options JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_config (platform, is_active, default_options) VALUES
  ('craigslist', true, '{"city": "baltimore", "price_factor": 0.95}'),
  ('facebook_marketplace', true, '{"group_id": "", "market_type": "for_sale_by_owner"}'),
  ('machinerytrader', true, '{"category": "forklift", "listing_type": "auction"}'),
  ('equipfinder', true, '{"category": "forklifts", "auction": false}'),
  (' machineryats', true, '{"category": "forklifts"}'),
  ('youtube', true, '{"channel_id": ""}')
ON CONFLICT (platform) DO NOTHING;
