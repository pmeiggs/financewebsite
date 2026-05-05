// pages/api/categories/index.js
import pool from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';
import { securityHeaders } from '../../../lib/securityHeaders';

export default async function handler(req, res) {
  securityHeaders(res);
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
