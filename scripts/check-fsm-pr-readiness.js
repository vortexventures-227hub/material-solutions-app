#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const BACKEND_URL = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

const ADMIN_URL = (
  process.env.FSM_ADMIN_URL ||
  'https://frontend-one-tawny-63.vercel.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

const STOREFRONT_URL = (
  process.env.FSM_STOREFRONT_URL ||
  'https://www.materialsolutionsnj.com'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

const PR_NUMBER = process.env.FSM_PR_NUMBER || '20';
const STRICT = process.argv.includes('--strict');
const REQUIRED_PR_CHECKS = [
  'Backend tests',
  'Admin frontend build',
  'Storefront build',
];
const REQUIRED_ADMIN_BUNDLE_MARKERS = [
  'Publish Button',
  'Test Mode',
  'RUN TEST',
  'Publish Test Running',
  'dryRun',
  'testMode',
  'https://vortex-forklift-api-production.up.railway.app',
];
const REQUIRED_ADMIN_FALLBACK_MARKERS = [
  'manual_required',
  'Confirm EquipFinder vendor/contact path',
  'Confirm current MachineryATS domain/portal',
  'Confirm approved Forkliftaction member account',
  'Confirm channel manager approval',
];

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function commandOk(command, args) {
  const result = run(command, args);
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    status: result.status,
  };
}

function boolEnv(name) {
  return ['1', 'true', 'yes', 'y'].includes(String(process.env[name] || '').trim().toLowerCase());
}

function summarizeChecks(statusCheckRollup = []) {
  if (!Array.isArray(statusCheckRollup) || statusCheckRollup.length === 0) {
    return 'no GitHub status checks reported';
  }

  return statusCheckRollup.map((check) => {
    const name = check.name || check.context || check.workflowName || check.__typename || 'unknown check';
    const state = check.conclusion || check.state || check.status || 'unknown';
    return `${name}:${state}`;
  }).join(', ');
}

function getCheckState(check = {}) {
  return String(check.conclusion || check.state || check.status || 'unknown').toUpperCase();
}

function findBlockingChecks(statusCheckRollup = []) {
  if (!Array.isArray(statusCheckRollup) || statusCheckRollup.length === 0) {
    return ['no GitHub status checks reported'];
  }

  const observedNames = new Set(statusCheckRollup.map((check) => {
    return check.name || check.context || check.workflowName || check.__typename || 'unknown check';
  }));
  const missingRequiredChecks = REQUIRED_PR_CHECKS
    .filter((name) => !observedNames.has(name))
    .map((name) => `required check missing: ${name}`);

  return statusCheckRollup.flatMap((check) => {
    const name = check.name || check.context || check.workflowName || check.__typename || 'unknown check';
    const state = getCheckState(check);
    return state === 'SUCCESS' ? [] : [`${name} is ${state}`];
  }).concat(missingRequiredChecks);
}

function summarizeReviews(latestReviews = [], reviewDecision = '') {
  if (reviewDecision) return reviewDecision;
  if (!Array.isArray(latestReviews) || latestReviews.length === 0) return 'no reviews yet';
  return latestReviews.map((review) => `${review.author?.login || 'reviewer'}:${review.state}`).join(', ');
}

async function backendHealth() {
  const response = await fetch(`${BACKEND_URL}/health`);
  const body = await response.json().catch(() => null);
  return {
    ok: response.ok && body?.status === 'ok' && body?.database === 'connected',
    status: response.status,
    body,
  };
}

async function adminDeployHealth() {
  const response = await fetch(ADMIN_URL);
  const body = await response.text().catch(() => '');
  return {
    ok: response.ok && body.includes('<div id="root"></div>'),
    status: response.status,
  };
}

async function fetchAdminText(path) {
  const response = await fetch(`${ADMIN_URL}${path}`);
  const body = await response.text().catch(() => '');
  if (!response.ok) {
    throw new Error(`${path} failed with HTTP ${response.status}`);
  }
  return body;
}

async function adminBundleHealth() {
  const manifest = JSON.parse(await fetchAdminText('/asset-manifest.json'));
  const jsPaths = Object.values(manifest.files || {})
    .filter((path) => typeof path === 'string' && path.startsWith('/static/js/') && path.endsWith('.js'));
  if (!jsPaths.length) {
    return {
      ok: false,
      bundleCount: 0,
      missingMarkers: ['JavaScript bundles'],
    };
  }

  const bundleText = (await Promise.all(jsPaths.map((path) => fetchAdminText(path)))).join('\n');
  const missingMarkers = REQUIRED_ADMIN_BUNDLE_MARKERS
    .concat(REQUIRED_ADMIN_FALLBACK_MARKERS)
    .filter((marker) => !bundleText.includes(marker));
  return {
    ok: missingMarkers.length === 0,
    bundleCount: jsPaths.length,
    missingMarkers,
  };
}

async function storefrontInventoryHealth() {
  const response = await fetch(`${STOREFRONT_URL}/api/inventory?limit=1`);
  const body = await response.json().catch(() => null);
  const total = Number(body?.total || 0);
  const itemCount = Array.isArray(body?.items) ? body.items.length : 0;
  const firstInventoryId = body?.items?.[0]?.id || null;
  return {
    ok: response.ok && body?.degraded === false && total > 0 && itemCount > 0 && Boolean(firstInventoryId),
    status: response.status,
    total,
    itemCount,
    degraded: body?.degraded,
    firstInventoryId,
  };
}

async function storefrontPublishAuthHealth(inventoryId) {
  if (!inventoryId) {
    return {
      ok: false,
      status: 'missing_inventory_id',
    };
  }

  const response = await fetch(`${STOREFRONT_URL}/api/publish/${inventoryId}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      dryRun: true,
      testMode: true,
      platforms: ['materialsolutionsnj'],
    }),
  });
  return {
    ok: response.status === 403,
    status: response.status,
  };
}

async function main() {
  const blockers = [];
  const warnings = [];

  const branch = commandOk('git', ['branch', '--show-current']);
  const head = commandOk('git', ['rev-parse', 'HEAD']);
  const upstream = commandOk('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const upstreamHead = upstream.ok ? commandOk('git', ['rev-parse', '@{u}']) : { ok: false, stdout: '' };
  const status = commandOk('git', ['status', '--short']);

  if (!status.ok) {
    blockers.push('unable to inspect git status');
  } else if (status.stdout) {
    blockers.push('working tree has uncommitted changes');
  }

  if (head.ok && upstreamHead.ok && head.stdout !== upstreamHead.stdout) {
    blockers.push(`local HEAD ${head.stdout.slice(0, 7)} is not equal to upstream ${upstreamHead.stdout.slice(0, 7)}`);
  }

  let pr = null;
  const prResult = commandOk('gh', [
    'pr',
    'view',
    PR_NUMBER,
    '--json',
    'url,state,isDraft,mergeable,headRefOid,statusCheckRollup,reviewDecision,latestReviews',
  ]);
  if (!prResult.ok) {
    blockers.push(`unable to inspect PR #${PR_NUMBER} with gh`);
    warnings.push(prResult.stderr || prResult.stdout || 'gh returned no details');
  } else {
    pr = JSON.parse(prResult.stdout);
    if (pr.state !== 'OPEN') blockers.push(`PR #${PR_NUMBER} is ${pr.state}`);
    if (pr.isDraft) blockers.push(`PR #${PR_NUMBER} is still draft`);
    if (pr.mergeable && pr.mergeable !== 'MERGEABLE') blockers.push(`PR #${PR_NUMBER} mergeable state is ${pr.mergeable}`);
    if (!pr.reviewDecision) blockers.push(`PR #${PR_NUMBER} has no review decision yet`);
    for (const checkBlocker of findBlockingChecks(pr.statusCheckRollup)) {
      blockers.push(`PR #${PR_NUMBER} check not ready: ${checkBlocker}`);
    }
  }

  let health = null;
  let adminHealth = null;
  let adminBundle = null;
  let storefrontHealth = null;
  let storefrontPublishAuth = null;
  try {
    health = await backendHealth();
    if (!health.ok) {
      blockers.push(`backend health failed with HTTP ${health.status}`);
    }
  } catch (error) {
    blockers.push(`backend health request failed: ${error.message}`);
  }

  try {
    adminHealth = await adminDeployHealth();
    if (!adminHealth.ok) {
      blockers.push(`admin deployment shell failed with HTTP ${adminHealth.status}`);
    }
  } catch (error) {
    blockers.push(`admin deployment shell request failed: ${error.message}`);
  }

  try {
    adminBundle = await adminBundleHealth();
    if (!adminBundle.ok) {
      blockers.push(`admin deployment bundle is missing markers: ${adminBundle.missingMarkers.join(', ')}`);
    }
  } catch (error) {
    blockers.push(`admin deployment bundle marker request failed: ${error.message}`);
  }

  try {
    storefrontHealth = await storefrontInventoryHealth();
    if (!storefrontHealth.ok) {
      blockers.push(`storefront inventory bridge failed with HTTP ${storefrontHealth.status}`);
    }
  } catch (error) {
    blockers.push(`storefront inventory bridge request failed: ${error.message}`);
  }

  try {
    storefrontPublishAuth = await storefrontPublishAuthHealth(storefrontHealth?.firstInventoryId);
    if (!storefrontPublishAuth.ok) {
      blockers.push(`storefront unauthenticated Publish Button POST expected 403 but got ${storefrontPublishAuth.status}`);
    }
  } catch (error) {
    blockers.push(`storefront unauthenticated Publish Button POST request failed: ${error.message}`);
  }

  const adminUiVerified = boolEnv('FSM_ADMIN_UI_VERIFIED') || boolEnv('FSM_ADMIN_UI_SESSION_READY');
  const externalPublishApproved = boolEnv('FSM_EXTERNAL_PUBLISH_APPROVED');

  if (!adminUiVerified) {
    blockers.push('full admin UI login/render verification still needs an approved credential/session');
  }
  if (!externalPublishApproved) {
    blockers.push('external marketplace publishing still needs Chris-approved target/platform/account');
  }

  const readyToMerge = blockers.length === 0;

  console.log('Forklift Sales Machine PR readiness receipt');
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Branch: ${branch.stdout || 'unknown'}`);
  console.log(`HEAD: ${head.stdout || 'unknown'}`);
  console.log(`Upstream: ${upstream.stdout || 'none'}`);
  console.log(`Working tree: ${status.stdout ? 'DIRTY' : 'clean'}`);
  console.log(`Backend health: ${health?.ok ? `OK (${health.body?.responseTime || 'healthy'}, DB ${health.body?.database})` : 'not OK'}`);
  console.log(`Admin deployment shell: ${adminHealth?.ok ? 'OK' : 'not OK'}`);
  console.log(`Admin deployment bundle markers: ${adminBundle?.ok ? `OK (${adminBundle.bundleCount} bundles checked)` : 'not OK'}`);
  console.log(`Storefront inventory bridge: ${storefrontHealth?.ok ? `OK (${storefrontHealth.itemCount}/${storefrontHealth.total} checked, degraded:${storefrontHealth.degraded})` : 'not OK'}`);
  console.log(`Storefront unauthenticated Publish Button POST: ${storefrontPublishAuth?.ok ? 'OK (403 blocked)' : 'not OK'}`);

  if (pr) {
    console.log(`PR: #${PR_NUMBER} ${pr.url}`);
    console.log(`PR state: ${pr.state}, draft:${pr.isDraft}, mergeable:${pr.mergeable || 'unknown'}`);
    console.log(`PR head: ${String(pr.headRefOid || '').slice(0, 12)}`);
    console.log(`Required PR checks: ${REQUIRED_PR_CHECKS.join(', ')}`);
    console.log(`PR checks: ${summarizeChecks(pr.statusCheckRollup)}`);
    console.log(`PR reviews: ${summarizeReviews(pr.latestReviews, pr.reviewDecision)}`);
  }

  console.log(`Admin UI verified: ${adminUiVerified ? 'yes' : 'no'}`);
  console.log(`External publish approved: ${externalPublishApproved ? 'yes' : 'no'}`);
  console.log(`Ready to mark PR ready/merge: ${readyToMerge ? 'YES' : 'NO'}`);

  if (blockers.length) {
    console.log('Current blockers:');
    for (const blocker of blockers) {
      console.log(`- ${blocker}`);
    }
  }

  if (warnings.length) {
    console.log('Warnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (STRICT && !readyToMerge) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(`FSM PR readiness check failed: ${error.message}`);
  process.exit(1);
});
