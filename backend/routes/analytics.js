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
const db = require('../db');

function isOptionalAnalyticsSchemaError(err) {
  return err && ['42P01', '42703', '23514'].includes(err.code);
}

async function optionalAnalyticsQuery(label, fn, fallbackRows = []) {
  try {
    return { result: await fn(), warning: null };
  } catch (err) {
    if (!isOptionalAnalyticsSchemaError(err)) throw err;
    console.warn(`Analytics optional surface ${label} unavailable: ${err.message}`);
    return { result: { rows: fallbackRows }, warning: `${label} unavailable` };
  }
}

// ─── GET /api/analytics/overview ───────────────────────────────
router.get('/overview', async (req, res, next) => {
  try {
    const [
      totalLeads,
      totalInventory,
      emailStats,
      listingStats,
      marketplaceTotals,
      leadSourceStats,
      recentActivity,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) as total FROM leads`),
      db.query(`SELECT COUNT(*) as total FROM inventory WHERE status != 'sold'`),
      optionalAnalyticsQuery('email_recipients', () => db.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'sent') as emails_sent,
          COUNT(*) FILTER (WHERE status = 'opened') as emails_opened,
          COUNT(*) FILTER (WHERE status = 'clicked') as emails_clicked,
          COUNT(*) FILTER (WHERE status = 'bounced') as emails_bounced
        FROM email_recipients
      `), [{ emails_sent: 0, emails_opened: 0, emails_clicked: 0, emails_bounced: 0 }]),
      optionalAnalyticsQuery('inventory_listings', () => db.query(`
        SELECT platform, COUNT(*) as total,
               COUNT(*) FILTER (WHERE status = 'published') as active,
               COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM inventory_listings
        GROUP BY platform
      `)),
      optionalAnalyticsQuery('marketplace_analytics totals', () => db.query(`
        SELECT
          COALESCE(SUM(views), 0) as total_views,
          COALESCE(SUM(inquiries), 0) as total_inquiries,
          COALESCE(SUM(leads_generated), 0) as leads_generated
        FROM marketplace_analytics
      `), [{ total_views: 0, total_inquiries: 0, leads_generated: 0 }]),
      optionalAnalyticsQuery('lead source', () => db.query(`
        SELECT COALESCE(NULLIF(source, ''), 'Unknown') as name, COUNT(*)::int as value
        FROM leads
        GROUP BY COALESCE(NULLIF(source, ''), 'Unknown')
        ORDER BY value DESC
        LIMIT 8
      `)),
      optionalAnalyticsQuery('email_sequences', () => db.query(`
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
      `)),
    ]);

    const e = emailStats.result.rows[0] || {};
    const mt = marketplaceTotals.result.rows[0] || {};
    const sent = parseInt(e.emails_sent) || 0;
    const opened = parseInt(e.emails_opened) || 0;
    const clicked = parseInt(e.emails_clicked) || 0;
    const warnings = [
      emailStats.warning,
      listingStats.warning,
      marketplaceTotals.warning,
      leadSourceStats.warning,
      recentActivity.warning,
    ].filter(Boolean);

    res.json({
      kpis: {
        totalLeads: parseInt(totalLeads.rows[0]?.total) || 0,
        totalInventory: parseInt(totalInventory.rows[0]?.total) || 0,
        emailsSent: sent,
        emailOpenRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0',
        emailClickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0',
        activeListings: listingStats.result.rows.reduce((s, r) => s + parseInt(r.active || 0), 0),
        totalListingViews: parseInt(mt.total_views) || 0,
        marketplaceInquiries: parseInt(mt.total_inquiries) || 0,
        leadsGenerated: parseInt(mt.leads_generated) || 0,
      },
      platformBreakdown: listingStats.result.rows,
      leadSourceBreakdown: leadSourceStats.result.rows.map((row) => ({
        name: row.name || 'Unknown',
        value: parseInt(row.value) || 0,
      })),
      recentEmailActivity: recentActivity.result.rows,
      degraded: warnings.length > 0,
      warnings,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/inventory/:id ──────────────────────────
router.get('/inventory/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [unit, listings, analytics, emailSeqs] = await Promise.all([
      db.query(`SELECT id, make, model, year, listing_price, status, images FROM inventory WHERE id = $1`, [id]),
      optionalAnalyticsQuery('inventory_listings', () => db.query(`SELECT * FROM inventory_listings WHERE inventory_id = $1`, [id])),
      optionalAnalyticsQuery('marketplace_analytics', () => db.query(
        `SELECT platform, date, views, inquiries, shares, leads_generated, roi
         FROM marketplace_analytics
         WHERE inventory_id = $1
         ORDER BY date DESC
         LIMIT 90`,
        [id]
      )),
      optionalAnalyticsQuery('email_sequences', () => db.query(
        `SELECT es.*, l.name as lead_name, l.email as lead_email, l.status as lead_status
         FROM email_sequences es
         JOIN leads l ON l.id = es.lead_id
         WHERE es.inventory_id = $1
         ORDER BY es.started_at DESC`,
        [id]
      )),
    ]);

    if (!unit.rows.length) return res.status(404).json({ error: 'Inventory not found' });

    const warnings = [listings.warning, analytics.warning, emailSeqs.warning].filter(Boolean);
    const totals = analytics.result.rows.reduce((acc, row) => ({
      views: acc.views + parseInt(row.views || 0),
      inquiries: acc.inquiries + parseInt(row.inquiries || 0),
      shares: acc.shares + parseInt(row.shares || 0),
      leads: acc.leads + parseInt(row.leads_generated || 0),
    }), { views: 0, inquiries: 0, shares: 0, leads: 0 });

    res.json({
      unit: unit.rows[0],
      listings: listings.result.rows,
      totals,
      timeline: analytics.result.rows.reverse(), // Oldest first for charts
      emailSequences: emailSeqs.result.rows,
      degraded: warnings.length > 0,
      warnings,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/platforms ──────────────────────────────
router.get('/platforms', async (req, res, next) => {
  try {
    const breakdown = await optionalAnalyticsQuery('platform analytics', () => db.query(`
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
    `));

    res.json({
      platforms: breakdown.result.rows,
      degraded: !!breakdown.warning,
      warnings: breakdown.warning ? [breakdown.warning] : [],
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/timeline ───────────────────────────────
router.get('/timeline', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const offset = process.env.NODE_ENV === 'production' ? '' : '';

    const timeline = await optionalAnalyticsQuery('marketplace_analytics', () => db.query(`
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
    `));

    res.json({
      timeline: timeline.result.rows,
      degraded: !!timeline.warning,
      warnings: timeline.warning ? [timeline.warning] : [],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
