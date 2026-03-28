// backend/services/crm.js
const axios = require('axios');

/**
 * CRM Integration Service
 * Supports GoHighLevel and HubSpot
 */

// GoHighLevel configuration
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_URL = 'https://rest.gohighlevel.com/v1';

// HubSpot configuration
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_URL = 'https://api.hubapi.com';

/**
 * Sync lead to GoHighLevel
 */
async function syncToGoHighLevel(lead) {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('⚠️ GoHighLevel credentials not configured. Skipping sync.');
    return { success: false, message: 'GoHighLevel not configured' };
  }

  try {
    const payload = {
      locationId: GHL_LOCATION_ID,
      firstName: lead.name.split(' ')[0] || lead.name,
      lastName: lead.name.split(' ').slice(1).join(' ') || '',
      email: lead.email || '',
      phone: lead.phone || '',
      companyName: lead.company || '',
      source: lead.source || 'website',
      tags: lead.interest || [],
      customFields: {
        budget: lead.budget || null,
        timeline: lead.timeline || null,
        score: lead.score || 0
      }
    };

    const response = await axios.post(
      `${GHL_API_URL}/contacts/`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log(`Synced lead to GoHighLevel (id: ${lead.id})`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ GoHighLevel sync failed:', error.response?.data || error.message);
    throw new Error(`GoHighLevel sync failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Sync lead to HubSpot
 */
async function syncToHubSpot(lead) {
  if (!HUBSPOT_API_KEY) {
    console.warn('⚠️ HubSpot API key not configured. Skipping sync.');
    return { success: false, message: 'HubSpot not configured' };
  }

  try {
    const payload = {
      properties: {
        firstname: lead.name.split(' ')[0] || lead.name,
        lastname: lead.name.split(' ').slice(1).join(' ') || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        hs_lead_status: lead.status || 'new',
        lifecyclestage: 'lead'
      }
    };

    const response = await axios.post(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log(`Synced lead to HubSpot (id: ${lead.id})`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ HubSpot sync failed:', error.response?.data || error.message);
    throw new Error(`HubSpot sync failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Sync lead to configured CRM (auto-detect which CRM is configured)
 */
async function syncToCRM(lead) {
  const results = [];

  if (GHL_API_KEY && GHL_LOCATION_ID) {
    try {
      const result = await syncToGoHighLevel(lead);
      results.push({ crm: 'GoHighLevel', ...result });
    } catch (error) {
      results.push({ crm: 'GoHighLevel', success: false, error: error.message });
    }
  }

  if (HUBSPOT_API_KEY) {
    try {
      const result = await syncToHubSpot(lead);
      results.push({ crm: 'HubSpot', ...result });
    } catch (error) {
      results.push({ crm: 'HubSpot', success: false, error: error.message });
    }
  }

  if (results.length === 0) {
    console.warn('⚠️ No CRM configured. Skipping sync.');
    return { success: false, message: 'No CRM configured' };
  }

  return results;
}

/**
 * Update lead in GoHighLevel
 */
async function updateGoHighLevelContact(contactId, updates) {
  if (!GHL_API_KEY) {
    console.warn('⚠️ GoHighLevel credentials not configured.');
    return { success: false, message: 'GoHighLevel not configured' };
  }

  try {
    const response = await axios.put(
      `${GHL_API_URL}/contacts/${contactId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log(`✅ Updated GoHighLevel contact: ${contactId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ GoHighLevel update failed:', error.response?.data || error.message);
    throw new Error(`GoHighLevel update failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Update lead in HubSpot
 */
async function updateHubSpotContact(contactId, updates) {
  if (!HUBSPOT_API_KEY) {
    console.warn('⚠️ HubSpot API key not configured.');
    return { success: false, message: 'HubSpot not configured' };
  }

  try {
    const payload = {
      properties: updates
    };

    const response = await axios.patch(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${contactId}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log(`✅ Updated HubSpot contact: ${contactId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ HubSpot update failed:', error.response?.data || error.message);
    throw new Error(`HubSpot update failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Webhook handler for GoHighLevel events
 */
function handleGoHighLevelWebhook(webhookData) {
  console.log('📥 Received GoHighLevel webhook:', webhookData.type);
  
  // Handle different webhook events
  switch (webhookData.type) {
    case 'ContactCreate':
      console.log('New contact created in GoHighLevel');
      // Sync back to Material Solutions if needed
      break;
    case 'ContactUpdate':
      console.log('Contact updated in GoHighLevel');
      break;
    case 'ContactDelete':
      console.log('Contact deleted in GoHighLevel');
      break;
    default:
      console.log('Unknown webhook type:', webhookData.type);
  }
  
  return { received: true };
}

/**
 * Webhook handler for HubSpot events
 */
function handleHubSpotWebhook(webhookData) {
  // HubSpot sends webhook payloads as an array of events
  const events = Array.isArray(webhookData) ? webhookData : [webhookData];

  console.log(`Received HubSpot webhook with ${events.length} event(s)`);

  for (const event of events) {
    console.log(`HubSpot event: ${event.subscriptionType} - objectId: ${event.objectId}`);
  }

  return { received: true };
}

module.exports = {
  syncToGoHighLevel,
  syncToHubSpot,
  syncToCRM,
  updateGoHighLevelContact,
  updateHubSpotContact,
  handleGoHighLevelWebhook,
  handleHubSpotWebhook
};
