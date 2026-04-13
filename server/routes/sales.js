import express from 'express';
import Sale from '../models/Sale.js';

const router = express.Router();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const sales = await Sale.getAll(parseInt(limit), parseInt(offset));
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by date range (must be before /:id)
router.get('/reports/date-range', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const sales = await Sale.getSalesByDateRange(start_date, end_date);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales statistics (must be before /:id)
router.get('/reports/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const stats = await Sale.getSalesStats(start_date, end_date);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.getById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new sale
router.post('/', async (req, res) => {
  try {
    const saleId = await Sale.create(req.body);
    const sale = await Sale.getById(saleId);
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
