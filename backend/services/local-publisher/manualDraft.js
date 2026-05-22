const { normalizePayload } = require('./craigslistBridge');
const SEO_CONFIG = require('../seo/seoConfig');

const PLATFORM_TARGETS = {
  facebook_marketplace: 'https://www.facebook.com/marketplace/create/item',
  machinerytrader: 'https://www.machinerytrader.com/listings/for-sale/list',
  equipfinder: 'https://www.equipfinder.com',
  machineryats: 'https://www.machineryats.com',
  ebay: 'https://www.ebay.com/sl/sell',
  linkedin: 'https://www.linkedin.com/feed/',
  google_business_profile: 'https://business.google.com/',
  forkliftaction_forum: 'https://www.forkliftaction.com/forum/',
  youtube: 'https://www.youtube.com/upload',
};

const PLATFORM_LABELS = {
  facebook_marketplace: 'Facebook Marketplace',
  machinerytrader: 'MachineryTrader',
  equipfinder: 'EquipFinder',
  machineryats: 'MachineryATS',
  ebay: 'eBay Business',
  linkedin: 'LinkedIn',
  google_business_profile: 'Google Business Profile',
  forkliftaction_forum: 'Forkliftaction Forum',
  youtube: 'YouTube',
};

function buildManualPlatformDraft(platform, job, options = {}) {
  const payload = normalizePayload(job);
  const specs = payload.specs || {};
  const mediaUrls = Array.isArray(payload.media?.urls) ? payload.media.urls : [];
  const baseTitle = payload.title || [specs.year, specs.make, specs.model].filter(Boolean).join(' ');
  const price = payload.price || null;
  const contactPhone = options.contactPhone || options.phone || SEO_CONFIG.phone;
  const listingUrl = `${SEO_CONFIG.baseUrl}/inventory/${payload.inventoryId}`;
  const keySpecs = [
    specs.hours ? `${Number(specs.hours).toLocaleString()} hours` : null,
    specs.capacityLbs ? `${Number(specs.capacityLbs).toLocaleString()} lb capacity` : null,
    specs.mastType ? `${specs.mastType} mast` : null,
    specs.powerType ? `${specs.powerType} power` : null,
  ].filter(Boolean).join(', ');

  const plainBody = [
    payload.description,
    keySpecs ? `Specs: ${keySpecs}` : null,
    price ? `Price: $${Number(price).toLocaleString()}` : 'Price: call for pricing',
    `Photos/details: ${listingUrl}`,
    `Contact Material Solutions NJ: ${contactPhone}`,
  ].filter(Boolean).join('\n\n');

  return {
    platform,
    platformLabel: PLATFORM_LABELS[platform] || platform,
    inventoryId: payload.inventoryId,
    target: {
      postUrl: PLATFORM_TARGETS[platform] || null,
      reviewRequired: true,
      submitDisabled: true,
    },
    fields: {
      title: clamp(baseTitle, platform === 'youtube' ? 100 : 80),
      price,
      body: plainBody,
      listingUrl,
      make: specs.make || null,
      model: specs.model || null,
      year: specs.year || null,
    },
    media: {
      primaryUrl: payload.media?.primaryUrl || mediaUrls[0] || null,
      urls: mediaUrls,
      publicUrlReady: Boolean(payload.media?.publicUrlReady),
    },
    reviewChecklist: [
      'Confirm title, price, specs, and media match the inventory record',
      'Paste content into the target platform without using automated submit',
      'Stop before final submit until Chris approves the target account/listing',
    ],
  };
}

function buildManualReceipt(platform, job, options = {}) {
  const draft = buildManualPlatformDraft(platform, job, options);
  return {
    receiptId: `manual_${platform}_${draft.inventoryId}`.replace(/[^a-zA-Z0-9_-]/g, '_'),
    platform,
    status: 'manual_draft_ready',
    dryRun: true,
    inventoryId: draft.inventoryId,
    createdAt: new Date().toISOString(),
    browser: {
      mode: 'operator_review_required',
      mutationPerformed: false,
      submitDisabled: true,
      plannedAutomation: [
        'Open the target platform manually',
        'Paste title, price, body, and public media URLs',
        'Review all fields before submit',
      ],
    },
    guardrails: [
      'No external marketplace write is performed by this receipt',
      'No browser submit/click automation is enabled',
      'Operator must get approval before final platform submission',
    ],
    draft,
  };
}

function clamp(value, maxLength) {
  const str = String(value || '').trim();
  return str.length > maxLength ? str.slice(0, maxLength - 1).trimEnd() : str;
}

module.exports = {
  buildManualPlatformDraft,
  buildManualReceipt,
  PLATFORM_TARGETS,
};
