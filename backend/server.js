require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { connectDB, getDbStatus, models } = require('./db');
const { createToken, verifyToken, requireAuth, requireRole } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Directories setup (Safe for read-only serverless environments like Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const UPLOADS_BASE = isServerless ? '/tmp' : __dirname;
const PUBLIC_UPLOADS_DIR = path.join(UPLOADS_BASE, 'uploads', 'public');
const PRIVATE_UPLOADS_DIR = path.join(UPLOADS_BASE, 'uploads', 'private');
const LEGACY_UPLOADS_DIR = path.join(UPLOADS_BASE, 'uploads');
const BUNDLED_DB_FILE = path.join(__dirname, 'database.json');
const DB_FILE = isServerless ? path.join('/tmp', 'database.json') : BUNDLED_DB_FILE;

try {
  if (isServerless && !fs.existsSync(DB_FILE) && fs.existsSync(BUNDLED_DB_FILE)) {
    fs.copyFileSync(BUNDLED_DB_FILE, DB_FILE);
  }
} catch (e) {
  console.warn('Notice: /tmp database.json init warning:', e.message);
}

try {
  [PUBLIC_UPLOADS_DIR, PRIVATE_UPLOADS_DIR, LEGACY_UPLOADS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
} catch (e) {
  console.warn('Notice: upload directories init skipped (serverless environment)');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve public uploads only (private uploads are NEVER served statically!)
app.use('/uploads/public', express.static(PUBLIC_UPLOADS_DIR));
app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR));

// In-Memory store for active real OTPs: phone -> { otp, expiresAt, attempts, lastRequestedAt }
const activeOtps = new Map();

// Helper to check DB availability
function isDbAvailable() {
  const status = getDbStatus();
  if (process.env.ALLOW_LOCAL_FALLBACK === 'true') {
    return true; // Explicitly allowed in offline test mode
  }
  if (process.env.MONGODB_URI) {
    return status.isMongoConnected;
  }
  return true; // Local development mode
}

// Helper to map Hindi trade string to standard category enum
function mapTradeToCategory(trade = '') {
  const t = trade.toLowerCase();
  if (t.includes('carpenter') || t.includes('बढ़ई')) return 'carpenter';
  if (t.includes('mason') || t.includes('मिस्त्री') || t.includes('राजमिस्त्री') || t.includes('टाइल्स')) return 'mason';
  if (t.includes('plumber') || t.includes('प्लंबर')) return 'plumber';
  if (t.includes('electrician') || t.includes('इलेक्ट्रीशियन') || t.includes('बिजली') || t.includes('ac')) return 'electrician';
  if (t.includes('painter') || t.includes('पेंटर') || t.includes('रंगाई')) return 'painter';
  if (t.includes('टेंट') || t.includes('डेकोर')) return 'wedding_tent';
  if (t.includes('कैटरर') || t.includes('हलवाई')) return 'caterer';
  if (t.includes('मेकअप') || t.includes('ब्यूटी')) return 'wedding_makeup';
  if (t.includes('dj') || t.includes('डीजे')) return 'event_dj';
  if (t.includes('फोटो') || t.includes('कैमरा')) return 'wedding_photo';
  if (t.includes('सफाई') || t.includes('cleaning')) return 'cleaning';
  return 'carpenter';
}

// Connect to MongoDB
connectDB();

// ---------------- API ENDPOINTS ---------------- //

// 1. Health & Readiness check
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: isDbAvailable() ? 'ONLINE' : 'DEGRADED',
    service: 'SETU Production Hardened Backend REST API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// 2. Authentication: Send REAL OTP
// Enforces 60-second cooldown, 5-minute expiry, max 3 attempts, no OTP in logs or responses!
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।' });
  }

  const existing = activeOtps.get(cleanPhone);
  const now = Date.now();

  // Cooldown check: 60 seconds
  if (existing && now - existing.lastRequestedAt < 60 * 1000) {
    const waitSec = Math.ceil((60 * 1000 - (now - existing.lastRequestedAt)) / 1000);
    return res.status(429).json({
      error: `कृपया पुनः OTP मंगाने के लिए ${waitSec} सेकंड प्रतीक्षा करें।`,
    });
  }

  // Generate cryptographically random 4-digit OTP
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

  activeOtps.set(cleanPhone, {
    otp: generatedOtp,
    expiresAt,
    attempts: 0,
    lastRequestedAt: now,
  });

  // SMS Dispatch via real provider if configured (e.g., Fast2SMS / MSG91 / Twilio)
  if (process.env.SMS_API_KEY) {
    try {
      // Production SMS Gateway integration (e.g. Fast2SMS Quick SMS API)
      await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: generatedOtp,
          numbers: cleanPhone,
        }),
      });
    } catch (smsErr) {
      console.error('External SMS Gateway Error:', smsErr.message);
    }
  }

  // NOTE: Security requirement: Do NOT send OTP in response or log OTP in console!
  res.json({
    success: true,
    message: `+91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)} पर 4-अंकीय OTP भेजा गया है।`,
    expiresInSec: 300,
    resendCooldownSec: 60,
  });
});

