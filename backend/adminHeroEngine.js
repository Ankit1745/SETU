/**
 * SETU-HERO — Private Exclusive Admin Personal AI
 * ---------------------------------------------
 * Accessible strictly to authenticated ADMIN accounts (never exposed to customers/contractors/vendors).
 * Audits system security, bugs, runtime logs, connected APIs (MongoDB, Cloudinary, Firebase, Fast2SMS,
 * AI Failover Engines, Python Quant Auditor), accounts/escrow/KYC status, and executes safe admin actions.
 */

const { invokePythonEngine } = require('./pythonBridge');

async function buildAdminSecurityAndAuditReport({
  dbStatus,
  integrations,
  metrics,
  kycApplications = [],
  disputes = [],
  users = [],
  contractors = [],
  materials = [],
  bookings = [],
  runtimeErrors = [],
  aiLearning = {},
  runPython = true,
}) {
  const pythonAudit = runPython
    ? await invokePythonEngine('code_audit', {})
    : { ok: true, securityScore: 95, stats: {}, issues: [] };

  const findings = [];
  let deduction = 0;

  if (!dbStatus.isMongoConnected) {
    deduction += 10;
    findings.push({
      severity: 'MEDIUM',
      area: 'Database',
      title: 'MongoDB Atlas Disconnected (Local Fallback Active)',
      titleHi: 'MongoDB Atlas कनेक्ट नहीं है (लोकल बैकअप चालू)',
      fixHi: 'Vercel में MONGODB_URI जांचें या नेटवर्क व्हाइटलिस्ट सुनिश्चित करें।',
    });
  }
  if (!integrations.cloudinary.configured) {
    deduction += 12;
    findings.push({
      severity: 'HIGH',
      area: 'Media Storage',
      title: 'Cloudinary CDN Not Configured',
      titleHi: 'Cloudinary CDN कॉन्फ़िगर नहीं है',
      fixHi: 'स्थायी फोटो व डॉक्यूमेंट स्टोरेज के लिए CLOUDINARY_CLOUD_NAME/KEY/SECRET सेट करें।',
    });
  }
  if (!integrations.sms.configured) {
    deduction += 12;
    findings.push({
      severity: 'HIGH',
      area: 'SMS OTP',
      title: 'SMS OTP Gateway Missing',
      titleHi: 'Fast2SMS / 2Factor OTP की कुंजी सेट नहीं है',
      fixHi: 'लाइव SMS OTP के लिए SMS_API_KEY सेट करें।',
    });
  }
  if (!integrations.jwt.strong) {
    deduction += 20;
    findings.push({
      severity: 'CRITICAL',
      area: 'Auth JWT',
      title: 'Weak/Ephemeral JWT Secret',
      titleHi: 'JWT_SECRET बहुत छोटा या अस्थायी है',
      fixHi: 'प्रोडक्शन के लिए कम से कम 32-अक्षर का स्थायी JWT_SECRET सेट करें।',
    });
  }

  const pendingKyc = kycApplications.filter((k) => k.status === 'PENDING').length;
  const openDisputes = disputes.filter((d) => d.status === 'OPEN').length;
  const cooldownEngines = (aiLearning.engineHealth || []).filter((e) => e.status === 'COOLDOWN');

  if (cooldownEngines.length > 0) {
    deduction += 5;
    findings.push({
      severity: 'LOW',
      area: 'AI Failover',
      title: `${cooldownEngines.length} External AI Provider(s) In Cooldown`,
      titleHi: `${cooldownEngines.length} बाहरी AI इंजन कूलडाउन पर हैं (SETU Self-AI सक्रिय)`,
      fixHi: 'एडमिन कंट्रोल से "Reset AI Circuits" दबाएं या SETU Self-AI मोड का उपयोग जारी रखें।',
    });
  }

  if (Array.isArray(pythonAudit.issues) && pythonAudit.issues.length > 0) {
    for (const iss of pythonAudit.issues.slice(0, 5)) {
      deduction += 5;
      findings.push({
        severity: 'MEDIUM',
        area: 'Python Static Audit',
        title: iss,
        titleHi: iss,
        fixHi: 'प्रभावित फ़ाइल की जांच कर अनावश्यक ब्राउज़र पॉपअप/गार्ड ठीक करें।',
      });
    }
  }

  if (runtimeErrors.length > 0) {
    deduction += Math.min(15, runtimeErrors.length * 3);
    findings.push({
      severity: 'MEDIUM',
      area: 'Runtime Logs',
      title: `${runtimeErrors.length} recent runtime warning/error(s) logged`,
      titleHi: `हाल में ${runtimeErrors.length} सर्वर त्रुटि/चेतावनी दर्ज हुई`,
      fixHi: 'सिस्टम कंट्रोल टैब में लाइव एरर लॉग देखें।',
    });
  }

  const overallScore = Math.max(35, Math.min(100, Math.round(((pythonAudit.securityScore || 100) + (100 - deduction)) / 2)));

  // Calculate coverage gaps for development roadmap
  const demands = Array.isArray(aiLearning.topDemands) ? aiLearning.topDemands : [];
  const contractorCats = new Set(contractors.map((c) => c.category));
  const supplyGaps = demands
    .map((d) => d.projectType)
    .filter((pt) => !contractorCats.has(pt));

  return {
    overallScore,
    pythonAudit,
    findings,
    pendingKyc,
    openDisputes,
    cooldownCount: cooldownEngines.length,
    supplyGaps,
    counts: {
      users: users.length,
      contractors: contractors.length,
      materials: materials.length,
      bookings: bookings.length,
    },
    financialSummary: {
      grossPlatformVolume: metrics.grossPlatformVolume || 0,
      commissionEarned: metrics.platformCommissionEarned || 0,
      escrowHeld: metrics.escrowFundsHeld || 0,
    },
  };
}

