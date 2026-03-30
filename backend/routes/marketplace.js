/**
 * Marketplace API Routes
 * POST /api/inventory/:id/publish
 * GET /api/inventory/:id/publish/status/:jobId
 * GET /api/inventory/:id/listings
 * POST /api/inventory/:id/republish/:platform
 */

const express = require('express');
const router = express.Router();
const MarketplaceOrchestrator = require('../services/marketplace/orchestrator');

// Lazy initialization to avoid circular deps
let orchestrator = null;

const getOrchestrator = () => {
  if (!orchestrator) {
    orchestrator = new MarketplaceOrchestrator(req.app.locals.db);
    orchestrator.initialize().catch(console.error);
  }
  return orchestrator;
};

// Middleware to get DB
router.use((req, res, next) => {
  req.db = req.app.locals.db;
  next();
});

/**
 * POST /api/inventory/:id/publish
 * Publish inventory to marketplace platforms
 */
router.post('/inventory/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms = ['website'], regenerateContent = true } = req.body;

    // Validate inventory exists
    const inventory = await req.db.query(
      'SELECT id FROM inventory WHERE id = $1',
      [id]
    );

    if (inventory.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // Initialize orchestrator
    const orch = new MarketplaceOrchestrator(req.db);
    await orch.initialize();

    // Start publish job
    const result = await orch.publish(id, { platforms, regenerateContent });

    res.json({
      success: true,
      jobId: result.jobId,
      message: `Publishing to ${platforms.join(', ')}`,
      platforms: result.platforms
    });

  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:id/publish/status/:jobId
 * Get status of a publish job
 */
router.get('/inventory/:id/publish/status/:jobId', async (req, res) => {
  try {
    const { id, jobId } = req.params;

    const result = await req.db.query(
      'SELECT * FROM publish_jobs WHERE id = $1 AND inventory_id = $2',
      [jobId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = result.rows[0];

    res.json({
      jobId: job.id,
      status: job.status,
      platforms: job.platforms,
      progress: job.progress,
      errorCount: job.error_count,
      errors: job.error_log,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdAt: job.created_at
    });

  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:id/listings
 * Get all listings for an inventory item
 */
router.get('/inventory/:id/listings', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(`
      SELECT 
        il.*,
        pjc.status as job_status
      FROM inventory_listings il
      LEFT JOIN publish_jobs pjc ON pjc.inventory_id = il.inventory_id
      WHERE il.inventory_id = $1
      ORDER BY il.created_at DESC
    `, [id]);

    res.json({
      listings: result.rows
    });

  } catch (error) {
    console.error('Listings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/inventory/:id/republish/:platform
 * Republish to a single platform
 */
router.post('/inventory/:id/republish/:platform', async (req, res) => {
  try {
    const { id, platform } = req.params;

    // Validate inventory exists
    const inventory = await req.db.query(
      'SELECT id FROM inventory WHERE id = $1',
      [id]
    );

    if (inventory.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // Initialize orchestrator
    const orch = new MarketplaceOrchestrator(req.db);
    await orch.initialize();

    // Republish
    const result = await orch.republish(id, platform);

    res.json({
      success: true,
      jobId: result.jobId,
      platform,
      result: result.platforms[platform]
    });

  } catch (error) {
    console.error('Republish error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/stats
 * Get marketplace statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const orch = new MarketplaceOrchestrator(req.db);
    await orch.initialize();
    
    const stats = await orch.getStats();

    res.json({ stats });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/platforms
 * Get available platforms and their status
 */
router.get('/platforms', async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT 
        platform,
        is_active,
        rate_limit_remaining,
        settings,
        updated_at
      FROM marketplace_configs
      ORDER BY platform
    `);

    res.json({
      platforms: result.rows.map(p => ({
        name: p.platform,
        active: p.is_active,
        rateLimitRemaining: p.rate_limit_remaining,
        lastUpdated: p.updated_at
      }))
    });

  } catch (error) {
    console.error('Platforms error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
