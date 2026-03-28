// backend/routes/sms.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  sendCustomSMS,
  sendFollowUpSMS,
  sendAppointmentReminderSMS,
  sendQuoteReadySMS
} = require('../services/sms');

/**
 * POST /api/sms/send
 * Send custom SMS to a lead
 * Body: { leadId, message }
 */
router.post('/send', async (req, res, next) => {
  try {
    const { leadId, message } = req.body;
    
    if (!leadId || !message) {
      return res.status(400).json({ message: 'leadId and message are required' });
    }

    const result = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = result.rows[0];
    await sendCustomSMS(lead, message);
    
    // Log interaction
    const interactions = lead.interactions || [];
    interactions.push({
      type: 'sms',
      direction: 'outbound',
      message,
      timestamp: new Date().toISOString()
    });
    
    await db.query(
      'UPDATE leads SET interactions = $1 WHERE id = $2',
      [JSON.stringify(interactions), leadId]
    );
    
    res.json({ 
      success: true,
      message: 'SMS sent successfully',
      leadId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sms/follow-up/:leadId
 * Send follow-up SMS to a lead
 */
router.post('/follow-up/:leadId', async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    const result = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = result.rows[0];
    await sendFollowUpSMS(lead);
    
    // Log interaction
    const interactions = lead.interactions || [];
    interactions.push({
      type: 'sms',
      direction: 'outbound',
      message: 'Follow-up SMS sent',
      timestamp: new Date().toISOString()
    });
    
    await db.query(
      'UPDATE leads SET interactions = $1 WHERE id = $2',
      [JSON.stringify(interactions), leadId]
    );
    
    res.json({ 
      success: true,
      message: 'Follow-up SMS sent successfully',
      leadId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sms/quote-ready/:leadId
 * Send quote ready SMS to a lead
 */
router.post('/quote-ready/:leadId', async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    const result = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = result.rows[0];
    await sendQuoteReadySMS(lead);
    
    // Log interaction
    const interactions = lead.interactions || [];
    interactions.push({
      type: 'sms',
      direction: 'outbound',
      message: 'Quote ready SMS sent',
      timestamp: new Date().toISOString()
    });
    
    await db.query(
      'UPDATE leads SET interactions = $1 WHERE id = $2',
      [JSON.stringify(interactions), leadId]
    );
    
    res.json({ 
      success: true,
      message: 'Quote ready SMS sent successfully',
      leadId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sms/appointment-reminder
 * Send appointment reminder SMS
 * Body: { leadId, appointmentDate }
 */
router.post('/appointment-reminder', async (req, res, next) => {
  try {
    const { leadId, appointmentDate } = req.body;
    
    if (!leadId || !appointmentDate) {
      return res.status(400).json({ message: 'leadId and appointmentDate are required' });
    }

    const result = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = result.rows[0];
    await sendAppointmentReminderSMS(lead, appointmentDate);
    
    // Log interaction
    const interactions = lead.interactions || [];
    interactions.push({
      type: 'sms',
      direction: 'outbound',
      message: `Appointment reminder sent for ${appointmentDate}`,
      timestamp: new Date().toISOString()
    });
    
    await db.query(
      'UPDATE leads SET interactions = $1 WHERE id = $2',
      [JSON.stringify(interactions), leadId]
    );
    
    res.json({ 
      success: true,
      message: 'Appointment reminder SMS sent successfully',
      leadId
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
