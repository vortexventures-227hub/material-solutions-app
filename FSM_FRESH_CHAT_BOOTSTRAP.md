# Forklift Sales Machine Fresh Chat Bootstrap

Use this file as the first and primary bootstrap document for a fresh Codex/Koda chat.

## Chat Goal
Continue completing the Forklift Sales Machine backend/admin/storefront system for MaterialSolutionsNJ.com without losing the current plan or verified deployment state.

## How To Start The Fresh Chat
1. In Codex, choose existing folder:
   `/Users/vortexventures/Desktop/Vortex Ventures/VVAxeOps/material-solutions-app`
2. Tell Koda:
   "Read `FSM_FRESH_CHAT_BOOTSTRAP.md` first, then continue the highest-impact unfinished Forklift Sales Machine item. Do not bulk-load the repo."
3. If Koda edits anything under `/Users/vortexventures/Desktop/Vortex Ventures/`, run:
   `/Users/vortexventures/Desktop/Vortex Ventures/_shared/VVSharedKnowledge/scripts/memory_preflight.sh Koda "Forklift Sales Machine continuation"`

## Required Language
- Use "Forklift Sales Machine" and "Publish Button".
- Do not call it "Push Button" except when quoting legacy paths or old file names.

## Current Verified State
- Storefront production auth is fixed.
- Vercel storefront production is live.
  - Deployment: `https://materialsolutionsnj-l7lllls1p-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://www.materialsolutionsnj.com`
- `https://www.materialsolutionsnj.com/api/inventory?limit=1` returns HTTP 200, live FSM inventory, `degraded:false`, total 6.
- Dynamic inventory detail pages are live.
- Storefront Publish Button payload bridge is live and returns complete payloads for known inventory.
- Storefront unauthenticated Publish Button POST remains blocked with HTTP 403.
- Admin frontend was deployed to Vercel production.
  - Deployment: `https://frontend-mw6p7cwcy-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://frontend-one-tawny-63.vercel.app`
  - Bundle points to `https://vortex-forklift-api-production.up.railway.app`.
  - Bundle contains `Test Mode`, `RUN TEST`, `dryRun`, and `testMode`.
  - Settings fallback channel map is aligned with the live backend Publish Button catalog.
- Railway CLI access was granted by Chris on 2026-05-21.
- Railway target verified:
  - Project: `vortex-forklift-api`
  - Environment: `production`
  - Service: `vortex-forklift-api`
- Backend production deployment succeeded.
  - Deployment ID: `431ed673-46a5-4a9b-a534-f63ecedb5f95`
  - Status: `SUCCESS`
  - `/health` returns HTTP 200 with database connected.
- Backend includes the Publish Button `dryRun`/`testMode` guard.
- Authenticated read-only smoke verified:
  - `/api/publish/platforms` returns 11 Publish Button channels.
  - `/api/publish/<inventoryId>/payload` returns HTTP 200.
- Authenticated full-channel dry-run smoke verified:
  - `materialsolutionsnj` returns `dry_run_ready`.
  - Craigslist, Facebook Marketplace, MachineryTrader, EquipFinder, MachineryATS, eBay Business, LinkedIn, Google Business Profile, Forkliftaction Forum, and YouTube return `manual_required`.
  - `mutationPerformed:false` for checked channels.
  - Manual draft targets include `submitDisabled:true` and Chris-approval guardrails.
  - Facebook Marketplace dry-run includes account/page approval, category-fit, location, availability, condition, and seller-disclosure draft fields.
  - MachineryTrader dry-run includes dealer/advertiser approval, Sandhills Dealer Portal/feed readiness, listing package, billing/contact, forklift category, and inventory sync guardrails.
  - EquipFinder dry-run includes vendor/contact approval, posting-path verification, public-site reachability review, seller-listing fit, category, and no-API/self-serve-assumption guardrails.
  - MachineryATS dry-run includes vendor/contact approval, DNS/site verification, current portal/listing-method verification, category fit, and no-active-domain/API-assumption guardrails.
  - eBay Business dry-run includes OAuth readiness, seller account approval, business policy, category, condition, and fulfillment draft fields.
  - LinkedIn dry-run includes Company Page admin approval, organization URN, Marketing Developer Platform access, organization social posting scope readiness, and no-personal-profile guardrails.
  - Forkliftaction Forum dry-run includes member account approval, forum profile/rules review, category selection, commercial intent review, and Machine Listing/Business Listing/advertising path guardrails.
  - Google Business Profile dry-run includes owner/manager approval, `business.manage` OAuth readiness, accountId/locationId, Local Post, CTA, and no-Product-Posts API guardrails.
  - YouTube dry-run includes channel manager approval, OAuth upload scope, video asset readiness, metadata, privacy, made-for-kids, quota, and API audit/private-upload guardrails.
