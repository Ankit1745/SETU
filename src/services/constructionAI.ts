/**
 * SETU AI Construction & Renovation Knowledge Engine
 * Trained on Indian CPWD specifications, IS codes, and local contractor market practices (Bhopal/MP)
 */

export interface CustomerProblemContext {
  rawQuery?: string;
  location?: string;
  locationKey?: 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'switchboard' | 'roof' | 'general';
  problem?: string;
  trade?: string;
  category?: 'carpenter' | 'plumber' | 'mason' | 'painter' | 'electrician' | 'tiling' | 'welder' | 'ac_repair' | 'general';
  isSafetyHazard?: boolean;
  safetyMessage?: string;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
  understoodSummary: string;
  nextActionPrompt?: string;
  actionCategoryButton?: string;
  isTentative?: boolean;
}

export interface SetuAIResponse {
  trade: string;
  category: 'carpenter' | 'plumber' | 'mason' | 'painter' | 'electrician' | 'tiling' | 'welder' | 'ac_repair' | 'general';
  techniqueName: string;
  techniqueSpecs: string[];
  standardFormula: string;
  sampleEstimate: string;
  materialsNeeded: string[];
  qualityChecks: string[];
  fraudPreventionTips: string[];
  setuWarranty: string;
  voiceSummary: string;
  understoodSummary?: string;
  isSafetyHazard?: boolean;
  safetyMessage?: string;
}

const HAZARD_REGEX = /(chingari|चिंगारी|spark|sparks|dhuan|धुआं|धुआ|smoke|current|करंट|shock|शॉक|short circuit|शॉर्ट सर्किट|jalne ki|जलने की बदबू|aag\b|आग)/i;
const PLUMBING_REGEX = /(nal\b|नल|tap\b|tapak|टपक|leak|लीक|pipe|पाइप|flush|फ्लश|geyser|गीजर|drain|नाली|कमोड|commode|faucet|plumber|प्लंबर)/i;
const CARPENTRY_REGEX = /(almari|अलमारी|wardrobe|hinge|कब्जा|हिंज|darwaza|दरवाजा|door|farnichar|फर्नीचर|furniture|plywood|प्लाई|drawer|दराज|lock|ताला|carpenter|बढ़ई|माइका|laminate|\bbed\b|बेड)/i;
const ELECTRICAL_REGEX = /(bijli|बिजली|electric|mcb|switch|स्विच|wire|वायर|fan\b|पंखा|light|लाइट|inverter|इनवर्टर|plug|प्लग|socket|सॉकेट)/i;
const AC_HVAC_REGEX = /(\bac\b|एसी |air condition|cooling नहीं|ठंडी हवा नहीं|ac gas|compressor|कंप्रेसर|split ac|window ac)/i;
const PAINTING_REGEX = /(paint|पेंट|putty|पुट्टी|rang\b|रंग|whitewash|सफेदी|distemper|डिस्टेंपर|painter|पेंटर|waterproof)/i;
const MASONRY_REGEX = /(tile|टाइल्स|टाइल|marble|मार्बल|chinai|चिनाई|brick|ईंट|plaster|प्लास्टर|dhalai|ढलाई|rcc|slab|seelan|सीलन|mason|मिस्त्री)/i;

/**
 * Multi-Factor Intent & Location Disentanglement Engine
 * Accurately parses Hindi, English, and Roman Hindi (Hinglish)
 * Differentiates Location (जगह), Problem (समस्या), and Work (काम)
 * Handles context continuity and high-risk safety hazards
 */
export function parseCustomerProblem(
  rawQuery: string,
  previousContext?: (CustomerProblemContext & { priorContext?: CustomerProblemContext }) | null
): CustomerProblemContext {
  const q = (rawQuery || '').toLowerCase().trim();

  // -------------------------------------------------------------
  // 1. SAFETY HAZARD FIRST (High-risk electrical / fire / spark)
  // -------------------------------------------------------------
  if (HAZARD_REGEX.test(q)) {
    return {
      rawQuery,
      location: /switch|board|स्विच/i.test(q) ? 'Switchboard (बिजली बोर्ड)' : 'विद्युत पॉइंट',
      locationKey: 'switchboard',
      problem: 'चिंगारी / स्पार्क / शॉर्ट-सर्किट का गंभीर जोखिम',
      trade: 'इलेक्ट्रीशियन (Emergency Electrician)',
      category: 'electrician',
      isSafetyHazard: true,
      safetyMessage: '⚠️ आपातकालीन सुरक्षा चेतावनी: तुरंत मुख्य DP / MCB (मेन स्विच) बंद करें! किसी भी नंगे तार या बोर्ड को हाथ न लगाएं।',
      needsClarification: false,
      understoodSummary: 'समझ गया: स्विचबोर्ड/बिजली बोर्ड में स्पार्क (चिंगारी) या शॉर्ट-सर्किट का आपातकालीन खतरा है।',
      nextActionPrompt: 'जोखिम से बचने हेतु खुद ठीक न करें। तुरंत आपातकालीन इलेक्ट्रीशियन से संपर्क करें।',
      actionCategoryButton: 'आपातकालीन इलेक्ट्रीशियन देखें',
      isTentative: false,
    };
  }

  // -------------------------------------------------------------
  // 2. CONTEXT CONTINUATION FROM PREVIOUS TURN (Clarification Reply)
  // -------------------------------------------------------------
  const resolvedPrior = previousContext?.priorContext || previousContext;
  if (resolvedPrior && (previousContext?.needsClarification || previousContext?.priorContext)) {
    const prevLocation = resolvedPrior.location || 'Bathroom (बाथरूम)';
    const prevLocKey = resolvedPrior.locationKey || 'bathroom';

    // Check if reply specifies "wall" / "दीवार से"
    if (/(deewar|दीवार|wall|seelan|सीलन|रिस)/i.test(q)) {
      return {
        rawQuery,
        location: prevLocation,
        locationKey: prevLocKey,
        problem: 'दीवार से पानी रिसना (सीलन / कंसील्ड पाइप लीकेज)',
        trade: 'प्लंबर & लीकेज विशेषज्ञ (Plumber)',
        category: 'plumber',
        isSafetyHazard: false,
        needsClarification: false,
        understoodSummary: `समझ गया: ${prevLocation} की दीवार से पानी रिस रहा है (कंसील्ड पाइप लीकेज या टाइल ग्राउट समस्या)।`,
        nextActionPrompt: 'कंसील्ड लीकेज जांच व समाधान हेतु प्लंबर दिखाऊँ?',
        actionCategoryButton: 'सत्यापित प्लंबर देखें',
        isTentative: true,
      };
    }

    // Check if reply specifies "tap" / "नल से"
    if (/(nal\b|नल|tap\b|tapak|टपक)/i.test(q)) {
      return {
        rawQuery,
        location: prevLocation,
        locationKey: prevLocKey,
        problem: 'नल से पानी टपकना',
        trade: 'प्लंबर (Plumber)',
        category: 'plumber',
        isSafetyHazard: false,
        needsClarification: false,
        understoodSummary: `समझ गया: ${prevLocation} के नल से पानी टपक रहा है।`,
        nextActionPrompt: 'नल की मरम्मत हेतु प्लंबर दिखाऊँ?',
        actionCategoryButton: 'सत्यापित प्लंबर देखें',
        isTentative: true,
      };
    }

    // Check if reply specifies "floor" / "फर्श पर" / "नाली"
    if (/(farsh|फर्श|floor|naali|नाली|jama|drain)/i.test(q)) {
      return {
        rawQuery,
        location: prevLocation,
        locationKey: prevLocKey,
        problem: 'फर्श पर पानी जमा होना (ड्रेनेज चोक)',
        trade: 'प्लंबर (Plumber)',
        category: 'plumber',
        isSafetyHazard: false,
        needsClarification: false,
        understoodSummary: `समझ गया: ${prevLocation} के फर्श पर पानी जमा हो रहा है (ड्रेनेज चोक या स्लोप समस्या)।`,
        nextActionPrompt: 'ड्रेनेज खोलने हेतु प्लंबर दिखाऊँ?',
        actionCategoryButton: 'सत्यापित प्लंबर देखें',
        isTentative: true,
      };
    }
  }

  // -------------------------------------------------------------
  // 3. DETECT INCOMPLETE / AMBIGUOUS INFORMATION (Ask Clarification)
  // -------------------------------------------------------------
  const isAmbiguousWater =
    /(pani aa raha|पानी आ रहा|water coming|pani gir raha|पानी गिर रहा)/i.test(q) &&
    !/(nal\b|नल|tap\b|deewar|दीवार|geyser|गीजर|naali|नाली|farsh|फर्श)/i.test(q);

  if (isAmbiguousWater && /(bathroom|बाथरूम|washroom|टॉयलेट|कमरे|room)/i.test(q)) {
    const isBathroom = /(bathroom|बाथरूम|washroom|टॉयलेट)/i.test(q);
    const loc = isBathroom ? 'Bathroom (बाथरूम)' : 'कमरा';
    return {
      rawQuery,
      location: loc,
      locationKey: isBathroom ? 'bathroom' : 'bedroom',
      problem: 'पानी आने का अज्ञात स्रोत',
      needsClarification: true,
      clarificationQuestion: 'पानी नल से टपक रहा है, दीवार से रिस रहा है या फर्श पर जमा हो रहा है?',
      clarificationOptions: ['नल से टपक रहा है', 'दीवार से रिस रहा है', 'फर्श पर जमा हो रहा है'],
      understoodSummary: `समझ गया: ${loc} में पानी आने की समस्या है, लेकिन पानी का सही स्रोत स्पष्ट नहीं है।`,
      nextActionPrompt: 'कृपया ऊपर दिए विकल्पों में से चुनें या स्थिति बताएं।',
      isTentative: true,
    };
  }

  // -------------------------------------------------------------
  // 4. MULTI-FACTOR LOCATION & PROBLEM PARSING
  // -------------------------------------------------------------
  let detectedLocation = 'सामान्य कार्य';
  let locationKey: CustomerProblemContext['locationKey'] = 'general';

  if (/(kitchen|किचन|रसोई|rasoi)/i.test(q)) {
    detectedLocation = 'किचन (रसोई)';
    locationKey = 'kitchen';
  } else if (/(bathroom|बाथरूम|washroom|gusal-khana)/i.test(q)) {
    detectedLocation = 'Bathroom (बाथरूम)';
    locationKey = 'bathroom';
  } else if (/(bedroom|बेडरूम|कमरा|कमरे|\broom\b)/i.test(q)) {
    detectedLocation = 'Bedroom (कमरा)';
    locationKey = 'bedroom';
  } else if (/(roof|छत|terrace|dhalai)/i.test(q)) {
    detectedLocation = 'Roof (छत)';
    locationKey = 'roof';
  } else if (/(switchboard|स्विच|board|meter)/i.test(q)) {
    detectedLocation = 'Switchboard (बिजली बोर्ड)';
    locationKey = 'switchboard';
  } else if (/(living room|हॉल|\bhall\b)/i.test(q)) {
    detectedLocation = 'Living Room (हॉल)';
    locationKey = 'living_room';
  }

  const hasPlumbingClues = PLUMBING_REGEX.test(q);
  const hasCarpentryClues = CARPENTRY_REGEX.test(q);
  const hasAcClues = AC_HVAC_REGEX.test(q);
  const hasElectricalClues = ELECTRICAL_REGEX.test(q);
  const hasPaintingClues = PAINTING_REGEX.test(q);
  const hasMasonryClues = MASONRY_REGEX.test(q);

  // Priority-based Disentangled Matching:
  // E.g. "Kitchen ka nal tapak raha hai" -> location is kitchen, problem is nal tapakna -> PLUMBER!
  if (hasPlumbingClues) {
    const isTapDripping = q.includes('nal') || q.includes('नल') || q.includes('tapak') || q.includes('टपक') || q.includes('tap');
    const prob = isTapDripping ? 'नल से पानी टपकना' : 'प्लंबिंग व पाइपलाइन कार्य';
    return {
      rawQuery,
      location: detectedLocation,
      locationKey,
      problem: prob,
      trade: 'प्लंबर (Plumber)',
      category: 'plumber',
      isSafetyHazard: false,
      needsClarification: false,
      understoodSummary: `समझ गया: ${detectedLocation} में ${prob} की समस्या है (प्लंबिंग कार्य)।`,
      nextActionPrompt: isTapDripping ? 'नल ठीक करने हेतु प्लंबर दिखाऊँ?' : 'प्लंबिंग कार्य हेतु प्लंबर दिखाऊँ?',
      actionCategoryButton: 'सत्यापित प्लंबर देखें',
      isTentative: true,
    };
  }

  // E.g. "Kitchen ki almari ka hinge toot gaya" -> location is kitchen, problem is hinge tootna -> CARPENTER!
  if (hasCarpentryClues) {
    const isHinge = q.includes('hinge') || q.includes('कब्जा') || q.includes('हिंज');
    const isDoor = q.includes('darwaza') || q.includes('दरवाजा') || q.includes('door');
    const isWardrobe = q.includes('almari') || q.includes('अलमारी') || q.includes('wardrobe');
    
    let prob = 'लकड़ी व फर्नीचर कार्य';
    if (isHinge && isWardrobe) prob = 'अलमारी का हिंज (कब्जा) टूटना';
    else if (isHinge) prob = 'दरवाजे/पल्ले का हिंज (कब्जा) ठीक करना';
    else if (isWardrobe) prob = 'अलमारी / वॉर्डरोब कार्य';
    else if (isDoor) prob = 'दरवाजा जाम / मरम्मत';

    return {
      rawQuery,
      location: detectedLocation,
      locationKey,
      problem: prob,
      trade: 'कारपेंटर (Carpenter)',
      category: 'carpenter',
      isSafetyHazard: false,
      needsClarification: false,
      understoodSummary: `समझ गया: ${detectedLocation} में ${prob} की समस्या है (कारपेंटर कार्य)।`,
      nextActionPrompt: `${prob} हेतु बढ़ई (कारपेंटर) दिखाऊँ?`,
      actionCategoryButton: 'सत्यापित बढ़ई देखें',
      isTentative: true,
    };
  }

  if (hasAcClues) {
    return {
      rawQuery,
      location: detectedLocation,
      locationKey,
      problem: 'AC कूलिंग / गैस / सर्विसिंग समस्या',
      trade: 'AC & इलेक्ट्रीशियन विशेषज्ञ (AC Tech)',
      category: 'electrician',
      isSafetyHazard: false,
      needsClarification: false,
      understoodSummary: `समझ गया: ${detectedLocation} में AC कूलिंग / वायरिंग / गैस सर्विसिंग कार्य की आवश्यकता है।`,
      nextActionPrompt: 'AC व इलेक्ट्रिकल विशेषज्ञ दिखाऊँ?',
      actionCategoryButton: 'सत्यापित AC विशेषज्ञ देखें',
      isTentative: true,
    };
  }

  if (hasElectricalClues) {
    return {
      rawQuery,
      location: detectedLocation,
      locationKey,
      problem: 'विद्युत / वायरिंग / उपकरण समस्या',
      trade: 'इलेक्ट्रीशियन (Electrician)',
      category: 'electrician',
      isSafetyHazard: false,
      needsClarification: false,
      understoodSummary: `समझ गया: ${detectedLocation} में विद्युत / वायरिंग कार्य की आवश्यकता है।`,
      nextActionPrompt: 'इलेक्ट्रीशियन दिखाऊँ?',
      actionCategoryButton: 'सत्यापित इलेक्ट्रीशियन देखें',
      isTentative: true,
    };
  }

  if (hasPaintingClues) {
    return {
      rawQuery,
      location: detectedLocation,
      locationKey,
      problem: 'पेंटिंग, पुट्टी व दीवार फिनिशिंग',
      trade: 'पेंटर (Painter)',
      category: 'painter',
      isSafetyHazard: false,
      needsClarification: false,
      understoodSummary: `समझ गया: ${detectedLocation} में पुट्टी व पेंटिंग कार्य की आवश्यकता है।`,
      nextActionPrompt: 'सत्यापित पेंटर दिखाऊँ?',
      actionCategoryButton: 'सत्यापित पेंटर देखें',
      isTentative: true,
    };
  }

  if (hasMasonryClues) {
    return {
      rawQuery,
      location: detectedLocation,
      locationKey,
      problem: 'चिनाई, प्लास्टर, टाइल्स या सिविल कार्य',
      trade: 'राजमिस्त्री (Mason)',
      category: 'mason',
      isSafetyHazard: false,
      needsClarification: false,
      understoodSummary: `समझ गया: ${detectedLocation} में सिविल / टाइल / चिनाई कार्य की आवश्यकता है।`,
      nextActionPrompt: 'सत्यापित राजमिस्त्री दिखाऊँ?',
      actionCategoryButton: 'सत्यापित राजमिस्त्री देखें',
      isTentative: true,
    };
  }

  // Fallback for general queries
  return {
    rawQuery,
    location: detectedLocation,
    locationKey,
    problem: rawQuery,
    trade: 'होम सर्विस विशेषज्ञ',
    category: 'mason',
    isSafetyHazard: false,
    needsClarification: false,
    understoodSummary: `समझ गया: ${rawQuery} से संबंधित कार्य।`,
    nextActionPrompt: 'उपलब्ध कारीगर दिखाऊँ?',
    actionCategoryButton: 'सत्यापित कारीगर देखें',
    isTentative: true,
  };
}

