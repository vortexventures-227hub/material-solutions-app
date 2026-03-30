/**
 * Website Platform
 * Direct database insert to MaterialSolutionsNJ.com
 */

const { BasePlatform, ValidationError } = require('./base');

class WebsitePlatform extends BasePlatform {
  constructor(config = {}, db) {
    super(config);
    this.platformName = 'website';
    this.db = db;
  }

  /**
   * Website is always available (direct DB)
   */
  async isAvailable() {
    return true; // Website is always available
  }

  /**
   * Post to website - direct database insert
   */
  async post(inventory, content) {
    return this.withRetry(async () => {
      // Validate inventory has required fields
      this.validateInventory(inventory);
      
      // Insert or update website listing
      const result = await this.db.query(`
        INSERT INTO inventory_seo (
          inventory_id,
          meta_title,
          meta_description,
          og_title,
          og_description,
          schema_json,
          faq_json,
          keywords,
          alt_texts
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (inventory_id) DO UPDATE SET
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          og_title = EXCLUDED.og_title,
          og_description = EXCLUDED.og_description,
          schema_json = EXCLUDED.schema_json,
          faq_json = EXCLUDED.faq_json,
          keywords = EXCLUDED.keywords,
          alt_texts = EXCLUDED.alt_texts,
          updated_at = NOW()
        RETURNING id
      `, [
        inventory.id,
        content.website?.meta_title || content.website?.title,
        content.website?.metaDescription,
        content.website?.og_title || content.website?.title,
        content.website?.ogDescription || content.website?.metaDescription,
        JSON.stringify(content.website?.schema || {}),
        JSON.stringify(content.website?.faq || []),
        content.website?.keywords || [],
        JSON.stringify(content.website?.alt_texts || {})
      ]);

      // Also create a listing record
      await this.db.query(`
        INSERT INTO inventory_listings (
          inventory_id,
          platform,
          external_id,
          status,
          content
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (inventory_id, platform) DO UPDATE SET
          status = 'active',
          content = EXCLUDED.content,
          updated_at = NOW()
      `, [
        inventory.id,
        'website',
        inventory.id.toString(),
        'active',
        JSON.stringify(content.website || {})
      ]);

      const url = `${process.env.WEBSITE_URL || 'https://materialsolutionsnj.com'}/inventory/${inventory.id}`;

      return this.buildResult(true, {
        url,
        externalId: inventory.id.toString()
      });
    }, 'post inventory to website');
  }

  async update(inventoryId, inventory, content) {
    return this.withRetry(async () => {
      await this.db.query(`
        UPDATE inventory_seo SET
          meta_title = $2,
          meta_description = $3,
          og_title = $4,
          og_description = $5,
          schema_json = $6,
          faq_json = $7,
          keywords = $8,
          alt_texts = $9,
          updated_at = NOW()
        WHERE inventory_id = $1
      `, [
        inventoryId,
        content.website?.meta_title || content.website?.title,
        content.website?.metaDescription,
        content.website?.og_title || content.website?.title,
        content.website?.ogDescription || content.website?.metaDescription,
        JSON.stringify(content.website?.schema || {}),
        JSON.stringify(content.website?.faq || []),
        content.website?.keywords || [],
        JSON.stringify(content.website?.alt_texts || {})
      ]);

      const url = `${process.env.WEBSITE_URL || 'https://materialsolutionsnj.com'}/inventory/${inventoryId}`;

      return this.buildResult(true, {
        url,
        externalId: inventoryId.toString()
      });
    }, 'update website listing');
  }

  async delete(inventoryId) {
    return this.withRetry(async () => {
      await this.db.query(`
        UPDATE inventory_listings SET
          status = 'deleted'
        WHERE inventory_id = $1 AND platform = 'website'
      `, [inventoryId]);

      return this.buildResult(true, { externalId: inventoryId.toString() });
    }, 'delete website listing');
  }

  async getStatus(inventoryId) {
    const result = await this.db.query(`
      SELECT status, posted_at, views, inquiries
      FROM inventory_listings
      WHERE inventory_id = $1 AND platform = 'website'
    `, [inventoryId]);

    if (result.rows.length === 0) {
      return { status: 'not_found' };
    }

    return result.rows[0];
  }

  validateInventory(inventory) {
    const required = ['id', 'make', 'model'];
    for (const field of required) {
      if (!inventory[field]) {
        throw new ValidationError(
          `Missing required field: ${field}`,
          this.platformName
        );
      }
    }
  }
}

module.exports = WebsitePlatform;
