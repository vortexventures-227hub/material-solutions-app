#!/usr/bin/env node

const BACKEND_URL = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\n/g, '').replace(/\/+$/, '');

const ADMIN_URL = (
  process.env.FSM_ADMIN_URL ||
  'https://frontend-one-tawny-63.vercel.app'
).trim().replace(/\n/g, '').replace(/\/+$/, '');

async function requestJson(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `${path} failed with HTTP ${response.status}`);
  }
  return body;
}

async function fetchAdminText(path) {
  const response = await fetch(`${ADMIN_URL}${path}`);
  const body = await response.text().catch(() => '');
  if (!response.ok) {
    throw new Error(`admin ${path} failed with HTTP ${response.status}`);
  }
  return body;
}

async function getAuthToken() {
  const directToken = process.env.FSM_ADMIN_ACCESS_TOKEN || process.env.FSM_BACKEND_TOKEN || process.env.FSM_SERVICE_JWT;
  if (directToken) {
    return { token: directToken, authSource: 'bearer token' };
  }

  const email = process.env.FSM_ADMIN_EMAIL || process.env.FSM_BACKEND_EMAIL;
  const password = process.env.FSM_ADMIN_PASSWORD || process.env.FSM_BACKEND_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'admin session auth is required: set FSM_ADMIN_ACCESS_TOKEN/FSM_BACKEND_TOKEN/FSM_SERVICE_JWT or FSM_ADMIN_EMAIL plus FSM_ADMIN_PASSWORD'
    );
  }

  const login = await requestJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!login?.accessToken) {
    throw new Error('admin login did not return an access token');
  }
  return { token: login.accessToken, authSource: 'login' };
}

function assertPublishPlatforms(platforms) {
  if (!Array.isArray(platforms) || platforms.length < 11) {
    throw new Error(`expected at least 11 Publish Button channels, got ${Array.isArray(platforms) ? platforms.length : 'none'}`);
  }
  const required = ['materialsolutionsnj', 'facebook_marketplace', 'machinerytrader', 'ebay', 'linkedin'];
  const missing = required.filter((id) => !platforms.some((platform) => platform.id === id || platform.key === id));
  if (missing.length) {
    throw new Error(`Publish Button platform catalog missing ${missing.join(', ')}`);
  }
}

async function main() {
  const html = await fetchAdminText('/');
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('admin shell did not include React root');
  }

  const { token, authSource } = await getAuthToken();
  const auth = { Authorization: `Bearer ${token}` };
  const user = await requestJson('/api/auth/me', { headers: auth });
  if (user?.user?.role !== 'admin' && user?.role !== 'admin') {
    throw new Error('authenticated admin session did not resolve to an admin user');
  }

  const kpis = await requestJson('/api/dashboard/kpis', { headers: auth });
  if (!kpis?.publishing || typeof kpis.publishing.manual_required !== 'number') {
    throw new Error('dashboard KPIs did not include Publish Button publishing metrics');
  }

  const platforms = await requestJson('/api/publish/platforms', { headers: auth });
  assertPublishPlatforms(platforms?.platforms || platforms);

  const inventory = await requestJson('/api/inventory?status=listed&limit=1', { headers: auth });
  const rows = Array.isArray(inventory?.data) ? inventory.data : Array.isArray(inventory) ? inventory : [];
  if (!rows.length || !rows[0]?.id) {
    throw new Error('admin inventory endpoint returned no listed inventory for Publish Button preview');
  }

  const payload = await requestJson(`/api/publish/${encodeURIComponent(rows[0].id)}/payload`, { headers: auth });
  if (!payload?.requiredFields || payload.complete !== true) {
    throw new Error('Publish Button payload preview is not complete for the checked inventory item');
  }

  console.log('Forklift Sales Machine admin session smoke check');
  console.log(`Admin URL: ${ADMIN_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Auth: OK (${authSource})`);
  console.log('Admin shell: OK');
  console.log('Admin user: OK');
  console.log('Dashboard Publish Button metrics: OK');
  console.log('Settings Publish Button channel catalog: OK');
  console.log('Inventory Publish Button payload preview: OK');
}

main().catch((error) => {
  console.error(`Admin session smoke check failed: ${error.message}`);
  process.exit(1);
});