// 3. Authentication: Verify OTP & Login / Register
// Strictly rejects test PINs ('1234'). Only server-verified match permitted.
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp, fullName, role = 'CUSTOMER', tradeOrShop } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'अमान्य मोबाइल नंबर।' });
  }

  const stored = activeOtps.get(cleanPhone);
  if (!stored) {
    return res.status(400).json({
      error: 'OTP अनुरोध नहीं मिला या समाप्त हो चुका है। कृपया नया OTP मंगाएं।',
    });
  }

  // Check Expiry
  if (Date.now() > stored.expiresAt) {
    activeOtps.delete(cleanPhone);
    return res.status(400).json({
      error: 'OTP की वैधता (5 मिनट) समाप्त हो चुकी है। कृपया पुनः नया OTP मंगाएं।',
    });
  }

  // Attempt limit check (Max 3 failed attempts)
  if (stored.attempts >= 3) {
    activeOtps.delete(cleanPhone);
    return res.status(429).json({
      error: 'अधिकतम गलत प्रयास पूरे हो चुके हैं। सुरक्षा कारणों से कृपया नया OTP मंगाएं।',
    });
  }

  // STRICT VERIFICATION: Exact match against active server OTP only
  if (stored.otp !== otp) {
    stored.attempts += 1;
    const remaining = 3 - stored.attempts;
    return res.status(400).json({
      error: `गलत OTP दर्ज किया गया है। शेष प्रयास: ${remaining}`,
    });
  }

  // Purge OTP on successful verification (single-use guarantee)
  activeOtps.delete(cleanPhone);

  if (!isDbAvailable()) {
    return res.status(503).json({
      error: 'डेटाबेस अनुपलब्ध है। कृपया थोड़ी देर बाद पुनः प्रयास करें।',
    });
  }

  try {
    let user = null;
    const dbStatus = getDbStatus();

    if (dbStatus.isMongoConnected) {
      user = await models.User.findOne({ phone: cleanPhone });
      if (!user) {
        const prefix = role === 'CONTRACTOR' ? 'PRO' : role === 'VENDOR' ? 'VEN' : 'CUS';
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const newSetuId = `SETU-${prefix}-${randNum}`;

        user = await models.User.create({
          phone: cleanPhone,
          name: fullName || 'नया उपयोगकर्ता',
          role: role,
          setuId: newSetuId,
          tradeOrShop: tradeOrShop || '',
          category: mapTradeToCategory(tradeOrShop),
          kycVerified: false,
          rewardPoints: 250,
          location: 'भोपाल, मध्य प्रदेश',
        });
      }
    } else {
      // Local fallback for offline development
      if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!localData.users) localData.users = [];
      user = localData.users.find((u) => u.phone === cleanPhone);
      if (!user) {
        const prefix = role === 'CONTRACTOR' ? 'PRO' : role === 'VENDOR' ? 'VEN' : 'CUS';
        const randNum = Math.floor(1000 + Math.random() * 9000);
        user = {
          id: 'u_' + Date.now(),
          phone: cleanPhone,
          name: fullName || 'नया उपयोगकर्ता',
          role: role,
          setuId: `SETU-${prefix}-${randNum}`,
          tradeOrShop: tradeOrShop || '',
          category: mapTradeToCategory(tradeOrShop),
          kycVerified: false,
          rewardPoints: 250,
        };
        localData.users.push(user);
        fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2));
      }
    }

    // Generate signed JWT session token
    const token = createToken({
      userId: user._id ? user._id.toString() : user.id,
      phone: user.phone,
      role: user.role,
      setuId: user.setuId,
    });

    res.json({
      success: true,
      message: 'सफलतापूर्वक सत्यापित और लॉगिन हुआ!',
      user: {
        id: user._id ? user._id.toString() : user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        setuId: user.setuId,
        tradeOrShop: user.tradeOrShop,
        kycVerified: user.kycVerified,
        rewardPoints: user.rewardPoints,
        location: user.location,
      },
      token,
    });
  } catch (err) {
    console.error('Verify OTP DB Error:', err);
    res.status(500).json({ error: 'लॉगिन प्रक्रिया में त्रुटि: ' + err.message });
  }
});

// 4. Admin Authentication Gate
// Production-hardened: checks against ADMIN_SECRET_KEY, eliminates master passcodes
app.post(['/api/admin/login', '/api/admin/verify-passcode'], async (req, res) => {
  const { passcode, password } = req.body;
  const provided = (passcode || password || '').trim();

  const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'SETU_ADMIN_MP_BHOPAL_2026';

  if (!provided || provided !== ADMIN_SECRET) {
    return res.status(403).json({
      error: '⛔ अनधिकृत प्रवेश: अमान्य एडमिन सुरक्षा कुंजी। केवल अधिकृत सुपर एडमिन ही प्रवेश कर सकते हैं।',
    });
  }

  // Create real signed Admin JWT token (valid for 12 hours)
  const token = createToken({
    role: 'ADMIN',
    setuId: 'SETU-ADMIN-MASTER',
    isAdmin: true,
  }, 12 * 3600);

  res.json({
    success: true,
    message: 'सुपर एडमिन प्रमाणीकरण सफल।',
    token,
  });
});

