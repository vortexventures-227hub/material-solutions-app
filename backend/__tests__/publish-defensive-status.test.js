const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');

const db = require('../db');
const publishRouter = require('../routes/publish');

function buildApp(queryImpl) {
  const app = express();
  app.use(express.json());
  db.query = queryImpl;
  app.use('/api/publish', publishRouter);
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

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body === undefined ? '' : JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
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
    req.end(payload);
  });
}

test('publish POST rejects malformed inventory id before DB access', async () => {
  let dbCalls = 0;
  const app = buildApp(async () => {
    dbCalls += 1;
    throw new Error('DB should not be called for malformed IDs');
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/__fake_noop_123__', {
      platforms: [],
      tiers: [],
      skipEmail: true,
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid inventory id');
    assert.equal(dbCalls, 0);
  });
});

test('publish POST returns 404 for valid missing UUID before SEO/listing side effects', async () => {
  const calls = [];
  const app = buildApp(async (sql) => {
    calls.push(sql);
    if (/SELECT \* FROM inventory WHERE id/.test(sql)) return { rows: [] };
    throw new Error('Unexpected side-effect query after missing inventory lookup');
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/00000000-0000-4000-8000-000000000000', {
      platforms: [],
      tiers: [],
      skipEmail: true,
    });

    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Inventory not found');
    assert.equal(calls.length, 1);
  });
});

