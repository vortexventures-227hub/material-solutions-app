const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');

const db = require('../db');
const dashboardRouter = require('../routes/dashboard');
const analyticsRouter = require('../routes/analytics');

function buildApp(queryImpl) {
  const app = express();
  app.use(express.json());
  db.query = queryImpl;
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message, code: err.code });
  });
  return app;
}

async function withServer(app, fn) {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  try {
    return await fn(server);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function request(server, path) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request(
      { hostname: '127.0.0.1', port: addr.port, path, method: 'GET' },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let parsed = null;
          try { parsed = raw ? JSON.parse(raw) : null; } catch (_err) {}
          resolve({ status: res.statusCode, body: parsed, raw });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function schemaError(message, code = '42703') {
  const err = new Error(message);
  err.code = code;
  return err;
}

test('dashboard KPIs do not require inventory.updated_at', async () => {
  const app = buildApp(async (sql) => {
    assert.doesNotMatch(sql, /updated_at/);
    if (/COUNT\(\*\) as total/.test(sql) && /FROM inventory/.test(sql)) {
      return { rows: [{ total: '1', listed: '1', sold: '0', revenue_30d: '0' }] };
    }
    if (/FROM leads/.test(sql) && /AVG\(score\)/.test(sql)) {
      return { rows: [{ total: '0', this_week: '0', hot: '0', converted: '0', avg_score: null }] };
    }
    if (/FROM inventory/.test(sql) && /LIMIT 3/.test(sql)) {
      return { rows: [{ id: 'unit-1', make: 'Toyota', model: '8FBE15U', year: 2019, listing_price: 24500, status: 'listed', created_at: '2026-04-27T00:00:00Z' }] };
    }
    if (/FROM leads/.test(sql) && /LIMIT 3/.test(sql)) {
      return { rows: [] };
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, '/api/dashboard/kpis');
    assert.equal(res.status, 200, res.raw);
    assert.equal(res.body.inventory.total, 1);
    assert.equal(res.body.recentListings.length, 1);
  });
});

test('analytics overview degrades when optional marketplace/email tables are missing', async () => {
  const app = buildApp(async (sql) => {
    if (/COUNT\(\*\) as total FROM leads/.test(sql)) return { rows: [{ total: '0' }] };
    if (/COUNT\(\*\) as total FROM inventory/.test(sql)) return { rows: [{ total: '1' }] };
    if (/email_recipients/.test(sql)) throw schemaError('relation "email_recipients" does not exist', '42P01');
    if (/inventory_listings/.test(sql)) throw schemaError('relation "inventory_listings" does not exist', '42P01');
    if (/email_sequences/.test(sql)) throw schemaError('relation "email_sequences" does not exist', '42P01');
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, '/api/analytics/overview');
    assert.equal(res.status, 200, res.raw);
    assert.equal(res.body.kpis.totalInventory, 1);
    assert.equal(res.body.kpis.emailsSent, 0);
    assert.equal(res.body.degraded, true);
    assert.deepEqual(res.body.platformBreakdown, []);
  });
});

test('analytics inventory endpoint uses current inventory columns and degrades optional tables', async () => {
  const app = buildApp(async (sql) => {
    assert.doesNotMatch(sql, /asking_price|photos/);
    if (/FROM inventory WHERE id/.test(sql)) {
      return { rows: [{ id: 'unit-1', make: 'Toyota', model: '8FBE15U', year: 2019, listing_price: 24500, status: 'listed', images: [] }] };
    }
    if (/inventory_listings|marketplace_analytics|email_sequences/.test(sql)) {
      throw schemaError('optional relation unavailable', '42P01');
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, '/api/analytics/inventory/unit-1');
    assert.equal(res.status, 200, res.raw);
    assert.equal(res.body.unit.listing_price, 24500);
    assert.equal(res.body.degraded, true);
    assert.deepEqual(res.body.listings, []);
    assert.deepEqual(res.body.timeline, []);
  });
});
