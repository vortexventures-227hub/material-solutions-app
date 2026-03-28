const { z } = require('zod');

const inventorySchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  serial: z.string().max(50).optional(),
  hours: z.number().int().min(0).max(100000).optional(),
  capacity_lbs: z.number().int().min(0).max(50000).optional(),
  mast_type: z.string().max(50).optional(),
  lift_height_inches: z.number().int().min(0).max(600).optional(),
  power_type: z.enum(['electric', 'propane', 'diesel', 'gas']).optional(),
  battery_info: z.string().max(200).optional(),
  attachments: z.array(z.string()).optional(),
  condition_score: z.number().int().min(1).max(10).optional(),
  condition_notes: z.string().max(2000).optional(),
  purchase_price: z.number().min(0).max(500000).optional(),
  listing_price: z.number().min(0).max(500000).optional(),
  floor_price: z.number().min(0).max(500000).optional(),
  additional_context: z.string().max(5000).optional(),
  status: z.enum(['intake', 'listed', 'reserved', 'pending', 'sold', 'archived']).optional(),
  images: z.array(z.string()).optional(),
});

const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  company: z.string().max(200).optional(),
  source: z.enum(['website', 'facebook', 'craigslist', 'referral', 'cold_outreach']).optional(),
  interest: z.array(z.string()).optional(),
  budget: z.number().min(0).max(1000000).optional(),
  timeline: z.string().max(100).optional(),
  is_decision_maker: z.boolean().optional(),
});

module.exports = {
  inventorySchema,
  leadSchema,
};
