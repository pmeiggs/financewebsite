// lib/rateLimit.js
// in-memory rate limiter to block brute-force login attempts

const attempts = new Map(); // key: ip address, value: { count, resetAt }

const WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const MAX_HITS  = 10;              // max failed attempts before lockout

function getIp(req) {
  // x-forwarded-for is set by proxies and load balancers
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// returns true if the request is allowed, false (and sends 429) if rate limited
export function rateLimit(req, res) {
  const ip  = getIp(req);
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec && now < rec.resetAt) {
    if (rec.count >= MAX_HITS) {
      const retryAfterSecs = Math.ceil((rec.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSecs);
      res.status(429).json({
        error: `Too many attempts. Please wait ${Math.ceil(retryAfterSecs / 60)} minutes before trying again.`,
      });
      return false;
    }
    rec.count++;
  } else {
    // first attempt or window has expired, start fresh
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }
  return true;
}

// call this on successful login to reset the counter for that ip
export function clearLimit(req) {
  attempts.delete(getIp(req));
}