- Draft PR is open:
  - `https://github.com/vortexventures-227hub/material-solutions-app/pull/20`
  - Branch: `codex/fsm-inventory-intake-media-20260429`

## Local Verification Already Passed
- Backend tests: `npm test -- --runInBand` in `backend` passed 47/47.
- Admin frontend build: `npm run build` in `frontend` passed.
- Admin deploy smoke: `npm run smoke:admin-deploy` in `frontend` passed against `https://frontend-one-tawny-63.vercel.app` and now asserts current Publish Button fallback channel markers.
- Storefront build: `npm run build` in `materialsolutionsnj` passed.
- Storefront live dry-run smoke: `npm run smoke:fsm-dry-run` in `materialsolutionsnj` passed for 11 channels when run with production FSM auth env.
- Aggregate live smoke: `npm run smoke:fsm-live` at repo root passed backend health, admin deploy bundle, 11-channel Publish Button dry-run checks, Facebook Marketplace-specific draft assertions, MachineryTrader vendor credential assertions, EquipFinder vendor/site readiness assertions, MachineryATS vendor/DNS readiness assertions, eBay OAuth/business-policy readiness assertions, LinkedIn Company Page readiness assertions, Forkliftaction Forum account/rules readiness assertions, Google Business Profile permission readiness assertions, and YouTube video/upload readiness assertions.
- PR readiness receipt: `npm run check:fsm-pr-readiness` at repo root checks source cleanliness, PR #20 draft/merge/review/check state, backend health, admin deployment shell reachability, admin Publish Button bundle/fallback markers, storefront inventory bridge health, storefront unauthenticated Publish Button POST protection, and the remaining admin UI/external publish approval gates without printing secrets.
- The readiness receipt requires the named PR checks `Backend tests`, `Admin frontend build`, and `Storefront build`; missing required checks block readiness even if other checks are green.
- GitHub PR checks are now configured and passing in `.github/workflows/fsm-pr-checks.yml` for backend tests, admin frontend build, and storefront build on pull requests.
- Naming sweep found no active "Push Button" leaks in source paths checked.

## Important Local Files Changed
- `backend/routes/publish.js`
- `backend/services/local-publisher/craigslistBridge.js`
- `backend/services/local-publisher/manualDraft.js`
- `backend/routes/dashboard.js`
- `backend/routes/analytics.js`
- `backend/routes/marketplace.js`
- `backend/server.js`
- `backend/scripts/run-local-publisher.js`
- `frontend/src/components/PublishModal.js`
- `frontend/src/components/PublishResults.js`
- `frontend/src/pages/Dashboard.js`
- `frontend/src/pages/Settings.js`
- `frontend/src/pages/Analytics.js`
- `frontend/src/pages/Pipeline.js`
- `frontend/scripts/smoke-admin-deploy.js`
- `materialsolutionsnj/lib/fsmBackend.js`
- `materialsolutionsnj/pages/api/inventory.js`
- `materialsolutionsnj/pages/api/leads.js`
- `materialsolutionsnj/pages/api/publish/[inventoryId]/payload.js`
- `materialsolutionsnj/pages/api/publish/[inventoryId]/index.js`
- `materialsolutionsnj/pages/inventory/[id].js`
- `materialsolutionsnj/pages/inventory.js`
- `materialsolutionsnj/components/ContactForm.js`
- `materialsolutionsnj/scripts/smoke-fsm-dry-run.js`
- `scripts/smoke-fsm-live.js`
- `scripts/check-fsm-pr-readiness.js`
- `.github/workflows/fsm-pr-checks.yml`
- `.railwayignore`
- `Forklift_Sales_Machine_NOTES.md`
- `KODA_FSM_CONTINUITY.md`
- `FSM_PRODUCTION_AUTH.md`

