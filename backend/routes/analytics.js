/**
 * Analytics Routes
 * GET /api/analytics/overview           — Dashboard-level KPIs
 * GET /api/analytics/inventory/:id       — Per-listing performance
 * GET /api/analytics/platforms           — Platform comparison
 * GET /api/analytics/leads               — Lead attribution
 * GET /api/analytics/timeline            — Time-series data
 */

const express = require('express');
const router = express.Router();
const { getToken } = require('../middleware/auth');
const db = require('../db');

// ─── GET /api/analytics/overview ───────────────────────────────
router.get('/overview', getToken, async (req, res, next) => {
  try {
    const [
      totalLeads,
      totalInventory,
      emailStats,
      listingStats,
      recentActivity,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) as total FROM leads`),
      db.query(`SELECT COUNT(*) as total FROM inventory WHERE status != 'sold'`),
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'sent') as emails_sent,
          COUNT(*) FILTER (WHERE status = 'opened') as emails_opened,
          COUNT(*) FILTER (WHERE status = 'clicked') as emails_clicked,
          COUNT(*) FILTER (WHERE status = 'bounced') as emails_bounced
        FROM email_recipients
      `),
      db.query(`
        SELECT platform, COUNT(*) as total,
               COUNT(*) FILTER (WHERE status = 'published') as active,
               COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM inventory_listings
        GROUP BY platform
      `),
      db.query(`
        SELECT
          l.name, l.email, l.status as lead_status, l.score,
          es.inventory_id, es.current_step, es.sequence_status,
          es.last_sent_at, es.next_scheduled_at,
          i.year, i.make, i.model
        FROM email_sequences es
        JOIN leads l ON l.id = es.lead_id
        JOIN inventory i ON i.id = es.inventory_id
        WHERE es.sequence_status IN ('active', 'completed')
        ORDER BY es.last_sent_at DESC NULLS LAST
        LIMIT 20
      `),
    ]);

    const e = emailStats.rows[0] || {};
    const sent = parseInt(e.emails_sent) || 0;
    const opened = parseInt(e.emails_opened) || 0;
    const clicked = parseInt(e.emails_clicked) || 0;

    res.json({
      kpis: {
        totalLeads: parseInt(totalLeads.rows[0]?.total) || 0,
        totalInventory: parseInt(totalInventory.rows[0]?.total) || 0,
        emailsSent: sent,
        emailOpenRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0',
        emailClickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0',
        activeListings: listingStats.rows.reduce((s, r) => s + parseInt(r.active), 0),
      },
      platformBreakdown: listingStats.rows,
      recentEmailActivity: recentActivity.rows,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/inventory/:id ──────────────────────────
router.get('/inventory/:id', getToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [unit, listings, analytics, emailSeqs] = await Promise.all([
      db.query(`SELECT id, make, model, year, asking_price, status, photos FROM inventory WHERE id = $1`, [id]),
      db.query(`SELECT * FROM inventory_listings WHERE inventory_id = $1`, [id]),
      db.query(
        `SELECT platform, date, views, inquiries, shares, leads_generated, roi
         FROM marketplace_analytics
         WHERE inventory_id = $1
         ORDER BY date DESC
         LIMIT 90`,
        [id]
      ),
      db.query(
        `SELECT es.*, l.name as lead_name, l.email as lead_email, l.status as lead_status
         FROM email_sequences es
         JOIN leads l ON l.id = es.lead_id
         WHERE es.inventory_id = $1
         ORDER BY es.started_at DESC`,
        [id]
      ),
    ]);

    if (!unit.rows.length) return res.status(404).json({ error: 'Inventory not found' });

    const totals = analytics.rows.reduce((acc, row) => ({
      views: acc.views + parseInt(row.views || 0),
      inquiries: acc.inquiries + parseInt(row.inquiries || 0),
      shares: acc.shares + parseInt(row.shares || 0),
      leads: acc.leads + parseInt(row.leads_generated || 0),
    }), { views: 0, inquiries: 0, shares: 0, leads: 0 });

    res.json({
      unit: unit.rows[0],
      listings: listings.rows,
      totals,
      timeline: analytics.rows.reverse(), // Oldest first for charts
      emailSequences: emailSeqs.rows,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/platforms ──────────────────────────────
router.get('/platforms', getToken, async (req, res, next) => {
  try {
    const breakdown = await db.query(`
      SELECT
        il.platform,
        COUNT(*) as total_publishes,
        COUNT(*) FILTER (WHERE il.status = 'published') as published,
        COUNT(*) FILTER (WHERE il.status = 'failed') as failed,
        COUNT(*) FILTER (WHERE il.status = 'pending') as pending,
        SUM(ma.views) as total_views,
        SUM(ma.inquiries) as total_inquiries,
        AVG(ma.roi) as avg_roi
      FROM inventory_listings il
      LEFT JOIN marketplace_analytics ma ON ma.inventory_id = il.inventory_id AND ma.platform = il.platform
      GROUP BY il.platform
      ORDER BY SUM(ma.views) DESC NULLS LAST
    `);

    res.json({ platforms: breakdown.rows });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/timeline ───────────────────────────────
router.get('/timeline', getToken, async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const offset = process.env.NODE_ENV === 'production' ? '' : '';

    const timeline = await db.query(`
      SELECT
        DATE(ma.date) as date,
        SUM(ma.views) as views,
        SUM(ma.inquiries) as inquiries,
        SUM(ma.leads_generated) as leads_generated,
        COUNT(DISTINCT ma.inventory_id) as units_viewed
      FROM marketplace_analytics ma
      WHERE ma.date >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(ma.date)
      ORDER BY date ASC
    `);

    res.json({ timeline: timeline.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
