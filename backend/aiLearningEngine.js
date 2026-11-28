/**
 * SETU Self-Learning Intelligence, Customer Listening & Circuit-Breaker Engine
 *
 * 1) Automatic Engine Health & Circuit Breaker:
 *    Tracks per-provider latency, success rate, and quota/5xx cooldowns across Chat LLMs,
 *    Text-to-Image renders, and In-Photo editors so if ANY site/API hits 402/429/503/timeout,
 *    SETU switches instantaneously to the healthiest active backup without blocking users.
 *
 * 2) Customer-First Requirement Listener:
 *    Extracts explicit style, color/finish, size, urgency, budget, and negative ("mat/nahi")
 *    constraints from every customer turn so AI prioritizes what the customer actually asked.
 *
 * 3) Persistent Self-Learning Memory (PII-Free):
 *    Learns from customer chats, material selections, 👍 likes, 👎 dislikes, refinement notes,
 *    and quote-mode preferences across cities — feeding insights back into prompts & rankings.
 */

const fs = require('fs');
const path = require('path');

const LEARNING_DB_FILE = path.join(__dirname, 'database.json');

const DEFAULT_LEARNING_STATE = {
  version: 1,
  totalInteractions: 0,
  totalLikes: 0,
  totalDislikes: 0,
  projectDemandCounts: {},
  localityProfiles: {},
  materialPopularity: {},
  stylePreferences: {
    budget: 0,
    standard: 0,
    luxury: 0,
    simple_minimal: 0,
    modern_gloss: 0,
    wooden_traditional: 0,
  },
  quoteModeChoices: {
    only_karigar: 0,
    material_and_karigar: 0,
    only_material: 0,
  },
  customerFeedbackNotes: [], // max 40 anonymized summarized preferences/complaints
  engineMetrics: {},
  updatedAt: null,
};

let memoryState = cloneDefaultState();
let persistTimer = null;

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_LEARNING_STATE));
}

function loadLearningState() {
  try {
    if (fs.existsSync(LEARNING_DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(LEARNING_DB_FILE, 'utf8'));
      if (raw && raw.aiLearning && typeof raw.aiLearning === 'object') {
        memoryState = {
          ...cloneDefaultState(),
          ...raw.aiLearning,
          stylePreferences: {
            ...DEFAULT_LEARNING_STATE.stylePreferences,
            ...(raw.aiLearning.stylePreferences || {}),
          },
          quoteModeChoices: {
            ...DEFAULT_LEARNING_STATE.quoteModeChoices,
            ...(raw.aiLearning.quoteModeChoices || {}),
          },
          projectDemandCounts: raw.aiLearning.projectDemandCounts || {},
          localityProfiles: raw.aiLearning.localityProfiles || {},
          materialPopularity: raw.aiLearning.materialPopularity || {},
          customerFeedbackNotes: Array.isArray(raw.aiLearning.customerFeedbackNotes)
            ? raw.aiLearning.customerFeedbackNotes.slice(0, 40)
            : [],
          engineMetrics: raw.aiLearning.engineMetrics || {},
        };
      }
    }
  } catch (e) {
    console.warn('[AiLearning] Could not load persisted state:', e.message);
  }
  return memoryState;
}

function schedulePersistLearningState() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      if (!fs.existsSync(LEARNING_DB_FILE)) return;
      const dbData = JSON.parse(fs.readFileSync(LEARNING_DB_FILE, 'utf8'));
      dbData.aiLearning = {
        ...memoryState,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(LEARNING_DB_FILE, JSON.stringify(dbData, null, 2));
    } catch {
      // Safe no-op on read-only serverless environments like Vercel /var/task
    }
  }, 600);
}

loadLearningState();

// ---------------------------------------------------------------------------
// 1. Automatic Engine Health & Circuit Breaker
// ---------------------------------------------------------------------------
function getOrInitMetric(category, providerId) {
  const key = `${category}:${providerId}`;
  if (!memoryState.engineMetrics[key]) {
    memoryState.engineMetrics[key] = {
      category,
      providerId,
      successes: 0,
      failures: 0,
      consecutiveFailures: 0,
      avgLatencyMs: 0,
      lastStatus: 'READY',
      lastError: '',
      cooldownUntil: 0,
      lastUsedAt: 0,
    };
  }
  return memoryState.engineMetrics[key];
}

