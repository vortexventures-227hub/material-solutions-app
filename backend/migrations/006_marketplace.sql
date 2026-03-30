-- Phase 6C: Marketplace Automation Schema
-- Adds marketplace configs, listings, publish jobs, email campaigns, and SEO tables

-- =====================================================
-- MARKETPLACE CONFIGURATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL UNIQUE,
  api_key TEXT,
  api_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  account_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  rate_limit_remaining INTEGER DEFAULT 100,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for active platforms lookup
CREATE INDEX IF NOT EXISTS idx_marketplace_configs_active ON marketplace_configs(is_active) WHERE is_active = true;

-- =====================================================
-- INVENTORY LISTINGS (per-platform)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  external_id VARCHAR(255),
  external_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'posting', 'active', 'failed', 'expired', 'deleted')),
  content JSONB,
  posted_at TIMESTAMP,
  expires_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(inventory_id, platform)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_inventory ON inventory_listings(inventory_id);
CREATE INDEX IF NOT EXISTS idx_listings_platform ON inventory_listings(platform);
CREATE INDEX IF NOT EXISTS idx_listings_status ON inventory_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_external_id ON inventory_listings(external_id) WHERE external_id IS NOT NULL;

-- =====================================================
-- PUBLISH JOB QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  platforms TEXT[],
  progress JSONB DEFAULT '{}',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_count INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_inventory ON publish_jobs(inventory_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON publish_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON publish_jobs(created_at DESC);

-- =====================================================
-- EMAIL CAMPAIGNS
-- =====================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sequence_step INTEGER DEFAULT 1,
  subject TEXT,
  body TEXT,
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'failed', 'bounced', 'unsubscribed')),
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_inventory ON email_campaigns(inventory_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_lead ON email_campaigns(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON email_campaigns(scheduled_for) WHERE status = 'queued';

-- =====================================================
-- INVENTORY SEO/AEO CONTENT
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE UNIQUE,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  og_title VARCHAR(100),
  og_description VARCHAR(300),
  schema_json JSONB,
  faq_json JSONB,
  keywords TEXT[],
  alt_texts JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_seo_inventory ON inventory_seo(inventory_id);

-- =====================================================
-- PLATFORM TEMPLATES (for customizations)
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, template_name)
);

-- =====================================================
-- INSERT DEFAULT MARKETPLACE CONFIGURATIONS
-- =====================================================
INSERT INTO marketplace_configs (platform, is_active) VALUES
  ('website', true),
  ('facebook', true),
  ('craigslist', true),
  ('ebay', false),
  ('linkedin', false),
  ('machinerytrader', false),
  ('equipmenttrader', false),
  ('forkliftaction', false),
  ('machinio', false)
ON CONFLICT (platform) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_marketplace_configs ON marketplace_configs;
CREATE TRIGGER update_marketplace_configs BEFORE UPDATE ON marketplace_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_listings ON inventory_listings;
CREATE TRIGGER update_inventory_listings BEFORE UPDATE ON inventory_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_publish_jobs ON publish_jobs;
CREATE TRIGGER update_publish_jobs BEFORE UPDATE ON publish_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_seo ON inventory_seo;
CREATE TRIGGER update_inventory_seo BEFORE UPDATE ON inventory_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
