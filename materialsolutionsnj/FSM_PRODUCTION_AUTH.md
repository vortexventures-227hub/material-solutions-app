# Forklift Sales Machine Production Auth

The MaterialSolutionsNJ.com storefront reads live inventory from the Forklift
Sales Machine backend. Production Vercel currently has legacy variables:

- `FSM_API_BASE`
- `FSM_SERVICE_JWT`

The legacy token is stale if `npm run smoke:fsm-bridge` reports `Invalid token`.
Set the rotated login credentials in the `materialsolutionsnj` Vercel project:

```sh
vercel env add FSM_BACKEND_EMAIL production
vercel env add FSM_BACKEND_PASSWORD production
```

Then redeploy the storefront:

```sh
vercel deploy --prod
```

Local verification without committing secrets:

```sh
vercel env pull .env.vercel.production.local --environment=production --yes
set -a; . ./.env.vercel.production.local; set +a; npm run smoke:fsm-bridge
```

The bridge prefers `FSM_BACKEND_EMAIL` plus `FSM_BACKEND_PASSWORD` over
`FSM_SERVICE_JWT`, so a stale durable token will not override fresh login auth.
