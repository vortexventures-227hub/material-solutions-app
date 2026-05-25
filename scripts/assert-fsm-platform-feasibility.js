#!/usr/bin/env node
const fs = require('node:fs');

const DOC_PATH = 'FSM_PLATFORM_CONNECTION_FEASIBILITY.md';
const doc = fs.readFileSync(DOC_PATH, 'utf8');

const expectedPlatforms = [
  'website',
  'facebook_marketplace',
  'facebook_page',
  'ebay',
  'youtube',
  'linkedin',
  'google_business',
  'instagram',
  'craigslist',
  'machinerytrader',
  'equipfinder',
  'machineryats',
  'forkliftaction',
  'ironplanet',
  'machinery_pete',
  'equipment_trader',
  'truckpaper',
  'commercial_truck_trader',
  'bigiron_auctions',
  'offerup',
  'nextdoor',
  'google_shopping',
  'bing_shopping',
  'thomasnet',
  'industrynet',
  'global_industrial',
  'mascus',
  'machinesales',
  'bidspotter',
  'eliftruck',
  'reddit_forklifts',
  'reddit_flipping',
  'x_twitter',
  'pinterest',
  'tiktok',
  'medium_article',
  'blog_syndication',
  'google_ads_feed',
  'yelp_business',
  'bbb_listing',
  'yellowpages',
  'industry_newsletters',
  'email_blast',
  'sms_alerts',
  'pr_newswire',
  'amazon_business',
  'alibaba',
];

const expectedModes = new Set([
  'automatic',
  'api_or_feed',
  'partner_or_portal',
  'guarded_manual',
]);

const tableRows = doc
  .split('\n')
  .filter((line) => /^\| `[^`]+` \|/.test(line))
  .map((line) => {
    const columns = line.split('|').map((column) => column.trim());
    return {
      platform: columns[1]?.replace(/`/g, ''),
      connectable: columns[2],
      mode: columns[3]?.replace(/`/g, ''),
    };
  });

const failures = [];

if (!doc.includes('They are not all safely connectable as fully automatic public posting targets.')) {
  failures.push('missing explicit not-all-automatic guardrail');
}

if (tableRows.length !== expectedPlatforms.length) {
  failures.push(`expected ${expectedPlatforms.length} platform rows, found ${tableRows.length}`);
}

const actualPlatforms = tableRows.map((row) => row.platform);
const missingPlatforms = expectedPlatforms.filter((platform) => !actualPlatforms.includes(platform));
const extraPlatforms = actualPlatforms.filter((platform) => !expectedPlatforms.includes(platform));

for (const platform of missingPlatforms) {
  failures.push(`missing platform row: ${platform}`);
}

for (const platform of extraPlatforms) {
  failures.push(`unexpected platform row: ${platform}`);
}

for (const row of tableRows) {
  if (!['Yes', 'Maybe', 'Limited'].includes(row.connectable)) {
    failures.push(`invalid connectable value for ${row.platform}: ${row.connectable}`);
  }
  if (!expectedModes.has(row.mode)) {
    failures.push(`invalid mode for ${row.platform}: ${row.mode}`);
  }
}

const modeCounts = tableRows.reduce((counts, row) => {
  counts[row.mode] = (counts[row.mode] || 0) + 1;
  return counts;
}, {});

for (const mode of expectedModes) {
  if (!modeCounts[mode]) {
    failures.push(`mode has no rows: ${mode}`);
  }
}

if (failures.length) {
  console.error('FSM platform feasibility assertion failed.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`FSM platform feasibility assertions: OK (${tableRows.length} platforms)`);
