/**
 * SETU Sovereign Self-Dependent AI Engine
 * Works 100% independently WITHOUT requiring external Gemini / OpenAI / ChatGPT APIs.
 * Features:
 * 1) Domain Technical Knowledge Base (material comparisons, IS-456/CPWD rules, electrical/plumbing diagnostics)
 * 2) Live Platform Contractor & Supplier Auto-Matching & Recommendation Pitching
 * 3) Self-Contained Quantitative Architectural Blueprint SVG Renderer (zero external dependencies)
 */

const TECHNICAL_KNOWLEDGE_BASE = [
  {
    id: 'wood_comparison',
    test: /(सागवान|sagwan|teak|शीशम|sheesham|oak|प्लाई|ply|bwp|bwr|hdhmr|mdf|बोर्ड)/i,
    testCompare: /(vs|या|अंतर|better|कौन|best|diff|फर्क|मजबूत|durable|दीमक|termite|water)/i,
    hi: `🪵 **लकड़ी व प्लाईवुड तकनीकी तुलना (SETU मास्टर सलाह):**
• **BWP 710 मरीन प्लाई:** किचन सिंक, बाथरूम और नमी वाली जगह के लिए सबसे टिकाऊ (उबलते पानी में भी 72+ घंटे सुरक्षित, दीमक-रोधी)।
• **HDHMR हाई-डेंसिटी बोर्ड:** स्मूद CNC कर्व डिज़ाइन, मॉड्यूलर वार्डरोब शटर व ड्राई एरिया के लिए शानदार (स्क्रू पकड़ मजबूत, लेकिन सीधे पानी में BWP 710 बेहतर)।
• **असली MP सागवान बनाम शीशम:** मुख्य दरवाज़े व प्रीमियम बेड/सोफा फ्रेम में सागवान नमी में कम मुड़ता है; शीशम भारी, सघन ग्रेन और बहुत मजबूत फर्नीचर के लिए श्रेष्ठ है।`,
    en: `🪵 **Timber & Plywood Engineering Guide:**
• **BWP IS:710 Marine Ply:** Best for wet zones (kitchen sink cabinet, vanity) — boiling-water proof & termite treated.
• **HDHMR Board:** Ideal for smooth CNC routered wardrobe shutters & dry modular units (high screw retention, slightly heavier).
• **MP Teak (Sagwan) vs Sheesham:** Teak resists moisture warping best for main doors & frames; Sheesham offers dense heavy-grain durability for heirloom beds & dining.`,
  },
  {
    id: 'cement_steel',
    test: /(सीमेंट|cement|सरिया|sariya|tmt|ppc|opc|रेत|sand|मोरंग|गिट्टी|अनुमान|लेंटर|slab|छत)/i,
    testCompare: /(vs|कौन|best|कितना|bag|kg|sq\.?ft|strength|मजबूत|fe550|ppc|opc)/i,
    hi: `🏗️ **सिविल निर्माण व IS-456 मानक नियम (SETU सिविल गाइड):**
• **PPC vs OPC-53 सीमेंट:** दीवार चिनाई, प्लास्टर और सामान्य घर की छत के लिए **PPC सीमेंट** बेहतर है (कम दरारें, समय के साथ ज्यादा मजबूती); हेवी कॉलम/तेज़ शटरिंग खोलने के लिए **OPC 53** चुनें।
• **TMT सरिया (Fe-500D / Fe-550D):** भूकंप-रोधी लचीलेपन के लिए Fe-500D डक्टाइल ग्रेड सबसे अच्छा है।
• **तुरंत अनुमान सूत्र (प्रति 1,000 sq.ft आरसीसी निर्माण):** ~400–430 बोरी सीमेंट, ~3,800 kg TMT स्टील, ~1,350 घन फीट नदी रेत, ~1,150 घन फीट गिट्टी।`,
    en: `🏗️ **Civil & Structural IS-456 Thumb Rules:**
• **PPC vs OPC-53 Cement:** Use **PPC** for brickwork, plastering, and residential slabs (lower thermal cracking & better long-term hydration). Use **OPC-53** for fast-strip structural columns.
• **TMT Rebar:** **Fe-500D / Fe-550D** gives optimal ductility for seismic resistance.
• **Quick 1,000 sq.ft RCC Benchmark:** ~400–430 cement bags, ~3,850 kg TMT steel, ~1,350 cft sand, ~1,150 cft aggregate.`,
  },
  {
    id: 'laminate_acrylic',
    test: /(माइका|mica|sunmica|सनमाइका|लैमिनेट|laminate|एक्रेलिक|acrylic|विनीयर|veneer|pu|ग्लॉस)/i,
    testCompare: /(vs|या|अंतर|better|कौन|best|diff|फर्क|rate|साफ|scratch)/i,
    hi: `✨ **सनमाइका बनाम एक्रेलिक बनाम विनीयर तुलना:**
• **1mm ब्रांडेड माइका (Greenlam/Merino):** सबसे किफायती, स्क्रैच-रोधी और रोज़मर्रा के रफ-एंड-टफ भारतीय किचन व अलमारी के लिए बेस्ट।
• **1.5mm एक्रेलिक शीट:** शीशे जैसी हाई-ग्लॉस चमक, लेकिन माइका से लगभग 2x महंगा; सॉफ्ट माइक्रोफाइबर कपड़े से साफ करें।
• **नेचुरल विनीयर + PU पॉलिश:** असली लकड़ी जैसा रॉयल लुक, लेकिन 5–6 साल में हल्की पॉलिश रीफ्रेश की जरूरत होती है।`,
    en: `✨ **Sunmica vs Acrylic vs Veneer Comparison:**
• **1mm Laminate (Sunmica):** Most scratch-resistant, value-for-money & easiest daily maintenance for Indian homes.
• **1.5mm Acrylic:** Mirror-like luxury gloss finish (~2x laminate price), needs gentle microfiber cleaning.
• **Natural Veneer + PU:** Rich genuine timber aesthetic, higher budget with periodic polish care.`,
  },
  {
    id: 'electrical_wiring',
    test: /(वायर|wire|तार|केबल|cable|mcb|switch|स्विच|inverter|अर्थिंग|earthing|load|लोड)/i,
    testCompare: /(mm|gauge|कौन|best|size|amp|लोड|load|fire|जल|सुरक्षा)/i,
    hi: `⚡ **सुरक्षित घरेलू वायरिंग मानक (SETU इलेक्ट्रिकल गाइड):**
• **लाइट व पंखे पॉइंट:** 1.0 sq.mm FR-LSH कॉपर वायर।
• **सामान्य पावर सॉकेट (6A/16A):** 2.5 sq.mm + ग्रीन 1.5 sq.mm अर्थिंग वायर।
• **AC, गीज़र, इंडक्शन व मेन लाइन:** 4.0 sq.mm शुद्ध कॉपर FR-LSH (Finolex/Polycab/Havells) + प्रत्येक कमरे के लिए अलग **MCB व मुख्य बोर्ड पर 30mA RCCB/ELCB** अनिवार्य लगवाएं।`,
    en: `⚡ **Safe Residential Wiring Standard:**
• **Lights & Fans:** 1.0 sq.mm FR-LSH Copper.
• **Power Sockets (6A/16A):** 2.5 sq.mm Copper + 1.5 sq.mm green earth wire.
• **AC, Geyser & Main Feed:** 4.0 sq.mm FR-LSH Copper + dedicated **MCBs & 30mA RCCB/ELCB** at main DB for shock protection.`,
  },
  {
    id: 'paint_waterproof',
    test: /(पेंट|paint|पुट्टी|putty|सीलन|seelan|damp|waterproof|वाटरप्रूफ|रॉयल|apex|प्राइमर|primer)/i,
    testCompare: /(vs|या|अंतर|कैसे|best|कौन|process|रोक|cost|coat|कोट)/i,
    hi: `🎨 **सीलन-मुक्त पेंटिंग और वाटरप्रूफिंग प्रक्रिया:**
1. सबसे पहले लीकेज का स्रोत (पाइप या छत की दरार) ठीक करें — वरना नया पेंट फिर पपड़ी बनकर उखड़ेगा।
2. लोहे के ब्रश से स्क्रैपिंग कर 1 कोट **डैम्पगार्ड / प्राइमर**, फिर **2 कोट वाटरप्रूफ पुट्टी** और सैंडिंग करें।
3. अंदर के कमरों में वॉशेबल लक्ज़री इमल्शन (2 कोट) और बाहरी दीवार पर एंटी-एल्गल वेदर-शील्ड पेंट चुनें (~110 sq.ft/लीटर कवरेज)।`,
    en: `🎨 **Damp-Proof Painting & Seepage Protocol:**
1. Fix plumbing/terrace crack source first before applying putty/paint.
2. Wire-brush flaking spots -> 1 coat damp-barrier primer -> 2 coats waterproof wall putty -> fine sanding.
3. Finish interior walls with 2 coats washable emulsion (~110 sq.ft/L double coat) and exterior with weather-shield coating.`,
  },
];

