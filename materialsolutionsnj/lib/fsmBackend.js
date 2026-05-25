let cachedAccessToken = null;
let tokenExpiresAt = 0;

function getBackendUrl() {
  return (
    process.env.FSM_BACKEND_URL ||
    process.env.FSM_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://vortex-forklift-api-production.up.railway.app'
  ).trim().replace(/\\n/g, '').replace(/\/+$/, '');
}

function hasUsableToken() {
  return cachedAccessToken && Date.now() < tokenExpiresAt - 30000;
}

async function getServiceAccessToken() {
  if (hasUsableToken()) return cachedAccessToken;

  const email = process.env.FSM_BACKEND_EMAIL;
  const password = process.env.FSM_BACKEND_PASSWORD;
  if (!email || !password) {
    return process.env.FSM_BACKEND_TOKEN || process.env.FSM_SERVICE_JWT || null;
  }

  const response = await fetch(`${getBackendUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`FSM service login failed with ${response.status}`);
  }

  const body = await response.json();
  cachedAccessToken = body.accessToken;
  tokenExpiresAt = Date.now() + 14 * 60 * 1000;
  return cachedAccessToken;
}

async function requestFsm(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.auth !== false) {
    const token = await getServiceAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(body?.error || `FSM request failed with ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function firstArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function mapInventoryForStorefront(unit) {
  const images = firstArray(unit.images);
  const year = unit.year ? String(unit.year) : '';
  const make = unit.make || 'Forklift';
  const model = unit.model || '';

  return {
    id: unit.id,
    name: [year, make, model].filter(Boolean).join(' '),
    category: unit.mast_type || unit.power_type || 'Material Handling Equipment',
    capacity: unit.capacity_lbs ? `${Number(unit.capacity_lbs).toLocaleString()} lbs` : 'Call',
    fuel: unit.power_type || 'Call',
    hours: unit.hours ? Number(unit.hours).toLocaleString() : 'Call',
    price: unit.listing_price ? `$${Number(unit.listing_price).toLocaleString()}` : 'Call for pricing',
    status: unit.status === 'listed' ? 'In Stock' : unit.status || 'Available',
    image: images[0] || 'raymond_2166.jpg',
    imageUrl: images[0] || null,
    featured: unit.status === 'listed',
    description: unit.condition_notes || `${make} ${model} available from Material Solutions NJ.`,
    raw: unit,
  };
}

async function fetchFsmInventory(query = {}) {
  const params = new URLSearchParams({
    limit: String(query.limit || 100),
    page: String(query.page || 1),
  });
  if (query.status) params.set('status', query.status);
  if (query.q) params.set('q', query.q);

  const body = await requestFsm(`/api/inventory?${params.toString()}`);
  const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];

  return {
    items: rows.map(mapInventoryForStorefront),
    total: Number(body?.total || rows.length),
    degraded: false,
  };
}

async function fetchFsmInventoryItem(inventoryId) {
  const unit = await requestFsm(`/api/inventory/${encodeURIComponent(inventoryId)}`);
  return mapInventoryForStorefront(unit);
}

async function fetchFsmPublishPayload(inventoryId) {
  return requestFsm(`/api/publish/${encodeURIComponent(inventoryId)}/payload`);
}

async function fetchFsmPublishStatus(inventoryId) {
  return requestFsm(`/api/publish/${encodeURIComponent(inventoryId)}`);
}

async function publishFsmInventory(inventoryId, input = {}) {
  return requestFsm(`/api/publish/${encodeURIComponent(inventoryId)}`, {
    method: 'POST',
    body: JSON.stringify({
      platforms: Array.isArray(input.platforms) ? input.platforms : [],
      options: input.options || {},
      dryRun: input.dryRun === true,
      testMode: input.testMode === true,
    }),
  });
}

async function createFsmLead(input) {
  const body = await requestFsm('/api/leads', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  });
  return body;
}

module.exports = {
  createFsmLead,
  fetchFsmInventoryItem,
  fetchFsmPublishPayload,
  fetchFsmPublishStatus,
  fetchFsmInventory,
  getBackendUrl,
  mapInventoryForStorefront,
  publishFsmInventory,
  requestFsm,
};
