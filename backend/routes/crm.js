// backend/routes/crm.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  syncToCRM,
  handleGoHighLevelWebhook,
  handleHubSpotWebhook
} = require('../services/crm');

/**
 * POST /api/crm/sync/:leadId
 * Manually sync a lead to configured CRM(s)
 */
router.post('/sync/:leadId', async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    const result = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = result.rows[0];
    const syncResults = await syncToCRM(lead);
    
    res.json({ 
      success: true,
      message: 'CRM sync completed',
      results: syncResults
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/crm/webhooks/gohighlevel
 * Webhook endpoint for GoHighLevel events
 */
router.post('/webhooks/gohighlevel', async (req, res, next) => {
  try {
    const result = handleGoHighLevelWebhook(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/crm/webhooks/hubspot
 * Webhook endpoint for HubSpot events
 */
router.post('/webhooks/hubspot', async (req, res, next) => {
  try {
    const result = handleHubSpotWebhook(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
