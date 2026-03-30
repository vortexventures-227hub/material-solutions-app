/**
 * Email Tracking — open/click webhook handler
 */

const db = require('../db');

/**
 * Record an email open event (1x1 pixel)
 * Called by the tracking pixel URL
 */
async function recordOpen({ campaignId, leadId }) {
  if (!campaignId) return null;

  try {
    await db.query(
      `UPDATE email_recipients
       SET opened_at = COALESCE(opened_at, NOW()), status = 'opened'
       WHERE campaign_id = $1 AND lead_id = $2
       RETURNING id`,
      [campaignId, leadId]
    );

    // Update campaign totals
    await db.query(
      `UPDATE email_campaigns
       SET total_opens = total_opens + 1
       WHERE id = $1`,
      [campaignId]
    );

    // 1x1 transparent GIF
    return Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
  } catch (err) {
    console.error('[Tracking] recordOpen error:', err.message);
    return null;
  }
}

/**
 * Record a click event and redirect
 * Called when recipient clicks a tracked link
 */
async function recordClick({ campaignId, leadId, targetUrl }) {
  if (!campaignId) return { redirect: targetUrl };

  try {
    await db.query(
      `UPDATE email_recipients
       SET clicked_at = COALESCE(clicked_at, NOW()), status = 'clicked'
       WHERE campaign_id = $1 AND lead_id = $2
       RETURNING id`,
      [campaignId, leadId]
    );

    await db.query(
      `UPDATE email_campaigns
       SET total_clicks = total_clicks + 1
       WHERE id = $1`,
      [campaignId]
    );

    // Log the click URL
    await db.query(
      `INSERT INTO email_click_logs (campaign_id, lead_id, url, clicked_at)
       VALUES ($1, $2, $3, NOW())`,
      [campaignId, leadId, targetUrl]
    );

    return { redirect: targetUrl };
  } catch (err) {
    console.error('[Tracking] recordClick error:', err.message);
    return { redirect: targetUrl };
  }
}

/**
 * Record a bounce
 */
async function recordBounce({ campaignId, leadId, reason }) {
  if (!campaignId) return;

  await db.query(
    `UPDATE email_recipients
     SET bounced_at = NOW(), bounced_reason = $3, status = 'bounced'
     WHERE campaign_id = $1 AND lead_id = $2`,
    [campaignId, leadId, reason]
  );

  await db.query(
    `UPDATE email_campaigns
     SET total_bounces = total_bounces + 1
     WHERE id = $1`,
    [campaignId]
  );
}

/**
 * Handle SendGrid webhook payload (batch events)
 * POST /api/email/webhook
 */
async function handleSendGridWebhook(payload) {
  const events = Array.isArray(payload) ? payload : [payload];
  const results = [];

  for (const event of events) {
    const { email, timestamp, event: eventType, sg_message_id, reason, url } = event;

    // Find recipient by message_id or email
    let recipient;
    if (sg_message_id) {
      // Search by approximate time window
      const start = new Date(timestamp * 1000 - 60000);
      const end = new Date(timestamp * 1000 + 60000);
      const res = await db.query(
        `SELECT id, campaign_id, lead_id FROM email_recipients
         WHERE email = $1 AND sent_at BETWEEN $2 AND $3
         ORDER BY ABS(EXTRACT(EPOCH FROM (sent_at - $4::timestamptz)))
         LIMIT 1`,
        [email, start, end, new Date(timestamp * 1000)]
      );
      recipient = res.rows[0];
    }

    switch (eventType) {
      case 'open':
        if (recipient) await recordOpen({ campaignId: recipient.campaign_id, leadId: recipient.lead_id });
        break;
      case 'click':
        if (recipient) await recordClick({ campaignId: recipient.campaign_id, leadId: recipient.lead_id, targetUrl: url });
        break;
      case 'bounce':
      case 'blocked':
        if (recipient) await recordBounce({ campaignId: recipient.campaign_id, leadId: recipient.lead_id, reason });
        break;
      case 'unsubscribe':
        if (recipient) {
          await db.query(`UPDATE email_recipients SET status = 'unsubscribed' WHERE id = $1`, [recipient.id]);
        }
        break;
    }

    results.push({ email, eventType, handled: true });
  }

  return results;
}

/**
 * Get email analytics for a campaign
 */
async function getCampaignAnalytics(campaignId) {
  const res = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'sent') as sent,
       COUNT(*) FILTER (WHERE status = 'opened') as opened,
       COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
       COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
       COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
       COUNT(*) FILTER (WHERE status = 'pending') as pending
     FROM email_recipients
     WHERE campaign_id = $1`,
    [campaignId]
  );

  const totals = res.rows[0];
  const sent = parseInt(totals.sent) || 0;
  const opened = parseInt(totals.opened) || 0;
  const clicked = parseInt(totals.clicked) || 0;

  return {
    sent,
    openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0',
    clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0',
    bounceRate: sent > 0 ? ((parseInt(totals.bounced) / sent) * 100).toFixed(1) : '0.0',
    pending: parseInt(totals.pending) || 0,
    opened,
    clicked,
    bounced: parseInt(totals.bounced) || 0,
    unsubscribed: parseInt(totals.unsubscribed) || 0,
  };
}

module.exports = {
  recordOpen,
  recordClick,
  recordBounce,
  handleSendGridWebhook,
  getCampaignAnalytics,
};
