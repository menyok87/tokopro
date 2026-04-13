import express from 'express';
import { pool } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
