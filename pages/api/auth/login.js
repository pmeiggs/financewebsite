// pages/api/auth/login.js
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';
import { signToken, hashUid } from '../../../lib/auth';
import { checkEmail, sanitise } from '../../../lib/validate';
import { rateLimit, clearLimit } from '../../../lib/rateLimit';
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

  const { email, password } = req.body || {};

  const emailErr = checkEmail(email);
  if (emailErr) return res.status(400).json({ error: emailErr });
  if (!password) return res.status(400).json({ error: 'Password is required.' });

  const safeEmail = sanitise(email.trim().toLowerCase());

  try {
    // parameterised query prevents sql injection
    const [rows] = await pool.execute(
      'SELECT user_id, username, email, password_hash FROM users WHERE email = ?',
      [safeEmail]
    );

    // always run bcrypt even when user not found to prevent timing-based user enumeration
    const dummyHash = '$2b$12$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuuabcdefghijkl';
    const hash  = rows.length > 0 ? rows[0].password_hash : dummyHash;
    const valid = await bcrypt.compare(password, hash);

    if (rows.length === 0 || !valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user  = rows[0];
    const token = signToken({ user_id: user.user_id, username: user.username, email: user.email });

    clearLimit(req); // successful login resets the rate limit counter for this ip

    // httponly prevents javascript from reading the token
    res.setHeader('Set-Cookie', sessionCookie(token));

    // hash the real db integer so the frontend only ever sees a public-safe uid
    const uid = hashUid(user.user_id);

    res.json({
      message: 'Logged in',
      user: { uid, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('login error:', err.code, err.message);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
