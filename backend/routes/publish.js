/**
 * Publish Routes — Cross-platform listing orchestration
 * POST /api/publish/:inventoryId     — Publish to selected platforms
 * GET  /api/publish/:inventoryId     — Get listing status for all platforms
 * GET  /api/publish/:inventoryId/:platform — Get specific listing status
 * POST /api/publish/:inventoryId/:platform/unpublish
 */

const express = require('express');
const router = express.Router();
const { generateProductSchema } = require('../services/seo/schemaGenerator');
const { generateMeta, generateSlug } = require('../services/seo/metaGenerator');
const { generateFaq } = require('../services/seo/faqGenerator');
const db = require('../db');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidInventoryId(inventoryId) {
  return UUID_RE.test(String(inventoryId || ''));
}

function rejectInvalidInventoryId(res, inventoryId) {
  if (isValidInventoryId(inventoryId)) return false;
  res.status(400).json({ error: 'Invalid inventory id' });
  return true;
}

function isOptionalPublishSchemaError(err) {
  return err && ['42P01', '42703'].includes(err.code);
}

async function optionalPublishQuery(label, fn, fallbackRows = []) {
  try {
    return { result: await fn(), warning: null };
  } catch (err) {
    if (!isOptionalPublishSchemaError(err)) throw err;
    console.warn(`Publish optional table ${label} unavailable: ${err.message}`);
    return { result: { rows: fallbackRows }, warning: `${label} unavailable` };
  }
}

// Platform publish handlers (mock — Cipher integrates real APIs)
const PLATFORM_HANDLERS = {
  craigslist: publishToCraigslist,
  facebook_marketplace: publishToFacebook,
  machinerytrader: publishToMachineryTrader,
  equipfinder: publishToEquipFinder,
  machineryats: publishToMachineryATS,
  youtube: publishToYouTube,
};

/**
 * POST /api/publish/:inventoryId
 * Body: { platforms: string[], options: object }
 */
