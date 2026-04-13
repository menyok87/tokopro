import { pool } from '../database/connection.js';

class Product {
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name
    `);
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
    `, [id]);
    return rows[0];
  }

  static async create(productData) {
    const {
      name, category_id, barcode, description, cost_price,
      selling_price, stock_quantity, min_stock_level, supplier_id
    } = productData;

    const { rows } = await pool.query(`
      INSERT INTO products
      (name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id]);

    return rows[0].id;
  }

  static async update(id, productData) {
    const {
      name, category_id, barcode, description, cost_price,
      selling_price, stock_quantity, min_stock_level, supplier_id
    } = productData;

    await pool.query(`
      UPDATE products
      SET name = $1, category_id = $2, barcode = $3, description = $4,
          cost_price = $5, selling_price = $6, stock_quantity = $7,
          min_stock_level = $8, supplier_id = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `, [name, category_id, barcode, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier_id, id]);

    return true;
  }

  static async delete(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }

  static async updateStock(id, newStock, movementType = 'adjustment', referenceType = 'adjustment', userId = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: currentProduct } = await client.query(
        'SELECT stock_quantity FROM products WHERE id = $1', [id]
      );
      const currentStock = currentProduct[0].stock_quantity;
      const quantity = newStock - currentStock;

      await client.query(
        'UPDATE products SET stock_quantity = $1 WHERE id = $2', [newStock, id]
      );

      await client.query(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, user_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, movementType, Math.abs(quantity), referenceType, userId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLowStock() {
    const { rows } = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.min_stock_level
      ORDER BY p.stock_quantity ASC
    `);
    return rows;
  }
}

export default Product;
