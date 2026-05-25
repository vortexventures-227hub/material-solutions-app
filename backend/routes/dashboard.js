const express = require('express');
const router = express.Router();
const db = require('../db');

function isOptionalDashboardSchemaError(err) {
  return err && ['42P01', '42703', '23514'].includes(err.code);
}

async function optionalDashboardQuery(label, fn, fallbackRows = []) {
  try {
    return { result: await fn(), warning: null };
  } catch (err) {
    if (!isOptionalDashboardSchemaError(err)) throw err;
    console.warn(`Dashboard optional surface ${label} unavailable: ${err.message}`);
    return { result: { rows: fallbackRows }, warning: `${label} unavailable` };
  }
}

// GET /kpis - Dashboard metrics
router.get('/kpis', async (req, res, next) => {
  try {
    // Total active inventory
    const inventoryResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'listed') as listed,
        COUNT(*) FILTER (WHERE status = 'sold') as sold,
        COALESCE(SUM(sold_price) FILTER (WHERE status = 'sold' AND sold_at >= NOW() - INTERVAL '30 days'), 0) as revenue_30d
       FROM inventory`
    );
    
    // Lead metrics
    const leadsResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
        COUNT(*) FILTER (WHERE status = 'hot') as hot,
        COUNT(*) FILTER (WHERE status = 'converted') as converted,
        ROUND(AVG(score)) as avg_score
       FROM leads`
    );
    
    // Conversion rate
    const conversionRate = leadsResult.rows[0].total > 0
      ? ((leadsResult.rows[0].converted / leadsResult.rows[0].total) * 100).toFixed(1)
      : 0;

    const recentListings = await db.query(
      `SELECT id, make, model, year, listing_price, status, created_at
       FROM inventory
       WHERE status IN ('listed', 'reserved', 'pending', 'sold')
       ORDER BY created_at DESC
       LIMIT 3`
    );

    const hotLeads = await db.query(
      `SELECT id, name, company, score, status, created_at
       FROM leads
       WHERE status = 'hot' OR score >= 80
       ORDER BY score DESC, created_at DESC
       LIMIT 3`
    );

    const publishSummary = await optionalDashboardQuery('inventory_listings', () => db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'manual_required') as manual_required,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
       FROM inventory_listings`
    ), [{ total: 0, published: 0, manual_required: 0, failed: 0 }]);

    const manualPublishQueue = await optionalDashboardQuery('inventory_listings queue', () => db.query(
      `SELECT
        il.inventory_id,
        il.platform,
        il.status,
        il.platform_url,
        il.sync_error,
        il.updated_at,
        i.year,
        i.make,
        i.model
       FROM inventory_listings il
       LEFT JOIN inventory i ON i.id = il.inventory_id
       WHERE il.status IN ('manual_required', 'failed', 'publishing')
       ORDER BY il.updated_at DESC NULLS LAST, il.published_at DESC NULLS LAST
       LIMIT 5`
    ));

    const ps = publishSummary.result.rows[0] || {};
    
    res.json({
      inventory: {
        total: parseInt(inventoryResult.rows[0].total),
        listed: parseInt(inventoryResult.rows[0].listed),
        sold: parseInt(inventoryResult.rows[0].sold),
        revenue_30d: parseFloat(inventoryResult.rows[0].revenue_30d)
      },
      leads: {
        total: parseInt(leadsResult.rows[0].total),
        this_week: parseInt(leadsResult.rows[0].this_week),
        hot: parseInt(leadsResult.rows[0].hot),
        converted: parseInt(leadsResult.rows[0].converted),
        avg_score: parseInt(leadsResult.rows[0].avg_score || 0),
        conversion_rate: parseFloat(conversionRate)
      },
      publishing: {
        total: parseInt(ps.total || 0),
        published: parseInt(ps.published || 0),
        manual_required: parseInt(ps.manual_required || 0),
        failed: parseInt(ps.failed || 0),
        degraded: !!publishSummary.warning,
        warning: publishSummary.warning,
      },
      recentListings: recentListings.rows,
      hotLeads: hotLeads.rows,
      manualPublishQueue: manualPublishQueue.result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    next(error);
  }
});

// GET /pipeline - Pipeline counts by status
router.get('/pipeline', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT status, COUNT(*) as count
       FROM inventory
       GROUP BY status
       ORDER BY 
         CASE status
           WHEN 'intake' THEN 1
           WHEN 'listed' THEN 2
           WHEN 'reserved' THEN 3
           WHEN 'pending' THEN 4
           WHEN 'sold' THEN 5
           ELSE 6
         END`
    );
    
    res.json({ pipeline: result.rows });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    next(error);
  }
});

module.exports = router;
