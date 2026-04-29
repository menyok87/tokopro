import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../database/connection.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = requireRole(['admin']);

// Get all users
router.get('/', adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin sets role)
router.post('/', adminOnly, async (req, res) => {
  try {
    const { username, email, password, role = 'cashier' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, dan password wajib diisi' });
    }
    if (!['admin', 'manager', 'cashier'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username atau email sudah digunakan' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, passwordHash, role]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin can change role, email; reset password)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { username, email, role, password } = req.body;
    const userId = req.params.id;

    if (role && !['admin', 'manager', 'cashier'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }

    // Check duplicate email/username (exclude self)
    if (email || username) {
      const { rows: existing } = await pool.query(
        'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
        [username || '', email || '', userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username atau email sudah digunakan' });
      }
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (username) { updates.push(`username = $${idx++}`); values.push(username); }
    if (email) { updates.push(`email = $${idx++}`); values.push(email); }
    if (role) { updates.push(`role = $${idx++}`); values.push(role); }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });
      const hash = await bcrypt.hash(password, 12);
      updates.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Tidak ada data yang diubah' });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, username, email, role, created_at, updated_at`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only, cannot delete self)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
    }
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
