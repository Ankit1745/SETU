/**
 * Backend 15-Trade Rate Mapping & Mandatory Validation Guard
 * Synced cleanly with src/data/tradeRateConfig.ts
 */

const VALID_CONTRACTOR_CATEGORIES = [
  'carpenter',
  'mason',
  'painter',
  'electrician',
  'plumber',
  'tiling',
  'false_ceiling',
  'welder',
  'aluminium_upvc',
  'waterproofing',
  'ac_repair',
  'labor',
  'wedding_tent',
  'caterer',
  'wedding_photo',
  'wedding_makeup',
  // Expanded 12-Category Unified Domains
  'it_digital',
  'hospitality_retail',
  'home_care',
  'auto_transport',
  'beauty_wellness',
  'business_legal',
  'education',
  'industrial',
  'other_custom',
  // Legacy aliases accepted seamlessly
  'general',
  'cleaning',
  'event_dj',
  'acrepair',
  'wedding_catering',
];

function mapTradeToCanonicalCategory(trade = '') {
  const s = String(trade || '').trim().toLowerCase();
  if (!s) return 'general';
  if (VALID_CONTRACTOR_CATEGORIES.includes(s)) return s;

  if (s.includes('false_ceiling') || s.includes('pop') || s.includes('सीलिंग') || s.includes('जिप्सम')) return 'false_ceiling';
  if (s.includes('aluminium') || s.includes('upvc') || s.includes('ग्लास') || s.includes('एल्युमिनियम')) return 'aluminium_upvc';
  if (s.includes('waterproof') || s.includes('वॉटरप्रूफ') || s.includes('वाटरप्रूफ')) return 'waterproofing';
  if (s.includes('tiling') || s.includes('tile') || s.includes('टाइल') || s.includes('मार्बल')) return 'tiling';
  if (s.includes('weld') || s.includes('सरिया') || s.includes('ग्रिल') || s.includes('फैब्रिकेटर') || s.includes('वेल्ड') || s.includes('लोहा')) return 'welder';
  if (s.includes('carpenter') || s.includes('बढ़ई') || s.includes('कारपेंटर') || s.includes('फर्नीचर')) return 'carpenter';
  if (s.includes('mason') || s.includes('मिस्त्री') || s.includes('राजमिस्त्री') || s.includes('सिविल') || s.includes('मकान') || s.includes('आर्किटेक्ट') || s.includes('architect')) return 'mason';
  if (s.includes('painter') || s.includes('पेंटर') || s.includes('रंगाई') || s.includes('पुट्टी')) return 'painter';
  if (s.includes('electr') || s.includes('इलेक्ट्रीशियन') || s.includes('बिजली') || s.includes('वायरिंग') || s.includes('cctv')) return 'electrician';
  if (s.includes('plumber') || s.includes('प्लंबर') || s.includes('सेनेटरी')) return 'plumber';
  if (s.includes('ac') || s.includes('एसी') || s.includes('कंप्रेसर') || s.includes('कूलिंग') || s.includes('appliance') || s.includes('फ्रिज') || s.includes('रो') || s.includes('ro')) return 'ac_repair';
  if (s.includes('jcb') || s.includes('ट्रॉली') || s.includes('हेल्पर') || s.includes('labor') || s.includes('मजदूर') || s.includes('मलबा')) return 'labor';
  if (s.includes('टेंट') || s.includes('डेकोर') || s.includes('mandap') || s.includes('wedding_tent') || s.includes('planner') || s.includes('बैंड') || s.includes('band')) return 'wedding_tent';
  if (s.includes('कैटर') || s.includes('हलवाई') || s.includes('cater')) return 'caterer';
  if (s.includes('फोटोग्राफर') || s.includes('फोटो') || s.includes('कैमरा') || s.includes('photo') || s.includes('drone') || s.includes('ड्रोन') || s.includes('anchor')) return 'wedding_photo';
  if (s.includes('मेकअप') || s.includes('makeup') || s.includes('मेहंदी') || s.includes('mehndi')) return 'wedding_makeup';
  if (s.includes('dj') || s.includes('डीजे')) return 'event_dj';
  if (s.includes('software') || s.includes('website') || s.includes('developer') || s.includes('डेवलपर') || s.includes('video editor') || s.includes('graphic') || s.includes('ui/ux') || s.includes('marketing') || s.includes('laptop') || s.includes('voiceover') || s.includes('डिजिटल') || s.includes('सॉफ्टवेयर')) return 'it_digital';
  if (s.includes('hotel') || s.includes('chef') || s.includes('cook') && s.includes('hotel') || s.includes('barista') || s.includes('tandoor') || s.includes('waiter') || s.includes('steward') || s.includes('retail') || s.includes('शोरूम') || s.includes('सेल्समैन')) return 'hospitality_retail';
  if (s.includes('सफाई') || s.includes('clean') || s.includes('pest') || s.includes('दीमक') || s.includes('maid') || s.includes('कामवाली') || s.includes('tiffin') || s.includes('nanny') || s.includes('mali') || s.includes('माली') || s.includes('elderly') || s.includes('cook') || s.includes('कुक')) return 'home_care';
  if (s.includes('car') || s.includes('bike') || s.includes('mechanic') || s.includes('मैकेनिक') || s.includes('tyre') || s.includes('puncture') || s.includes('driver') || s.includes('ड्राइवर') || s.includes('packers') || s.includes('tempo') || s.includes('टेम्पो')) return 'auto_transport';
  if (s.includes('salon') || s.includes('पार्लर') || s.includes('सैलून') || s.includes('massage') || s.includes('spa') || s.includes('yoga') || s.includes('योगा') || s.includes('fitness') || s.includes('physio') || s.includes('nurse')) return 'beauty_wellness';
  if (s.includes('gst') || s.includes('lawyer') || s.includes('वकील') || s.includes('rto') || s.includes('insurance') || s.includes('loan') || s.includes('security') || s.includes('सिक्योरिटी') || s.includes('data entry') || s.includes('receptionist') || s.includes('रिसेप्शन')) return 'business_legal';
  if (s.includes('driving') || s.includes('tutor') || s.includes('ट्यूटर') || s.includes('coaching') || s.includes('कोचिंग') || s.includes('english') || s.includes('music') || s.includes('dance') || s.includes('coding')) return 'education';
  if (s.includes('cnc') || s.includes('lathe') || s.includes('hvac') || s.includes('solar') || s.includes('सोलर') || s.includes('borewell') || s.includes('बोरवेल') || s.includes('industrial')) return 'industrial';
  if (s.includes('custom') || s.includes('अन्य') || s.includes('स्वयं')) return 'other_custom';
  return 'general';
}

