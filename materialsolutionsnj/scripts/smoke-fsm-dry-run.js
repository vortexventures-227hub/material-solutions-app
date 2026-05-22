const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const backendUrl = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

const EXPECTED_CHANNELS = [
  'materialsolutionsnj',
  'craigslist',
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

async function request(path, options = {}) {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `${path} failed with ${response.status}`);
  }
  return body;
}

async function getAuthToken() {
  const serviceToken = process.env.FSM_BACKEND_TOKEN || process.env.FSM_SERVICE_JWT;
  const email = process.env.FSM_BACKEND_EMAIL;
  const password = process.env.FSM_BACKEND_PASSWORD;

  if (email && password) {
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!login?.accessToken) {
      throw new Error('FSM login did not return an access token');
    }
    return { token: login.accessToken, authSource: 'login' };
  }

  if (!serviceToken) {
    throw new Error('FSM service auth is required: set FSM_SERVICE_JWT/FSM_BACKEND_TOKEN or FSM_BACKEND_EMAIL plus FSM_BACKEND_PASSWORD');
  }
  return { token: serviceToken, authSource: 'service token' };
}

async function main() {
  const { token, authSource } = await getAuthToken();
  const auth = { Authorization: `Bearer ${token}` };
  const inventory = await request('/api/inventory?status=listed&limit=1', { headers: auth });
  const rows = Array.isArray(inventory?.data) ? inventory.data : Array.isArray(inventory) ? inventory : [];
  if (!rows.length) {
    throw new Error('FSM returned no listed inventory for dry-run smoke check');
  }

  const unit = rows[0];
  const dryRun = await request(`/api/publish/${encodeURIComponent(unit.id)}`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      platforms: EXPECTED_CHANNELS,
      options: {},
      dryRun: true,
      testMode: true,
    }),
  });

  const results = Array.isArray(dryRun?.results) ? dryRun.results : [];
  const materialSolutions = results.find((result) => result.platform === 'materialsolutionsnj');
  const facebookMarketplace = results.find((result) => result.platform === 'facebook_marketplace');
  const ebay = results.find((result) => result.platform === 'ebay');
  const mutated = results.filter((result) => result.mutationPerformed !== false);
  const missing = EXPECTED_CHANNELS.filter((platform) => !results.some((result) => result.platform === platform));
  const manualResults = results.filter((result) => result.platform !== 'materialsolutionsnj');
  const unguardedManual = manualResults.filter((result) => (
    result.status !== 'manual_required' ||
    result.manualPasteRequired !== true ||
    result.draft?.target?.submitDisabled !== true ||
    !Array.isArray(result.draft?.reviewChecklist) ||
    !result.draft.reviewChecklist.some((item) => item.includes('Chris approves'))
  ));

  if (dryRun?.dryRun !== true || dryRun?.testMode !== true) {
    throw new Error('Publish Button dry-run response did not preserve dryRun/testMode flags');
  }
  if (missing.length) {
    throw new Error(`Publish Button dry-run omitted expected channels: ${missing.join(', ')}`);
  }
  if (materialSolutions?.status !== 'dry_run_ready') {
    throw new Error('MaterialSolutionsNJ dry-run did not return dry_run_ready');
  }
  if (
    facebookMarketplace?.draft?.target?.approvedAccountRequired !== true ||
    !facebookMarketplace?.draft?.fields?.marketplace ||
    !facebookMarketplace.draft.fields.marketplace.sellerDisclosure?.some((item) => item.includes('category fit'))
  ) {
    throw new Error('Facebook Marketplace dry-run did not include guarded marketplace draft fields');
  }
  if (
    ebay?.draft?.target?.oauthRequired !== true ||
    ebay?.draft?.fields?.ebay?.businessPoliciesRequired !== true ||
    !ebay.draft.fields.ebay.oauthReadiness?.requiredScopes?.includes('sell.inventory')
  ) {
    throw new Error('eBay dry-run did not include guarded OAuth/business policy readiness fields');
  }
  if (unguardedManual.length) {
    throw new Error(`Manual dry-run guardrails missing for: ${unguardedManual.map((result) => result.platform).join(', ')}`);
  }
  if (mutated.length) {
    throw new Error(`Dry-run reported mutation risk on: ${mutated.map((result) => result.platform).join(', ')}`);
  }

  console.log('Forklift Sales Machine Publish Button dry-run smoke check');
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Auth: OK (${authSource})`);
  console.log(`Unit: ${[unit.year, unit.make, unit.model].filter(Boolean).join(' ') || unit.id}`);
  console.log(`Dry run: OK (${results.length} channels checked, no external mutation)`);
  console.log(`Manual guardrails: OK (${manualResults.length} manual channels require review)`);
  console.log(`Statuses: ${results.map((result) => `${result.platform}:${result.status}`).join(', ')}`);
}

main().catch((error) => {
  console.error(`Dry-run smoke check failed: ${error.message}`);
  process.exit(1);
});
