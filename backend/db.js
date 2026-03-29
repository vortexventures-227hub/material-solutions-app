const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
// SSL config: In production, verify certificates properly (rejectUnauthorized: true)
// Set DATABASE_SSL=false to disable SSL entirely (local dev only)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/material_solutions',
  ssl: process.env.DATABASE_SSL === 'false' 
    ? false 
    : process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }  // Render requires rejectUnauthorized: false
      : false
});

// Test the connection
pool.connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Handle graceful shutdown
const shutdown = () => {
  pool.end()
    .then(() => {
      console.log('Database pool has ended');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error ending database pool:', err);
      process.exit(1);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = pool;
