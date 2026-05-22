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

function buildPlatformTarget(platform, options = {}) {
  const target = {
    postUrl: PLATFORM_TARGETS[platform] || null,
    reviewRequired: true,
    submitDisabled: true,
  };

  if (platform === 'facebook_marketplace') {
    return {
      ...target,
      approvedAccountRequired: true,
      accountLabel: options.accountLabel || options.facebookAccount || 'Chris-approved Facebook account/page only',
      location: options.location || options.city || 'New Jersey',
    };
  }

  if (platform === 'ebay') {
    return {
      ...target,
      approvedAccountRequired: true,
      oauthRequired: true,
      accountLabel: options.accountLabel || options.ebayAccount || 'Chris-approved eBay Business seller account only',
      listingTool: options.listingTool || 'eBay Seller Hub / Sell flow',
    };
  }

  return target;
}

function buildPlatformFields(platform, payload, specs, baseFields, options = {}) {
  const condition = specs.condition || specs.conditionNotes || 'Used - good';

  if (platform === 'facebook_marketplace') {
    return {
      ...baseFields,
      marketplace: {
        listingType: 'single_item',
        categoryHint: options.categoryHint || 'Business & Industrial / material handling equipment',
        location: options.location || options.city || 'New Jersey',
        availability: 'in_stock',
        condition,
        sellerDisclosure: [
          'Commercial forklift listing; confirm Facebook Marketplace category fit before posting',
          'Use public MaterialSolutionsNJ inventory URL as the source of truth',
          'Do not submit from automation or without Chris-approved account access',
        ],
      },
    };
  }

  if (platform === 'ebay') {
    return {
      ...baseFields,
      ebay: {
        listingFormat: options.listingFormat || 'fixed_price',
        categoryHint: options.categoryHint || 'Business & Industrial / Forklifts & Telehandlers',
        condition,
        quantity: 1,
        businessPoliciesRequired: true,
        paymentPolicy: options.paymentPolicy || 'Confirm seller account payment policy before publish',
        returnPolicy: options.returnPolicy || 'Confirm seller account return policy before publish',
        fulfillmentPolicy: options.fulfillmentPolicy || 'Confirm freight/local pickup handling before publish',
        oauthReadiness: {
          required: true,
          environment: options.ebayEnvironment || 'production',
          requiredScopes: [
            'sell.inventory',
            'sell.account',
            'sell.fulfillment',
          ],
          requiredCredentials: [
            'EBAY_CLIENT_ID',
            'EBAY_CLIENT_SECRET',
            'EBAY_REFRESH_TOKEN or approved OAuth consent flow',
          ],
        },
        sellerDisclosure: [
          'Confirm category, item specifics, and business policies in eBay Seller Hub before posting',
          'Do not call eBay Inventory/Offer APIs until Chris approves the seller account and OAuth scope set',
          'Use public MaterialSolutionsNJ inventory URL as the source of truth',
        ],
      },
    };
  }

  return baseFields;
}

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

  const baseFields = {
    title: clamp(baseTitle, platform === 'youtube' ? 100 : 80),
    price,
    body: plainBody,
    listingUrl,
    make: specs.make || null,
    model: specs.model || null,
    year: specs.year || null,
  };

  const reviewChecklist = [
    'Confirm title, price, specs, and media match the inventory record',
    'Paste content into the target platform without using automated submit',
  ];

  if (platform === 'facebook_marketplace') {
    reviewChecklist.push(
      'Confirm the target Facebook account/page is approved by Chris before opening the create listing flow',
      'Choose the closest Marketplace category manually and verify forklift/equipment policy fit',
    );
  }

  if (platform === 'ebay') {
    reviewChecklist.push(
      'Confirm the target eBay Business seller account is approved by Chris before opening Seller Hub',
      'Confirm eBay category, item specifics, payment, return, and fulfillment policies before any API or manual listing',
      'Treat OAuth credentials as missing until the approved seller account grants the required scopes',
    );
  }

  reviewChecklist.push('Stop before final submit until Chris approves the target account/listing');

  return {
    platform,
    platformLabel: PLATFORM_LABELS[platform] || platform,
    inventoryId: payload.inventoryId,
    target: buildPlatformTarget(platform, options),
    fields: buildPlatformFields(platform, payload, specs, baseFields, options),
    media: {
      primaryUrl: payload.media?.primaryUrl || mediaUrls[0] || null,
      urls: mediaUrls,
      publicUrlReady: Boolean(payload.media?.publicUrlReady),
    },
    reviewChecklist,
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
