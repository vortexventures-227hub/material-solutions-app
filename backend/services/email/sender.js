/**
 * Email Sender — SendGrid Integration
 */

const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const db = require('../db');

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.COMPANY_EMAIL || 'sales@materialsolutions.com';
const FROM_NAME = 'Material Solutions';
const TRACKING_DOMAIN = process.env.EMAIL_TRACKING_DOMAIN || ' materialsolutions.com';

/**
 * Send a single email
 */
async function sendEmail({ to, subject, html, text, from, fromName, replyTo, campaignId, leadId, scheduledAt }) {
  // If scheduled for later, we would store in a queue — for now send immediately
  const msg = {
    to,
    from: { email: from || FROM_EMAIL, name: fromName || FROM_NAME },
    subject,
    text,
    html,
    replyTo: replyTo || FROM_EMAIL,
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

module.exports = { sendEmail, sendBatch, buildTrackingUrl, buildOpenPixelUrl };
