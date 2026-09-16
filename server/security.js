/**
 * Production security middleware: headers, login rate limit, safe errors.
 * No heavy deps — intentional lightweight hardening.
 */

const loginAttempts = new Map();

function clientKey(req) {
  return (
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/** Simple in-memory login rate limit (per instance). */
export function loginRateLimit({ windowMs = 15 * 60 * 1000, max = 30 } = {}) {
  return (req, res, next) => {
    const key = clientKey(req);
    const now = Date.now();
    let entry = loginAttempts.get(key);
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 };
      loginAttempts.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: 'تعداد تلاش‌های ورود بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.' });
    }
    next();
  };
}

export function securityHeaders(isProd) {
  return (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // CSP tuned for Vite SPA + same-origin API + Google Fonts / Vazir CDN if used
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  };
}

export function safeErrorHandler(isProd) {
  return (err, _req, res, _next) => {
    console.error('[error]', {
      message: err?.message,
      name: err?.name,
      code: err?.code,
      // never log secrets / sql / stack to client; stack only server-side
      stack: isProd ? undefined : err?.stack,
    });
    if (res.headersSent) return;
    const status = Number(err?.status || err?.statusCode) || 500;
    res.status(status).json({ error: status === 500 ? 'خطای داخلی سرور' : err?.message || 'خطا' });
  };
}

export function notFoundHandler(req, res) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'مسیر یافت نشد' });
  }
  return res.status(404).json({ error: 'یافت نشد' });
}

export function requestLogger(req, _res, next) {
  if (req.path.startsWith('/api')) {
    // Structured, no cookies/tokens
    console.log('[api]', req.method, req.path);
  }
  next();
}