/**
 * Standard Construction Query Analyzer
 * Dispatches to standard CPWD specs and market rates based on parsed intent
 */
export function analyzeConstructionQuery(rawQuery: string): SetuAIResponse {
  const parsed = parseCustomerProblem(rawQuery);

  // 1. HAZARD / EMERGENCY
  if (parsed.isSafetyHazard) {
    return {
      trade: 'इलेक्ट्रीशियन (Emergency Electrician)',
      category: 'electrician',
      techniqueName: 'कंसील्ड FR-LSH वायरिंग & 30mA RCCB शॉक-प्रोटेक्शन तकनीक',
      techniqueSpecs: [
        '⚠️ आपातकालीन सुरक्षा: सबसे पहले मुख्य DP / MCB (मेन स्विच) बंद करें।',
        'शॉर्ट सर्किट की स्थिति में किसी भी नंगे तार या बोर्ड को हाथ न लगाएं।',
        'हैवेल्स / फिनोलेक्स 100% प्योर कॉपर FR-LSH (आग न पकड़ने वाला) वायर का ही उपयोग करें।',
        'मेन डिस्ट्रीब्यूशन बॉक्स में 30mA RCCB (शॉक लगने पर 0.03 सेकंड में ट्रिप) लगवाएं।',
      ],
      standardFormula: 'इमरजेंसी विजिट व फॉल्ट डायग्नोसिस: ₹199 - ₹250 मानक',
      sampleEstimate: 'फॉल्ट जांच व स्विच/सॉकेट रिप्लेसमेंट: लेबर = ₹200 | सामग्री = ₹180 | कुल = ₹380',
      materialsNeeded: [
        'हैवेल्स / फिनोलेक्स FR-LSH कॉपर वायर (2.5mm / 4.0mm)',
        'Schneider / Havells 30mA RCCB & C-Curve MCB',
        'मॉड्यूलर 16A स्विच & सॉकेट',
      ],
      qualityChecks: [
        'लाइन चालू करने से पहले डिजिटल मल्टीमीटर से शॉर्ट-सर्किट की जांच करें।',
        'RCCB टेस्ट बटन दबाने पर तुरंत ट्रिप होना चाहिए।',
      ],
      fraudPreventionTips: [
        '⚠️ चिंगारी आने पर कभी भी ट्रिप होने वाली MCB में जबरदस्ती तार न बंधवाएं।',
        '⚠️ लोकल गैर-ब्रांडेड स्विच न लगवाएं, केवल ISI मार्क ही लें।',
      ],
      setuWarranty: 'शॉर्ट-सर्किट फ्री इंस्टॉलेशन & 30-दिन वारंटी',
      voiceSummary: parsed.safetyMessage || 'स्विचबोर्ड में चिंगारी आने पर तुरंत मेन स्विच बंद करें और इलेक्ट्रीशियन बुलाएं।',
      understoodSummary: parsed.understoodSummary,
      isSafetyHazard: true,
      safetyMessage: parsed.safetyMessage,
    };
  }

  // 2. PLUMBER
  if (parsed.category === 'plumber') {
    return {
      trade: 'प्लंबर (Plumber)',
      category: 'plumber',
      techniqueName: 'CPVC सॉल्वेंट वेल्डिंग & 10-Bar प्रेशर टेस्टेड तकनीक',
      techniqueSpecs: [
        'सुप्रीम / एस्ट्रल CPVC (SDR-11) हैवी पाइप्स - गर्म और ठंडे पानी दोनों के लिए अनुकूल।',
        'दीवार के अंदर कंसील्ड झिरी कटिंग और हर 3 फीट पर मेटल क्लैम्पिंग।',
        'हाइड्रोस्टेटिक प्रेशर पंप से 10 Bar (150 PSI) पर 24 घंटे लीकेज टेस्टिंग।',
        'ब्रास थ्रेड्स पर टेफ्लॉन टेप + धागा ब्रास सील (शून्य लीकेज)।',
      ],
      standardFormula:
        'कंसील्ड बाथरूम फिटिंग: ₹180 - ₹220 प्रति पॉइंट | इमरजेंसी लीकेज / नल डायग्नोसिस: ₹150 - ₹199 मानक',
      sampleEstimate:
        'नल स्पिंडल रिप्लेसमेंट: स्पिंडल = ₹85 | टेफ्लॉन = ₹20 | लेबर = ₹150 | कुल लगभग ₹255 (पूरा नया नल खरीदने की आवश्यकता नहीं)',
      materialsNeeded: [
        '1/2 इंच हैवी ब्रास सेरामिक स्पिंडल (Jaquar/Parryware साइज)',
        'टेफ्लॉन थ्रेड सील टेप (12mm)',
        'हैवी रबर वाशर सेट',
        'एस्ट्रल / सुप्रीम CPVC 1" व 3/4" पाइप (SDR 11 ग्रेड)',
      ],
      qualityChecks: [
        'नल बंद करने पर टोंटी से 1 बूंद भी पानी नहीं टपकना चाहिए।',
        'दीवार पर टाइल्स लगाने से पहले 24 घंटे प्रेशर गेज पर सुई 10 Bar पर स्थिर रहनी चाहिए।',
        'गर्म व ठंडे पानी दोनों में पूरा तेज प्रेशर आना चाहिए।',
      ],
      fraudPreventionTips: [
        '⚠️ पूरा नया नल ₹800 का मत खरीदें! 90% मामलों में केवल ₹85 का स्पिंडल बदलने से नल नया जैसा चलने लगता है।',
        '⚠️ सामान्य PVC या UPVC पाइप गर्म पानी की लाइन में कभी न लगवाएं।',
        '⚠️ बिना 24 घंटे प्रेशर टेस्ट के दीवार पर कभी प्लास्टर या टाइल्स न लगने दें।',
      ],
      setuWarranty: '1 वर्ष लीकेज-फ्री गारंटी + 30-दिन फ्री सर्विस',
      voiceSummary:
        'नल से पानी टपकने पर पूरा नल बदलने के बजाय केवल स्पिंडल बदलें। मानक लेबर चार्ज 150 रुपये होता है।',
      understoodSummary: parsed.understoodSummary,
      isSafetyHazard: false,
    };
  }

  // 3. CARPENTER
  if (parsed.category === 'carpenter') {
    const isKitchen = parsed.locationKey === 'kitchen';
    return {
      trade: 'कारपेंटर (Carpenter)',
      category: 'carpenter',
      techniqueName: isKitchen
        ? 'BWP ग्रेड-710 मरीन प्लाई + सॉफ्ट-क्लोज हाइड्रॉलिक किचन तकनीक'
        : 'CNC प्रिसिजन कटिंग + 1mm मरीन माइका + लेजर अलाइनमेंट तकनीक',
      techniqueSpecs: [
        '19mm वॉटरप्रूफ BWP ग्रेड 710 मरीन प्लाई (सेंचुरी/ग्रीनप्लाई) की फ्रेमिंग।',
        'अंदर 0.8mm सफेद लाइनर माइका और बाहर 1mm हाई-ग्लॉस ऐक्रेलिक माइका फेविकोल मरीन से पेस्टिंग।',
        'सॉफ्ट-क्लोज हाइड्रॉलिक हिंज (Godrej/Hettich/Ebco) और 45kg लोड-रेटेड टेलिस्कोपिक चैनल।',
        'किनारों पर 2mm PVC एज-बैंडिंग मशीन पेस्टिंग (जिससे कोनों से माइका कभी न उखड़े)।',
      ],
      standardFormula:
        'माप का मानक: फ्रंट एरिया (चौड़ाई x ऊंचाई) = कुल sq.ft | लेबर दर: ₹380 - ₹450 प्रति sq.ft (वॉर्डरोब) अथवा मरम्मत कार्य: ₹180 - ₹250',
      sampleEstimate:
        '10x7 ft वॉर्डरोब (70 sq.ft): प्लाई + माइका + हार्डवेयर = ₹38,000 | लेबर = ₹28,000 | कुल लगभग ₹66,000',
      materialsNeeded: [
        'सेंचुरी / ग्रीनप्लाई 19mm BWP 710 ग्रेड मरीन प्लाई',
        '1mm डेकोरेटिव माइका (CenturyLaminates / Merino)',
        'हेटिक / गोदरेज सॉफ्ट-क्लोज हाइड्रॉलिक हिंज',
        'फेविकोल मरीन (Marine Waterproof Adhesive)',
      ],
      qualityChecks: [
        'पल्ला बंद करने पर सॉफ्ट-क्लोज 3 सेकंड में बिना आवाज बंद होना चाहिए।',
        'माइका के कोनों पर धार न छूटे (फाइलिंग व 2mm एज-बैंडिंग चेक करें)।',
        'दराज में 40 किलो वजन रखकर खींचने पर स्मूथ स्लाइड हो।',
      ],
      fraudPreventionTips: [
        '⚠️ प्लाई का स्टैंप चेक करें: केवल IS:710 स्टैंप वाली मरीन प्लाई लें।',
        '⚠️ फेविकोल में पानी न मिलाने दें (पानी मिलाने से 6 महीने बाद माइका में बुलबुले आ जाते हैं)।',
        '⚠️ SETU एस्क्रो से ही पेमेंट करें: काम पूरा होने के बाद ही फाइनल OTP दें।',
      ],
      setuWarranty: '5 वर्ष हिंज वारंटी + 30-दिन फ्री सर्विस री-विजिट गारंटी',
      voiceSummary:
        'फर्नीचर में 710 मरीन प्लाई और 1mm माइका लगानी चाहिए। मानक लेबर चार्ज 380 से 450 रुपये प्रति वर्ग फुट होता है।',
      understoodSummary: parsed.understoodSummary,
      isSafetyHazard: false,
    };
  }

  // 4. PAINTER
  if (parsed.category === 'painter') {
    return {
      trade: 'पेंटर (Painter)',
      category: 'painter',
      techniqueName: '2-कोट बिरला पुट्टी + प्राइमर + 2-कोट रॉयल लक्ज़री रोलर तकनीक',
      techniqueSpecs: [
        'एमरी पेपर 180 से पूरी पुरानी दीवार की सैंडिंग व धूल सफाई।',
        'बिरला वाइट वॉलकेयर पुट्टी (2-कोट, 1.5mm मानक मोटाई ताकि दरार न पड़े)।',
        '1-कोट डीप-पेनेट्रेटिंग वॉटरप्रूफ प्राइमर (सूखने हेतु 6 घंटे)।',
        '2-कोट एशियन पेंट्स रॉयल लक्ज़री इमल्शन (माइक्रोफाइबर स्मूथ रोलर से)।',
      ],
      standardFormula:
        'दीवार क्षेत्रफल अनुसार: ₹14 - ₹18 प्रति sq.ft (2 कोट पुट्टी + 1 कोट प्राइमर + 2 कोट रॉयल पेंट) | केवल री-पेंट: ₹6 - ₹9 प्रति sq.ft',
      sampleEstimate:
        '3BHK फ्लैट (कुल दीवार क्षेत्रफल लगभग 2,400 sq.ft): पुट्टी व प्राइमर लेबर = ₹18,000 | पेंटिंग लेबर = ₹16,000 | पेंट व सामग्री = ₹26,000 | कुल = ₹60,000',
      materialsNeeded: [
        'बिरला वाइट वॉलकेयर पुट्टी (40 Kg बैग)',
        'एशियन पेंट्स डेकॉरप्राइम वॉल प्राइमर',
        'एशियन पेंट्स रॉयल लक्ज़री / ट्रैक्टर इमल्शन',
        'फ्लोर ड्रॉप-शीट्स और मास्किंग टेप',
      ],
      qualityChecks: [
        'दीवार पर तिरछी रोशनी डालने पर शीशे जैसी एकसमान सतह दिखे (शून्य लहरदार सतह)।',
        'रोलर के निशान या किनारों पर ब्रश के बाल न चिपके हों।',
        'फर्श और स्विचबोर्ड पर पेंट का एक भी छींटा न छूटा हो।',
      ],
      fraudPreventionTips: [
        '⚠️ पुट्टी में एक कोट मारकर सीधे पेंट न करने दें (हमेशा 2 कोट पुट्टी और 1 कोट प्राइमर आवश्यक है)।',
        '⚠️ पेंट की बाल्टी सीलबंद आपके सामने खुले।',
        '⚠️ पेंट में तय मात्रा (अधिकतम 35-40%) से अधिक पानी न मिलने दें।',
      ],
      setuWarranty: '3 वर्ष नो-पीलिंग वारंटी (पपड़ी न छूटने की सुरक्षा)',
      voiceSummary:
        'दीवार पर 2 कोट बिरला पुट्टी, प्राइमर और 2 कोट रॉयल पेंट का मानक खर्च 14 से 18 रुपये प्रति वर्ग फुट होता है।',
      understoodSummary: parsed.understoodSummary,
      isSafetyHazard: false,
    };
  }

  // 5. ELECTRICIAN (Standard)
  if (parsed.category === 'electrician') {
    return {
      trade: 'इलेक्ट्रीशियन (Electrician)',
      category: 'electrician',
      techniqueName: 'कंसील्ड FR-LSH वायरिंग & 30mA RCCB शॉक-प्रोटेक्शन तकनीक',
      techniqueSpecs: [
        'दीवार में हैवी PVC कंड्यूट पाइप कटिंग व मेटल कंसील्ड बॉक्स फिटिंग।',
        'हैवेल्स / फिनोलेक्स 100% प्योर कॉपर FR-LSH (आग न पकड़ने वाला) वायर।',
        'लाइट/फैन: 1.5 sq mm | पावर प्लग/गीजर: 2.5 sq mm | 1.5/2 टन AC: 4.0 sq mm वायर।',
        'मेन डिस्ट्रीब्यूशन बॉक्स में 30mA RCCB (शॉक लगने पर 0.03 सेकंड में ट्रिप)।',
      ],
      standardFormula:
        'कंसील्ड पाइपिंग व वायरिंग: ₹140 - ₹180 प्रति पॉइंट | MCB बोर्ड इंस्टॉलेशन: ₹650 | कॉपर अर्थिंग: ₹3,500',
      sampleEstimate:
        '10x12 बेडरूम (6 स्विच पॉइंट्स, 1 AC पॉइंट, 1 टीवी पॉइंट): लेबर = ₹1,400 - ₹1,800 | वायर्स व स्विच = ₹3,200',
      materialsNeeded: [
        'फिनोलेक्स / हैवेल्स FR-LSH कॉपर वायर (1.5mm, 2.5mm, 4.0mm)',
        'लेग्रैंड / एंकर रोमा मॉड्यूलर स्विच & सॉकेट्स',
        'Schneider / Havells 30mA RCCB & C-Curve MCB',
      ],
      qualityChecks: [
        'डिजिटल मल्टीमीटर से फेज और अर्थिंग के बीच वोल्टेज 220V-230V और न्यूट्रल-अर्थिंग < 2V होनी चाहिए।',
        'फुल लोड चालू करके 15 मिनट वायर छूने पर गर्म नहीं होना चाहिए।',
        'RCCB टेस्ट बटन दबाने पर तुरंत ट्रिप होना चाहिए।',
      ],
      fraudPreventionTips: [
        '⚠️ एल्युमिनियम मिक्स्ड सस्ती कॉपर वायर कभी न लगाएं (यह 1 साल में गर्म होकर आग पकड़ लेती है)।',
        '⚠️ AC और गीजर का लोड कभी भी 1.5mm लाइट वायर पर न डलवाएं।',
        '⚠️ बिना RCCB के घर में मेन सप्लाई चालू न करवाएं।',
      ],
      setuWarranty: 'शॉर्ट-सर्किट फ्री इंस्टॉलेशन & 30-दिन वारंटी',
      voiceSummary:
        'कंसील्ड वायरिंग में हमेशा 100% कॉपर FR-LSH वायर और 30mA RCCB लगवाएं। प्रति पॉइंट मानक लेबर 140 से 180 रुपये होती है।',
      understoodSummary: parsed.understoodSummary,
      isSafetyHazard: false,
    };
  }

  // 6. MASON (Civil / Tiles / Brickwork)
  const isTiles = (rawQuery || '').toLowerCase().includes('tile') || (rawQuery || '').toLowerCase().includes('टाइल्स');
  return {
    trade: isTiles ? 'राजमिस्त्री / टाइल कारीगर (Mason)' : 'राजमिस्त्री & सिविल ठेकेदार (Civil Mason)',
    category: 'mason',
    techniqueName: isTiles
      ? 'लेजर लेवलर + Roff केमिकल एडहेसिव 2mm स्पेसर तकनीक'
      : '1:4 साहुल ईंट चिनाई & 12mm वाटरप्रूफ प्लास्टर तकनीक',
    techniqueSpecs: isTiles
      ? [
          'फर्श पर सीमेंट घोल की जगह Roff T02 / Asian Paints टाइल एडहेसिव का उपयोग।',
          '360° लेजर लेवलर से पानी का ढलान नाली की तरफ सटीक सेट करना।',
          '2mm प्लास्टिक टाइल स्पेसर व वाइब्रेटर मशीन से शून्य खोखलापन।',
          '24 घंटे बाद एपॉक्सी वॉटरप्रूफ ग्राउटिंग भरना।',
        ]
      : [
          '9-इंच दीवार के लिए 1:6 और 4.5-इंच पार्टीशन दीवार के लिए 1:4 का ताजा मसाला।',
          'अव्वल क्लास लाल ईंटों की चिनाई से पहले 12 घंटे पूरी तराई।',
          'साहुल और एल्युमिनियम फंटी से दीवार 100% राइट-एंगल में।',
          'प्लास्टर में डॉ. फिक्सिट LW+ वॉटरप्रूफिंग लिक्विड (200ml प्रति बोरी सीमेंट)।',
        ],
    standardFormula: isTiles
      ? 'फ्लोर टाइल्स फिटिंग लेबर: ₹22 - ₹28 प्रति sq.ft | वॉल टाइल्स: ₹26 - ₹32 प्रति sq.ft'
      : '9-इंच ईंट चिनाई: ₹22 - ₹26 प्रति sq.ft | 12mm दीवार प्लास्टर: ₹15 - ₹18 प्रति sq.ft',
    sampleEstimate: isTiles
      ? '180 sq.ft लिविंग रूम: लेबर = ₹4,500 | 2x4 ft विट्रीफाइड टाइल्स = ₹10,800 | एडहेसिव = ₹3,200 | कुल लगभग ₹18,500'
      : '1,000 sq.ft प्लॉट चिनाई व प्लास्टर: लेबर = ₹55,000 - ₹68,000 | सामग्री = ₹1,40,000',
    materialsNeeded: isTiles
      ? ['कजारिया / सोमानी 2x4 ft विट्रीफाइड GVT टाइल्स', 'Roff T02 टाइल एडहेसिव (20 Kg बैग)', '2mm टाइल क्रॉस स्पेसर']
      : ['अल्ट्राटेक / ACC 53 ग्रेड OPC/PPC सीमेंट', 'अव्वल लाल ईंटें', 'छनी हुई नर्मदा नदी की रेत'],
    qualityChecks: [
      'टाइल ठोकने पर किसी भी कोने से खोखली आवाज (हॉलो साउंड) नहीं आनी चाहिए।',
      'फर्श पर 1 बाल्टी पानी डालने पर पानी रुके बिना सीधे नाली में बहना चाहिए।',
    ],
    fraudPreventionTips: [
      '⚠️ टाइल्स केवल सीमेंट घोल से न लगवाएं (केमिकल एडहेसिव ही टिकाऊ है)।',
      '⚠️ जोड़ों में सफेद सीमेंट मत भरवाएं (एपॉक्सी ग्राउट ही लगवाएं)।',
    ],
    setuWarranty: '2 वर्ष नो-हॉलो टाइल्स वारंटी + 30-दिन फ्री सर्विस',
    voiceSummary:
      'विट्रीफाइड टाइल्स हमेशा 2mm स्पेसर और एडहेसिव से लगवाएं। मानक लेबर चार्ज 22 से 28 रुपये प्रति वर्ग फुट होता है।',
    understoodSummary: parsed.understoodSummary,
    isSafetyHazard: false,
  };
}