router.post('/:inventoryId', async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    if (rejectInvalidInventoryId(res, inventoryId)) return;
    const { platforms = [], options = {} } = req.body;

    // Fetch inventory
    const invRes = await db.query(`SELECT * FROM inventory WHERE id = $1`, [inventoryId]);
    if (!invRes.rows.length) return res.status(404).json({ error: 'Inventory not found' });
    const unit = invRes.rows[0];

    // Generate SEO data
    const meta = generateMeta(unit);
    const slug = generateSlug(unit);
    const faqData = generateFaq(unit);

    // Save optional SEO record. Phase 6C publish tables are deploy-hardening
    // surfaces; schema drift must not turn safe no-op publish probes into 500s.
    await optionalPublishQuery('inventory_seo', () => db.query(
      `INSERT INTO inventory_seo (inventory_id, title, meta_description, og_title, og_description, og_image_url, schema_product, faq, slug, canonical_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (inventory_id) DO UPDATE SET
         title = EXCLUDED.title, meta_description = EXCLUDED.meta_description,
         og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
         og_image_url = EXCLUDED.og_image_url, schema_product = EXCLUDED.schema_product,
         faq = EXCLUDED.faq, slug = EXCLUDED.slug, canonical_url = EXCLUDED.canonical_url,
         updated_at = NOW()`,
      [
        inventoryId,
        meta.title,
        meta.description,
        meta.og.ogTitle,
        meta.og.ogDescription,
        unit.photos?.[0] || null,
        JSON.stringify(generateProductSchema(unit)),
        JSON.stringify(faqData.schema),
        slug,
        meta.canonical,
      ]
    ));

    // Update inventory status
    if (!unit.status || unit.status === 'intake') {
      await db.query(`UPDATE inventory SET status = 'listed', updated_at = NOW() WHERE id = $1`, [inventoryId]);
    }

    // Publish to each platform
    const results = [];
    for (const platform of platforms) {
      const handler = PLATFORM_HANDLERS[platform];
      if (!handler) {
        results.push({ platform, status: 'error', error: 'Unknown platform' });
        continue;
      }

      // Create listing record. If optional publish tables are missing or still on
      // an older Phase 6C schema, report this platform as unavailable instead of
      // crashing the whole request or invoking external publisher stubs.
      const listingAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
        `INSERT INTO inventory_listings (inventory_id, platform, status, options, published_at)
         VALUES ($1, $2, 'publishing', $3, NOW())
         ON CONFLICT (inventory_id, platform) DO UPDATE SET
           status = 'publishing', options = EXCLUDED.options, published_at = NOW(), updated_at = NOW()
         RETURNING id`,
        [inventoryId, platform, JSON.stringify(options[platform] || {})]
      ));
      if (listingAttempt.warning) {
        results.push({ platform, status: 'error', error: listingAttempt.warning });
        continue;
      }
      const listingId = listingAttempt.result.rows[0].id;

      try {
        const publishResult = await handler(unit, options[platform] || {});
        // Update listing with result. Treat older optional listing schemas as a
        // degraded platform result instead of turning safe publish probes into 500s.
        const updateAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
          `UPDATE inventory_listings SET
             platform_listing_id = $2, platform_url = $3,
             status = 'published', published_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [listingId, publishResult.listingId || publishResult.id, publishResult.url]
        ));
        if (updateAttempt.warning) {
          results.push({ platform, status: 'error', error: updateAttempt.warning });
          continue;
        }

        results.push({
          platform,
          status: 'published',
          listingId: publishResult.listingId || publishResult.id,
          url: publishResult.url,
        });
      } catch (err) {
        const failureAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
          `UPDATE inventory_listings SET status = 'failed', sync_error = $2, updated_at = NOW() WHERE id = $1`,
          [listingId, err.message]
        ));
        results.push({ platform, status: 'error', error: failureAttempt.warning || err.message });
      }
    }

    res.json({ inventoryId, unit: `${unit.year} ${unit.make} ${unit.model}`, results });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/publish/:inventoryId
 * Get all listing statuses for an inventory item
 */
router.get('/:inventoryId', async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    if (rejectInvalidInventoryId(res, inventoryId)) return;

    const warnings = [];
    const listingsAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
      `SELECT * FROM inventory_listings WHERE inventory_id = $1 ORDER BY platform`,
      [inventoryId]
    ));
    if (listingsAttempt.warning) warnings.push(listingsAttempt.warning);

    const seoAttempt = await optionalPublishQuery('inventory_seo', () => db.query(
      `SELECT * FROM inventory_seo WHERE inventory_id = $1`,
      [inventoryId]
    ));
    if (seoAttempt.warning) warnings.push(seoAttempt.warning);

    const analyticsAttempt = await optionalPublishQuery('marketplace_analytics', () => db.query(
      `SELECT platform, SUM(views) AS views, SUM(inquiries) AS inquiries, SUM(leads_generated) AS leads_generated
       FROM marketplace_analytics WHERE inventory_id = $1 GROUP BY platform`,
      [inventoryId]
    ));
    if (analyticsAttempt.warning) warnings.push(analyticsAttempt.warning);

    const analytics = analyticsAttempt.result.rows.reduce((acc, row) => {
      acc[row.platform] = row;
      return acc;
    }, {});

    res.json({
      listings: listingsAttempt.result.rows,
      seo: seoAttempt.result.rows[0] || null,
      analytics,
      degraded: warnings.length > 0,
      warnings,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/publish/:inventoryId/:platform/unpublish
 */
router.post('/:inventoryId/:platform/unpublish', async (req, res, next) => {
  try {
    const { inventoryId, platform } = req.params;
    if (rejectInvalidInventoryId(res, inventoryId)) return;

    const listing = await db.query(
      `SELECT * FROM inventory_listings WHERE inventory_id = $1 AND platform = $2`,
      [inventoryId, platform]
    );
    if (!listing.rows.length) return res.status(404).json({ error: 'Listing not found' });

    // Call platform-specific unpublish (mock)
    await db.query(
      `UPDATE inventory_listings SET status = 'unpublished', updated_at = NOW() WHERE inventory_id = $1 AND platform = $2`,
      [inventoryId, platform]
    );

    res.json({ status: 'unpublished', platform, inventoryId });
  } catch (err) {
    next(err);
  }
});

// ─── Platform Publishers (stubs — Cipher wires real APIs) ────────────────────

async function publishToCraigslist(unit, options) {
  // Cipher implements: Craigslist API or scrape
  const city = options.city || 'baltimore';
  const id = `cl_${unit.id}_${Date.now()}`;
  return { id, url: `https://${city}.craigslist.org/equip/${id}.html`, mock: true };
}

async function publishToFacebook(unit, options) {
  // Cipher implements: Facebook Marketplace API
  const id = `fb_${unit.id}_${Date.now()}`;
  return { id, url: `https://facebook.com/marketplace/item/${id}`, mock: true };
}

async function publishToMachineryTrader(unit, options) {
  const id = `mt_${unit.id}_${Date.now()}`;
  return { id, url: `https://machinerytrader.com/listings/${id}`, mock: true };
}

async function publishToEquipFinder(unit, options) {
  const id = `ef_${unit.id}_${Date.now()}`;
  return { id, url: `https://equipfinder.com/listing/${id}`, mock: true };
}

async function publishToMachineryATS(unit, options) {
  const id = `ma_${unit.id}_${Date.now()}`;
  return { id, url: `https://machineryats.com/listing/${id}`, mock: true };
}

async function publishToYouTube(unit, options) {
  // Cipher implements: YouTube Data API v3
  const id = `yt_${unit.id}_${Date.now()}`;
  return { id, url: `https://youtube.com/watch?v=${id}`, mock: true };
}

module.exports = router;
