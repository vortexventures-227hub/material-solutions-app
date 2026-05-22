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
const { runCraigslistBridge } = require('../services/local-publisher/craigslistBridge');
const { buildManualPlatformDraft } = require('../services/local-publisher/manualDraft');
const db = require('../db');
const SEO_CONFIG = require('../services/seo/seoConfig');

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
  return err && ['42P01', '42703', '23514'].includes(err.code);
}

function parseArrayField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function isBuyerPublicMediaUrl(url) {
  return typeof url === 'string'
    && (/^https?:\/\//i.test(url) || /^\/(images|videos|assets|inventory)\//i.test(url));
}

function normalizeUnitForMarketing(unit) {
  const images = parseArrayField(unit.images);
  const photos = parseArrayField(unit.photos);
  const media = photos.length ? photos : images;
  const publicMedia = media.filter(isBuyerPublicMediaUrl);

  return {
    ...unit,
    asking_price: unit.asking_price || unit.listing_price || null,
    photos: publicMedia,
    images: publicMedia,
    raw_media_paths: media,
    condition: unit.condition || (unit.condition_score ? `condition score ${unit.condition_score}/10` : 'used'),
  };
}

function buildMarketingAssets(unit) {
  const normalizedUnit = normalizeUnitForMarketing(unit);
  const meta = generateMeta(normalizedUnit);
  const slug = generateSlug(normalizedUnit);
  const faqData = generateFaq(normalizedUnit);
  const schemaProduct = generateProductSchema(normalizedUnit);
  const mediaUrls = normalizedUnit.photos || [];

  const requiredFields = {
    title: Boolean(meta.title),
    description: Boolean(meta.description),
    price: Boolean(normalizedUnit.asking_price),
    specs: Boolean(normalizedUnit.make && normalizedUnit.model),
    mediaUrl: mediaUrls.some(isBuyerPublicMediaUrl),
    seoMeta: Boolean(meta.title && meta.description && meta.canonical),
    aeoAnswerBlock: Array.isArray(faqData.schema) && faqData.schema.length > 0,
    schemaJsonLd: Boolean(schemaProduct && schemaProduct['@context'] === 'https://schema.org'),
  };

  return {
    normalizedUnit,
    meta,
    slug,
    faqData,
    schemaProduct,
    payload: {
      inventoryId: normalizedUnit.id,
      title: meta.title,
      description: meta.description,
      price: normalizedUnit.asking_price ? Number(normalizedUnit.asking_price) : null,
      specs: {
        make: normalizedUnit.make,
        model: normalizedUnit.model,
        year: normalizedUnit.year,
        serial: normalizedUnit.serial,
        hours: normalizedUnit.hours,
        capacityLbs: normalizedUnit.capacity_lbs,
        mastType: normalizedUnit.mast_type,
        liftHeightInches: normalizedUnit.lift_height_inches,
        powerType: normalizedUnit.power_type,
        batteryInfo: normalizedUnit.battery_info,
        condition: normalizedUnit.condition,
        conditionScore: normalizedUnit.condition_score,
        conditionNotes: normalizedUnit.condition_notes,
      },
      media: {
        primaryUrl: mediaUrls[0] || null,
        urls: mediaUrls,
        rawPaths: normalizedUnit.raw_media_paths || [],
        publicUrlReady: mediaUrls.some(isBuyerPublicMediaUrl),
      },
      seo: {
        title: meta.title,
        metaDescription: meta.description,
        keywords: meta.keywords,
        canonical: meta.canonical,
        slug,
        openGraph: meta.og,
      },
      aeo: {
        faq: faqData.schema,
        html: faqData.html,
      },
      schema: {
        product: schemaProduct,
        jsonLd: schemaProduct,
      },
      requiredFields,
      complete: Object.values(requiredFields).every(Boolean),
    },
  };
}

async function buildLocalPublisherReceipt(platform, marketingPayload, options = {}) {
  if (platform !== 'craigslist') return null;

  try {
    const receipt = await runCraigslistBridge(marketingPayload, {
      ...options,
      dryRun: true,
    });

    return {
      platform,
      status: receipt.status,
      dryRun: receipt.dryRun,
      receiptId: receipt.receiptId,
      mutationPerformed: receipt.browser?.mutationPerformed === true,
      target: receipt.draft?.target || null,
      draft: receipt.draft || null,
    };
  } catch (err) {
    return {
      platform,
      status: 'bridge_unavailable',
      dryRun: true,
      mutationPerformed: false,
      error: err.message,
      missing: err.missing || undefined,
    };
  }
}

function safeBuildManualPlatformDraft(platform, marketingPayload, options = {}) {
  try {
    return buildManualPlatformDraft(platform, marketingPayload, options);
  } catch (err) {
    return {
      platform,
      inventoryId: marketingPayload?.inventoryId || null,
      error: err.message,
      target: { postUrl: null, reviewRequired: true },
      fields: {
        title: marketingPayload?.title || null,
        body: [
          marketingPayload?.description || null,
          marketingPayload?.inventoryId ? `Photos/details: ${SEO_CONFIG.baseUrl}/inventory/${marketingPayload.inventoryId}` : null,
        ].filter(Boolean).join('\n\n') || null,
        listingUrl: marketingPayload?.inventoryId ? `${SEO_CONFIG.baseUrl}/inventory/${marketingPayload.inventoryId}` : null,
      },
      media: marketingPayload?.media || {},
    };
  }
}

function isDryRunRequested(body = {}) {
  return body.dryRun === true || body.testMode === true;
}

async function buildDryRunPlatformResult(platform, unit, marketingPayload, platformOptions = {}) {
  if (!PLATFORM_HANDLERS[platform]) {
    return {
      platform,
      status: 'error',
      dryRun: true,
      mutationPerformed: false,
      error: 'Unknown platform',
    };
  }

  if (platform === 'materialsolutionsnj') {
    return {
      platform,
      status: 'dry_run_ready',
      dryRun: true,
      mutationPerformed: false,
      listingId: `msnj-${unit.id}`,
      url: `${SEO_CONFIG.baseUrl}/inventory/${unit.id}`,
      manualPasteRequired: false,
    };
  }

  const localPublisher = await buildLocalPublisherReceipt(platform, marketingPayload, platformOptions);
  const draft = localPublisher?.draft || safeBuildManualPlatformDraft(platform, marketingPayload, platformOptions);

  return {
    platform,
    status: 'manual_required',
    dryRun: true,
    mutationPerformed: false,
    url: null,
    manualPasteRequired: true,
    localPublisher,
    draft,
  };
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

async function saveSeoRecord(inventoryId, unit, meta, slug, faqData) {
  const schemaJson = JSON.stringify(generateProductSchema(normalizeUnitForMarketing(unit)));
  const faqJson = JSON.stringify(faqData.schema);
  const legacyValues = [
    inventoryId,
    meta.title,
    meta.description,
    meta.og.ogTitle,
    meta.og.ogDescription,
    normalizeUnitForMarketing(unit).photos?.[0] || null,
    schemaJson,
    faqJson,
    slug,
    meta.canonical,
  ];

  try {
    await db.query(
      `INSERT INTO inventory_seo (inventory_id, title, meta_description, og_title, og_description, og_image_url, schema_product, faq, slug, canonical_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (inventory_id) DO UPDATE SET
         title = EXCLUDED.title, meta_description = EXCLUDED.meta_description,
         og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
         og_image_url = EXCLUDED.og_image_url, schema_product = EXCLUDED.schema_product,
         faq = EXCLUDED.faq, slug = EXCLUDED.slug, canonical_url = EXCLUDED.canonical_url,
         updated_at = NOW()`,
      legacyValues
    );
    return;
  } catch (err) {
    if (!isOptionalPublishSchemaError(err)) throw err;
  }

  const migration006Values = [
    inventoryId,
    meta.title,
    meta.description,
    meta.og.ogTitle,
    meta.og.ogDescription,
    schemaJson,
    faqJson,
    meta.keywords ? meta.keywords.split(',').map((kw) => kw.trim()).filter(Boolean) : [],
    JSON.stringify({ primary: meta.og.ogImageAlt || null }),
  ];

  try {
    await db.query(
      `INSERT INTO inventory_seo (inventory_id, meta_title, meta_description, og_title, og_description, schema_json, faq_json, keywords, alt_texts, og_image_url, slug, canonical_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (inventory_id) DO UPDATE SET
         meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
         og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
         schema_json = EXCLUDED.schema_json, faq_json = EXCLUDED.faq_json,
         keywords = EXCLUDED.keywords, alt_texts = EXCLUDED.alt_texts,
         og_image_url = EXCLUDED.og_image_url, slug = EXCLUDED.slug,
         canonical_url = EXCLUDED.canonical_url, updated_at = NOW()`,
    [...migration006Values, meta.og.ogImage || normalizeUnitForMarketing(unit).photos?.[0] || null, slug, meta.canonical]
  );
    return;
  } catch (err) {
    if (!isOptionalPublishSchemaError(err)) throw err;
  }

  await optionalPublishQuery('inventory_seo', () => db.query(
    `INSERT INTO inventory_seo (inventory_id, meta_title, meta_description, og_title, og_description, schema_json, faq_json, keywords, alt_texts)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (inventory_id) DO UPDATE SET
       meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
       og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
       schema_json = EXCLUDED.schema_json, faq_json = EXCLUDED.faq_json,
       keywords = EXCLUDED.keywords, alt_texts = EXCLUDED.alt_texts,
       updated_at = NOW()`,
    migration006Values
  ));
}

// Platform publish handlers (mock — Cipher integrates real APIs)
const PLATFORM_HANDLERS = {
  materialsolutionsnj: publishToMaterialSolutionsNj,
  craigslist: publishToCraigslist,
  facebook_marketplace: publishToFacebook,
  machinerytrader: publishToMachineryTrader,
  equipfinder: publishToEquipFinder,
  machineryats: publishToMachineryATS,
  ebay: publishToEbay,
  linkedin: publishToLinkedIn,
  google_business_profile: publishToGoogleBusinessProfile,
  forkliftaction_forum: publishToForkliftActionForum,
  youtube: publishToYouTube,
};

const PLATFORM_CATALOG = [
  {
    key: 'materialsolutionsnj',
    label: 'MaterialSolutionsNJ.com',
    available: true,
    status: 'live',
    mode: 'automatic',
    completion: 95,
    nextStep: 'Set fresh storefront FSM production auth and verify live inventory smoke.',
  },
  {
    key: 'craigslist',
    label: 'Craigslist',
    available: false,
    status: 'manual_required',
    mode: 'guarded_local_draft',
    completion: 70,
    nextStep: 'Add local browser adapter with human submit approval.',
  },
  {
    key: 'facebook_marketplace',
    label: 'Facebook Marketplace',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 65,
    nextStep: 'Confirm Chris-approved account/page, category fit, and keep operator-reviewed drafts before any posting workflow.',
  },
  {
    key: 'machinerytrader',
    label: 'MachineryTrader',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 60,
    nextStep: 'Connect vendor posting credentials or keep operator-reviewed drafts.',
  },
  {
    key: 'equipfinder',
    label: 'EquipFinder',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 60,
    nextStep: 'Connect vendor posting credentials or keep operator-reviewed drafts.',
  },
  {
    key: 'machineryats',
    label: 'MachineryATS',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 60,
    nextStep: 'Connect vendor posting credentials or keep operator-reviewed drafts.',
  },
  {
    key: 'ebay',
    label: 'eBay Business',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 62,
    nextStep: 'Confirm eBay Business seller account, OAuth scopes, category, item specifics, and business policies before API or browser posting.',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 55,
    nextStep: 'Confirm target company/page posting path.',
  },
  {
    key: 'google_business_profile',
    label: 'Google Business Profile',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 55,
    nextStep: 'Confirm post type and GBP account authorization.',
  },
  {
    key: 'forkliftaction_forum',
    label: 'Forkliftaction Forum',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 55,
    nextStep: 'Confirm forum account and posting rules.',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    available: false,
    status: 'manual_required',
    mode: 'guarded_manual_draft',
    completion: 45,
    nextStep: 'Generate or attach inventory walkaround video before upload.',
  },
];

/**
 * GET /api/publish/platforms
 * Return supported publish platforms without treating `platforms` as an inventory id.
 */
router.get('/platforms', (_req, res) => {
  res.json({ platforms: PLATFORM_CATALOG });
});

/**
 * GET /api/publish/:inventoryId/payload
 * Read-only preview of the generated marketing payload. This powers the MVP
 * proof for SEO/AEO/schema readiness without writing SEO rows, listing rows,
 * sending email, or invoking any external platform publisher.
 */
router.get('/:inventoryId/payload', async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    if (rejectInvalidInventoryId(res, inventoryId)) return;

    const invRes = await db.query(`SELECT * FROM inventory WHERE id = $1`, [inventoryId]);
    if (!invRes.rows.length) return res.status(404).json({ error: 'Inventory not found' });

    const { payload } = buildMarketingAssets(invRes.rows[0]);
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

async function publishInventoryToPlatforms(inventoryId, platforms = [], options = {}, controls = {}) {
  const invRes = await db.query(`SELECT * FROM inventory WHERE id = $1`, [inventoryId]);
  if (!invRes.rows.length) {
    const error = new Error('Inventory not found');
    error.status = 404;
    throw error;
  }
  const unit = normalizeUnitForMarketing(invRes.rows[0]);
  const platformList = Array.isArray(platforms) ? platforms : [];
  const dryRun = controls.dryRun === true || controls.testMode === true;

  // Empty-platform publish is the safe no-op/dry-run probe path. Do not touch
  // optional Phase 6C tables or mutate inventory state for this acceptance gate.
  if (platformList.length === 0) {
    return { inventoryId, unit: `${unit.year} ${unit.make} ${unit.model}`, dryRun, testMode: dryRun, results: [] };
  }

  const { meta, slug, faqData, payload: marketingPayload } = buildMarketingAssets(unit);

  if (dryRun) {
    const results = [];
    for (const platform of platformList) {
      results.push(await buildDryRunPlatformResult(platform, unit, marketingPayload, options[platform] || {}));
    }
    return {
      inventoryId,
      unit: `${unit.year} ${unit.make} ${unit.model}`,
      dryRun: true,
      testMode: true,
      results,
      seo: marketingPayload,
    };
  }

  await saveSeoRecord(inventoryId, unit, meta, slug, faqData);

  if (!unit.status || unit.status === 'intake') {
    await db.query(`UPDATE inventory SET status = 'listed', updated_at = NOW() WHERE id = $1`, [inventoryId]);
  }

  const results = [];
  for (const platform of platformList) {
    const handler = PLATFORM_HANDLERS[platform];
    if (!handler) {
      results.push({ platform, status: 'error', error: 'Unknown platform' });
      continue;
    }

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

      if (publishResult.status === 'not_implemented') {
        const localPublisher = await buildLocalPublisherReceipt(platform, marketingPayload, options[platform] || {});
        const draft = localPublisher?.draft || safeBuildManualPlatformDraft(platform, marketingPayload, options[platform] || {});
        await optionalPublishQuery('inventory_listings', () => db.query(
          `UPDATE inventory_listings SET status = 'manual_required', updated_at = NOW() WHERE id = $1`,
          [listingId]
        ));
        results.push({
          platform,
          status: 'not_implemented',
          url: null,
          error: publishResult.error,
          manualPasteRequired: true,
          localPublisher,
          draft,
        });
        continue;
      }

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
        mock: publishResult.mock === true,
      });
    } catch (err) {
      const failureAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
        `UPDATE inventory_listings SET status = 'failed', sync_error = $2, updated_at = NOW() WHERE id = $1`,
        [listingId, err.message]
      ));
      results.push({ platform, status: 'error', error: failureAttempt.warning || err.message });
    }
  }

  return { inventoryId, unit: `${unit.year} ${unit.make} ${unit.model}`, results, seo: marketingPayload };
}

