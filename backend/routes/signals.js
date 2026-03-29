const express = require('express');
const router = express.Router();
const signalMonitor = require('../services/signal-monitor');

/**
 * Webhook Routes for Trigify and Apollo signals
 */

/**
 * POST /api/signals/trigify
 * Webhook for Trigify signals
 */
router.post('/trigify', async (req, res, next) => {
  try {
    const lead = await signalMonitor.processTrigifySignal(req.body);
    res.status(201).json({ success: true, lead_id: lead.id });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/signals/apollo
 * Webhook for Apollo signals
 */
router.post('/apollo', async (req, res, next) => {
  try {
    const lead = await signalMonitor.processApolloSignal(req.body);
    res.status(201).json({ success: true, lead_id: lead.id });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check for signal webhooks
 */
router.get('/health', (req, res) => {
  res.json({ status: 'active', message: 'Signal monitoring ready' });
});

module.exports = router;