// ============================================================================
// 📹 AI उस्ताद: LIVE VIDEO / CAMERA VISUAL DIAGNOSTIC ENGINE
// ============================================================================

export interface VisualProblemDiagnosis {
  id: string;
  category: 'plumber' | 'carpenter' | 'mason' | 'painter' | 'electrician' | 'tiling' | 'welder' | 'ac_repair' | 'general';
  titleHindi: string;
  visibleObservation: string; // प्रत्यक्ष दिखे लक्षण (Visible Observation)
  inferredCause: string;      // संभावित कारण (Inferred Cause)
  visualSymptom?: string;    // backward compat
  realProblem?: string;       // backward compat
  sourceContext?: 'photo' | 'video_frame' | 'sample_demo';
  isSafetyHazard?: boolean;
  safetyMessage?: string;
  neededHardware: { name: string; approxPrice: number; unit: string }[];
  laborEstimate: { description: string; approxPrice: number };
  totalEstimatedCost: number;
  diySteps: string[];
  karigarAdvice: string;
}

export const VISUAL_PROBLEM_SCENARIOS: Record<string, VisualProblemDiagnosis> = {
  tap_leakage: {
    id: 'tap_leakage',
    category: 'plumber',
    titleHindi: '🚰 नल से लगातार पानी टपकना',
    visibleObservation: 'टोंटी (Spout) से पानी की बूंदें लगातार नीचे गिर रही हैं और वॉशबेसिन/फर्श पर पानी जमा हो रहा है।',
    inferredCause: 'नल की बाहरी बॉडी ठीक दिख रही है, आंतरिक ब्रास सेरामिक स्पिंडल (Disc Spindle) घिस चुका है या उसका रबर O-रिंग कट गया है। (नोट: 90% मामलों में पूरा नल बदलने की आवश्यकता नहीं होती, केवल स्पिंडल बदलने की जरूरत होती है)।',
    visualSymptom: 'नल बंद करने के बाद भी टोंटी से पानी की बूंदें लगातार टपक रही हैं।',
    realProblem: 'अंदर का सेरामिक ब्रास स्पिंडल घिस चुका है या रबर O-रिंग कट गया है। पूरा नल बदलने की जरूरत नहीं है।',
    neededHardware: [
      { name: '1/2 इंच हैवी ब्रास सेरामिक स्पिंडल', approxPrice: 85, unit: '1 पीस' },
      { name: 'टेफ्लॉन थ्रेड सील टेप (12mm)', approxPrice: 20, unit: '1 रोल' },
      { name: 'हैवी रबर वाशर सेट', approxPrice: 15, unit: '1 सेट' },
    ],
    laborEstimate: {
      description: 'भोपाल मानक प्लंबर विज़िट & स्पिंडल रिप्लेसमेंट चार्ज',
      approxPrice: 150,
    },
    totalEstimatedCost: 270,
    diySteps: [
      '1. सबसे पहले सिंक के नीचे का एंगल वाल्व या छत की टंकी का मुख्य वाल्व बंद करें।',
      '2. नल के ऊपर की कैप को पेचकश से हटाएं और अंदर का स्क्रू खोलकर हैंडल निकालें।',
      '3. 17mm के पाने से पुराने स्पिंडल को एंटी-क्लॉकवाइज घुमाकर निकालें, नया स्पिंडल टेफ्लॉन लगाकर कसें।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: पूरा नया नल ₹800 का मत खरीदें! केवल ₹85 का ब्रास स्पिंडल बदलने से नल ठीक हो जाएगा। प्लंबर को ₹150 से अधिक न दें।',
  },
  seepage_moisture: {
    id: 'seepage_moisture',
    category: 'mason',
    titleHindi: '🧱 दीवार पर नमी, सफेद शोरा व पपड़ी',
    visibleObservation: 'दीवार की सतह पर 1 से 3 फीट की ऊंचाई तक गीलापन, पपड़ी उखड़ना और सफेद पाउडर (शोरा) दिखाई दे रहा है।',
    inferredCause: 'दीवार के पीछे बाथरूम की कंसील्ड पाइप लीकेज या फर्श के टाइल ग्राउट से नमी रिसने का संकेत है। (नोट: बिना प्रेशर गेज टेस्ट के सिर्फ फोटो से भीतरी पाइप फटने की पुष्टि न करें; पहले सीपेज का स्रोत पहचानना अनिवार्य है)।',
    visualSymptom: 'दीवार के निचले हिस्से से पेंट फूला हुआ है और सफेद पाउडर (शोरा) झड़ रहा है।',
    realProblem: 'केशिका नमी (Capillary Moisture) या आंतरिक लीकेज। सिर्फ पुट्टी या नया पेंट लगाने से 2 महीने में फिर उखड़ जाएगा।',
    neededHardware: [
      { name: 'Dr. Fixit Dampguard / DampShield Elasto (1L)', approxPrice: 380, unit: '1 कैन' },
      { name: 'Asian Paints SmartCare Crack Seal (1 Kg)', approxPrice: 190, unit: '1 पैक' },
      { name: 'बिरला वाइट वॉटरप्रूफ पुट्टी (5 Kg)', approxPrice: 120, unit: '1 बैग' },
    ],
    laborEstimate: {
      description: 'स्क्रैपिंग, सीपेज ट्रीटमेंट & पुट्टी लेबर',
      approxPrice: 350,
    },
    totalEstimatedCost: 1040,
    diySteps: [
      '1. फूला हुआ पेंट व प्लास्टर ईंट की सतह तक सावधानी से छीलें।',
      '2. दीवार को सूखने दें, फिर डॉ. फिक्सिट डैमगार्ड का पहला कोट लगाएं।',
      '3. 6 घंटे बाद दूसरा कोट लगाएं और उसके बाद ही वॉटरप्रूफ पुट्टी लगाएं।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: गीली सीलन वाली दीवार पर सीधे नया पेंट न लगाएं। जब तक अंदर का रिसाव बंद नहीं होगा, पेंट दोबारा उखड़ जाएगा।',
  },
  mcb_tripping: {
    id: 'mcb_tripping',
    category: 'electrician',
    titleHindi: '⚡ बिजली बोर्ड में MCB बार-बार गिरना (ट्रिपिंग)',
    visibleObservation: 'डिस्ट्रीब्यूशन बॉक्स में एक विशिष्ट सर्किट ब्रेकर (MCB) नीचे गिरी हुई स्थिति में दिखाई दे रही है।',
    inferredCause: 'उस विशेष सर्किट पर ओवरलोडिंग (उदा. AC/गीजर) अथवा न्यूट्रल-अर्थिंग में लीकेज का संकेत है।',
    visualSymptom: 'AC, गीजर या भारी लोड चालू करते ही डिस्ट्रीब्यूशन बॉक्स की MCB नीचे गिर जाती है।',
    realProblem: 'वायर का गेज कम होने से ओवरलोड ट्रिपिंग अथवा शॉर्ट-सर्किट की संभावना।',
    isSafetyHazard: true,
    safetyMessage: '⚠️ सुरक्षा चेतावनी: बार-बार MCB ऊपर उठाने की कोशिश न करें और न ही तार बांधें। किसी भी खुले तार को हाथ न लगाएं।',
    neededHardware: [
      { name: 'Havells / Schneider C-Curve 25A/32A MCB', approxPrice: 220, unit: '1 पीस' },
      { name: 'Finolex 4.0 sq.mm FR-LSH प्योर कॉपर वायर', approxPrice: 240, unit: '5 मीटर' },
    ],
    laborEstimate: {
      description: 'इलेक्ट्रीशियन लोड टेस्टिंग & सर्किट रिपेयर',
      approxPrice: 200,
    },
    totalEstimatedCost: 660,
    diySteps: [], // Suppressed for safety
    karigarAdvice:
      'उस्ताद की हिदायत: कभी भी ट्रिप होने वाली 16A MCB की जगह जबरदस्ती मोटा तार न बांधें, इससे पूरी वायरिंग में आग लग सकती है! सर्टिफाइड इलेक्ट्रीशियन से ही जांच कराएं।',
  },
  switchboard_spark: {
    id: 'switchboard_spark',
    category: 'electrician',
    titleHindi: '⚠️ स्विचबोर्ड से चिंगारी (स्पार्क) व जलने की गंध',
    visibleObservation: 'स्विचबोर्ड के सॉकेट या किनारों पर काले धुएं के निशान अथवा चिंगारी (स्पार्क) दिख रही है।',
    inferredCause: 'ढीले कनेक्शन (Loose terminal connection) अथवा आंतरिक शॉर्ट सर्किट से तेज स्पार्किंग हो रही है।',
    visualSymptom: 'स्विच ऑन-ऑफ करते समय चिंगारी निकलना और प्लास्टिक जलने की गंध आना।',
    realProblem: 'गंभीर विद्युत शॉर्ट सर्किट और आग का खतरा।',
    isSafetyHazard: true,
    safetyMessage: '⚠️ आपातकालीन सुरक्षा चेतावनी: तुरंत मुख्य DP / MCB (मेन स्विच) बंद करें! किसी भी नंगे तार या बोर्ड को हाथ न लगाएं।',
    neededHardware: [
      { name: 'मॉड्यूलर 16A स्विच & सॉकेट सेट', approxPrice: 180, unit: '1 सेट' },
      { name: 'हीट-रेसिस्टेंट 2.5mm कॉपर वायर', approxPrice: 120, unit: '2 मीटर' },
    ],
    laborEstimate: {
      description: 'आपातकालीन इलेक्ट्रीशियन विज़िट & सॉकेट रिप्लेसमेंट',
      approxPrice: 200,
    },
    totalEstimatedCost: 500,
    diySteps: [], // Suppressed for hazard safety
    karigarAdvice:
      'उस्ताद की हिदायत: चिंगारी आने पर खुद बोर्ड खोलने का प्रयास कभी न करें! पहले मेन स्विच गिराएं और तुरंत इलेक्ट्रीशियन बुलाएं।',
  },
  door_jam: {
    id: 'door_jam',
    category: 'carpenter',
    titleHindi: '🚪 लकड़ी का दरवाजा नीचे रगड़ना या चौखट में अटकना',
    visibleObservation: 'दरवाजे के निचले हिस्से या साइड में फर्श/चौखट पर रगड़ के घिसे हुए निशान दिख रहे हैं।',
    inferredCause: 'कब्जे (Hinges) के स्क्रू ढीले होकर दरवाजा झुक गया है या लकड़ी ने नमी सोखकर फैलाव (Swelling) ले लिया है।',
    visualSymptom: 'दरवाजा खोलने-बंद करने पर फर्श पर रगड़ता है या जोर लगाना पड़ता है।',
    realProblem: 'कब्जे ढीले होने से दरवाजा झुकना या नमी से लकड़ी का फूलना।',
    neededHardware: [
      { name: '1.5 इंच हैवी स्टार जिप्सम स्क्रू सेट', approxPrice: 30, unit: '1 पैकेट' },
      { name: 'हैवी ब्रास 4-इंच कब्जा (Hinge)', approxPrice: 95, unit: '1 पीस' },
    ],
    laborEstimate: {
      description: 'कारपेंटर रंदा मारना & कब्ज़ा अलाइनमेंट',
      approxPrice: 180,
    },
    totalEstimatedCost: 305,
    diySteps: [
      '1. पहले ऊपरी कब्जे के स्क्रू कसकर देखें, कई बार केवल स्क्रू टाइट करने से दरवाजा सीधा हो जाता है।',
      '2. यदि स्क्रू फ्री हो गया हो, तो छेद में फेविकोल लगी माचिस की तीली भरकर स्क्रू टाइट करें।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: पूरे दरवाजे को मत छिलवाएं, केवल रगड़ वाले स्थान पर ही हल्का रंदा लगवाएं।',
  },
  tile_crack: {
    id: 'tile_crack',
    category: 'mason',
    titleHindi: '📐 फर्श की टाइल चटकना या खोखली आवाज आना',
    visibleObservation: 'फर्श की टाइल की सतह पर सीधी या तिरछी दरार दिख रही है अथवा कोना टूटा हुआ है।',
    inferredCause: 'टाइल लगाते समय नीचे सीमेंट का 100% बेड नहीं भरा गया था, खोखले स्थान (Hollow pocket) पर भार पड़ने से टाइल चटक गई।',
    visualSymptom: 'चलने पर टाइल के नीचे से कट-कट आवाज आना या दरार दिखना।',
    realProblem: 'टाइल के नीचे खोखलापन (Zero full-bed adhesive coverage) था।',
    neededHardware: [
      { name: '2x4 फीट विट्रीफाइड टाइल (मैचिंग)', approxPrice: 280, unit: '1 टाइल' },
      { name: 'Roff T02 टाइल एडहेसिव (10 Kg)', approxPrice: 190, unit: '1 बैग' },
      { name: 'एपॉक्सी ग्राउट', approxPrice: 90, unit: '1 पैक' },
    ],
    laborEstimate: {
      description: 'टाइल मिस्त्री सावधानीपूर्वक कटिंग & फिक्सिंग',
      approxPrice: 250,
    },
    totalEstimatedCost: 810,
    diySteps: [
      '1. टूटी हुई टाइल को बीच से तोड़कर निकालें ताकि बगल वाली टाइल्स सुरक्षित रहें।',
      '2. नीचे का पुराना सूखा सीमेंट 10mm गहराई तक साफ़ करें।',
      '3. टाइल एडहेसिव केमिकल से नई टाइल लगाएं और 24 घंटे भार न डालें।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: टाइल को कभी भी केवल सफेद सीमेंट से न चिपकवाएं, केमिकल एडहेसिव (Roff/Laticrete) ही एकमात्र टिकाऊ समाधान है।',
  },
  ac_cooling: {
    id: 'ac_cooling',
    category: 'ac_repair',
    titleHindi: '❄️ स्प्लिट/विंडो AC कूलिंग कम होना या पानी टपकना',
    visibleObservation: 'AC की इनडोर यूनिट से गर्म/कम ठंडी हवा आ रही है या ड्रेन ट्रे से पानी नीचे टपक रहा है।',
    inferredCause: 'फिल्टर या कंडेंसर कॉइल पर भारी धूल जमी है, ड्रेन पाइप ब्लॉक है, या रेफ्रिजरेंट गैस (R32/R410A) कम हुई है।',
    visualSymptom: 'AC चलने पर कमरा ठंडा न होना और इनडोर कॉइल पर बर्फ या पानी जमा होना।',
    realProblem: 'जेट पंप सर्विसिंग पेंडिंग, चोक ड्रेन लाइन या फ्लेयर नट से गैस लीकेज।',
    neededHardware: [
      { name: 'जेट-पंप कॉइल क्लीनिंग केमिकल & बैक-पैक कवर', approxPrice: 120, unit: 'सर्विस किट' },
      { name: 'ब्रास फ्लेयर नट + नाइट्रोजन प्रेशर चेक', approxPrice: 180, unit: 'लीक टेस्ट सेट' },
    ],
    laborEstimate: {
      description: 'AC टेक्निशियन फोम-जेट सर्विसिंग & ड्रेन क्लीनिंग',
      approxPrice: 499,
    },
    totalEstimatedCost: 799,
    diySteps: [
      '1. सबसे पहले इनडोर फ्रंट पैनल खोलकर दोनों मेश फिल्टर पानी से धोकर छाया में सुखाएं।',
      '2. ड्रेन पाइप का बाहरी सिरा जांचें कि कहीं कीचड़ या काई से जाम तो नहीं है।',
      '3. गैस रिफिल कराने से पहले हमेशा नाइट्रोजन से लीकेज टेस्ट जरूर करवाएं।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: सीधे गैस टॉप-अप न करवाएं! पहले लीकेज बंद करवाएं और वैक्यूम पंप चलाने के बाद ही गैस डलवाएं।',
  },
  geyser_leak: {
    id: 'geyser_leak',
    category: 'plumber',
    titleHindi: '🚿 बाथरूम गीज़र से पानी टपकना या हीटिंग न होना',
    visibleObservation: 'गीज़र टैंक के निचले जोड़ों से पानी की बूंदें गिर रही हैं या इनलेट/आउटलेट पाइप ढीला दिख रहा है।',
    inferredCause: 'हीटिंग एलिमेंट गैस्केट (रबर सील) खराब हुई है, सेफ्टी PRV वाल्व फंसा है, या 1.5kW/2kW कॉइल में स्केलिंग जम गई है।',
    visualSymptom: 'गीज़र चालू करने पर नीचे से पानी चूना या इंडिकेटर जलकर भी पानी गरम न होना।',
    realProblem: 'हार्ड वाटर स्केलिंग से गैस्केट/एलिमेंट खराब होना (अंदरूनी टैंक फटने से पहले जांच जरूरी)।',
    neededHardware: [
      { name: 'कॉपर 2kW हीटिंग एलिमेंट + थर्मोस्टेट & रबर गैस्केट', approxPrice: 480, unit: '1 सेट' },
      { name: '1/2" ब्रास PRV सेफ्टी वाल्व + SS कनेक्शन पाइप', approxPrice: 290, unit: '1 सेट' },
    ],
    laborEstimate: {
      description: 'प्लंबर / गीज़र मैकेनिक डीस्केलिंग व एलिमेंट रिप्लेसमेंट',
      approxPrice: 350,
    },
    totalEstimatedCost: 1120,
    diySteps: [
      '1. तुरंत गीज़र का पावर प्लग निकालें और कोल्ड वाटर इनलेट वाल्व बंद करें।',
      '2. यदि पानी मुख्य बॉडी के अंदर से रिस रहा है तो नया गीज़र बदलना सुरक्षित रहेगा, अन्यथा गैस्केट/एलिमेंट बदला जा सकता है।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: गीज़र टैंक की हर 2 साल में डीस्केलिंग व मैग्नीशियम एनोड रॉड बदलवाने से टैंक 8-10 साल तक सुरक्षित रहता है।',
  },
  putty_peeling: {
    id: 'putty_peeling',
    category: 'painter',
    titleHindi: '🎨 दीवार पर पुट्टी/पेंट के बबल बनना व पपड़ी झड़ना',
    visibleObservation: 'दीवार की ऊपरी पेंट परत गुब्बारे की तरह फूल गई है और उंगली से छूने पर पपड़ी उखड़ रही है।',
    inferredCause: 'पुराने पेंट के ऊपर बिना प्राइमर और पूरी सैंडिंग के नया पेंट चढ़ाया गया, या हल्की सतही नमी अंदर फंसी है।',
    visualSymptom: 'दीवार से पेंट की परतें छिलकर नीचे गिरना।',
    realProblem: 'कमजोर प्राइमर बॉन्ड (Poor adhesion) अथवा हल्की नमी।',
    neededHardware: [
      { name: 'बिरला/जेके वॉल पुट्टी (20kg बैग)', approxPrice: 490, unit: '1 बैग' },
      { name: 'एशियन पेंट्स TruCare इंटीरियर प्राइमर (1L)', approxPrice: 210, unit: '1 लीटर' },
      { name: 'रेगमार्क 120 व 220 ग्रिट पेपर', approxPrice: 45, unit: '4 शीट' },
    ],
    laborEstimate: {
      description: 'पेंटर स्क्रैपिंग, 2 कोट पुट्टी, प्राइमर व टच-अप',
      approxPrice: 450,
    },
    totalEstimatedCost: 1195,
    diySteps: [
      '1. पपड़ी वाले पूरे हिस्से को पुट्टी ब्लेड से साफ़ ईंट/प्लास्टर तक खुरचें।',
      '2. सीमेंट प्राइमर लगाकर सुखाएं, फिर 2 पतले कोट पुट्टी चढ़ाएं।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: कभी भी पुरानी उखड़ती पपड़ी के ऊपर सीधे पेंट न चलाएं — पहले प्राइमर से सतह बांधना जरूरी है।',
  },
  wood_termite: {
    id: 'wood_termite',
    category: 'carpenter',
    titleHindi: '🪵 चौखट/अलमारी में दीमक या लकड़ी का बुरादा दिखना',
    visibleObservation: 'लकड़ी की चौखट या प्लाईवुड के कोने से बारीक मिट्टी की लाइनिंग या लकड़ी का पाउडर गिर रहा है।',
    inferredCause: 'सादी कमर्शियल प्लाई या अनट्रीटेड सॉफ्टवुड में दीमक (Termite) या वुड-बोरर कीड़ा लग गया है।',
    visualSymptom: 'दरवाजे की पट्टी का खोखला होना और बारीक बुरादा झड़ना।',
    realProblem: 'नमी युक्त दीवार के पास दीमक/बोरर संक्रमण।',
    neededHardware: [
      { name: 'Terminator एंटी-टर्माइट केमिकल (1 लीटर + इंजेक्शन सिरिंज)', approxPrice: 420, unit: '1 बोतल' },
      { name: 'सेंचुरी BWP 710 वाटरप्रूफ टर्माइट-प्रूफ प्लाई पैच', approxPrice: 650, unit: 'पैच शीट' },
    ],
    laborEstimate: {
      description: 'कारपेंटर केमिकल इंजेक्शन ट्रीटमेंट व सड़ी पट्टी बदलाव',
      approxPrice: 450,
    },
    totalEstimatedCost: 1520,
    diySteps: [
      '1. प्रभावित पल्ले/बक्सों को खाली करें और सिरिंज से हर छिद्र में टर्मिनेटर केमिकल इंजेक्ट करें।',
      '2. सड़ी हुई लकड़ी पूरी हटाकर BWP 710 ग्रेड मरीन प्लाई या WPC फ्रेम से बदलवाएं।',
    ],
    karigarAdvice:
      'उस्ताद की हिदायत: केवल ऊपर से पेंट या वार्निश करने से दीमक नहीं मरती! दीवार व चौखट के जोड़ में केमिकल ड्रिल ट्रीटमेंट आवश्यक है।',
  },
  ceiling_crack: {
    id: 'ceiling_crack',
    category: 'mason',
    titleHindi: '🏚️ छत की प्लास्टर दरार या सरिया दिखना (Spalling)',
    visibleObservation: 'छत के स्लैब में सीधी/जालीनुमा दरार दिख रही है या पपड़ी टूटकर अंदर का जंग लगा सरिया झांक रहा है।',
    inferredCause: 'छत के ऊपर जमा बारिश का पानी स्लैब तक पहुंचकर सरिये को जंग (Corrosion) लगा रहा है, जिससे कंक्रीट फूलकर गिर रहा है।',
    visualSymptom: 'छत से प्लास्टर झड़ना, दरार से पानी रिसना या स्टील का दिखना।',
    realProblem: 'स्लैब वॉटरप्रूफिंग फेल होना और रीबार रस्ट स्पैलिंग।',
    isSafetyHazard: true,
    safetyMessage: '⚠️ सुरक्षा चेतावनी: यदि छत से भारी कंक्रीट टुकड़े गिर रहे हैं तो उसके ठीक नीचे न खड़े हों/बैठें और तुरंत स्ट्रक्चरल राजमिस्त्री से जांच कराएं।',
    neededHardware: [
      { name: 'Dr. Fixit Pidicrete URP + एंटी-कोरोजन जिंक प्राइमर (1L)', approxPrice: 520, unit: '1 सेट' },
      { name: 'अल्ट्राटेक/ACC PPC सीमेंट + धुली रेत', approxPrice: 420, unit: 'रिपेयर बैग' },
    ],
    laborEstimate: {
      description: 'राजमिस्त्री चिपिंग, रस्ट ट्रीटमेंट व पॉलीमर मोर्टार रिपेयर',
      approxPrice: 600,
    },
    totalEstimatedCost: 1540,
    diySteps: [],
    karigarAdvice:
      'उस्ताद की हिदायत: छत के ऊपर टेरिस वॉटरप्रूफिंग करवाना अनिवार्य है और नीचे से सरिये पर एंटी-रस्ट प्राइमर लगाकर ही पॉलीमर मोर्टार से भरें।',
  },
};

/**
 * Intelligent Visual Diagnosis based on detected symptom or category
 * Returns null if blurry/unclear to prevent fabricated diagnosis
 */
export function diagnoseVisualProblem(
  scenarioKeyOrQuery: string,
  preferredCategory?: string,
  sourceContext: 'photo' | 'video_frame' | 'sample_demo' = 'sample_demo'
): VisualProblemDiagnosis | null {
  const q = (scenarioKeyOrQuery || '').toLowerCase().trim();

  // Explicit check for blurry / dark / unclear
  if (q.includes('blurry') || q.includes('धुंधली') || q.includes('dark') || q.includes('अस्पष्ट') || q.includes('unclear')) {
    return null;
  }

  let selected: VisualProblemDiagnosis | null = null;

  if (VISUAL_PROBLEM_SCENARIOS[scenarioKeyOrQuery]) {
    selected = { ...VISUAL_PROBLEM_SCENARIOS[scenarioKeyOrQuery] };
  } else if (q.includes('chingari') || q.includes('चिंगारी') || q.includes('spark') || q.includes('धुआं')) {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.switchboard_spark };
  } else if (/\bac\b|एसी |cooling|ठंडी हवा|compressor/.test(q) || preferredCategory === 'ac_repair') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.ac_cooling };
  } else if (/गीजर|geyser|हीटर|heater/.test(q)) {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.geyser_leak };
  } else if (/दीमक|termite|बुरादा|borer|कीड़ा/.test(q)) {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.wood_termite };
  } else if (/छत|ceiling|slab|स्लैब|सरिया|दरार|crack/.test(q)) {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.ceiling_crack };
  } else if (/पुट्टी|putty|पपड़ी|bubble|छिल/.test(q)) {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.putty_peeling };
  } else if (q.includes('नल') || q.includes('tap') || q.includes('tapak') || q.includes('टपक') || preferredCategory === 'plumber') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.tap_leakage };
  } else if (q.includes('सीलन') || q.includes('seepage') || q.includes('शोरा') || q.includes('नमी') || preferredCategory === 'painter') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.seepage_moisture };
  } else if (q.includes('mcb') || q.includes('ट्रिप') || q.includes('current') || preferredCategory === 'electrician') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.mcb_tripping };
  } else if (q.includes('दरवाजा') || q.includes('door') || q.includes('hinge') || q.includes('कब्जा') || preferredCategory === 'carpenter') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.door_jam };
  } else if (q.includes('टाइल') || q.includes('tile') || preferredCategory === 'mason' || preferredCategory === 'tiling') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.tile_crack };
  } else {
    // If query is completely unrecognized and not a demo scenario, do NOT fabricate!
    if (sourceContext !== 'sample_demo') {
      return null;
    }
    selected = { ...VISUAL_PROBLEM_SCENARIOS.tap_leakage };
  }

  if (selected) {
    selected.sourceContext = sourceContext;
  }

  return selected;
}

