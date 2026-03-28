// backend/services/sms.js
const axios = require('axios');

// Twilio credentials (from environment variables)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Your Twilio number

// E.164 phone number format validation
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

// Redact phone number for logging (show last 4 digits only)
function redactPhone(phone) {
  if (!phone || phone.length < 5) return '***';
  return '***' + phone.slice(-4);
}

/**
 * Send SMS via Twilio API
 * @param {string} to - Recipient phone number (E.164 format: +15551234567)
 * @param {string} message - SMS message body (max 160 characters recommended)
 */
async function sendSMS(to, message) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not configured. SMS not sent.');
    return { success: false, message: 'Twilio not configured' };
  }

  if (!to || !E164_REGEX.test(to)) {
    throw new Error('Invalid phone number. Must be E.164 format (e.g. +15551234567)');
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_PHONE_NUMBER);
    params.append('Body', message);

    const response = await axios.post(url, params, {
      auth: {
        username: TWILIO_ACCOUNT_SID,
        password: TWILIO_AUTH_TOKEN
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });

    console.log(`SMS sent to ${redactPhone(to)}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('SMS send failed:', error.response?.data?.code || error.message);
    throw new Error(`SMS send failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Send new lead notification SMS to company
 */
async function sendNewLeadSMS(lead) {
  const companyPhone = process.env.COMPANY_PHONE; // Your phone number to receive notifications
  
  if (!companyPhone) {
    console.warn('⚠️ COMPANY_PHONE not set. Skipping SMS notification.');
    return;
  }

  const message = `New Lead: ${lead.name} from ${lead.company || 'N/A'}\n` +
                  `Interest: ${lead.interest?.join(', ') || 'Not specified'}\n` +
                  `Check dashboard for details.`;

  await sendSMS(companyPhone, message);
}

/**
 * Send follow-up reminder SMS to lead
 */
async function sendFollowUpSMS(lead) {
  if (!lead.phone) {
    console.warn('⚠️ Lead has no phone number. Skipping SMS.');
    return;
  }

  const message = `Hi ${lead.name}, it's Bill from Material Solutions. Just checking in - are you still looking for forklifts? Reply or call me at ${process.env.COMPANY_PHONE || '(555) 123-4567'}.`;

  await sendSMS(lead.phone, message);
}

/**
 * Send custom SMS to lead
 */
async function sendCustomSMS(lead, customMessage) {
  if (!lead.phone) {
    throw new Error('Lead has no phone number');
  }

  await sendSMS(lead.phone, customMessage);
}

/**
 * Send appointment reminder SMS
 */
async function sendAppointmentReminderSMS(lead, appointmentDate) {
  if (!lead.phone) {
    console.warn('⚠️ Lead has no phone number. Skipping SMS.');
    return;
  }

  const date = new Date(appointmentDate);
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const message = `Reminder: You have a call scheduled with Material Solutions on ${dateStr} at ${timeStr}. Looking forward to it! - Bill`;

  await sendSMS(lead.phone, message);
}

/**
 * Send quote ready SMS notification
 */
async function sendQuoteReadySMS(lead) {
  if (!lead.phone) {
    console.warn('⚠️ Lead has no phone number. Skipping SMS.');
    return;
  }

  const message = `Hi ${lead.name}, your custom forklift quote is ready! Check your email or call me at ${process.env.COMPANY_PHONE || '(555) 123-4567'} to discuss. - Bill, Material Solutions`;

  await sendSMS(lead.phone, message);
}

module.exports = {
  sendSMS,
  sendNewLeadSMS,
  sendFollowUpSMS,
  sendCustomSMS,
  sendAppointmentReminderSMS,
  sendQuoteReadySMS
};
