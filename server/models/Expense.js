const { pool } = require('../database/connection');

class Expense {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT e.*, ec.name as category_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      ORDER BY e.expense_date DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT e.*, ec.name as category_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(expenseData) {
    const { description, amount, category_id, receipt_number, expense_date, user_id } = expenseData;
    
    const [result] = await pool.execute(`
      INSERT INTO expenses (description, amount, category_id, receipt_number, expense_date, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [description, amount, category_id, receipt_number, expense_date, user_id]);

    return result.insertId;
  }

  static async update(id, expenseData) {
    const { description, amount, category_id, receipt_number, expense_date } = expenseData;
    
    await pool.execute(`
      UPDATE expenses 
      SET description = ?, amount = ?, category_id = ?, receipt_number = ?, expense_date = ?
      WHERE id = ?
    `, [description, amount, category_id, receipt_number, expense_date, id]);

    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
    return true;
  }

  static async getByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT e.*, ec.name as category_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.expense_date BETWEEN ? AND ?
      ORDER BY e.expense_date DESC
    `, [startDate, endDate]);

    return rows;
  }

  static async getExpenseStats(startDate, endDate) {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as average_expense
      FROM expenses
      WHERE expense_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    return stats[0];
  }

  static async getCategories() {
    const [rows] = await pool.execute('SELECT * FROM expense_categories ORDER BY name');
    return rows;
  }
}

module.exports = Expense;