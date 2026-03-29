const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendNewLeadNotification, sendWelcomeEmail } = require('../services/email');
const { scheduleDripCampaign } = require('../services/drip');
const { sendNewLeadSMS } = require('../services/sms');
const { syncToCRM } = require('../services/crm');
const { leadSchema } = require('../validation/schemas');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

// Allowlist of valid column names for PATCH updates (SQL injection prevention)
const ALLOWED_LEAD_FIELDS = new Set([
  'name', 'email', 'phone', 'company', 'source', 'interest', 'budget',
  'timeline', 'is_decision_maker', 'score', 'status', 'notes', 'assigned_to'
]);

// POST / - Create lead
router.post('/', async (req, res, next) => {
  try {
    // Validate input
    const validatedData = leadSchema.parse(req.body);
    
    const {
      name, email, phone, company, source, interest, budget,
      timeline, is_decision_maker
    } = validatedData;
    const result = await db.query(
      `INSERT INTO leads (
        name, email, phone, company, source, interest, budget,
        timeline, is_decision_maker, score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [name, email, phone, company, source, JSON.stringify(interest || []),
       budget, timeline, is_decision_maker || false, 0, 'new']
    );
    
    const newLead = result.rows[0];
    
    // Send emails, SMS, schedule drip campaign, and sync to CRM (async, don't block response)
    Promise.all([
      sendNewLeadNotification(newLead).catch(err => console.error('Email notification failed:', err)),
      email ? sendWelcomeEmail(newLead).catch(err => console.error('Welcome email failed:', err)) : Promise.resolve(),
      email ? scheduleDripCampaign(newLead.id, 'welcome').catch(err => console.error('Drip campaign scheduling failed:', err)) : Promise.resolve(),
      sendNewLeadSMS(newLead).catch(err => console.error('SMS notification failed:', err)),
      syncToCRM(newLead).catch(err => console.error('CRM sync failed:', err))
    ]);
    
    res.status(201).json(newLead);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating lead:', error);
    next(error);
  }
});

// GET / - List leads with optional status/score filter and pagination
router.get('/', async (req, res, next) => {
  const { status, minScore } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  try {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (minScore) {
      params.push(minScore);
      conditions.push(`score >= $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM leads ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM leads ${where} ORDER BY score DESC, created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json(paginatedResponse(result.rows, total, page, limit));
  } catch (error) {
    console.error('Error fetching leads:', error);
    next(error);
  }
});

// GET /:id - Get single lead by ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lead:', error);
    next(error);
  }
});

// PATCH /:id - Update lead
router.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  
  try {
    // Validate input (partial validation for PATCH)
    const validatedData = leadSchema.partial().parse(req.body);
    
    // Filter to only allowed fields (SQL injection prevention)
    const fields = Object.keys(validatedData).filter(f => ALLOWED_LEAD_FIELDS.has(f));
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const values = fields.map(f => validatedData[f]);
    const setClause = fields.map((field, i) => `"${field}" = $${i + 2}`).join(', ');
    
    const result = await db.query(
      `UPDATE leads SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating lead:', error);
    next(error);
  }
});

// POST /:id/interaction - Add interaction to lead
router.post('/:id/interaction', async (req, res, next) => {
  const { id } = req.params;
  const { type, notes } = req.body;
  
  try {
    const interaction = {
      type,
      date: new Date().toISOString(),
      notes
    };
    
    const result = await db.query(
      `UPDATE leads 
       SET interactions = interactions || $1::jsonb
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(interaction), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding interaction:', error);
    next(error);
  }
});

module.exports = router;
