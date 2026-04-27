/**
 * MarketplaceOrchestrator — safe placeholder until real platform integrations land.
 *
 * The legacy marketplace route imports this class at server boot. Keeping this
 * stub committed lets the API start while the newer /api/publish defensive route
 * owns the current publish-proof path.
 */
class MarketplaceOrchestrator {
  constructor(db) {
    this.db = db;
  }

  async initialize() {
    // no-op until real platform adapters are wired.
  }

  async publish(_inventoryId, { platforms = ['website'] } = {}) {
    const jobId = globalThis.crypto.randomUUID();
    return {
      jobId,
      platforms: Object.fromEntries(platforms.map((platform) => [platform, { status: 'queued' }])),
    };
  }

  async republish(_inventoryId, platform) {
    const jobId = globalThis.crypto.randomUUID();
    return {
      jobId,
      platforms: { [platform]: { status: 'queued' } },
    };
  }

  async getStats() {
    return { totalListings: 0, activePlatforms: 0, publishedToday: 0 };
  }
}

module.exports = MarketplaceOrchestrator;