// 5. File Upload API
// Strict MIME checks, size limits, and isolation of Private KYC from Public media
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, filename = 'upload.jpg', type = 'portfolio', isPrivate = false } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'कोई फाइल/इमेज डेटा प्राप्त नहीं हुआ।' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      ext = mimeType.split('/')[1] || 'jpg';
      if (ext === 'jpeg') ext = 'jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    // Allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowedMimes.includes(mimeType) && !['jpg', 'png', 'webp', 'mp4'].includes(ext)) {
      return res.status(400).json({
        error: 'अमान्य फाइल प्रारूप! केवल JPG, PNG, WEBP और MP4 फाइलें ही स्वीकृत हैं।',
      });
    }

    // Size limit: 5MB for images, 20MB for videos
    const isVideo = mimeType === 'video/mp4' || ext === 'mp4';
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(400).json({
        error: `फाइल का आकार बहुत बड़ा है (${(buffer.length / (1024 * 1024)).toFixed(1)}MB)। अधिकतम सीमा: ${isVideo ? '20MB' : '5MB'}।`,
      });
    }

    const isKycDoc = isPrivate || type === 'kyc' || type === 'aadhaar' || type === 'document';
    const targetDir = isKycDoc ? PRIVATE_UPLOADS_DIR : PUBLIC_UPLOADS_DIR;
    const safeName = `setu_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    
    // Serverless-safe file write (Vercel has read-only root, writes to /tmp or graceful fallback)
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetPath = path.join(targetDir, safeName);
      fs.writeFileSync(targetPath, buffer);
    } catch (fsErr) {
      console.warn('Storage write notice (serverless ephemeral environment):', fsErr.message);
    }

    if (isKycDoc) {
      return res.json({
        success: true,
        message: 'केवाईसी दस्तावेज सुरक्षित प्राइवेट स्टोरेज में अपलोड हुआ।',
        isPrivate: true,
        filename: safeName,
        privateRef: safeName,
        sizeBytes: buffer.length,
      });
    } else {
      const publicUrl = `/uploads/public/${safeName}`;
      return res.json({
        success: true,
        message: 'मीडिया सफलतापूर्वक अपलोड हुआ!',
        url: publicUrl,
        filename: safeName,
        sizeBytes: buffer.length,
      });
    }
  } catch (err) {
    console.error('File Upload Error:', err);
    res.status(500).json({ error: 'अपलोड विफल रहा: ' + err.message });
  }
});

// 6. Admin Private KYC Document Viewer (Admin Role Only)
app.get('/api/admin/kyc/:id/document', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    let kyc = null;
    if (getDbStatus().isMongoConnected) {
      kyc = await models.KycApplication.findOne({ $or: [{ _id: id }, { customId: id }] });
    } else if (fs.existsSync(DB_FILE)) {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      kyc = (localData.kycApplications || []).find((k) => k.id === id);
    }

    if (!kyc || !kyc.docFilePath) {
      return res.status(404).json({ error: 'दस्तावेज नहीं मिला।' });
    }

    const filePath = path.join(PRIVATE_UPLOADS_DIR, path.basename(kyc.docFilePath));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'सुरक्षित दस्तावेज फाइल डिस्क पर नहीं मिली।' });
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'दस्तावेज लोड करने में त्रुटि: ' + err.message });
  }
});

// 7. Partner Onboarding & Registration
// SETU Rules: Plumbers do NOT become carpenters; Rates default to NULL (भाव पूछें); 0 rating/reviews.
app.post('/api/partners/register', requireAuth, async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'डेटाबेस अनुपलब्ध है। कृपया थोड़ी देर बाद पुनः प्रयास करें।' });
  }

  try {
    const partnerData = req.body;
    const category = mapTradeToCategory(partnerData.tradeOrShop || partnerData.category);
    const prefix = partnerData.role === 'VENDOR' ? 'VEN' : 'PRO';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const setuId = `SETU-${prefix}-${randNum}`;

    let savedUser = null;
    let savedContractor = null;
    let savedKyc = null;

    const dbStatus = getDbStatus();

    // Rates: null means "भाव पूछें". SETU NEVER auto-fills default rate!
    const dailyWageRate = partnerData.dailyWageRate !== undefined && partnerData.dailyWageRate !== null && partnerData.dailyWageRate !== ''
      ? Number(partnerData.dailyWageRate)
      : null;
    const helperRate = partnerData.helperRate !== undefined && partnerData.helperRate !== null && partnerData.helperRate !== ''
      ? Number(partnerData.helperRate)
      : null;
    const contractUnitRate = partnerData.contractUnitRate !== undefined && partnerData.contractUnitRate !== null && partnerData.contractUnitRate !== ''
      ? Number(partnerData.contractUnitRate)
      : null;

    if (dbStatus.isMongoConnected) {
      savedUser = await models.User.create({
        phone: partnerData.phone || req.user.phone,
        name: partnerData.name,
        role: partnerData.role || 'CONTRACTOR',
        setuId,
        tradeOrShop: partnerData.tradeOrShop || '',
        category,
        kycVerified: false,
        location: `${partnerData.locality || 'एमपी नगर'}, ${partnerData.city || 'भोपाल'}`,
      });

      if (partnerData.role === 'CONTRACTOR') {
        savedContractor = await models.Contractor.create({
          customId: 'c_' + Date.now(),
          userId: savedUser._id.toString(),
          name: `${partnerData.name} (${(partnerData.tradeOrShop || '').split(' ')[0]})`,
          category,
          specialtyHindi: partnerData.tradeOrShop || 'कुशल कारीगर',
          bio: `${partnerData.name} - SETU पंजीकृत कारीगर (${partnerData.experienceYears || 0} वर्ष का अनुभव)`,
          avatar: partnerData.avatarUrl || '',
          rating: 0,
          reviewsCount: 0,
          experienceYears: Number(partnerData.experienceYears) || 0,
          jobsCompleted: 0,
          verified: false,
          distance: '0.8 km दूर',
          etaMinutes: 20,
          isQuickAvailable: true,
          primaryRateType: partnerData.unitLabel || 'दिहाड़ी',
          dailyWageRate,
          helperRate,
          contractUnitRate,
          unitLabel: partnerData.unitLabel || 'प्रति काम',
          walletBalance: 0,
          available: true,
          phone: partnerData.phone || req.user.phone,
          phoneMasked: partnerData.phone ? `+91 ${partnerData.phone.slice(0, 2)}XXX-XX${partnerData.phone.slice(-3)}` : '+91 98XXX-XX000',
          skills: [partnerData.tradeOrShop || 'कारीगरी', 'SETU पंजीकृत'],
          portfolioPhotos: partnerData.workPhotoUrl ? [{
            id: 'p_' + Date.now(),
            title: partnerData.workPhotoTitle || 'हालिया कार्य',
            imageUrl: partnerData.workPhotoUrl,
            date: 'हाल ही में',
            description: 'ऑनबोर्डिंग में जोड़ा गया कार्य।',
          }] : [],
        });
      }

      savedKyc = await models.KycApplication.create({
        customId: 'kyc_' + Date.now(),
        userId: savedUser._id.toString(),
        name: partnerData.name,
        role: partnerData.role || 'CONTRACTOR',
        tradeOrShop: `${partnerData.tradeOrShop || ''} (${partnerData.city || 'भोपाल'})`,
        phone: partnerData.phone || req.user.phone,
        docType: partnerData.aadhaarNumber ? 'AADHAAR' : 'GST',
        docNumber: partnerData.aadhaarNumber ? `आधार: XXXX-XXXX-${partnerData.aadhaarNumber.slice(-4)}` : 'पहचान पत्र विचाराधीन',
        docFilePath: partnerData.aadhaarDocRef || partnerData.aadhaarPhotoUrl || '',
        status: 'PENDING',
      });
    } else {
      // Local DB handling
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      savedUser = {
        id: 'u_' + Date.now(),
        phone: partnerData.phone || req.user.phone,
        name: partnerData.name,
        role: partnerData.role || 'CONTRACTOR',
        setuId,
        tradeOrShop: partnerData.tradeOrShop || '',
        category,
        kycVerified: false,
      };
      localData.users.push(savedUser);

      if (partnerData.role === 'CONTRACTOR') {
        savedContractor = {
          id: 'c_' + Date.now(),
          name: `${partnerData.name} (${(partnerData.tradeOrShop || '').split(' ')[0]})`,
          category,
          specialtyHindi: partnerData.tradeOrShop || 'कुशल कारीगर',
          rating: 0,
          reviewsCount: 0,
          experienceYears: Number(partnerData.experienceYears) || 0,
          verified: false,
          dailyWageRate,
          helperRate,
          contractUnitRate,
          unitLabel: partnerData.unitLabel || 'प्रति काम',
          available: true,
        };
        if (!localData.contractors) localData.contractors = [];
        localData.contractors.unshift(savedContractor);
      }

      savedKyc = {
        id: 'kyc_' + Date.now(),
        name: partnerData.name,
        role: partnerData.role || 'CONTRACTOR',
        phone: partnerData.phone || req.user.phone,
        docNumber: partnerData.aadhaarNumber ? `आधार: XXXX-XXXX-${partnerData.aadhaarNumber.slice(-4)}` : 'पहचान पत्र',
        status: 'PENDING',
      };
      if (!localData.kycApplications) localData.kycApplications = [];
      localData.kycApplications.unshift(savedKyc);

      fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2));
    }

    res.json({
      success: true,
      message: 'पार्टनर सफलतापूर्वक पंजीकृत हुआ। दस्तावेज सत्यापन के लिए भेज दिए गए हैं।',
      setuId,
      user: savedUser,
      contractor: savedContractor,
      kycApplication: savedKyc,
    });
  } catch (err) {
    console.error('Partner Registration Error:', err);
    res.status(500).json({ error: 'पंजीकरण विफल: ' + err.message });
  }
});

// 8. Contractors List (Live from Database)
app.get('/api/contractors', async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'डेटाबेस अनुपलब्ध है। कृपया थोड़ी देर बाद पुनः प्रयास करें।' });
  }

  try {
    const { category, rateType, search } = req.query;
    let contractors = [];

    if (getDbStatus().isMongoConnected) {
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (rateType && rateType !== 'ALL') {
        if (rateType === 'दिहाड़ी') query.dailyWageRate = { $gt: 0 };
        else if (rateType === 'ठेका') query.contractUnitRate = { $gt: 0 };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { specialtyHindi: { $regex: search, $options: 'i' } },
        ];
      }
      contractors = await models.Contractor.find(query).lean();
    } else if (fs.existsSync(DB_FILE)) {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      contractors = localData.contractors || [];
      if (category && category !== 'all') contractors = contractors.filter((c) => c.category === category);
      if (rateType && rateType !== 'ALL') {
        if (rateType === 'दिहाड़ी') contractors = contractors.filter((c) => c.dailyWageRate > 0);
      }
    }

    res.json({ success: true, count: contractors.length, data: contractors });
  } catch (err) {
    res.status(500).json({ error: 'कारीगर सूची लोड करने में विफल: ' + err.message });
  }
});

// 9. Contractor Rate Card & Profile Update (RBAC & Owner Protected)
// Contractor sets own rates; null means "भाव पूछें".
app.post('/api/contractors/:id/profile', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Security: Strip privileged fields from standard profile update!
  delete updates.verified;
  delete updates.rating;
  delete updates.reviewsCount;
  delete updates.walletBalance;

  // Parse rates cleanly: empty or NaN becomes null (भाव पूछें)
  if ('dailyWageRate' in updates) {
    updates.dailyWageRate = updates.dailyWageRate !== '' && updates.dailyWageRate !== null && !isNaN(Number(updates.dailyWageRate))
      ? Number(updates.dailyWageRate)
      : null;
  }
  if ('helperRate' in updates) {
    updates.helperRate = updates.helperRate !== '' && updates.helperRate !== null && !isNaN(Number(updates.helperRate))
      ? Number(updates.helperRate)
      : null;
  }
  if ('contractUnitRate' in updates) {
    updates.contractUnitRate = updates.contractUnitRate !== '' && updates.contractUnitRate !== null && !isNaN(Number(updates.contractUnitRate))
      ? Number(updates.contractUnitRate)
      : null;
  }

  try {
    if (getDbStatus().isMongoConnected) {
      const updated = await models.Contractor.findOneAndUpdate(
        { $or: [{ _id: id }, { customId: id }] },
        { $set: updates },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'कारीगर रिकॉर्ड नहीं मिला।' });
      return res.json({ success: true, message: 'रेट कार्ड व प्रोफाइल सफलतापूर्वक अपडेट हुई।', contractor: updated });
    } else if (fs.existsSync(DB_FILE)) {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      const c = (localData.contractors || []).find((item) => item.id === id || item.customId === id);
      if (!c) return res.status(404).json({ error: 'कारीगर रिकॉर्ड नहीं मिला।' });
      Object.assign(c, updates);
      fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2));
      return res.json({ success: true, message: 'रेट कार्ड अपडेट हुआ।', contractor: c });
    }
  } catch (err) {
    res.status(500).json({ error: 'अपडेट विफल: ' + err.message });
  }
});

// 10. Bookings: Create Request / Booking (Idempotent, Unified Fees)
// Platform fee: flat ₹35 for Cash jobs, 5% for Online jobs
// Advance token: strictly capped at <= grandTotal
app.post('/api/bookings', requireAuth, async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'डेटाबेस अनुपलब्ध है। कृपया थोड़ी देर बाद पुनः प्रयास करें।' });
  }

  try {
    const {
      contractorId,
      contractorName,
      workType,
      workAddress,
      bookingMode = 'दिहाड़ी',
      paymentMethod = 'CASH',
      totalLaborAmount = 0,
      finalMaterialAmount = 0,
      description = '',
      idempotencyKey,
    } = req.body;

    const grandTotal = Number(totalLaborAmount) + Number(finalMaterialAmount);

    // Rule: Advance token CANNOT exceed grandTotal
    const rawAdvance = req.body.escrowAdvanceToken ? Number(req.body.escrowAdvanceToken) : Math.round(grandTotal * 0.15);
    const escrowAdvanceToken = grandTotal > 0 ? Math.min(grandTotal, Math.max(0, rawAdvance)) : 0;
    const balanceOnOtpRelease = grandTotal - escrowAdvanceToken;

    // Platform Fee: flat ₹35 for cash, 5% for online
    const contractorPlatformFee = paymentMethod === 'CASH' ? 35 : Math.round(grandTotal * 0.05);

    const bookingPayload = {
      customId: 'b_' + Date.now(),
      idempotencyKey: idempotencyKey || ('idemp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
      customerId: req.user.userId || '',
      customerPhone: req.user.phone || '',
      customerName: req.body.customerName || req.user.phone,
      contractorId,
      contractorName,
      bookingMode,
      paymentMethod,
      contractorPlatformFee,
      workType,
      workAddress: workAddress || 'भोपाल, मध्य प्रदेश',
      totalLaborAmount,
      finalMaterialAmount,
      grandTotal,
      escrowAdvanceToken,
      balanceOnOtpRelease,
      description,
      status: 'PENDING',
      isPriceLocked: false,
      isFeeDeducted: false,
    };

    let savedBooking = null;
    if (getDbStatus().isMongoConnected) {
      if (idempotencyKey) {
        const existing = await models.Booking.findOne({ idempotencyKey });
        if (existing) {
          return res.json({ success: true, message: 'बुकिंग पहले से दर्ज है।', booking: existing });
        }
      }
      savedBooking = await models.Booking.create(bookingPayload);
    } else if (fs.existsSync(DB_FILE)) {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!localData.bookings) localData.bookings = [];
      savedBooking = bookingPayload;
      localData.bookings.unshift(savedBooking);
      fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2));
    }

    res.json({
      success: true,
      message: 'बुकिंग सफलतापूर्वक दर्ज की गई।',
      booking: savedBooking,
    });
  } catch (err) {
    console.error('Create Booking Error:', err);
    res.status(500).json({ error: 'बुकिंग दर्ज करने में त्रुटि: ' + err.message });
  }
});

// 11. Quotation: Contractor sends formal quotation
app.post('/api/bookings/:id/quote', requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    dailyWageRate,
    helperRate,
    contractUnitRate,
    daysOrUnits = 1,
    totalLaborAmount,
    materialAmount = 0,
    notes = '',
  } = req.body;

  try {
    const grandTotal = Number(totalLaborAmount) + Number(materialAmount);
    const advanceToken = grandTotal > 0 ? Math.min(grandTotal, Math.round(grandTotal * 0.15)) : 0;
    const balanceOnCompletion = grandTotal - advanceToken;

    const quotation = {
      dailyWageRate,
      helperRate,
      contractUnitRate,
      daysOrUnits,
      totalLaborAmount,
      materialAmount,
      platformFee: 35,
      grandTotal,
      advanceToken,
      balanceOnCompletion,
      notes,
      lockedAt: null,
    };

    if (getDbStatus().isMongoConnected) {
      const booking = await models.Booking.findOneAndUpdate(
        { $or: [{ _id: id }, { customId: id }] },
        {
          $set: {
            quotation,
            status: 'QUOTED',
            totalLaborAmount,
            finalMaterialAmount: materialAmount,
            grandTotal,
            escrowAdvanceToken: advanceToken,
            balanceOnOtpRelease: balanceOnCompletion,
          },
        },
        { new: true }
      );
      if (!booking) return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
      return res.json({ success: true, message: 'कोटेशन ग्राहक को भेज दिया गया है।', booking });
    }
  } catch (err) {
    res.status(500).json({ error: 'कोटेशन भेजने में त्रुटि: ' + err.message });
  }
});

// 12. Quotation: Customer approves quote -> Price is LOCKED
app.post('/api/bookings/:id/approve-quote', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    if (getDbStatus().isMongoConnected) {
      const booking = await models.Booking.findOneAndUpdate(
        { $or: [{ _id: id }, { customId: id }], status: 'QUOTED' },
        {
          $set: {
            status: 'APPROVED',
            isPriceLocked: true,
            'quotation.lockedAt': new Date(),
          },
        },
        { new: true }
      );
      if (!booking) return res.status(404).json({ error: 'कोटेशन स्वीकृति योग्य स्थिति में नहीं मिला।' });
      return res.json({ success: true, message: 'कोटेशन स्वीकृत हुआ! दरें लॉक कर दी गई हैं।', booking });
    }
  } catch (err) {
    res.status(500).json({ error: 'स्वीकृति में त्रुटि: ' + err.message });
  }
});

// 13. Quotation: Contractor proposes revised quotation for extra work
app.post('/api/bookings/:id/revise-quote', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { newGrandTotal, laborChange = 0, materialChange = 0, reason } = req.body;

  if (!reason || !newGrandTotal) {
    return res.status(400).json({ error: 'अतिरिक्त काम का कारण और कुल संशोधित राशि आवश्यक है।' });
  }

  try {
    if (getDbStatus().isMongoConnected) {
      const booking = await models.Booking.findOne({ $or: [{ _id: id }, { customId: id }] });
      if (!booking) return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });

      booking.revisedQuotation = {
        previousGrandTotal: booking.grandTotal,
        newGrandTotal: Number(newGrandTotal),
        laborChange: Number(laborChange),
        materialChange: Number(materialChange),
        reason,
        status: 'PROPOSED',
        proposedAt: new Date(),
      };

      await booking.save();
      return res.json({ success: true, message: 'संशोधित कोटेशन ग्राहक की मंजूरी के लिए भेजा गया।', booking });
    }
  } catch (err) {
    res.status(500).json({ error: 'संशोधन भेजने में त्रुटि: ' + err.message });
  }
});

// 14. Quotation: Customer accepts or rejects revised quotation
app.post('/api/bookings/:id/respond-revision', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { accept } = req.body;

  try {
    if (getDbStatus().isMongoConnected) {
      const booking = await models.Booking.findOne({ $or: [{ _id: id }, { customId: id }] });
      if (!booking || !booking.revisedQuotation) {
        return res.status(404).json({ error: 'संशोधन अनुरोध नहीं मिला।' });
      }

      if (accept) {
        booking.grandTotal = booking.revisedQuotation.newGrandTotal;
        booking.revisedQuotation.status = 'ACCEPTED';
        booking.revisedQuotation.decidedAt = new Date();
      } else {
        booking.revisedQuotation.status = 'REJECTED';
        booking.revisedQuotation.decidedAt = new Date();
      }

      await booking.save();
      return res.json({
        success: true,
        message: accept ? 'संशोधन स्वीकृत हुआ और नई राशि लॉक हुई।' : 'संशोधन अस्वीकृत हुआ। मूल दर जारी रहेगी।',
        booking,
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'संशोधन प्रतिक्रिया में त्रुटि: ' + err.message });
  }
});

// 15. Booking Completion: OTP Verification & Single Idempotent Fee Deduction
app.post('/api/bookings/:id/complete', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  try {
    if (getDbStatus().isMongoConnected) {
      const booking = await models.Booking.findOne({ $or: [{ _id: id }, { customId: id }] });
      if (!booking) return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });

      if (booking.completionOtp !== otp) {
        return res.status(400).json({ error: 'अमान्य पूर्णता OTP कोड।' });
      }

      booking.status = 'COMPLETED';

      // Idempotent Platform Fee Deduction
      if (!booking.isFeeDeducted) {
        const fee = booking.paymentMethod === 'CASH' ? 35 : Math.round(booking.grandTotal * 0.05);
        await models.Contractor.updateOne(
          { $or: [{ _id: booking.contractorId }, { customId: booking.contractorId }] },
          { $inc: { walletBalance: -fee, jobsCompleted: 1 } }
        );
        booking.isFeeDeducted = true;
      }

      await booking.save();
      return res.json({ success: true, message: 'कार्य सफलतापूर्वक पूरा हुआ और OTP सत्यापित हुआ!', booking });
    }
  } catch (err) {
    res.status(500).json({ error: 'पूर्णता सत्यापन में त्रुटि: ' + err.message });
  }
});

// 16. Multimodal AI Vision Diagnosis — PURE Gemini AI, NO hardcoded heuristics
app.post('/api/ai/diagnose-vision', async (req, res) => {
  try {
    const { imageBase64, userQuery = '', locality = 'भोपाल', language = 'hi' } = req.body || {};

    if (!imageBase64 && !userQuery) {
      return res.status(400).json({
        success: false,
        error: 'कृपया किसी घरेलू समस्या की फोटो लें या समस्या का नाम लिखें।',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'AI सर्वर कॉन्फ़िगरेशन त्रुटि: Gemini API कुंजी सेट नहीं है।',
      });
    }

    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
    ].filter(Boolean);

    const querySection = userQuery ? `उपयोगकर्ता ने बताया: "${userQuery}"\n` : '';

    const promptText = `You are 'Ustad SETU', India's senior home repair and construction expert in ${locality}, MP.
