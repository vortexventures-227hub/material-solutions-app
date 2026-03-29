const db = require('../db');
const { sendNewLeadNotification } = require('./email');
const { syncToCRM } = require('./crm');

/**
 * Signal Monitor Service
 * Handles incoming signals from Trigify, Apollo, etc.
 * and converts them into leads.
 */
const signalMonitor = {
  /**
   * Process a signal from Trigify
   * @param {Object} data - Trigify webhook payload
   */
  async processTrigifySignal(data) {
    console.log('[Signal Monitor] Processing Trigify signal:', data);
    
    // Transform Trigify payload to Lead
    const leadData = {
      name: data.person_name || data.name || 'Unknown',
      email: data.person_email || data.email || '',
      phone: data.person_phone || data.phone || '',
      company: data.company_name || data.company || 'Unknown',
      source: 'cold_outreach',
      interest: data.signals || ['Trigify Signal'],
      notes: `Trigify Signal: ${data.event_type || 'Notification'}. Details: ${JSON.stringify(data)}`,
      status: 'new'
    };

    return this.createLeadFromSignal(leadData);
  },

  /**
   * Process a signal from Apollo
   * @param {Object} data - Apollo webhook payload
   */
  async processApolloSignal(data) {
    console.log('[Signal Monitor] Processing Apollo signal:', data);
    
    // Transform Apollo payload to Lead
    const leadData = {
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown',
      email: data.email || '',
      phone: data.phone_numbers?.[0] || '',
      company: data.organization?.name || 'Unknown',
      source: 'cold_outreach',
      interest: ['Apollo Signal'],
      notes: `Apollo Signal. Title: ${data.title}. Details: ${JSON.stringify(data)}`,
      status: 'new'
    };

    return this.createLeadFromSignal(leadData);
  },

  /**
   * Core logic to insert lead from any signal source
   * @param {Object} leadData - Formatted lead data
   */
  async createLeadFromSignal(leadData) {
    const { name, email, phone, company, source, interest, notes, status } = leadData;

    try {
      const result = await db.query(
        `INSERT INTO leads (
          name, email, phone, company, source, interest, notes, status, score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [name, email, phone, company, source, JSON.stringify(interest), notes, status, 10] // Start with base score for signals
      );

      const newLead = result.rows[0];
      console.log(`[Signal Monitor] Created lead from signal: ${newLead.id} (${newLead.name})`);

      // Trigger standard notifications and CRM sync
      Promise.all([
        sendNewLeadNotification(newLead).catch(err => console.error('Email notification failed:', err)),
        syncToCRM(newLead).catch(err => console.error('CRM sync failed:', err))
      ]);

      return newLead;
    } catch (error) {
      console.error('[Signal Monitor] Lead creation failed:', error);
      throw error;
    }
  }
};

module.exports = signalMonitor;
