/**
 * Rate-limit test for POST /api/auth/change-password
 *
 * Uses a minimal Express app with the same rate-limiter configuration
 * wired to a stub endpoint (no DB required) to verify 429 behavior.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const rateLimit = require('express-rate-limit');

// Mirror the limiter config from routes/auth.js exactly
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 5;

function buildTestApp() {
  const app = express();

  // Trust proxy so req.ip resolves consistently in test
  app.set('trust proxy', false);

  const limiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_ATTEMPTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (_req, res) => {
      res.status(429).json({ error: 'Too many password change attempts. Try again in 10 minutes.' });
    },
  });

  // Stub endpoint: rate-limit runs first, then returns 401 (no real auth)
  app.post('/api/auth/change-password', limiter, (_req, res) => {
    res.status(401).json({ error: 'No token provided' });
  });

  return app;
}

function request(server, method, path) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('change-password: first 5 attempts from same IP return 401 (not rate-limited)', async () => {
  const app = buildTestApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const { status } = await request(server, 'POST', '/api/auth/change-password');
      assert.equal(status, 401, `Attempt ${i} should be 401, not rate-limited yet`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('change-password: 6th attempt from same IP returns 429', async () => {
  const app = buildTestApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    // Exhaust the limit
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await request(server, 'POST', '/api/auth/change-password');
    }
    // Next attempt must be rate-limited
    const { status, body } = await request(server, 'POST', '/api/auth/change-password');
    assert.equal(status, 429, 'Attempt beyond limit must return 429');
    const parsed = JSON.parse(body);
    assert.ok(parsed.error, 'Rate-limit response must include error field');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('change-password: RateLimit-Limit header is set to 5', async () => {
  const app = buildTestApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    await new Promise((resolve, reject) => {
      const addr = server.address();
      const req = http.request(
        { hostname: '127.0.0.1', port: addr.port, path: '/api/auth/change-password', method: 'POST' },
        (res) => {
          const limitHeader = res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit'];
          assert.ok(limitHeader, 'RateLimit-Limit header must be present');
          assert.equal(String(limitHeader), String(MAX_ATTEMPTS), `Limit header must be ${MAX_ATTEMPTS}`);
          resolve();
        }
      );
      req.on('error', reject);
      req.end();
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
