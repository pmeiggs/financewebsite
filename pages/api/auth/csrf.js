// pages/api/auth/csrf.js
import { securityHeaders } from '../../../lib/securityHeaders';

export default function handler(req, res) {
  securityHeaders(res);
  res.json({ ok: true });
}
