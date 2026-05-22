#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const BACKEND_URL = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

const PR_NUMBER = process.env.FSM_PR_NUMBER || '20';
const STRICT = process.argv.includes('--strict');

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
  }

  let health = null;
  try {
    health = await backendHealth();
    if (!health.ok) {
      blockers.push(`backend health failed with HTTP ${health.status}`);
    }
  } catch (error) {
    blockers.push(`backend health request failed: ${error.message}`);
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

  if (pr) {
    console.log(`PR: #${PR_NUMBER} ${pr.url}`);
    console.log(`PR state: ${pr.state}, draft:${pr.isDraft}, mergeable:${pr.mergeable || 'unknown'}`);
    console.log(`PR head: ${String(pr.headRefOid || '').slice(0, 12)}`);
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
