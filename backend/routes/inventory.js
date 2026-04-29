const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const db = require('../db');
const { inventorySchema } = require('../validation/schemas');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

const DEFAULT_MEDIA_ROOT = path.join(__dirname, '..', 'uploads', 'inventory');
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_MEDIA_FILES_PER_REQUEST = 12;
const MAX_MEDIA_BYTES_PER_FILE = 10 * 1024 * 1024;

// Allowlist of valid column names for PATCH updates (SQL injection prevention)
const ALLOWED_INVENTORY_FIELDS = new Set([
  'make', 'model', 'year', 'serial', 'hours', 'capacity_lbs', 'mast_type',
  'lift_height_inches', 'power_type', 'battery_info', 'attachments',
  'condition_notes', 'condition_score', 'images', 'purchase_price',
  'listing_price', 'floor_price', 'additional_context',
  'status', 'sold_at', 'sold_price'
]);

function getMediaRoot() {
  return process.env.FSM_INVENTORY_MEDIA_ROOT || DEFAULT_MEDIA_ROOT;
}

function sanitizeFileSegment(value) {
  return String(value || 'inventory-media')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'inventory-media';
}

function getExtensionFromContentType(contentType) {
  return {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  }[contentType] || '.jpg';
}

function decodeMediaFile(file) {
  const contentType = String(file.content_type || file.contentType || '').toLowerCase();
  if (!ALLOWED_MEDIA_TYPES.has(contentType)) {
    const error = new Error(`Unsupported media type: ${contentType || 'missing'}`);
    error.status = 400;
    throw error;
  }

  const rawPayload = String(file.base64 || file.data_url || file.dataUrl || '');
  const base64 = rawPayload.includes(',') ? rawPayload.split(',').pop() : rawPayload;
  const buffer = Buffer.from(base64, 'base64');

  if (!buffer.length || buffer.length > MAX_MEDIA_BYTES_PER_FILE) {
    const error = new Error('Invalid media payload size');
    error.status = 400;
    throw error;
  }

  return { buffer, contentType };
}

function normalizeImagesForMerge(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function buildMediaPublicUrl(req, inventoryId, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/inventory/${encodeURIComponent(inventoryId)}/${encodeURIComponent(filename)}`;
}

// POST / - Create inventory
router.post('/', async (req, res, next) => {
  try {
    // Validate input
    const validatedData = inventorySchema.parse(req.body);
    
    const {
      make, model, year, serial, hours, capacity_lbs, mast_type,
      lift_height_inches, power_type, battery_info, attachments,
      condition_notes, condition_score, images, purchase_price,
      listing_price, floor_price, status, additional_context
    } = validatedData;
    const result = await db.query(
      `INSERT INTO inventory (
        make, model, year, serial, hours, capacity_lbs, mast_type,
        lift_height_inches, power_type, battery_info, attachments,
        condition_notes, condition_score, images, purchase_price,
        listing_price, floor_price, status, additional_context
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [make, model, year, serial, hours, capacity_lbs, mast_type,
       lift_height_inches, power_type, battery_info, JSON.stringify(attachments || []),
       condition_notes, condition_score, JSON.stringify(images || []), purchase_price,
       listing_price, floor_price, status, additional_context]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating inventory:', error);
    next(error);
  }
});

// GET / - List inventory with optional status filter and pagination
router.get('/', async (req, res, next) => {
  const { status, q, make, model, serial } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  try {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (make) {
      params.push(`%${make}%`);
      conditions.push(`make ILIKE $${params.length}`);
    }

    if (model) {
      params.push(`%${model}%`);
      conditions.push(`model ILIKE $${params.length}`);
    }

    if (serial) {
      params.push(`%${serial}%`);
      conditions.push(`serial ILIKE $${params.length}`);
    }

    if (q) {
      params.push(`%${q}%`);
      const searchParamIndex = params.length;
      conditions.push(`(
        make ILIKE $${searchParamIndex} OR
        model ILIKE $${searchParamIndex} OR
        serial ILIKE $${searchParamIndex} OR
        status ILIKE $${searchParamIndex}
      )`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM inventory ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM inventory ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json(paginatedResponse(result.rows, total, page, limit));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    next(error);
  }
});

// GET /:id - Get single inventory by ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    next(error);
  }
});

// POST /:id/media - Store real inventory image bytes and merge public URLs onto the row
router.post('/:id/media', async (req, res, next) => {
  const { id } = req.params;
  const files = Array.isArray(req.body?.files) ? req.body.files : [];

  if (files.length === 0 || files.length > MAX_MEDIA_FILES_PER_REQUEST) {
    return res.status(400).json({ error: `Provide 1-${MAX_MEDIA_FILES_PER_REQUEST} media files` });
  }

  try {
    const existing = await db.query('SELECT id, images FROM inventory WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    const inventoryId = sanitizeFileSegment(id);
    const targetDir = path.join(getMediaRoot(), inventoryId);
    await fs.mkdir(targetDir, { recursive: true });

    const savedImages = [];
    for (const [index, file] of files.entries()) {
      const { buffer, contentType } = decodeMediaFile(file);
      const originalName = sanitizeFileSegment(file.filename || file.name || `photo-${index + 1}`);
      const extension = path.extname(originalName) || getExtensionFromContentType(contentType);
      const basename = path.basename(originalName, path.extname(originalName));
      const filename = `${Date.now()}-${index + 1}-${basename}${extension}`;
      const targetPath = path.join(targetDir, filename);

      await fs.writeFile(targetPath, buffer);
      savedImages.push(buildMediaPublicUrl(req, inventoryId, filename));
    }

    const priorImages = normalizeImagesForMerge(existing.rows[0].images);
    const mergedImages = [...priorImages, ...savedImages];
    const updated = await db.query(
      'UPDATE inventory SET images = $2 WHERE id = $1 RETURNING *',
      [id, JSON.stringify(mergedImages)]
    );

    return res.status(201).json({
      inventory: updated.rows[0],
      savedImages,
      mediaRoot: getMediaRoot(),
      publicPathPrefix: `/uploads/inventory/${inventoryId}/`,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error storing inventory media:', error);
    next(error);
  }
});

// PATCH /:id - Update inventory
router.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  
  try {
    // Validate input (partial validation for PATCH)
    const validatedData = inventorySchema.partial().parse(req.body);
    
    // Filter to only allowed fields (SQL injection prevention)
    const fields = Object.keys(validatedData).filter(f => ALLOWED_INVENTORY_FIELDS.has(f));
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const values = fields.map((field) => {
      const value = validatedData[field];
      if (field === 'images' || field === 'attachments') {
        return JSON.stringify(value || []);
      }
      return value;
    });
    const setClause = fields.map((field, i) => `"${field}" = $${i + 2}`).join(', ');
    
    const result = await db.query(
      `UPDATE inventory SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating inventory:', error);
    next(error);
  }
});

// DELETE /:id - Delete inventory
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    res.json({ message: 'Inventory deleted', inventory: result.rows[0] });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    next(error);
  }
});

module.exports = router;
