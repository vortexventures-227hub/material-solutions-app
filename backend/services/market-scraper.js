// backend/services/market-scraper.js
const axios = require('axios');
const db = require('../db');

/**
 * Market Comp Scraper
 * 
 * This is a simplified version that demonstrates the architecture.
 * In production, you'd use:
 * - Puppeteer/Playwright for JavaScript-heavy sites
 * - Scrapy or similar for large-scale scraping
 * - Rotating proxies to avoid rate limits
 * - Respect robots.txt and terms of service
 */

/**
 * Parse price from various string formats
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  // Remove currency symbols and commas
  const cleaned = priceStr.replace(/[$,]/g, '');
  
  // Extract first number found
  const match = cleaned.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Extract key specs from listing description
 */
function extractSpecs(description) {
  const specs = {
    make: null,
    model: null,
    year: null,
    hours: null,
    capacity: null
  };

  const text = description.toLowerCase();

  // Extract year
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    specs.year = parseInt(yearMatch[0]);
  }

  // Extract hours
  const hoursMatch = text.match(/(\d+,?\d*)\s*(hours|hrs|operating hours)/i);
  if (hoursMatch) {
    specs.hours = parseInt(hoursMatch[1].replace(/,/g, ''));
  }

  // Extract capacity
  const capacityMatch = text.match(/(\d+,?\d*)\s*(lbs?|pounds)/i);
  if (capacityMatch) {
    specs.capacity = parseInt(capacityMatch[1].replace(/,/g, ''));
  }

  // Extract make
  const makes = ['raymond', 'toyota', 'crown', 'hyster', 'yale', 'caterpillar', 'clark', 'nissan'];
  for (const make of makes) {
    if (text.includes(make)) {
      specs.make = make.charAt(0).toUpperCase() + make.slice(1);
      break;
    }
  }

  return specs;
}

/**
 * Scrape Craigslist (simplified example - actual scraping would need Puppeteer)
 * This is a placeholder that shows the structure
 */
async function scrapeCraigslist(location = 'newyork', searchTerm = 'forklift') {
  console.log(`🔍 Scraping Craigslist ${location} for "${searchTerm}"...`);
  
  // NOTE: Craigslist blocks simple HTTP requests. In production, use:
  // - Puppeteer for browser automation
  // - Rotating proxies
  // - Or use a third-party scraping API (like ScraperAPI, Bright Data)
  
  const mockListings = [
    {
      title: '2018 Raymond Reach Truck - 3500 lbs - Low Hours',
      price: 28500,
      location: 'Brooklyn, NY',
      description: '2018 Raymond 7400 reach truck. 3500 lbs capacity. Only 2100 hours. Excellent condition. Battery 2 years old.',
      url: 'https://newyork.craigslist.org/example1',
      source: 'craigslist',
      scraped_at: new Date()
    },
    {
      title: '2016 Toyota Forklift 5000 lbs',
      price: 19900,
      location: 'Queens, NY',
      description: '2016 Toyota 8FGCU25. 5000 lbs capacity. 6200 hours. Propane powered. Runs great.',
      url: 'https://newyork.craigslist.org/example2',
      source: 'craigslist',
      scraped_at: new Date()
    }
  ];

  return mockListings;
}

/**
 * Scrape Facebook Marketplace (simplified example)
 */
async function scrapeFacebookMarketplace(location = 'new-york-ny', searchTerm = 'forklift') {
  console.log(`🔍 Scraping Facebook Marketplace ${location} for "${searchTerm}"...`);
  
  // NOTE: Facebook Marketplace requires authentication and has anti-scraping measures.
  // In production, use:
  // - Facebook Graph API (requires partner approval)
  // - Or use a third-party scraping service
  
  const mockListings = [
    {
      title: '2020 Crown Reach Truck - Like New',
      price: 38000,
      location: 'Manhattan, NY',
      description: '2020 Crown RC 5500. 4000 lbs capacity. 1800 hours. Like new condition. Full warranty remaining.',
      url: 'https://facebook.com/marketplace/example1',
      source: 'facebook',
      scraped_at: new Date()
    },
    {
      title: 'Hyster Sit-Down Forklift - 5000 lbs',
      price: 15500,
      location: 'Bronx, NY',
      description: '2015 Hyster H50FT. 5000 lbs. 9800 hours. Runs well. Priced to sell.',
      url: 'https://facebook.com/marketplace/example2',
      source: 'facebook',
      scraped_at: new Date()
    }
  ];

  return mockListings;
}

/**
 * Analyze market comps for a specific forklift
 */
async function getMarketComps(make, model, year, capacity) {
  console.log(`📊 Analyzing market comps for ${year} ${make} ${model}...`);
  
  // In production, scrape real listings
  // For now, return mock data
  const craigslistListings = await scrapeCraigslist();
  const facebookListings = await scrapeFacebookMarketplace();
  
  const allListings = [...craigslistListings, ...facebookListings];
  
  // Filter listings that match specs
  const relevantListings = allListings.filter(listing => {
    const specs = extractSpecs(listing.description);
    
    // Match criteria: same make, similar year (+/- 3 years), similar capacity (+/- 1000 lbs)
    const makeMatch = specs.make && make && specs.make.toLowerCase() === make.toLowerCase();
    const yearMatch = specs.year && year && Math.abs(specs.year - year) <= 3;
    const capacityMatch = capacity && specs.capacity && Math.abs(specs.capacity - capacity) <= 1000;
    
    return makeMatch || yearMatch || capacityMatch;
  });
  
  if (relevantListings.length === 0) {
    return {
      comps: allListings, // Return all if no exact matches
      averagePrice: null,
      priceRange: { min: null, max: null },
      analysis: 'No exact matches found. Showing all recent listings.'
    };
  }
  
  // Calculate pricing stats
  const prices = relevantListings.map(l => l.price).filter(p => p !== null);
  const averagePrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : null,
    max: prices.length > 0 ? Math.max(...prices) : null
  };
  
  return {
    comps: relevantListings,
    averagePrice,
    priceRange,
    analysis: `Found ${relevantListings.length} comparable listings. Average price: $${averagePrice?.toLocaleString() || 'N/A'}`
  };
}

/**
 * Save market comp data to database
 */
async function saveMarketComp(listing) {
  const specs = extractSpecs(listing.description);
  
  await db.query(
    `INSERT INTO market_comps (
      title, price, location, description, url, source,
      make, model, year, hours, capacity, scraped_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      listing.title,
      listing.price,
      listing.location,
      listing.description,
      listing.url,
      listing.source,
      specs.make,
      specs.model,
      specs.year,
      specs.hours,
      specs.capacity,
      listing.scraped_at
    ]
  );
}

/**
 * Get recent market comps from database
 */
async function getRecentComps(daysBack = 30) {
  // Sanitize daysBack to prevent SQL injection
  const safeDaysBack = Math.max(1, Math.min(365, parseInt(daysBack, 10) || 30));
  
  const result = await db.query(
    `SELECT * FROM market_comps 
     WHERE scraped_at >= NOW() - INTERVAL '1 day' * $1
     ORDER BY scraped_at DESC`,
    [safeDaysBack]
  );
  
  return result.rows;
}

module.exports = {
  scrapeCraigslist,
  scrapeFacebookMarketplace,
  getMarketComps,
  saveMarketComp,
  getRecentComps,
  extractSpecs,
  parsePrice
};
