const { pool } = require('../database/connection');

class Supplier {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT s.*, COUNT(p.id) as product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(supplierData) {
    const { name, phone, email, address } = supplierData;
    
    const [result] = await pool.execute(`
      INSERT INTO suppliers (name, phone, email, address)
      VALUES (?, ?, ?, ?)
    `, [name, phone, email, address]);

    return result.insertId;
  }

  static async update(id, supplierData) {
    const { name, phone, email, address } = supplierData;
    
    await pool.execute(`
      UPDATE suppliers 
      SET name = ?, phone = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, email, address, id]);

    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    return true;
  }

  static async getSupplierProducts(supplierId) {
    const [rows] = await pool.execute(`
      SELECT * FROM products WHERE supplier_id = ? ORDER BY name
    `, [supplierId]);

    return rows;
  }
}

module.exports = Supplier;