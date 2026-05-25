const { fetchFsmPublishPayload } = require('../../../../lib/fsmBackend');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await fetchFsmPublishPayload(req.query.inventoryId);
    return res.status(200).json({
      source: 'forklift-sales-machine',
      payload,
    });
  } catch (error) {
    return res.status(error.status || 502).json({
      error: 'Forklift Sales Machine publish payload unavailable',
      detail: error.message,
      source: 'forklift-sales-machine',
    });
  }
}
