// backend/scripts/seed.js
const db = require('../db');

const forkliftRecords = [
  {
    make: 'Raymond',
    model: '7400 Reach Truck',
    year: 2019,
    serial: 'RAY7400-2019-001',
    hours: 2400,
    capacity_lbs: 3500,
    mast_type: 'Tri-Stage',
    lift_height_inches: 240,
    power_type: 'electric',
    battery_info: '36V, 2 years old',
    attachments: ['sideshifter'],
    condition_score: 8,
    condition_notes: 'Excellent condition, low hours, recent battery replacement',
    purchase_price: 22000,
    listing_price: 28500,
    floor_price: 27500,
    status: 'listed'
  },
  {
    make: 'Toyota',
    model: '8FGCU25 Sit-Down',
    year: 2016,
    serial: 'TOY8FG-2016-045',
    hours: 6800,
    capacity_lbs: 5000,
    mast_type: 'Dual-Stage',
    lift_height_inches: 189,
    power_type: 'propane',
    battery_info: null,
    attachments: [],
    condition_score: 7,
    condition_notes: 'Good working condition, standard wear for hours',
    purchase_price: 14000,
    listing_price: 18900,
    floor_price: 17500,
    status: 'listed'
  },
  {
    make: 'Crown',
    model: 'RC 5500 Reach Truck',
    year: 2021,
    serial: 'CRN5500-2021-102',
    hours: 1500,
    capacity_lbs: 4000,
    mast_type: 'Tri-Stage',
    lift_height_inches: 228,
    power_type: 'electric',
    battery_info: '48V, 1 year old',
    attachments: ['sideshifter', 'fork positioner'],
    condition_score: 9,
    condition_notes: 'Like new, minimal hours, full warranty remaining',
    purchase_price: 32000,
    listing_price: 42000,
    floor_price: 40000,
    status: 'listed'
  },
  {
    make: 'Raymond',
    model: '8410 Order Picker',
    year: 2017,
    serial: 'RAY8410-2017-078',
    hours: 4200,
    capacity_lbs: 2500,
    mast_type: 'Dual-Stage',
    lift_height_inches: 192,
    power_type: 'electric',
    battery_info: '24V, 3 years old',
    attachments: [],
    condition_score: 7,
    condition_notes: 'Solid performer, some cosmetic wear',
    purchase_price: 13500,
    listing_price: 17500,
    floor_price: 16875,
    status: 'listed'
  },
  {
    make: 'Hyster',
    model: 'N40XMR3 Swing Reach',
    year: 2020,
    serial: 'HYS-N40X-2020-055',
    hours: 2800,
    capacity_lbs: 4000,
    mast_type: 'Quad-Stage',
    lift_height_inches: 240,
    power_type: 'electric',
    battery_info: '80V, 1 year old',
    attachments: ['sideshifter', 'reach extension'],
    condition_score: 8,
    condition_notes: 'Very good condition, rare swing reach model',
    purchase_price: 48000,
    listing_price: 64000,
    floor_price: 60000,
    status: 'reserved'
  },
  {
    make: 'Yale',
    model: 'ERC050 Reach Truck',
    year: 2015,
    serial: 'YALE-ERC-2015-234',
    hours: 8500,
    capacity_lbs: 5000,
    mast_type: 'Tri-Stage',
    lift_height_inches: 216,
    power_type: 'electric',
    battery_info: '36V, 5 years old',
    attachments: [],
    condition_score: 6,
    condition_notes: 'Higher hours but well maintained, battery needs replacement soon',
    purchase_price: 11000,
    listing_price: 14500,
    floor_price: 13750,
    status: 'listed'
  },
  {
    make: 'Crown',
    model: 'SP 3400 Order Picker',
    year: 2018,
    serial: 'CRN-SP34-2018-189',
    hours: 3600,
    capacity_lbs: 3000,
    mast_type: 'Tri-Stage',
    lift_height_inches: 204,
    power_type: 'electric',
    battery_info: '36V, 2 years old',
    attachments: ['platform guard'],
    condition_score: 8,
    condition_notes: 'Clean unit, ideal for warehouse picking',
    purchase_price: 15000,
    listing_price: 19500,
    floor_price: 18750,
    status: 'listed'
  },
  {
    make: 'Toyota',
    model: '7FBCU55 Sit-Down',
    year: 2014,
    serial: 'TOY7FB-2014-321',
    hours: 9200,
    capacity_lbs: 5000,
    mast_type: 'Dual-Stage',
    lift_height_inches: 180,
    power_type: 'electric',
    battery_info: '48V, 4 years old',
    attachments: [],
    condition_score: 5,
    condition_notes: 'High hours, budget option for light duty',
    purchase_price: 9500,
    listing_price: 12500,
    floor_price: 11875,
    status: 'sold',
    sold_at: new Date('2026-03-15'),
    sold_price: 12000
  },
  {
    make: 'Raymond',
    model: '7500 Reach Truck',
    year: 2022,
    serial: 'RAY7500-2022-008',
    hours: 1100,
    capacity_lbs: 4000,
    mast_type: 'Quad-Stage',
    lift_height_inches: 240,
    power_type: 'electric',
    battery_info: '48V, under 1 year',
    attachments: ['sideshifter', 'fork positioner', 'camera system'],
    condition_score: 9,
    condition_notes: 'Nearly new, premium features, low hours',
    purchase_price: 38000,
    listing_price: 52000,
    floor_price: 47500,
    status: 'pending'
  },
  {
    make: 'Crown',
    model: 'TSP 6000 Turret Truck',
    year: 2019,
    serial: 'CRN-TSP-2019-044',
    hours: 3200,
    capacity_lbs: 3000,
    mast_type: 'Tri-Stage',
    lift_height_inches: 228,
    power_type: 'electric',
    battery_info: '48V, 2 years old',
    attachments: ['turret head', 'wire guidance'],
    condition_score: 8,
    condition_notes: 'Specialized turret truck, ideal for narrow aisles',
    purchase_price: 42000,
    listing_price: 58000,
    floor_price: 52500,
    status: 'listed'
  },
  {
    make: 'Hyster',
    model: 'S50FT Sit-Down',
    year: 2013,
    serial: 'HYS-S50F-2013-456',
    hours: 11200,
    capacity_lbs: 5000,
    mast_type: 'Dual-Stage',
    lift_height_inches: 189,
    power_type: 'propane',
    battery_info: null,
    attachments: [],
    condition_score: 4,
    condition_notes: 'High hours, runs well but shows age, bargain pricing',
    purchase_price: 7500,
    listing_price: 10500,
    floor_price: 9375,
    status: 'sold',
    sold_at: new Date('2026-03-20'),
    sold_price: 9800
  },
  {
    make: 'Yale',
    model: 'MPB045 Order Picker',
    year: 2020,
    serial: 'YALE-MPB-2020-077',
    hours: 2100,
    capacity_lbs: 4500,
    mast_type: 'Tri-Stage',
    lift_height_inches: 216,
    power_type: 'electric',
    battery_info: '36V, 1 year old',
    attachments: ['platform guard', 'sideshifter'],
    condition_score: 8,
    condition_notes: 'Low hours, excellent for high-level picking',
    purchase_price: 18500,
    listing_price: 24500,
    floor_price: 23125,
    status: 'listed'
  },
  {
    make: 'Raymond',
    model: '4250 Sit-Down',
    year: 2021,
    serial: 'RAY4250-2021-034',
    hours: 1800,
    capacity_lbs: 4500,
    mast_type: 'Tri-Stage',
    lift_height_inches: 198,
    power_type: 'electric',
    battery_info: '48V, under 1 year',
    attachments: ['sideshifter'],
    condition_score: 9,
    condition_notes: 'Excellent condition, low hours, popular model',
    purchase_price: 28000,
    listing_price: 38000,
    floor_price: 35000,
    status: 'reserved'
  },
  {
    make: 'Toyota',
    model: '8FBCHU25 Reach Truck',
    year: 2017,
    serial: 'TOY8FBC-2017-167',
    hours: 5400,
    capacity_lbs: 4000,
    mast_type: 'Tri-Stage',
    lift_height_inches: 210,
    power_type: 'electric',
    battery_info: '36V, 3 years old',
    attachments: ['sideshifter'],
    condition_score: 7,
    condition_notes: 'Good working order, reliable Toyota quality',
    purchase_price: 16000,
    listing_price: 21500,
    floor_price: 20000,
    status: 'listed'
  },
  {
    make: 'Crown',
    model: 'WP 2300 Pallet Jack',
    year: 2018,
    serial: 'CRN-WP23-2018-299',
    hours: 4800,
    capacity_lbs: 4500,
    mast_type: 'Walk-Behind',
    lift_height_inches: 7,
    power_type: 'electric',
    battery_info: '24V, 2 years old',
    attachments: [],
    condition_score: 7,
    condition_notes: 'Reliable walkie pallet jack, good battery',
    purchase_price: 4500,
    listing_price: 6500,
    floor_price: 5625,
    status: 'sold',
    sold_at: new Date('2026-03-25'),
    sold_price: 6200
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing inventory
    await db.query('DELETE FROM inventory');
    console.log('✅ Cleared existing inventory records\n');

    // Insert all forklift records
    for (let i = 0; i < forkliftRecords.length; i++) {
      const forklift = forkliftRecords[i];
      
      const query = `
        INSERT INTO inventory (
          make, model, year, serial, hours, capacity_lbs,
          mast_type, lift_height_inches, power_type, battery_info,
          attachments, condition_score, condition_notes,
          purchase_price, listing_price, floor_price, status,
          sold_at, sold_price
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING id
      `;

      const result = await db.query(query, [
        forklift.make,
        forklift.model,
        forklift.year,
        forklift.serial,
        forklift.hours,
        forklift.capacity_lbs,
        forklift.mast_type,
        forklift.lift_height_inches,
        forklift.power_type,
        forklift.battery_info,
        JSON.stringify(forklift.attachments),
        forklift.condition_score,
        forklift.condition_notes,
        forklift.purchase_price,
        forklift.listing_price,
        forklift.floor_price,
        forklift.status,
        forklift.sold_at || null,
        forklift.sold_price || null
      ]);

      console.log(`✅ Created: ${forklift.year} ${forklift.make} ${forklift.model} (${forklift.status}) - ID: ${result.rows[0].id}`);
    }

    console.log(`\n🎉 Successfully seeded ${forkliftRecords.length} forklift records!`);
    console.log(`\n📊 Status breakdown:`);
    console.log(`   - Listed: ${forkliftRecords.filter(f => f.status === 'listed').length}`);
    console.log(`   - Reserved: ${forkliftRecords.filter(f => f.status === 'reserved').length}`);
    console.log(`   - Pending: ${forkliftRecords.filter(f => f.status === 'pending').length}`);
    console.log(`   - Sold: ${forkliftRecords.filter(f => f.status === 'sold').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