/**
 * Validates trade-specific rate payloads during contractor registration/profile updates.
 * Strict checks enforce all trade mandatory rules whenever strictValidation === true OR tradeRateSpec is passed.
 */
function validateContractorTradeRates(category, payload = {}, strictValidation = false) {
  const spec = payload.tradeRateSpec && typeof payload.tradeRateSpec === 'object' ? payload.tradeRateSpec : {};
  const primaryMode = String(spec.primaryModeId || payload.primaryRateMode || '');

  // Numeric sanity bounds across specialized rate fields
  const pctFields = ['materialBillPercent'];
  for (const pf of pctFields) {
    if (spec[pf] !== undefined && spec[pf] !== null && String(spec[pf]).trim() !== '') {
      const pct = Number(spec[pf]);
      if (!Number.isFinite(pct) || pct <= 0 || pct > 60) {
        return { ok: false, error: 'मटेरियल बिल का प्रतिशत (%) 1 से 60 के बीच वैध संख्या होनी चाहिए।' };
      }
    }
  }

  const positiveFields = [
    'kitchenRunningFtRate',
    'hardwarePerPieceRate',
    'brickworkRateSqft',
    'thickMasonryM3Rate',
    'plasterRateSqft',
    'withMaterialRateSqft',
    'fanFittingPerPieceRate',
    'mainCablePerMeterRate',
    'fittingPerPieceRate',
    'pointLineRate',
    'visitChargeRate',
    'wallTileSqftRate',
    'skirtingEdgeRftRate',
    'coveAndSlotRftRate',
    'rebarBindingPerKgRate',
    'rebarBindingPerTonRate',
    'glazingSqMeterRate',
    'copperPipeRate',
    'jcbHourlyRate',
    'chairPerDayRate',
    'tablePerDayRate',
    'fullFunctionPackageRate',
    'minGuaranteePlates',
    'extraPlatePrice',
    'extraPlateRate',
    'fullWeddingPackageRate',
    'hoursPerFunction',
  ];

  for (const field of positiveFields) {
    if (spec[field] !== undefined && spec[field] !== null && String(spec[field]).trim() !== '') {
      const val = Number(spec[field]);
      if (!Number.isFinite(val) || val <= 0) {
        return { ok: false, error: `${field} मान्य धनात्मक संख्या (> 0) होनी चाहिए।` };
      }
    }
  }

  if (!strictValidation) {
    return { ok: true };
  }

  // Strict mandatory enforcement for all 15 trades when submitted via full registration flow
  if (category === 'carpenter' && primaryMode === 'carpenter_material_pct' && !(Number(spec.materialBillPercent) > 0)) {
    return { ok: false, error: 'बढ़ई द्वारा "मटेरियल बिल का %" चुनने पर % दर दर्ज करना अनिवार्य है।' };
  }
  if (category === 'ac_repair' && !(Number(spec.copperPipeRate) > 0)) {
    return { ok: false, error: 'AC मैकेनिक के लिए अतिरिक्त कॉपर पाइप दर (₹/फुट या मीटर) अनिवार्य है।' };
  }
  if (category === 'labor' && primaryMode === 'labor_trolley_trip' && !String(spec.trolleyCapacitySpec || '').trim()) {
    return { ok: false, error: 'ट्रॉली प्रति चक्कर चुनने पर ट्रॉली क्षमता दर्ज करना अनिवार्य है।' };
  }
  if (category === 'caterer') {
    if (!(Number(spec.minGuaranteePlates) >= 20)) {
      return { ok: false, error: 'हलवाई/कैटरर के लिए न्यूनतम प्लेट गारंटी (कम से कम 20) अनिवार्य है।' };
    }
    const extraRate = Number(spec.extraPlateRate || spec.extraPlatePrice);
    if (!(extraRate > 0)) {
      return { ok: false, error: 'न्यूनतम के बाद अतिरिक्त प्लेट दर (₹) दर्ज करना अनिवार्य है।' };
    }
  }
  if ((category === 'wedding_photo' || category === 'wedding_makeup')) {
    if (!(Number(spec.hoursPerFunction) > 0)) {
      return { ok: false, error: 'फंक्शन के घंटे (Hours per Function) दर्ज करना अनिवार्य है।' };
    }
    if (!String(spec.includedServicesSummary || '').trim()) {
      return { ok: false, error: 'पैकेज में शामिल सेवाओं की सूची लिखना अनिवार्य है।' };
    }
  }

  const hasAnyPositiveRate =
    Number(payload.dailyWageRate) > 0 ||
    Number(payload.contractUnitRate) > 0 ||
    Number(spec.materialBillPercent) > 0 ||
    Number(spec.jcbHourlyRate) > 0 ||
    Number(spec.fanFittingPerPieceRate) > 0 ||
    Number(spec.mainCablePerMeterRate) > 0 ||
    Number(spec.fittingPerPieceRate) > 0 ||
    Number(spec.pointLineRate) > 0 ||
    Number(spec.visitChargeRate) > 0 ||
    Number(spec.skirtingEdgeRftRate) > 0 ||
    Number(spec.coveAndSlotRftRate) > 0 ||
    Number(spec.rebarBindingPerKgRate) > 0 ||
    Number(spec.rebarBindingPerTonRate) > 0 ||
    Number(spec.glazingSqMeterRate) > 0 ||
    Number(spec.chairPerDayRate) > 0 ||
    Number(spec.fullFunctionPackageRate) > 0;

  if (!hasAnyPositiveRate) {
    return { ok: false, error: 'कृपया कम से कम अपनी चुनी हुई श्रेणी की प्राथमिक दर (> ₹0) दर्ज करें।' };
  }

  return { ok: true };
}