function matchDomainKnowledgeReply(query = '', language = 'hi') {
  const q = String(query || '').trim();
  if (!q) return null;
  for (const entry of TECHNICAL_KNOWLEDGE_BASE) {
    if (entry.test.test(q) && (entry.testCompare.test(q) || /\?|कैसे|बताओ|explain|guide|नियम/i.test(q))) {
      return language === 'en' ? entry.en : entry.hi;
    }
  }
  return null;
}

function summarizeLiveMatchesForChat(liveContractors = [], liveMaterials = [], tradeCategory = '', locality = '', language = 'hi') {
  const target = String(tradeCategory || '').toLowerCase();
  const areaWords = String(locality || '')
    .toLowerCase()
    .split(/[,•\s()]+/)
    .filter((w) => w.length >= 3);

  const matchingPros = (Array.isArray(liveContractors) ? liveContractors : [])
    .filter((c) => !target || c.category === target || c.category === 'general')
    .sort((a, b) => {
      const aVerified = a.verified ? 2 : 0;
      const bVerified = b.verified ? 2 : 0;
      const aArea = areaWords.some((w) => `${a.name} ${a.specialtyHindi} ${a.city || ''} ${a.distance || ''}`.toLowerCase().includes(w)) ? 2 : 0;
      const bArea = areaWords.some((w) => `${b.name} ${b.specialtyHindi} ${b.city || ''} ${b.distance || ''}`.toLowerCase().includes(w)) ? 2 : 0;
      return (bVerified + bArea + (b.rating || 0)) - (aVerified + aArea + (a.rating || 0));
    })
    .slice(0, 2);

  const matchingMats = (Array.isArray(liveMaterials) ? liveMaterials : [])
    .filter((m) => m.inStock !== false && (!target || m.category === target || m.category === 'general'))
    .slice(0, 3);

  const lines = [];
  if (matchingPros.length > 0) {
    lines.push(
      language === 'en'
        ? `👷 Live Verified Pros Suggested: ${matchingPros.map((p) => `${p.name} (${p.verified ? 'Verified' : 'Partner'})`).join(', ')}`
        : `👷 आपके शहर के सुझाए गए कारीगर: ${matchingPros.map((p) => `${p.name}${p.verified ? ' ✓' : ''}`).join(', ')}`
    );
  }
  if (matchingMats.length > 0) {
    lines.push(
      language === 'en'
        ? `🏪 Live Supplier Stock Matched: ${matchingMats.map((m) => `${m.name} @ ₹${m.sellingPrice}/${m.unit} (${m.storeName})`).join(' | ')}`
        : `🏪 दुकानदारों से जुड़ा लाइव माल: ${matchingMats.map((m) => `${m.name} (₹${m.sellingPrice}/${m.unit} • ${m.storeName})`).join(' | ')}`
    );
  }
  return lines.join('\n');
}