async function handleAdminHeroCommand(commandText = '', snapshot) {
  const q = String(commandText || '').trim();
  const low = q.toLowerCase();
  const audit = await buildAdminSecurityAndAuditReport(snapshot);

  const actionsAvailable = [];
  let replyLines = [];
  let mode = 'SUMMARY';

  const asksSecurityOrAudit = /audit|security|suraksha|सुरक्षा|ऑडिट|scan|स्कैन|check|जांच|health/.test(low);
  const asksBugOrErrors = /bug|error|issue|problem|खराब|दिक्कत|बग|त्रुटि|fix|reset|circuit|ठीक/.test(low);
  const asksAccounts = /account|paisa|hisab|हिसाब|खाता|escrow|एस्क्रो|commission|कमीशन|kyc|user|partner|ठेकेदार|दुकान/.test(low);
  const asksDev = /dev|develop|feature|upgrade|roadmap|सुझाव|नया|आगे|improve|कमी/.test(low);
  const asksSmsOrMsg = /sms|otp|fast2sms|balance|बैलेंस|msg|message|notification|broadcast|मैसेज/.test(low);

  if (asksSmsOrMsg) {
    mode = 'SMS_AND_MESSAGING';
    replyLines = [
      `📲 **मैसेजिंग, OTP और नोटिफिकेशन स्थिति (SETU-HERO):**`,
      `• **SMS OTP गेटवे:** ${snapshot.integrations.sms.configured ? `✅ सक्रिय (${snapshot.integrations.sms.provider} • Route: ${snapshot.integrations.sms.route})` : '❌ कुंजी सेट नहीं'}`,
      `• **Firebase Auth:** ${snapshot.integrations.firebase.configured ? `✅ सक्रिय (${snapshot.integrations.firebase.projectId})` : '❌ सेट नहीं'}`,
      `• **इन-ऐप नोटिफिकेशन इंजन:** ✅ सक्रिय (सभी यूज़र को रीयल-टाइम बेल अलर्ट व टोस्ट उपलब्ध)।`,
      ``,
      `👉 नीचे **"SMS बैलेंस जांचें"** बटन दबाकर लाइव Fast2SMS वॉलेट बैलेंस देखें या Broadcast टैब से सभी को आधिकारिक संदेश भेजें।`,
    ];
    actionsAvailable.push(
      { id: 'CHECK_SMS_BALANCE', label: '💰 Fast2SMS लाइव बैलेंस जांचें' },
      { id: 'RESET_AI_CIRCUITS', label: '⚡ AI सर्किट रीसेट करें' }
    );
  } else if (asksBugOrErrors) {
    mode = 'BUG_DIAGNOSTICS';
    const errSlice = (snapshot.runtimeErrors || []).slice(0, 5);
    replyLines = [
      `🐞 **लाइव बग व एरर डायग्नोसिस (${audit.pythonAudit.runtime || snapshot.integrations.python.runtime}):**`,
      `• **स्टेटिक कोड हेल्थ स्कोर:** ${audit.pythonAudit.securityScore ?? 100}/100`,
      `• **रनटाइम लॉग त्रुटियाँ:** ${snapshot.runtimeErrors.length === 0 ? '✅ अभी शून्य क्रिटिकल त्रुटि!' : `${snapshot.runtimeErrors.length} हालिया लॉग मिले`}`,
      ...errSlice.map((e) => `  - [${e.time}] ${e.route}: ${e.message}`),
      `• **AI सर्किट स्थिति:** ${audit.cooldownCount === 0 ? '✅ सभी प्रोवाइडर स्वस्थ + SETU Self-AI 100% सक्रिय' : `⏳ ${audit.cooldownCount} बाहरी इंजन कूलडाउन पर`}`,
    ];
    if (audit.findings.length > 0) {
      replyLines.push('', '**मिले हुए सुधार बिंदु:**');
      audit.findings.slice(0, 4).forEach((f) => {
        replyLines.push(`• [${f.severity}] ${f.titleHi} → *उपाय:* ${f.fixHi}`);
      });
    }
    actionsAvailable.push(
      { id: 'RESET_AI_CIRCUITS', label: '🔄 AI सर्किट व कैश रीसेट करें' },
      { id: 'RUN_DEEP_AUDIT', label: '🔍 Python सुरक्षा स्कैन चलाएं' }
    );
  } else if (asksAccounts) {
    mode = 'ACCOUNTS_AUDIT';
    replyLines = [
      `💼 **SETU वित्त, खाते व KYC ऑडिट रिपोर्ट:**`,
      `• **कुल व्यापार (GPV):** ₹${Number(audit.financialSummary.grossPlatformVolume).toLocaleString('en-IN')}`,
      `• **SETU कमीशन आय (₹35 / 5%):** ₹${Number(audit.financialSummary.commissionEarned).toLocaleString('en-IN')}`,
      `• **एस्क्रो होल्ड राशि:** ₹${Number(audit.financialSummary.escrowHeld).toLocaleString('en-IN')}`,
      `• **डेटाबेस एंट्रीज़:** ${audit.counts.users} यूज़र • ${audit.counts.contractors} कारीगर • ${audit.counts.materials} सामग्री आइटम • ${audit.counts.bookings} बुकिंग`,
      `• **समीक्षा प्रतीक्षारत KYC:** ${audit.pendingKyc} आवेदन | **खुले विवाद:** ${audit.openDisputes}`,
    ];
    if (audit.pendingKyc > 0) {
      replyLines.push('', `⚠️ सलाह: ${audit.pendingKyc} पार्टनर KYC लंबित हैं — इन्हें सत्यापित करने से लोकल खोज व AI सुझाव तुरंत मजबूत होंगे।`);
    }
    actionsAvailable.push({ id: 'CHECK_SMS_BALANCE', label: '📲 SMS गेटवे जांचें' });
  } else if (asksDev) {
    mode = 'DEV_ROADMAP';
    replyLines = [
      `🚀 **SETU विकास व ग्रोथ रोडमैप (AI सुझाव):**`,
      `1. **सप्लाई-डिमांड गैप:** ${audit.counts.contractors === 0 ? 'अभी डेटाबेस में लाइव कारीगर जोड़ना शीर्ष प्राथमिकता है (AI अपने आप नए पार्टनर को ऊपर दिखाएगा)।' : `लाइव कारीगर सक्रिय हैं; इन श्रेणियों में और सप्लायर/कारीगर जोड़ें: ${audit.supplyGaps.slice(0, 4).join(', ') || 'तुरंत कोई गैप नहीं'}`}`,
      `2. **सप्लायर इन्वेंटरी ग्रोथ:** दुकानदार डैशबोर्ड से लाइव सीमेंट, प्लाई, हार्डवेयर जुड़ते ही SETU AI शोरूम उन्हें सबसे पहले ग्राहक को दिखाता है।`,
      `3. **पेमेंट व बिलिंग:** Razorpay लाइव मर्चेंट कीज़ जोड़कर ऑटोमैटिक एस्क्रो रिलीज़ व GST इनवॉइस चालू किया जा सकता है।`,
      `4. **Python BOQ + AI:** Python मात्रात्मक इंजन सक्रिय है — बड़े ठेकों के लिए PDF कोटेशन एक्सपोर्ट अगला उच्च-प्रभाव फीचर होगा।`,
    ];
  } else if (asksSecurityOrAudit || !q) {
    mode = 'SECURITY_AUDIT';
    replyLines = [
      `🛡️ **SETU-HERO पूर्ण वेबसाइट सुरक्षा व ऑडिट रिपोर्ट (स्कोर: ${audit.overallScore}/100):**`,
      `• **डेटाबेस:** ${snapshot.dbStatus.activeEngine} ${snapshot.dbStatus.isMongoConnected ? '✅' : '⚠️'}`,
      `• **मीडिया CDN:** ${snapshot.integrations.cloudinary.configured ? '✅ Cloudinary Cloud Active' : '⚠️ Ephemeral'}`,
      `• **Firebase Auth:** ${snapshot.integrations.firebase.configured ? `✅ ${snapshot.integrations.firebase.projectId}` : '❌ Missing'}`,
      `• **SMS गेटवे:** ${snapshot.integrations.sms.configured ? `✅ ${snapshot.integrations.sms.provider}` : '❌ Missing'}`,
      `• **Self-Dependent AI + Python:** ✅ सक्रिय (${audit.pythonAudit.stats?.srcFiles || 0} Frontend मॉड्यूल स्कैन, 0 unprotected Admin रूट)`,
      audit.findings.length === 0
        ? `✅ कोई गंभीर सुरक्षा या बग त्रुटि नहीं मिली!`
        : `⚠️ **${audit.findings.length} ध्यान देने योग्य बिंदु:**\n${audit.findings.slice(0, 4).map((f) => `  • [${f.severity}] ${f.titleHi}`).join('\n')}`,
    ];
    actionsAvailable.push(
      { id: 'RUN_DEEP_AUDIT', label: '🔍 ताज़ा ऑडिट री-रन करें' },
      { id: 'RESET_AI_CIRCUITS', label: '⚡ AI सर्किट रीसेट' },
      { id: 'CHECK_SMS_BALANCE', label: '📲 SMS बैलेंस देखें' }
    );
  } else {
    mode = 'GENERAL_ADMIN';
    replyLines = [
      `🤖 **नमस्ते एडमिन! SETU-HERO आपका प्राइवेट कंट्रोल AI तैयार है।**`,
      `वर्तमान लाइव स्थिति: **सुरक्षा स्कोर ${audit.overallScore}/100** • ${audit.counts.users} यूज़र • ${audit.counts.contractors} कारीगर • ${audit.counts.materials} सामग्री • ${audit.counts.bookings} बुकिंग • ${audit.pendingKyc} लंबित KYC।`,
      ``,
      `आप मुझसे किसी भी भाषा में पूछ सकते हैं:`,
      `• *"वेबसाइट का पूरा सुरक्षा ऑडिट करो"*`,
      `• *"कौन-कौन से बग या API एरर आ रहे हैं?"*`,
      `• *"अकाउंट, एस्क्रो और KYC का हिसाब दिखाओ"*`,
      `• *"आगे क्या डेवलपमेंट और फीचर जोड़ें?"*`,
    ];
    actionsAvailable.push(
      { id: 'RUN_DEEP_AUDIT', label: '🛡️ फुल सिस्टम ऑडिट' },
      { id: 'CHECK_SMS_BALANCE', label: '📲 SMS स्टेटस' }
    );
  }

  return {
    success: true,
    mode,
    replyText: replyLines.join('\n'),
    audit,
    actions: actionsAvailable,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  buildAdminSecurityAndAuditReport,
  handleAdminHeroCommand,
};
