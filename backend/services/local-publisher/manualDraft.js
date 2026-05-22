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

  if (platform === 'machinerytrader') {
    return {
      ...target,
      approvedAccountRequired: true,
      dealerPortalRequired: true,
      accountLabel: options.accountLabel || options.dealerAccount || options.machineryTraderAccount || 'Chris-approved MachineryTrader dealer/advertiser account only',
      dealerProgram: options.dealerProgram || 'MachineryTrader / Sandhills dealer advertising program',
      contactPhone: options.machineryTraderContactPhone || '(800) 247-4898',
      portalUrl: options.portalUrl || 'https://www.sandhillscloud.com/',
    };
  }

  if (platform === 'equipfinder') {
    return {
      ...target,
      approvedAccountRequired: true,
      vendorCredentialRequired: true,
      siteReachabilityReviewRequired: true,
      accountLabel: options.accountLabel || options.equipFinderAccount || options.vendorAccount || options.dealerAccount || 'Chris-approved EquipFinder vendor/contact only',
      listingPath: options.equipFinderListingPath || options.listingPath || 'EquipFinder / RecycleNet equipment finder workflow',
      publicAccessStatus: options.publicAccessStatus || 'HTTP 403 observed from unauthenticated client; verify in approved browser/session before use',
    };
  }

  if (platform === 'linkedin') {
    return {
      ...target,
      approvedAccountRequired: true,
      oauthRequired: true,
      companyPageAdminRequired: true,
      accountLabel: options.accountLabel || options.linkedinAccount || 'Chris-approved LinkedIn Company Page admin only',
      organizationUrn: options.linkedinOrganizationUrn || options.organizationUrn || null,
      apiResource: 'LinkedIn organization social posting',
    };
  }

  if (platform === 'forkliftaction_forum') {
    return {
      ...target,
      approvedAccountRequired: true,
      forumRulesReviewRequired: true,
      accountLabel: options.accountLabel || options.forumAccount || options.forkliftactionAccount || 'Chris-approved Forkliftaction member account only',
      forumProfileRequired: true,
      preferredCommercialPath: options.preferredCommercialPath || 'Machine Listing or Business Listing, not discussion spam',
      rulesUrl: options.rulesUrl || 'https://www.forkliftaction.com/forum/discussion-forums.aspx',
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

  if (platform === 'google_business_profile') {
    return {
      ...target,
      approvedAccountRequired: true,
      oauthRequired: true,
      accountLabel: options.accountLabel || options.googleAccount || 'Chris-approved Google Business Profile owner/manager only',
      accountId: options.googleBusinessAccountId || options.accountId || null,
      locationId: options.googleLocationId || options.locationId || null,
      apiResource: 'accounts.locations.localPosts',
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

  if (platform === 'machinerytrader') {
    return {
      ...baseFields,
      machineryTrader: {
        listingType: options.listingType || 'dealer_inventory',
        categoryHint: options.categoryHint || 'Forklifts',
        advertisingProgramRequired: true,
        dealerPortalRequired: true,
        inventorySyncReadiness: {
          required: true,
          sourceSystem: options.sourceSystem || 'Forklift Sales Machine',
          requiredVendorApproval: [
            'MachineryTrader dealer/advertiser account',
            'Sandhills dealer portal or approved inventory feed access',
            'Chris-approved contact and billing owner',
          ],
        },
        requiredSpecs: [
          'make',
          'model',
          'year',
          'hours',
          'capacityLbs',
          'mastType',
          'liftHeightInches',
          'powerType',
        ],
        sellerDisclosure: [
          'Confirm MachineryTrader dealer/advertiser account and listing package before posting',
          'Use the Dealer Portal or approved Sandhills inventory feed only after Chris approves credentials',
          'Verify forklift category, location, price, photos, and contact details before any manual listing',
        ],
      },
    };
  }

  if (platform === 'linkedin') {
    return {
      ...baseFields,
      linkedin: {
        postType: options.postType || 'company_page_update',
        audience: options.audience || 'public',
        destinationUrl: baseFields.listingUrl,
        organizationUrn: options.linkedinOrganizationUrn || options.organizationUrn || null,
        companyPageAdminRequired: true,
        marketingDeveloperAccessRequired: true,
        oauthReadiness: {
          required: true,
          requiredScopes: [
            'w_organization_social_feed',
          ],
          compatibilityScopes: [
            'w_organization_social',
            'r_organization_social',
            'rw_organization_admin',
          ],
          requiredIdentifiers: [
            'LinkedIn organization URN',
            'Company Page admin member URN',
          ],
          requiredCredentials: [
            'LINKEDIN_CLIENT_ID',
            'LINKEDIN_CLIENT_SECRET',
            'LINKEDIN_REFRESH_TOKEN or approved OAuth consent flow',
          ],
        },
        sellerDisclosure: [
          'Confirm Marketing Developer Platform access and the approved LinkedIn Company Page before posting',
          'Confirm the operator is an administrator for the target organization/page',
          'Do not call LinkedIn organization social APIs until Chris approves the page, organization URN, and OAuth scope set',
        ],
      },
    };
  }

  if (platform === 'equipfinder') {
    return {
      ...baseFields,
      equipFinder: {
        listingType: options.listingType || 'vendor_reviewed_equipment_listing',
        categoryHint: options.categoryHint || 'Lift trucks / material handling equipment',
        serviceFit: 'Waste/recycling and industrial equipment finder; confirm forklift category acceptance before posting',
        vendorCredentialReadiness: {
          required: true,
          requiredSteps: [
            'Confirm EquipFinder/Recycling industry network vendor account or approved contact path',
            'Confirm whether the current service accepts seller listings, dealer referrals, or buyer quote requests',
            'Confirm listing workflow is reachable from the approved browser/session before preparing any submit flow',
            'Confirm billing/contact ownership if the workflow requires paid placement or dealer participation',
          ],
        },
        siteReachabilityReadiness: {
          required: true,
          publicUrl: PLATFORM_TARGETS.equipfinder,
          observedStatus: options.publicAccessStatus || 'HTTP 403 from unauthenticated HEAD request on 2026-05-22',
          requiredFollowUp: 'Verify from Chris-approved network/account before treating EquipFinder as postable',
        },
        requiredSpecs: [
          'make',
          'model',
          'year',
          'hours',
          'capacityLbs',
          'powerType',
          'condition',
          'location',
        ],
        sellerDisclosure: [
          'Do not assume EquipFinder has a current public self-serve posting flow or API',
          'Confirm vendor/contact credentials, service fit, and reachable workflow before any manual listing',
          'Use public MaterialSolutionsNJ inventory URL as the source of truth and stop before submit until Chris approves',
        ],
      },
    };
  }

  if (platform === 'forkliftaction_forum') {
    return {
      ...baseFields,
      forkliftactionForum: {
        postType: options.postType || 'discussion_or_reply',
        forumCategoryHint: options.forumCategoryHint || options.categoryHint || 'Business management',
        commercialIntentReviewRequired: true,
        rulesReviewRequired: true,
        moderationRisk: 'Commercial listings may belong in Machine Listing, Business Listing, or paid advertising paths instead of discussion threads',
        allowedCommercialAlternatives: [
          'Machine Listing',
          'Business Listing',
          'Paid Forkliftaction advertising',
        ],
        accountReadiness: {
          required: true,
          requiredSteps: [
            'Register or log in as an approved member',
            'Set up the forum profile',
            'Review rules of conduct before posting',
            'Choose Start a Discussion or Post a Reply only when the post adds legitimate discussion value',
          ],
        },
        sellerDisclosure: [
          'Do not use Forkliftaction forums as direct inventory advertising unless rules and moderators allow it',
          'If the goal is to sell equipment, use Machine Listing, Business Listing, or advertising channels instead of forum spam',
          'Do not post until Chris approves the member account, category, wording, and commercial intent',
        ],
      },
    };
  }

  if (platform === 'google_business_profile') {
    return {
      ...baseFields,
      googleBusinessProfile: {
        postType: options.postType || 'call_to_action',
        topicType: options.topicType || 'STANDARD',
        callToAction: options.callToAction || 'LEARN_MORE',
        destinationUrl: baseFields.listingUrl,
        languageCode: options.languageCode || 'en-US',
        mediaFormat: 'PHOTO',
        productPostUnsupported: true,
        oauthReadiness: {
          required: true,
          requiredScopes: [
            'https://www.googleapis.com/auth/business.manage',
          ],
          deprecatedCompatibilityScopes: [
            'https://www.googleapis.com/auth/plus.business.manage',
          ],
          requiredIdentifiers: [
            'Google Business Profile accountId',
            'Google Business Profile locationId',
          ],
          requiredCredentials: [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_REFRESH_TOKEN or approved OAuth consent flow',
          ],
        },
        sellerDisclosure: [
          'Use a Local Post with LEARN_MORE pointing to the MaterialSolutionsNJ inventory URL',
          'Do not attempt Product Posts through the Google Business Profile API; Google docs say Product Posts cannot be created via the API',
          'Do not call Business Profile APIs until Chris approves the owner/manager account, location, and OAuth consent',
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

  if (platform === 'machinerytrader') {
    reviewChecklist.push(
      'Confirm the MachineryTrader dealer/advertiser account or Sandhills portal access is approved by Chris',
      'Confirm forklift category, listing package, billing owner, contact phone, and inventory feed/manual posting path',
      'Do not upload inventory or submit listings until vendor credentials and target package are approved',
    );
  }

  if (platform === 'equipfinder') {
    reviewChecklist.push(
      'Confirm the EquipFinder vendor/contact path is approved by Chris before opening the workflow',
      'Confirm the site is reachable from the approved browser/session and accepts seller listings for lift trucks or material handling equipment',
      'Treat EquipFinder as manual-only until vendor credentials, posting path, and service fit are confirmed',
    );
  }

  if (platform === 'linkedin') {
    reviewChecklist.push(
      'Confirm the target LinkedIn Company Page and administrator account are approved by Chris',
      'Confirm Marketing Developer Platform access and organization social posting scopes before any API call',
      'Use a Company Page update pointing to the inventory URL; do not post from a personal profile unless explicitly approved',
    );
  }

  if (platform === 'forkliftaction_forum') {
    reviewChecklist.push(
      'Confirm the Forkliftaction member account, forum profile, and selected category are approved by Chris',
      'Review Forkliftaction rules of conduct and confirm the post is discussion-appropriate before posting',
      'Use Machine Listing, Business Listing, or paid advertising paths when the intent is commercial listing promotion',
    );
  }

  if (platform === 'google_business_profile') {
    reviewChecklist.push(
      'Confirm the target Google Business Profile owner/manager account and location are approved by Chris',
      'Confirm OAuth consent grants business.manage before any Business Profile API call',
      'Use a Local Post with LEARN_MORE to the inventory URL; do not attempt API Product Posts',
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
