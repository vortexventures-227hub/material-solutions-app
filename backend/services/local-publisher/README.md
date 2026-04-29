# Local Publisher Bridge

Craigslist is browser-only from this app's point of view. The deployed backend
must not try to drive a local Brave session, so this bridge is intentionally a
local runner: it consumes the read-only publish payload and returns a receipt
describing the Craigslist draft that a local operator or future guarded browser
adapter can use.

The current bridge is dry-run only. It performs no browser automation, no
network posting, and no submit action.

## Flow

1. Cloud/backend route prepares the payload:

   ```sh
   curl http://localhost:5001/api/publish/<inventoryId>/payload > payload.json
   ```

2. Local machine turns that payload into a Craigslist receipt:

   ```sh
   node backend/scripts/run-local-publisher.js \
     --input payload.json \
     --platform craigslist \
     --region southjersey \
     --dry-run
   ```

3. The JSON receipt contains:

   - `status: "dry_run_ready"`
   - `browser.mutationPerformed: false`
   - `draft.fields` with title, price, body, phone, and media URLs
   - `draft.target` with the Craigslist region/category target

## Live Posting Guard

`--live` is accepted only to prove the guard works. It exits with
`LIVE_BROWSER_MUTATION_DISABLED` until a separate local-only browser adapter is
added with explicit human review gates.
