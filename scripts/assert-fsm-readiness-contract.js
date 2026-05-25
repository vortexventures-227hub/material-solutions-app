#!/usr/bin/env node
const fs = require('node:fs');

const readinessScript = fs.readFileSync('scripts/check-fsm-pr-readiness.js', 'utf8');

const requiredSnippets = [
  "gateActions",
  "gate: 'pr_draft'",
  "gate: 'pr_review'",
  "gate: 'admin_session_smoke'",
  "gate: 'external_publish_target'",
  "owner: 'Chris/reviewer'",
  "owner: 'Chris'",
  "owner: 'Koda'",
  "approved admin auth appears available",
  "Chris-approved external publish target appears available",
  "REQUIRED_PR_BODY_MARKERS",
  "assert-fsm-platform-feasibility",
  "FSM_PLATFORM_CONNECTION_FEASIBILITY.md",
  "47-platform registry scope",
  "connectable as Forklift Sales Machine destinations",
  "fully automatic public posting targets",
  "api_or_feed",
  "partner_or_portal",
  "guarded_manual",
];

const missing = requiredSnippets.filter((snippet) => !readinessScript.includes(snippet));
if (missing.length) {
  console.error('FSM readiness contract assertion failed.');
  for (const snippet of missing) {
    console.error(`- Missing required snippet: ${snippet}`);
  }
  process.exit(1);
}

console.log('FSM readiness contract assertions: OK');
