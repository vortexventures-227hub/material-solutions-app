// backend/services/drip.js
const db = require('../db');
const { sendEmail } = require('./email');
const { escapeHtml } = require('../utils/html-escape');

/**
 * Drip Campaign Templates
 * 
 * Each campaign has a series of emails sent at specific intervals
 * after a lead is created or moves to a specific status.
 */

const campaigns = {
  // Welcome series for new leads
  welcome: [
    {
      dayOffset: 0, // Immediate
      subject: 'Welcome to Material Solutions',
      template: 'welcome'
    },
    {
      dayOffset: 2,
      subject: 'Why Buy Used Forklifts?',
      template: 'education_1'
    },
    {
      dayOffset: 5,
      subject: 'Current Inventory Highlights',
      template: 'inventory_update'
    },
    {
      dayOffset: 10,
      subject: 'Customer Success Story',
      template: 'testimonial'
    },
    {
      dayOffset: 15,
      subject: 'Ready to Talk? Schedule a Call',
      template: 'cta_schedule'
    }
  ],
  
  // Nurture series for engaged leads (clicked links, replied)
  nurture: [
    {
      dayOffset: 0,
      subject: 'Thanks for Your Interest!',
      template: 'engagement_thanks'
    },
    {
      dayOffset: 3,
      subject: 'Your Custom Quote is Ready',
      template: 'custom_quote'
    },
    {
      dayOffset: 7,
      subject: 'Financing Options Available',
      template: 'financing'
    },
    {
      dayOffset: 14,
      subject: 'Still Looking? Let Us Help',
      template: 'check_in'
    }
  ],
  
  // Re-engagement for cold leads (no interaction in 30 days)
  reengagement: [
    {
      dayOffset: 0,
      subject: 'Still Need Equipment?',
      template: 'reengagement_1'
    },
    {
      dayOffset: 7,
      subject: 'New Arrivals This Month',
      template: 'new_inventory'
    },
    {
      dayOffset: 14,
      subject: 'Last Chance - Special Pricing',
      template: 'special_offer'
    }
  ]
};

/**
 * Email templates with HTML content
 * Note: All user-supplied data (lead.name, etc.) MUST be escaped via escapeHtml()
 */
