/**
 * SETU Master Karigar Backend Engine
 * Ensures:
 * 1) Strictly matching project classification across ALL trades + unlimited custom works (ZERO kitchen default leak).
 * 2) Negation awareness, Hinglish/Hindi spelling normalization, chat city/BHK/dimension/fraction budget extraction.
 * 3) Pure Raw-Material ("कच्चा माल") showroom groups & photorealistic rendering prompts.
 * 4) Playful Design-First -> On-Demand 3-Way Smart Quotation (Only Karigar, Material + Karigar, Only Raw Material)
 *    with verified arithmetic, anti-double-inflation regional rates, and GST/freight transparency.
 */

const RAW_PROJECT_CONFIGS = {
  bed: {
    tradeCategory: 'carpenter',
    titleHi: 'कस्टम लकड़ी / प्लाईवुड बेड मॉडल',
    dimensions: '6×6.5 फीट (किंग/क्वीन स्टैंडर्ड)',
    duration: '4 से 5 कार्य दिवस',
    baseSceneEn: 'Indian bedroom with handcrafted double wooden bed, warm timber grain, crisp white linen mattress and natural side lighting',
    defaultMaterialCost: 18350,
    budgetMaterialCost: 9200,
    luxuryMaterialCost: 30400,
    minLabor: 4200,
    laborRatio: 0.32,
    scalableByArea: false,
    budgetItems: [
      { name: 'कॉमर्शियल MR प्लाई 19mm (8x4 शीट)', gradeOrBrand: 'Greenply Eco MR', qty: 4, unitRate: 1350, unitLabel: 'शीट', amount: 5400 },
      { name: 'मैट वुड-ग्रेन सनमाइका (0.8mm शीट)', gradeOrBrand: 'Merino Matte', qty: 3, unitRate: 850, unitLabel: 'शीट', amount: 2550 },
      { name: 'L-एंगल, स्टार स्क्रू + फेविकोल SH (2kg)', gradeOrBrand: 'Pidilite & Ebco', qty: 1, unitRate: 1250, unitLabel: 'किट', amount: 1250 },
    ],
    sampleItems: [
      { name: 'सेंचुरी BWP 710 वॉटरप्रूफ प्लाई 19mm (कच्चा माल)', gradeOrBrand: 'CenturyPly Sainik IS:710', qty: 4, unitRate: 2450, unitLabel: 'शीट', amount: 9800 },
      { name: 'रॉयल टीक / वॉलनट 1mm माइका शीट', gradeOrBrand: 'Greenlam 1mm Texture', qty: 3, unitRate: 1650, unitLabel: 'शीट', amount: 4950 },
      { name: '125kg हाइड्रॉलिक गैस-लिफ्ट पंप + फेविकोल मरीन', gradeOrBrand: 'Hettich + Pidilite', qty: 1, unitRate: 3600, unitLabel: 'किट', amount: 3600 },
    ],
    luxuryItems: [
      { name: 'असली MP सागवान / शीशम लकड़ी पटिये', gradeOrBrand: 'Royal Sagwan Timber', qty: 8, unitRate: 2150, unitLabel: 'घन फुट', amount: 17200 },
      { name: 'नेचुरल टीक विनीयर + स्विस वेल्वेट व 40D फोम रोल', gradeOrBrand: 'Century Veneer + Sleepwell', qty: 3, unitRate: 3200, unitLabel: 'रोल/शीट', amount: 9600 },
      { name: 'हेफेले सॉफ्ट-क्लोज़ बेड ड्रॉअर + वार्म LED प्रोफाइल किट', gradeOrBrand: 'Hafele Germany', qty: 1, unitRate: 6400, unitLabel: 'पैक', amount: 6400 },
    ],
  },
  kitchen: {
    tradeCategory: 'carpenter',
    titleHi: 'मॉड्यूलर किचन कच्चा माल डिज़ाइन',
    dimensions: '10×8 फीट (अनुमानित)',
    duration: '5 से 7 कार्य दिवस',
    baseSceneEn: 'modern Indian home kitchen wall with L-shape modular wooden & acrylic base and wall cabinets, polished granite/quartz countertop, stainless steel sink and chimney',
    defaultMaterialCost: 37450,
    budgetMaterialCost: 21630,
    luxuryMaterialCost: 64570,
    minLabor: 7500,
    laborRatio: 0.28,
    scalableByArea: false,
    budgetItems: [
      { name: 'BWR 303 वॉटर-रेसिस्टेंट प्लाई 18mm', gradeOrBrand: 'Greenply BWR', qty: 5, unitRate: 1650, unitLabel: 'शीट', amount: 8250 },
      { name: 'इकोनॉमी मैट माइका (0.8mm शीट)', gradeOrBrand: 'Merino Lite', qty: 6, unitRate: 850, unitLabel: 'शीट', amount: 5100 },
      { name: 'ब्लैक ग्रेनाइट पॉलिश स्लैब', gradeOrBrand: 'Rajasthan Jet Black', qty: 24, unitRate: 170, unitLabel: 'sq.ft', amount: 4080 },
      { name: 'SS-202 वायर बास्केट सेट + फेविकोल मरीन', gradeOrBrand: 'Standard SS-202', qty: 1, unitRate: 4200, unitLabel: 'सेट', amount: 4200 },
    ],
    sampleItems: [
      { name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm', gradeOrBrand: 'CenturyPly Sainik 710', qty: 5, unitRate: 2450, unitLabel: 'शीट', amount: 12250 },
      { name: '1mm हाई-ग्लॉस माइका / एक्रेलिक शीट', gradeOrBrand: 'Greenlam / Merino', qty: 6, unitRate: 1650, unitLabel: 'शीट', amount: 9900 },
      { name: 'ग्रेनाइट / क्वार्ट्ज़ काउंटरटॉप पत्थर स्लैब', gradeOrBrand: 'Kalinga Stone / Black Granite', qty: 24, unitRate: 270, unitLabel: 'sq.ft', amount: 6480 },
      { name: 'सॉफ्ट-क्लोज़ टैंडेम चैनल & बास्केट हार्डवेयर', gradeOrBrand: 'Ebco Pro + Fevicol Marine', qty: 1, unitRate: 8820, unitLabel: 'सेट', amount: 8820 },
    ],
    luxuryItems: [
      { name: 'HDHMR हाई-डेंसिटी ग्रीन बोर्ड 18mm', gradeOrBrand: 'Action Tesa HDHMR', qty: 5, unitRate: 2950, unitLabel: 'शीट', amount: 14750 },
      { name: '1.5mm हाई-ग्लॉस क्रिस्टल एक्रेलिक शीट', gradeOrBrand: 'Rehau Acrylic', qty: 6, unitRate: 3400, unitLabel: 'शीट', amount: 20400 },
      { name: 'इटैलियन सतवारियो मार्बल स्लैब', gradeOrBrand: 'Italian Imported', qty: 24, unitRate: 580, unitLabel: 'sq.ft', amount: 13920 },
      { name: 'हेटिक कॉर्नर मैजिक बास्केट + हाइड्रॉलिक लिफ्टर', gradeOrBrand: 'Hettich Germany', qty: 1, unitRate: 15500, unitLabel: 'पैक', amount: 15500 },
    ],
  },
  wardrobe: {
    tradeCategory: 'carpenter',
    titleHi: 'वॉर्डरोब / अलमारी कस्टम डिज़ाइन',
    dimensions: '8×7 फीट (अपर लॉफ्ट सहित)',
    duration: '4 से 6 कार्य दिवस',
    baseSceneEn: 'Indian bedroom built-in floor-to-ceiling wardrobe with sleek wooden laminate sliding doors, brass handles and overhead loft storage',
    defaultMaterialCost: 24300,
    budgetMaterialCost: 13350,
    luxuryMaterialCost: 33050,
    minLabor: 6000,
    laborRatio: 0.30,
    scalableByArea: false,
    budgetItems: [
      { name: 'MR कॉमर्शियल प्लाई 18mm (8x4)', gradeOrBrand: 'Local ISI Ply', qty: 5, unitRate: 1450, unitLabel: 'शीट', amount: 7250 },
      { name: 'व्हाइट & ग्रे मैट माइका (0.8mm)', gradeOrBrand: 'Merino 0.8mm', qty: 5, unitRate: 850, unitLabel: 'शीट', amount: 4250 },
      { name: '12 SS हिंज + टावर बोल्ट + गॉदरेज लॉक', gradeOrBrand: 'Godrej / Dorsett', qty: 1, unitRate: 1850, unitLabel: 'सेट', amount: 1850 },
    ],
    sampleItems: [
      { name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm', gradeOrBrand: 'CenturyPly IS:710', qty: 5, unitRate: 2450, unitLabel: 'शीट', amount: 12250 },
      { name: 'डार्क वॉलनट 1mm माइका शीट्स', gradeOrBrand: 'Greenlam 1mm', qty: 5, unitRate: 1650, unitLabel: 'शीट', amount: 8250 },
      { name: 'सॉफ्ट-क्लोज़ हिंज, ड्रॉअर चैनल & गॉदरेज लॉक', gradeOrBrand: 'Ebco + Godrej', qty: 1, unitRate: 3800, unitLabel: 'सेट', amount: 3800 },
    ],
    luxuryItems: [
      { name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm', gradeOrBrand: 'CenturyPly Sainik', qty: 5, unitRate: 2450, unitLabel: 'शीट', amount: 12250 },
      { name: 'टिन्टेड फ्लूटेड ग्लास + एल्युमीनियम शटर प्रोफाइल', gradeOrBrand: 'Saint-Gobain & Alu', qty: 4, unitRate: 3500, unitLabel: 'पैनल', amount: 14000 },
      { name: 'हेटिक स्लाइडिंग डोर चैनल + सेंसर LED स्ट्रिप', gradeOrBrand: 'Hettich & Syska LED', qty: 1, unitRate: 6800, unitLabel: 'किट', amount: 6800 },
    ],
  },
  tv_unit_living: {
    tradeCategory: 'carpenter',
    titleHi: 'टीवी यूनिट / लिविंग फर्नीचर डिज़ाइन',
    dimensions: '7×6 फीट वॉल यूनिट / सेट',
    duration: '3 से 4 कार्य दिवस',
    baseSceneEn: 'contemporary Indian living room focal wall featuring fluted wooden louvers, marble-look UV sheet backdrop, floating storage drawers and warm recessed LED strips',
    defaultMaterialCost: 15800,
    budgetMaterialCost: 8000,
    luxuryMaterialCost: 26500,
    minLabor: 3500,
    laborRatio: 0.30,
    scalableByArea: false,
    budgetItems: [
      { name: '18mm कॉमर्शियल प्लाई + बेसिक PVC शीट', gradeOrBrand: 'Greenply MR', qty: 4, unitRate: 1450, unitLabel: 'शीट', amount: 5800 },
      { name: 'सॉफ्ट-क्लोज़ ड्रॉअर चैनल + केबल मैनेजर', gradeOrBrand: 'Ebco Hardware', qty: 1, unitRate: 2200, unitLabel: 'सेट', amount: 2200 },
    ],
    sampleItems: [
      { name: '18mm BWR प्लाई + वुडन WPC फ्लूटेड पैनल', gradeOrBrand: 'Century + E3 WPC', qty: 1, unitRate: 10800, unitLabel: 'पैनल लॉट', amount: 10800 },
      { name: 'मैट माइका + एल्युमीनियम LED प्रोफाइल & चैनल', gradeOrBrand: 'Greenlam + Ebco', qty: 1, unitRate: 5000, unitLabel: 'फिनिश सेट', amount: 5000 },
    ],
    luxuryItems: [
      { name: 'मार्बल UV शीट + मेटैलिक गोल्ड चारकोल पैनल', gradeOrBrand: 'Euro Pratik / Merino', qty: 4, unitRate: 3600, unitLabel: 'शीट', amount: 14400 },
      { name: 'स्यूड पैनलिंग + स्मार्ट कोव LED व हेटिक चैनल', gradeOrBrand: 'DDecor + Hettich', qty: 1, unitRate: 12100, unitLabel: 'सेट', amount: 12100 },
    ],
  },
  door_window: {
    tradeCategory: 'carpenter',
    titleHi: 'दरवाजा / चौखट कस्टम मॉडल',
    dimensions: '7×3.5 फीट मानक फ्रेम',
    duration: '1 से 2 कार्य दिवस',
    baseSceneEn: 'solid handcrafted Indian teakwood paneled main door with architectural door frame, satin brass pull handle and crisp natural varnish',
    defaultMaterialCost: 12100,
    budgetMaterialCost: 5750,
    luxuryMaterialCost: 22500,
    minLabor: 2200,
    laborRatio: 0.28,
    scalableByArea: false,
    budgetItems: [
      { name: 'पाइनवुड फ्लश डोर ब्लैंक + GI चौखट', gradeOrBrand: 'Century / ISI Flush', qty: 2, unitRate: 2400, unitLabel: 'सेट', amount: 4800 },
      { name: 'SS 5-इंच बॉल-बेयरिंग कब्जे + लैच', gradeOrBrand: 'Link / Ebco', qty: 1, unitRate: 950, unitLabel: 'सेट', amount: 950 },
    ],
    sampleItems: [
      { name: 'WPC दीमक-प्रूफ चौखट + 1mm टीक माइका डोर पल्ला', gradeOrBrand: 'E3 WPC + Greenlam', qty: 2, unitRate: 4600, unitLabel: 'सेट', amount: 9200 },
      { name: 'गॉदरेज हैवी मॉर्टाइस लॉक + SS बॉल-बेयरिंग कब्जे', gradeOrBrand: 'Godrej + Link', qty: 1, unitRate: 2900, unitLabel: 'लॉक सेट', amount: 2900 },
    ],
    luxuryItems: [
      { name: 'असली सागवान (Teak) लकड़ी पल्ला व नक्काशी फ्रेम', gradeOrBrand: 'Burma / CP Teak', qty: 2, unitRate: 9800, unitLabel: 'दरवाजा', amount: 19600 },
      { name: 'गोदरेज डिजिटल/मॉर्टाइस लॉक + टफन्ड ग्लास', gradeOrBrand: 'Godrej & Saint-Gobain', qty: 1, unitRate: 2900, unitLabel: 'लॉक सेट', amount: 2900 },
    ],
  },
  house: {
    tradeCategory: 'mason',
    titleHi: 'संपूर्ण मकान / कमरा सिविल मॉडल',
    dimensions: '1,000 sq.ft प्लॉट मानक',
    duration: '3 से 5 माह',
    baseSceneEn: 'modern 2-story Indian duplex home built on a residential plot with solid RCC concrete structure, brick-and-plaster facade, glass balcony railing and natural daylight',
    defaultMaterialCost: 485000,
    budgetMaterialCost: 345000,
    luxuryMaterialCost: 690000,
    minLabor: 150000,
    laborRatio: 0.35,
    scalableByArea: true,
    baseAreaSqFt: 1000,
    minFeasibleBudget: 95000,
    sampleItems: [
      { name: 'अल्ट्राटेक सीमेंट + टाटा टिस्कॉन Fe550D सरिया लॉट', gradeOrBrand: 'UltraTech + Tata Tiscon', qty: 1, unitRate: 245000, unitLabel: 'स्ट्रक्चर लॉट', amount: 245000 },
      { name: 'अव्वल कड़क लाल ईंटें / AAC ब्लॉक + नर्मदा रेत व गिट्टी', gradeOrBrand: 'A1 Bhatta Bricks / AAC', qty: 1, unitRate: 185000, unitLabel: 'चिनाई लॉट', amount: 185000 },
      { name: 'डॉ. फिक्सिट वाटरप्रूफिंग + प्लास्टर सामग्री', gradeOrBrand: 'Pidilite Dr. Fixit LW+', qty: 1, unitRate: 55000, unitLabel: 'पैक', amount: 55000 },
    ],
  },
  tiles_flooring: {
    tradeCategory: 'tiling',
    titleHi: 'टाइल्स / मार्बल फ्लोरिंग मॉडल',
    dimensions: '250 sq.ft कमरा मानक',
    duration: '3 से 5 कार्य दिवस',
    baseSceneEn: 'Indian room floor upgraded with mirror-finish large-format 4x2 vitrified stone tiles with laser-tight joints and neat skirting',
    defaultMaterialCost: 24820,
    budgetMaterialCost: 14820,
    luxuryMaterialCost: 55870,
    minLabor: 5500,
    laborRatio: 0.32,
    scalableByArea: true,
    baseAreaSqFt: 250,
    budgetItems: [
      { name: 'मोरबी सिरेमिक मैट फ्लोर टाइल्स (2x2 ft)', gradeOrBrand: 'Morbi Standard', qty: 250, unitRate: 42, unitLabel: 'sq.ft', amount: 10500 },
      { name: 'रोफ़ T02 केमिकल एडहेसिव + सफ़ेद ग्राउट (20kg)', gradeOrBrand: 'Pidilite Roff', qty: 8, unitRate: 540, unitLabel: 'बैग', amount: 4320 },
    ],
    sampleItems: [
      { name: 'कजारिया 4x2 ft PGVT विट्रीफाइड टाइल्स', gradeOrBrand: 'Kajaria / Somany Zero-Joint', qty: 250, unitRate: 82, unitLabel: 'sq.ft', amount: 20500 },
      { name: 'रोफ़ T02 टाइल केमिकल एडहेसिव + एपॉक्सी ग्राउट', gradeOrBrand: 'Pidilite Roff + 2mm Spacers', qty: 8, unitRate: 540, unitLabel: '20kg बैग', amount: 4320 },
    ],
    luxuryItems: [
      { name: 'इटैलियन सतवारियो / कटनी मार्बल स्लैब (कच्चा)', gradeOrBrand: 'Italian / Katni Cut', qty: 250, unitRate: 195, unitLabel: 'sq.ft', amount: 48750 },
      { name: 'लाटीक्रीट गोल्ड एडहेसिव + ग्लिटर एपॉक्सी ग्राउट', gradeOrBrand: 'MYK Laticrete', qty: 8, unitRate: 890, unitLabel: 'बैग', amount: 7120 },
    ],
  },
  false_ceiling: {
    tradeCategory: 'painter',
    titleHi: 'फॉल सीलिंग / POP / PVC डिज़ाइन',
    dimensions: '150 sq.ft कमरा सीलिंग',
    duration: '3 से 4 कार्य दिवस',
    baseSceneEn: 'modern Indian bedroom recessed gypsum false ceiling with warm yellow perimeter cove LED strip glow and recessed COB downlights',
    defaultMaterialCost: 10200,
    budgetMaterialCost: 6500,
    luxuryMaterialCost: 14800,
    minLabor: 4200,
    laborRatio: 0.36,
    scalableByArea: true,
    baseAreaSqFt: 150,
    budgetItems: [
      { name: 'साकरणी POP बैग (25kg) + मुर्गा जाली रोल', gradeOrBrand: 'Sakarni Plaster', qty: 12, unitRate: 340, unitLabel: 'बोरी', amount: 4080 },
      { name: 'GI पेरिमीटर पट्टी + बेसिक LED लाइट पैक', gradeOrBrand: 'Standard GI + LED', qty: 1, unitRate: 2420, unitLabel: 'पैक', amount: 2420 },
    ],
    sampleItems: [
      { name: 'सेंट-गोबेन जिप्रोक 12.5mm जिप्सम बोर्ड (6x4 शीट्स)', gradeOrBrand: 'Saint-Gobain Gyproc', qty: 10, unitRate: 540, unitLabel: 'शीट', amount: 5400 },
      { name: '0.55mm GI स्टील चैनल फ्रेम + कोव LED व COB लाइट किट', gradeOrBrand: 'TATA GI + Philips Warm LED', qty: 1, unitRate: 4800, unitLabel: 'कमरा पैक', amount: 4800 },
    ],
    luxuryItems: [
      { name: 'हेवी वुड-फिनिश PVC पैनल + रैफ़्टर लॉग (10ft)', gradeOrBrand: 'EuroPVC Super', qty: 20, unitRate: 320, unitLabel: 'पैनल', amount: 6400 },
      { name: 'प्रोफाइल बैक-लिट LED + जिंदल GI हैवी चैनल', gradeOrBrand: 'Philips + TATA GI', qty: 1, unitRate: 8400, unitLabel: 'लक्ज़री पैक', amount: 8400 },
    ],
  },
  bathroom: {
    tradeCategory: 'plumber',
    titleHi: 'बाथरूम रिनोवेशन कच्चा माल मॉडल',
    dimensions: '7×6 फीट बाथरूम',
    duration: '3 से 5 कार्य दिवस',
    baseSceneEn: 'modern clean Indian tiled bathroom with matte slate anti-skid tiles, concealed chrome wall mixer, rain shower and backlit vanity mirror',
    defaultMaterialCost: 17900,
    budgetMaterialCost: 8500,
    luxuryMaterialCost: 29000,
    minLabor: 4500,
    laborRatio: 0.30,
    scalableByArea: false,
    budgetItems: [
      { name: 'सुप्रीम CPVC SDR-11 पाइप बंडल + फिटिंग्स', gradeOrBrand: 'Supreme Pipes', qty: 1, unitRate: 3100, unitLabel: 'बंडल', amount: 3100 },
      { name: 'सेरा (Cera) वॉल मिक्सर, शॉवर & बेसिन सेट', gradeOrBrand: 'Cera Sanitaryware', qty: 1, unitRate: 5400, unitLabel: 'ब्रास सेट', amount: 5400 },
    ],
    sampleItems: [
      { name: 'कजारिया एंटी-स्किड टाइल्स + एस्ट्रल CPVC पाइप लॉट', gradeOrBrand: 'Kajaria + Astral SDR-11', qty: 1, unitRate: 12500, unitLabel: 'लॉट', amount: 12500 },
      { name: 'सेरा / जगुआर वॉल मिक्सर, शॉवर & बेसिन फिटिंग', gradeOrBrand: 'Cera / Jaquar Brass', qty: 1, unitRate: 5400, unitLabel: 'सेट', amount: 5400 },
    ],
    luxuryItems: [
      { name: 'कजारिया एंटी-स्किड बाथरूम टाइल्स + एस्ट्रल CPVC पैक', gradeOrBrand: 'Kajaria & Astral', qty: 1, unitRate: 12500, unitLabel: 'लॉट', amount: 12500 },
      { name: 'जगुआर कंसील्ड डाइवर्टर + LED मिरर वैनिटी सेट', gradeOrBrand: 'Jaquar / Kohler', qty: 1, unitRate: 16500, unitLabel: 'लक्ज़री सेट', amount: 16500 },
    ],
  },
  painting: {
    tradeCategory: 'painter',
    titleHi: 'पुट्टी, प्राइमर व रॉयल पेंट मॉडल',
    dimensions: '400 sq.ft दीवार क्षेत्रफल',
    duration: '3 से 4 कार्य दिवस',
    baseSceneEn: 'freshly painted modern Indian living room with smooth satin warm ivory walls and designer sage accent wall, zero patches',
    defaultMaterialCost: 6800,
    budgetMaterialCost: 3400,
    luxuryMaterialCost: 9800,
    minLabor: 4200,
    laborRatio: 0.45,
    scalableByArea: true,
    baseAreaSqFt: 400,
    budgetItems: [
      { name: 'बिरला पुट्टी (2 बैग) + ट्रैक्टर इमल्शन (10L)', gradeOrBrand: 'Birla White + Asian Paints', qty: 1, unitRate: 3400, unitLabel: 'किट (400 sq.ft)', amount: 3400 },
    ],
    sampleItems: [
      { name: '2-कोट बिरला वॉलकेयर पुट्टी + एशियन रॉयल शाइन पेंट', gradeOrBrand: 'Birla White + Asian Paints Royale', qty: 1, unitRate: 6800, unitLabel: 'किट (400 sq.ft)', amount: 6800 },
    ],
    luxuryItems: [
      { name: 'रॉयल प्ले टेक्सचर बेस + डैम्पप्रूफ केमिकल कोट', gradeOrBrand: 'Asian Paints Apex / Royale Play', qty: 1, unitRate: 9800, unitLabel: 'टेक्सचर किट', amount: 9800 },
    ],
  },
  electrical: {
    tradeCategory: 'electrician',
    titleHi: 'बिजली वायरिंग व स्मार्ट लाइटिंग मॉडल',
    dimensions: '1 कमरा (8 स्विच व लाइट पॉइंट्स)',
    duration: '2 से 3 कार्य दिवस',
    baseSceneEn: 'bright Indian room featuring modern modular glass switch panel, recessed warm COB ceiling lights and neat concealed wiring finish',
    defaultMaterialCost: 6800,
    budgetMaterialCost: 3800,
    luxuryMaterialCost: 12200,
    minLabor: 2800,
    laborRatio: 0.30,
    scalableByArea: true,
    baseAreaSqFt: 150,
    budgetItems: [
      { name: 'एंकर रोमा वायर (2 कॉइल) + मॉड्यूलर प्लेट सेट', gradeOrBrand: 'Anchor Panasonic', qty: 1, unitRate: 3800, unitLabel: 'कमरा पैक', amount: 3800 },
    ],
    sampleItems: [
      { name: 'हैवेल्स FR-LSH कॉपर वायर + लेग्रैंड मॉड्यूलर स्विच & RCCB', gradeOrBrand: 'Havells + Legrand', qty: 1, unitRate: 6800, unitLabel: 'सेफ्टी पैक', amount: 6800 },
    ],
    luxuryItems: [
      { name: 'पॉलीकैब कॉपर + स्मार्ट टच ग्लास स्विच & COB लाइट्स', gradeOrBrand: 'Polycab & Schneider', qty: 1, unitRate: 12200, unitLabel: 'स्मार्ट पैक', amount: 12200 },
    ],
  },
  iron_gate: {
    tradeCategory: 'welder',
    titleHi: 'मेन गेट / ग्रिल / स्टील रेलिंग मॉडल',
    dimensions: '10×6 फीट गेट / 20 रनिंग ft रेलिंग',
    duration: '3 से 4 कार्य दिवस',
    baseSceneEn: 'modern Indian home entrance featuring CNC laser-cut matte black MS iron main gate with warm teak WPC accent slats and brushed steel handle',
    defaultMaterialCost: 17100,
    budgetMaterialCost: 11280,
    luxuryMaterialCost: 22400,
    minLabor: 3800,
    laborRatio: 0.28,
    scalableByArea: false,
    budgetItems: [
      { name: 'टाटा MS स्क्वेयर पाइप & एंगल (16-गेज)', gradeOrBrand: 'Tata Structura MS', qty: 120, unitRate: 74, unitLabel: 'kg', amount: 8880 },
      { name: 'एशियन रेड-ऑक्साइड प्राइमर + इनेमल पेंट + कब्जे', gradeOrBrand: 'Asian Paints Apcolite', qty: 1, unitRate: 2400, unitLabel: 'सेट', amount: 2400 },
    ],
    sampleItems: [
      { name: 'CNC लेजर कट MS शीट + 14-गेज टाटा हैवी पाइप', gradeOrBrand: 'Jindal MS + 14G Square Pipe', qty: 140, unitRate: 105, unitLabel: 'kg', amount: 14700 },
      { name: 'एशियन रेड-ऑक्साइड प्राइमर + इनेमल पेंट + बेयरिंग कब्जे', gradeOrBrand: 'Asian Paints + Heavy Hinges', qty: 1, unitRate: 2400, unitLabel: 'सेट', amount: 2400 },
    ],
    luxuryItems: [
      { name: 'जिंदल 304 ग्रेड स्टेनलेस स्टील (SS) + टफन्ड ग्लास', gradeOrBrand: 'Jindal Stainless 304', qty: 70, unitRate: 255, unitLabel: 'kg', amount: 17850 },
      { name: 'बफिंग पॉलिश + ब्रश्ड फिटिंग्स व ग्लास होल्डर्स', gradeOrBrand: 'SS-304 Accessories', qty: 1, unitRate: 4550, unitLabel: 'सेट', amount: 4550 },
    ],
  },
  custom: {
    tradeCategory: 'carpenter',
    titleHi: 'कस्टम डिज़ाइन & कच्चा माल मॉडल',
    dimensions: 'कस्टम साइट नाप',
    duration: '3 से 5 कार्य दिवस',
    baseSceneEn: 'handcrafted custom Indian solid teakwood and waterproof BWP plywood home installation with clean joinery and natural polish',
    defaultMaterialCost: 10150,
    budgetMaterialCost: 6200,
    luxuryMaterialCost: 18500,
    minLabor: 3200,
    laborRatio: 0.32,
    scalableByArea: false,
    sampleItems: [
      { name: 'सेंचुरी BWP 710 मरीन प्लाई / सॉलिड लकड़ी (कच्चा माल)', gradeOrBrand: 'CenturyPly / MP Teak', qty: 3, unitRate: 2450, unitLabel: 'शीट', amount: 7350 },
      { name: '1mm टेक्सचर माइका + सॉफ्ट-क्लोज़ हार्डवेयर + LED किट', gradeOrBrand: 'Greenlam & Ebco', qty: 1, unitRate: 2800, unitLabel: 'फिनिश सेट', amount: 2800 },
    ],
  },
};

function cleanStr(v) {
  return String(v || '').trim();
}

/**
 * Sanitizes untrusted user text before injecting into LLM system/user prompts
 * to prevent prompt-injection overrides and control-character corruption.
 */
function sanitizePromptText(value = '', maxLen = 800) {
  const cleaned = String(value || '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/```+/g, ' ')
    .replace(/<\s*\/?\s*(?:USER_INPUT|SYSTEM|ASSISTANT|INSTRUCTIONS?|SCENE_CONTEXT|CONVERSATION)\s*>/gi, ' ')
    .replace(/\b(ignore\s+(?:all\s+)?(?:previous|above)\s+instructions?|system\s+prompt|act\s+as\s+system|jailbreak|override\s+rules?)\b/gi, '[filtered]')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

/**
 * Strips explicitly negated phrases (e.g. "बेड नहीं, अलमारी चाहिए", "not kitchen, wardrobe only")
 * so NLU never triggers on what the customer explicitly rejected.
 */
function stripNegatedClauses(text = '') {
  const raw = cleanStr(text);
  if (!raw) return '';
  let stripped = raw
    .replace(/(?:not\s+a?\s+|don't\s+want\s+|do\s+not\s+want\s+|without\s+|no\s+)[^,.;!?]+/gi, ' ')
    .replace(/(?:[^\s,;।]+\s+(?:का|की|के|वाला|वाली)\s+)?[^\s,;।]+\s+(?:नहीं|मत|छोड़कर|ना)(?=$|[\s,;।.!?])(?:\s*(?:चाहिए|बनाना|बनवाना|दिखाओ|करना|लगाना))?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length >= 3 ? stripped : raw;
}

/**
 * Extracts explicit Indian city/locality spoken inside chat text so regional rates adapt
 * automatically even if the user hasn't updated their GPS header yet.
 */
function extractLocalityFromText(text = '', currentLocality = 'भोपाल') {
  const q = cleanStr(text).toLowerCase();
  const cityRules = [
    { re: /\bdelhi\b|दिल्ली|नई दिल्ली/, label: 'दिल्ली NCR' },
    { re: /\bnoida\b|नोएडा/, label: 'नोएडा, दिल्ली NCR' },
    { re: /gurgaon|gurugram|गुड़गांव|गुरुग्राम/, label: 'गुरुग्राम, दिल्ली NCR' },
    { re: /faridabad|ghaziabad/, label: 'गाजियाबाद / फरीदाबाद NCR' },
    { re: /\bmumbai\b|मुंबई|navi mumbai|thane/, label: 'मुंबई, महाराष्ट्र' },
    { re: /\bpune\b|पुणे/, label: 'पुणे, महाराष्ट्र' },
    { re: /bangalore|bengaluru|बेंगलुरु/, label: 'बेंगलुरु, कर्नाटक' },
    { re: /hyderabad|हैदराबाद/, label: 'हैदराबाद, तेलंगाना' },
    { re: /kolkata|कोलकाता/, label: 'कोलकाता, पश्चिम बंगाल' },
    { re: /chennai|चेन्नई/, label: 'चेन्नई, तमिलनाडु' },
    { re: /ahmedabad|अहमदाबाद/, label: 'अहमदाबाद, गुजरात' },
    { re: /surat|सूरत/, label: 'सूरत, गुजरात' },
    { re: /chandigarh|चंडीगढ़/, label: 'चंडीगढ़' },
    { re: /kochi|कोच्चि/, label: 'कोच्चि, केरल' },
    { re: /indore|इंदौर/, label: 'इंदौर, मध्य प्रदेश' },
    { re: /jaipur|जयपुर/, label: 'जयपुर, राजस्थान' },
    { re: /lucknow|लखनऊ/, label: 'लखनऊ, उत्तर प्रदेश' },
    { re: /kanpur|कानपुर/, label: 'कानपुर, उत्तर प्रदेश' },
    { re: /nagpur|नागपुर/, label: 'नागपुर, महाराष्ट्र' },
    { re: /patna|पटना/, label: 'पटना, बिहार' },
    { re: /raipur|रायपुर/, label: 'रायपुर, छत्तीसगढ़' },
    { re: /varanasi|वाराणसी/, label: 'वाराणसी, उत्तर प्रदेश' },
    { re: /ranchi|रांची/, label: 'रांची, झारखंड' },
    { re: /jabalpur|जबलपुर/, label: 'जबलपुर, मध्य प्रदेश' },
    { re: /gwalior|ग्वालियर/, label: 'ग्वालियर, मध्य प्रदेश' },
    { re: /ujjain|उज्जैन/, label: 'उज्जैन, मध्य प्रदेश' },
    { re: /bhopal|भोपाल/, label: 'एमपी नगर, भोपाल' },
  ];
  for (const c of cityRules) {
    if (c.re.test(q)) {
      return c.label;
    }
  }
  return cleanStr(currentLocality) || 'भोपाल';
}

/**
 * Extracts explicit BHK configuration or room/wall dimensions (sq.ft or LxW ft) from text.
 */
function extractDimensionsAndBhkFromText(text = '', projectType = 'custom') {
  const q = cleanStr(text).toLowerCase();
  const cfg = RAW_PROJECT_CONFIGS[projectType] || RAW_PROJECT_CONFIGS.custom;

  const bhkMatch = q.match(/(\d)\s*bhk/i);
  if (bhkMatch) {
    const bhk = Math.max(1, Math.min(6, parseInt(bhkMatch[1], 10)));
    const bhkLabel = `${bhk} BHK फ्लैट मानक`;
    if (projectType === 'painting') {
      const sqft = bhk * 750;
      return { bhk, areaSqFt: sqft, areaMultiplier: sqft / (cfg.baseAreaSqFt || 400), summaryLabel: `${bhk}BHK (~${sqft} sq.ft दीवार)` };
    }
    if (projectType === 'tiles_flooring') {
      const sqft = bhk * 450;
      return { bhk, areaSqFt: sqft, areaMultiplier: sqft / (cfg.baseAreaSqFt || 250), summaryLabel: `${bhk}BHK फ्लोर (~${sqft} sq.ft)` };
    }
    if (projectType === 'electrical') {
      const pts = bhk * 18;
      return { bhk, areaSqFt: bhk * 350, areaMultiplier: Math.max(1.2, bhk * 1.15), summaryLabel: `${bhk}BHK (${pts}+ स्विच/लाइट पॉइंट्स)` };
    }
    if (projectType === 'false_ceiling') {
      const sqft = bhk * 320;
      return { bhk, areaSqFt: sqft, areaMultiplier: sqft / (cfg.baseAreaSqFt || 150), summaryLabel: `${bhk}BHK सीलिंग (~${sqft} sq.ft)` };
    }
    if (projectType === 'house') {
      const sqft = bhk * 550;
      return { bhk, areaSqFt: sqft, areaMultiplier: Math.max(0.6, sqft / 1000), summaryLabel: `${bhk}BHK प्लॉट (~${sqft} sq.ft)` };
    }
    return { bhk, areaSqFt: null, areaMultiplier: 1, summaryLabel: bhkLabel };
  }

  const sqftMatch = q.match(/(\d{2,5})\s*(?:sq\.?\s*ft|sqft|वर्ग\s*फुट|सक्वेयर\s*फुट)/i);
  if (sqftMatch) {
    const sqft = Math.max(20, Math.min(25000, parseInt(sqftMatch[1], 10)));
    const baseArea = cfg.baseAreaSqFt || (projectType === 'painting' ? 400 : projectType === 'tiles_flooring' ? 250 : projectType === 'house' ? 1000 : 150);
    return {
      bhk: null,
      areaSqFt: sqft,
      areaMultiplier: cfg.scalableByArea ? Math.max(0.4, Math.min(12, sqft / baseArea)) : 1,
      summaryLabel: `${sqft.toLocaleString('en-IN')} sq.ft (कस्टम नाप)`,
    };
  }

  const lwMatch = q.match(/(\d{1,3}(?:\.\d+)?)\s*[x×*]\s*(\d{1,3}(?:\.\d+)?)\s*(?:ft|feet|फीट)?/i);
  if (lwMatch) {
    const l = Math.max(2, Math.min(200, parseFloat(lwMatch[1])));
    const w = Math.max(2, Math.min(200, parseFloat(lwMatch[2])));
    const sqft = Math.round(l * w);
    const baseArea = cfg.baseAreaSqFt || (projectType === 'painting' ? 400 : projectType === 'tiles_flooring' ? 250 : projectType === 'house' ? 1000 : 150);
    // Avoid confusing tile size 4x2 or 2x2 ft with whole room area
    const looksLikeTileDimension = projectType === 'tiles_flooring' && l <= 6 && w <= 6;
    if (!looksLikeTileDimension) {
      return {
        bhk: null,
        areaSqFt: sqft,
        areaMultiplier: cfg.scalableByArea && sqft >= 36 ? Math.max(0.45, Math.min(12, sqft / baseArea)) : 1,
        summaryLabel: `${l}×${w} फीट (~${sqft} sq.ft)`,
      };
    }
  }

  return { bhk: null, areaSqFt: null, areaMultiplier: 1, summaryLabel: null };
}

/**
 * Validates and clamps client-supplied selected raw material products.
 */
function sanitizeSelectedProducts(products) {
  if (!Array.isArray(products)) return [];
  return products
    .filter((p) => p && typeof p === 'object' && p.name)
    .slice(0, 15)
    .map((p) => ({
      id: cleanStr(p.id).slice(0, 64),
      name: sanitizePromptText(p.name, 120),
      brand: sanitizePromptText(p.brand || '', 80),
      qualitySpec: sanitizePromptText(p.qualitySpec || '', 120),
      tier: ['budget', 'standard', 'luxury'].includes(p.tier) ? p.tier : 'standard',
      price: Math.max(0, Math.min(10000000, Number(p.price) || 0)),
      unit: sanitizePromptText(p.unit || 'यूनिट', 40),
      approxQtyMultiplier: Math.max(1, Math.min(10000, Number(p.approxQtyMultiplier) || 1)),
      supplierName: sanitizePromptText(p.supplierName || '', 100),
      visualDescriptor: sanitizePromptText(p.visualDescriptor || p.name, 220),
    }));
}

function getRegionalRateProfileBackend(locality = 'भोपाल') {
  const loc = cleanStr(locality).toLowerCase();
  const cleanArea = cleanStr(locality || 'भोपाल').split('•')[0].trim();

  if (/delhi|नoida|नोएडा|noida|gurgaon|gurugram|गुड़गांव|गुरुग्राम|faridabad|ghaziabad|ncr|दिल्ली/.test(loc)) {
    return {
      laborMultiplier: 1.25,
      dailyMasterRate: 1100,
      deliveryNote: 'दिल्ली NCR थोक मंडी मानक से 3-4 घंटे में साइट डिलीवरी',
      defaultStore: 'दिल्ली NCR थोक टिंबर & हार्डवेयर हब (सप्लायर मानक)',
    };
  }
  if (/mumbai|मुंबई|navi mumbai|thane|pune|पुणे|bangalore|bengaluru|बेंगलुरु|hyderabad|हैदराबाद/.test(loc)) {
    return {
      laborMultiplier: 1.30,
      dailyMasterRate: 1150,
      deliveryNote: `${cleanArea} लोकल सप्लायर हब से उसी दिन साइट डिलीवरी`,
      defaultStore: `${cleanArea} लोकल बिल्डिंग मटेरियल हब`,
    };
  }
  if (/kolkata|कोलकाता|chennai|चेन्नई|ahmedabad|अहमदाबाद|surat|सूरत|kochi|कोच्चि|chandigarh|चंडीगढ़/.test(loc)) {
    return {
      laborMultiplier: 1.15,
      dailyMasterRate: 1020,
      deliveryNote: `${cleanArea} शहर मंडी से 2-4 घंटे में साइट डिलीवरी`,
      defaultStore: `${cleanArea} होलसेल टिंबर & हार्डवेयर मंडी`,
    };
  }
  if (/indore|इंदौर|jaipur|जयपुर|lucknow|लखनऊ|kanpur|कानपुर|nagpur|नागपुर|patna|पटना|raipur|रायपुर|varanasi|वाराणसी|ranchi|रांची|jabalpur|जबलपुर|gwalior|ग्वालियर|ujjain|उज्जैन/.test(loc)) {
    return {
      laborMultiplier: 1.05,
      dailyMasterRate: 950,
      deliveryNote: `${cleanArea} थोक मंडी से 2-4 घंटे में डिलीवरी`,
      defaultStore: `${cleanArea} मेन टिंबर & हार्डवेयर मंडी`,
    };
  }
  return {
    laborMultiplier: 1.0,
    dailyMasterRate: 900,
    deliveryNote: `${cleanArea} में नजदीकी सप्लायर से 2-3 घंटे में डिलीवरी`,
    defaultStore: `${cleanArea} स्थानीय सप्लायर मंडी मानक`,
  };
}

function isRepairIntentText(text = '') {
  const q = cleanStr(text).toLowerCase();
  if (!q) return false;
  // Critical safety hazard ALWAYS routes directly to emergency repair guidance
  if (/spark|चिंगारी|शॉर्ट सर्किट|short circuit|करंट आ रहा|करंट लग|धुआं|जलने की बदबू/.test(q)) {
    return true;
  }
  const explicitDesignOrBuild = /डिज़ाइन|डिजाइन|मॉडल|बेड बनवा|बेड बना|किचन बनवा|किचन बना|अलमारी बना|अलमारी बनवा|मकान बना|मकान बनवा|प्लॉट|लेंटर|फॉल सीलिंग लग|मंदिर बनवा|काउंटर बनवा|quote|quotation|कोटेशन|कोटिशन|cotion/.test(q);
  const repairCue = /tapak|टपक|leak|लीक|seelan|सीलन|choke|जाम|toot|टूट|खराब|मरम्मत|repair|fix|स्पिंडल|वॉशर|fuse|फ्यूज|mcb ट्रिप|ac cooling|ac ठंड|कूलिंग नहीं|काम नहीं कर रहा|आवाज़ कर रहा|आवाज कर रहा|पानी नहीं चढ़ा|बंद नहीं होता|सीवर|चटक/.test(q);
  if (repairCue && !explicitDesignOrBuild) return true;
  return false;
}

/**
 * Resolves follow-up clicks to clarification questions cleanly even in offline deterministic fallback.
 */
function resolveClarificationFollowup(latestMsg = '', priorAssistantMsg = '') {
  const q = cleanStr(latestMsg).toLowerCase();
  const prev = cleanStr(priorAssistantMsg).toLowerCase();
  const wasWaterClarification = /नल से टपक रहा|दीवार से रिस रहा|फर्श\/नाली पर जमा|कहाँ से आ रहा|स्रोत स्पष्ट नहीं/.test(prev);
  if (!wasWaterClarification) return null;

  if (/दीवार|सीलन|wall|seepage/.test(q)) {
    return {
      tradeCategory: 'plumber',
      projectType: 'bathroom',
      replyText: 'समझ गया! दीवार से पानी रिसने का कारण कंसील्ड पाइप लीकेज या बाथरूम टाइल ग्राउट गैप हो सकता है। नीचे तुरंत जांच व प्लंबर अनुमान देखें:',
      items: [
        { name: 'डॉ. फिक्सिट ग्राउट सीलर + प्रेशर चेक किट', qtyRate: '1 पैक', amount: 350, isLabor: false },
        { name: 'प्लंबर कंसील्ड लीकेज जांच चार्ज', qtyRate: '1 विजिट', amount: 300, isLabor: true },
      ],
    };
  }
  if (/फर्श|नाली|floor|drain/.test(q)) {
    return {
      tradeCategory: 'plumber',
      projectType: 'bathroom',
      replyText: 'समझ गया! फर्श या नाली पर पानी जमा होना ट्रैप ब्लॉकेज या ढलान समस्या से होता है। नीचे ड्रेनेज क्लीनिंग अनुमान देखें:',
      items: [
        { name: 'ड्रेन क्लीनर केमिकल + जाली पैक', qtyRate: '1 सेट', amount: 180, isLabor: false },
        { name: 'प्लंबर ड्रेन अनब्लॉक चार्ज', qtyRate: '1 जॉब', amount: 320, isLabor: true },
      ],
    };
  }
  if (/नल|टपक|tap/.test(q)) {
    return {
      tradeCategory: 'plumber',
      projectType: 'bathroom',
      replyText: 'समझ गया! नल टपकने पर पूरा नल बदलने की जरूरत नहीं — केवल ब्रास स्पिंडल/वॉशर बदलने से ठीक हो जाता है:',
      items: [
        { name: '1/2 इंच ब्रास सेरामिक स्पिंडल / वॉशर', qtyRate: '1 सेट', amount: 120, isLabor: false },
        { name: 'प्लंबर नल रिपेयर चार्ज', qtyRate: '1 जॉब', amount: 200, isLabor: true },
      ],
    };
  }
  return null;
}

/**
 * Detects underspecified / vague messages where SETU should ask 1 short clarifying question
 * rather than guessing an arbitrary construction item.
 */
function isUnderspecifiedQuery(text = '', activeProjectType = '', hasImage = false) {
  if (hasImage || activeProjectType) return false;
  const q = cleanStr(text).toLowerCase();
  if (!q || q.length < 2) return false;
  if (/^(hi+|hello|hey|ok+|okay|ji|haan|yes|no|nahi|namaste|नमस्ते|हाय|हेलो|जी|हां|ठीक है|help|मदद|सहायता|क्या हाल|kaise ho|कैसे हो|good morning|good evening|test|rate\??|price\??|rates?\??|cost\??|काम करवाना है|काम है|कुछ बनवाना है|घर का काम|कुछ बताओ|करीगर चाहिए|कारीगर चाहिए|मिस्त्री चाहिए|ठेकेदार चाहिए)[!?.।\s]*$/i.test(q)) {
    return true;
  }
  const ambiguousWater =
    /(pani aa raha|पानी आ रहा|water coming|pani gir raha|पानी गिर रहा)/i.test(q) &&
    !/(nal|नल|tap|tapak|टपक|deewar|दीवार|wall|floor|फर्श|naali|नाली|geyser|गीजर|chhat|छत)/i.test(q) &&
    /(bathroom|बाथरूम|washroom|टॉयलेट|कमरे|room)/i.test(q);
  return ambiguousWater;
}

/**
 * Detects custom sub-topic inside 'custom' so switching Mandir -> Shop Counter invalidates stale raw materials.
 */
function detectCustomSubTopic(text = '') {
  const q = cleanStr(text).toLowerCase();
  if (/पूजा घर|pooja ghar|puja ghar|pooja room|मंदिर|mandir|temple|mandap/.test(q)) return 'mandir';
  if (/काउंटर|counter|दुकान|dukan|dukaan|shop|showroom|कैफे|cafe|reception desk|bar counter/.test(q)) return 'counter';
  if (/ड्रेसिंग|dressing|शीशा|shisha|seesa|mirror unit|vanity/.test(q)) return 'dressing';
  if (/झूला|झुला|jhoola|jhula|jula|swing/.test(q)) return 'jhoola';
  if (/ऑफिस|office|केबिन|cabin|स्टडी|study|पार्टीशन|partition|बुकशेल्फ|bookshelf|crockery|shoe rack|shoe stand/.test(q)) return 'office';
  return 'other';
}

/**
 * Detects secondary craft requests when a customer asks for multiple items at once
 * (e.g. "बेड भी बनवाना है और अलमारी भी" or "नल ठीक कराना है और पेंट भी").
 */
function detectSecondaryIntents(text = '', primaryType = 'custom') {
  const q = stripNegatedClauses(text).toLowerCase();
  const candidates = [
    { key: 'bed', label: 'बेड निर्माण', re: /बेड|पलंग|पलँग|तखत|bed\b|double bed|cot\b|takhat|palang/ },
    { key: 'wardrobe', label: 'अलमारी / वॉर्डरोब', re: /अलमारी|वॉर्डरोब|wardrobe|almirah|almari|almera|almira/ },
    { key: 'kitchen', label: 'मॉड्यूलर किचन', re: /किचन|रसोई|kitchen/ },
    { key: 'door_window', label: 'दरवाजा / खिड़की', re: /दरवाजा|दरवाज़ा|चौखट|खिड़की|door\b|window|darwaza|chowkhat/ },
    { key: 'iron_gate', label: 'लोहे का गेट / ग्रिल', re: /गेट|ग्रिल|रेलिंग|gate\b|grill|railing/ },
    { key: 'false_ceiling', label: 'फॉल सीलिंग / POP', re: /फॉल सीलिंग|सीलिंग|पीओपी|ceiling|pop\b/ },
    { key: 'tiles_flooring', label: 'टाइल्स / फ्लोरिंग', re: /टाइल्स|टाइल|मार्बल|फ्लोरिंग|tile|marble|flooring/ },
    { key: 'painting', label: 'पुट्टी / पेंटिंग', re: /पेंट|पुट्टी|paint|putty|पॉलिश/ },
    { key: 'electrical', label: 'बिजली / AC वायरिंग', re: /बिजली|वायरिंग|स्विच|wiring|electric|\bac\b/ },
    { key: 'bathroom', label: 'बाथरूम / नल प्लंबिंग', re: /बाथरूम|नल|टपक|प्लंब|bathroom|plumb|tap\b/ },
  ];
  return candidates
    .filter((c) => c.key !== primaryType && c.re.test(q))
    .map((c) => c.label);
}

function detectProjectTypeBackend(text = '', aiProjectType = '', activeProjectType = '') {
  const cleanedIntent = stripNegatedClauses(text);
  const textLower = cleanStr(cleanedIntent).toLowerCase();
  const validKeys = Object.keys(RAW_PROJECT_CONFIGS);

  // 0. Painting/Polishing OVER an existing door/bed/wall should go to painting, not build new door/bed!
  if (/(पेंट|पुट्टी|पॉलिश|वाटरप्रूफ|रंगना|paint|putty|polish|repaint)/i.test(textLower) && !/(नया बेड|नया दरवाजा|नया किचन|नई अलमारी|build|banwana|बनवाना)/i.test(textLower)) {
    return 'painting';
  }

  // 1. Bespoke Pooja Mandir / Dressing Table / Counter checked BEFORE generic 'घर' (house) or 'टेबल' (tv_unit_living)!
  if (/पूजा घर|पूजा रूम|पूजा कक्ष|pooja ghar|puja ghar|pooja room|mandir|मंदिर|temple|mandap/.test(textLower)) {
    return 'custom';
  }
  if (/ड्रेसिंग टेबल|dressing table|ड्रेसिंग यूनिट|dressing unit/.test(textLower)) {
    return 'custom';
  }
  if (/ऑफिस केबिन|ऑफिस डेस्क|स्टडी टेबल|study table|office cabin|reception counter|शॉप काउंटर|दुकान काउंटर/.test(textLower)) {
    return 'custom';
  }

  // 2. Specific furniture & bespoke objects ALWAYS take priority before generic room names!
  if (/बेड(?=$|[\s,।.!?])|डबल बेड|सिंगल बेड|पलंग|पलँग|तखत|दीवान|खटिया|\bbed\b|double bed|king bed|queen bed|hydraulic bed|\bcot\b|palangh?|takhat/.test(textLower)) {
    return 'bed';
  }
  if (/अलमारी|वॉर्डरोब|wardrobe|almirah|almari|almera|almira|cupboard|closet/.test(textLower)) {
    return 'wardrobe';
  }
  if (/किचन|रसोई|rasoi|kitchen/.test(textLower)) {
    return 'kitchen';
  }
  if (/दरवाजा|दरवाज़ा|चौखट|खिड़की|पल्ला|\bdoor\b|window|chaukhat|chowkhat|darwa?za|khidaki|khidki/.test(textLower)) {
    return 'door_window';
  }
  if (/गेट|ग्रिल|रेलिंग|टीन शेड|शेड|शटर|लोहा|वेल्ड|\bgate\b|grill|railing|shed|steel|iron|fabrication/.test(textLower)) {
    return 'iron_gate';
  }
  if (/फॉल सीलिंग|सीलिंग|पीओपी|जिप्सम|ceiling|\bpop\b|gypsum|pvc पैनल/.test(textLower)) {
    return 'false_ceiling';
  }
  if (/टाइल्स|टाइल|मार्बल|ग्रेनाइट|फ्लोरिंग|फर्श|tile|marble|granite|flooring|farsh/.test(textLower)) {
    return 'tiles_flooring';
  }
  // Specific trades checked BEFORE generic "living room" / "house"
  if (/पेंट|पुट्टी|रंग|सफेदी|वाटरप्रूफ|पॉलिश|paint|putty|waterproof/.test(textLower)) {
    return 'painting';
  }
  if (/बिजली|वायरिंग|स्विच|पंखा|झूमर|लाइट|\bac\b|एसी |cooling|कंप्रेसर|wiring|electric|light|mcb|inverter/.test(textLower)) {
    return 'electrical';
  }
  if (/बाथरूम|टॉयलेट|वॉशरूम|नहाने|नल|प्लंब|गीजर|bathroom|washroom|toilet|plumb|geyser/.test(textLower)) {
    return 'bathroom';
  }
  if (/टीवी|सोफा|डाइनिंग|टेबल|मेज|कुर्सी|tv unit|sofa|dining|crockery|living room|लिविंग रूम/.test(textLower)) {
    return 'tv_unit_living';
  }
  if (/घर|मकान|कमरा बनाना|दीवार बनाना|छत बनाना|छत टपक|प्लॉट|लेंटर|नींव|चिनाई|डुप्लेक्स|house|home|makan|plot|duplex|masonry/.test(textLower)) {
    return 'house';
  }

  // 3. Other bespoke custom works not in standard presets (Counter, Jhoola, Office Partition, Dressing, Bookshelf...)
  if (/काउंटर|counter|दुकान|dukaan?|shop|केबिन|cabin|ऑफिस|office|पार्टीशन|partition|झूला|झुला|jhoola|jhula|jula|swing|पर्गोला|pergola|गज़ीबो|gazebo|बुकशेल्फ|bookshelf|shoe rack|shoe stand|ड्रेसिंग|dressing/.test(textLower)) {
    return 'custom';
  }

  const normalizedAiType = cleanStr(aiProjectType).toLowerCase();
  if (validKeys.includes(normalizedAiType) && normalizedAiType !== 'custom') {
    return normalizedAiType;
  }
  if (normalizedAiType === 'custom' && /नया|नई|बनवाना|बनाना|bnana|bnvana|design|डिज़ाइन/.test(textLower)) {
    return 'custom';
  }
  if (activeProjectType && validKeys.includes(activeProjectType)) {
    return activeProjectType;
  }
  return 'custom';
}

function buildCustomPromptDescriptor(userText = '') {
  const q = cleanStr(userText).toLowerCase();
  if (/पूजा घर|pooja|mandir|मंदिर|temple|mandap/.test(q)) {
    return 'traditional handcrafted carved Indian wooden Pooja Mandir temple unit with warm backlit lattice jaali, bells and storage drawers';
  }
  if (/काउंटर|counter|दुकान|dukan|dukaan|shop|showroom|कैफे|cafe/.test(q)) {
    return 'modern commercial retail shop reception counter built with walnut laminated wood paneling, white marble counter top and warm recessed strip LED';
  }
  if (/ऑफिस|office|केबिन|cabin|पार्टीशन|partition|स्टडी|study/.test(q)) {
    return 'modern modular wood and toughened glass office cabin workstation with warm ceiling lights and neat cable management';
  }
  if (/ड्रेसिंग|dressing|शीशा|shisha|mirror/.test(q)) {
    return 'handcrafted full-height wooden dressing unit with backlit oval vanity mirror, concealed storage shelves and velvet stool';
  }
  if (/झूला|झुला|jhoola|jhula|jula|swing/.test(q)) {
    return 'handcrafted seasoned teakwood indoor swing jhoola suspended with antique solid brass chains and plush cushions';
  }
  if (/बुक|bookshelf|शू|shoe|रैक|rack/.test(q)) {
    return 'built-in modern wooden storage rack with clean laminate shutters and open display niches';
  }
  return 'custom handcrafted Indian interior wooden and modern material installation tailored neatly into the space';
}

function isQuotationDemandBackend(text = '', quoteRequested = false) {
  if (quoteRequested === true) return true;
  const q = cleanStr(text).toLowerCase();
  return /कोटेशन|कोटिशन|cotion|quotation|\bquote\b|ab rate|रेट दो|रेट बताओ|खर्चा बता|खर्च कितना|कितना खर्च|कितना लगेगा|कितने में बने|kitna kharcha|kitna paisa|kitna lagega|kitne me|how much will|total cost|cost breakdown|price estimate|budget bana|फाइनल रेट|पक्का बिल|3-टाइप|3 type|without maal|बिना माल|केवल कारीगर|सिर्फ माल|only karigar|only material|maal with karigar/.test(q);
}

/**
 * Parses budget ONLY from explicit monetary expressions and prioritizes LATEST user chat turn
 * over stale drawer budgets, ignoring PIN codes (e.g. 462011) and LxW dimensions.
 */
function parseBudgetFromText(text = '', explicitBudget = 0, fallbackHistoryTexts = []) {
  const wordNumMap = {
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'ग्यारह': 11, 'बारह': 12, 'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
    'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
  };

  const extractSingle = (candidateText) => {
    const clean = cleanStr(candidateText).replace(/,/g, '');
    if (!clean) return null;

    if (/(?:बजट|budget|rs|₹)\s*[:=]?\s*-\d+/i.test(clean)) return null;

    // Fractional & colloquial Indian monetary units
    if (/डेढ़\s*(?:लाख|lakh|lac)/i.test(clean)) return 150000;
    if (/सवा\s*(?:लाख|lakh|lac)/i.test(clean)) return 125000;
    if (/ढाई\s*(?:लाख|lakh|lac)/i.test(clean)) return 250000;
    if (/आधा\s*(?:लाख|lakh|lac)/i.test(clean)) return 50000;
    if (/पौने\s*दो\s*(?:लाख|lakh|lac)/i.test(clean)) return 175000;
    if (/डेढ़\s*(?:हजार|hajar)/i.test(clean)) return 1500;

    // Hindi word multipliers ("पचास हजार", "दो लाख")
    for (const [w, n] of Object.entries(wordNumMap)) {
      if (new RegExp(`${w}\\s*(?:लाख|lakh|lac)`, 'i').test(clean)) {
        const val = n * 100000;
        if (val >= 1000 && val <= 50000000) return val;
      }
      if (new RegExp(`${w}\\s*(?:हजार|हज़ार|hajar)`, 'i').test(clean)) {
        const val = n * 1000;
        if (val >= 500 && val <= 50000000) return val;
      }
    }

    const crMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:करोड़|crore|cr\b)/i);
    if (crMatch) {
      const val = Math.round(parseFloat(crMatch[1]) * 10000000);
      if (val >= 100000 && val <= 50000000) return val;
    }

    const lakhMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac)/i);
    if (lakhMatch) {
      const val = Math.round(parseFloat(lakhMatch[1]) * 100000);
      if (val >= 1000 && val <= 50000000) return val;
    }

    const kMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:हजार|हज़ार|hajar|k\b)/i);
    if (kMatch) {
      const val = Math.round(parseFloat(kMatch[1]) * 1000);
      if (val >= 500 && val <= 50000000) return val;
    }

    const contextualMatch = clean.match(/(?:बजट|budget|under|अंदर|तक|के अंदर|rupaye|रुपये|रुपए|rs\.?|₹)\s*[:=]?\s*(\d{4,7})\b/i)
      || clean.match(/\b(\d{4,7})\s*(?:रुपये|रुपए|rs\.?|rupees?|तक का बजट|का बजट|budget)/i);
    if (contextualMatch) {
      const val = Number(contextualMatch[1]);
      if (val >= 1000 && val <= 50000000) return val;
    }
    return null;
  };

  // Priority 1: Latest explicit chat budget overrides stale UI drawer preset!
  const latestMatch = extractSingle(text);
  if (latestMatch) return latestMatch;

  // Priority 2: Explicit preset / budget from client UI state
  const explicitVal = Number(explicitBudget);
  if (Number.isFinite(explicitVal) && explicitVal >= 500 && explicitVal <= 50000000) {
    return Math.round(explicitVal);
  }

  // Priority 3: Scan prior turns newest-first
  if (Array.isArray(fallbackHistoryTexts)) {
    for (let i = fallbackHistoryTexts.length - 1; i >= 0; i--) {
      const histVal = extractSingle(fallbackHistoryTexts[i]);
      if (histVal) return histVal;
    }
  }
  return null;
}

/**
 * Reconciles AI-generated quotation totals so arithmetic always matches BOM + labor
 * while preserving gradeOrBrand and supplierStore fields cleanly.
 */
function reconcileQuotationTotals(aiQuotation) {
  if (!aiQuotation || typeof aiQuotation !== 'object') return null;
  const safeItems = Array.isArray(aiQuotation.items)
    ? aiQuotation.items.slice(0, 15).map((it) => ({
        name: sanitizePromptText(it?.name || 'सामग्री', 120),
        gradeOrBrand: sanitizePromptText(it?.gradeOrBrand || '', 80) || undefined,
        qtyRate: sanitizePromptText(it?.qtyRate || 'मानक मात्रा', 80),
        supplierStore: sanitizePromptText(it?.supplierStore || '', 90) || undefined,
        amount: Math.max(0, Math.round(Number(it?.amount) || 0)),
      }))
    : [];
  const computedMaterial = safeItems.reduce((sum, x) => sum + x.amount, 0);
  const materialTotal = computedMaterial > 0 ? computedMaterial : Math.max(0, Math.round(Number(aiQuotation.materialTotal) || 0));
  const laborTotal = Math.max(0, Math.round(Number(aiQuotation.laborTotal) || 0));
  const grandTotal = materialTotal + laborTotal;
  return {
    ...aiQuotation,
    items: safeItems,
    materialTotal,
    laborTotal,
    grandTotal,
  };
}

function buildBackendThreeWayQuotation({
  projectType,
  projectTitle,
  dimensionsSummary,
  estimatedDuration,
  locality = 'भोपाल',
  customerBudget = null,
  selectedProducts = [],
  aiQuotation = null,
  aiThreeWay = null,
  areaScale = 1,
}) {
  const cfg = RAW_PROJECT_CONFIGS[projectType] || RAW_PROJECT_CONFIGS.custom;
  const region = getRegionalRateProfileBackend(locality);
  const cleanArea = cleanStr(locality || 'भोपाल').split('•')[0].trim();
  const safeScale = cfg.scalableByArea && Number.isFinite(Number(areaScale)) && Number(areaScale) > 0
    ? Math.max(0.4, Math.min(10, Number(areaScale)))
    : 1;

  // Build itemized Raw Material BOM
  let rawItems = [];
  if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
    rawItems = selectedProducts.map((p) => {
      const qty = Math.max(1, Number(p.approxQtyMultiplier) || 1);
      const unitPrice = Math.max(0, Number(p.price) || 0);
      return {
        name: p.name,
        gradeOrBrand: p.qualitySpec || p.brand || 'मानक ग्रेड',
        qtyRate: `${qty} × ${p.unit || 'यूनिट'} @ ₹${unitPrice.toLocaleString('en-IN')}`,
        supplierStore: p.supplierName || region.defaultStore,
        amount: Math.round(unitPrice * qty),
      };
    });
  } else if (aiThreeWay?.materialAndKarigar?.items?.length > 0) {
    rawItems = aiThreeWay.materialAndKarigar.items.slice(0, 15).map((it) => ({
      name: sanitizePromptText(it.name || 'सामग्री', 120),
      gradeOrBrand: sanitizePromptText(it.gradeOrBrand || 'सत्यापित मानक ग्रेड', 80),
      qtyRate: sanitizePromptText(it.qtyRate || 'अनुमानित मात्रा', 80),
      supplierStore: sanitizePromptText(it.supplierStore || region.defaultStore, 90),
      amount: Math.max(0, Math.round(Number(it.amount) || 0)),
    }));
  } else if (aiQuotation?.items?.length > 0 && safeScale === 1) {
    rawItems = aiQuotation.items.slice(0, 15).map((it) => ({
      name: sanitizePromptText(it.name || 'सामग्री', 120),
      gradeOrBrand: it.gradeOrBrand || 'सप्लायर मानक ग्रेड',
      qtyRate: sanitizePromptText(it.qtyRate || 'अनुमानित मात्रा', 80),
      supplierStore: it.supplierStore || region.defaultStore,
      amount: Math.max(0, Math.round(Number(it.amount) || 0)),
    }));
  } else {
    // Select tier cleanly matching customer budget instead of breaking qty*rate math!
    let chosenList = cfg.sampleItems;
    if (customerBudget && customerBudget > 0) {
      const estDefault = (cfg.defaultMaterialCost + cfg.minLabor) * safeScale;
      const estLuxury = ((cfg.luxuryMaterialCost || cfg.defaultMaterialCost * 1.4) + cfg.minLabor) * safeScale;
      if (customerBudget < estDefault * 0.95 && Array.isArray(cfg.budgetItems)) {
        chosenList = cfg.budgetItems;
      } else if (customerBudget >= estLuxury * 0.95 && Array.isArray(cfg.luxuryItems)) {
        chosenList = cfg.luxuryItems;
      }
    }

    rawItems = chosenList.map((it) => {
      const scaledQty = Math.max(1, Math.round((it.qty || 1) * safeScale));
      const unitRate = Math.max(1, Number(it.unitRate || it.amount) || 1);
      const exactAmount = Math.round(scaledQty * unitRate);
      return {
        name: it.name,
        gradeOrBrand: it.gradeOrBrand,
        qtyRate: `${scaledQty} × ${it.unitLabel || 'यूनिट'} @ ₹${unitRate.toLocaleString('en-IN')}`,
        supplierStore: region.defaultStore,
        amount: exactAmount,
      };
    });
  }

  const materialTotal = rawItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  const baseMinLaborScaled = Math.round(cfg.minLabor * safeScale);
  const aiLabor = Number(aiThreeWay?.onlyKarigar?.laborTotal || aiQuotation?.laborTotal || 0);
  const defaultRegionalLabor = Math.max(
    Math.round(baseMinLaborScaled * region.laborMultiplier),
    Math.round(materialTotal * cfg.laborRatio)
  );
  // Avoid double regional inflation if Gemini already priced labor according to locality!
  const laborTotal = aiLabor > 0
    ? Math.max(Math.round(baseMinLaborScaled * region.laborMultiplier * 0.75), Math.round(aiLabor))
    : defaultRegionalLabor;
  const grandTotal = materialTotal + laborTotal;
  const dur = estimatedDuration || cfg.duration;

  let budgetFitNote = `📍 ${cleanArea} क्षेत्र के ताजा होलसेल कच्चा माल व कारीगर दरों पर आधारित कोटेशन (नोट: थोक मंडी रेट में GST व स्थानीय ट्रांसपोर्ट भाड़ा अलग से लागू हो सकता है)।`;
  let isWithinBudget = null;
  let suggestedTierUpgradeOrSave = null;

  if (customerBudget && customerBudget > 0) {
    if (cfg.minFeasibleBudget && customerBudget < cfg.minFeasibleBudget * 0.4) {
      isWithinBudget = false;
      budgetFitNote = `⚠️ स्पष्ट सलाह: ₹${customerBudget.toLocaleString('en-IN')} बजट में संपूर्ण ${cfg.titleHi} संभव नहीं है — इस बजट में आप केवल नींव/1 कमरा/रिपेयर या शुरुआती चरण करवा सकते हैं।`;
      suggestedTierUpgradeOrSave = '💡 सही योजना के लिए काम को चरणों में बाँटें या केवल कारीगर विकल्प चुनें।';
    } else if (grandTotal <= customerBudget) {
      isWithinBudget = true;
      const saved = customerBudget - grandTotal;
      budgetFitNote = `✅ बढ़िया! यह पैकेज आपके ₹${customerBudget.toLocaleString('en-IN')} बजट में आसानी से फिट है (~₹${saved.toLocaleString('en-IN')} बचत)।`;
    } else if (laborTotal <= customerBudget) {
      isWithinBudget = false;
      const diff = grandTotal - customerBudget;
      budgetFitNote = `⚠️ फुल पैकेज आपके ₹${customerBudget.toLocaleString('en-IN')} बजट से ₹${diff.toLocaleString('en-IN')} ऊपर है — नीचे "किफ़ायती रेंज" चुनें या केवल कारीगर / केवल माल विकल्प देखें।`;
      suggestedTierUpgradeOrSave = '💡 किफ़ायती कच्चा माल चुनकर यह पूरा काम आपके बजट में आ जाएगा!';
    } else {
      isWithinBudget = false;
      budgetFitNote = `💡 ₹${customerBudget.toLocaleString('en-IN')} बजट के लिए हमने सबसे किफ़ायती कच्चा माल व केवल कारीगर विकल्प तैयार किया है।`;
    }
  }

  return {
    includeQuotation: true,
    projectTitle: projectTitle || cfg.titleHi,
    projectType,
    locality,
    dimensionsSummary: dimensionsSummary || cfg.dimensions,
    estimatedDuration: dur,
    customerBudget: customerBudget || null,
    onlyKarigar: {
      title: '1. बिना माल — केवल कारीगर',
      subtitle: 'कच्चा माल आप खुद देंगे • SETU से सिर्फ अनुभवी कारीगर आएगा',
      laborTotal,
      estimatedDays: dur,
      breakdown: [
        `मुख्य कारीगर + हेल्पर सहायता (${cleanArea} दर: ₹${region.dailyMasterRate}/दिन मानक)`,
        `अनुमानित समय: ${dur} • औजार व मशीन कारीगर खुद लाएगा`,
        '0% मिडिलमैन कमीशन • काम के बाद OTP वेरिफाइड भुगतान',
      ],
      rateNote: `${cleanArea} क्षेत्रीय औसत दर: ₹${region.dailyMasterRate}/दिन (या पक्का ठेका)`,
    },
    materialAndKarigar: {
      title: '2. कच्चा माल + कारीगर (सम्पूर्ण पैकेज)',
      subtitle: 'सत्यापित सप्लायर से शुद्ध कच्चा माल + SETU कारीगर द्वारा निर्माण',
      items: rawItems,
      materialTotal,
      laborTotal,
      grandTotal,
      warrantyNote: '🛡️ शुद्ध कच्चा माल बिल + 1 साल फिटिंग वारंटी (GST/भाड़ा बिल पर अलग से)',
    },
    onlyMaterial: {
      title: '3. केवल कच्चा माल (थोक सप्लायर ऑर्डर)',
      subtitle: 'आपका खुद का कारीगर है — सिर्फ शुद्ध कच्चा माल होलसेल रेट पर मंगाएं',
      items: rawItems,
      materialTotal,
      deliveryNote: `🚚 ${region.deliveryNote} (लोडिंग/अतिरिक्त दूरी भाड़ा वास्तविक अनुसार)`,
    },
    budgetFitNote,
    isWithinBudget,
    suggestedTierUpgradeOrSave,
  };
}

function buildFallbackCustomMaterialGroups(userText = '', locality = 'भोपाल') {
  const region = getRegionalRateProfileBackend(locality);
  const store = region.defaultStore;
  const q = cleanStr(userText).toLowerCase();

  if (/पूजा घर|pooja|mandir|मंदिर|temple|mandap/.test(q)) {
    return [
      {
        groupId: 'mandir_wood',
        groupTitle: '1. मंदिर बॉडी व नक्काशी लकड़ी / मार्बल (कच्चा माल)',
        items: [
          { id: 'cm_m1', name: 'सेंचुरी BWP प्लाई 19mm + MDF लेजर जाली शीट', brand: 'Century + Action MDF', qualitySpec: 'किफ़ायती व साफ नक्काशी जाली', tier: 'budget', price: 2100, unit: 'प्रति शीट', approxQtyMultiplier: 2, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'handcrafted clean wooden Pooja Mandir with CNC jaali backdrop and drawer base' },
          { id: 'cm_m2', name: 'असली MP सागवान (Teak) लकड़ी + पॉलिश मटीरियल', brand: 'MP Royal Sagwan', qualitySpec: 'पवित्र ठोस सागवान लकड़ी पटिये', tier: 'standard', price: 2350, unit: 'प्रति घन फुट', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'royal solid carved Burma teakwood Pooja Mandir with warm golden backlighting and brass bell frame' },
          { id: 'cm_m3', name: 'मकराना / सतवारियो व्हाइट मार्बल + गोल्डन इनले', brand: 'Makrana Cut Slab', qualitySpec: 'शुद्ध सफेद मार्बल मंदिर स्लैब', tier: 'luxury', price: 420, unit: 'प्रति sq.ft', approxQtyMultiplier: 18, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'carved white Makrana marble Pooja Mandir alcove with warm backlit onyx panel' },
        ],
      },
      {
        groupId: 'mandir_finish',
        groupTitle: '2. बैक-लिट LED, घंटियाँ & सॉफ्ट-क्लोज़ ड्रॉअर (कच्चा माल)',
        items: [
          { id: 'cm_f1', name: 'वार्म कोव LED प्रोफाइल + ब्रास घंटी हैंगिंग सेट + ड्रॉअर चैनल', brand: 'Philips LED + Brass', qualitySpec: 'संपूर्ण पूजा सामग्री ड्रॉअर व लाइट किट', tier: 'standard', price: 2200, unit: 'फिनिश सेट', approxQtyMultiplier: 1, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'warm spiritual backlighting and neat brass handle drawers for puja storage' },
        ],
      },
    ];
  }

  if (/काउंटर|counter|दुकान|dukan|dukaan|shop|showroom|कैफे|cafe/.test(q)) {
    return [
      {
        groupId: 'counter_body',
        groupTitle: '1. काउंटर बॉडी — HDHMR बोर्ड / प्लाईवुड + फ्लूटेड पैनल (कच्चा माल)',
        items: [
          { id: 'cnt_b1', name: '18mm BWR प्लाई + सादा माइका शीट', brand: 'Greenply + Merino', qualitySpec: 'किफ़ायती मजबूत दुकान काउंटर ढांचा', tier: 'budget', price: 1550, unit: 'प्रति शीट', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'clean commercial laminated retail counter desk' },
          { id: 'cnt_b2', name: 'एक्शन टेसा HDHMR 18mm + WPC फ्लूटेड लूवर्स', brand: 'Action Tesa + E3 WPC', qualitySpec: 'मॉडर्न रिब्ड फ्रंट और स्क्रैच-प्रूफ बॉडी', tier: 'standard', price: 2850, unit: 'प्रति शीट/सेट', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'modern fluted dark walnut wood reception counter with warm LED strip base' },
          { id: 'cnt_b3', name: 'सतवारियो मार्बल / क्वार्ट्ज़ टॉप + गोल्ड स्टेनलेस स्ट्रिप', brand: 'Kalinga Stone + SS-304', qualitySpec: 'शोरूम / क्लिनिक लक्ज़री रिसेप्शन टॉप', tier: 'luxury', price: 360, unit: 'प्रति sq.ft', approxQtyMultiplier: 22, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'luxury white Satvario marble countertop shop desk with brushed gold inlay trim' },
        ],
      },
      {
        groupId: 'counter_fit',
        groupTitle: '2. कैश ड्रॉअर लॉक, केबल मैनेजर & LED लाइट (कच्चा माल)',
        items: [
          { id: 'cnt_f1', name: 'गॉदरेज कैश ड्रॉअर चैनल + केबल ग्रोमेट + वार्म कोव LED', brand: 'Godrej + Philips', qualitySpec: 'दुकान सुरक्षा व साफ वायरिंग सेट', tier: 'standard', price: 2900, unit: 'काउंटर किट', approxQtyMultiplier: 1, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'hidden POS cable routing and recessed LED toe-kick lighting' },
        ],
      },
    ];
  }

  if (/ड्रेसिंग|dressing|mirror|शीशा|shisha|vanity/.test(q)) {
    return [
      {
        groupId: 'dressing_body',
        groupTitle: '1. ड्रेसिंग बॉडी प्लाई & लैमिनेट शीट (कच्चा माल)',
        items: [
          { id: 'dr_1', name: 'सेंचुरी BWP 19mm प्लाई + वॉलनट/क्रीम 1mm माइका', brand: 'CenturyPly + Greenlam', qualitySpec: 'बैंगल और कॉस्मेटिक ड्रॉअर बॉडी', tier: 'standard', price: 2450, unit: 'प्रति शीट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'sleek warm teak and matte beige full-height wooden dressing unit' },
          { id: 'dr_2', name: 'सेंट-गोबेन 5mm टच-सेंसर बैकलिट LED मिरर + ऑर्गनाइज़र', brand: 'Saint-Gobain Mirror', qualitySpec: 'एंटी-डिस्टॉर्शन मिरर + स्टील गोल्ड फ्रेम', tier: 'luxury', price: 3200, unit: 'मिरर व लाइट सेट', approxQtyMultiplier: 1, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'halo warm LED backlit oval vanity mirror with concealed jewelry drawers' },
        ],
      },
    ];
  }

  if (/झूला|झुला|jhoola|jhula|jula|swing/.test(q)) {
    return [
      {
        groupId: 'jhoola_wood',
        groupTitle: '1. ठोस सागवान पटिये & पीतल जंजीर हार्डवेयर (कच्चा माल)',
        items: [
          { id: 'jh_1', name: 'सीज़न्ड MP सागवान / शीशम पटिये (3" मोटाई)', brand: 'MP Royal Sagwan', qualitySpec: '250kg भार क्षमता वाली ठोस लकड़ी', tier: 'standard', price: 2250, unit: 'प्रति घन फुट', approxQtyMultiplier: 5, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'handcrafted seasoned solid teakwood swing seat with curved carved armrest' },
          { id: 'jh_2', name: 'हैवी सॉलिड ब्रास (पीतल) कड़ा जंजीर सेट + सीलिंग हुक + फोम', brand: 'Heavy Brass + Sleepwell', qualitySpec: 'एंटीक पीतल जंजीर और 40D कुशन मटीरियल', tier: 'luxury', price: 4800, unit: 'पूरा फिटिंग किट', approxQtyMultiplier: 1, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'antique heavy solid brass hanging chains and plush cream linen swing cushions' },
        ],
      },
    ];
  }

  if (/ऑफिस|office|केबिन|cabin|स्टडी|study|पार्टीशन|partition/.test(q)) {
    return [
      {
        groupId: 'office_frame',
        groupTitle: '1. वर्कस्टेशन बोर्ड, टफन्ड ग्लास & एल्युमीनियम प्रोफाइल (कच्चा माल)',
        items: [
          { id: 'of_1', name: '18mm प्रीलैम पार्टिकल/MDF + पाउडर-कोटेड MS लेग्स', brand: 'Action Tesa Prelam', qualitySpec: 'किफ़ायती ऑफिस / स्टडी डेस्क रॉ', tier: 'budget', price: 1450, unit: 'प्रति शीट/फ्रेम', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'clean modern pre-laminated oak office study desk on matte black steel legs' },
          { id: 'of_2', name: 'सेंचुरी BWP 19mm प्लाई + 12mm टफन्ड ग्लास पार्टीशन', brand: 'CenturyPly + Saint-Gobain', qualitySpec: 'साउंड-प्रूफ ऑफिस केबिन व बुक्स रैक रॉ', tier: 'luxury', price: 3200, unit: 'प्रति पैनल यूनिट', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'executive glass-partitioned office cabin with walnut storage cabinets and warm acoustic slats' },
        ],
      },
    ];
  }

  return [
    {
      groupId: 'custom_base',
      groupTitle: '1. मुख्य ढांचा कच्चा माल (प्लाईवुड / सागवान / स्टील)',
      items: [
        { id: 'cb_eco', name: '19mm कॉमर्शियल प्लाई / MS पाइप (किफ़ायती)', brand: 'Standard ISI Grade', qualitySpec: 'कम बजट में टिकाऊ निर्माण कच्चा माल', tier: 'budget', price: 1450, unit: 'प्रति शीट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'neat functional commercial plywood custom furniture unit' },
        { id: 'cb_std', name: 'सेंचुरी BWP 710 मरीन प्लाई / सागवान (पॉपुलर)', brand: 'CenturyPly Sainik', qualitySpec: 'दीमक व नमी-रोधी प्रीमियम ग्रेड', tier: 'standard', price: 2450, unit: 'प्रति शीट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'solid waterproof wood and teak laminate custom unit with crisp clean edges' },
        { id: 'cb_lux', name: 'ठोस सागवान लकड़ी + इटैलियन मार्बल/ग्लास (लक्ज़री)', brand: 'MP Teak + Italian Finish', qualitySpec: 'हेवी-ड्यूटी लक्ज़री ग्रेड मटीरियल', tier: 'luxury', price: 4200, unit: 'प्रति यूनिट लॉट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'luxury custom solid teakwood & marble trim designer installation with warm architectural LED glow' },
      ],
    },
    {
      groupId: 'custom_fin',
      groupTitle: '2. ऊपरी माइका / पेंट / हार्डवेयर फिटिंग (कच्चा माल)',
      items: [
        { id: 'cf_std', name: '1mm टेक्सचर माइका + सॉफ्ट-क्लोज़ चैनल + फेविकोल मरीन', brand: 'Greenlam + Ebco', qualitySpec: 'संपूर्ण फिनिश व मजबूत जोड़ पैक', tier: 'standard', price: 2600, unit: 'फिनिश सेट', approxQtyMultiplier: 1, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'warm wood-grain sunmica surface finish and sleek hardware details' },
      ],
    },
  ];
}

module.exports = {
  RAW_PROJECT_CONFIGS,
  sanitizePromptText,
  stripNegatedClauses,
  extractLocalityFromText,
  extractDimensionsAndBhkFromText,
  sanitizeSelectedProducts,
  getRegionalRateProfileBackend,
  isRepairIntentText,
  resolveClarificationFollowup,
  isUnderspecifiedQuery,
  detectCustomSubTopic,
  detectSecondaryIntents,
  detectProjectTypeBackend,
  buildCustomPromptDescriptor,
  isQuotationDemandBackend,
  parseBudgetFromText,
  reconcileQuotationTotals,
  buildBackendThreeWayQuotation,
  buildFallbackCustomMaterialGroups,
};
