const fs = require('fs');
const path = require('path');
const db = require('../db');

async function main() {
  const migrationPath = path.join(
    __dirname,
    '..',
    'migrations',
    '008_phase6c_publish_schema_repair.sql'
  );
  const sql = fs.readFileSync(migrationPath, 'utf8');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to apply the Phase 6C publish schema repair');
  }

  await db.query(sql);
  console.log('Phase 6C publish schema repair applied');
}

main()
  .catch((error) => {
    console.error('Failed to apply Phase 6C publish schema repair:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (typeof db.end === 'function') {
      await db.end();
    }
  });
