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
  category?: 'carpenter' | 'plumber' | 'mason' | 'painter' | 'electrician';
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
  category: 'carpenter' | 'plumber' | 'mason' | 'painter' | 'electrician';
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

/**
 * Multi-Factor Intent & Location Disentanglement Engine
 * Accurately parses Hindi, English, and Roman Hindi (Hinglish)
 * Differentiates Location (जगह), Problem (समस्या), and Work (काम)
 * Handles context continuity and high-risk safety hazards
 */
export function parseCustomerProblem(
  rawQuery: string,
  previousContext?: CustomerProblemContext | null
): CustomerProblemContext {
  const q = (rawQuery || '').toLowerCase().trim();

  // -------------------------------------------------------------
  // 1. SAFETY HAZARD FIRST (High-risk electrical / fire / spark)
  // -------------------------------------------------------------
  const isHazard =
    q.includes('chingari') ||
    q.includes('चिंगारी') ||
    q.includes('spark') ||
    q.includes('sparks') ||
    q.includes('dhuan') ||
    q.includes('धुआं') ||
    q.includes('धुआ') ||
    q.includes('smoke') ||
    q.includes('current') ||
    q.includes('करंट') ||
    q.includes('shock') ||
    q.includes('शॉक') ||
    q.includes('short circuit') ||
    q.includes('शॉर्ट सर्किट') ||
    q.includes('jalne ki') ||
    q.includes('जलने की बदबू') ||
    q.includes('aag') ||
    q.includes('आग');

  if (isHazard) {
    return {
      rawQuery,
      location: q.includes('switch') || q.includes('board') || q.includes('स्विच') ? 'Switchboard (बिजली बोर्ड)' : 'विद्युत पॉइंट',
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
  if (previousContext && previousContext.needsClarification) {
    const prevLocation = previousContext.location || 'Bathroom (बाथरूम)';
    
    // Check if reply specifies "wall" / "दीवार से"
    if (q.includes('deewar') || q.includes('दीवार') || q.includes('wall') || q.includes('seelan') || q.includes('सीलन') || q.includes('रिस')) {
      return {
        rawQuery,
        location: prevLocation,
        locationKey: previousContext.locationKey || 'bathroom',
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
    if (q.includes('nal') || q.includes('नल') || q.includes('tap') || q.includes('tapak') || q.includes('टपक')) {
      return {
        rawQuery,
        location: prevLocation,
        locationKey: previousContext.locationKey || 'bathroom',
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
    if (q.includes('farsh') || q.includes('फर्श') || q.includes('floor') || q.includes('naali') || q.includes('नाली') || q.includes('jama') || q.includes('drain')) {
      return {
        rawQuery,
        location: prevLocation,
        locationKey: previousContext.locationKey || 'bathroom',
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
  // E.g. "Bathroom me pani aa raha hai" / "बाथरूम में पानी आ रहा है"
  const isAmbiguousWater =
    (q.includes('pani aa raha') || q.includes('पानी आ रहा') || q.includes('water coming') || q.includes('pani gir raha') || q.includes('पानी गिर रहा')) &&
    !q.includes('nal') &&
    !q.includes('नल') &&
    !q.includes('tap') &&
    !q.includes('deewar') &&
    !q.includes('दीवार') &&
    !q.includes('geyser') &&
    !q.includes('गीजर') &&
    !q.includes('naali') &&
    !q.includes('नाली');

  if (isAmbiguousWater && (q.includes('bathroom') || q.includes('बाथरूम') || q.includes('washroom') || q.includes('टॉयलेट') || q.includes('कमरे'))) {
    const loc = q.includes('bathroom') || q.includes('बाथरूम') || q.includes('washroom') ? 'Bathroom (बाथरूम)' : 'कमरा';
    return {
      rawQuery,
      location: loc,
      locationKey: 'bathroom',
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
  // Extract Location
  let detectedLocation = 'सामान्य कार्य';
  let locationKey: CustomerProblemContext['locationKey'] = 'general';

  if (q.includes('kitchen') || q.includes('किचन') || q.includes('रसोई') || q.includes('rasoi')) {
    detectedLocation = 'किचन (रसोई)';
    locationKey = 'kitchen';
  } else if (q.includes('bathroom') || q.includes('बाथरूम') || q.includes('washroom') || q.includes('gusal-khana')) {
    detectedLocation = 'Bathroom (बाथरूम)';
    locationKey = 'bathroom';
  } else if (q.includes('bedroom') || q.includes('बेडरूम') || q.includes('कमरा') || q.includes('room')) {
    detectedLocation = 'Bedroom (कमरा)';
    locationKey = 'bedroom';
  } else if (q.includes('roof') || q.includes('छत') || q.includes('terrace') || q.includes('dhalai')) {
    detectedLocation = 'Roof (छत)';
    locationKey = 'roof';
  } else if (q.includes('switchboard') || q.includes('स्विच') || q.includes('board') || q.includes('meter')) {
    detectedLocation = 'Switchboard (बिजली बोर्ड)';
    locationKey = 'switchboard';
  } else if (q.includes('living room') || q.includes('हॉल') || q.includes('hall')) {
    detectedLocation = 'Living Room (हॉल)';
    locationKey = 'living_room';
  }

  // Multi-Factor Problem & Category Disentanglement:
  // Plumber cues:
  const hasPlumbingClues =
    q.includes('nal') ||
    q.includes('नल') ||
    q.includes('tap') ||
    q.includes('tapak') ||
    q.includes('टपक') ||
    q.includes('leak') ||
    q.includes('लीक') ||
    q.includes('pipe') ||
    q.includes('पाइप') ||
    q.includes('flush') ||
    q.includes('फ्लश') ||
    q.includes('geyser') ||
    q.includes('गीजर') ||
    q.includes('drain') ||
    q.includes('नाली') ||
    q.includes('कमोड') ||
    q.includes('commode') ||
    q.includes('faucet') ||
    q.includes('plumber') ||
    q.includes('प्लंबर');

  // Carpenter cues:
  const hasCarpentryClues =
    q.includes('almari') ||
    q.includes('अलमारी') ||
    q.includes('wardrobe') ||
    q.includes('hinge') ||
    q.includes('कब्जा') ||
    q.includes('हिंज') ||
    q.includes('darwaza') ||
    q.includes('दरवाजा') ||
    q.includes('door') ||
    q.includes('farnichar') ||
    q.includes('फर्नीचर') ||
    q.includes('furniture') ||
    q.includes('plywood') ||
    q.includes('प्लाई') ||
    q.includes('drawer') ||
    q.includes('दराज') ||
    q.includes('lock') ||
    q.includes('ताला') ||
    q.includes('carpenter') ||
    q.includes('बढ़ई') ||
    q.includes('माइका') ||
    q.includes('laminate') ||
    q.includes('bed') ||
    q.includes('बेड');

  // Electrician cues:
  const hasElectricalClues =
    q.includes('bijli') ||
    q.includes('बिजली') ||
    q.includes('electric') ||
    q.includes('mcb') ||
    q.includes('switch') ||
    q.includes('स्विच') ||
    q.includes('wire') ||
    q.includes('वायर') ||
    q.includes('fan') ||
    q.includes('पंखा') ||
    q.includes('light') ||
    q.includes('लाइट') ||
    q.includes('inverter') ||
    q.includes('इनवर्टर') ||
    q.includes('plug') ||
    q.includes('प्लग') ||
    q.includes('socket') ||
    q.includes('सॉकेट');

  // Painting cues:
  const hasPaintingClues =
    q.includes('paint') ||
    q.includes('पेंट') ||
    q.includes('putty') ||
    q.includes('पुट्टी') ||
    q.includes('rang') ||
    q.includes('रंग') ||
    q.includes('whitewash') ||
    q.includes('सफेदी') ||
    q.includes('distemper') ||
    q.includes('डिस्टेंपर') ||
    q.includes('painter') ||
    q.includes('पेंटर');

  // Civil / Masonry cues:
  const hasMasonryClues =
    q.includes('tile') ||
    q.includes('टाइल्स') ||
    q.includes('marble') ||
    q.includes('मार्बल') ||
    q.includes('chinai') ||
    q.includes('चिनाई') ||
    q.includes('brick') ||
    q.includes('ईंट') ||
    q.includes('plaster') ||
    q.includes('प्लास्टर') ||
    q.includes('dhalai') ||
    q.includes('ढलाई') ||
    q.includes('rcc') ||
    q.includes('slab') ||
    q.includes('seelan') ||
    q.includes('सीलन') ||
    q.includes('mason') ||
    q.includes('मिस्त्री');

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
  category: 'plumber' | 'carpenter' | 'mason' | 'painter' | 'electrician';
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
  } else if (q.includes('नल') || q.includes('tap') || q.includes('tapak') || q.includes('टपक') || preferredCategory === 'plumber') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.tap_leakage };
  } else if (q.includes('सीलन') || q.includes('seepage') || q.includes('शोरा') || q.includes('नमी') || preferredCategory === 'painter') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.seepage_moisture };
  } else if (q.includes('mcb') || q.includes('ट्रिप') || q.includes('current') || preferredCategory === 'electrician') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.mcb_tripping };
  } else if (q.includes('दरवाजा') || q.includes('door') || q.includes('hinge') || q.includes('कब्जा') || preferredCategory === 'carpenter') {
    selected = { ...VISUAL_PROBLEM_SCENARIOS.door_jam };
  } else if (q.includes('टाइल') || q.includes('tile') || preferredCategory === 'mason') {
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
    helperRate = 0,
    materialItemsCatalog = [],
  } = params;

  let laborCost: number | null = null;
  let laborCostText = '';
  let laborDetails = '';

  if (contractorDailyRate !== null && contractorDailyRate !== undefined && contractorDailyRate > 0) {
    if (unitType === 'day') {
      laborCost = contractorDailyRate * quantity;
      laborCostText = `₹${laborCost.toLocaleString('en-IN')}`;
      laborDetails = `कारीगर दर: ₹${contractorDailyRate}/दिन × ${quantity} दिन = ₹${laborCost.toLocaleString('en-IN')}`;
    } else {
      laborCost = contractorDailyRate * quantity;
      laborCostText = `₹${laborCost.toLocaleString('en-IN')}`;
      laborDetails = `दर: ₹${contractorDailyRate}/${unitType} × ${quantity} = ₹${laborCost.toLocaleString('en-IN')}`;
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
  type: 'kitchen' | 'wardrobe';
  layoutKey: 'L_SHAPE' | 'PARALLEL' | 'U_SHAPE' | 'STRAIGHT' | 'ISLAND';
  layoutTitle: string;
  finishKey: 'ACRYLIC' | 'PVC_LAMINATE' | 'PU_GLOSS' | 'TEAK_WOOD';
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

export function calculate3DSpaceDesign(params: {
  type: 'kitchen' | 'wardrobe';
  layout: 'L_SHAPE' | 'PARALLEL' | 'U_SHAPE' | 'STRAIGHT' | 'ISLAND';
  finish: 'ACRYLIC' | 'PVC_LAMINATE' | 'PU_GLOSS' | 'TEAK_WOOD';
  lengthFt: number;
  widthFt: number;
}): SpaceDesign3D {
  const { type, layout, finish, lengthFt = 10, widthFt = 8 } = params;
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
  const laborCost = Math.round(totalSqFt * laborRatePerSqFt);
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