/**
 * Format Visual Diagnosis with Distinct Observation vs Inference
 */
export function formatVisualDiagnosisResult(
  diag: VisualProblemDiagnosis,
  sourceContext?: 'photo' | 'video_frame' | 'sample_demo'
): {
  title: string;
  observation: string;
  inference: string;
  safetyAlert?: string;
} {
  const ctx = sourceContext || diag.sourceContext || 'sample_demo';
  let prefix = '';
  if (ctx === 'video_frame') {
    prefix = 'इस frame में: ';
  } else if (ctx === 'photo') {
    prefix = 'अपलोड की गई फोटो में: ';
  } else {
    prefix = 'Demo नमूना: ';
  }

  return {
    title: diag.titleHindi,
    observation: `${prefix}${diag.visibleObservation || diag.visualSymptom || ''}`,
    inference: diag.inferredCause || diag.realProblem || '',
    safetyAlert: diag.isSafetyHazard ? diag.safetyMessage : undefined,
  };
}

// ============================================================================
// 💰 SETU SMART ESTIMATOR CALCULATION ENGINE
// ============================================================================

export interface CustomerEstimateParams {
  workTitle: string;
  quantity: number;
  unitType: 'day' | 'sqft' | 'point' | 'sheet';
  contractorDailyRate?: number | null;
  helperRate?: number | null;
  materialItemsCatalog?: { name: string; quantity: number; unitRate: number; unit: string }[];
}