## What Is Fully Green
- Storefront live FSM inventory bridge: 100%.
- Storefront listing detail pages: 95%.
- Storefront read-only Publish Button payload bridge: 100%.
- Backend Publish Button platform catalog route: 100%.
- Backend read-only payload route: 100%.
- Backend deployment to Railway production: 100%.
- Admin frontend deployment to Vercel production: 100%.
- Publish Button guarded test mode: 100%.
- Durable draft PR/source preservation: 100%.
- Manual draft infrastructure for non-API channels: 65-75%, depending on channel.
- Guarded manual draft coverage now includes Facebook Marketplace, MachineryTrader, EquipFinder, MachineryATS, eBay Business, LinkedIn, Google Business Profile, Forkliftaction Forum, and YouTube via local publisher receipts with no-submit guardrails.
- Facebook Marketplace guarded draft now has platform-specific account/page approval, category-fit, location, availability, condition, and seller-disclosure fields.
- MachineryTrader guarded draft now has dealer/advertiser approval, Sandhills Dealer Portal/feed readiness, listing package, billing/contact, forklift category, and inventory sync fields.
- EquipFinder guarded draft now has vendor/contact approval, posting-path verification, public-site reachability review, seller-listing fit, category, and no-API/self-serve-assumption guardrails.
- MachineryATS guarded draft now has vendor/contact approval, DNS/site verification, current portal/listing-method verification, forklift category fit, and no-active-domain/API-assumption guardrails.
- eBay Business guarded draft now has seller account approval, OAuth readiness, required scope, category, business policy, condition, and fulfillment fields.
- LinkedIn guarded draft now has Company Page admin approval, organization URN, Marketing Developer Platform access, organization social posting scope readiness, destination URL, and no-personal-profile guardrails.
- Forkliftaction Forum guarded draft now has member account approval, forum profile/rules review, category selection, commercial intent review, and Machine Listing/Business Listing/advertising path guardrails.
- Google Business Profile guarded draft now has owner/manager approval, `business.manage` OAuth readiness, accountId/locationId, Local Post, CTA, language, media, and Product Posts unsupported guardrail fields.
- YouTube guarded draft now has channel manager approval, OAuth upload scope, video asset readiness, metadata, privacy status, made-for-kids, quota, and API audit/private-upload guardrails.

## What Is Not Complete Yet
- True automatic posting to third-party marketplaces is not complete.
- Marketplace credential/OAuth/API integrations still need per-channel work:
  - Facebook Marketplace
  - MachineryTrader
  - eBay Business
  - LinkedIn
  - Google Business Profile
  - Forkliftaction Forum
- End-to-end write-path verification from admin UI through live backend should continue, but use caution: do read-only checks first and do not publish externally without Chris-approved test target/platform.
- Full admin UI login/render verification is blocked until Chris provides an approved admin credential or an authenticated browser session.
- Draft PR #20 still needs review/approval before marking ready or merging.

## Next Highest-Impact Work
1. Keep source/PR state current:
   - Inspect `git status --short -- . ':!frontend/build' ':!materialsolutionsnj/.next'`.
   - Commit/push any safe verification or continuity improvements to PR #20.
   - Watch PR #20 for the Forklift Sales Machine PR Checks workflow after pushes.
2. Keep post-deploy live smoke green:
   - Preferred one-command gate: `npm run smoke:fsm-live` at repo root.
   - Manual fallback: backend `/health`, admin `npm run smoke:admin-deploy`, and authenticated `npm run smoke:fsm-dry-run` with production FSM auth env.
3. Keep merge/completion readiness explicit:
   - Run `npm run check:fsm-pr-readiness` at repo root.
   - It should stay green for source/deploy health and continue to report true blockers instead of vague "blocked" status.
4. Verify admin UI can login and render:
   - Dashboard Publish Button card.
   - Settings Publish Button Channels.
   - Inventory Publish Modal payload preview.
   - Requires approved admin credential/session.
5. Decide the next marketplace target:
   - Recommended: keep MaterialSolutionsNJ automatic as the canonical green path; implement one external channel at a time behind manual/guarded mode.
6. Continue external channel work only after Chris approves a real target account/platform. Current safe manual readiness coverage is complete for the listed 11 Publish Button channels.

## Current Operational Rule
Do not treat a progress update as a stopping point. After any update, continue the next highest-impact item unless blocked by missing credentials, destructive risk, or explicit Chris instruction.

## Closeout Receipt Requirements
Any closeout for this project should include:
- Graph checked:
- GBrain query:
- Wiki pages loaded:
- Prior work loaded:
- Decision changed by memory:
