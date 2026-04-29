import express from 'express';
import Supplier from '../models/Supplier.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all suppliers (admin & manager only)
router.get('/', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier by ID (admin & manager only)
router.get('/:id', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new supplier (admin & manager only)
router.post('/', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const supplierId = await Supplier.create(req.body);
    const supplier = await Supplier.getById(supplierId);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supplier (admin & manager only)
router.put('/:id', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    await Supplier.update(req.params.id, req.body);
    const supplier = await Supplier.getById(req.params.id);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete supplier (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await Supplier.delete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier products (admin & manager only)
router.get('/:id/products', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const products = await Supplier.getSupplierProducts(req.params.id);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
