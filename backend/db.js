const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
// SSL config: Render requires rejectUnauthorized: false
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/material_solutions',
  ssl: process.env.DATABASE_SSL === 'false' 
    ? false 
    : process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : false
});

// Lazy connection test - only on first query, not on startup
let connected = false;
const originalQuery = pool.query.bind(pool);
pool.query = async (...args) => {
  if (!connected) {
    try {
      await pool.connect();
      console.log('✅ Database connected');
      connected = true;
    } catch (err) {
      console.error('❌ Database connection error:', err.message);
      // Don't exit - let the query fail naturally
    }
  }
  return originalQuery(...args);
};

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
