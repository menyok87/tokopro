# Retail Accounting System with MySQL

A comprehensive retail accounting system built with React, Node.js, Express, and MySQL.

## Features

- **Product Management**: Complete CRUD operations for products with categories, suppliers, and stock tracking
- **Point of Sale**: Modern POS interface with barcode scanning and invoice generation
- **Customer Management**: Customer database with purchase history and contact information
- **Supplier Management**: Supplier database with product associations
- **Inventory Management**: Real-time stock tracking with low stock alerts
- **Expense Management**: Track business expenses with categorization
- **Financial Reports**: Comprehensive reporting with profit/loss analysis
- **MySQL Database**: Robust database backend with proper relationships and indexing

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-accounting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL Database**
   - Create a MySQL database named `retail_accounting`
   - Import the schema from `server/database/schema.sql`
   ```bash
   mysql -u root -p retail_accounting < server/database/schema.sql
   ```

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the database configuration:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=retail_accounting
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key
   PORT=3001
   ```

5. **Start the Application**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run dev
   ```

## Database Schema

The system uses a well-structured MySQL database with the following main tables:

- **users**: User authentication and roles
- **categories**: Product categories
- **suppliers**: Supplier information
- **products**: Product catalog with pricing and stock
- **customers**: Customer database
- **sales**: Sales transactions
- **sale_items**: Individual items in each sale
- **expenses**: Business expenses
- **expense_categories**: Expense categorization
- **stock_movements**: Inventory movement tracking

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/reports/stats` - Get sales statistics

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Features Overview

### Dashboard
- Real-time business metrics
- Sales analytics
- Low stock alerts
- Recent transactions
- Top-selling products

### Product Management
- Add/edit/delete products
- Category management
- Barcode support
- Stock level tracking
- Supplier associations

### Point of Sale
- Product search and barcode scanning
- Shopping cart functionality
- Multiple payment methods
- Invoice generation
- Customer selection

### Inventory Management
- Real-time stock levels
- Low stock alerts
- Stock movement tracking
- Inventory valuation

### Financial Reports
- Profit & Loss statements
- Sales reports by date range
- Product performance analysis
- Expense categorization
- Monthly trends

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention
- Input validation and sanitization
- CORS configuration

## Performance Optimizations

- Database indexing for faster queries
- Connection pooling
- Efficient SQL queries
- Pagination for large datasets
- Caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository or contact the development team.