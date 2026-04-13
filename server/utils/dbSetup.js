const { pool } = require('../database/connection');
const MigrationRunner = require('../database/migrationRunner');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Run database migrations
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();

    console.log('✅ Database setup completed successfully');

    // Test with a simple query
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${parseInt(result.rows[0].count)}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

async function getMigrationStatus() {
  try {
    const migrationRunner = new MigrationRunner();
    return await migrationRunner.getStatus();
  } catch (error) {
    console.error('❌ Error getting migration status:', error.message);
    throw error;
  }
}

async function rollbackMigration() {
  try {
    const migrationRunner = new MigrationRunner();
    await migrationRunner.rollbackLastMigration();
  } catch (error) {
    console.error('❌ Error rolling back migration:', error.message);
    throw error;
  }
}

module.exports = {
  setupDatabase,
  getMigrationStatus,
  rollbackMigration
};
