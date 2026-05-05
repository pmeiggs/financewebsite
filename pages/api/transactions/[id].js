// pages/api/transactions/[id].js
import pool from '../../../lib/db';
import { getUserFromRequest, verifyCsrf } from '../../../lib/auth';
import { sanitise } from '../../../lib/validate';
import { securityHeaders } from '../../../lib/securityHeaders';

export default async function handler(req, res) {
  securityHeaders(res);

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  if (!verifyCsrf(req))
    return res.status(403).json({ error: 'Request blocked: origin mismatch.' });

  const id = parseInt(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid transaction id.' });

  try {
    // ownership check ensures users can only touch their own transactions
    const [rows] = await pool.execute(
      'SELECT transaction_id FROM transactions WHERE transaction_id = ? AND user_id = ?',
      [id, user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found.' });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong on the server.' });
  }

  if (req.method === 'PUT') {
    const { amount, type, category_id, description, date } = req.body || {};
    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ error: 'Invalid type.' });
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ error: 'Invalid amount.' });

    try {
      await pool.execute(
        `UPDATE transactions SET amount=?, type=?, category_id=?, description=?, date=?
         WHERE transaction_id=? AND user_id=?`,
        [parsedAmount, type, parseInt(category_id), sanitise(description || ''), date, id, user.user_id]
      );
      res.json({ message: 'Updated.' });
    } catch (err) {
      console.error('transaction put:', err.message);
      res.status(500).json({ error: 'Something went wrong on the server.' });
    }

  } else if (req.method === 'DELETE') {
    try {
      await pool.execute(
        'DELETE FROM transactions WHERE transaction_id=? AND user_id=?',
        [id, user.user_id]
      );
      res.json({ message: 'Deleted.' });
    } catch (err) {
      console.error('transaction delete:', err.message);
      res.status(500).json({ error: 'Something went wrong on the server.' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
