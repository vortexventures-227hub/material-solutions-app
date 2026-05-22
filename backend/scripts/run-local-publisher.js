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
    contactPhone: args.contactPhone,
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
    contactPhone: null,
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
  --contact-phone number      Phone number inserted into the listing body
`);
}

main().catch((err) => {
  process.stderr.write(`${err.code ? `${err.code}: ` : ''}${err.message}\n`);
  process.exitCode = 1;
});
