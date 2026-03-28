// backend/routes/drip.js
const express = require('express');
const router = express.Router();
const {
  scheduleDripCampaign,
  cancelDripCampaign,
  getDripStatus
} = require('../services/drip');

/**
 * POST /api/drip/schedule
 * Schedule a drip campaign for a lead
 * Body: { leadId, campaignType }
 */
router.post('/schedule', async (req, res, next) => {
  try {
    const { leadId, campaignType } = req.body;
    
    if (!leadId) {
      return res.status(400).json({ message: 'leadId is required' });
    }

    await scheduleDripCampaign(leadId, campaignType || 'welcome');
    
    res.json({ 
      message: 'Drip campaign scheduled successfully',
      leadId,
      campaignType: campaignType || 'welcome'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/drip/cancel/:leadId
 * Cancel all scheduled drip emails for a lead
 */
router.post('/cancel/:leadId', async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    await cancelDripCampaign(leadId);
    
    res.json({ 
      message: 'Drip campaign cancelled successfully',
      leadId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/drip/status/:leadId
 * Get drip campaign status for a lead
 */
router.get('/status/:leadId', async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    const status = await getDripStatus(leadId);
    
    res.json(status);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
