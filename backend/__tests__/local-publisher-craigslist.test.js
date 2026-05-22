const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const path = require('node:path');

const {
  buildCraigslistDraft,
  runCraigslistBridge,
} = require('../services/local-publisher/craigslistBridge');

const samplePayload = {
  inventoryId: 'ddeb41d4-5261-4851-9324-e2f09ea8f807',
  title: '2018 Raymond 752R45TT Reach Truck For Sale',
  description: 'Clean Raymond narrow aisle reach truck ready for warehouse work.',
  price: 29500,
  specs: {
    make: 'Raymond',
    model: '752R45TT',
    year: 2018,
    hours: 2300,
    capacityLbs: 4500,
    mastType: 'Triple reach',
    liftHeightInches: 300,
    powerType: 'electric',
  },
  media: {
    primaryUrl: 'https://cdn.example.com/raymond-752r45tt.jpg',
    urls: ['https://cdn.example.com/raymond-752r45tt.jpg'],
    publicUrlReady: true,
  },
};

test('Craigslist local bridge builds a paste-ready draft without mutation', async () => {
  const receipt = await runCraigslistBridge(samplePayload, {
    dryRun: true,
    region: 'southjersey',
    category: 'hvo',
    contactPhone: '(973) 500-1010',
  });

  assert.equal(receipt.platform, 'craigslist');
  assert.equal(receipt.status, 'dry_run_ready');
  assert.equal(receipt.dryRun, true);
  assert.equal(receipt.browser.mutationPerformed, false);
  assert.equal(receipt.browser.submitDisabled, true);
  assert.equal(receipt.inventoryId, samplePayload.inventoryId);
  assert.equal(receipt.draft.target.region, 'southjersey');
  assert.equal(receipt.draft.target.reviewRequired, true);
  assert.equal(receipt.draft.target.submitDisabled, true);
  assert.equal(receipt.draft.fields.price, 29500);
  assert.match(receipt.draft.fields.body, /Capacity: 4500 lbs/);
  assert.match(receipt.draft.fields.body, /https:\/\/cdn\.example\.com\/raymond-752r45tt\.jpg/);
  assert.match(receipt.guardrails.join('\n'), /No external marketplace write/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /Chris approves/);
});

test('Craigslist local bridge rejects live browser mutation', async () => {
  await assert.rejects(
    () => runCraigslistBridge(samplePayload, { dryRun: false }),
    /Live Craigslist browser mutation is disabled/
  );
});

test('Craigslist draft validates required publish payload fields', () => {
  assert.throws(
    () => buildCraigslistDraft({ ...samplePayload, title: '' }),
    /missing required fields: title/
  );
});

test('local publisher CLI reads stdin and emits a receipt', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const receipt = await execNodeJson(scriptPath, ['--region', 'southjersey'], samplePayload);

  assert.equal(receipt.platform, 'craigslist');
  assert.equal(receipt.status, 'dry_run_ready');
  assert.equal(receipt.draft.target.region, 'southjersey');
  assert.equal(receipt.browser.mutationPerformed, false);
});

test('local publisher CLI emits guarded manual drafts for non-Craigslist platforms', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const receipt = await execNodeJson(scriptPath, [
    '--platform', 'facebook_marketplace',
    '--location', 'Newark, NJ',
    '--category-hint', 'Business equipment',
    '--account-label', 'Approved MSNJ page',
  ], samplePayload);

  assert.equal(receipt.platform, 'facebook_marketplace');
  assert.equal(receipt.status, 'manual_draft_ready');
  assert.equal(receipt.browser.mutationPerformed, false);
  assert.equal(receipt.browser.submitDisabled, true);
  assert.equal(receipt.draft.target.submitDisabled, true);
  assert.equal(receipt.draft.target.approvedAccountRequired, true);
  assert.equal(receipt.draft.target.location, 'Newark, NJ');
  assert.equal(receipt.draft.target.accountLabel, 'Approved MSNJ page');
  assert.equal(receipt.draft.platformLabel, 'Facebook Marketplace');
  assert.equal(receipt.draft.fields.marketplace.availability, 'in_stock');
  assert.equal(receipt.draft.fields.marketplace.categoryHint, 'Business equipment');
  assert.match(receipt.draft.fields.marketplace.sellerDisclosure.join('\n'), /category fit/);
  assert.match(receipt.guardrails.join('\n'), /No external marketplace write/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /Chris approves/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /Facebook account\/page/);
  assert.match(receipt.draft.fields.body, /Photos\/details: https:\/\/www\.materialsolutionsnj\.com\/inventory\//);
});

