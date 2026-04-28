const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');

const db = require('../db');
const inventoryRouter = require('../routes/inventory');

function buildApp(queryImpl) {
  const app = express();
  app.use(express.json());
  db.query = queryImpl;
  app.use('/api/inventory', inventoryRouter);
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

test('inventory create matches current production schema without ceiling_price', async () => {
  const app = buildApp(async (sql, params) => {
    assert.doesNotMatch(sql, /ceiling_price/);
    assert.equal(params.length, 19);
    return {
      rows: [{
        id: 'unit-1',
        make: params[0],
        model: params[1],
        listing_price: params[15],
        status: params[17],
      }],
    };
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/inventory', {
      make: 'Raymond',
      model: '752R45TT',
      year: 2018,
      listing_price: 29500,
      status: 'listed',
    });

    assert.equal(res.status, 201, res.raw);
    assert.equal(res.body.make, 'Raymond');
    assert.equal(res.body.model, '752R45TT');
  });
});

test('inventory patch serializes image arrays for current production schema', async () => {
  const app = buildApp(async (sql, params) => {
    assert.match(sql, /UPDATE inventory SET "images" = \$2 WHERE id = \$1 RETURNING \*/);
    assert.equal(params[0], 'unit-1');
    assert.equal(
      params[1],
      JSON.stringify(['https://www.materialsolutionsnj.com/inventory-media/reach-truck.jpg'])
    );
    return {
      rows: [{
        id: params[0],
        images: JSON.parse(params[1]),
      }],
    };
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'PATCH', '/api/inventory/unit-1', {
      images: ['https://www.materialsolutionsnj.com/inventory-media/reach-truck.jpg'],
    });

    assert.equal(res.status, 200, res.raw);
    assert.deepEqual(res.body.images, ['https://www.materialsolutionsnj.com/inventory-media/reach-truck.jpg']);
  });
});
