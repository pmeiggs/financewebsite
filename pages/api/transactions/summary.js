// pages/api/transactions/summary.js
import pool from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';
import { securityHeaders } from '../../../lib/securityHeaders';

export default async function handler(req, res) {
  securityHeaders(res);
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    // aggregate totals for the summary cards on the dashboard
    const [totals] = await pool.execute(
      `SELECT
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expenses
       FROM transactions WHERE user_id = ?`,
      [user.user_id]
    );

    // breakdown by category for the spending pie chart
    const [byCategory] = await pool.execute(
      `SELECT c.name, SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND t.type = 'expense'
       GROUP BY c.name ORDER BY total DESC`,
      [user.user_id]
    );

    // month-by-month data for the bar chart, last 6 months only
    const [monthly] = await pool.execute(
      `SELECT DATE_FORMAT(date, '%Y-%m') AS month,
              SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses
       FROM transactions
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month`,
      [user.user_id]
    );

    res.json({ totals: totals[0], byCategory, monthly });
  } catch (err) {
    console.error('summary error:', err.message);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
