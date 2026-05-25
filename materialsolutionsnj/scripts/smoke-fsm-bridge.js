const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const backendUrl = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `${path} failed with ${response.status}`);
  }
  return body;
}

async function main() {
  const serviceToken = process.env.FSM_BACKEND_TOKEN || process.env.FSM_SERVICE_JWT;
  const email = process.env.FSM_BACKEND_EMAIL;
  const password = process.env.FSM_BACKEND_PASSWORD;
  let token = null;
  let authSource = 'login';

  if (email && password) {
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!login?.accessToken) {
      throw new Error('FSM login did not return an access token');
    }
    token = login.accessToken;
  } else {
    token = serviceToken;
    authSource = 'service token';
    if (!token) {
      throw new Error('FSM service auth is required: set FSM_SERVICE_JWT/FSM_BACKEND_TOKEN or FSM_BACKEND_EMAIL plus FSM_BACKEND_PASSWORD');
    }
  }

  const auth = { Authorization: `Bearer ${token}` };
  const inventory = await request('/api/inventory?status=listed&limit=1', { headers: auth });
  const rows = Array.isArray(inventory?.data) ? inventory.data : Array.isArray(inventory) ? inventory : [];
  if (!rows.length) {
    throw new Error('FSM returned no listed inventory for storefront smoke check');
  }

  const unit = rows[0];
  const payload = await request(`/api/publish/${encodeURIComponent(unit.id)}/payload`, { headers: auth });
  const readiness = payload?.requiredFields || {};
  const missing = Object.entries(readiness)
    .filter(([, ready]) => !ready)
    .map(([field]) => field);

  console.log('Forklift Sales Machine storefront smoke check');
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Auth: OK (${authSource})`);
  console.log(`Inventory: OK (${rows.length} listed unit checked)`);
  console.log(`Unit: ${[unit.year, unit.make, unit.model].filter(Boolean).join(' ') || unit.id}`);
  console.log(`Publish payload: ${payload?.complete ? 'complete' : 'review_needed'}`);
  if (missing.length) console.log(`Missing readiness fields: ${missing.join(', ')}`);
}

main().catch((error) => {
  console.error(`Smoke check failed: ${error.message}`);
  process.exit(1);
});
