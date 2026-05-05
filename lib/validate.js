// lib/validate.js
// shared validation used by both api routes and the react frontend

const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

// common passwords that should always be rejected
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty123', 'abc12345',
  'letmein1', 'welcome1', 'monkey123', 'fintrack1',
];

export function checkPassword(pw) {
  if (!pw || pw.length < 8)
    return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw))
    return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(pw))
    return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(pw))
    return 'Password must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(pw))
    return 'Password must include at least one special character.';
  if (COMMON_PASSWORDS.some(c => pw.toLowerCase().includes(c)))
    return 'That password is too common. Please choose something more unique.';
  return null; // null means valid
}

export function checkUsername(u) {
  if (!u || u.trim().length < 3)   return 'Username must be at least 3 characters.';
  if (u.trim().length > 30)        return 'Username must be 30 characters or fewer.';
  if (!USERNAME_RE.test(u.trim())) return 'Username can only contain letters, numbers, _ and -.';
  return null;
}

export function checkEmail(e) {
  if (!e || !e.trim())          return 'Email is required.';
  if (!EMAIL_RE.test(e.trim())) return 'Please enter a valid email address.';
  return null;
}

// strips html-sensitive characters before storing in db (prevents stored xss)
export function sanitise(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, c => (
    { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
  ));
}

export { EMAIL_RE, USERNAME_RE };