test('local publisher CLI supports every guarded manual draft channel', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const platforms = [
    'facebook_marketplace',
    'machinerytrader',
    'equipfinder',
    'machineryats',
    'ebay',
    'linkedin',
    'google_business_profile',
    'forkliftaction_forum',
    'youtube',
  ];

  for (const platform of platforms) {
    const receipt = await execNodeJson(scriptPath, ['--platform', platform], samplePayload);

    assert.equal(receipt.platform, platform);
    assert.equal(receipt.status, 'manual_draft_ready');
    assert.equal(receipt.dryRun, true);
    assert.equal(receipt.browser.mutationPerformed, false);
    assert.equal(receipt.browser.submitDisabled, true);
    assert.ok(receipt.draft.target.postUrl, `${platform} should include a target URL`);
    assert.equal(receipt.draft.target.reviewRequired, true);
    assert.equal(receipt.draft.target.submitDisabled, true);
    assert.ok(receipt.draft.fields.title);
    assert.ok(receipt.draft.fields.body);
  }
});

test('local publisher CLI emits eBay OAuth readiness fields without mutation', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const receipt = await execNodeJson(scriptPath, [
    '--platform', 'ebay',
    '--ebay-account', 'Approved MSNJ eBay seller',
    '--category-hint', 'Business & Industrial / Warehouse Equipment',
    '--payment-policy', 'MSNJ payment policy',
    '--fulfillment-policy', 'Freight or local pickup',
  ], samplePayload);

  assert.equal(receipt.platform, 'ebay');
  assert.equal(receipt.status, 'manual_draft_ready');
  assert.equal(receipt.browser.mutationPerformed, false);
  assert.equal(receipt.draft.target.oauthRequired, true);
  assert.equal(receipt.draft.target.accountLabel, 'Approved MSNJ eBay seller');
  assert.equal(receipt.draft.fields.ebay.businessPoliciesRequired, true);
  assert.equal(receipt.draft.fields.ebay.categoryHint, 'Business & Industrial / Warehouse Equipment');
  assert.equal(receipt.draft.fields.ebay.paymentPolicy, 'MSNJ payment policy');
  assert.equal(receipt.draft.fields.ebay.fulfillmentPolicy, 'Freight or local pickup');
  assert.deepEqual(receipt.draft.fields.ebay.oauthReadiness.requiredScopes, [
    'sell.inventory',
    'sell.account',
    'sell.fulfillment',
  ]);
  assert.match(receipt.draft.fields.ebay.sellerDisclosure.join('\n'), /OAuth scope set/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /eBay Business seller account/);
});

test('local publisher CLI emits MachineryTrader vendor credential readiness fields without mutation', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const receipt = await execNodeJson(scriptPath, [
    '--platform', 'machinerytrader',
    '--machinerytrader-account', 'Approved MSNJ MachineryTrader dealer',
    '--dealer-program', 'Dealer Program Advertising',
    '--category-hint', 'Forklifts',
    '--source-system', 'FSM inventory feed',
  ], samplePayload);

  assert.equal(receipt.platform, 'machinerytrader');
  assert.equal(receipt.status, 'manual_draft_ready');
  assert.equal(receipt.browser.mutationPerformed, false);
  assert.equal(receipt.draft.target.dealerPortalRequired, true);
  assert.equal(receipt.draft.target.accountLabel, 'Approved MSNJ MachineryTrader dealer');
  assert.equal(receipt.draft.target.dealerProgram, 'Dealer Program Advertising');
  assert.equal(receipt.draft.fields.machineryTrader.categoryHint, 'Forklifts');
  assert.equal(receipt.draft.fields.machineryTrader.advertisingProgramRequired, true);
  assert.equal(receipt.draft.fields.machineryTrader.inventorySyncReadiness.sourceSystem, 'FSM inventory feed');
  assert.match(receipt.draft.fields.machineryTrader.sellerDisclosure.join('\n'), /Dealer Portal/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /Sandhills portal access/);
});

