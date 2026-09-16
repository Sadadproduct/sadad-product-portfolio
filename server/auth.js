import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'sadad_admin_token';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong value (min 24 chars) in production');
    }
    return 'dev-only-change-me-sadad-admin-32chars';
  }
  return secret;
}

/** Fail fast at boot in production if JWT_SECRET is missing/weak. */
export function assertAuthConfig() {
  if (process.env.NODE_ENV === 'production') {
    getJwtSecret();
  }
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/** Minimum password policy: length + letter + digit. */
export function validatePasswordPolicy(password) {
  const p = String(password || '');
  if (p.length < 8) return { ok: false, error: 'رمز عبور باید حداقل ۸ کاراکتر باشد' };
  if (!/[A-Za-zآ-ی]/.test(p) || !/\d/.test(p)) {
    return { ok: false, error: 'رمز عبور باید شامل حرف و عدد باشد' };
  }
  return { ok: true };
}

export function cookieOptions(isProd) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: Boolean(isProd),
    path: '/',
    maxAge: 12 * 60 * 60 * 1000,
  };
}

export function authRequired(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || bearer(req);
    if (!token) return res.status(401).json({ error: 'احراز هویت لازم است' });
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'نشست نامعتبر یا منقضی شده است' });
  }
}

/** Attach after openDb — refresh role/active from DB so JWT cannot spoof privileges. */
export function makeAuthResolver(db) {
  return async function resolveUser(req, res, next) {
    try {
      if (!req.user?.sub) return next();
      const u = await db
        .prepare('SELECT id, email, name, role, is_active FROM users WHERE id = ?')
        .get(req.user.sub);
      if (!u || !u.is_active) return res.status(401).json({ error: 'کاربر غیرفعال است' });
      req.user = { sub: u.id, email: u.email, name: u.name, role: u.role };
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'دسترسی مجاز نیست' });
    }
    next();
  };
}

function bearer(req) {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7);
  return null;
}

export { COOKIE_NAME, JWT_EXPIRES_IN };
