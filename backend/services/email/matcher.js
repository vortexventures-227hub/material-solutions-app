/**
 * Lead-to-Inventory Matcher
 * Scores and matches leads to inventory units based on interest, budget, and intent
 */

const db = require('../db');

/**
 * Find matching inventory for a lead
 * @param {string} leadId
 * @returns {Promise<Array>} sorted inventory matches
 */
async function findMatchesForLead(leadId) {
  const leadRes = await db.query(
    `SELECT l.*,
            u.budget as lead_budget,
            u.interest,
            u.timeline
     FROM leads l
     LEFT JOIN LATERAL (
       SELECT budget, interest, timeline
       FROM leads
       WHERE id = l.id
     ) u ON true
     WHERE l.id = $1`,
    [leadId]
  );

  if (!leadRes.rows.length) return [];

  const lead = leadRes.rows[0];

  // Get active inventory
  const invRes = await db.query(
    `SELECT id, make, model, year, asking_price, hours, condition,
            capacity_lbs, mast_type, power_type, photos,
            created_at, updated_at
     FROM inventory
     WHERE status IN ('listed', 'reserved', 'pending')
     ORDER BY created_at DESC`
  );

  const inventory = invRes.rows;

  // Score each unit
  const scored = inventory.map(unit => ({
    unit,
    score: scoreUnitForLead(unit, lead),
    reasons: generateReasons(unit, lead),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5); // Top 5 matches
}

/**
 * Find leads to email about a specific inventory unit
 * @param {string} inventoryId
 * @returns {Promise<Array>} sorted lead matches
 */
async function findLeadsForInventory(inventoryId) {
  const invRes = await db.query(
    `SELECT * FROM inventory WHERE id = $1`,
    [inventoryId]
  );
  if (!invRes.rows.length) return [];

  const unit = invRes.rows[0];
  const unitPrice = parseFloat(unit.asking_price) || 0;

  // Get leads that haven't received this sequence yet
  const leadRes = await db.query(
    `SELECT l.*,
            es.id as sequence_id
     FROM leads l
     LEFT JOIN email_sequences es ON es.lead_id = l.id AND es.inventory_id = $1
     WHERE l.status IN ('new', 'contacted', 'engaged', 'qualified')
       AND es.id IS NULL
       AND l.email IS NOT NULL
     ORDER BY l.score DESC NULLS LAST, l.created_at DESC`,
    [inventoryId]
  );

  const leads = leadRes.rows;

  const scored = leads.map(lead => ({
    lead,
    score: scoreLeadForUnit(lead, unit, unitPrice),
    reasons: generateLeadReasons(lead, unit, unitPrice),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 20); // Top 20 leads
}

/**
 * Score a unit for a specific lead (higher = better match)
 */
function scoreUnitForLead(unit, lead) {
  let score = 50; // base score

  const budget = parseFloat(lead.budget || 0);
  const price = parseFloat(unit.asking_price || 0);

  // Budget fit (max 25 pts)
  if (budget > 0 && price > 0) {
    if (price <= budget) score += 25;
    else if (price <= budget * 1.2) score += 15;
    else if (price <= budget * 1.5) score += 5;
  }

  // Capacity match (max 15 pts)
  const leadCap = parseInt(lead.capacity_lbs || 0);
  const unitCap = parseInt(unit.capacity_lbs || 0);
  if (leadCap > 0 && unitCap > 0) {
    if (unitCap === leadCap) score += 15;
    else if (Math.abs(unitCap - leadCap) <= 500) score += 10;
    else if (Math.abs(unitCap - leadCap) <= 1000) score += 5;
  }

  // Power type (max 10 pts)
  if (lead.power_type && unit.power_type) {
    if (lead.power_type.toLowerCase() === unit.power_type.toLowerCase()) score += 10;
  }

  // Recency (max 5 pts)
  const daysSinceUpdated = Math.floor((Date.now() - new Date(unit.updated_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdated <= 7) score += 5;
  else if (daysSinceUpdated <= 30) score += 3;

  // Has photos (max 5 pts)
  if (unit.photos && unit.photos.length > 0) score += 5;

  return Math.min(score, 100); // Cap at 100
}

/**
 * Score a lead for a specific unit (higher = better match)
 */
function scoreLeadForUnit(lead, unit, unitPrice) {
  let score = 50;

  const budget = parseFloat(lead.budget || 0);

  // Budget fit
  if (budget > 0 && unitPrice > 0) {
    if (unitPrice <= budget) score += 25;
    else if (unitPrice <= budget * 1.2) score += 15;
    else if (unitPrice <= budget * 1.5) score += 5;
  }

  // Lead score
  if (lead.score) {
    score += Math.min(lead.score / 10, 20);
  }

  // Status (hotter leads = higher)
  const statusWeights = { hot: 15, qualified: 10, engaged: 7, contacted: 4, new: 2 };
  score += statusWeights[lead.status] || 0;

  // Has email
  if (lead.email) score += 5;

  return Math.min(score, 100);
}

/**
 * Generate human-readable reasons for a match
 */
function generateReasons(unit, lead) {
  const reasons = [];

  const budget = parseFloat(lead.budget || 0);
  const price = parseFloat(unit.asking_price || 0);

  if (budget > 0 && price > 0 && price <= budget) {
    reasons.push(`Within budget ($${price.toLocaleString()} ≤ $${budget.toLocaleString()})`);
  }

  const leadCap = parseInt(lead.capacity_lbs || 0);
  const unitCap = parseInt(unit.capacity_lbs || 0);
  if (leadCap > 0 && unitCap > 0 && Math.abs(unitCap - leadCap) <= 500) {
    reasons.push(`${unitCap.toLocaleString()} lbs capacity matches need`);
  }

  if (unit.hours && parseInt(unit.hours) <= 1000) {
    reasons.push('Low hour unit — desirable');
  }

  if (unit.photos && unit.photos.length > 0) {
    reasons.push('Has photos for email preview');
  }

  return reasons;
}

function generateLeadReasons(lead, unit, unitPrice) {
  const reasons = [];

  if (lead.status === 'hot' || lead.status === 'qualified') {
    reasons.push(`${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)} lead`);
  }

  if (lead.score && lead.score >= 70) {
    reasons.push(`High intent score (${lead.score})`);
  }

  if (lead.budget && unitPrice <= parseFloat(lead.budget)) {
    reasons.push('Unit fits within lead budget');
  }

  return reasons;
}

/**
 * Run the matcher for all unmatched leads (batch mode)
 * Called by the scheduler/orchestrator
 */
async function runBatchMatch() {
  const res = await db.query(
    `SELECT id FROM leads
     WHERE status IN ('new', 'contacted', 'engaged', 'qualified', 'hot')
       AND email IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM email_sequences es
         WHERE es.lead_id = leads.id
           AND es.sequence_status = 'active'
       )
     ORDER BY score DESC NULLS LAST
     LIMIT 100`
  );

  const results = [];
  for (const { id } of res.rows) {
    const matches = await findMatchesForLead(id);
    results.push({ leadId: id, matches });
  }

  return results;
}

module.exports = {
  findMatchesForLead,
  findLeadsForInventory,
  scoreUnitForLead,
  runBatchMatch,
};
