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
- Backend tests are green: `npm test -- --runInBand` in `backend` passes 39/39.
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
