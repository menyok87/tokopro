import express from 'express';
import Customer from '../models/Customer.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find customer by phone (must be before /:id)
router.get('/search/phone/:phone', async (req, res) => {
  try {
    const customer = await Customer.findByPhone(req.params.phone);
    res.json(customer || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customerId = await Customer.create(req.body);
    const customer = await Customer.getById(customerId);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer (admin & manager only)
router.put('/:id', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    await Customer.update(req.params.id, req.body);
    const customer = await Customer.getById(req.params.id);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer sales history
router.get('/:id/sales', async (req, res) => {
  try {
    const sales = await Customer.getCustomerSales(req.params.id);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