function recordProviderOutcome(category, providerId, ok, latencyMs = 0, errorReason = '') {
  const m = getOrInitMetric(category, providerId);
  const now = Date.now();
  m.lastUsedAt = now;
  if (ok) {
    m.successes += 1;
    m.consecutiveFailures = 0;
    m.cooldownUntil = 0;
    m.lastStatus = 'HEALTHY';
    m.lastError = '';
    if (latencyMs > 0) {
      m.avgLatencyMs = m.avgLatencyMs > 0
        ? Math.round(m.avgLatencyMs * 0.7 + latencyMs * 0.3)
        : Math.round(latencyMs);
    }
  } else {
    m.failures += 1;
    m.consecutiveFailures += 1;
    const reason = String(errorReason || 'error').slice(0, 140);
    m.lastError = reason;
    // Quota / 402 / 429 / 503 triggers immediate smart cooldown; other errors trigger after 2 fails
    const isHardLimit = /402|429|503|quota|limit|busy|blocked|timeout/i.test(reason);
    if (isHardLimit || m.consecutiveFailures >= 2) {
      const backoffSec = Math.min(300, 45 * Math.pow(2, Math.min(3, m.consecutiveFailures - 1)));
      m.cooldownUntil = now + backoffSec * 1000;
      m.lastStatus = 'COOLDOWN';
    } else {
      m.lastStatus = 'DEGRADED';
    }
  }
  schedulePersistLearningState();
  return m;
}