export interface CustomerEstimateResult {
  workTitle: string;
  quantity: number;
  unitType: string;
  laborCost: number | null;
  laborCostText: string;
  laborDetails: string;
  materialCost: number;
  materialItems: { name: string; quantity: number; unitRate: number; total: number }[];
  materialDetails: string;
  totalCostEstimate: number | null;
  totalCostText: string;
  isTentative: boolean;
  tentativeDisclaimer: string;
}

export function calculateCustomerEstimate(params: CustomerEstimateParams): CustomerEstimateResult {
  const {
    workTitle,
    quantity,
    unitType,
    contractorDailyRate,
    helperRate = null,
    materialItemsCatalog = [],
  } = params;

  const safeQty = Math.max(0.5, Number(quantity) || 1);
  let laborCost: number | null = null;
  let laborCostText = '';
  let laborDetails = '';

  if (contractorDailyRate !== null && contractorDailyRate !== undefined && contractorDailyRate > 0) {
    const validHelper = helperRate !== null && helperRate !== undefined && Number(helperRate) > 0
      ? Math.round(Number(helperRate))
      : 0;
    if (unitType === 'day') {
      laborCost = Math.round((contractorDailyRate + validHelper) * safeQty);
      laborCostText = `₹${laborCost.toLocaleString('en-IN')}`;
      laborDetails = validHelper > 0
        ? `कारीगर ₹${contractorDailyRate}/दिन + हेल्पर ₹${validHelper}/दिन × ${safeQty} दिन = ₹${laborCost.toLocaleString('en-IN')}`
        : `कारीगर दर: ₹${contractorDailyRate}/दिन × ${safeQty} दिन = ₹${laborCost.toLocaleString('en-IN')}`;
    } else {
      laborCost = Math.round(contractorDailyRate * safeQty);
      laborCostText = `₹${laborCost.toLocaleString('en-IN')}`;
      laborDetails = `दर: ₹${contractorDailyRate}/${unitType} × ${safeQty} = ₹${laborCost.toLocaleString('en-IN')}`;
    }
  } else {
    laborCost = null;
    laborCostText = 'Contractor से quote लें (भाव पूछें)';
    laborDetails = 'कारीगर ने अपनी दर दर्ज नहीं की है। अंतिम दर बातचीत/कोटेशन के बाद तय होगी।';
  }

  let materialCost = 0;
  const materialItems: { name: string; quantity: number; unitRate: number; total: number }[] = [];
  let materialDetails = '';

  if (materialItemsCatalog && materialItemsCatalog.length > 0) {
    for (const item of materialItemsCatalog) {
      const itemTotal = item.quantity * item.unitRate;
      materialCost += itemTotal;
      materialItems.push({
        name: item.name,
        quantity: item.quantity,
        unitRate: item.unitRate,
        total: itemTotal,
      });
    }
    materialDetails = `सामग्री (कैटलॉग दर): ₹${materialCost.toLocaleString('en-IN')}`;
  } else {
    materialDetails = 'सामग्री: आवश्यकतानुसार साइट पर मुआयने के बाद तय होगी';
  }

  const totalCostEstimate = laborCost !== null ? laborCost + materialCost : null;
  const totalCostText = totalCostEstimate !== null
    ? `₹${totalCostEstimate.toLocaleString('en-IN')}`
    : `सामग्री ₹${materialCost.toLocaleString('en-IN')} + लेबर (भाव पूछें)`;

  return {
    workTitle,
    quantity,
    unitType,
    laborCost,
    laborCostText,
    laborDetails,
    materialCost,
    materialItems,
    materialDetails,
    totalCostEstimate,
    totalCostText,
    isTentative: true,
    tentativeDisclaimer: 'नोट: यह AI द्वारा तैयार किया गया प्राथमिक अनुमान है, अंतिम दरें कारीगर द्वारा साइट देखकर कोटेशन में तय होंगी।',
  };
}

