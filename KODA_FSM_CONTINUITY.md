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
3. Publish Button readiness/review workflow.
4. Platform adapter completion and verification.
5. Replace demo/fake operator telemetry with live or explicitly degraded data.

Production verification gates:
- `npm run check:fsm-env` in `materialsolutionsnj` confirms required local env exists without printing secrets.
- `npm run smoke:fsm-bridge` in `materialsolutionsnj` logs into FSM, fetches one listed unit, and verifies read-only Publish Button payload readiness without publishing.

Current production auth finding:
- Vercel production for `materialsolutionsnj` has legacy `FSM_API_BASE` and `FSM_SERVICE_JWT`.
- `FSM_SERVICE_JWT` is currently stale: `npm run smoke:fsm-bridge` reaches the live backend but fails with `Invalid token`.
- Bridge code now supports legacy env names, normalizes escaped newlines in backend URLs, and prefers `FSM_BACKEND_EMAIL` plus `FSM_BACKEND_PASSWORD` over stale durable tokens once those are set.
