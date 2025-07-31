const { pool } = require('../database/connection');

class Product {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name, s.name as supplier_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name, s.name as supplier_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(productData) {
    const {
      name, category_id, barcode, description, cost_price, 
      selling_price, stock_quantity, min_stock_level, supplier_id
    } = productData;

    const [result] = await pool.execute(`
      INSERT INTO products 
      (name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id]);

    return result.insertId;
  }

  static async update(id, productData) {
    const {
      name, category_id, barcode, description, cost_price, 
      selling_price, stock_quantity, min_stock_level, supplier_id
    } = productData;

    await pool.execute(`
      UPDATE products 
      SET name = ?, category_id = ?, barcode = ?, description = ?, 
          cost_price = ?, selling_price = ?, stock_quantity = ?, 
          min_stock_level = ?, supplier_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id, id]);

    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }

  static async updateStock(id, newStock, movementType = 'adjustment', referenceType = 'adjustment', userId = null) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get current stock
      const [currentProduct] = await connection.execute('SELECT stock_quantity FROM products WHERE id = ?', [id]);
      const currentStock = currentProduct[0].stock_quantity;
      const quantity = newStock - currentStock;

      // Update product stock
      await connection.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, id]);

      // Record stock movement
      await connection.execute(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [id, movementType, Math.abs(quantity), referenceType, userId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getLowStock() {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.stock_quantity <= p.min_stock_level
      ORDER BY p.stock_quantity ASC
    `);
    return rows;
  }
}

module.exports = Product;