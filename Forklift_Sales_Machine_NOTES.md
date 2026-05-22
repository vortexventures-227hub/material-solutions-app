# Forklift Sales Machine Notes

## 2026-05-21 17:12 EDT
- Chris redirected Koda heartbeat work to complete the Forklift Sales Machine backend/admin/storefront for MaterialSolutionsNJ.com within the 24-hour window.
- Required terms: use "Forklift Sales Machine" and "Publish Button"; do not call it "Push Button" except when quoting legacy paths.
- Storefront production auth is green after Vercel production received `FSM_BACKEND_EMAIL` and `FSM_BACKEND_PASSWORD`.
- Production storefront smoke:
  - `https://www.materialsolutionsnj.com/api/inventory?limit=1` returns HTTP 200 with live FSM inventory and `degraded:false`.
  - `https://www.materialsolutionsnj.com/api/publish/<inventoryId>/payload` returns HTTP 200 with `source:"forklift-sales-machine"` and complete payload.
  - Live listing detail pages render HTTP 200.
- Admin frontend Publish Button compatibility patch deployed to Vercel production:
  - Deployment: `https://frontend-1ykdthvna-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://frontend-one-tawny-63.vercel.app`
  - Bundle confirms `REACT_APP_API_URL=https://vortex-forklift-api-production.up.railway.app`.
- Backend local tests are green: `npm test -- --runInBand` in `backend` passes 37/37.
- Current real blocker: Railway CLI is unauthorized (`railway status` returns invalid_grant / run `railway login`), so local backend Publish Button route/catalog/retry/manual draft changes are not confirmed deployed to the live Railway backend.
- Next step: regain Railway deploy access or use a confirmed GitHub-to-Railway production path, then deploy backend and smoke protected Publish Button endpoints with live auth.

## 2026-05-21 17:31 EDT
- Chris granted Railway CLI access through Safari browserless activation.
- Railway target verified: project `vortex-forklift-api`, environment `production`, service `vortex-forklift-api`.
- Root `railway up` was stopped because indexing the full local repo was too slow; backend-only deploy succeeded using `railway up --detach --path-as-root backend`.
- Railway deployment `14d6c60c-75d0-499a-b3c2-536c4c50ebf1` reached `SUCCESS`.
- Live backend smoke:
  - `/health` returns HTTP 200, DB connected, production version.
  - Storefront bridge still returns live inventory with `degraded:false`.
  - Read-only authenticated smoke using Railway env/JWT verified `/api/publish/platforms` returns 11 Publish Button channels and `/api/publish/<inventoryId>/payload` returns HTTP 200.
- Remaining: continue product completion work beyond backend/admin/storefront deployment, especially marketplace-specific credential/API integrations and end-to-end Publish Button write-path verification.

## 2026-05-21 17:33 EDT
- Chris flagged this chat is too large for mobile use and needs a fresh-chat continuation without losing context.
- Created `FSM_FRESH_CHAT_BOOTSTRAP.md` at the project root as the one-file bootstrap anchor for a new chat.
- Fresh chat instruction: choose folder `/Users/vortexventures/Desktop/Vortex Ventures/VVAxeOps/material-solutions-app`, then ask Koda to read `FSM_FRESH_CHAT_BOOTSTRAP.md` first and continue the highest-impact unfinished Forklift Sales Machine item.

## 2026-05-21 21:33 EDT
- Source preservation is complete on branch `codex/fsm-inventory-intake-media-20260429`.
- Draft PR opened: https://github.com/vortexventures-227hub/material-solutions-app/pull/20
- New commits after the fresh-chat bootstrap:
  - `d8a4c1a` preserve Forklift Sales Machine Publish Button bridge source.
  - `88fcd88` stop tracking generated storefront `.next` output.
  - `6f39c52` add explicit Publish Button `dryRun`/`testMode` guard.
  - `f895081` ignore `materialsolutionsnj/node_modules`.
  - `6808e38` add `.railwayignore` so Railway backend deploys upload only the API surface.
- Backend deployed to Railway production:
  - Deployment ID: `03624fb6-0568-423b-bcfe-cf824689fb47`
  - Status: `SUCCESS`
  - `/health` returns HTTP 200 with DB connected.
- Admin frontend deployed to Vercel production:
  - Deployment: `https://frontend-mjgt8rhx5-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://frontend-one-tawny-63.vercel.app`
  - Bundle contains `Test Mode`, `RUN TEST`, `dryRun`, and `testMode`.
