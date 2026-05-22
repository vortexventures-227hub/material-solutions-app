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
