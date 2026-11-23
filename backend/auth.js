const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'SETU_SECURE_HMAC_KEY_BHOPAL_2026_PRODUCTION';

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
 * Verifies HMAC-SHA256 signed token
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

  if (signature !== expectedSig) {
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
  if (!user) {
    return res.status(401).json({ error: 'अमान्य या समाप्त सत्र (Invalid/Expired Session)। कृपया पुनः लॉगिन करें।' });
  }

  req.user = user;
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
  requireRole,
  JWT_SECRET,
};
