import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { testConnection } from './database/connection.js';
import { setupDatabase } from './utils/dbSetup.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import customerRoutes from './routes/customers.js';
import supplierRoutes from './routes/suppliers.js';
import expenseRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
async function initializeApp() {
  try {
    await testConnection();
    await setupDatabase();
    console.log('🚀 Application initialized successfully');
  } catch (error) {
    console.error('❌ Application initialization failed:', error.message);
    process.exit(1);
  }
}

initializeApp();

// Routes
// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/sales', authenticateToken, saleRoutes);
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/suppliers', authenticateToken, supplierRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Retail Accounting API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
});

export default app;