// ============================================================================
// 🎨 AI 3D मॉड्यूलर किचन & वॉर्डरोब विजुअलाइज़र इंजन (3D Visual Studio)
// ============================================================================

export interface SpaceDesign3D {
  id: string;
  type: 'kitchen' | 'wardrobe' | 'masonry' | 'plumbing' | 'electrical';
  layoutKey: string;
  layoutTitle: string;
  finishKey: string;
  finishTitle: string;
  dimensions: { lengthFt: number; widthFt: number; heightFt: number };
  totalSqFt: number;
  runningFt: number;
  cabinetBreakdown: { item: string; qty: number; desc: string }[];
  materialEstimate: { name: string; qty: string; rate: number; total: number }[];
  totalMaterialCost: number;
  laborCost: number;
  grandTotal: number;
  ustadAdvice: string;
  schematicBoxes: {
    label: string;
    color: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

function getRegionalSpaceLaborMultiplier(locality = ''): number {
  const loc = (locality || '').toLowerCase();
  if (/मुंबई|mumbai|thane|navi mumbai/.test(loc)) return 1.38;
  if (/दिल्ली|delhi|noida|gurgaon|gurugram|ncr|बेंगलुरु|bangalore|bengaluru/.test(loc)) return 1.3;
  if (/पुणे|pune|हैदराबाद|hyderabad|चेन्नई|chennai|अहमदाबाद|ahmedabad/.test(loc)) return 1.2;
  if (/इंदौर|indore|जयपुर|jaipur|कोलकाता|kolkata|लखनऊ|lucknow/.test(loc)) return 1.08;
  return 1.0;
}

export function calculate3DSpaceDesign(params: {
  type: 'kitchen' | 'wardrobe' | 'masonry' | 'plumbing' | 'electrical';
  layout?: string;
  finish?: string;
  lengthFt?: number;
  widthFt?: number;
  locality?: string;
}): SpaceDesign3D {
  const { type, layout = 'L_SHAPE', finish = 'ACRYLIC', locality = 'भोपाल' } = params;
  const rawLen = Number(params.lengthFt);
  const rawWid = Number(params.widthFt);
  const lengthFt = Math.min(200, Math.max(2, Number.isFinite(rawLen) && rawLen > 0 ? rawLen : 10));
  const widthFt = Math.min(200, Math.max(2, Number.isFinite(rawWid) && rawWid > 0 ? rawWid : 8));
  const laborMultiplier = getRegionalSpaceLaborMultiplier(locality);

  // 1. MASONRY (राजमिस्त्री - घर/दीवार संरचना)
  if (type === 'masonry') {
    const heightFt = 10;
    const wallArea = (lengthFt + widthFt) * 2 * heightFt;
    const brickCount = Math.round(wallArea * 8.5); // 9 inch brickwork
    const cementBags = Math.ceil(wallArea / 45); // 1:4 mortar
    const sandCft = Math.round(cementBags * 8.5);
    const steelKg = Math.round(lengthFt * widthFt * 1.8);

    const cementCost = cementBags * 390;
    const brickCost = Math.round(brickCount * 8.2);
    const sandCost = Math.round(sandCft * 42);
    const steelCost = Math.round(steelKg * 68);
    const totalMaterialCost = cementCost + brickCost + sandCost + steelCost;
    const laborCost = Math.round(wallArea * 48 * laborMultiplier); // Regional mason standard
    const grandTotal = totalMaterialCost + laborCost;

    return {
      id: `3d_masonry_${Date.now()}`,
      type: 'masonry',
      layoutKey: layout || 'ROOM_WALL',
      layoutTitle: 'मकान / कमरा 3D चिनाई & कॉलम स्ट्रक्चर',
      finishKey: finish || 'RED_BRICK',
      finishTitle: '9 इंच अव्वल लाल ईंट + M20 कंक्रीट फ्रेम',
      dimensions: { lengthFt, widthFt, heightFt },
      totalSqFt: Math.round(lengthFt * widthFt),
      runningFt: (lengthFt + widthFt) * 2,
      cabinetBreakdown: [
        { item: 'लोड-बेयरिंग RCC कॉलम (Pillars)', qty: 4, desc: '9x9 इंच 4 सूत सरिया + M20 कंक्रीट' },
        { item: '9 इंच बाहरी सुरक्षा दीवार', qty: 2, desc: '1:4 सीमेंट-रेत अनुपात मजबूत चिनाई' },
        { item: '7 फीट डोर & विंडो लिटल बीम', qty: 1, desc: 'दरवाजे/खिड़की के ऊपर 6 इंच टाई बीम' },
        { item: 'वाटरप्रूफ डीपीसी (DPC) लेयर', qty: 1, desc: 'जमीन से सीलन रोकने हेतु डॉक्टर फिक्सिट कोटिंग' },
      ],
      materialEstimate: [
        { name: 'अल्ट्राटेक/एसीसी सीमेंट (PPC)', qty: `${cementBags} बैग्स`, rate: 390, total: cementCost },
        { name: 'अव्वल क्वालिटी लाल पक्की ईंट', qty: `${brickCount} नग`, rate: 8.2, total: brickCost },
        { name: 'धुली हुई नर्मदा नदी की रेत', qty: `${sandCft} घन फीट`, rate: 42, total: sandCost },
        { name: 'टाटा टिस्कॉन 550D 12mm सरिया', qty: `${steelKg} किलोग्राम`, rate: 68, total: steelCost },
      ],
      totalMaterialCost,
      laborCost,
      grandTotal,
      ustadAdvice: 'उस्ताद की हिदायत: दीवार चिनाई के बाद लगातार 7 दिनों तक सुबह-शाम तराई (Curing) अवश्य करें। पिलर कास्टिंग के समय वाइब्रेटर चलाएं ताकि हवा के बुलबुले न रहें।',
      schematicBoxes: [
        { label: 'कॉलम 1 (9x9")', color: '#64748B', x: 20, y: 30, width: 35, height: 35 },
        { label: '9" मुख्य दीवार', color: '#EF4444', x: 55, y: 38, width: 180, height: 20 },
        { label: 'कॉलम 2 (9x9")', color: '#64748B', x: 235, y: 30, width: 35, height: 35 },
        { label: 'खिड़की & लिंटेल बीम', color: '#3B82F6', x: 100, y: 80, width: 90, height: 45 },
        { label: '7\' प्रवेश द्वार ओपनिंग', color: '#10B981', x: 70, y: 140, width: 150, height: 40 },
      ],
    };
  }

  // 2. PLUMBING (प्लम्बर - कंसील्ड पाइपलाइन & ड्रेनेज)
  if (type === 'plumbing') {
    const pipeLength1In = Math.round((lengthFt + widthFt) * 1.5);
    const fittingsCount = 14;

    const cpvcPipeCost = Math.round(pipeLength1In * 65);
    const fittingsCost = fittingsCount * 140;
    const drainagePipeCost = Math.round(lengthFt * 95);
    const valvesCost = 1850;
    const totalMaterialCost = cpvcPipeCost + fittingsCost + drainagePipeCost + valvesCost;
    const laborCost = Math.round(3500 * laborMultiplier); // Regional bathroom/kitchen plumbing
    const grandTotal = totalMaterialCost + laborCost;

    return {
      id: `3d_plumbing_${Date.now()}`,
      type: 'plumbing',
      layoutKey: layout || 'CONCEALED_LOOP',
      layoutTitle: 'कंसील्ड हॉट/कोल्ड जलप्रवाह & ढलान ड्रेनेज',
      finishKey: finish || 'CPVC_SDR11',
      finishTitle: 'एस्ट्रल/सुप्रीम CPVC क्लास 1 + PVC SWR ड्रेन',
      dimensions: { lengthFt, widthFt, heightFt: 7 },
      totalSqFt: Math.round(lengthFt * widthFt),
      runningFt: lengthFt + widthFt,
      cabinetBreakdown: [
        { item: 'गीज़र इनलेट & आउटलेट लूप', qty: 2, desc: 'हॉट & कोल्ड सेपरेट कंसील्ड सर्किट' },
        { item: 'शॉवर डाइवर्टर / वाशबेसिन पॉइंट', qty: 3, desc: '1/2 इंच ब्रास एल्बो सॉकेट' },
        { item: '4 इंच PVC वेस्ट पाइप (2.5% ढलान)', qty: 1, desc: 'बिना रुकावट गंदा पानी निकासी' },
        { item: 'एंटी-कॉकरोच नाहनी ट्रैप', qty: 2, desc: 'बदबू और कीड़े रोकने हेतु डीप सील' },
      ],
      materialEstimate: [
        { name: 'एस्ट्रल 1" CPVC SDR-11 पाइप', qty: `${pipeLength1In} फीट`, rate: 65, total: cpvcPipeCost },
        { name: 'ब्रास एल्बो, टी & सॉकेट्स सेट', qty: `${fittingsCount} नग`, rate: 140, total: fittingsCost },
        { name: 'सुप्रीम 4" SWR ड्रेन पाइप विथ रिंग्स', qty: `${lengthFt} फीट`, rate: 95, total: drainagePipeCost },
        { name: 'कंसील्ड बॉल वाल्व & टेफ्लॉन सॉल्वेंट', qty: '1 कॉम्बो किट', rate: 1850, total: valvesCost },
      ],
      totalMaterialCost,
      laborCost,
      grandTotal,
      ustadAdvice: 'उस्ताद की हिदायत: दीवार में कंसील्ड पाइप लगाने के बाद प्लास्टर से पहले 24 घंटे 100 PSI पर वाटर प्रेशर टेस्टिंग अवश्य कराएं, और ड्रेन पाइप में 1 फीट पर कम से कम 1/4 इंच ढलान रखें।',
      schematicBoxes: [
        { label: 'मेन वाटर इनलेट लाइन (1" CPVC)', color: '#0284C7', x: 20, y: 30, width: 250, height: 16 },
        { label: 'गीज़र हॉट लाइन (रेड CPVC)', color: '#EF4444', x: 40, y: 65, width: 120, height: 16 },
        { label: 'कंसील्ड डाइवर्टर & शॉवर', color: '#06B6D4', x: 180, y: 65, width: 85, height: 40 },
        { label: '4" SWR वेस्ट ड्रेन (ढलान)', color: '#10B981', x: 30, y: 130, width: 230, height: 24 },
      ],
    };
  }

  // 3. ELECTRICAL (इलेक्ट्रीशियन - कंसील्ड वायरिंग & लोड)
  if (type === 'electrical') {
    const conduitLength = Math.round((lengthFt + widthFt) * 3);
    const wireBundles = 4;
    const modularBoxes = 6;

    const conduitCost = Math.round(conduitLength * 22);
    const wireCost = wireBundles * 1450;
    const boxCost = modularBoxes * 210;
    const mcbCost = 1600;
    const totalMaterialCost = conduitCost + wireCost + boxCost + mcbCost;
    const laborCost = Math.round(2800 * laborMultiplier);
    const grandTotal = totalMaterialCost + laborCost;

    return {
      id: `3d_electrical_${Date.now()}`,
      type: 'electrical',
      layoutKey: layout || 'CONCEALED_CONDUIT',
      layoutTitle: '3D कंसील्ड कंड्यूट वायरिंग & MCB सर्किट',
      finishKey: finish || 'FR_COPPER',
      finishTitle: 'पॉलीकैब/हैवेल्स FR-LSH शुद्ध कॉपर वायर',
      dimensions: { lengthFt, widthFt, heightFt: 9 },
      totalSqFt: Math.round(lengthFt * widthFt),
      runningFt: lengthFt + widthFt,
      cabinetBreakdown: [
        { item: '12-मॉड्यूलर मेन स्विचबोर्ड पॉइंट', qty: 2, desc: 'फैन रेगुलेटर + 6A सॉकेट्स' },
        { item: '16A पावर सॉकेट (AC/गीज़र)', qty: 2, desc: '4 sq mm हैवी लोड डेडिकेटेड लाइन' },
        { item: 'सीलिंग फैन & COB प्रोफाइल लाइट हुक', qty: 4, desc: 'कंसील्ड जंक्शन बॉक्स' },
        { item: 'अर्थिंग सर्किट & सेपरेट न्यूट्रल', qty: 1, desc: 'शॉक-प्रूफ होम प्रोटेक्शन' },
      ],
      materialEstimate: [
        { name: 'पॉलीकैब 1.5 sq mm कॉपर वायर (लाइटिंग)', qty: '2 बंडल (90m)', rate: 1450, total: 2900 },
        { name: 'पॉलीकैब 2.5 & 4 sq mm कॉपर वायर (पावर/AC)', qty: '2 बंडल (90m)', rate: 1650, total: 3300 },
        { name: '25mm हैवी ड्यूटी PVC कंड्यूट पाइप', qty: `${conduitLength} फीट`, rate: 22, total: conduitCost },
        { name: 'हैवेल्स MCB & मेटल कंसील्ड बॉक्स', qty: `${modularBoxes} नग + 32A MCB`, rate: 380, total: boxCost + mcbCost },
      ],
      totalMaterialCost,
      laborCost,
      grandTotal,
      ustadAdvice: 'उस्ताद की हिदायत: AC और गीज़र के लिए कभी भी 1.5 mm का तार न लगाएं, हमेशा न्यूनतम 4 sq mm का सेपरेट सर्किट और 2.5 mm शुद्ध कॉपर की अर्थिंग दौड़ाएं।',
      schematicBoxes: [
        { label: 'मेन MCB डिस्ट्रीब्यूशन बॉक्स', color: '#F59E0B', x: 20, y: 30, width: 75, height: 50 },
        { label: '25mm सीलिंग कंड्यूट लाइन', color: '#6366F1', x: 105, y: 40, width: 165, height: 16 },
        { label: '16A AC पावर सॉकेट', color: '#EF4444', x: 190, y: 75, width: 80, height: 35 },
        { label: '12-मॉड्यूलर मेन स्विचबोर्ड', color: '#10B981', x: 30, y: 110, width: 130, height: 45 },
      ],
    };
  }

  // 4. KITCHEN & WARDROBE (बढ़ई / कारपेंटर)
  const heightFt = type === 'kitchen' ? 7 : 7.5;
  let runningFt = lengthFt;
  if (layout === 'L_SHAPE') runningFt = lengthFt + widthFt - 2;
  else if (layout === 'PARALLEL') runningFt = lengthFt * 2;
  else if (layout === 'U_SHAPE') runningFt = lengthFt + widthFt * 2 - 4;
  else if (layout === 'ISLAND') runningFt = lengthFt + widthFt + 5;

  const totalSqFt = Math.round(runningFt * heightFt);

  let finishMultiplier = 1.0;
  let finishTitle = '1mm PVC वॉटरप्रूफ माइका';
  if (finish === 'ACRYLIC') {
    finishMultiplier = 1.35;
    finishTitle = '1.5mm हाई-ग्लॉस ऐक्रेलिक (Century/Merino)';
  } else if (finish === 'PU_GLOSS') {
    finishMultiplier = 1.5;
    finishTitle = 'प्रीमियम इटैलियन PU हाई-ग्लॉस पेंट फिनिश';
  } else if (finish === 'TEAK_WOOD') {
    finishMultiplier = 1.4;
    finishTitle = 'नेचुरल टीकवुड वेनियर + मेलामाइन मैट पॉलिश';
  }

  const plySheets = Math.ceil(totalSqFt / 28);
  const micaSheets = Math.ceil(totalSqFt / 28);
  const plyCost = plySheets * 2400;
  const micaCost = Math.round(micaSheets * (1600 * finishMultiplier));
  const hardwareChannels = Math.max(4, Math.round(runningFt * 0.8));
  const hardwareCost = hardwareChannels * 850 + 4500;
  const totalMaterialCost = plyCost + micaCost + hardwareCost;

  const laborRatePerSqFt = type === 'kitchen' ? 380 : 350;
  const laborCost = Math.round(totalSqFt * laborRatePerSqFt * laborMultiplier);
  const grandTotal = totalMaterialCost + laborCost;

  const layoutNames: Record<string, string> = {
    L_SHAPE: 'एल-शेप (L-Shape Modular)',
    PARALLEL: 'समानांतर (Parallel Galley)',
    U_SHAPE: 'यू-शेप (U-Shape Luxury)',
    STRAIGHT: 'स्ट्रेट लाइन (Single Wall)',
    ISLAND: 'आइलैंड किचन (Island Counter)',
  };

  const cabinetBreakdown =
    type === 'kitchen'
      ? [
          { item: 'बेस ड्रॉअर यूनिट्स (कटलरी + थाली + प्लेन)', qty: hardwareChannels, desc: '45kg लोड-बेयरिंग सॉफ्ट क्लोज चैनल' },
          { item: 'अपर वॉल कैबिनेट्स (हाइड्रॉलिक लिफ्ट-अप)', qty: Math.max(3, Math.round(runningFt / 2.5)), desc: 'ग्लास शटर + LED प्रोफाइल लाइट' },
          { item: 'सिंक बेस विथ वॉटरप्रूफ PVC लाइनर', qty: 1, desc: 'पानी से बचाव के लिए 100% वॉटरप्रूफिंग' },
          { item: 'टॉल पैंट्री यूनिट / कॉर्नर मैजिक कॉर्नर', qty: layout === 'L_SHAPE' || layout === 'U_SHAPE' ? 1 : 0, desc: 'स्पेस सेविंग 360° रोटेशन बास्केट' },
        ].filter((c) => c.qty > 0)
      : [
          { item: 'फुल-लेंथ हैंगिंग वॉर्डरोब स्पेस', qty: 2, desc: 'सूट और शेरवानी के लिए भारी ओवल रॉड' },
          { item: 'सॉफ्ट क्लोज इनर ड्रॉअर्स (लॉकर सहित)', qty: 4, desc: 'गहने और कैश के लिए डिजिटल सीक्रेट लॉक स्पेस' },
          { item: 'अपर लॉफ्ट स्टोरेज (कंबल/सूटकेस)', qty: 3, desc: 'सीलिंग तक पूरा स्पेस यूटिलाइजेशन' },
        ];

  const schematicBoxes = [
    { label: 'कुकिंग हॉब & चिमनी', color: '#EF4444', x: 20, y: 30, width: 80, height: 60 },
    { label: 'सॉफ्ट क्लोज ड्रॉअर्स', color: '#3B82F6', x: 110, y: 30, width: 90, height: 60 },
    { label: 'सिंक & वॉटर प्यूरीफायर', color: '#10B981', x: 210, y: 30, width: 70, height: 60 },
    { label: 'अपर लिफ्ट-अप कैबिनेट', color: '#8B5CF6', x: 20, y: 105, width: 260, height: 50 },
  ];

  return {
    id: `3d_${Date.now()}`,
    type,
    layoutKey: layout,
    layoutTitle: layoutNames[layout] || layout,
    finishKey: finish,
    finishTitle,
    dimensions: { lengthFt, widthFt, heightFt },
    totalSqFt,
    runningFt,
    cabinetBreakdown,
    materialEstimate: [
      { name: 'सेंचुरी/ग्रीनप्लाई BWP 710 ग्रेड मरीन प्लाई (19mm)', qty: `${plySheets} शीट्स (8x4)`, rate: 2400, total: plyCost },
      { name: finishTitle, qty: `${micaSheets} शीट्स (8x4)`, rate: Math.round(1600 * finishMultiplier), total: micaCost },
      { name: 'हेटिक/गोदरेज सॉफ्ट क्लोज हिंज & टेलिस्कोपिक चैनल', qty: `${hardwareChannels} सेट्स + एक्सेसरीज`, rate: 850, total: hardwareCost },
    ],
    totalMaterialCost,
    laborCost,
    grandTotal,
    ustadAdvice:
      type === 'kitchen'
        ? 'उस्ताद की हिदायत: सिंक के नीचे कभी भी सादी कमर्शियल प्लाई न लगाएं। केवल IS:710 मरीन प्लाई और 2mm PVC एज-बैंडिंग का ही उपयोग करें।'
        : 'उस्ताद की हिदायत: वॉर्डरोब के पल्लों में 3 सॉफ्ट-क्लोज हिंज लगवाएं ताकि भारी माइका का वजन सह सकें और पल्ला कभी टेढ़ा न हो।',
    schematicBoxes,
  };
}
