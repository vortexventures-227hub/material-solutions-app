const { fetchFsmInventory } = require('../../lib/fsmBackend');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await fetchFsmInventory({
      status: req.query.status || 'listed',
      q: req.query.q,
      page: req.query.page,
      limit: req.query.limit || 100,
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 502).json({
      error: 'FSM inventory unavailable',
      detail: error.message,
      degraded: true,
      items: [],
      total: 0,
    });
  }
}