function escapeXml(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an inline architectural schematic & photoreal-palette blueprint SVG as Base64 Data URI.
 * Ensures SETU AI NEVER returns blank/broken visuals even when third-party GPU image hosts are down.
 */
function renderSovereignSvgBlueprint({
  prompt = '',
  projectType = 'custom',
  title = 'SETU Architectural Concept',
  dimensions = 'Standard Pro Spec',
  locality = 'भोपाल',
  finishNotes = '',
}) {
  const low = `${prompt} ${projectType} ${finishNotes}`.toLowerCase();
  const isDarkWalnut = /walnut|dark|teak|सागवान|डार्क|शीशम/.test(low);
  const isKitchen = projectType === 'kitchen' || /kitchen|किचन|modular/.test(low);
  const isWardrobe = projectType === 'wardrobe' || /wardrobe|अलमारी|almirah/.test(low);
  const isBed = projectType === 'bed' || /bed|बेड|पलंग/.test(low);
  const isHouse = projectType === 'house' || /house|मकान|elevation|plot|प्लॉट/.test(low);
  const isGate = projectType === 'iron_gate' || /gate|गेट|grill|railing/.test(low);

  const woodPrimary = isDarkWalnut ? '#5C3A21' : '#A47148';
  const woodSecondary = isDarkWalnut ? '#3F2715' : '#7F5539';
  const accentGold = '#F59E0B';
  const wallBg = '#F1F5F9';

  let centerArtwork = '';
  if (isKitchen) {
    centerArtwork = `
      <rect x="75" y="95" width="490" height="245" rx="10" fill="${wallBg}" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="95" y="110" width="190" height="72" rx="4" fill="${woodPrimary}" stroke="${woodSecondary}" stroke-width="2"/>
      <rect x="355" y="110" width="190" height="72" rx="4" fill="${woodPrimary}" stroke="${woodSecondary}" stroke-width="2"/>
      <polygon points="295,110 345,110 355,155 285,155" fill="#1E293B"/>
      <rect x="313" y="88" width="14" height="24" fill="#334155"/>
      <rect x="95" y="232" width="450" height="14" rx="2" fill="#0F172A"/>
      <rect x="95" y="246" width="450" height="82" rx="4" fill="${woodSecondary}" stroke="#1E293B" stroke-width="2"/>
      <line x1="185" y1="246" x2="185" y2="328" stroke="#E2E8F0" stroke-width="1.5"/>
      <line x1="275" y1="246" x2="275" y2="328" stroke="#E2E8F0" stroke-width="1.5"/>
      <line x1="365" y1="246" x2="365" y2="328" stroke="#E2E8F0" stroke-width="1.5"/>
      <line x1="455" y1="246" x2="455" y2="328" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="195" y="224" width="60" height="8" rx="2" fill="#94A3B8"/>
      <rect x="295" y="226" width="52" height="6" rx="2" fill="#EF4444"/>
      <rect x="95" y="185" width="450" height="4" fill="${accentGold}" opacity="0.7"/>
    `;
  } else if (isWardrobe) {
    centerArtwork = `
      <rect x="120" y="88" width="400" height="252" rx="8" fill="${wallBg}" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="145" y="102" width="350" height="46" rx="3" fill="${woodPrimary}" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="145" y="152" width="114" height="176" rx="3" fill="${woodSecondary}" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="263" y="152" width="114" height="176" rx="3" fill="${woodPrimary}" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="381" y="152" width="114" height="176" rx="3" fill="${woodSecondary}" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="247" y="222" width="4" height="36" rx="2" fill="${accentGold}"/>
      <rect x="366" y="222" width="4" height="36" rx="2" fill="${accentGold}"/>
      <rect x="390" y="222" width="4" height="36" rx="2" fill="${accentGold}"/>
    `;
  } else if (isBed) {
    centerArtwork = `
      <rect x="90" y="92" width="460" height="245" rx="10" fill="${wallBg}" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="170" y="112" width="300" height="90" rx="8" fill="${woodSecondary}" stroke="${accentGold}" stroke-width="2"/>
      <rect x="188" y="128" width="126" height="48" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
      <rect x="326" y="128" width="126" height="48" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
      <rect x="158" y="182" width="324" height="118" rx="10" fill="#E2E8F0" stroke="${woodPrimary}" stroke-width="6"/>
      <rect x="170" y="242" width="300" height="54" rx="6" fill="#3B82F6" opacity="0.22"/>
      <rect x="108" y="205" width="44" height="62" rx="5" fill="${woodPrimary}"/>
      <rect x="488" y="205" width="44" height="62" rx="5" fill="${woodPrimary}"/>
    `;
  } else if (isHouse) {
    centerArtwork = `
      <rect x="85" y="88" width="470" height="252" rx="10" fill="#DBEAFE" stroke="#93C5FD" stroke-width="2"/>
      <rect x="85" y="295" width="470" height="45" fill="#64748B"/>
      <rect x="150" y="135" width="340" height="160" fill="#FFFFFF" stroke="#334155" stroke-width="2.5"/>
      <rect x="150" y="195" width="340" height="14" fill="#1E293B"/>
      <rect x="180" y="218" width="64" height="77" fill="${woodPrimary}" stroke="#1E293B" stroke-width="2"/>
      <rect x="276" y="220" width="90" height="44" fill="#93C5FD" stroke="#334155" stroke-width="2"/>
      <rect x="392" y="146" width="76" height="42" fill="#BAE6FD" stroke="#334155" stroke-width="2"/>
      <rect x="180" y="146" width="175" height="42" fill="#E0F2FE" stroke="#334155" stroke-width="2"/>
      <rect x="142" y="126" width="356" height="10" fill="${accentGold}"/>
    `;
  } else if (isGate) {
    centerArtwork = `
      <rect x="110" y="95" width="420" height="240" rx="10" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
      <rect x="125" y="110" width="32" height="215" fill="#64748B"/>
      <rect x="483" y="110" width="32" height="215" fill="#64748B"/>
      <rect x="160" y="125" width="158" height="195" fill="#1E293B" stroke="${accentGold}" stroke-width="2"/>
      <rect x="322" y="125" width="158" height="195" fill="#1E293B" stroke="${accentGold}" stroke-width="2"/>
      <line x1="190" y1="125" x2="190" y2="320" stroke="#CBD5E1" stroke-width="3"/>
      <line x1="225" y1="125" x2="225" y2="320" stroke="#CBD5E1" stroke-width="3"/>
      <line x1="260" y1="125" x2="260" y2="320" stroke="#CBD5E1" stroke-width="3"/>
      <line x1="355" y1="125" x2="355" y2="320" stroke="#CBD5E1" stroke-width="3"/>
      <line x1="390" y1="125" x2="390" y2="320" stroke="#CBD5E1" stroke-width="3"/>
      <line x1="425" y1="125" x2="425" y2="320" stroke="#CBD5E1" stroke-width="3"/>
    `;
  } else {
    centerArtwork = `
      <rect x="95" y="95" width="450" height="240" rx="10" fill="${wallBg}" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="145" y="125" width="350" height="175" rx="8" fill="${woodPrimary}" opacity="0.92" stroke="${accentGold}" stroke-width="2"/>
      <rect x="175" y="150" width="135" height="125" rx="4" fill="#FFFFFF" opacity="0.85"/>
      <rect x="330" y="150" width="135" height="125" rx="4" fill="${woodSecondary}" opacity="0.95"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#bg)"/>
  <g stroke="#334155" stroke-width="0.6" opacity="0.4">
    <line x1="0" y1="80" x2="640" y2="80"/>
    <line x1="0" y1="160" x2="640" y2="160"/>
    <line x1="0" y1="240" x2="640" y2="240"/>
    <line x1="0" y1="320" x2="640" y2="320"/>
    <line x1="160" y1="0" x2="160" y2="400"/>
    <line x1="320" y1="0" x2="320" y2="400"/>
    <line x1="480" y1="0" x2="480" y2="400"/>
  </g>
  <rect x="20" y="16" width="600" height="46" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1"/>
  <text x="36" y="38" fill="#FBBF24" font-family="sans-serif" font-size="13" font-weight="bold">SETU SELF-AI ARCHITECTURAL BLUEPRINT</text>
  <text x="36" y="54" fill="#CBD5E1" font-family="sans-serif" font-size="11">${escapeXml(title.slice(0, 48))} • ${escapeXml(dimensions.slice(0, 28))}</text>
  <text x="602" y="44" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="11" font-weight="bold">${escapeXml(String(locality || 'INDIA').split('•')[0].slice(0, 18))}</text>
  ${centerArtwork}
  <rect x="20" y="354" width="600" height="32" rx="8" fill="#0B1120" stroke="#334155"/>
  <text x="34" y="374" fill="#94A3B8" font-family="sans-serif" font-size="11">Material Swatch: ${escapeXml(finishNotes.slice(0, 62) || 'SETU Verified Grade Raw Materials')}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

module.exports = {
  matchDomainKnowledgeReply,
  summarizeLiveMatchesForChat,
  renderSovereignSvgBlueprint,
};
