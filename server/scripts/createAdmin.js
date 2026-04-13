import bcrypt from 'bcryptjs';
import { pool } from '../database/connection.js';

const ADMIN = {
  username: 'admin',
  email: 'admin@tokopro.com',
  password: 'admin123',
  role: 'admin'
};

async function createAdmin() {
  try {
    console.log('🔧 Creating/resetting admin user...');

    // Test DB connection
    const client = await pool.connect();
    console.log('✅ Database connected');
    client.release();

    // Generate fresh hash
    const hash = await bcrypt.hash(ADMIN.password, 12);
    console.log('✅ Password hash generated');

    // Upsert admin user
    const { rows } = await pool.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO UPDATE
        SET email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role
      RETURNING id, username, email, role
    `, [ADMIN.username, ADMIN.email, hash, ADMIN.role]);

    const user = rows[0];
    console.log('✅ Admin user ready:');
    console.log('   ID       :', user.id);
    console.log('   Username :', user.username);
    console.log('   Email    :', user.email);
    console.log('   Role     :', user.role);
    console.log('   Password :', ADMIN.password);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

createAdmin();
