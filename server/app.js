import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { setupDatabase } from './utils/dbSetup.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import customerRoutes from './routes/customers.js';
import supplierRoutes from './routes/suppliers.js';
import expenseRoutes from './routes/expenses.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL || true
  : process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: corsOrigin,
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
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/users', authenticateToken, userRoutes);

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

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
});

export default app;
