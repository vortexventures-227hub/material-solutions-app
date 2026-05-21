const {
  fetchFsmPublishStatus,
  publishFsmInventory,
} = require('../../../../lib/fsmBackend');

function isAuthorized(req) {
  const expected = process.env.FSM_PUBLISH_BRIDGE_TOKEN;
  return Boolean(expected && req.headers['x-fsm-publish-token'] === expected);
}

export default async function handler(req, res) {
  const { inventoryId } = req.query;

  if (req.method === 'GET') {
    try {
      const status = await fetchFsmPublishStatus(inventoryId);
      return res.status(200).json({
        source: 'forklift-sales-machine',
        status,
      });
    } catch (error) {
      return res.status(error.status || 502).json({
        error: 'Forklift Sales Machine publish status unavailable',
        detail: error.message,
        source: 'forklift-sales-machine',
      });
    }
  }

  if (req.method === 'POST') {
    if (!isAuthorized(req)) {
      return res.status(403).json({
        error: 'Publish Button bridge is not enabled for this storefront request',
        source: 'forklift-sales-machine',
      });
    }

    try {
      const result = await publishFsmInventory(inventoryId, req.body || {});
      return res.status(200).json({
        source: 'forklift-sales-machine',
        result,
      });
    } catch (error) {
      return res.status(error.status || 502).json({
        error: 'Forklift Sales Machine publish request failed',
        detail: error.message,
        source: 'forklift-sales-machine',
      });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