- Storefront deployed to Vercel production:
  - Deployment: `https://materialsolutionsnj-l7lllls1p-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://www.materialsolutionsnj.com`
- Verified live behavior:
  - Storefront `/api/inventory?limit=1` returns HTTP 200, `degraded:false`, total 6.
  - Storefront `/api/publish/<inventoryId>/payload` returns HTTP 200 and `complete:true`.
  - Storefront unauthenticated Publish Button POST returns HTTP 403, so public write-path remains blocked.
  - Authenticated backend `dryRun` POST for `materialsolutionsnj` + `facebook_marketplace` returns `dryRun:true`, `testMode:true`, `materialsolutionsnj:dry_run_ready`, `facebook_marketplace:manual_required`, and `mutationPerformed:false`.
- Tests/builds:
  - Backend tests pass 38/38.
  - Admin frontend build passes.
  - Storefront build passes.
- Remaining real blocker:
  - Full live admin UI login/render verification needs an approved admin credential or existing authenticated browser session.
  - No external marketplace auto-posting should be attempted without a Chris-approved test target/platform.

## 2026-05-21 23:00 EDT
- Guarded manual draft channel expansion deployed to Railway production.
  - Deployment ID: `77bfe922-2fe9-4588-9869-edc9cdfe4108`
  - Status: `SUCCESS`
  - `/health` returns HTTP 200 with DB connected.
- Backend tests are green: `npm test -- --runInBand` in `backend` passes 44/44.
- Local publisher manual drafts now support:
  - Facebook Marketplace
  - MachineryTrader
  - EquipFinder
  - MachineryATS
  - eBay Business
  - LinkedIn
  - Google Business Profile
  - Forkliftaction Forum
  - YouTube
- Manual draft receipts include `submitDisabled:true`, `mutationPerformed:false`, no-submit guardrails, and a Chris-approval review checklist.
- Live authenticated smoke:
  - `npm run smoke:fsm-dry-run` verifies all 11 Publish Button channels against production.
  - `materialsolutionsnj` returns `dry_run_ready`.
  - Craigslist plus the 9 other manual channels return `manual_required`, `mutationPerformed:false`, `submitDisabled:true`, and the Chris-approval guardrail.

## 2026-05-21 23:59 EDT
- Added repo-root aggregate live smoke command:
  - `npm run smoke:fsm-live`
- The command verifies:
  - Railway backend `/health`.
  - Admin production shell and Publish Button Test Mode bundle markers.
  - Production-authenticated 11-channel Publish Button dry-run with no external mutation.
- Latest run passed end to end.

## 2026-05-22 00:22 EDT
- Refreshed Craigslist guarded local-draft receipt to match the newer manual channel safety shape:
  - `submitDisabled:true`
  - `mutationPerformed:false`
  - no-submit guardrails
  - Chris-approval review checklist
- Deployed backend to Railway production:
  - Deployment ID: `7955b2a6-9b75-43e7-a358-11db7f1aba6d`
  - Status: `SUCCESS`
- `npm run smoke:fsm-live` now passes with all 11 Publish Button channels checked against production.

## 2026-05-22 00:50 EDT
- Added Facebook Marketplace-specific guarded draft fields:
  - Chris-approved account/page requirement.
  - Manual category-fit warning for forklift/equipment listings.
  - Location, availability, condition, and seller-disclosure fields.
  - CLI hints: `--location`, `--category-hint`, and `--account-label`.
- Deployed backend to Railway production:
  - Deployment ID: `d8739d89-f412-4816-b9fa-bdc6647b092d`
  - Status: `SUCCESS`
- `npm run smoke:fsm-live` passed and now asserts the Facebook Marketplace-specific draft shape in production.

## 2026-05-22 01:10 EDT
- Added eBay Business guarded draft/OAuth readiness fields:
  - Chris-approved eBay Business seller account requirement.
  - OAuth readiness with required scopes: `sell.inventory`, `sell.account`, and `sell.fulfillment`.
  - Business policy, category, condition, quantity, payment, return, and fulfillment draft fields.
  - CLI hints: `--ebay-account`, `--ebay-environment`, `--listing-format`, `--payment-policy`, `--return-policy`, and `--fulfillment-policy`.
- Deployed backend to Railway production:
  - Deployment ID: `7c9fe93c-8be1-4faf-9885-3a145597aaa5`
  - Status: `SUCCESS`
- Backend tests now pass 40/40.
- `npm run smoke:fsm-live` passed and now asserts the eBay OAuth/business-policy readiness draft shape in production.

