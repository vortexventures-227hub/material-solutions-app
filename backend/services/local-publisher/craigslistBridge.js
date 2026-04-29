const crypto = require('node:crypto');

const DEFAULT_REGION = 'newjersey';
const DEFAULT_CATEGORY = 'hvo';

function normalizePayload(input) {
  const payload = input && typeof input === 'object' && input.payload ? input.payload : input;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Publish job payload must be a JSON object');
  }

  const title = stringOrNull(payload.title);
  const description = stringOrNull(payload.description);
  const inventoryId = stringOrNull(payload.inventoryId || payload.inventory_id);
  const price = normalizePrice(payload.price);
  const specs = payload.specs && typeof payload.specs === 'object' ? payload.specs : {};
  const media = payload.media && typeof payload.media === 'object' ? payload.media : {};
  const mediaUrls = Array.isArray(media.urls) ? media.urls.filter(Boolean) : [];

  const missing = [];
  if (!inventoryId) missing.push('inventoryId');
  if (!title) missing.push('title');
  if (!description) missing.push('description');
  if (price === null) missing.push('price');
  if (!specs.make || !specs.model) missing.push('specs.make/specs.model');

  if (missing.length) {
    const err = new Error(`Publish job payload is missing required fields: ${missing.join(', ')}`);
    err.code = 'INVALID_PUBLISH_PAYLOAD';
    err.missing = missing;
    throw err;
  }

  return {
    inventoryId,
    title,
    description,
    price,
    specs,
    media: {
      primaryUrl: stringOrNull(media.primaryUrl || media.primary_url || mediaUrls[0]),
      urls: mediaUrls,
      publicUrlReady: Boolean(media.publicUrlReady || media.public_url_ready),
    },
    seo: payload.seo || {},
    aeo: payload.aeo || {},
    schema: payload.schema || {},
  };
}

function buildCraigslistDraft(payload, options = {}) {
  const normalized = normalizePayload(payload);
  const region = stringOrNull(options.region || options.city) || DEFAULT_REGION;
  const category = stringOrNull(options.category) || DEFAULT_CATEGORY;
  const contactPhone = stringOrNull(options.contactPhone || options.phone) || '(973) 500-1010';
  const condition = normalized.specs.condition || normalized.specs.conditionNotes || 'used';

  return {
    platform: 'craigslist',
    inventoryId: normalized.inventoryId,
    target: {
      region,
      category,
      postUrl: `https://${region}.craigslist.org/search/${category}`,
    },
    fields: {
      title: clamp(normalized.title, 70),
      price: normalized.price,
      condition,
      body: formatBody(normalized, contactPhone),
      contactPhone,
      make: normalized.specs.make || null,
      model: normalized.specs.model || null,
      year: normalized.specs.year || null,
    },
    media: normalized.media,
  };
}

async function runCraigslistBridge(job, options = {}) {
  const dryRun = options.dryRun !== false;
  if (!dryRun) {
    const err = new Error('Live Craigslist browser mutation is disabled in this local bridge. Run with dryRun:true.');
    err.code = 'LIVE_BROWSER_MUTATION_DISABLED';
    throw err;
  }

  const normalized = normalizePayload(job);
  const draft = buildCraigslistDraft(normalized, options);
  const receipt = {
    receiptId: createReceiptId(draft),
    platform: 'craigslist',
    status: 'dry_run_ready',
    dryRun: true,
    inventoryId: normalized.inventoryId,
    createdAt: new Date().toISOString(),
    browser: {
      mode: 'local_runner_required',
      mutationPerformed: false,
      plannedAutomation: [
        'Open local Brave profile manually or via future Playwright adapter',
        'Navigate to Craigslist create-post flow',
        'Paste title, price, body, and public media URLs',
        'Stop before submit for human review',
      ],
    },
    draft,
  };

  return receipt;
}

function formatBody(payload, contactPhone) {
  const specs = payload.specs || {};
  const lines = [
    payload.description,
    '',
    'Key specs:',
    specLine('Make', specs.make),
    specLine('Model', specs.model),
    specLine('Year', specs.year),
    specLine('Hours', specs.hours),
    specLine('Capacity', specs.capacityLbs ? `${specs.capacityLbs} lbs` : null),
    specLine('Mast', specs.mastType),
    specLine('Lift height', specs.liftHeightInches ? `${specs.liftHeightInches} inches` : null),
    specLine('Power', specs.powerType),
    specLine('Battery', specs.batteryInfo),
    '',
    `Call Material Solutions at ${contactPhone} to confirm availability.`,
  ];

  if (payload.media.urls.length) {
    lines.push('', 'Photos:', ...payload.media.urls.map((url) => `- ${url}`));
  }

  return lines.filter((line) => line !== null && line !== undefined).join('\n');
}

function specLine(label, value) {
  return value === null || value === undefined || value === '' ? null : `- ${label}: ${value}`;
}

function stringOrNull(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

function normalizePrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, maxLength) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 1).trimEnd();
}

function createReceiptId(draft) {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      inventoryId: draft.inventoryId,
      platform: draft.platform,
      target: draft.target,
      price: draft.fields.price,
    }))
    .digest('hex')
    .slice(0, 16);
  return `cl_dry_${hash}`;
}

module.exports = {
  buildCraigslistDraft,
  normalizePayload,
  runCraigslistBridge,
};
