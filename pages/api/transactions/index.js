// pages/api/transactions/index.js
import pool from '../../../lib/db';
import { getUserFromRequest, verifyCsrf } from '../../../lib/auth';
import { sanitise } from '../../../lib/validate';
import { securityHeaders } from '../../../lib/securityHeaders';

export default async function handler(req, res) {
  securityHeaders(res);

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  if (req.method === 'POST' && !verifyCsrf(req))
    return res.status(403).json({ error: 'Request blocked: origin mismatch.' });

  if (req.method === 'GET') {
    try {
      // join with categories to return the category name alongside each transaction
      const [rows] = await pool.execute(
        `SELECT t.transaction_id, t.amount, t.type, t.description, t.date,
                c.name AS category, c.category_id
         FROM transactions t
         JOIN categories c ON t.category_id = c.category_id
         WHERE t.user_id = ?
         ORDER BY t.date DESC`,
        [user.user_id]
      );
      res.json(rows);
    } catch (err) {
      console.error('transactions get:', err.message);
      res.status(500).json({ error: 'Something went wrong on the server.' });
    }

  } else if (req.method === 'POST') {
    const { amount, type, category_id, description, date } = req.body || {};

    if (!amount || !type || !category_id || !date)
      return res.status(400).json({ error: 'amount, type, category_id and date are required.' });
    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ error: 'type must be income or expense.' });

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ error: 'amount must be a positive number.' });

    try {
      const [result] = await pool.execute(
        'INSERT INTO transactions (user_id, amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?, ?)',
        [user.user_id, parsedAmount, type, parseInt(category_id), sanitise(description || ''), date]
      );
      res.status(201).json({ transaction_id: result.insertId });
    } catch (err) {
      console.error('transactions post:', err.message);
      res.status(500).json({ error: 'Something went wrong on the server.' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
