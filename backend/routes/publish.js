/**
 * Publish Routes — Cross-platform listing orchestration
 * POST /api/publish/:inventoryId     — Publish to selected platforms
 * GET  /api/publish/:inventoryId     — Get listing status for all platforms
 * GET  /api/publish/:inventoryId/:platform — Get specific listing status
 * POST /api/publish/:inventoryId/:platform/unpublish
 */

const express = require('express');
const router = express.Router();
const { getToken } = require('../middleware/auth');
const { generateProductSchema } = require('../services/seo/schemaGenerator');
const { generateMeta, generateSlug } = require('../services/seo/metaGenerator');
const { generateFaq } = require('../services/seo/faqGenerator');
const db = require('../db');

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
router.post('/:inventoryId', getToken, async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { platforms = [], options = {} } = req.body;

    // Fetch inventory
    const invRes = await db.query(`SELECT * FROM inventory WHERE id = $1`, [inventoryId]);
    if (!invRes.rows.length) return res.status(404).json({ error: 'Inventory not found' });
    const unit = invRes.rows[0];

    // Generate SEO data
    const meta = generateMeta(unit);
    const slug = generateSlug(unit);
    const faqData = generateFaq(unit);

    // Save SEO record
    await db.query(
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
    );

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

      // Create listing record
      const listingRes = await db.query(
        `INSERT INTO inventory_listings (inventory_id, platform, status, options, published_at)
         VALUES ($1, $2, 'publishing', $3, NOW())
         ON CONFLICT (inventory_id, platform) DO UPDATE SET
           status = 'publishing', options = EXCLUDED.options, published_at = NOW(), updated_at = NOW()
         RETURNING id`,
        [inventoryId, platform, JSON.stringify(options[platform] || {})]
      );
      const listingId = listingRes.rows[0].id;

      try {
        const publishResult = await handler(unit, options[platform] || {});
        // Update listing with result
        await db.query(
          `UPDATE inventory_listings SET
             platform_listing_id = $2, platform_url = $3,
             status = 'published', published_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [listingId, publishResult.listingId || publishResult.id, publishResult.url]
        );

        results.push({
          platform,
          status: 'published',
          listingId: publishResult.listingId || publishResult.id,
          url: publishResult.url,
        });
      } catch (err) {
        await db.query(
          `UPDATE inventory_listings SET status = 'failed', sync_error = $2, updated_at = NOW() WHERE id = $1`,
          [listingId, err.message]
        );
        results.push({ platform, status: 'error', error: err.message });
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
router.get('/:inventoryId', getToken, async (req, res, next) => {
  try {
    const { inventoryId } = req.params;

    const listings = await db.query(
      `SELECT * FROM inventory_listings WHERE inventory_id = $1 ORDER BY platform`,
      [inventoryId]
    );

    const seo = await db.query(
      `SELECT * FROM inventory_seo WHERE inventory_id = $1`,
      [inventoryId]
    );

    res.json({
      listings: listings.rows,
      seo: seo.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/publish/:inventoryId/:platform/unpublish
 */
router.post('/:inventoryId/:platform/unpublish', getToken, async (req, res, next) => {
  try {
    const { inventoryId, platform } = req.params;

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
