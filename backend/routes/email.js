/**
 * Email Routes
 * POST /api/email/send          — Send a single email
 * POST /api/email/match          — Run matcher for a lead
 * POST /api/email/trigger-sequence — Trigger sequence for lead+inventory
 * GET  /api/email/analytics/:id   — Get campaign analytics
 * POST /api/email/webhook        — SendGrid inbound webhook
 * GET  /api/email/track/open/:id  — Open tracking pixel
 * GET  /api/email/track/click/:id — Click redirect
 */

const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/email/sender');
const { buildSequence, buildEmailForStep } = require('../services/email/sequenceBuilder');
const { findMatchesForLead, findLeadsForInventory } = require('../services/email/matcher');
const { getCampaignAnalytics, handleSendGridWebhook, recordOpen, recordClick } = require('../services/email/tracking');
const db = require('../db');

// ─── POST /api/email/send ───────────────────────────────────────
router.post('/send', async (req, res, next) => {
  try {
    const { leadId, inventoryId, subject, body, template } = req.body;
    if (!leadId || (!body && !template)) {
      return res.status(400).json({ error: 'leadId and body/template required' });
    }

    const leadRes = await db.query(`SELECT * FROM leads WHERE id = $1`, [leadId]);
    if (!leadRes.rows.length) return res.status(404).json({ error: 'Lead not found' });

    let unit = null;
    if (inventoryId) {
      const invRes = await db.query(`SELECT * FROM inventory WHERE id = $1`, [inventoryId]);
      unit = invRes.rows[0] || null;
    }

    const result = await sendEmail({
      to: leadRes.rows[0].email,
      subject,
      html: body,
      text: body.replace(/<[^>]*>/g, ''),
      leadId,
      campaignId: null,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/email/match ──────────────────────────────────────
router.post('/match', async (req, res, next) => {
  try {
    const { leadId } = req.body;
    if (!leadId) return res.status(400).json({ error: 'leadId required' });

    const matches = await findMatchesForLead(leadId);
    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/email/trigger-sequence ────────────────────────────
router.post('/trigger-sequence', async (req, res, next) => {
  try {
    const { leadId, inventoryId, sequenceType } = req.body;
    if (!leadId || !inventoryId) {
      return res.status(400).json({ error: 'leadId and inventoryId required' });
    }

    const [leadRes, unitRes] = await Promise.all([
      db.query(`SELECT * FROM leads WHERE id = $1`, [leadId]),
      db.query(`SELECT * FROM inventory WHERE id = $1`, [inventoryId]),
    ]);

    if (!leadRes.rows.length) return res.status(404).json({ error: 'Lead not found' });
    if (!unitRes.rows.length) return res.status(404).json({ error: 'Inventory not found' });

    const lead = leadRes.rows[0];
    const unit = unitRes.rows[0];

    // Build sequence
    const sequence = await buildSequence({ leadId, inventoryId, sequenceType, lead, unit });

    // Save email campaign
    const campaignRes = await db.query(
      `INSERT INTO email_campaigns (name, subject, sequence_number, template_body, status, created_by)
       VALUES ($1, $2, $3, $4, 'active', $5)
       RETURNING id`,
      [
        `${lead.name} — ${unit.year} ${unit.make} ${unit.model}`,
        sequence.steps[0].subject,
        sequence.totalSteps,
        JSON.stringify(sequence),
        req.user.id,
      ]
    );

    const campaignId = campaignRes.rows[0].id;

    // Save sequence record
    await db.query(
      `INSERT INTO email_sequences (lead_id, inventory_id, sequence_status, current_step, next_scheduled_at)
       VALUES ($1, $2, 'active', 0, $3)
       ON CONFLICT (lead_id, inventory_id) DO UPDATE SET sequence_status = 'active', current_step = 0`,
      [leadId, inventoryId, sequence.steps[0].scheduledAt]
    );

    // Build and send first email immediately
    const emailData = await buildEmailForStep({ sequence, stepIndex: 0, lead, unit });
    await sendEmail({ ...emailData, campaignId, leadId });

    res.json({
      sequenceId: sequence.sequenceId,
      campaignId,
      leadId,
      inventoryId,
      totalSteps: sequence.totalSteps,
      nextScheduledAt: sequence.steps[0].scheduledAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/email/analytics/:id ──────────────────────────────
router.get('/analytics/:id', async (req, res, next) => {
  try {
    const analytics = await getCampaignAnalytics(req.params.id);
    const campaignRes = await db.query(
      `SELECT * FROM email_campaigns WHERE id = $1`,
      [req.params.id]
    );
    if (!campaignRes.rows.length) return res.status(404).json({ error: 'Campaign not found' });

    const recipients = await db.query(
      `SELECT r.*, l.name as lead_name, l.email as lead_email
       FROM email_recipients r
       LEFT JOIN leads l ON l.id = r.lead_id
       WHERE r.campaign_id = $1
       ORDER BY r.sent_at DESC`,
      [req.params.id]
    );

    res.json({
      campaign: campaignRes.rows[0],
      analytics,
      recipients: recipients.rows,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/email/webhook ─────────────────────────────────────
router.post('/webhook', async (req, res, next) => {
  try {
    const results = await handleSendGridWebhook(req.body);
    res.json({ received: results.length, results });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/email/track/open/:encoded ──────────────────────────
router.get('/track/open/:encoded', async (req, res, next) => {
  try {
    const { c, l } = JSON.parse(Buffer.from(req.params.encoded, 'base64').toString());
    await recordOpen({ campaignId: c, leadId: l });
    // Return 1x1 transparent GIF
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  } catch (err) {
    res.set('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
});

// ─── GET /api/email/track/click/:encoded ───────────────────────
router.get('/track/click/:encoded', async (req, res, next) => {
  try {
    const { c, l, u } = JSON.parse(Buffer.from(req.params.encoded, 'base64').toString());
    const { redirect } = await recordClick({ campaignId: c, leadId: l, targetUrl: u });
    res.redirect(301, redirect);
  } catch (err) {
    // Fail open — redirect to target URL
    try {
      const { u } = JSON.parse(Buffer.from(req.params.encoded, 'base64').toString());
      res.redirect(301, u);
    } catch {
      res.redirect(301, '/');
    }
  }
});

module.exports = router;
