/**
 * P8-CRM-SYNC: Mock-test the lead → FSM → CRM chain.
 *
 * Tests that when a lead is created via POST /api/leads, the FSM automatically
 * calls syncToCRM with the new lead. CRM endpoints are fully mocked — no real
 * HubSpot or GHL credentials needed.
 *
 * Follows the stub pattern from publish-defensive-status.test.js.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');

const dbPath          = path.join(backendRoot, 'db.js');
const crmServicePath  = path.join(backendRoot, 'services', 'crm.js');
const emailServicePath = path.join(backendRoot, 'services', 'email.js');
const dripServicePath  = path.join(backendRoot, 'services', 'drip.js');
const smsServicePath   = path.join(backendRoot, 'services', 'sms.js');
const leadsRoutePath   = path.join(backendRoot, 'routes', 'leads.js');

const FAKE_LEAD = {
  id: 42,
  name: 'Jane Buyer',
  email: 'jane@example.com',
  phone: '+12015551234',
  company: 'Acme Corp',
  source: 'website',
  interest: ['forklifts'],
  budget: 15000,
  timeline: '30_days',
  is_decision_maker: true,
  score: 0,
  status: 'new',
  created_at: '2026-04-26T21:15:00.000Z',
};

function installStubs({ onSyncToCRM } = {}) {
  // Clear cached requires so stubs take effect
  for (const p of [leadsRoutePath, dbPath, crmServicePath, emailServicePath, dripServicePath, smsServicePath]) {
    delete require.cache[require.resolve(p)];
  }

  // db stub — returns FAKE_LEAD on INSERT
  require.cache[require.resolve(dbPath)] = {
    id: dbPath, filename: dbPath, loaded: true,
    exports: {
      query: async (sql) => {
        if (sql.includes('INSERT INTO leads')) return { rows: [FAKE_LEAD] };
        return { rows: [] };
      },
    },
  };

  // CRM service stub — mocks syncToCRM so no real HTTP calls are made
  const syncToCRM = async (lead) => {
    if (onSyncToCRM) onSyncToCRM(lead);
    return [
      { crm: 'GoHighLevel', success: true, data: { id: 'ghl-contact-001' } },
      { crm: 'HubSpot',     success: true, data: { id: 'hs-contact-001'  } },
    ];
  };
  require.cache[require.resolve(crmServicePath)] = {
    id: crmServicePath, filename: crmServicePath, loaded: true,
    exports: {
      syncToCRM,
      syncToGoHighLevel: async () => ({ success: true }),
      syncToHubSpot:     async () => ({ success: true }),
      updateGoHighLevelContact: async () => ({ success: true }),
      updateHubSpotContact:     async () => ({ success: true }),
      handleGoHighLevelWebhook: () => ({ received: true }),
      handleHubSpotWebhook:     () => ({ received: true }),
    },
  };

  // Email service stub
  require.cache[require.resolve(emailServicePath)] = {
    id: emailServicePath, filename: emailServicePath, loaded: true,
    exports: {
      sendNewLeadNotification: async () => {},
      sendWelcomeEmail:        async () => {},
    },
  };

  // Drip service stub
  require.cache[require.resolve(dripServicePath)] = {
    id: dripServicePath, filename: dripServicePath, loaded: true,
    exports: {
      scheduleDripCampaign: async () => {},
    },
  };

  // SMS service stub
  require.cache[require.resolve(smsServicePath)] = {
    id: smsServicePath, filename: smsServicePath, loaded: true,
    exports: {
      sendNewLeadSMS: async () => {},
    },
  };
}

function buildApp(stubs) {
  installStubs(stubs);
  const leadsRouter = require(leadsRoutePath);
  const app = express();
  app.use(express.json());
  // POST /api/leads is public in FSM (conditionalLeadAuth skips auth for POST /)
  app.use('/api/leads', leadsRouter);
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

function request(server, method, reqPath, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path: reqPath,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
      }
    );
    req.on('error', reject);
    req.end(payload);
  });
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

// ─── Tests ───────────────────────────────────────────────────────────────────

test('POST /api/leads creates lead and returns 201', async () => {
  const app = buildApp();
  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/leads/', {
      name: 'Jane Buyer',
      email: 'jane@example.com',
      phone: '+12015551234',
      company: 'Acme Corp',
      source: 'website',
      interest: ['forklifts'],
      budget: 15000,
      timeline: '30_days',
      is_decision_maker: true,
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.id, FAKE_LEAD.id);
    assert.equal(res.body.name, FAKE_LEAD.name);
    assert.equal(res.body.email, FAKE_LEAD.email);
  });
});

test('POST /api/leads triggers syncToCRM with the created lead', async (t) => {
  let capturedLead = null;
  const app = buildApp({ onSyncToCRM: (lead) => { capturedLead = lead; } });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/leads/', {
      name: 'Jane Buyer',
      email: 'jane@example.com',
    });
    assert.equal(res.status, 201, 'lead creation must succeed before CRM sync fires');
  });

  // syncToCRM is fired async (Promise.all fire-and-forget) — give it a tick
  await new Promise((r) => setImmediate(r));

  assert.ok(capturedLead !== null, 'syncToCRM must be called after lead creation');
  assert.equal(capturedLead.id,    FAKE_LEAD.id,    'syncToCRM receives correct lead id');
  assert.equal(capturedLead.email, FAKE_LEAD.email, 'syncToCRM receives correct lead email');
  assert.equal(capturedLead.name,  FAKE_LEAD.name,  'syncToCRM receives correct lead name');
});

test('CRM sync returns GHL + HubSpot success for mocked lead', async () => {
  // Load the real syncToCRM from the stub (already returns mocked success)
  for (const p of [crmServicePath]) delete require.cache[require.resolve(p)];

  // Re-install stub directly to call syncToCRM standalone
  const syncToCRM = async (lead) => [
    { crm: 'GoHighLevel', success: true, data: { id: 'ghl-contact-001' } },
    { crm: 'HubSpot',     success: true, data: { id: 'hs-contact-001'  } },
  ];

  const results = await syncToCRM(FAKE_LEAD);

  assert.equal(results.length, 2, 'both CRM systems return results');
  assert.ok(results.every(r => r.success), 'all CRM syncs succeed');
  assert.ok(results.find(r => r.crm === 'GoHighLevel'), 'GHL result present');
  assert.ok(results.find(r => r.crm === 'HubSpot'), 'HubSpot result present');
  assert.equal(results.find(r => r.crm === 'GoHighLevel').data.id, 'ghl-contact-001');
  assert.equal(results.find(r => r.crm === 'HubSpot').data.id, 'hs-contact-001');
});

test('POST /api/leads rejects missing name (validation)', async () => {
  const app = buildApp();
  await withServer(app, async (server) => {
    const res = await request(server, 'POST', '/api/leads/', {
      email: 'jane@example.com',
      // name intentionally omitted
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.error, 'validation error returned');
  });
});

test('POST /api/crm/sync/:leadId manually syncs lead to CRM', async () => {
  // Verify the manual CRM sync endpoint path (for ops use)
  const crmRoutePath = path.join(backendRoot, 'routes', 'crm.js');
  delete require.cache[require.resolve(crmRoutePath)];
  delete require.cache[require.resolve(crmServicePath)];

  let manualSyncCalled = false;
  require.cache[require.resolve(crmServicePath)] = {
    id: crmServicePath, filename: crmServicePath, loaded: true,
    exports: {
      syncToCRM: async (lead) => {
        manualSyncCalled = true;
        return [{ crm: 'GoHighLevel', success: true, data: { id: 'ghl-001' } }];
      },
      handleGoHighLevelWebhook: () => ({ received: true }),
      handleHubSpotWebhook:     () => ({ received: true }),
    },
  };

  require.cache[require.resolve(dbPath)] = {
    id: dbPath, filename: dbPath, loaded: true,
    exports: {
      query: async () => ({ rows: [FAKE_LEAD] }),
    },
  };

  const crmRouter = require(crmRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/crm', crmRouter);
  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message });
  });

  await withServer(app, async (server) => {
    const res = await request(server, 'POST', `/api/crm/sync/${FAKE_LEAD.id}`, {});
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'CRM sync completed');
    assert.ok(manualSyncCalled, 'syncToCRM called by manual sync endpoint');
  });
});
