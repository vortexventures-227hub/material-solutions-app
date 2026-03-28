#!/usr/bin/env node
// backend/scripts/scrape-market.js
// Run this script via cron daily to scrape market comps

const {
  scrapeCraigslist,
  scrapeFacebookMarketplace,
  saveMarketComp
} = require('../services/market-scraper');

console.log(`[${new Date().toISOString()}] Starting market scraper...`);

async function scrapeAll() {
  try {
    // Scrape Craigslist
    const craigslistListings = await scrapeCraigslist();
    console.log(`✅ Scraped ${craigslistListings.length} Craigslist listings`);
    
    for (const listing of craigslistListings) {
      await saveMarketComp(listing);
    }
    
    // Scrape Facebook Marketplace
    const facebookListings = await scrapeFacebookMarketplace();
    console.log(`✅ Scraped ${facebookListings.length} Facebook Marketplace listings`);
    
    for (const listing of facebookListings) {
      await saveMarketComp(listing);
    }
    
    console.log(`[${new Date().toISOString()}] Market scraper finished successfully.`);
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Market scraper failed:`, error);
    process.exit(1);
  }
}

scrapeAll();
