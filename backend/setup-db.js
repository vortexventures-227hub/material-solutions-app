const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // Connect to postgres database to create our database
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: process.env.PGUSER || process.env.USER,
    password: process.env.PGPASSWORD || '',
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('📦 Creating database...');
    
    // Create database if it doesn't exist
    await adminClient.query('CREATE DATABASE material_solutions');
    console.log('✅ Database created');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database already exists');
    } else {
      throw error;
    }
  } finally {
    await adminClient.end();
  }

  // Connect to our new database and run schema
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('📋 Running schema...');
    
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema applied');
    
    // Create a test admin user
    const bcrypt = require('bcrypt');
    const testEmail = 'admin@test.com';
    const testPassword = 'password123';
    const passwordHash = await bcrypt.hash(testPassword, 12);
    
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [testEmail, passwordHash, 'Admin User', 'admin']
    );
    
    console.log('✅ Test admin user created');
    console.log('   Email: admin@test.com');
    console.log('   Password: password123');
    console.log('\n🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

setupDatabase().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
