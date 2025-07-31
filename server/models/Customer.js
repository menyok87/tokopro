const { pool } = require('../database/connection');

class Customer {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT * FROM customers 
      ORDER BY name
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(customerData) {
    const { name, phone, email, address } = customerData;
    
    const [result] = await pool.execute(`
      INSERT INTO customers (name, phone, email, address)
      VALUES (?, ?, ?, ?)
    `, [name, phone, email, address]);

    return result.insertId;
  }

  static async update(id, customerData) {
    const { name, phone, email, address } = customerData;
    
    await pool.execute(`
      UPDATE customers 
      SET name = ?, phone = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, email, address, id]);

    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
    return true;
  }

  static async findByPhone(phone) {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE phone = ?', [phone]);
    return rows[0];
  }

  static async getCustomerSales(customerId) {
    const [rows] = await pool.execute(`
      SELECT s.*, COUNT(si.id) as item_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.customer_id = ?
      GROUP BY s.id
      ORDER BY s.sale_date DESC
    `, [customerId]);

    return rows;
  }
}

module.exports = Customer;