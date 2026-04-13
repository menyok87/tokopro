import express from 'express';
import Supplier from '../models/Supplier.js';

const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
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

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const supplierId = await Supplier.create(req.body);
    const supplier = await Supplier.getById(supplierId);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    await Supplier.update(req.params.id, req.body);
    const supplier = await Supplier.getById(req.params.id);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.delete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier products
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Supplier.getSupplierProducts(req.params.id);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