/**
 * Validates trade-specific booking measurements when strictValidation is set.
 */
function validateBookingMeasurements(body = {}) {
  const { category = '', strictValidation = false, workMeasurementSpec } = body;
  if (!strictValidation) return { ok: true };

  if (!String(body.workAddress || '').trim() || String(body.workAddress || '').trim().length < 5) {
    return { ok: false, error: 'कृपया कार्य स्थल का पूरा पता (कम से कम 5 अक्षर) दर्ज करें।' };
  }

  const m = workMeasurementSpec && typeof workMeasurementSpec === 'object' ? workMeasurementSpec : {};
  const sub = m.subValues && typeof m.subValues === 'object' ? m.subValues : {};
  const cat = mapTradeToCanonicalCategory(category);
  const modeId = String(m.modeId || '');

  if (cat === 'waterproofing' && (!sub.waterproofingSurface || !(Number(sub.treatmentAreaSqft) > 0))) {
    return { ok: false, error: 'वॉटरप्रूफिंग बुकिंग के लिए सतह और ट्रीटमेंट क्षेत्रफल (Sq.Ft) अनिवार्य है।' };
  }
  if (cat === 'aluminium_upvc' && (!String(sub.windowOuterSize || '').trim() || !sub.glassThickness || !sub.frameAndScope)) {
    return { ok: false, error: 'एल्युमिनियम/uPVC बुकिंग के लिए खिड़की का बाहरी नाप, ग्लास मोटाई और फिटिंग दायरा अनिवार्य है।' };
  }
  if (cat === 'labor' && modeId === 'labor_trolley_trip' && (!sub.trolleyCapacity || !(Number(sub.trolleyDistanceKm) > 0))) {
    return { ok: false, error: 'ट्रॉली बुकिंग के लिए ट्रॉली क्षमता और दूरी (Km) दर्ज करना अनिवार्य है।' };
  }
  if (cat === 'caterer' && (!sub.cateringMenuType || !(Number(sub.minPlatesGuaranteed) >= 20) || !(Number(sub.expectedTotalPlates) > 0))) {
    return { ok: false, error: 'कैटरिंग बुकिंग के लिए मेन्यू, न्यूनतम प्लेट और अनुमानित प्लेट संख्या अनिवार्य है।' };
  }
  if ((cat === 'wedding_photo' || cat === 'wedding_makeup') && (!(Number(sub.functionHours) > 0) || !String(sub.includedServicesText || '').trim())) {
    return { ok: false, error: 'फोटोग्राफी/मेकअप बुकिंग के लिए फंक्शन घंटे और शामिल सेवाएँ दर्ज करना अनिवार्य है।' };
  }

  return { ok: true };
}

module.exports = {
  VALID_CONTRACTOR_CATEGORIES,
  mapTradeToCanonicalCategory,
  validateContractorTradeRates,
  validateBookingMeasurements,
};
