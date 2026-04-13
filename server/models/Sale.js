import { pool } from '../database/connection.js';

class Sale {
  static async getAll(limit = 100, offset = 0, userId = null, role = null) {
    const isAdmin = role === 'admin';
    const params = isAdmin ? [limit, offset] : [limit, offset, userId];
    const userFilter = isAdmin ? '' : 'AND s.user_id = $3';

    const { rows } = await pool.query(`
      SELECT s.*, c.name as customer_name_db
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1 ${userFilter}
      ORDER BY s.sale_date DESC
      LIMIT $1 OFFSET $2
    `, params);

    for (let sale of rows) {
      const { rows: items } = await pool.query(`
        SELECT si.*, p.name as product_name, p.cost_price
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = $1
      `, [sale.id]);
      sale.items = items;
    }

    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(`
      SELECT s.*, c.name as customer_name_db
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = $1
    `, [id]);

    if (rows.length === 0) return null;

    const sale = rows[0];
    const { rows: items } = await pool.query(`
      SELECT si.*, p.name as product_name, p.cost_price
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
    `, [sale.id]);

    sale.items = items;
    return sale;
  }

  static async create(saleData) {
    const {
      invoice_number, customer_id, customer_name, customer_phone,
      subtotal, tax_amount, total_amount, payment_method, items, user_id
    } = saleData;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: saleRows } = await client.query(`
        INSERT INTO sales
        (invoice_number, customer_id, customer_name, customer_phone, subtotal, tax_amount, total_amount, payment_method, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [invoice_number, customer_id, customer_name, customer_phone, subtotal, tax_amount, total_amount, payment_method, user_id]);

      const saleId = saleRows[0].id;

      for (const item of items) {
        await client.query(`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [saleId, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price]);

        await client.query(`
          UPDATE products
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
        `, [item.quantity, item.product_id]);

        await client.query(`
          INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, user_id)
          VALUES ($1, 'out', $2, 'sale', $3, $4)
        `, [item.product_id, item.quantity, saleId, user_id]);
      }

      if (customer_id) {
        await client.query(`
          UPDATE customers
          SET total_purchases = total_purchases + $1, last_purchase_date = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [total_amount, customer_id]);
      }

      await client.query('COMMIT');
      return saleId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSalesByDateRange(startDate, endDate) {
    const { rows } = await pool.query(`
      SELECT s.*, c.name as customer_name_db
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE DATE(s.sale_date) BETWEEN $1 AND $2
      ORDER BY s.sale_date DESC
    `, [startDate, endDate]);

    return rows;
  }

  static async getSalesStats(startDate, endDate) {
    const { rows: stats } = await pool.query(`
      SELECT
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_sale,
        SUM(subtotal) as total_subtotal,
        SUM(tax_amount) as total_tax
      FROM sales
      WHERE DATE(sale_date) BETWEEN $1 AND $2
    `, [startDate, endDate]);

    return stats[0];
  }
}

export default Sale;