/**
 * POST /api/publish/:inventoryId
 * Body: { platforms: string[], options: object }
 */
router.post('/:inventoryId', async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    if (rejectInvalidInventoryId(res, inventoryId)) return;
    const { platforms = [], options = {} } = req.body;
    const payload = await publishInventoryToPlatforms(inventoryId, platforms, options, {
      dryRun: isDryRunRequested(req.body),
      testMode: req.body?.testMode === true,
    });
    res.json(payload);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
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
 * POST /api/publish/:inventoryId/:platform/retry
 * Retry one platform from the manual/failed queue without rerunning every channel.
 */
router.post('/:inventoryId/:platform/retry', async (req, res, next) => {
  try {
    const { inventoryId, platform } = req.params;
    if (rejectInvalidInventoryId(res, inventoryId)) return;

    if (!PLATFORM_HANDLERS[platform]) {
      return res.status(400).json({ error: 'Unknown platform' });
    }

    const options = req.body?.options || {};
    const platformOptions = {
      [platform]: options[platform] || options,
    };
    const payload = await publishInventoryToPlatforms(inventoryId, [platform], platformOptions, {
      dryRun: isDryRunRequested(req.body),
      testMode: req.body?.testMode === true,
    });
    res.json({ ...payload, retry: true, platform });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
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

    const listingAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
      `SELECT * FROM inventory_listings WHERE inventory_id = $1 AND platform = $2`,
      [inventoryId, platform]
    ));
    if (listingAttempt.warning) {
      return res.json({
        status: 'unavailable',
        platform,
        inventoryId,
        error: listingAttempt.warning,
        degraded: true,
      });
    }
    if (!listingAttempt.result.rows.length) return res.status(404).json({ error: 'Listing not found' });

    // Call platform-specific unpublish (mock). Optional Phase 6C listing schema
    // drift should not turn rollback/status probes into 500s.
    const updateAttempt = await optionalPublishQuery('inventory_listings', () => db.query(
      `UPDATE inventory_listings SET status = 'unpublished', updated_at = NOW() WHERE inventory_id = $1 AND platform = $2`,
      [inventoryId, platform]
    ));
    if (updateAttempt.warning) {
      return res.json({
        status: 'unavailable',
        platform,
        inventoryId,
        error: updateAttempt.warning,
        degraded: true,
      });
    }

    res.json({ status: 'unpublished', platform, inventoryId });
  } catch (err) {
    next(err);
  }
});

