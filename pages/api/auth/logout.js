// pages/api/auth/logout.js
import { securityHeaders } from '../../../lib/securityHeaders';

export default function handler(req, res) {
  securityHeaders(res);
  // clear the session cookie by setting max-age to 0
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`);
  res.json({ message: 'Logged out.' });
}
