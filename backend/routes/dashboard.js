const express = require('express');
const router = express.Router();
const db = require('../db');

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
