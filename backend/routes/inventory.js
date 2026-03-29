const express = require('express');
const router = express.Router();
const db = require('../db');
const { inventorySchema } = require('../validation/schemas');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

// Allowlist of valid column names for PATCH updates (SQL injection prevention)
const ALLOWED_INVENTORY_FIELDS = new Set([
  'make', 'model', 'year', 'serial', 'hours', 'capacity_lbs', 'mast_type',
  'lift_height_inches', 'power_type', 'battery_info', 'attachments',
  'condition_notes', 'condition_score', 'images', 'purchase_price',
  'listing_price', 'floor_price', 'ceiling_price', 'additional_context',
  'status', 'sold_at', 'sold_price'
]);

// POST / - Create inventory
router.post('/', async (req, res, next) => {
  try {
    // Validate input
    const validatedData = inventorySchema.parse(req.body);
    
    const {
      make, model, year, serial, hours, capacity_lbs, mast_type,
      lift_height_inches, power_type, battery_info, attachments,
      condition_notes, images, purchase_price, additional_context
    } = validatedData;
    const result = await db.query(
      `INSERT INTO inventory (
        make, model, year, serial, hours, capacity_lbs, mast_type,
        lift_height_inches, power_type, battery_info, attachments,
        condition_notes, images, purchase_price, additional_context
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [make, model, year, serial, hours, capacity_lbs, mast_type,
       lift_height_inches, power_type, battery_info, JSON.stringify(attachments || []),
       condition_notes, JSON.stringify(images || []), purchase_price, additional_context]
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
  const { status } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  try {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
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
    
    const values = fields.map(f => validatedData[f]);
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
