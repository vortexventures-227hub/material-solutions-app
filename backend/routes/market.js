// backend/routes/market.js
const express = require('express');
const router = express.Router();
const {
  getMarketComps,
  getRecentComps
} = require('../services/market-scraper');

/**
 * GET /api/market/comps
 * Get market comps for a specific forklift
 * Query params: make, model, year, capacity
 */
router.get('/comps', async (req, res, next) => {
  try {
    const { make, model, year, capacity } = req.query;
    
    const result = await getMarketComps(
      make,
      model,
      year ? parseInt(year) : null,
      capacity ? parseInt(capacity) : null
    );
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/market/recent
 * Get recent market comps from database
 * Query param: days (default: 30)
 */
router.get('/recent', async (req, res, next) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    
    const comps = await getRecentComps(days);
    
    res.json(comps);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
