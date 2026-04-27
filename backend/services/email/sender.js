/**
 * Email Sender — SendGrid Integration
 */

const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const db = require('../../db');

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.COMPANY_EMAIL || 'sales@materialsolutions.com';
const FROM_NAME = 'Material Solutions';
const TRACKING_DOMAIN = process.env.EMAIL_TRACKING_DOMAIN || ' materialsolutions.com';

const DEFAULT_BLOCKLIST = [
  'david@materialsolutionsnj.com',
  'accounts@materialsolutionsnj.com',
  'info@materialsolutionsnj.com',
  'noreply@materialsolutionsnj.com',
  'no-reply@materialsolutionsnj.com',
];

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
}

function boolEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).trim().toLowerCase());
}

function numberEnv(name, fallback) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function extractRecipients(to) {
  const list = Array.isArray(to) ? to : [to];
  return list
    .flatMap((entry) => String(entry || '').split(','))
    .map((entry) => normalizeEmail(entry.replace(/^.*<([^>]+)>.*$/, '$1')))
    .filter(Boolean);
}

function recipientAllowed(address, allowlist) {
  const domain = address.split('@')[1] || '';
  return allowlist.some((entry) => (
    entry === address
    || entry === domain
    || entry === `@${domain}`
  ));
}

function checkEmailGuard({ to, from, replyTo }) {
  const recipients = extractRecipients(to);
  const outboundEnabled = boolEnv('EMAIL_OUTBOUND_ENABLED', boolEnv('FSM_CUSTOMER_EMAIL_ENABLED', false));
  const dryRun = boolEnv('EMAIL_DRY_RUN', true);
  const allowlist = splitCsv(process.env.EMAIL_RECIPIENT_ALLOWLIST);
  const blocklist = [
    ...DEFAULT_BLOCKLIST,
    ...splitCsv(process.env.EMAIL_BLOCKLIST),
    normalizeEmail(from),
    normalizeEmail(replyTo),
  ].filter(Boolean);

  if (!recipients.length) return { allowed: false, dryRun, reason: 'no_recipients', recipients };
  if (!outboundEnabled) return { allowed: false, dryRun, reason: 'outbound_disabled', recipients };
  if (recipients.some((recipient) => blocklist.includes(recipient))) {
    return { allowed: false, dryRun, reason: 'recipient_is_blocked_or_self', recipients };
  }
  if (recipients.some((recipient) => !recipientAllowed(recipient, allowlist))) {
    return { allowed: false, dryRun, reason: 'recipient_not_allowlisted', recipients };
  }
  if (dryRun) return { allowed: false, dryRun, reason: 'dry_run_enabled', recipients };

  return { allowed: true, dryRun, reason: 'allowed', recipients };
}

/**
 * Send a single email
 */
async function sendEmail({ to, subject, html, text, from, fromName, replyTo, campaignId, leadId, scheduledAt }) {
  const resolvedFrom = from || FROM_EMAIL;
  const resolvedReplyTo = replyTo || FROM_EMAIL;
  const guard = checkEmailGuard({ to, from: resolvedFrom, replyTo: resolvedReplyTo });
  if (!guard.allowed) {
    console.warn(`[Email Sender] outbound blocked: ${guard.reason}; recipients=${guard.recipients.join(',') || '(none)'}`);
    return {
      success: guard.reason === 'dry_run_enabled',
      skipped: true,
      mock: true,
      guard_reason: guard.reason,
      dry_run: guard.dryRun,
      recipients: guard.recipients,
      messageId: `guard_${Date.now()}`,
    };
  }

  // If scheduled for later, we would store in a queue — for now send immediately
  const msg = {
    to,
    from: { email: resolvedFrom, name: fromName || FROM_NAME },
    subject,
    text,
    html,
    replyTo: resolvedReplyTo,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true, substitutionTag: '%open-tracking%' },
    },
    customArgs: {
      campaign_id: campaignId || '',
      lead_id: leadId || '',
    },
  };

  if (!SENDGRID_API_KEY) {
    console.warn('[Email Sender] SENDGRID_API_KEY not set — email would be sent in production');
    console.log(`[Email Sender] Would send to: ${to}, subject: ${subject}`);
    return { success: true, mock: true, messageId: `mock_${Date.now()}` };
  }

  try {
    const [response] = await sgMail.send(msg);
    const messageId = response?.headers?.['x-message-id'] || `sg_${Date.now()}`;

    // Record sent event
    if (campaignId) {
      await db.query(
        `INSERT INTO email_recipients (campaign_id, lead_id, email, status, sent_at, unsubscribe_token)
         VALUES ($1, $2, $3, 'sent', NOW(), $4)
         ON CONFLICT (campaign_id, lead_id) DO UPDATE SET sent_at = NOW(), status = 'sent'`,
        [campaignId, leadId, to, generateUnsubscribeToken()]
      );
    }

    return { success: true, messageId };
  } catch (error) {
    console.error('[Email Sender] Send failed:', error?.response?.body || error.message);

    if (error?.response?.body?.errors?.[0]?.message) {
      const reason = error.response.body.errors[0].message;
      if (reason.includes('Invalid email') || reason.includes('suppression')) {
        // Mark as bounced
        if (campaignId && leadId) {
          await db.query(
            `UPDATE email_recipients SET bounced_at = NOW(), bounced_reason = $3, status = 'bounced'
             WHERE campaign_id = $1 AND lead_id = $2`,
            [campaignId, leadId, reason]
          );
        }
        return { success: false, reason };
      }
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send a batch of emails
 */
async function sendBatch(emails) {
  const maxBatchSize = numberEnv('EMAIL_MAX_BATCH_SIZE', 1);
  if (emails.length > maxBatchSize) {
    console.warn(`[Email Sender] batch blocked: size ${emails.length} exceeds EMAIL_MAX_BATCH_SIZE=${maxBatchSize}`);
    return emails.map((email, index) => ({
      index,
      success: false,
      skipped: true,
      mock: true,
      guard_reason: 'batch_size_cap_reached',
      recipients: extractRecipients(email.to),
      messageId: `guard_batch_${Date.now()}_${index}`,
    }));
  }

  const results = await Promise.allSettled(emails.map(email => sendEmail(email)));
  return results.map((r, i) => ({
    index: i,
    ...(r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message }),
  }));
}

/**
 * Generate unsubscribe token
 */
function generateUnsubscribeToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Build tracking URL (clicks go through our server)
 */
function buildTrackingUrl({ campaignId, leadId, email, url }) {
  const encoded = Buffer.from(JSON.stringify({ c: campaignId, l: leadId, e: email, u: url })).toString('base64');
  return `${process.env.API_URL || 'https://api.materialsolutionsnj.com'}/api/email/track/click/${encoded}`;
}

/**
 * Build open-tracking pixel URL
 */
function buildOpenPixelUrl({ campaignId, leadId }) {
  const encoded = Buffer.from(JSON.stringify({ c: campaignId, l: leadId })).toString('base64');
  return `${process.env.API_URL || 'https://api.materialsolutionsnj.com'}/api/email/track/open/${encoded}`;
}

module.exports = { sendEmail, sendBatch, buildTrackingUrl, buildOpenPixelUrl, checkEmailGuard };
