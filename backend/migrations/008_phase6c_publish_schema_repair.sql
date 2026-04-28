-- Phase 6C publish schema repair
-- Idempotent repair for production databases that either missed the publish
-- tables entirely or still have the older 006-era marketplace schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- inventory_listings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
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

ALTER TABLE inventory_listings
  ADD COLUMN IF NOT EXISTS platform_listing_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS platform_url TEXT,
  ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_error TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Preserve older 006-era aliases so legacy routes still have their fields.
ALTER TABLE inventory_listings
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS content JSONB,
  ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiries INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Older 006-era status checks excluded current route states like
-- `publishing`, `published`, `manual_required`, and `unpublished`.
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'inventory_listings'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE inventory_listings DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
  END LOOP;
END $$;

-- Production may already contain legacy rows with historical status values.
-- NOT VALID preserves those rows while enforcing the repaired check for new
-- or updated rows.
ALTER TABLE inventory_listings
  ADD CONSTRAINT inventory_listings_status_check
  CHECK (status IN (
    'pending',
    'posting',
    'publishing',
    'active',
    'published',
    'manual_required',
    'failed',
    'expired',
    'deleted',
    'unpublished'
  )) NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_listings_inventory_platform
  ON inventory_listings(inventory_id, platform);
CREATE INDEX IF NOT EXISTS idx_inventory_listings_inventory ON inventory_listings(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_listings_status ON inventory_listings(status);
CREATE INDEX IF NOT EXISTS idx_inventory_listings_platform ON inventory_listings(platform);
CREATE INDEX IF NOT EXISTS idx_inventory_listings_external_id
  ON inventory_listings(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_listings_platform_listing_id
  ON inventory_listings(platform_listing_id) WHERE platform_listing_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- inventory_seo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE UNIQUE,
  title VARCHAR(255),
  meta_title VARCHAR(70),
  meta_description TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,
  schema_product JSONB,
  schema_json JSONB,
  faq JSONB DEFAULT '[]',
  faq_json JSONB,
  keywords TEXT[],
  alt_texts JSONB DEFAULT '{}',
  slug TEXT,
  canonical_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory_seo
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(70),
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS og_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS schema_product JSONB,
  ADD COLUMN IF NOT EXISTS schema_json JSONB,
  ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS faq_json JSONB,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS alt_texts JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_seo_inventory_unique ON inventory_seo(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_seo_inventory ON inventory_seo(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_seo_slug ON inventory_seo(slug) WHERE slug IS NOT NULL;

-- ---------------------------------------------------------------------------
-- marketplace_analytics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inventory_id, platform, date)
);

ALTER TABLE marketplace_analytics
  ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiries INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roi DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_inventory ON marketplace_analytics(inventory_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_date ON marketplace_analytics(date);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_platform ON marketplace_analytics(platform);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_listings ON inventory_listings;
CREATE TRIGGER update_inventory_listings BEFORE UPDATE ON inventory_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_seo ON inventory_seo;
CREATE TRIGGER update_inventory_seo BEFORE UPDATE ON inventory_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_marketplace_analytics ON marketplace_analytics;
CREATE TRIGGER update_marketplace_analytics BEFORE UPDATE ON marketplace_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
