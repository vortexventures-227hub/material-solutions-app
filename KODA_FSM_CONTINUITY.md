# Koda Forklift Sales Machine Continuity

Purpose: keep each wake moving instead of ending after status.

Current protocol:
- Use commentary for progress updates while work is ongoing.
- Do not use a final response as a normal checkpoint.
- Do not send a final response while the app is incomplete; a final response ends the active run.
- After each meaningful update, immediately continue to the next highest-impact item unless blocked or the wake ends.
- Before edits under Vortex Ventures, run shared-memory preflight.
- Keep public storefront publish execution guarded; preview/status may be public, POST publish requires server-side authorization.

Current workstream:
1. Storefront-FSM bridge: inventory, leads, publish payload/status.
2. MaterialSolutionsNJ listing detail pages for published inventory.
3. Publish Button readiness/review workflow with live `dryRun`/`testMode` guard.
4. Platform adapter completion and verification.
5. Replace demo/fake operator telemetry with live or explicitly degraded data.

Production verification gates:
- `npm run check:fsm-pr-readiness` at the repo root is the merge/completion receipt. It checks source cleanliness, PR #20 draft/merge/review/check state, PR body current-state markers, backend health, backend unauthenticated Publish Button catalog protection, admin deployment shell reachability, admin Publish Button bundle/fallback markers, storefront inventory bridge health, storefront unauthenticated Publish Button POST protection, and the known admin UI/external publish approval gates without printing secrets. Use it on each wake before saying the work is merely blocked.
- `npm --silent run check:fsm-pr-readiness:json` emits the same readiness receipt as structured JSON, including `nextAction` and classified blocker groups, so heartbeat wakes can parse whether to keep working, wait for CI, or notify Chris.
- `.github/workflows/fsm-pr-checks.yml` gives PR #20 GitHub status checks for backend tests, admin frontend build, and storefront build. Watch them after each push because the readiness receipt now blocks on missing, pending, failed, cancelled, skipped, or unknown checks.
- Required named checks for readiness are `Backend tests`, `Admin frontend build`, and `Storefront build`; if one disappears from PR metadata, readiness is blocked even if the remaining checks are green.
- `npm run smoke:fsm-live` at the repo root is the preferred one-command live gate. It checks backend `/health`, runs the admin deployment smoke, pulls production storefront env into a temp file, runs the full 11-channel Publish Button dry-run smoke, and asserts Facebook Marketplace, MachineryTrader, EquipFinder, MachineryATS, eBay, LinkedIn, Forkliftaction Forum, Google Business Profile, and YouTube-specific guarded draft fields.
- `npm run smoke:admin-deploy` in `frontend` verifies the live admin app shell, deployed Publish Button Test Mode bundle markers, and current Publish Button fallback channel markers without requiring login.
- `npm run check:fsm-env` in `materialsolutionsnj` confirms required local env exists without printing secrets.
- `npm run smoke:fsm-bridge` in `materialsolutionsnj` logs into FSM, fetches one listed unit, and verifies read-only Publish Button payload readiness without publishing.

Current production auth finding:
- Production backend deployment `431ed673-46a5-4a9b-a534-f63ecedb5f95` is live on Railway and includes the Publish Button `dryRun`/`testMode` guard, Craigslist local-draft guardrails, Facebook Marketplace-specific guarded draft fields, MachineryTrader vendor credential readiness fields, EquipFinder vendor/site readiness fields, MachineryATS vendor/DNS readiness fields, eBay OAuth/business-policy readiness fields, LinkedIn Company Page readiness fields, Forkliftaction Forum account/rules readiness fields, Google Business Profile permission readiness fields, YouTube video/upload readiness fields, and expanded guarded manual draft channels.
- Production admin deployment `frontend-mw6p7cwcy-vortexventures-227hubs-projects.vercel.app` is aliased at `https://frontend-one-tawny-63.vercel.app` and includes `Test Mode` / `RUN TEST` UI plus the current Publish Button channel fallback map.
- Production storefront deployment `materialsolutionsnj-l7lllls1p-vortexventures-227hubs-projects.vercel.app` is aliased at `https://www.materialsolutionsnj.com`.
- Authenticated live backend dry-run smoke verifies all 11 Publish Button channels: `materialsolutionsnj` is `dry_run_ready`; Craigslist plus the 9 other manual channels are `manual_required`, `mutationPerformed:false`, `submitDisabled:true`, and include Chris-approval guardrails. Facebook Marketplace additionally carries account/page approval, category-fit, location, availability, condition, and seller-disclosure fields. MachineryTrader additionally carries dealer/advertiser approval, Sandhills Dealer Portal/feed readiness, listing package, billing/contact, forklift category, and inventory sync guardrails. EquipFinder additionally carries vendor/contact approval, posting-path verification, public-site reachability review, seller-listing fit, category, and no-API/self-serve-assumption guardrails. MachineryATS additionally carries vendor/contact approval, DNS/site verification, current portal/listing-method verification, category fit, and no-active-domain/API-assumption guardrails. eBay additionally carries seller account approval, OAuth readiness, required scopes, category, business policy, condition, and fulfillment fields. LinkedIn additionally carries Company Page admin approval, organization URN, Marketing Developer Platform access, organization social posting scope readiness, and no-personal-profile guardrails. Forkliftaction Forum additionally carries member account approval, forum profile/rules review, category selection, commercial intent review, and Machine Listing/Business Listing/advertising path guardrails. Google Business Profile additionally carries owner/manager approval, `business.manage` OAuth readiness, accountId/locationId, Local Post, CTA, and no-Product-Posts API guardrails. YouTube additionally carries channel manager approval, OAuth upload scope, video asset readiness, metadata, privacy, made-for-kids, quota, and API audit/private-upload guardrails.
- Full admin UI login/render verification remains blocked until an approved admin credential or authenticated browser session is available.
