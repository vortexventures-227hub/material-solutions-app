const { createFsmLead } = require('../../lib/fsmBackend');

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (String(value).trim().startsWith('+') && digits.length >= 10) return String(value).trim();
  return undefined;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company, service, message, inventory } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const interest = [
    service,
    inventory ? `Inventory: ${inventory}` : null,
    message,
  ].filter(Boolean);
  const payload = {
    name,
    email,
    company: company || undefined,
    phone: normalizePhone(phone),
    source: 'website',
    interest,
  };

  try {
    const lead = await createFsmLead(payload);
    return res.status(201).json({ lead, syncedToForkliftSalesMachine: true });
  } catch (error) {
    return res.status(error.status || 502).json({
      error: 'Lead could not be synced to the Forklift Sales Machine',
      detail: error.message,
      syncedToForkliftSalesMachine: false,
    });
  }
}
