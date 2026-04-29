const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

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

test('inventory list supports search filters without regressing status pagination', async () => {
  const app = buildApp(async (sql, params) => {
    if (/COUNT\(\*\)/.test(sql)) {
      assert.match(sql, /status = \$1/);
      assert.match(sql, /make ILIKE \$2/);
      assert.match(sql, /model ILIKE \$3/);
      assert.match(sql, /serial ILIKE \$4/);
      assert.match(sql, /make ILIKE \$5 OR/);
      assert.deepEqual(params, [
        'listed',
        '%Raymond%',
        '%752%',
        '%AD67929%',
        '%reach%',
      ]);
      return { rows: [{ count: '1' }] };
    }

    assert.match(sql, /ORDER BY created_at DESC LIMIT \$6 OFFSET \$7/);
    assert.deepEqual(params, [
      'listed',
      '%Raymond%',
      '%752%',
      '%AD67929%',
      '%reach%',
      25,
      0,
    ]);
    return { rows: [{ id: 'unit-1', make: 'Raymond', model: '752R45TT' }] };
  });

  await withServer(app, async (server) => {
    const res = await request(
      server,
      'GET',
      '/api/inventory?status=listed&make=Raymond&model=752&serial=AD67929&q=reach'
    );

    assert.equal(res.status, 200, res.raw);
    assert.equal(res.body.data[0].id, 'unit-1');
  });
});

test('inventory media upload stores bytes and merges public image URLs onto the row', async () => {
  const mediaRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'fsm-inventory-media-'));
  const previousRoot = process.env.FSM_INVENTORY_MEDIA_ROOT;
  process.env.FSM_INVENTORY_MEDIA_ROOT = mediaRoot;

  const app = buildApp(async (sql, params) => {
    if (/SELECT id, images FROM inventory/.test(sql)) {
      assert.equal(params[0], 'unit-1');
      return {
        rows: [{
          id: 'unit-1',
          images: JSON.stringify(['https://existing.example/unit.jpg']),
        }],
      };
    }

    assert.match(sql, /UPDATE inventory SET images = \$2 WHERE id = \$1 RETURNING \*/);
    const mergedImages = JSON.parse(params[1]);
    assert.equal(mergedImages[0], 'https://existing.example/unit.jpg');
    assert.match(mergedImages[1], /^http:\/\/127\.0\.0\.1:\d+\/uploads\/inventory\/unit-1\//);
    return {
      rows: [{
        id: params[0],
        images: mergedImages,
      }],
    };
  });

  try {
    await withServer(app, async (server) => {
      const res = await request(server, 'POST', '/api/inventory/unit-1/media', {
        files: [{
          filename: 'reach truck.jpg',
          content_type: 'image/jpeg',
          base64: Buffer.from('fake image bytes').toString('base64'),
        }],
      });

      assert.equal(res.status, 201, res.raw);
      assert.equal(res.body.savedImages.length, 1);
      assert.match(res.body.publicPathPrefix, /^\/uploads\/inventory\/unit-1\//);

      const files = await fs.readdir(path.join(mediaRoot, 'unit-1'));
      assert.equal(files.length, 1);
      assert.match(files[0], /reach-truck\.jpg$/);
    });
  } finally {
    if (previousRoot === undefined) {
      delete process.env.FSM_INVENTORY_MEDIA_ROOT;
    } else {
      process.env.FSM_INVENTORY_MEDIA_ROOT = previousRoot;
    }
    await fs.rm(mediaRoot, { recursive: true, force: true });
  }
});
