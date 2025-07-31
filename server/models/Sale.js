const { pool } = require('../database/connection');

class Sale {
  static async getAll(limit = 100, offset = 0) {
    const [rows] = await pool.execute(`
      SELECT s.*, c.name as customer_name_db
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.sale_date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Get sale items for each sale
    for (let sale of rows) {
      const [items] = await pool.execute(`
        SELECT si.*, p.name as product_name
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `, [sale.id]);
      sale.items = items;
    }

    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT s.*, c.name as customer_name_db
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (rows.length === 0) return null;

    const sale = rows[0];
    const [items] = await pool.execute(`
      SELECT si.*, p.name as product_name
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [sale.id]);
    
    sale.items = items;
    return sale;
  }

  static async create(saleData) {
    const {
      invoice_number, customer_id, customer_name, customer_phone,
      subtotal, tax_amount, total_amount, payment_method, items, user_id
    } = saleData;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert sale
      const [saleResult] = await connection.execute(`
        INSERT INTO sales 
        (invoice_number, customer_id, customer_name, customer_phone, subtotal, tax_amount, total_amount, payment_method, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [invoice_number, customer_id, customer_name, customer_phone, subtotal, tax_amount, total_amount, payment_method, user_id]);

      const saleId = saleResult.insertId;

      // Insert sale items and update stock
      for (const item of items) {
        // Insert sale item
        await connection.execute(`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [saleId, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price]);

        // Update product stock
        await connection.execute(`
          UPDATE products 
          SET stock_quantity = stock_quantity - ? 
          WHERE id = ?
        `, [item.quantity, item.product_id]);

        // Record stock movement
        await connection.execute(`
          INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, user_id)
          VALUES (?, 'out', ?, 'sale', ?, ?)
        `, [item.product_id, item.quantity, saleId, user_id]);
      }

      // Update customer total purchases if customer exists
      if (customer_id) {
        await connection.execute(`
          UPDATE customers 
          SET total_purchases = total_purchases + ?, last_purchase_date = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [total_amount, customer_id]);
      }

      await connection.commit();
      return saleId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getSalesByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT s.*, c.name as customer_name_db
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE DATE(s.sale_date) BETWEEN ? AND ?
      ORDER BY s.sale_date DESC
    `, [startDate, endDate]);

    return rows;
  }

  static async getSalesStats(startDate, endDate) {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_sale,
        SUM(subtotal) as total_subtotal,
        SUM(tax_amount) as total_tax
      FROM sales
      WHERE DATE(sale_date) BETWEEN ? AND ?
    `, [startDate, endDate]);

    return stats[0];
  }
}

module.exports = Sale;