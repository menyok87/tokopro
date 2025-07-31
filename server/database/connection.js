const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '38.54.122.192',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'MNXfamilyTeam#123',
  database: process.env.DB_NAME || 'retail_accounting',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: false
};

const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to VPS:', process.env.DB_HOST);
    console.log('📊 Database:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed to VPS:', error.message);
    console.error('🔧 Check VPS firewall and MySQL configuration');
  }
}

module.exports = { pool, testConnection };