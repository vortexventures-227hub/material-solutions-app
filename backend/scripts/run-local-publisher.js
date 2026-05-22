#!/usr/bin/env node

const fs = require('node:fs/promises');
const { runCraigslistBridge } = require('../services/local-publisher/craigslistBridge');
const { buildManualReceipt } = require('../services/local-publisher/manualDraft');

const MANUAL_DRAFT_PLATFORMS = new Set([
  'facebook_marketplace',
  'machinerytrader',
  'equipfinder',
  'machineryats',
  'ebay',
  'linkedin',
  'google_business_profile',
  'forkliftaction_forum',
  'youtube',
]);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = await readJsonInput(args.input);
  const options = {
    dryRun: args.dryRun,
    region: args.region,
    city: args.city,
    category: args.category,
    categoryHint: args.categoryHint,
    contactPhone: args.contactPhone,
    location: args.location,
    accountLabel: args.accountLabel,
    facebookAccount: args.facebookAccount,
    ebayAccount: args.ebayAccount,
    ebayEnvironment: args.ebayEnvironment,
    listingFormat: args.listingFormat,
    paymentPolicy: args.paymentPolicy,
    returnPolicy: args.returnPolicy,
    fulfillmentPolicy: args.fulfillmentPolicy,
    googleAccount: args.googleAccount,
    googleBusinessAccountId: args.googleBusinessAccountId,
    googleLocationId: args.googleLocationId,
    postType: args.postType,
    topicType: args.topicType,
    callToAction: args.callToAction,
    languageCode: args.languageCode,
  };

  if (args.platform === 'craigslist') {
    const receipt = await runCraigslistBridge(input, options);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    return;
  }

  if (!MANUAL_DRAFT_PLATFORMS.has(args.platform)) {
    throw new Error(`Unsupported local publisher platform: ${args.platform}`);
  }

  const receipt = buildManualReceipt(args.platform, input, options);
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

function parseArgs(argv) {
  const parsed = {
    platform: 'craigslist',
    input: null,
    dryRun: true,
    region: null,
    city: null,
    category: null,
    categoryHint: null,
    contactPhone: null,
    location: null,
    accountLabel: null,
    facebookAccount: null,
    ebayAccount: null,
    ebayEnvironment: null,
    listingFormat: null,
    paymentPolicy: null,
    returnPolicy: null,
    fulfillmentPolicy: null,
    googleAccount: null,
    googleBusinessAccountId: null,
    googleLocationId: null,
    postType: null,
    topicType: null,
    callToAction: null,
    languageCode: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    if (arg === '--live') {
      parsed.dryRun = false;
      continue;
    }
    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;
      if (key === 'contact-phone') {
        parsed.contactPhone = next;
      } else if (key === 'category-hint') {
        parsed.categoryHint = next;
      } else if (key === 'account-label') {
        parsed.accountLabel = next;
      } else if (key === 'facebook-account') {
        parsed.facebookAccount = next;
      } else if (key === 'ebay-account') {
        parsed.ebayAccount = next;
      } else if (key === 'ebay-environment') {
        parsed.ebayEnvironment = next;
      } else if (key === 'listing-format') {
        parsed.listingFormat = next;
      } else if (key === 'payment-policy') {
        parsed.paymentPolicy = next;
      } else if (key === 'return-policy') {
        parsed.returnPolicy = next;
      } else if (key === 'fulfillment-policy') {
        parsed.fulfillmentPolicy = next;
      } else if (key === 'google-account') {
        parsed.googleAccount = next;
      } else if (key === 'google-business-account-id') {
        parsed.googleBusinessAccountId = next;
      } else if (key === 'google-location-id') {
        parsed.googleLocationId = next;
      } else if (key === 'post-type') {
        parsed.postType = next;
      } else if (key === 'topic-type') {
        parsed.topicType = next;
      } else if (key === 'call-to-action') {
        parsed.callToAction = next;
      } else if (key === 'language-code') {
        parsed.languageCode = next;
      } else if (Object.prototype.hasOwnProperty.call(parsed, key)) {
        parsed[key] = next;
      } else {
        throw new Error(`Unknown option: ${arg}`);
      }
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

async function readJsonInput(inputPath) {
  const raw = inputPath
    ? await fs.readFile(inputPath, 'utf8')
    : await readStdin();

  if (!raw.trim()) {
    throw new Error('Provide a publish job JSON payload with --input path or stdin');
  }

  return JSON.parse(raw);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { raw += chunk; });
    process.stdin.on('error', reject);
    process.stdin.on('end', () => resolve(raw));
  });
}

function printHelp() {
  process.stdout.write(`Local publisher bridge for browser-only marketplaces.

Usage:
  node backend/scripts/run-local-publisher.js --input payload.json --platform craigslist --dry-run
  curl http://localhost:5001/api/publish/<inventoryId>/payload | node backend/scripts/run-local-publisher.js

Options:
  --platform craigslist       Local publisher target. Supports craigslist, facebook_marketplace, machinerytrader, equipfinder, machineryats, ebay, linkedin, google_business_profile, forkliftaction_forum, youtube
  --input path                Read publish job JSON from a file. Defaults to stdin
  --dry-run                   Build a receipt without browser mutation. Default
  --live                      Refused by design until a guarded local browser adapter is added
  --region newjersey          Craigslist region subdomain. Default: newjersey
  --category hvo              Craigslist category/search code. Default: hvo
  --location "New Jersey"     Manual draft location hint for Facebook Marketplace
  --category-hint text        Manual category hint for Facebook Marketplace
  --account-label text        Chris-approved target account/page label for Facebook Marketplace
  --ebay-account text         Chris-approved eBay Business seller account label
  --ebay-environment text     eBay OAuth readiness environment. Default: production
  --listing-format text       eBay listing format hint. Default: fixed_price
  --payment-policy text       eBay payment policy reminder
  --return-policy text        eBay return policy reminder
  --fulfillment-policy text   eBay fulfillment/freight policy reminder
  --google-account text       Chris-approved Google Business Profile owner/manager label
  --google-business-account-id text  Google Business Profile account id readiness hint
  --google-location-id text   Google Business Profile location id readiness hint
  --post-type text            Google Business Profile post type hint. Default: call_to_action
  --topic-type text           Google Business Profile LocalPost topic type hint. Default: STANDARD
  --call-to-action text       Google Business Profile CTA hint. Default: LEARN_MORE
  --language-code text        Google Business Profile language code. Default: en-US
  --contact-phone number      Phone number inserted into the listing body
`);
}

main().catch((err) => {
  process.stderr.write(`${err.code ? `${err.code}: ` : ''}${err.message}\n`);
  process.exitCode = 1;
});