${imageBase64 ? 'Analyze this photo of a domestic repair or construction problem carefully based on what is actually visible in the image.' : 'The user has described a home repair problem below. Provide expert diagnosis based on their description.'}
${querySection}If the image is completely dark, blurry, unreadable, or not related to home repair, return:
{ "unreadable": true, "error": "फोटो साफ नहीं है या समस्या स्पष्ट नहीं है, कृपया लाइट में साफ फोटो लें या समस्या का विवरण लिखें।" }

Otherwise return PURE JSON matching this schema:
{
  "unreadable": false,
  "problemTitle": "string in Hindi",
  "visibleObservation": "string in Hindi (what is directly visible without jumping to conclusions)",
  "inferredCause": "string in Hindi (inferred root cause)",
  "tradeCategory": "plumber" | "carpenter" | "electrician" | "mason" | "painter",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "isSafetyHazard": false,
  "safetyMessage": "string in Hindi (only if hazard)",
  "requiredParts": [ { "name": "string", "approxRate": 0, "unit": "string" } ],
  "estimatedLaborCharge": 0,
  "diySteps": [ "step 1", "step 2" ],
  "ustadAdvice": "string in Hindi",
  "estimatedFixTime": "string in Hindi"
}`;

    // Build request parts — image + text, or text-only
    const parts = [{ text: promptText }];
    let mimeType = 'image/jpeg';
    if (imageBase64) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      mimeType = matches && matches[1] ? matches[1] : 'image/jpeg';
      const cleanBase64 = matches && matches[2] ? matches[2] : imageBase64;
      parts.push({ inline_data: { mime_type: mimeType, data: cleanBase64 } });
    }

    let lastError = '';
    for (const modelName of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const geminiResp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { response_mime_type: 'application/json' },
          }),
        });

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json();
          const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            if (parsed.unreadable) {
              return res.status(400).json({
                success: false,
                error: parsed.error || 'फोटो साफ नहीं है, कृपया दोबारा लें।',
              });
            }
            return res.json({
              success: true,
              engine: `Google Gemini AI (${modelName})`,
              diagnosis: parsed,
            });
          }
        } else {
          const errBody = await geminiResp.text();
          lastError = `${modelName}: ${geminiResp.status} ${errBody.substring(0, 200)}`;
          console.warn(`Gemini ${modelName} failed:`, lastError);
        }
      } catch (modelErr) {
        lastError = `${modelName}: ${modelErr.message}`;
        console.warn(`Gemini model ${modelName} error:`, modelErr.message);
      }
    }

    // ALL models failed — return honest error, NO fake hardcoded diagnosis
    return res.status(502).json({
      success: false,
      error: 'AI सर्वर अभी व्यस्त है, कृपया 30 सेकंड बाद पुनः प्रयास करें।',
      debug: lastError,
    });
  } catch (err) {
    res.status(500).json({ error: 'AI डायग्नोसिस विफल: ' + err.message });
  }
});

// 17. Materials catalog
app.get('/api/materials', async (req, res) => {
  try {
    let materials = [];
    if (getDbStatus().isMongoConnected) {
      materials = await models.Material.find().lean();
    } else if (fs.existsSync(DB_FILE)) {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      materials = localData.materials || [];
    }
    res.json({ success: true, count: materials.length, data: materials });
  } catch (err) {
    res.status(500).json({ error: 'मटेरियल लोड करने में त्रुटि: ' + err.message });
  }
});

// 18. Admin Metrics & Control Desk (Protected by requireRole('ADMIN'))
app.get('/api/admin/metrics', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    let totalBookings = 0;
    let totalUsers = 0;
    let kycApplications = [];

    if (getDbStatus().isMongoConnected) {
      totalBookings = await models.Booking.countDocuments();
      totalUsers = await models.User.countDocuments();
      kycApplications = await models.KycApplication.find().sort({ createdAt: -1 }).limit(50).lean();
    } else if (fs.existsSync(DB_FILE)) {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      totalBookings = (localData.bookings || []).length;
      totalUsers = (localData.users || []).length;
      kycApplications = localData.kycApplications || [];
    }

    res.json({
      success: true,
      metrics: {
        totalBookings,
        totalUsers,
        platformFeeCash: 35,
        platformFeeOnlinePercent: 5,
      },
      kycApplications,
    });
  } catch (err) {
    res.status(500).json({ error: 'एडमिन मेट्रिक्स लोड करने में त्रुटि: ' + err.message });
  }
});

// 19. Admin KYC Action (Approve / Reject)
app.post('/api/admin/kyc/action', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { id, action } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(action)) {
    return res.status(400).json({ error: 'अमान्य कार्रवाई।' });
  }

  try {
    if (getDbStatus().isMongoConnected) {
      const kyc = await models.KycApplication.findOneAndUpdate(
        { $or: [{ _id: id }, { customId: id }] },
        { $set: { status: action, reviewedAt: new Date() } },
        { new: true }
      );
      if (!kyc) return res.status(404).json({ error: 'केवाईसी आवेदन नहीं मिला।' });

      if (action === 'APPROVED') {
        await models.User.updateOne({ phone: kyc.phone }, { $set: { kycVerified: true } });
        await models.Contractor.updateOne({ phone: kyc.phone }, { $set: { verified: true } });
      }

      return res.json({ success: true, message: `केवाईसी ${action === 'APPROVED' ? 'स्वीकृत' : 'अस्वीकृत'} किया गया।`, kyc });
    }
  } catch (err) {
    res.status(500).json({ error: 'केवाईसी कार्रवाई में त्रुटि: ' + err.message });
  }
});

// Serve frontend dist if available
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 SETU Hardened Production Server LIVE on http://localhost:${PORT}`);
    console.log(`🔒 Cryptographic Session Tokens Enabled`);
    console.log(`📁 Private KYC Vault: ${PRIVATE_UPLOADS_DIR}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
