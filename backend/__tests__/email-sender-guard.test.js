const test = require('node:test');
const assert = require('node:assert/strict');

const db = require('../db');
const { sendEmail, sendBatch, checkEmailGuard } = require('../services/email/sender');

const originalEnv = { ...process.env };

function resetEnv() {
  process.env = { ...originalEnv };
  delete process.env.EMAIL_OUTBOUND_ENABLED;
  delete process.env.FSM_CUSTOMER_EMAIL_ENABLED;
  delete process.env.EMAIL_DRY_RUN;
  delete process.env.EMAIL_RECIPIENT_ALLOWLIST;
  delete process.env.EMAIL_BLOCKLIST;
  delete process.env.EMAIL_MAX_BATCH_SIZE;
  delete process.env.SENDGRID_API_KEY;
}

test.after(async () => {
  process.env = originalEnv;
  await db.end();
});

test('FSM email sender is disabled by default even with a SendGrid key present', async () => {
  resetEnv();
  process.env.SENDGRID_API_KEY = 'SG.stubbed-test-key';

  const result = await sendEmail({
    to: 'buyer@example.com',
    subject: 'Test',
    text: 'Test',
    html: '<p>Test</p>',
  });

  assert.equal(result.success, false);
  assert.equal(result.skipped, true);
  assert.equal(result.guard_reason, 'outbound_disabled');
});

test('FSM email sender requires exact or domain allowlist before live sending', () => {
  resetEnv();
  process.env.EMAIL_OUTBOUND_ENABLED = 'true';
  process.env.EMAIL_DRY_RUN = 'false';

  const decision = checkEmailGuard({
    to: 'buyer@example.com',
    from: 'sales@materialsolutions.com',
    replyTo: 'sales@materialsolutions.com',
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, 'recipient_not_allowlisted');
});

test('FSM email sender dry-run blocks provider calls after allowlist', async () => {
  resetEnv();
  process.env.SENDGRID_API_KEY = 'SG.stubbed-test-key';
  process.env.EMAIL_OUTBOUND_ENABLED = 'true';
  process.env.EMAIL_DRY_RUN = 'true';
  process.env.EMAIL_RECIPIENT_ALLOWLIST = 'buyer@example.com';

  const result = await sendEmail({
    to: 'buyer@example.com',
    subject: 'Test',
    text: 'Test',
    html: '<p>Test</p>',
  });

  assert.equal(result.success, true);
  assert.equal(result.skipped, true);
  assert.equal(result.guard_reason, 'dry_run_enabled');
});

test('FSM email sender blocks self/internal operational addresses', () => {
  resetEnv();
  process.env.EMAIL_OUTBOUND_ENABLED = 'true';
  process.env.EMAIL_DRY_RUN = 'false';
  process.env.EMAIL_RECIPIENT_ALLOWLIST = 'david@materialsolutionsnj.com';

  const decision = checkEmailGuard({
    to: 'david@materialsolutionsnj.com',
    from: 'sales@materialsolutions.com',
    replyTo: 'sales@materialsolutions.com',
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, 'recipient_is_blocked_or_self');
});

test('FSM batch sender caps bulk sends by default', async () => {
  resetEnv();
  process.env.EMAIL_OUTBOUND_ENABLED = 'true';
  process.env.EMAIL_DRY_RUN = 'false';
  process.env.EMAIL_RECIPIENT_ALLOWLIST = 'example.com';

  const results = await sendBatch([
    { to: 'one@example.com', subject: 'One', text: 'One', html: '<p>One</p>' },
    { to: 'two@example.com', subject: 'Two', text: 'Two', html: '<p>Two</p>' },
  ]);

  assert.equal(results.length, 2);
  assert.equal(results[0].guard_reason, 'batch_size_cap_reached');
  assert.equal(results[1].guard_reason, 'batch_size_cap_reached');
});

