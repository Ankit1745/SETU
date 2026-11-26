const crypto = require('crypto');

// Fail-safe secret resolution: NEVER embed a predictable static production password in source.
// When JWT_SECRET is omitted in multi-container serverless (e.g. Vercel), deterministically derive via HMAC from
// an existing server-side secret env var so lambdas agree on tokens without embedding literals.
const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');
function resolveJwtSecret() {
  const envSecret = (process.env.JWT_SECRET || '').trim();
  if (envSecret && envSecret.length >= 16) return envSecret;

  if (process.env.ALLOW_LOCAL_FALLBACK === 'true') {
    // Deterministic local-only test secret when offline test scripts run inside single process
    return crypto.createHash('sha256').update(`setu-local-test-${process.pid}`).digest('hex');
  }

  const rootSecretSeed = [
    process.env.ADMIN_SECRET_KEY,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .join(':');

  if (rootSecretSeed.length >= 16) {
    return crypto.createHmac('sha256', rootSecretSeed).update('setu-derived-jwt-key-v1').digest('hex');
  }

  console.warn('⚠️ SECURITY WARNING: JWT_SECRET / strong ADMIN_SECRET_KEY environment variable is not set! Using ephemeral container secret.');
  return EPHEMERAL_FALLBACK_SECRET;
}

const JWT_SECRET = resolveJwtSecret();

/**
 * Creates a cryptographically signed HMAC-SHA256 token (JWT structure)
 */
function createToken(payload, expiresInSec = 86400 * 7) { // 7 days default
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const fullPayload = { ...payload, exp };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Verifies HMAC-SHA256 signed token with constant-time signature comparison
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.replace(/^Bearer\s+/i, '').split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null; // Tampered or invalid signature
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to authenticate JWT session
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  if (!authHeader) {
    return res.status(401).json({ error: 'अनधिकृत प्रवेश: कृपया पहले लॉगिन करें।' });
  }

  const user = verifyToken(authHeader);
  if (!user || user.type === 'OTP_CHALLENGE' || !user.role) {
    return res.status(401).json({ error: 'अमान्य या समाप्त सत्र (Invalid/Expired Session)। कृपया पुनः लॉगिन करें।' });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware: sets req.user if a valid session token is provided
 */
function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  if (authHeader) {
    const user = verifyToken(authHeader);
    if (user && user.type !== 'OTP_CHALLENGE' && user.role) {
      req.user = user;
    }
  }
  next();
}

/**
 * Express middleware to enforce specific roles (ADMIN, CONTRACTOR, VENDOR, CUSTOMER)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'अनधिकृत: लॉगिन आवश्यक है।' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `अस्वीकृत: इस कार्य के लिए [${roles.join(', ')}] अधिकार आवश्यक हैं।`,
      });
    }
    next();
  };
}

module.exports = {
  createToken,
  verifyToken,
  requireAuth,
  optionalAuth,
  requireRole,
  JWT_SECRET,
};
