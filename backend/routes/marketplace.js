const express = require('express');
const router = express.Router();
const { publishToMarketplaces, getListingsForInventory } = require('../services/marketplace');

// POST /api/inventory/:id/publish - Publish inventory item to marketplaces
router.post('/:id/publish', async (req, res, next) => {
  const { id } = req.params;

  try {
    const { listings, content } = await publishToMarketplaces(id);

    res.status(201).json({
      status: 'success',
      listings,
      content: {
        title: content.title,
        meta_description: content.meta_description,
        tags: content.tags,
      },
    });
  } catch (error) {
    if (error.message === 'Inventory item not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Item already has active marketplace listings') {
      return res.status(409).json({ error: error.message });
    }
    console.error('[Marketplace] Publish error:', error);
    next(error);
  }
});

// GET /api/inventory/:id/listings - Get marketplace listings for an inventory item
router.get('/:id/listings', async (req, res, next) => {
  const { id } = req.params;

  try {
    const listings = await getListingsForInventory(id);
    res.json({ listings });
  } catch (error) {
    console.error('[Marketplace] Fetch listings error:', error);
    next(error);
  }
});

module.exports = router;
