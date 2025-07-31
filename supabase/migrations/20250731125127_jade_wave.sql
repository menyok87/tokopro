/*
  # Default Data for Retail Accounting System

  1. Default Categories
    - Insert product categories for retail business
    - Common categories like food, beverages, cleaning products, etc.

  2. Default Expense Categories
    - Insert expense categories for business operations
    - Utilities, rent, salaries, marketing, etc.

  3. Default Admin User
    - Create admin user with secure password hash
    - Username: admin, Password: admin123

  4. Sample Data
    - Add sample suppliers for demonstration
    - Add sample products with proper pricing and stock
    - Add sample customers for testing
*/

-- Insert default categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Makanan & Minuman', 'Produk makanan dan minuman'),
(2, 'Sabun & Deterjen', 'Produk kebersihan dan deterjen'),
(3, 'Beras & Tepung', 'Bahan makanan pokok'),
(4, 'Rokok & Tembakau', 'Produk tembakau'),
(5, 'Alat Tulis', 'Peralatan tulis dan kantor'),
(6, 'Obat-obatan', 'Obat dan produk kesehatan'),
(7, 'Kosmetik', 'Produk kecantikan dan perawatan'),
(8, 'Elektronik', 'Produk elektronik dan aksesoris');

-- Insert default expense categories
INSERT IGNORE INTO expense_categories (id, name, description) VALUES
(1, 'Utilitas', 'Listrik, air, internet'),
(2, 'Sewa', 'Sewa toko dan peralatan'),
(3, 'Gaji', 'Gaji karyawan dan bonus'),
(4, 'Pemasaran', 'Iklan dan promosi'),
(5, 'Maintenance', 'Perawatan dan perbaikan'),
(6, 'Transportasi', 'Biaya transportasi dan pengiriman'),
(7, 'Supplies', 'Perlengkapan toko'),
(8, 'Lain-lain', 'Pengeluaran lainnya');

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' with bcrypt rounds 12
INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin', 'admin@tokopro.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'admin');

-- Insert sample suppliers
INSERT IGNORE INTO suppliers (id, name, phone, email, address) VALUES
(1, 'PT Unilever Indonesia', '02154321000', 'contact@unilever.com', 'Jl. BSD Boulevard Barat, Tangerang'),
(2, 'PT Indofood Sukses Makmur', '02154321001', 'info@indofood.com', 'Jl. Sudirman Kav. 76-78, Jakarta'),
(3, 'PT Santos Jaya Abadi', '02154321002', 'sales@santos.com', 'Jl. Raya Bogor KM 27, Depok'),
(4, 'CV Beras Nusantara', '02154321003', 'order@berasnusantara.com', 'Jl. Pasar Rebo No. 45, Jakarta Timur'),
(5, 'PT Aqua Golden Mississippi', '02154321004', 'customer@aqua.com', 'Jl. Panjang No. 26, Jakarta Barat');

-- Insert sample products
INSERT IGNORE INTO products (id, name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id) VALUES
(1, 'Sabun Mandi Lifebuoy', 2, '8999999001234', 'Sabun mandi antibakteri dengan perlindungan 10x', 3500.00, 5000.00, 150, 20, 1),
(2, 'Mie Instan Indomie Goreng', 1, '8999999005678', 'Mie instan goreng rasa original', 2100.00, 3000.00, 200, 30, 2),
(3, 'Kopi Kapal Api Special', 1, '8999999009012', 'Kopi bubuk premium kualitas terbaik', 1800.00, 2500.00, 80, 15, 3),
(4, 'Beras Premium 5kg', 3, '8999999013456', 'Beras premium kualitas super', 55000.00, 65000.00, 25, 5, 4),
(5, 'Aqua Botol 600ml', 1, '8999999017890', 'Air mineral dalam kemasan botol', 2500.00, 3500.00, 12, 24, 5),
(6, 'Deterjen Rinso Matic', 2, '8999999021234', 'Deterjen untuk mesin cuci', 8500.00, 12000.00, 45, 10, 1),
(7, 'Teh Celup Sariwangi', 1, '8999999025678', 'Teh celup premium 25 kantong', 4200.00, 6000.00, 60, 15, 1),
(8, 'Minyak Goreng Tropical 1L', 1, '8999999029012', 'Minyak goreng kelapa sawit', 12000.00, 15000.00, 35, 8, 2);

-- Insert sample customers
INSERT IGNORE INTO customers (id, name, phone, email, address, total_purchases, last_purchase_date) VALUES
(1, 'Ibu Sari Wijaya', '081234567890', 'sari.wijaya@email.com', 'Jl. Merdeka No. 123, Jakarta Pusat', 127500.00, '2024-01-22 10:30:00'),
(2, 'Bapak Andi Pratama', '081234567891', 'andi.pratama@email.com', 'Jl. Sudirman No. 456, Jakarta Selatan', 79750.00, '2024-01-21 14:15:00'),
(3, 'Ibu Dewi Sartika', '081234567892', 'dewi.sartika@email.com', 'Jl. Gatot Subroto No. 789, Jakarta Barat', 45000.00, '2024-01-20 09:45:00'),
(4, 'Bapak Rudi Hermawan', '081234567893', 'rudi.hermawan@email.com', 'Jl. Thamrin No. 321, Jakarta Pusat', 92300.00, '2024-01-19 16:20:00');

-- Insert sample expenses
INSERT IGNORE INTO expenses (id, description, amount, category_id, receipt_number, expense_date, user_id) VALUES
(1, 'Listrik Bulanan Januari 2024', 850000.00, 1, 'PLN-2024-001', '2024-01-15', 1),
(2, 'Sewa Toko Januari 2024', 3000000.00, 2, 'RENT-2024-001', '2024-01-01', 1),
(3, 'Gaji Karyawan Januari 2024', 4500000.00, 3, 'SAL-2024-001', '2024-01-01', 1),
(4, 'Internet & Telepon', 450000.00, 1, 'TEL-2024-001', '2024-01-10', 1),
(5, 'Supplies Toko (Kantong Plastik, dll)', 275000.00, 7, 'SUP-2024-001', '2024-01-12', 1);