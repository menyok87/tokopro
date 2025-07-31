const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.migrationTable = 'schema_migrations';
  }

  async createMigrationTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.migrationTable} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.execute(createTableSQL);
      console.log('✅ Migration table created/verified');
    } catch (error) {
      console.error('❌ Error creating migration table:', error.message);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const [rows] = await pool.execute(
        `SELECT filename FROM ${this.migrationTable} ORDER BY executed_at`
      );
      return rows.map(row => row.filename);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error.message);
      return [];
    }
  }

  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();
      return files;
    } catch (error) {
      console.error('❌ Error reading migration files:', error.message);
      return [];
    }
  }

  async executeMigration(filename) {
    const filePath = path.join(this.migrationsPath, filename);
    
    try {
      console.log(`🔄 Executing migration: ${filename}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL commands by semicolon and execute each
      const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
      
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        for (const command of commands) {
          if (command.trim()) {
            await connection.execute(command);
          }
        }
        
        // Record migration as executed
        await connection.execute(
          `INSERT INTO ${this.migrationTable} (filename) VALUES (?)`,
          [filename]
        );
        
        await connection.commit();
        console.log(`✅ Migration executed successfully: ${filename}`);
        
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error(`❌ Error executing migration ${filename}:`, error.message);
      throw error;
    }
  }

  async runMigrations() {
    try {
      console.log('🚀 Starting database migrations...');
      
      // Create migration table if it doesn't exist
      await this.createMigrationTable();
      
      // Get list of executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      console.log(`📋 Found ${executedMigrations.length} executed migrations`);
      
      // Get list of migration files
      const migrationFiles = await this.getMigrationFiles();
      console.log(`📁 Found ${migrationFiles.length} migration files`);
      
      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations to run');
        return;
      }
      
      console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('🎉 All migrations completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async rollbackLastMigration() {
    try {
      const [rows] = await pool.execute(
        `SELECT filename FROM ${this.migrationTable} ORDER BY executed_at DESC LIMIT 1`
      );
      
      if (rows.length === 0) {
        console.log('No migrations to rollback');
        return;
      }
      
      const lastMigration = rows[0].filename;
      console.log(`🔄 Rolling back migration: ${lastMigration}`);
      
      // Remove from migration table
      await pool.execute(
        `DELETE FROM ${this.migrationTable} WHERE filename = ?`,
        [lastMigration]
      );
      
      console.log(`✅ Rollback completed: ${lastMigration}`);
      console.log('⚠️  Note: You may need to manually undo database changes');
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  async getStatus() {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );
      
      console.log('\n📊 Migration Status:');
      console.log(`   Total migrations: ${migrationFiles.length}`);
      console.log(`   Executed: ${executedMigrations.length}`);
      console.log(`   Pending: ${pendingMigrations.length}`);
      
      if (pendingMigrations.length > 0) {
        console.log('\n📋 Pending migrations:');
        pendingMigrations.forEach(migration => {
          console.log(`   - ${migration}`);
        });
      }
      
      return {
        total: migrationFiles.length,
        executed: executedMigrations.length,
        pending: pendingMigrations.length,
        pendingFiles: pendingMigrations
      };
      
    } catch (error) {
      console.error('❌ Error getting migration status:', error.message);
      throw error;
    }
  }
}

module.exports = MigrationRunner;