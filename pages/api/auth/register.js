// pages/api/auth/register.js
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';
import { signToken, hashUid } from '../../../lib/auth';
import { checkPassword, checkUsername, checkEmail, sanitise } from '../../../lib/validate';
import { rateLimit } from '../../../lib/rateLimit';
import { securityHeaders } from '../../../lib/securityHeaders';


// builds the set-cookie string — adds the Secure flag in production only
function sessionCookie(token, maxAge = 604800) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}
export default async function handler(req, res) {
  securityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!rateLimit(req, res)) return;

  const { username, email, password } = req.body || {};

  const usernameErr = checkUsername(username);
  if (usernameErr) return res.status(400).json({ error: usernameErr });

  const emailErr = checkEmail(email);
  if (emailErr) return res.status(400).json({ error: emailErr });

  const passwordErr = checkPassword(password);
  if (passwordErr) return res.status(400).json({ error: passwordErr });

  // sanitise strips html characters before storing in db
  const safeUsername = sanitise(username.trim());
  const safeEmail    = email.trim().toLowerCase();

  try {
    // cost factor 12 is stronger than the bcrypt default of 10
    const password_hash = await bcrypt.hash(password, 12);

    // parameterised query prevents sql injection
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [safeUsername, safeEmail, password_hash]
    );

    const token = signToken({ user_id: result.insertId, username: safeUsername, email: safeEmail });

    // httponly prevents javascript from reading the token
    res.setHeader('Set-Cookie', sessionCookie(token));

    // hash the real db integer so the frontend only ever sees a public-safe uid
    const uid = hashUid(result.insertId);

    res.status(201).json({
      message: 'Registered successfully',
      user: { uid, username: safeUsername, email: safeEmail },
    });
  } catch (err) {
    console.error('register error:', err.code, err.message);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'That username or email is already taken.' });
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
