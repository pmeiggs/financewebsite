// lib/securityHeaders.js
// applied to every api response to harden the http layer

export function securityHeaders(res) {
  // prevents browsers from mime-sniffing the content type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // prevents page from being loaded in an iframe (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');
  // legacy xss filter for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // only send origin in referrer header, not full url
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // restricts which browser features the page can use
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // content security policy limits what can run on the page, blocking injected scripts
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
    ].join('; ')
  );
}
