// lib/auth.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// read secret at call time so next.js env is fully loaded
function getSecret() {
  return process.env.JWT_SECRET || 'fintrack-fallback-secret-set-env-local';
}

// create a short public uid by hmac-hashing the real db integer
export function hashUid(user_id) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(String(user_id))
    .digest('hex')
    .slice(0, 16);
}

// sign a jwt — never put the raw numeric db id in the payload
export function signToken(payload) {
  const { user_id, ...rest } = payload;
  return jwt.sign(
    { uid: hashUid(user_id), _id: user_id, ...rest },
    getSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

// extract and verify the session token from the httponly cookie
export function getUserFromRequest(req) {
  const cookieHeader = req.headers.cookie || '';
  // match token= even when preceded by other cookies
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (!match) return null;
  const payload = verifyToken(decodeURIComponent(match[1]));
  if (!payload) return null;
  // remap internal _id back to user_id for all downstream code
  return { ...payload, user_id: payload._id };
}

// origin-based csrf check — rejects cross-origin state-changing requests
export function verifyCsrf(req) {
  const origin = req.headers['origin'];
  const host   = req.headers['host'];
  // no origin header means same-origin request (e.g. curl or server-to-server)
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
