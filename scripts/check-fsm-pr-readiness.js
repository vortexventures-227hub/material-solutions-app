#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');

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
const JSON_OUTPUT = process.argv.includes('--json');
const REQUIRED_PR_CHECKS = [
  'FSM script checks',
  'Backend tests',
  'Admin frontend build',
  'Storefront build',
];
const REQUIRED_PR_BODY_MARKERS = [
  '431ed673-46a5-4a9b-a534-f63ecedb5f95',
  '47/47',
  '11-channel',
  'backend unauthenticated Publish Button catalog protection',
  'Storefront unauthenticated Publish Button POST',
  'FSM script checks',
  'npm run check:fsm-scripts',
  'npm run smoke:admin-session',
  'gateActions',
  'Remaining Gates',
  'Chris-approved target/platform/account',
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

function adminAuthAvailable() {
  const hasToken = Boolean(
    process.env.FSM_ADMIN_ACCESS_TOKEN ||
    process.env.FSM_BACKEND_TOKEN ||
    process.env.FSM_SERVICE_JWT
  );
  const hasLogin = Boolean(
    (process.env.FSM_ADMIN_EMAIL || process.env.FSM_BACKEND_EMAIL) &&
    (process.env.FSM_ADMIN_PASSWORD || process.env.FSM_BACKEND_PASSWORD)
  );
  return hasToken || hasLogin;
}

function externalPublishTargetAvailable() {
  return Boolean(
    process.env.FSM_EXTERNAL_PUBLISH_PLATFORM &&
    process.env.FSM_EXTERNAL_PUBLISH_ACCOUNT &&
    (
      boolEnv('FSM_EXTERNAL_PUBLISH_TARGET_APPROVED') ||
      boolEnv('FSM_CHRIS_APPROVED_EXTERNAL_TARGET')
    )
  );
}

function buildGateActions({
  pr,
  adminUiVerified,
  hasAdminAuth,
  externalPublishApproved,
  hasExternalPublishTarget,
} = {}) {
  const actions = [];

  if (pr?.isDraft) {
    actions.push({
      gate: 'pr_draft',
      owner: 'Chris/reviewer',
      action: `Approve marking PR #${PR_NUMBER} ready for review or merge.`,
      verification: `gh pr ready ${PR_NUMBER}`,
    });
  }

  if (!pr?.reviewDecision) {
    actions.push({
      gate: 'pr_review',
      owner: 'Chris/reviewer',
      action: `Review and approve PR #${PR_NUMBER}.`,
      verification: `gh pr view ${PR_NUMBER} --json reviewDecision`,
    });
  }

  if (!adminUiVerified) {
    actions.push(hasAdminAuth ? {
      gate: 'admin_session_smoke',
      owner: 'Koda',
      action: 'Run npm run smoke:admin-session with the approved admin auth already present, then set FSM_ADMIN_UI_VERIFIED=1 for the readiness pass if it succeeds.',
      verification: 'npm run smoke:admin-session',
    } : {
      gate: 'admin_session_smoke',
      owner: 'Chris',
      action: 'Provide approved admin auth via FSM_ADMIN_ACCESS_TOKEN, FSM_BACKEND_TOKEN, FSM_SERVICE_JWT, or FSM_ADMIN_EMAIL plus FSM_ADMIN_PASSWORD.',
      verification: 'npm run smoke:admin-session',
    });
  }

  if (!externalPublishApproved) {
    actions.push(hasExternalPublishTarget ? {
      gate: 'external_publish_target',
      owner: 'Koda',
      action: 'Run guarded dry-run verification for FSM_EXTERNAL_PUBLISH_PLATFORM before any live external publish.',
      verification: 'FSM_EXTERNAL_PUBLISH_APPROVED=1 readiness pass after dry-run verification',
    } : {
      gate: 'external_publish_target',
      owner: 'Chris',
      action: 'Provide Chris-approved external publish platform, account, and target approval before any live external publish.',
      verification: 'FSM_EXTERNAL_PUBLISH_PLATFORM plus FSM_EXTERNAL_PUBLISH_ACCOUNT plus FSM_EXTERNAL_PUBLISH_TARGET_APPROVED=1',
    });
  }

  return actions;
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

function findMissingPrBodyMarkers(body = '') {
  return REQUIRED_PR_BODY_MARKERS.filter((marker) => !String(body || '').includes(marker));
}

function bootstrapFreshness(head = '') {
  const shortHead = String(head || '').slice(0, 7);
  try {
    const body = fs.readFileSync('FSM_FRESH_CHAT_BOOTSTRAP.md', 'utf8');
    const requiredMarkers = [
      'Current verified head source of truth: `npm run check:fsm-pr-readiness`',
      'Current JSON readiness source of truth: `npm --silent run check:fsm-pr-readiness:json`',
      'nextAction: needs_human_input',
      'no source/deploy/CI/agent gates',
      'FSM script checks',
      'npm run check:fsm-scripts',
      'gateActions',
    ];
    const missingMarkers = requiredMarkers.filter((marker) => !body.includes(marker));
    return {
      ok: missingMarkers.length === 0,
      shortHead,
      missingMarkers,
    };
  } catch (error) {
    return {
      ok: false,
      shortHead,
      missingMarkers: [`FSM_FRESH_CHAT_BOOTSTRAP.md unreadable: ${error.message}`],
    };
  }
}

function summarizeReviews(latestReviews = [], reviewDecision = '') {
  if (reviewDecision) return reviewDecision;
  if (!Array.isArray(latestReviews) || latestReviews.length === 0) return 'no reviews yet';
  return latestReviews.map((review) => `${review.author?.login || 'reviewer'}:${review.state}`).join(', ');
}

function compactChecks(statusCheckRollup = []) {
  if (!Array.isArray(statusCheckRollup)) return [];
  return statusCheckRollup.map((check) => {
    const name = check.name || check.context || check.workflowName || check.__typename || 'unknown check';
    return {
      name,
      state: getCheckState(check),
      workflowName: check.workflowName || null,
      detailsUrl: check.detailsUrl || null,
    };
  });
}

function classifyBlocker(blocker) {
  const text = String(blocker || '').toLowerCase();
  if (text.includes('approved admin auth appears available')) {
    return 'agentGates';
  }
  if (text.includes('chris-approved external publish target appears available')) {
    return 'agentGates';
  }
  if (
    text.includes('approved credential') ||
    text.includes('approved target') ||
    text.includes('no review decision') ||
    text.includes('still draft')
  ) {
    return 'humanGates';
  }
  if (text.includes('check not ready')) {
    return 'ciGates';
  }
  if (
    text.includes('backend') ||
    text.includes('admin deployment') ||
    text.includes('storefront')
  ) {
    return 'deployGates';
  }
  if (
    text.includes('working tree') ||
    text.includes('local head') ||
    text.includes('body is missing') ||
    text.includes('bootstrap')
  ) {
    return 'sourceGates';
  }
  return 'agentGates';
}

function classifyBlockers(blockers = []) {
  return blockers.reduce((groups, blocker) => {
    const category = classifyBlocker(blocker);
    groups[category].push(blocker);
    return groups;
  }, {
    humanGates: [],
    ciGates: [],
    deployGates: [],
    sourceGates: [],
    agentGates: [],
  });
}

function nextActionFor(classifiedBlockers) {
  if (classifiedBlockers.agentGates.length || classifiedBlockers.sourceGates.length || classifiedBlockers.deployGates.length) {
    return 'agent_action_required';
  }
  if (classifiedBlockers.ciGates.length) {
    return 'wait_for_ci';
  }
  if (classifiedBlockers.humanGates.length) {
    return 'needs_human_input';
  }
  return 'ready_to_mark_ready_or_merge';
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

async function backendPublishAuthHealth() {
  const response = await fetch(`${BACKEND_URL}/api/publish/platforms`);
  return {
    ok: response.status === 401,
    status: response.status,
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
  const generatedAt = new Date().toISOString();

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

  const bootstrap = bootstrapFreshness(head.stdout);
  if (!bootstrap.ok) {
    blockers.push(`FSM bootstrap freshness markers are missing for ${bootstrap.shortHead}: ${bootstrap.missingMarkers.join(', ')}`);
  }

  let pr = null;
  const prResult = commandOk('gh', [
    'pr',
    'view',
    PR_NUMBER,
    '--json',
    'url,state,isDraft,mergeable,headRefOid,statusCheckRollup,reviewDecision,latestReviews,body',
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
    const missingPrBodyMarkers = findMissingPrBodyMarkers(pr.body);
    if (missingPrBodyMarkers.length) {
      blockers.push(`PR #${PR_NUMBER} body is missing current readiness markers: ${missingPrBodyMarkers.join(', ')}`);
    }
  }

  let health = null;
  let backendPublishAuth = null;
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
    backendPublishAuth = await backendPublishAuthHealth();
    if (!backendPublishAuth.ok) {
      blockers.push(`backend unauthenticated Publish Button catalog expected 401 but got ${backendPublishAuth.status}`);
    }
  } catch (error) {
    blockers.push(`backend unauthenticated Publish Button catalog request failed: ${error.message}`);
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
  const hasAdminAuth = adminAuthAvailable();
  const externalPublishApproved = boolEnv('FSM_EXTERNAL_PUBLISH_APPROVED');
  const hasExternalPublishTarget = externalPublishTargetAvailable();

  if (!adminUiVerified) {
    if (hasAdminAuth) {
      blockers.push('approved admin auth appears available; run npm run smoke:admin-session and then set FSM_ADMIN_UI_VERIFIED=1 for the readiness pass');
    } else {
      blockers.push('full admin UI login/render verification still needs an approved credential/session; run npm run smoke:admin-session with approved admin auth, then set FSM_ADMIN_UI_VERIFIED=1');
    }
  }
  if (!externalPublishApproved) {
    if (hasExternalPublishTarget) {
      blockers.push('Chris-approved external publish target appears available; run guarded dry-run verification for FSM_EXTERNAL_PUBLISH_PLATFORM and set FSM_EXTERNAL_PUBLISH_APPROVED=1 before any live publish');
    } else {
      blockers.push('external marketplace publishing still needs Chris-approved target/platform/account');
    }
  }

  const readyToMerge = blockers.length === 0;
  const prMissingBodyMarkers = findMissingPrBodyMarkers(pr?.body);
  const classifiedBlockers = classifyBlockers(blockers);
  const nextAction = nextActionFor(classifiedBlockers);
  const gateActions = buildGateActions({
    pr,
    adminUiVerified,
    hasAdminAuth,
    externalPublishApproved,
    hasExternalPublishTarget,
  });
  const receipt = {
    generatedAt,
    branch: branch.stdout || 'unknown',
    head: head.stdout || 'unknown',
    upstream: upstream.stdout || 'none',
    workingTree: status.stdout ? 'DIRTY' : 'clean',
    bootstrap: {
      currentHeadMarkersOk: bootstrap.ok,
      expectedShortHead: bootstrap.shortHead,
      missingMarkers: bootstrap.missingMarkers,
    },
    backend: {
      healthOk: Boolean(health?.ok),
      healthStatus: health?.status || null,
      database: health?.body?.database || null,
      responseTime: health?.body?.responseTime || null,
      unauthenticatedPublishCatalogProtected: Boolean(backendPublishAuth?.ok),
      unauthenticatedPublishCatalogStatus: backendPublishAuth?.status || null,
    },
    admin: {
      shellOk: Boolean(adminHealth?.ok),
      shellStatus: adminHealth?.status || null,
      bundleMarkersOk: Boolean(adminBundle?.ok),
      bundleCount: adminBundle?.bundleCount || 0,
      missingBundleMarkers: adminBundle?.missingMarkers || [],
      authAvailable: hasAdminAuth,
      uiVerified: adminUiVerified,
    },
    storefront: {
      inventoryBridgeOk: Boolean(storefrontHealth?.ok),
      inventoryStatus: storefrontHealth?.status || null,
      total: storefrontHealth?.total || 0,
      checkedItems: storefrontHealth?.itemCount || 0,
      degraded: storefrontHealth?.degraded ?? null,
      unauthenticatedPublishPostProtected: Boolean(storefrontPublishAuth?.ok),
      unauthenticatedPublishPostStatus: storefrontPublishAuth?.status || null,
    },
    pr: pr ? {
      number: PR_NUMBER,
      url: pr.url,
      state: pr.state,
      isDraft: Boolean(pr.isDraft),
      mergeable: pr.mergeable || 'unknown',
      head: pr.headRefOid || null,
      requiredChecks: REQUIRED_PR_CHECKS,
      checks: compactChecks(pr.statusCheckRollup),
      bodyMarkersOk: prMissingBodyMarkers.length === 0,
      missingBodyMarkers: prMissingBodyMarkers,
      reviews: summarizeReviews(pr.latestReviews, pr.reviewDecision),
    } : null,
    externalPublish: {
      approved: externalPublishApproved,
      targetAvailable: hasExternalPublishTarget,
      platform: process.env.FSM_EXTERNAL_PUBLISH_PLATFORM || null,
      accountProvided: Boolean(process.env.FSM_EXTERNAL_PUBLISH_ACCOUNT),
    },
    externalPublishApproved,
    readyToMerge,
    nextAction,
    gateActions,
    classifiedBlockers,
    blockers,
    warnings,
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(receipt, null, 2));
    if (STRICT && !readyToMerge) {
      process.exit(2);
    }
    return;
  }

  console.log('Forklift Sales Machine PR readiness receipt');
  console.log(`Generated: ${generatedAt}`);
  console.log(`Branch: ${branch.stdout || 'unknown'}`);
  console.log(`HEAD: ${head.stdout || 'unknown'}`);
  console.log(`Upstream: ${upstream.stdout || 'none'}`);
  console.log(`Working tree: ${status.stdout ? 'DIRTY' : 'clean'}`);
  console.log(`Bootstrap current head markers: ${bootstrap.ok ? 'OK' : 'not OK'}`);
  console.log(`Backend health: ${health?.ok ? `OK (${health.body?.responseTime || 'healthy'}, DB ${health.body?.database})` : 'not OK'}`);
  console.log(`Backend unauthenticated Publish Button catalog: ${backendPublishAuth?.ok ? 'OK (401 protected)' : 'not OK'}`);
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
    console.log(`PR body markers: ${findMissingPrBodyMarkers(pr.body).length ? 'not OK' : 'OK'}`);
    console.log(`PR reviews: ${summarizeReviews(pr.latestReviews, pr.reviewDecision)}`);
  }

  console.log(`Admin UI verified: ${adminUiVerified ? 'yes' : 'no'}`);
  console.log(`Admin auth available: ${hasAdminAuth ? 'yes' : 'no'}`);
  console.log(`External publish approved: ${externalPublishApproved ? 'yes' : 'no'}`);
  console.log(`External publish target available: ${hasExternalPublishTarget ? 'yes' : 'no'}`);
  console.log(`Ready to mark PR ready/merge: ${readyToMerge ? 'YES' : 'NO'}`);
  console.log(`Next action classification: ${nextAction}`);

  if (blockers.length) {
    console.log('Current blockers:');
    for (const blocker of blockers) {
      console.log(`- ${blocker}`);
    }
  }

  if (gateActions.length) {
    console.log('Gate actions:');
    for (const item of gateActions) {
      console.log(`- ${item.gate} (${item.owner}): ${item.action}`);
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
