-- Material Solutions Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    serial TEXT,
    hours INTEGER,
    capacity_lbs INTEGER,
    mast_type TEXT,
    lift_height_inches INTEGER,
    power_type TEXT,
    battery_info TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    condition_score INTEGER CHECK (condition_score >= 1 AND condition_score <= 10),
    condition_notes TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    purchase_price NUMERIC(15, 2),
    listing_price NUMERIC(15, 2),
    floor_price NUMERIC(15, 2),
    status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'listed', 'reserved', 'pending', 'sold', 'archived')),
    created_at TIMESTAMP DEFAULT NOW(),
    sold_at TIMESTAMP,
    sold_price NUMERIC(15, 2),
    additional_context TEXT
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT CHECK (source IN ('website', 'facebook', 'craigslist', 'referral', 'cold_outreach')),
    interest JSONB DEFAULT '[]'::jsonb,
    budget NUMERIC(15, 2),
    timeline TEXT,
    is_decision_maker BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'engaged', 'qualified', 'hot', 'converted', 'lost', 'nurture')),
    interactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    converted_at TIMESTAMP
);

CREATE TABLE drip_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    campaign_type TEXT NOT NULL,
    email_index INTEGER NOT NULL,
    subject TEXT NOT NULL,
    send_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE market_comps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    price NUMERIC(15, 2),
    location TEXT,
    description TEXT,
    url TEXT,
    source TEXT CHECK (source IN ('craigslist', 'facebook', 'ebay', 'other')),
    make TEXT,
    model TEXT,
    year INTEGER,
    hours INTEGER,
    capacity INTEGER,
    scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_created_at ON inventory(created_at DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_drip_emails_lead_id ON drip_emails(lead_id);
CREATE INDEX idx_drip_emails_send_date ON drip_emails(send_date);
CREATE INDEX idx_drip_emails_status ON drip_emails(status);
CREATE INDEX idx_market_comps_scraped_at ON market_comps(scraped_at DESC);
CREATE INDEX idx_market_comps_make_year ON market_comps(make, year);

-- Authentication tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'readonly')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Marketplace automation tables
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    listing_id VARCHAR(255),
    url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'failed', 'removed', 'expired')),
    title TEXT,
    description TEXT,
    seo_content JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketplace_listings_inventory_id ON marketplace_listings(inventory_id);
CREATE INDEX idx_marketplace_listings_platform ON marketplace_listings(platform);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
