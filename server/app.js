const express = require('express');
const cors = require('cors');
const { testConnection } = require('./database/connection');
const { setupDatabase } = require('./utils/dbSetup');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

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
app.use('/api/auth', require('./routes/auth'));

// Protected routes (require authentication)
app.use('/api/products', authenticateToken, require('./routes/products'));
app.use('/api/sales', authenticateToken, require('./routes/sales'));
app.use('/api/customers', authenticateToken, require('./routes/customers'));
app.use('/api/suppliers', authenticateToken, require('./routes/suppliers'));
app.use('/api/expenses', authenticateToken, require('./routes/expenses'));

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

module.exports = app;