## 2026-05-22 01:30 EDT
- Added Google Business Profile guarded permission readiness fields based on official Google Business Profile API docs:
  - Chris-approved owner/manager account requirement.
  - OAuth readiness with required scope `https://www.googleapis.com/auth/business.manage`.
  - Account/location ID readiness for `accounts.locations.localPosts`.
  - Local Post / `LEARN_MORE` CTA draft fields pointing to the inventory URL.
  - Product Posts unsupported guardrail for the API path.
  - CLI hints: `--google-account`, `--google-business-account-id`, `--google-location-id`, `--post-type`, `--topic-type`, `--call-to-action`, and `--language-code`.
- Deployed backend to Railway production:
  - Deployment ID: `430e4501-5249-413a-bc0a-0404bef499df`
  - Status: `SUCCESS`
- Backend tests now pass 41/41.
- `npm run smoke:fsm-live` passed and now asserts the Google Business Profile permission readiness draft shape in production.

## 2026-05-22 01:50 EDT
- Added MachineryTrader guarded vendor credential readiness fields based on MachineryTrader's official advertising/dealer-program pages:
  - Chris-approved dealer/advertiser account requirement.
  - Sandhills Dealer Portal or approved inventory feed readiness.
  - Dealer advertising program/package, billing/contact owner, and contact phone reminders.
  - Forklift category and required equipment spec checklist.
  - CLI hints: `--machinerytrader-account`, `--dealer-program`, `--machinerytrader-contact-phone`, `--portal-url`, `--source-system`, and `--listing-type`.
- Deployed backend to Railway production:
  - Deployment ID: `53fbc80e-8766-4bb3-b0ac-7729f9f785be`
  - Status: `SUCCESS`
- Backend tests now pass 42/42.
- `npm run smoke:fsm-live` passed and now asserts the MachineryTrader vendor credential readiness draft shape in production.

## 2026-05-22 08:32 EDT
- Added LinkedIn Company Page guarded readiness fields based on official LinkedIn Marketing API / Microsoft Learn docs:
  - Chris-approved LinkedIn Company Page admin requirement.
  - Organization URN readiness.
  - Marketing Developer Platform access requirement.
  - Organization social posting scope readiness with `w_organization_social_feed` plus compatibility scope notes.
  - Destination URL and no-personal-profile guardrails.
  - CLI hints: `--linkedin-account`, `--linkedin-organization-urn`, `--organization-urn`, and `--audience`.
- Deployed backend to Railway production:
  - Deployment ID: `3c1e462d-e990-4107-9095-f5a54ae42345`
  - Status: `SUCCESS`
- Backend tests now pass 43/43.
- `npm run smoke:fsm-live` passed and now asserts the LinkedIn Company Page readiness draft shape in production.

## 2026-05-22 08:52 EDT
- Added Forkliftaction Forum guarded account/rules readiness fields based on Forkliftaction forum, profile, advertising, and machine listing pages:
  - Chris-approved Forkliftaction member account requirement.
  - Forum profile and rules-of-conduct review requirement.
  - Forum category and commercial intent review.
  - Guardrail to use Machine Listing, Business Listing, or paid advertising when the goal is commercial equipment promotion.
  - CLI hints: `--forkliftaction-account`, `--forum-category-hint`, `--preferred-commercial-path`, and `--rules-url`.
- Deployed backend to Railway production:
  - Deployment ID: `ebf68f0d-3594-4fbe-8aac-68a6f4edcea2`
  - Status: `SUCCESS`
- Backend tests now pass 44/44.
- `npm run smoke:fsm-live` passed and now asserts the Forkliftaction Forum account/rules readiness draft shape in production.

## 2026-05-22 09:16 EDT
- Added EquipFinder guarded vendor/site readiness fields:
  - Chris-approved EquipFinder vendor/contact requirement.
  - Posting-path verification before any listing workflow.
  - Public-site reachability review because unauthenticated checks returned HTTP 403.
  - Seller-listing fit, category acceptance, and no-API/self-serve-assumption guardrails.
  - CLI hints: `--equipfinder-account`, `--equipfinder-listing-path`, `--vendor-account`, and `--public-access-status`.
- Deployed backend to Railway production:
  - Deployment ID: `398620b4-038b-490f-be8d-d8ef760e8116`
  - Status: `SUCCESS`
- Backend tests now pass 45/45.
- `npm run smoke:fsm-live` passed and now asserts the EquipFinder vendor/site readiness draft shape in production.