function getOrderedProviders(category, candidateList = []) {
  const now = Date.now();
  const scored = candidateList.map((id, defaultIdx) => {
    const m = getOrInitMetric(category, id);
    const inCooldown = m.cooldownUntil > now;
    const total = m.successes + m.failures;
    const reliability = total > 0 ? m.successes / total : 0.85;
    const speedBonus = m.avgLatencyMs > 0 ? Math.max(0, 20 - m.avgLatencyMs / 1000) : 10;
    const score =
      (inCooldown ? -10000 - (m.cooldownUntil - now) / 1000 : 0) +
      reliability * 100 +
      speedBonus -
      m.consecutiveFailures * 30 -
      defaultIdx * 2; // gentle preference to curated order when scores tie
    return { id, score, inCooldown };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

// ---------------------------------------------------------------------------
// 2. Customer-First Listening Extractor (Hindi / Hinglish / English)
// ---------------------------------------------------------------------------
function anonymizeCustomerText(text = '') {
  return String(text || '')
    .replace(/(?:\+91[\-\s]?)?[6-9]\d{9}\b/g, '[phone]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCustomerListeningProfile(latestMsg = '', priorTexts = []) {
  const allText = [...priorTexts.slice(-4), latestMsg].filter(Boolean).join(' . ');
  const q = allText.toLowerCase();
  const latestLower = String(latestMsg || '').toLowerCase();

  const colors = [];
  if (/सफ़ेद|सफेद|white|ivory|क्रीम|cream|off-white/i.test(q)) colors.push('हल्का/सफ़ेद रंग');
  if (/टीक|teak|सागवान|sagwan|natural wood|नेचुरल वुड/i.test(q)) colors.push('नेचुरल सागवान/टीक');
  if (/वॉलनट|walnut|ब्राउन|brown|डार्क वुड|dark wood/i.test(q)) colors.push('डार्क वॉलनट/ब्राउन');
  if (/ग्रे|grey|gray|charcoal|स्लेट|matte black/i.test(q)) colors.push('मॉडर्न ग्रे/चारकोल');
  if (/गोल्ड|gold|brass|पीतल/i.test(q)) colors.push('गोल्डन/ब्रास टच');

  const styles = [];
  if (/सिंपल|simple|सादा|sada|minimal|बेसिक|plain/i.test(q)) styles.push('सिंपल & क्लीन डिज़ाइन');
  if (/मॉडर्न|modern|gloss|एक्रेलिक|acrylic|glass|शीशा|sleek|led/i.test(q)) styles.push('मॉडर्न & स्लीक लुक');
  if (/लक्ज़री|luxury|royal|रॉयल|नक्काशी|carving|classic/i.test(q)) styles.push('रॉयल / प्रीमियम लुक');
  if (/सस्ता|किफ़ायती|किफायती|budget|kam paise|कम खर्च|low cost|economy/i.test(q)) styles.push('कम बजट (किफ़ायती)');
  if (/मजबूत|मज़बूत|heavy|strong|durable|टिकाऊ|वाटरप्रूफ|waterproof/i.test(q)) styles.push('मज़बूत व वाटरप्रूफ');
  if (/स्टोरेज|storage|hydraulic|हाइड्रॉलिक|drawer|ड्रॉअर|box/i.test(q)) styles.push('ज़्यादा स्टोरेज वाला');

  const rejections = [];
  if (/डार्क(?:\s*(?:रंग|कलर|वुड|color|wood))?\s*(?:नहीं|मत)|गहरा(?:\s*(?:रंग|कलर))?\s*(?:नहीं|मत)|काला(?:\s*(?:रंग|कलर))?\s*(?:नहीं|मत)|dark\s*(?:color|wood)?\s*(?:mat|nahi|na)|no\s+dark|not\s+dark/i.test(q)) {
    rejections.push('डार्क/काला रंग नहीं');
  }
  if (/महंगा(?:\s*(?:सामान|मटेरियल|डिज़ाइन|माल))?\s*(?:नहीं|मत)|mehanga\s*(?:mat|nahi)|budget\s*kam|no\s+expensive|too\s+costly/i.test(q)) {
    rejections.push('महंगा सामान नहीं');
  }
  if (/चमकीला(?:\s*(?:रंग|फिनिश))?\s*(?:नहीं|मत)|gloss\s*(?:नहीं|nahi|mat)|no\s+gloss|bhari\s*(?:nahi|mat)|भारी(?:\s*(?:डिज़ाइन|काम))?\s*(?:नहीं|मत)/i.test(q)) {
    rejections.push('ज़्यादा चमकदार/भारी डिज़ाइन नहीं');
  }
  if (/पसंद नहीं|achha\s*nahi|बेकार|कुछ और|galat|बदलो|change/i.test(latestLower)) {
    rejections.push('पिछला स्टाइल बदलकर नया दिखाएं');
  }

  const urgency = /तुरंत|अभी|आज ही|urgent|emergency|इमरजेंसी|चिंगारी|spark|लीक/i.test(latestLower)
    ? 'तुरंत/इमरजेंसी जरूरत'
    : 'डिज़ाइन व विकल्प तुलना';

  const summaryChips = [...new Set([...colors, ...styles])].slice(0, 5);
  return {
    colors,
    styles,
    rejections,
    urgency,
    summaryChips,
    directVoiceSnippet: anonymizeCustomerText(latestMsg).slice(0, 140),
  };
}

// ---------------------------------------------------------------------------
// 3. Self-Learning Interaction & Feedback Recorders
// ---------------------------------------------------------------------------
function learnFromInteraction({
  projectType = 'custom',
  locality = 'भोपाल',
  selectedProducts = [],
  budget = 0,
  listeningProfile = null,
}) {
  memoryState.totalInteractions += 1;
  const pt = String(projectType || 'custom').trim();
  memoryState.projectDemandCounts[pt] = (memoryState.projectDemandCounts[pt] || 0) + 1;

  const cleanCity = String(locality || 'भोपाल').split('•')[0].split(',')[0].trim() || 'भोपाल';
  if (!memoryState.localityProfiles[cleanCity]) {
    memoryState.localityProfiles[cleanCity] = {
      queries: 0,
      avgBudget: 0,
      budgetSamples: 0,
      topProjects: {},
    };
  }
  const locEntry = memoryState.localityProfiles[cleanCity];
  locEntry.queries += 1;
  locEntry.topProjects[pt] = (locEntry.topProjects[pt] || 0) + 1;
  if (Number(budget) > 500) {
    locEntry.avgBudget = locEntry.budgetSamples > 0
      ? Math.round((locEntry.avgBudget * locEntry.budgetSamples + Number(budget)) / (locEntry.budgetSamples + 1))
      : Math.round(Number(budget));
    locEntry.budgetSamples += 1;
  }

  if (Array.isArray(selectedProducts)) {
    for (const p of selectedProducts.slice(0, 10)) {
      if (!p || !p.id) continue;
      if (!memoryState.materialPopularity[p.id]) {
        memoryState.materialPopularity[p.id] = {
          id: p.id,
          name: String(p.name || p.id).slice(0, 80),
          tier: p.tier || 'standard',
          picks: 0,
          likes: 0,
          dislikes: 0,
        };
      }
      memoryState.materialPopularity[p.id].picks += 1;
      if (['budget', 'standard', 'luxury'].includes(p.tier)) {
        memoryState.stylePreferences[p.tier] = (memoryState.stylePreferences[p.tier] || 0) + 1;
      }
    }
  }

  if (listeningProfile) {
    if (listeningProfile.styles.some((s) => s.includes('सिंपल'))) {
      memoryState.stylePreferences.simple_minimal += 1;
    }
    if (listeningProfile.styles.some((s) => s.includes('मॉडर्न'))) {
      memoryState.stylePreferences.modern_gloss += 1;
    }
    if (listeningProfile.colors.some((c) => c.includes('सागवान') || c.includes('वॉलनट'))) {
      memoryState.stylePreferences.wooden_traditional += 1;
    }
    if (listeningProfile.rejections.length > 0 && listeningProfile.directVoiceSnippet) {
      recordAnonymizedNote(`सुधार अनुरोध (${pt}): ${listeningProfile.directVoiceSnippet}`);
    }
  }

  schedulePersistLearningState();
}

function recordAnonymizedNote(noteText) {
  const safe = anonymizeCustomerText(noteText).slice(0, 160);
  if (!safe || safe.length < 6) return;
  memoryState.customerFeedbackNotes.unshift({
    text: safe,
    ts: new Date().toISOString(),
  });
  memoryState.customerFeedbackNotes = memoryState.customerFeedbackNotes.slice(0, 40);
}

function learnFromFeedback({
  rating, // 'like' | 'dislike'
  projectType = 'custom',
  locality = 'भोपाल',
  selectedProducts = [],
  comment = '',
  quoteMode = '',
}) {
  if (rating === 'like') {
    memoryState.totalLikes += 1;
  } else if (rating === 'dislike') {
    memoryState.totalDislikes += 1;
  }

  if (quoteMode && memoryState.quoteModeChoices[quoteMode] !== undefined) {
    memoryState.quoteModeChoices[quoteMode] += 1;
  }

  if (Array.isArray(selectedProducts)) {
    for (const p of selectedProducts.slice(0, 10)) {
      if (!p || !p.id) continue;
      if (!memoryState.materialPopularity[p.id]) {
        memoryState.materialPopularity[p.id] = {
          id: p.id,
          name: String(p.name || p.id).slice(0, 80),
          tier: p.tier || 'standard',
          picks: 0,
          likes: 0,
          dislikes: 0,
        };
      }
      if (rating === 'like') memoryState.materialPopularity[p.id].likes += 1;
      if (rating === 'dislike') memoryState.materialPopularity[p.id].dislikes += 1;
    }
  }

  if (comment && String(comment).trim()) {
    const cleanCity = String(locality || 'भोपाल').split('•')[0].trim();
    const prefix = rating === 'like' ? '👍 पसंद' : rating === 'dislike' ? '👎 बदलाव' : '💬 सुझाव';
    recordAnonymizedNote(`${prefix} (${cleanCity} • ${projectType}): ${comment}`);
  }

  schedulePersistLearningState();
  return getLearningInsightsSnapshot();
}

function getPopularMaterialIds(limit = 6) {
  return Object.values(memoryState.materialPopularity)
    .sort((a, b) => (b.likes * 3 + b.picks - b.dislikes * 2) - (a.likes * 3 + a.picks - a.dislikes * 2))
    .slice(0, limit)
    .map((m) => m.id);
}

function getLearnedPromptHints(projectType = 'custom', locality = 'भोपाल') {
  const cleanCity = String(locality || 'भोपाल').split('•')[0].split(',')[0].trim() || 'भोपाल';
  const locData = memoryState.localityProfiles[cleanCity];
  const topMats = Object.values(memoryState.materialPopularity)
    .sort((a, b) => (b.likes * 3 + b.picks) - (a.likes * 3 + a.picks))
    .slice(0, 3)
    .map((m) => `${m.name} (${m.tier})`);

  const sp = memoryState.stylePreferences;
  const topStyle = Object.entries({
    'Budget / Simple & Clean': (sp.budget || 0) + (sp.simple_minimal || 0),
    'Modern Gloss & Modular': sp.modern_gloss || 0,
    'Natural Wooden & Premium': (sp.wooden_traditional || 0) + (sp.luxury || 0),
  }).sort((a, b) => b[1] - a[1])[0]?.[0];

  const recentAdjustments = memoryState.customerFeedbackNotes
    .slice(0, 3)
    .map((n) => n.text)
    .join(' | ');

  if (memoryState.totalInteractions === 0 && topMats.length === 0 && !recentAdjustments) {
    return '';
  }

  return [
    `SELF-LEARNED CUSTOMER INSIGHTS (${memoryState.totalInteractions} chats, ${memoryState.totalLikes} likes):`,
    locData?.avgBudget ? `- Average ${cleanCity} customer target budget: ~₹${locData.avgBudget.toLocaleString('en-IN')}` : '',
    topStyle ? `- Dominant aesthetic taste across customers: ${topStyle}` : '',
    topMats.length > 0 ? `- Most loved raw materials: ${topMats.join(', ')}` : '',
    recentAdjustments ? `- Recent customer change requests to respect carefully: ${recentAdjustments}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function getLearningInsightsSnapshot() {
  const now = Date.now();
  const topDemands = Object.entries(memoryState.projectDemandCounts)
    .map(([projectType, count]) => ({ projectType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const popularMaterials = Object.values(memoryState.materialPopularity)
    .sort((a, b) => (b.likes * 3 + b.picks - b.dislikes * 2) - (a.likes * 3 + a.picks - a.dislikes * 2))
    .slice(0, 6);

  const engineHealth = Object.values(memoryState.engineMetrics).map((m) => ({
    key: `${m.category}:${m.providerId}`,
    category: m.category,
    providerId: m.providerId,
    status: m.cooldownUntil > now ? 'COOLDOWN' : m.lastStatus,
    cooldownRemainingSec: m.cooldownUntil > now ? Math.ceil((m.cooldownUntil - now) / 1000) : 0,
    successes: m.successes,
    failures: m.failures,
    avgLatencyMs: m.avgLatencyMs,
    lastError: m.lastError,
  }));

  return {
    totalInteractions: memoryState.totalInteractions,
    totalLikes: memoryState.totalLikes,
    totalDislikes: memoryState.totalDislikes,
    satisfactionPercent:
      memoryState.totalLikes + memoryState.totalDislikes > 0
        ? Math.round((memoryState.totalLikes / (memoryState.totalLikes + memoryState.totalDislikes)) * 100)
        : 100,
    topDemands,
    popularMaterials,
    popularMaterialIds: getPopularMaterialIds(8),
    stylePreferences: memoryState.stylePreferences,
    quoteModeChoices: memoryState.quoteModeChoices,
    recentFeedbackThemes: memoryState.customerFeedbackNotes.slice(0, 8),
    engineHealth,
  };
}

function resetAllProviderCircuits() {
  for (const key of Object.keys(memoryState.engineMetrics || {})) {
    const m = memoryState.engineMetrics[key];
    if (m) {
      m.cooldownUntil = 0;
      m.consecutiveFailures = 0;
      m.lastStatus = 'READY';
      m.lastError = '';
    }
  }
  schedulePersistLearningState();
  return getLearningInsightsSnapshot();
}

module.exports = {
  recordProviderOutcome,
  getOrderedProviders,
  extractCustomerListeningProfile,
  learnFromInteraction,
  learnFromFeedback,
  getPopularMaterialIds,
  getLearnedPromptHints,
  getLearningInsightsSnapshot,
  resetAllProviderCircuits,
};
