const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'retail_accounting',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 60000,
  ssl: false
});

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully to VPS:', process.env.DB_HOST);
    console.log('📊 Database:', process.env.DB_NAME);
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed to VPS:', error.message);
    console.error('🔧 Check VPS firewall and PostgreSQL configuration');
  }
}

module.exports = { pool, testConnection };
