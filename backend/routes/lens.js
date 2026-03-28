const express = require('express');
const router = express.Router();

// POST /price - Calculate pricing for inventory
router.post('/price', async (req, res, next) => {
  const {
    make, model, year, hours, battery_age_years, attachments, condition_score, purchase_price
  } = req.body;

  try {
    // Base price estimation (simplified for MVP - would scrape/API in production)
    let basePrice = 15000; // Default mid-range
    
    // Rough base by type (inferred from model name)
    const modelLower = (model || '').toLowerCase();
    if (modelLower.includes('reach')) {
      basePrice = 16500; // Reach trucks: $15K-$18K
    } else if (modelLower.includes('order picker')) {
      basePrice = 15000; // Order pickers: $14K-$16K
    } else if (modelLower.includes('swing')) {
      basePrice = 62500; // Swing reaches: $45K-$80K
    }

    // Adjustments
    let adjustments = 0;

    // Hours adjustment
    if (hours < 3000) {
      adjustments += basePrice * 0.125; // +12.5% for low hours
    } else if (hours > 8000) {
      adjustments -= basePrice * 0.125; // -12.5% for high hours
    }

    // Battery age adjustment (if electric)
    if (battery_age_years && battery_age_years < 2) {
      adjustments += basePrice * 0.05; // +5% for recent battery
    }

    // Attachments adjustment (rough estimate)
    if (attachments && attachments.length > 0) {
      adjustments += attachments.length * 500; // +$500 per attachment
    }

    // Age adjustment
    const age = new Date().getFullYear() - (year || 2015);
    if (age > 10) {
      adjustments -= basePrice * 0.075; // -7.5% for > 10 years
    }

    // Condition adjustment
    if (condition_score) {
      if (condition_score >= 8) {
        adjustments += basePrice * 0.05; // +5% for excellent condition
      } else if (condition_score <= 4) {
        adjustments -= basePrice * 0.10; // -10% for poor condition
      }
    }

    // Calculate target price
    const targetPrice = Math.round(basePrice + adjustments);

    // Calculate floor (minimum 25% margin over purchase price)
    const floorPrice = purchase_price ? Math.round(purchase_price * 1.25) : Math.round(targetPrice * 0.85);

    // Calculate ceiling (negotiation room)
    const ceilingPrice = Math.round(targetPrice * 1.15);

    // Listing price (what we display)
    const listingPrice = targetPrice;

    res.json({
      floor_price: floorPrice,
      listing_price: listingPrice,
      target_price: targetPrice,
      ceiling_price: ceilingPrice,
      rationale: `Base: $${basePrice.toLocaleString()}, Adjustments: ${adjustments >= 0 ? '+' : ''}$${Math.round(adjustments).toLocaleString()}`
    });

  } catch (error) {
    console.error('Pricing error:', error);
    next(error);
  }
});

module.exports = router;