## 2026-05-22 09:35 EDT
- Added MachineryATS guarded vendor/DNS readiness fields:
  - Chris-approved MachineryATS vendor/contact requirement.
  - DNS/site reachability verification because `www.machineryats.com` did not resolve from the verification environment.
  - Current portal URL, listing method, paid package/contact owner, and forklift category-fit verification.
  - Guardrail against assuming an active public posting flow or API.
  - CLI hints: `--machineryats-account`, `--machineryats-listing-path`, `--vendor-account`, and `--public-access-status`.
- Deployed backend to Railway production:
  - Deployment ID: `7ac74783-3c36-45e7-9fb6-c5167254bf4a`
  - Status: `SUCCESS`
- Backend tests now pass 46/46.
- `npm run smoke:fsm-live` passed and now asserts the MachineryATS vendor/DNS readiness draft shape in production.

## 2026-05-22 09:54 EDT
- Added YouTube guarded video/upload readiness fields based on official YouTube Data API upload docs:
  - Chris-approved YouTube channel manager and channel ID readiness.
  - Video asset requirement with accepted MIME types, max file-size reminder, and buyer-safe walkaround checklist.
  - OAuth readiness for `https://www.googleapis.com/auth/youtube.upload`.
  - Metadata, category, privacy status, made-for-kids, quota, and API audit/private-upload guardrails.
  - CLI hints: `--youtube-account`, `--youtube-channel-id`, `--video-asset-url`, `--video-title`, `--video-tags`, `--youtube-category-id`, `--privacy-status`, and `--self-declared-made-for-kids`.
- Deployed backend to Railway production:
  - Deployment ID: `431ed673-46a5-4a9b-a534-f63ecedb5f95`
  - Status: `SUCCESS`
- Backend tests now pass 47/47.
- `npm run smoke:fsm-live` passed and now asserts the YouTube video/upload readiness draft shape in production.

## 2026-05-22 13:10 EDT
- Corrected the admin Settings Publish Button fallback channel map so it matches the live backend platform catalog when `/api/publish/platforms` is unavailable.
  - Updated manual statuses to `manual_required`.
  - Aligned completion percentages and next steps for Facebook Marketplace, MachineryTrader, EquipFinder, MachineryATS, eBay Business, LinkedIn, Google Business Profile, Forkliftaction Forum, and YouTube.
- Deployed admin frontend to Vercel production:
  - Deployment: `https://frontend-mw6p7cwcy-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://frontend-one-tawny-63.vercel.app`
- `npm --prefix frontend run build` passed.
- `npm run smoke:fsm-live` passed after the admin deployment.

## 2026-05-22 13:14 EDT
- Strengthened the admin deployment smoke so it now verifies current Publish Button fallback channel markers in the live production bundle.
  - Checks `manual_required`.
  - Checks current fallback copy for EquipFinder, MachineryATS, Forkliftaction Forum, and YouTube.
- `npm --prefix frontend run smoke:admin-deploy` passed.
- `npm run smoke:fsm-live` passed with the stronger admin bundle assertion.

## 2026-05-22 13:16 EDT
- Added a repo-root Forklift Sales Machine PR readiness receipt:
  - Command: `npm run check:fsm-pr-readiness`.
  - Checks git cleanliness, local/upstream head match, PR #20 draft/merge/review state, backend `/health`, admin UI verification gate, and external publish approval gate.
  - Default mode exits 0 so heartbeats can report the receipt without breaking on known human/credential gates; `--strict` exits nonzero until everything is ready.
- The receipt currently confirms backend health and PR mergeability, while correctly blocking ready/merge on draft PR state, missing review decision, missing approved admin UI session, and missing Chris-approved external publishing target/account.

## 2026-05-22 13:35 EDT
- Added Forklift Sales Machine GitHub PR checks:
  - Backend tests via `npm ci` + `npm test` in `backend`.
  - Admin frontend build via `npm ci` + `npm run build` in `frontend`.
  - Storefront build via `npm ci` + `npm run build` in `materialsolutionsnj`.
- This closes the PR readiness gap where PR #20 had no GitHub status checks despite local verification being green.
- First CI run exposed two source-of-truth issues and both were fixed:
  - Backend test glob now uses a bash-portable one-level pattern.
  - Admin frontend lockfile now includes Tailwind's optional `yaml@2.9.0` peer entry so `npm ci` can run cleanly.
- PR #20 checks passed after the workflow fixes:
  - Backend tests.
  - Admin frontend build.
  - Storefront build.

