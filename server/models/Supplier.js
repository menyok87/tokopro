const { pool } = require('../database/connection');

class Supplier {
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT s.*, COUNT(p.id) as product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM suppliers WHERE id = $1', [id]
    );
    return rows[0];
  }

  static async create(supplierData) {
    const { name, phone, email, address } = supplierData;

    const { rows } = await pool.query(`
      INSERT INTO suppliers (name, phone, email, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [name, phone, email, address]);

    return rows[0].id;
  }

  static async update(id, supplierData) {
    const { name, phone, email, address } = supplierData;

    await pool.query(`
      UPDATE suppliers
      SET name = $1, phone = $2, email = $3, address = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [name, phone, email, address, id]);

    return true;
  }

  static async delete(id) {
    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    return true;
  }

  static async getSupplierProducts(supplierId) {
    const { rows } = await pool.query(`
      SELECT * FROM products WHERE supplier_id = $1 ORDER BY name
    `, [supplierId]);

    return rows;
  }
}

module.exports = Supplier;