test('publish POST with empty platforms is a no-op after inventory lookup', async () => {
  const calls = [];
  const app = buildApp(async (sql) => {
    calls.push(sql);
    if (/SELECT \* FROM inventory WHERE id/.test(sql)) {
      return {
        rows: [{
          id: 'ddeb41d4-5261-4851-9324-e2f09ea8f807',
          year: 2018,
          make: 'Toyota',
          model: '8FGCU25',
          photos: [],
          status: 'listed',
        }],
      };
    }
    throw new Error(`No optional Phase 6C tables should be accessed for empty platforms array: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807', {
      platforms: [],
      options: {},
      skipEmail: true,
    });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.results, []);
    assert.equal(calls.length, 1);
    assert.equal(calls.filter((sql) => /inventory_listings|inventory_seo|marketplace_analytics/.test(sql)).length, 0);
  });
});

test('publish POST falls back to migration 006 SEO columns when legacy SEO columns drift', async () => {
  const calls = [];
  const valuesBySql = [];
  const app = buildApp(async (sql, values = []) => {
    calls.push(sql);
    valuesBySql.push({ sql, values });
    if (/SELECT \* FROM inventory WHERE id/.test(sql)) {
      return {
        rows: [{
          id: 'ddeb41d4-5261-4851-9324-e2f09ea8f807',
          year: 2018,
          make: 'Toyota',
          model: '8FGCU25',
          photos: ['https://cdn.example.com/forklift.jpg'],
          status: 'listed',
        }],
      };
    }
    if (/INSERT INTO inventory_seo/.test(sql) && /\btitle\b/.test(sql)) {
      const err = new Error('column "title" does not exist');
      err.code = '42703';
      throw err;
    }
    if (/INSERT INTO inventory_seo/.test(sql) && /\bmeta_title\b/.test(sql)) return { rows: [] };
    if (/UPDATE inventory SET status/.test(sql)) return { rows: [] };
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807', {
      platforms: ['unknown_platform'],
      options: {},
      skipEmail: true,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.results[0].status, 'error');
    assert.equal(res.body.results[0].error, 'Unknown platform');
    const migrationSeoCall = valuesBySql.find(({ sql }) => (
      /INSERT INTO inventory_seo/.test(sql)
      && /\bmeta_title\b/.test(sql)
      && /\bog_image_url\b/.test(sql)
      && /\bslug\b/.test(sql)
      && /\bcanonical_url\b/.test(sql)
    ));
    assert.ok(migrationSeoCall, 'migration-006 SEO fallback should preserve image, slug, and canonical fields when additive columns exist');
    assert.ok(migrationSeoCall.values.includes('https://cdn.example.com/forklift.jpg'));
    assert.ok(migrationSeoCall.values.includes('2018-toyota-8fgcu25-ddeb41d4'));
    assert.ok(migrationSeoCall.values.includes('https://app.materialsolutionsnj.com/inventory/ddeb41d4-5261-4851-9324-e2f09ea8f807'));
    assert.equal(calls.filter((sql) => /INSERT INTO inventory_listings/.test(sql)).length, 0);
  });
});

test('publish POST reports platform listing schema drift without crashing or calling external publisher', async () => {
  const calls = [];
  const app = buildApp(async (sql) => {
    calls.push(sql);
    if (/SELECT \* FROM inventory WHERE id/.test(sql)) {
      return {
        rows: [{
          id: 'ddeb41d4-5261-4851-9324-e2f09ea8f807',
          year: 2018,
          make: 'Toyota',
          model: '8FGCU25',
          photos: [],
          status: 'listed',
        }],
      };
    }
    if (/INSERT INTO inventory_seo/.test(sql)) return { rows: [] };
    if (/UPDATE inventory SET status/.test(sql)) return { rows: [] };
    if (/INSERT INTO inventory_listings/.test(sql)) {
      const err = new Error('column "platform_listing_id" does not exist');
      err.code = '42703';
      throw err;
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807', {
      platforms: ['craigslist'],
      options: { craigslist: { city: 'baltimore' } },
      skipEmail: true,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.results.length, 1);
    assert.equal(res.body.results[0].platform, 'craigslist');
    assert.equal(res.body.results[0].status, 'error');
    assert.match(res.body.results[0].error, /inventory_listings unavailable/);
    assert.equal(calls.filter((sql) => /UPDATE inventory_listings/.test(sql)).length, 0);
  });
});

test('publish POST reports platform update schema drift without crashing', async () => {
  const calls = [];
  const app = buildApp(async (sql) => {
    calls.push(sql);
    if (/SELECT \* FROM inventory WHERE id/.test(sql)) {
      return {
        rows: [{
          id: 'ddeb41d4-5261-4851-9324-e2f09ea8f807',
          year: 2018,
          make: 'Toyota',
          model: '8FGCU25',
          photos: [],
          status: 'listed',
        }],
      };
    }
    if (/INSERT INTO inventory_seo/.test(sql)) return { rows: [] };
    if (/UPDATE inventory SET status/.test(sql)) return { rows: [] };
    if (/INSERT INTO inventory_listings/.test(sql)) return { rows: [{ id: 'listing-1' }] };
    if (/UPDATE inventory_listings/.test(sql)) {
      const err = new Error('column "updated_at" does not exist');
      err.code = '42703';
      throw err;
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807', {
      platforms: ['facebook_marketplace'],
      options: { facebook_marketplace: {} },
      skipEmail: true,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.results.length, 1);
    assert.equal(res.body.results[0].platform, 'facebook_marketplace');
    assert.equal(res.body.results[0].status, 'error');
    assert.match(res.body.results[0].error, /inventory_listings unavailable/);
    assert.ok(calls.some((sql) => /UPDATE inventory_listings SET\s+platform_listing_id/.test(sql)));
  });
});

test('publish POST reports listing check-constraint drift without crashing or calling external publisher', async () => {
  const calls = [];
  const app = buildApp(async (sql) => {
    calls.push(sql);
    if (/SELECT \* FROM inventory WHERE id/.test(sql)) {
      return {
        rows: [{
          id: 'ddeb41d4-5261-4851-9324-e2f09ea8f807',
          year: 2018,
          make: 'Toyota',
          model: '8FGCU25',
          photos: [],
          status: 'listed',
        }],
      };
    }
    if (/INSERT INTO inventory_seo/.test(sql)) return { rows: [] };
    if (/UPDATE inventory SET status/.test(sql)) return { rows: [] };
    if (/INSERT INTO inventory_listings/.test(sql)) {
      const err = new Error('new row for relation "inventory_listings" violates check constraint');
      err.code = '23514';
      throw err;
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807', {
      platforms: ['craigslist'],
      options: { craigslist: { city: 'baltimore' } },
      skipEmail: true,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.results.length, 1);
    assert.equal(res.body.results[0].platform, 'craigslist');
    assert.equal(res.body.results[0].status, 'error');
    assert.match(res.body.results[0].error, /inventory_listings unavailable/);
    assert.equal(calls.filter((sql) => /UPDATE inventory_listings/.test(sql)).length, 0);
  });
});

test('publish unpublish degrades when optional listing table is absent', async () => {
  const calls = [];
  const app = buildApp(async (sql) => {
    calls.push(sql);
    if (/SELECT \* FROM inventory_listings WHERE inventory_id/.test(sql)) {
      const err = new Error('relation "inventory_listings" does not exist');
      err.code = '42P01';
      throw err;
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807/craigslist/unpublish');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'unavailable');
    assert.equal(res.body.error, 'inventory_listings unavailable');
    assert.equal(res.body.degraded, true);
    assert.equal(calls.filter((sql) => /UPDATE inventory_listings/.test(sql)).length, 0);
  });
});

test('publish GET degrades to 200 with warnings when optional Phase 6C tables are absent', async () => {
  const app = buildApp(async (sql) => {
    if (/inventory_listings/.test(sql)) {
      const err = new Error('relation "inventory_listings" does not exist');
      err.code = '42P01';
      throw err;
    }
    if (/inventory_seo/.test(sql)) {
      const err = new Error('relation "inventory_seo" does not exist');
      err.code = '42P01';
      throw err;
    }
    if (/marketplace_analytics/.test(sql)) {
      const err = new Error('relation "marketplace_analytics" does not exist');
      err.code = '42P01';
      throw err;
    }
    throw new Error(`Unexpected query: ${sql}`);
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'GET', '/api/publish/ddeb41d4-5261-4851-9324-e2f09ea8f807');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.listings, []);
    assert.equal(res.body.seo, null);
    assert.equal(res.body.degraded, true);
    assert.deepEqual(res.body.warnings, [
      'inventory_listings unavailable',
      'inventory_seo unavailable',
      'marketplace_analytics unavailable',
    ]);
  });
});