## 2026-05-22 13:55 EDT
- Hardened the repo-root PR readiness receipt so GitHub checks are part of the ready/merge calculation:
  - Missing checks now block readiness.
  - Pending, queued, in-progress, skipped, failed, cancelled, or unknown checks now block readiness.
  - Only `SUCCESS` checks are treated as passing for the readiness receipt.
- Verified the hardened receipt blocks while fresh checks are queued and clears the check blockers after all three PR checks pass.

## 2026-05-22 14:15 EDT
- Expanded the repo-root PR readiness receipt to include live deploy health beyond backend `/health`:
  - Admin deployment shell must return HTTP 200 and the React root marker.
  - Storefront inventory bridge must return HTTP 200, `degraded:false`, and at least one inventory item.
- This makes admin/storefront production drift block readiness instead of only being mentioned in separate smoke notes.
- Updated the Forklift Sales Machine PR checks workflow from `actions/checkout@v4` / `actions/setup-node@v4` to current `v6` releases after GitHub reported Node 20 action-runtime deprecation warnings.

## 2026-05-22 14:35 EDT
- Expanded the repo-root PR readiness receipt to verify public storefront write-path protection:
  - Fetches one live storefront inventory id.
  - Sends an unauthenticated dry-run Publish Button POST to the storefront bridge.
  - Requires HTTP 403 so public storefront requests cannot mutate or proxy publish actions.

## 2026-05-22 14:55 EDT
- Hardened the repo-root PR readiness receipt to require the exact expected GitHub checks:
  - `Backend tests`
  - `Admin frontend build`
  - `Storefront build`
- This prevents PR readiness from staying green if the workflow is partially removed, renamed, skipped, or otherwise stops reporting one of the required coverage gates.

## 2026-05-22 15:15 EDT
- Expanded the repo-root PR readiness receipt to verify the live admin deployment bundle markers directly:
  - Reads `/asset-manifest.json` from the admin alias.
  - Fetches deployed JavaScript bundles.
  - Requires Publish Button Test Mode markers, production backend URL, and current fallback channel markers.
- This moves the admin deployment smoke's most important bundle checks into the merge/completion readiness receipt.

## 2026-05-22 15:35 EDT
- Expanded the repo-root PR readiness receipt to verify backend Publish Button auth protection:
  - Calls `/api/publish/platforms` without credentials.
  - Requires HTTP 401 so the backend platform catalog is not public.
  - Authenticated 11-channel catalog/dry-run coverage remains in `npm run smoke:fsm-live`.

## 2026-05-22 15:55 EDT
- Updated PR #20 body so review starts from the current verified state instead of stale deployment/test/channel counts.
- Expanded the repo-root PR readiness receipt to catch future PR body drift:
  - Requires current deployment, test-count, 11-channel, backend auth, storefront auth, remaining-gates, and Chris-approval markers.
  - Prints `PR body markers: OK` when the PR description matches the current completion receipt.

## 2026-05-22 16:00 EDT
- Added machine-readable readiness output:
  - `npm --silent run check:fsm-pr-readiness:json` emits the same source, deploy, PR, admin, storefront, blocker, and approval state as parseable JSON.
  - Future heartbeats can parse exact blockers instead of relying on vague status prose.
- Expanded the JSON receipt with `nextAction` and classified blocker groups:
  - `agent_action_required` for source/deploy/agent-fixable gates.
  - `wait_for_ci` for pending GitHub checks.
  - `needs_human_input` when only review/session/approval gates remain.

## 2026-05-22 16:10 EDT
- Added `npm run smoke:admin-session` as the executable admin UI/session gate:
  - Verifies the live admin shell.
  - Verifies authenticated admin identity through `/api/auth/me`.
  - Verifies Dashboard Publish Button metrics through `/api/dashboard/kpis`.
  - Verifies Settings Publish Button channel catalog through `/api/publish/platforms`.
  - Verifies Inventory Publish Button payload preview through `/api/publish/:inventoryId/payload`.
- The command accepts approved auth through `FSM_ADMIN_ACCESS_TOKEN`, `FSM_BACKEND_TOKEN`, `FSM_SERVICE_JWT`, or `FSM_ADMIN_EMAIL` plus `FSM_ADMIN_PASSWORD`; it prints no secrets.
- Current local run correctly stops at the missing-auth gate because no approved admin credential/session env is present.
- Updated PR #20 body to list `npm run smoke:admin-session` as the protected admin verification gate.
- Added `npm run smoke:admin-session` to the PR-body freshness markers so the readiness receipt catches stale PR descriptions if that gate disappears from review context.
