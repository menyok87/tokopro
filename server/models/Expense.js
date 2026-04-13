import { pool } from '../database/connection.js';

class Expense {
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT e.*, ec.name as category_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      ORDER BY e.expense_date DESC
    `);
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(`
      SELECT e.*, ec.name as category_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.id = $1
    `, [id]);
    return rows[0];
  }

  static async create(expenseData) {
    const { description, amount, category_id, receipt_number, expense_date, user_id } = expenseData;

    const { rows } = await pool.query(`
      INSERT INTO expenses (description, amount, category_id, receipt_number, expense_date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [description, amount, category_id, receipt_number, expense_date, user_id]);

    return rows[0].id;
  }

  static async update(id, expenseData) {
    const { description, amount, category_id, receipt_number, expense_date } = expenseData;

    await pool.query(`
      UPDATE expenses
      SET description = $1, amount = $2, category_id = $3, receipt_number = $4, expense_date = $5
      WHERE id = $6
    `, [description, amount, category_id, receipt_number, expense_date, id]);

    return true;
  }

  static async delete(id) {
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    return true;
  }

  static async getByDateRange(startDate, endDate) {
    const { rows } = await pool.query(`
      SELECT e.*, ec.name as category_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.expense_date BETWEEN $1 AND $2
      ORDER BY e.expense_date DESC
    `, [startDate, endDate]);

    return rows;
  }

  static async getExpenseStats(startDate, endDate) {
    const { rows: stats } = await pool.query(`
      SELECT
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as average_expense
      FROM expenses
      WHERE expense_date BETWEEN $1 AND $2
    `, [startDate, endDate]);

    return stats[0];
  }

  static async getCategories() {
    const { rows } = await pool.query(
      'SELECT * FROM expense_categories ORDER BY name'
    );
    return rows;
  }
}

export default Expense;