// ─── Platform Publishers (not yet implemented — manual posting required) ────────

async function publishToMaterialSolutionsNj(unit, _options) {
  return {
    status: 'published',
    listingId: `msnj-${unit.id}`,
    url: `${SEO_CONFIG.baseUrl}/inventory/${unit.id}`,
    mock: false,
  };
}

function manualPlatformResult(platformLabel, targetLabel) {
  return {
    status: 'not_implemented',
    dbStatus: 'manual_required',
    externalId: null,
    url: null,
    error: `${platformLabel} publish is not yet wired. The generated content is paste-ready — copy it from the preview and post manually at ${targetLabel}.`,
    manualPasteRequired: true,
    mock: false,
  };
}

async function publishToCraigslist(unit, options) {
  return manualPlatformResult('Craigslist', 'craigslist.org');
}

async function publishToFacebook(unit, options) {
  return manualPlatformResult('Facebook Marketplace', 'facebook.com/marketplace');
}

async function publishToMachineryTrader(unit, options) {
  return manualPlatformResult('MachineryTrader', 'machinerytrader.com');
}

async function publishToEquipFinder(unit, options) {
  return manualPlatformResult('EquipFinder', 'equipfinder.com');
}

async function publishToMachineryATS(unit, options) {
  return manualPlatformResult('MachineryATS', 'machineryats.com');
}

async function publishToEbay(unit, options) {
  return manualPlatformResult('eBay Business & Industrial', 'ebay.com');
}

async function publishToLinkedIn(unit, options) {
  return manualPlatformResult('LinkedIn', 'linkedin.com');
}

async function publishToGoogleBusinessProfile(unit, options) {
  return manualPlatformResult('Google Business Profile', 'business.google.com');
}

async function publishToForkliftActionForum(unit, options) {
  return manualPlatformResult('Forkliftaction Forum', 'forkliftaction.com/forum');
}

async function publishToYouTube(unit, options) {
  return manualPlatformResult('YouTube', 'youtube.com/upload');
}

module.exports = router;
