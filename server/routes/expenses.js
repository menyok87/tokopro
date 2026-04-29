import express from 'express';
import Expense from '../models/Expense.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminManager = requireRole(['admin', 'manager']);

// Get all expenses
router.get('/', adminManager, async (req, res) => {
  try {
    const expenses = await Expense.getAll(req.user.id, req.user.role);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense categories (must be before /:id)
router.get('/categories/all', adminManager, async (req, res) => {
  try {
    const categories = await Expense.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by date range (must be before /:id)
router.get('/reports/date-range', adminManager, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const expenses = await Expense.getByDateRange(start_date, end_date);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense statistics (must be before /:id)
router.get('/reports/stats', adminManager, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const stats = await Expense.getExpenseStats(start_date, end_date);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense by ID
router.get('/:id', adminManager, async (req, res) => {
  try {
    const expense = await Expense.getById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new expense
router.post('/', adminManager, async (req, res) => {
  try {
    const expenseId = await Expense.create({ ...req.body, user_id: req.user.id });
    const expense = await Expense.getById(expenseId);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', adminManager, async (req, res) => {
  try {
    await Expense.update(req.params.id, req.body);
    const expense = await Expense.getById(req.params.id);
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', adminManager, async (req, res) => {
  try {
    await Expense.delete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