const templates = {
  welcome: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Material Solutions, ${escapeHtml(lead.name)}!</h2>
      <p>Thanks for reaching out. We're excited to help you find the perfect forklift for your operation.</p>
      <p>We specialize in high-quality used forklifts from top brands like Raymond, Toyota, Crown, and Hyster.</p>
      <p><strong>What makes us different:</strong></p>
      <ul>
        <li>Every unit inspected and tested</li>
        <li>Transparent pricing - no hidden fees</li>
        <li>Fast delivery and setup</li>
        <li>Expert guidance on selecting the right equipment</li>
      </ul>
      <p>I'll be following up within 24 hours to discuss your specific needs.</p>
      <p>In the meantime, browse our current inventory or reply to this email with any questions.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  education_1: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Why Buy Used Forklifts?</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>When you buy used from Material Solutions, you get 70-80% of the original cost savings without sacrificing quality.</p>
      <p><strong>Top 5 reasons our customers choose used:</strong></p>
      <ol>
        <li><strong>Immediate Availability</strong> - No 6-12 month wait like new orders</li>
        <li><strong>Lower Depreciation</strong> - Used equipment holds value better</li>
        <li><strong>Proven Reliability</strong> - Our units have proven track records</li>
        <li><strong>Cost Savings</strong> - $15K-$40K+ savings per unit</li>
        <li><strong>Same Performance</strong> - Well-maintained units perform like new</li>
      </ol>
      <p>Ready to explore options? Hit reply and let's chat.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  inventory_update: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Current Inventory Highlights</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Here are a few units I think might interest you:</p>
      <!-- Dynamic inventory insertion would happen here -->
      <p><em>(Note: This is a template - actual inventory would be dynamically inserted)</em></p>
      <p>Want to see full specs, photos, or schedule an inspection? Let me know.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  testimonial: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>How We Helped ABC Logistics</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Last month, we helped ABC Logistics replace their entire fleet of 8 forklifts.</p>
      <blockquote style="border-left: 4px solid #4CAF50; padding-left: 16px; margin: 20px 0;">
        <p><em>"Material Solutions saved us over $120K compared to buying new. Every unit arrived on time, fully tested, and ready to work. Bill made the whole process easy."</em></p>
        <p><strong>- Mike, Operations Manager at ABC Logistics</strong></p>
      </blockquote>
      <p>We can help you too. What's your timeline?</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  cta_schedule: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Ready to Find Your Perfect Forklift?</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Over the past two weeks, I've shared why used forklifts are a smart choice, highlighted our inventory, and shown you how we've helped businesses like yours.</p>
      <p>Now let's talk about <strong>your</strong> specific needs.</p>
      <p><strong>Schedule a 15-minute call with me:</strong></p>
      <p><a href="https://calendly.com/materialsolutions/15min" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Book a Call</a></p>
      <p>Or reply to this email and we'll find a time that works.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  engagement_thanks: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thanks for Your Interest!</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>I noticed you checked out our inventory. Great choice!</p>
      <p>I'm putting together a custom quote based on what you're looking for.</p>
      <p>Expect it in your inbox within 24 hours.</p>
      <p>In the meantime, any questions? Hit reply.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  custom_quote: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Custom Quote is Ready</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Based on your needs, here's what I recommend:</p>
      <!-- Dynamic quote insertion would happen here -->
      <p><em>(Note: This is a template - actual quote would be dynamically inserted)</em></p>
      <p>Ready to move forward? Reply to this email or call me at (555) 123-4567.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  financing: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Financing Options Available</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Did you know we offer flexible financing options?</p>
      <p><strong>Financing benefits:</strong></p>
      <ul>
        <li>Low monthly payments ($500-$1,500 depending on unit)</li>
        <li>Preserve cash flow for operations</li>
        <li>Fast approval (24-48 hours)</li>
        <li>Flexible terms (12-60 months)</li>
      </ul>
      <p>Want to see what your monthly payment would look like? Let me know.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  check_in: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Still Looking? Let Us Help</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>I haven't heard from you in a bit - just checking in.</p>
      <p>Finding the right forklift can be overwhelming. That's what I'm here for.</p>
      <p>What questions can I answer? What's holding you back?</p>
      <p>Reply to this email or call me directly: (555) 123-4567</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  reengagement_1: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Still Need Equipment?</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>It's been a while since we last talked. I wanted to check in.</p>
      <p>Are you still looking for forklifts? Your needs may have changed.</p>
      <p>We've added new inventory and have some great deals right now.</p>
      <p>Let me know if I can help.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  new_inventory: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Arrivals This Month</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>We just added 12 new units to our inventory:</p>
      <ul>
        <li>3 Raymond reach trucks (2018-2021, low hours)</li>
        <li>4 Toyota sit-downs (2017-2020)</li>
        <li>2 Crown order pickers (2019, excellent condition)</li>
        <li>3 Hyster swing reaches (2020-2022)</li>
      </ul>
      <p>Want first dibs before they hit the public listings?</p>
      <p>Reply and I'll send you the details.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `,
  
  special_offer: (lead) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Last Chance - Special Pricing</h2>
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>This is my final follow-up. I don't want to be pushy, but I also don't want you to miss out.</p>
      <p><strong>Special offer for you:</strong></p>
      <p>$2,000 off any unit + free delivery (within 100 miles)</p>
      <p><em>Offer expires in 7 days</em></p>
      <p>If you're not interested, no worries - just let me know and I'll remove you from my follow-up list.</p>
      <p>But if you're still looking, now's the time to act.</p>
      <p>Best,<br>Bill<br>Material Solutions</p>
    </div>
  `
};

/**
 * Schedule drip campaign for a lead
 */
async function scheduleDripCampaign(leadId, campaignType = 'welcome') {
  const campaign = campaigns[campaignType];
  if (!campaign) {
    throw new Error(`Unknown campaign type: ${campaignType}`);
  }

  const lead = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
  if (lead.rows.length === 0) {
    throw new Error(`Lead not found: ${leadId}`);
  }

  const leadData = lead.rows[0];
  const startDate = new Date();

  // Create scheduled email records
  for (const email of campaign) {
    const sendDate = new Date(startDate);
    sendDate.setDate(sendDate.getDate() + email.dayOffset);

    await db.query(
      `INSERT INTO drip_emails (lead_id, campaign_type, email_index, subject, send_date, status)
       VALUES ($1, $2, $3, $4, $5, 'scheduled')`,
      [leadId, campaignType, campaign.indexOf(email), email.subject, sendDate]
    );
  }

  console.log(`✅ Scheduled ${campaign.length} emails for lead ${leadId} (${campaignType} campaign)`);
}

/**
 * Process scheduled drip emails (run this via cron or background job)
 */
async function processDripEmails() {
  const now = new Date();
  
  // Get all scheduled emails that are due to be sent
  const result = await db.query(
    `SELECT de.*, l.* 
     FROM drip_emails de
     JOIN leads l ON de.lead_id = l.id
     WHERE de.status = 'scheduled' 
     AND de.send_date <= $1
     ORDER BY de.send_date ASC`,
    [now]
  );

  const dueEmails = result.rows;
  
  if (dueEmails.length === 0) {
    console.log('No drip emails due at this time.');
    return;
  }

  console.log(`📧 Processing ${dueEmails.length} drip emails...`);

  for (const email of dueEmails) {
    try {
      // Get the template
      const campaign = campaigns[email.campaign_type];
      if (!campaign) {
        throw new Error(`Unknown campaign type: ${email.campaign_type}`);
      }
      const emailConfig = campaign[email.email_index];
      if (!emailConfig) {
        throw new Error(`Invalid email index ${email.email_index} for campaign ${email.campaign_type}`);
      }
      const templateFunc = templates[emailConfig.template];
      
      if (!templateFunc) {
        throw new Error(`Template not found: ${emailConfig.template}`);
      }

      // Generate email content
      const htmlContent = templateFunc(email);

      // Send email
      await sendEmail({
        to: email.email,
        subject: email.subject,
        html: htmlContent
      });

      // Mark as sent
      await db.query(
        'UPDATE drip_emails SET status = $1, sent_at = $2 WHERE id = $3',
        ['sent', new Date(), email.id]
      );

      console.log(`Drip email sent: ${email.subject} (lead_id: ${email.lead_id})`);
    } catch (error) {
      console.error(`❌ Failed to send email ${email.id}:`, error);
      
      // Mark as failed
      await db.query(
        'UPDATE drip_emails SET status = $1, error = $2 WHERE id = $3',
        ['failed', error.message, email.id]
      );
    }
  }
}

/**
 * Cancel drip campaign for a lead (when they convert or unsubscribe)
 */
async function cancelDripCampaign(leadId) {
  await db.query(
    'UPDATE drip_emails SET status = $1 WHERE lead_id = $2 AND status = $3',
    ['cancelled', leadId, 'scheduled']
  );
  
  console.log(`🚫 Cancelled drip campaign for lead ${leadId}`);
}

/**
 * Get drip campaign status for a lead
 */
async function getDripStatus(leadId) {
  const result = await db.query(
    `SELECT campaign_type, email_index, subject, send_date, status, sent_at
     FROM drip_emails
     WHERE lead_id = $1
     ORDER BY send_date ASC`,
    [leadId]
  );
  
  return result.rows;
}

module.exports = {
  scheduleDripCampaign,
  processDripEmails,
  cancelDripCampaign,
  getDripStatus,
  campaigns,
  templates
};