test('local publisher CLI emits LinkedIn company page readiness fields without mutation', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const receipt = await execNodeJson(scriptPath, [
    '--platform', 'linkedin',
    '--linkedin-account', 'Approved MSNJ LinkedIn page admin',
    '--linkedin-organization-urn', 'urn:li:organization:123456',
    '--audience', 'public',
  ], samplePayload);

  assert.equal(receipt.platform, 'linkedin');
  assert.equal(receipt.status, 'manual_draft_ready');
  assert.equal(receipt.browser.mutationPerformed, false);
  assert.equal(receipt.draft.target.oauthRequired, true);
  assert.equal(receipt.draft.target.companyPageAdminRequired, true);
  assert.equal(receipt.draft.target.accountLabel, 'Approved MSNJ LinkedIn page admin');
  assert.equal(receipt.draft.target.organizationUrn, 'urn:li:organization:123456');
  assert.equal(receipt.draft.fields.linkedin.companyPageAdminRequired, true);
  assert.equal(receipt.draft.fields.linkedin.marketingDeveloperAccessRequired, true);
  assert.equal(receipt.draft.fields.linkedin.oauthReadiness.requiredScopes[0], 'w_organization_social_feed');
  assert.match(receipt.draft.fields.linkedin.sellerDisclosure.join('\n'), /Company Page/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /organization social posting scopes/);
});

test('local publisher CLI emits Google Business Profile permission readiness fields without mutation', async () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-local-publisher.js');
  const receipt = await execNodeJson(scriptPath, [
    '--platform', 'google_business_profile',
    '--google-account', 'Approved MSNJ GBP owner',
    '--google-business-account-id', 'accounts/123',
    '--google-location-id', 'locations/456',
    '--call-to-action', 'LEARN_MORE',
  ], samplePayload);

  assert.equal(receipt.platform, 'google_business_profile');
  assert.equal(receipt.status, 'manual_draft_ready');
  assert.equal(receipt.browser.mutationPerformed, false);
  assert.equal(receipt.draft.target.oauthRequired, true);
  assert.equal(receipt.draft.target.accountLabel, 'Approved MSNJ GBP owner');
  assert.equal(receipt.draft.target.accountId, 'accounts/123');
  assert.equal(receipt.draft.target.locationId, 'locations/456');
  assert.equal(receipt.draft.target.apiResource, 'accounts.locations.localPosts');
  assert.equal(receipt.draft.fields.googleBusinessProfile.callToAction, 'LEARN_MORE');
  assert.equal(receipt.draft.fields.googleBusinessProfile.productPostUnsupported, true);
  assert.deepEqual(receipt.draft.fields.googleBusinessProfile.oauthReadiness.requiredScopes, [
    'https://www.googleapis.com/auth/business.manage',
  ]);
  assert.match(receipt.draft.fields.googleBusinessProfile.sellerDisclosure.join('\n'), /Product Posts cannot be created/);
  assert.match(receipt.draft.reviewChecklist.join('\n'), /business\.manage/);
});

function execNodeJson(scriptPath, args, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      [scriptPath, ...args],
      { cwd: path.join(__dirname, '..') },
      (error, stdout, stderr) => {
        if (error) {
          error.stderr = stderr;
          reject(error);
          return;
        }
        resolve(JSON.parse(stdout));
      }
    );
    child.stdin.end(JSON.stringify(input));
  });
}
