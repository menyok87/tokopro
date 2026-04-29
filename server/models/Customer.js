import { pool } from '../database/connection.js';

class Customer {
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT * FROM customers
      ORDER BY name
    `);
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE id = $1', [id]
    );
    return rows[0];
  }

  static async create(customerData) {
    const { name, phone, email, address } = customerData;

    const { rows } = await pool.query(`
      INSERT INTO customers (name, phone, email, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [name, phone, email, address]);

    return rows[0].id;
  }

  static async update(id, customerData) {
    const { name, phone, email, address } = customerData;

    await pool.query(`
      UPDATE customers
      SET name = $1, phone = $2, email = $3, address = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [name, phone, email, address, id]);

    return true;
  }

  static async delete(id) {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    return true;
  }

  static async findByPhone(phone) {
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE phone = $1', [phone]
    );
    return rows[0];
  }

  static async getCustomerSales(customerId) {
    const { rows } = await pool.query(`
      SELECT s.*, COUNT(si.id) as item_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.customer_id = $1
      GROUP BY s.id
      ORDER BY s.sale_date DESC
    `, [customerId]);

    return rows;
  }
}

export default Customer;
