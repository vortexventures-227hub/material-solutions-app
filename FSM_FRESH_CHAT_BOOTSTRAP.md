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
- `https://www.materialsolutionsnj.com/api/inventory?limit=1` returns HTTP 200, live FSM inventory, `degraded:false`, total 6.
- Dynamic inventory detail pages are live.
- Storefront Publish Button payload bridge is live and returns complete payloads for known inventory.
- Admin frontend was deployed to Vercel production.
  - Deployment: `https://frontend-1ykdthvna-vortexventures-227hubs-projects.vercel.app`
  - Alias: `https://frontend-one-tawny-63.vercel.app`
  - Bundle points to `https://vortex-forklift-api-production.up.railway.app`.
- Railway CLI access was granted by Chris on 2026-05-21.
- Railway target verified:
  - Project: `vortex-forklift-api`
  - Environment: `production`
  - Service: `vortex-forklift-api`
- Backend production deployment succeeded.
  - Deployment ID: `14d6c60c-75d0-499a-b3c2-536c4c50ebf1`
  - Status: `SUCCESS`
  - `/health` returns HTTP 200 with database connected.
- Authenticated read-only smoke verified:
  - `/api/publish/platforms` returns 11 Publish Button channels.
  - `/api/publish/<inventoryId>/payload` returns HTTP 200.

## Local Verification Already Passed
- Backend tests: `npm test -- --runInBand` in `backend` passed 37/37.
- Admin frontend build: `npm run build` in `frontend` passed.
- Storefront build: `npm run build` in `materialsolutionsnj` passed.
- Naming sweep found no active "Push Button" leaks in source paths checked.

## Important Local Files Changed
- `backend/routes/publish.js`
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
- `materialsolutionsnj/lib/fsmBackend.js`
- `materialsolutionsnj/pages/api/inventory.js`
- `materialsolutionsnj/pages/api/leads.js`
- `materialsolutionsnj/pages/api/publish/[inventoryId]/payload.js`
- `materialsolutionsnj/pages/api/publish/[inventoryId]/index.js`
- `materialsolutionsnj/pages/inventory/[id].js`
- `materialsolutionsnj/pages/inventory.js`
- `materialsolutionsnj/components/ContactForm.js`
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
- Manual draft infrastructure for non-API channels: 65-70%, depending on channel.

## What Is Not Complete Yet
- True automatic posting to third-party marketplaces is not complete.
- Marketplace credential/OAuth/API integrations still need per-channel work:
  - Facebook Marketplace
  - MachineryTrader
  - EquipFinder
  - MachineryATS
  - eBay Business
  - LinkedIn
  - Google Business Profile
  - Forkliftaction Forum
  - YouTube
- End-to-end write-path verification from admin UI through live backend should continue, but use caution: do read-only checks first and do not publish externally without Chris-approved test target/platform.
- Durable commit/PR state still needs cleanup so deployed code is preserved in GitHub, not only Railway/Vercel direct deploys.

## Next Highest-Impact Work
1. Preserve source state:
   - Inspect `git status --short -- . ':!frontend/build' ':!materialsolutionsnj/.next'`.
   - Commit the source changes on the current branch or open/update a PR if Chris approves.
2. Run post-deploy live smoke:
   - Backend `/health`.
   - Storefront `/api/inventory?limit=1`.
   - Authenticated read-only `/api/publish/platforms`.
   - Authenticated read-only `/api/publish/<inventoryId>/payload`.
3. Verify admin UI can login and render:
   - Dashboard Publish Button card.
   - Settings Publish Button Channels.
   - Inventory Publish Modal payload preview.
4. Decide the next marketplace target:
   - Recommended: keep MaterialSolutionsNJ automatic as the canonical green path; implement one external channel at a time behind manual/guarded mode.
5. Build a safe test-publish mode:
   - Add `dryRun`/`testMode` affordance to live admin flow if missing.
   - Ensure external platforms cannot receive accidental writes.
6. Continue channel integrations in priority order:
   - Craigslist/manual draft refresh.
   - Facebook Marketplace guarded draft.
   - eBay/OAuth feasibility.
   - Google Business Profile permissions.

## Current Operational Rule
Do not treat a progress update as a stopping point. After any update, continue the next highest-impact item unless blocked by missing credentials, destructive risk, or explicit Chris instruction.

## Closeout Receipt Requirements
Any closeout for this project should include:
- Graph checked:
- GBrain query:
- Wiki pages loaded:
- Prior work loaded:
- Decision changed by memory:

