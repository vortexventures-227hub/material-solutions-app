/**
 * Email Sequence Builder
 * Generates 3-email drip sequences for lead → inventory pairs
 */

const { buildSubject, buildBody } = require('./templateBuilder');

// ─── Sequence Definitions ────────────────────────────────────────

const SEQUENCES = {
  /**
   * Standard forklift drip — 3 emails over 10 days
   */
  standard: {
    name: 'Standard Forklift Drip',
    steps: [
      {
        day: 0,
        delayHours: 0,
        subject: '{{{inventory_title}}} — {{{lead_name}}}, still available',
        template: 'intro',
        subjectOverride: null,
      },
      {
        day: 3,
        delayHours: 72,
        subject: 'Re: {{{inventory_title}}} — {{{lead_name}}}, specs that matter',
        template: 'specs',
        subjectOverride: null,
      },
      {
        day: 10,
        delayHours: 240,
        subject: '{{{lead_name}}}, is this the right fit?',
        template: 'closing',
        subjectOverride: null,
      },
    ],
  },

  /**
   * Hot lead — faster cadence, more urgent
   */
  hotLead: {
    name: 'Hot Lead Fast Drip',
    steps: [
      { day: 0, delayHours: 0, subject: 'Immediate availability — {{{inventory_title}}}', template: 'intro_hot', subjectOverride: null },
      { day: 2, delayHours: 48, subject: 'Brief update — {{{inventory_title}}}', template: 'specs_hot', subjectOverride: null },
      { day: 5, delayHours: 120, subject: 'Final call — {{{inventory_title}}} closing soon?', template: 'closing_hot', subjectOverride: null },
    ],
  },

  /**
   * Budget-conscious — emphasize value and financing options
   */
  budget: {
    name: 'Budget-Conscious Drip',
    steps: [
      { day: 0, delayHours: 0, subject: 'Great news, {{{lead_name}}} — {{{inventory_title}}} pricing adjusted', template: 'intro_budget', subjectOverride: null },
      { day: 4, delayHours: 96, subject: 'Financing options on {{{inventory_title}}}', template: 'specs_budget', subjectOverride: null },
      { day: 12, delayHours: 288, subject: 'Final opportunity, {{{lead_name}}}', template: 'closing_budget', subjectOverride: null },
    ],
  },
};

/**
 * Build the full sequence for a lead-inventory pair
 * @param {Object} opts
 * @param {string} opts.leadId
 * @param {string} opts.inventoryId
 * @param {string} opts.sequenceType - 'standard' | 'hotLead' | 'budget'
 * @param {Object} opts.lead - lead data object
 * @param {Object} opts.unit - inventory data object
 */
async function buildSequence({ leadId, inventoryId, sequenceType = 'standard', lead, unit }) {
  const sequence = SEQUENCES[sequenceType] || SEQUENCES.standard;
  const startTime = new Date();

  const steps = sequence.steps.map((step, index) => {
    const scheduledAt = new Date(startTime.getTime() + step.delayHours * 60 * 60 * 1000);

    return {
      stepNumber: index + 1,
      subject: interpolateSubject(step.subject, lead, unit),
      template: step.template,
      scheduledAt,
      status: 'pending',
    };
  });

  return {
    sequenceId: `seq_${leadId}_${inventoryId}_${Date.now()}`,
    leadId,
    inventoryId,
    sequenceType,
    totalSteps: steps.length,
    steps,
    status: 'active',
  };
}

/**
 * Build a single email for a sequence step
 */
async function buildEmailForStep({ sequence, stepIndex, lead, unit }) {
  const step = sequence.steps[stepIndex];
  const { subject, html, text } = await buildBody({
    template: step.template,
    lead,
    unit,
    subject: step.subject,
  });

  return {
    to: lead.email,
    from: process.env.COMPANY_EMAIL || 'sales@materialsolutions.com',
    fromName: 'Material Solutions',
    subject,
    html,
    text,
    scheduledAt: step.scheduledAt,
    stepNumber: step.stepNumber,
    sequenceId: sequence.sequenceId,
    mergeTags: {
      lead_name: lead.name,
      lead_email: lead.email,
      inventory_title: `${unit.year} ${unit.make} ${unit.model}`,
      inventory_price: `$${parseFloat(unit.asking_price || 0).toLocaleString()}`,
      inventory_url: `${process.env.FRONTEND_URL || 'https://app.materialsolutionsnj.com'}/inventory/${unit.id}`,
      company_name: 'Material Solutions',
      company_phone: '+1-800-555-0199',
    },
  };
}

/**
 * Simple subject interpolation
 */
function interpolateSubject(template, lead, unit) {
  return template
    .replace('{{{lead_name}}}', lead?.name?.split(' ')[0] || 'there')
    .replace('{{{inventory_title}}}', `${unit?.year || ''} ${unit?.make || ''} ${unit?.model || ''}`.trim());
}

/**
 * Determine best sequence type based on lead/inventory signals
 */
function selectSequenceType(lead, unit) {
  const leadScore = lead.score || 0;
  const unitPrice = parseFloat(unit?.asking_price || 0);
  const leadBudget = parseFloat(lead?.budget || 0);
  const priceDiff = leadBudget > 0 ? (unitPrice - leadBudget) / leadBudget : 0;

  // Hot leads get fast cadence
  if (lead.status === 'hot' || leadScore >= 80) return 'hotLead';

  // Budget-conscious buyers get budget sequence
  if (priceDiff > 0.15 || leadBudget < unitPrice * 0.9) return 'budget';

  // Default
  return 'standard';
}

module.exports = {
  buildSequence,
  buildEmailForStep,
  selectSequenceType,
  SEQUENCES,
};
