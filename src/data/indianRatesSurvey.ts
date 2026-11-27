/**
 * SETU Indian Contractor Rates & Measurement Standards Survey
 * Comprehensive state-wise benchmarks across India for blue-collar trades.
 */

export interface TradeRateStandard {
  tradeId: string;
  tradeNameHindi: string;
  tradeNameEng: string;
  commonUnits: string[];
  benchmarksByRegion: {
    region: string; // e.g. "उत्तर प्रदेश & बिहार", "दिल्ली NCR", "महाराष्ट्र", "दक्षिण भारत"
    dailyWageMaster: string; // Master craftsperson
    dailyWageHelper: string; // Assistant / Helper
    contractUnitRates: { unit: string; range: string; note: string }[];
  }[];
  fairPricingTips: string[];
}

export const INDIAN_RATES_SURVEY: TradeRateStandard[] = [
  {
    tradeId: 'mason',
    tradeNameHindi: 'राजमिस्त्री (Mason)',
    tradeNameEng: 'Masonry & Tiling',
    commonUnits: ['प्रति दिन (8 घंटे)', 'प्रति 1,000 ईंट चिनाई', 'प्रति Sq.Ft प्लास्टर', 'प्रति Sq.Ft टाइल्स/मार्बल', 'प्रति Sq.Ft छत ढलाई'],
    benchmarksByRegion: [
      {
        region: 'उत्तर प्रदेश & बिहार (UP & Bihar)',
        dailyWageMaster: '₹850 - ₹1,000 / दिन',
        dailyWageHelper: '₹500 - ₹600 / दिन',
        contractUnitRates: [
          { unit: 'ईंट चुनाई (Brickwork)', range: '₹18 - ₹24 / sq.ft', note: 'सीमेंट-मौरंग गारे के साथ 9-इंच दीवार' },
          { unit: 'दीवार प्लास्टर (Plastering)', range: '₹14 - ₹18 / sq.ft', note: 'चिकनी फिनिशिंग' },
          { unit: 'फ्लोर टाइल्स फिटिंग', range: '₹22 - ₹32 / sq.ft', note: 'विट्रिफाइड 2x2 या 4x2 टाइल्स' },
          { unit: 'आरसीसी छत लेंटर ढलाई', range: '₹35 - ₹45 / sq.ft', note: 'शटरिंग + सरिया बांधना + कंक्रीट' },
        ],
      },
      {
        region: 'दिल्ली NCR (Delhi, Noida, Gurgaon)',
        dailyWageMaster: '₹950 - ₹1,200 / दिन',
        dailyWageHelper: '₹600 - ₹750 / दिन',
        contractUnitRates: [
          { unit: 'ईंट चुनाई', range: '₹22 - ₹30 / sq.ft', note: 'हाई-राइज व डुप्लेक्स निर्माण' },
          { unit: 'प्लास्टर', range: '₹18 - ₹25 / sq.ft', note: 'पीओपी पुट्टी बेस' },
          { unit: 'इटालियन मार्बल/ग्रेनाइट', range: '₹45 - ₹85 / sq.ft', note: 'डायमंड पॉलिशिंग सहित' },
          { unit: 'लेंटर ढलाई', range: '₹45 - ₹60 / sq.ft', note: 'मशीन वाइब्रेटर सहित' },
        ],
      },
      {
        region: 'महाराष्ट्र & दक्षिण भारत (Mumbai, Pune, Bangalore)',
        dailyWageMaster: '₹1,000 - ₹1,350 / दिन',
        dailyWageHelper: '₹650 - ₹800 / दिन',
        contractUnitRates: [
          { unit: 'ब्लॉक वर्क (AAC Block)', range: '₹25 - ₹35 / sq.ft', note: 'रेडिमैक्स मोटार' },
          { unit: 'टाइल्स व ग्रेनाइट', range: '₹35 - ₹55 / sq.ft', note: 'लेवलिंग व ग्राउटिंग' },
        ],
      },
    ],
    fairPricingTips: [
      'मौरंग और सीमेंट का सही अनुपात (1:4 या 1:6) चेक करें।',
      'लेंटर ढलाई में कम से कम 7-14 दिन तराई (Curing) सुनिश्चित करें।',
    ],
  },
  {
    tradeId: 'carpenter',
    tradeNameHindi: 'कारपेंटर / बढ़ई (Carpenter)',
    tradeNameEng: 'Carpentry & Furniture',
    commonUnits: ['प्रति दिन (8 घंटे)', 'प्रति 8x4 शीट कटिंग', 'प्रति रनिंग फुट मॉड्यूलर किचन', 'प्रति Sq.Ft वॉर्डरोब', 'प्रति दरवाजा फिटिंग'],
    benchmarksByRegion: [
      {
        region: 'उत्तर प्रदेश & बिहार',
        dailyWageMaster: '₹900 - ₹1,100 / दिन',
        dailyWageHelper: '₹500 - ₹600 / दिन',
        contractUnitRates: [
          { unit: 'शीट कटिंग & पेस्टिंग', range: '₹320 - ₹420 / 8x4 शीट', note: 'प्लाईवुड + माइका (Sunmica)' },
          { unit: 'मॉड्यूलर किचन', range: '₹1,100 - ₹1,600 / रनिंग ft', note: 'हाइड्रोलिक बास्केट + प्रोफाइल हैंडल' },
          { unit: 'वॉर्डरोब (अलमारी)', range: '₹350 - ₹480 / sq.ft', note: 'स्लाइडिंग व ओपन डोर' },
          { unit: 'दरवाजा चौखट पल्ला', range: '₹750 - ₹1,100 / दरवाजा', note: 'कब्जे, लॉक व हैंडल फिटिंग' },
        ],
      },
      {
        region: 'दिल्ली NCR',
        dailyWageMaster: '₹1,000 - ₹1,300 / दिन',
        dailyWageHelper: '₹650 - ₹800 / दिन',
        contractUnitRates: [
          { unit: 'मॉड्यूलर किचन', range: '₹1,400 - ₹2,200 / रनिंग ft', note: 'ऐक्रेलिक व पीयू फिनिश' },
          { unit: 'वॉर्डरोब (फ्लोर टू सीलिंग)', range: '₹450 - ₹650 / sq.ft', note: 'सॉफ्ट-क्लोज हिंज' },
        ],
      },
    ],
    fairPricingTips: [
      'हमेशा BWP/BWR ग्रेड वॉटरप्रूफ प्लाईवुड (जैसे सेंचुरी या ग्रीनप्लाई) किचन और बाथरूम में उपयोग करें।',
      'फेविकॉल मरीन या हीटप्रूफ एडहेसिव का उपयोग मजबूत जोड़ देता है।',
    ],
  },
  {
    tradeId: 'plumber',
    tradeNameHindi: 'प्लंबर (Plumber)',
    tradeNameEng: 'Plumbing & Sanitary',
    commonUnits: ['प्रति पॉइंट (Hot/Cold/Waste)', 'प्रति बाथरूम सम्पूर्ण ठेका', 'प्रति वाटर टैंक (500L-1000L)', 'प्रति इमरजेंसी विजिट'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का औसत मानक',
        dailyWageMaster: '₹800 - ₹1,000 / दिन',
        dailyWageHelper: '₹500 - ₹600 / दिन',
        contractUnitRates: [
          { unit: 'प्लंबिंग पॉइंट फिटिंग', range: '₹220 - ₹350 / पॉइंट', note: 'कंसील्ड CPVC/UPVC पाइपलाइन' },
          { unit: 'कम्पलीट बाथरूम फिटिंग', range: '₹3,500 - ₹6,000 / बाथरूम', note: 'शावर, डाइवर्टर, कमोड, सिंक' },
          { unit: 'छत पानी टंकी (Water Tank)', range: '₹750 - ₹1,200 / टैंक', note: 'ओवरफ्लो व मोटर इनलेट कनेक्शन' },
          { unit: 'क्विक रिपेयर / लीकेज चेक', range: '₹199 - ₹299 / विजिट', note: 'नल, वॉशर, पाइप लीकेज' },
        ],
      },
    ],
    fairPricingTips: [
      'दीवार में टाइल्स लगाने से पहले कम से कम 24 घंटे 10 Bar प्रेशर पर पाइपलाइन लीकेज टेस्ट अवश्य कराएं।',
    ],
  },
  {
    tradeId: 'electrician',
    tradeNameHindi: 'इलेक्ट्रीशियन (Electrician)',
    tradeNameEng: 'Electrical & Wiring',
    commonUnits: ['प्रति स्विच/लाइट पॉइंट', 'प्रति रनिंग फुट झिरी कटिंग', 'प्रति MCB डिस्ट्रीब्यूशन बॉक्स', 'प्रति होम अप्लायंस इंस्टॉलेशन'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का औसत मानक',
        dailyWageMaster: '₹800 - ₹1,050 / दिन',
        dailyWageHelper: '₹500 - ₹600 / दिन',
        contractUnitRates: [
          { unit: 'स्विच / लाइट पॉइंट', range: '₹70 - ₹120 / पॉइंट', note: 'वायरिंग + मॉड्यूलर स्विच' },
          { unit: 'दीवार झिरी कटिंग (Groove)', range: '₹15 - ₹25 / रनिंग ft', note: 'पाइप व जंक्शन बॉक्स डालना' },
          { unit: 'MCB डिस्ट्रीब्यूशन बोर्ड', range: '₹600 - ₹1,200 / बॉक्स', note: 'सर्किट लोड बैलेंसिंग' },
          { unit: 'गीजर / पंखा / चिमनी', range: '₹150 - ₹450 / उपकरण', note: 'सीलिंग या वॉल माउंट' },
        ],
      },
    ],
    fairPricingTips: [
      'AC व गीजर के लिए कम से कम 2.5 mm या 4.0 mm तांबे का FRLS (फायर रेसिस्टेंट) तार ही लगवाएं।',
    ],
  },
  {
    tradeId: 'painter',
    tradeNameHindi: 'पेंटर (Painter)',
    tradeNameEng: 'Painting & Waterproofing',
    commonUnits: ['प्रति Sq.Ft पुट्टी + पेंट', 'प्रति Sq.Ft केवल रीपेंट (Fresh vs Repaint)', 'प्रति Sq.Ft बाहरी वाटरप्रूफिंग'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का औसत मानक',
        dailyWageMaster: '₹750 - ₹950 / दिन',
        dailyWageHelper: '₹450 - ₹550 / दिन',
        contractUnitRates: [
          { unit: 'नया कार्य (2 पुट्टी + 1 प्राइमर + 2 कोट)', range: '₹12 - ₹18 / sq.ft', note: 'प्रीमियम इमल्शन' },
          { unit: 'रीपेंटिंग (1 पुट्टी टचअप + 2 कोट)', range: '₹6 - ₹10 / sq.ft', note: 'रोलर फिनिश' },
          { unit: 'एक्सटीरियर वेदरप्रूफ टेक्सचर', range: '₹18 - ₹30 / sq.ft', note: 'सिलिकॉन बेस एंटी-फंगस' },
        ],
      },
    ],
    fairPricingTips: [
      'पुट्टी की पहली और दूसरी परत के बीच कम से कम 6 घंटे का अंतराल रखें।',
    ],
  },
  {
    tradeId: 'false_ceiling',
    tradeNameHindi: 'POP / फॉल्स सीलिंग वाला',
    tradeNameEng: 'POP & False Ceiling',
    commonUnits: ['प्रति Sq.Ft (मुख्य सपाट छत)', 'प्रति रनिंग फुट (कोव, स्लॉट & पेलमेट)'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का मानक रेट',
        dailyWageMaster: '₹950 - ₹1,200 / दिन',
        dailyWageHelper: '₹550 - ₹650 / दिन',
        contractUnitRates: [
          { unit: 'मुख्य जिप्सम / POP छत', range: '₹75 - ₹135 / sq.ft', note: '0.5mm GI फ्रेम + 12.5mm बोर्ड' },
          { unit: 'कोव लाइट, स्लॉट & पर्दा पेलमेट', range: '₹65 - ₹120 / रनिंग ft', note: 'सीलिंग क्षेत्र से अलग गिनती' },
        ],
      },
    ],
    fairPricingTips: ['हमेशा 0.5mm या उससे मोटा जिंक कोटेड GI चैनल व पेरीमीटर लगवाएं ताकि छत न लटके।'],
  },
  {
    tradeId: 'welder',
    tradeNameHindi: 'सरिया बाँधने वाला / ग्रिल फैब्रिकेटर',
    tradeNameEng: 'Rebar Binder & Fabricator',
    commonUnits: ['प्रति किलो (सरिया लेबर या तैयार ग्रिल)', 'प्रति टन (TMT सरिया)', 'दिहाड़ी'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का मानक रेट',
        dailyWageMaster: '₹850 - ₹1,100 / दिन',
        dailyWageHelper: '₹550 - ₹650 / दिन',
        contractUnitRates: [
          { unit: 'सरिया कटिंग व बाँधने की मजदूरी', range: '₹5 - ₹8 / kg (या ₹5,000 - ₹7,500 / टन)', note: 'केवल लेबर रेट' },
          { unit: 'तैयार MS ग्रिल / गेट सप्लाई व फिटिंग', range: '₹95 - ₹135 / kg', note: 'मटेरियल + प्राइमर + फिटिंग (अलग एंट्री)' },
        ],
      },
    ],
    fairPricingTips: ['सरिया बाँधने की मजदूरी व तैयार ग्रिल सप्लाई+फिटिंग के बिल हमेशा अलग रखवाएं।'],
  },
  {
    tradeId: 'aluminium_upvc',
    tradeNameHindi: 'एल्युमिनियम / uPVC / ग्लास वाला',
    tradeNameEng: 'Aluminium, uPVC & Glazing',
    commonUnits: ['प्रति Sq.Ft (बाहरी नाप अनुसार)', 'प्रति वर्ग मीटर (m²)'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का मानक रेट',
        dailyWageMaster: '₹950 - ₹1,200 / दिन',
        dailyWageHelper: '₹550 - ₹650 / दिन',
        contractUnitRates: [
          { unit: 'जिंदल एल्युमिनियम 3-ट्रैक + 5mm ग्लास', range: '₹320 - ₹480 / sq.ft', note: 'मच्छर जाली शटर सहित' },
          { unit: 'uPVC साउंडप्रूफ खिड़की (DGU/8mm)', range: '₹480 - ₹720 / sq.ft (₹5,100 - ₹7,700 / m²)', note: 'मल्टी-पॉइंट लॉक व सिलिकॉन सील' },
        ],
      },
    ],
    fairPricingTips: ['ऑर्डर से पहले खिड़की का बाहरी नाप, ग्लास मोटाई (mm) और सिलिकॉन फिटिंग दायरा लिखवा लें।'],
  },
  {
    tradeId: 'waterproofing',
    tradeNameHindi: 'वॉटरप्रूफिंग वाला',
    tradeNameEng: 'Waterproofing Specialist',
    commonUnits: ['प्रति Sq.Ft ट्रीटमेंट', 'पूरे काम का कोटेशन (वारंटी सहित)'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का मानक रेट',
        dailyWageMaster: '₹900 - ₹1,150 / दिन',
        dailyWageHelper: '₹550 - ₹650 / दिन',
        contractUnitRates: [
          { unit: 'छत फाइबर-मेश + 3 कोट केमिकल', range: '₹40 - ₹75 / sq.ft', note: 'Dr. Fixit / Fosroc 5-7 वर्ष वारंटी' },
          { unit: 'बेसमेंट / बाहरी दीवार इंजेक्शन सील', range: '₹55 - ₹120 / sq.ft', note: 'सीपेज स्रोत अनुसार' },
        ],
      },
    ],
    fairPricingTips: ['ट्रीटमेंट से पहले छत की पूरी धुलाई व क्रैक में V-ग्रूव पॉलीमर भरवाना सुनिश्चित करें।'],
  },
  {
    tradeId: 'ac_repair',
    tradeNameHindi: 'AC मैकेनिक',
    tradeNameEng: 'AC Technician',
    commonUnits: ['प्रति AC (इंस्टॉल)', 'प्रति सर्विस / विज़िट', 'अतिरिक्त कॉपर पाइप (फुट/मीटर अलग लाइन)'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का मानक रेट',
        dailyWageMaster: '₹900 / दिन',
        dailyWageHelper: '₹450 / दिन',
        contractUnitRates: [
          { unit: 'फोम-जेट AC सर्विस', range: '₹499 - ₹699 / सर्विस', note: 'इनडोर + आउटडोर प्रेशर वॉश' },
          { unit: 'स्प्लिट AC इंस्टॉलेशन', range: '₹1,200 - ₹1,600 / AC', note: 'कोर कटिंग व स्टैंड अतिरिक्त' },
          { unit: 'अतिरिक्त कॉपर पाइप (अलग लाइन)', range: '₹280 - ₹350 / फुट (₹950 - ₹1,150 / मीटर)', note: 'इंसुलेशन व ड्रेन पाइप सहित' },
        ],
      },
    ],
    fairPricingTips: ['गैस रिफिलिंग से पहले नाइट्रोजन प्रेशर से लीक टेस्ट व वैक्यूम पंप चलाना अनिवार्य कराएं।'],
  },
  {
    tradeId: 'labor',
    tradeNameHindi: 'हेल्पर / JCB / ट्रॉली',
    tradeNameEng: 'Helper, JCB & Trolley',
    commonUnits: ['हेल्पर प्रति व्यक्ति-दिन', 'JCB प्रति घंटा', 'मिट्टी/मलबा ट्रॉली प्रति चक्कर (क्षमता & दूरी)'],
    benchmarksByRegion: [
      {
        region: 'पूरे भारत का मानक रेट',
        dailyWageMaster: '₹550 - ₹650 / व्यक्ति-दिन',
        dailyWageHelper: '₹500 - ₹600 / दिन',
        contractUnitRates: [
          { unit: 'JCB खुदाई / लेवलिंग', range: '₹950 - ₹1,350 / घंटा', note: 'डीजल व ऑपरेटर सहित' },
          { unit: 'मिट्टी / मलबा ट्रॉली (100 cft)', range: '₹1,200 - ₹2,400 / चक्कर', note: 'ट्रॉली क्षमता व किमी दूरी अनुसार' },
        ],
      },
    ],
    fairPricingTips: ['ट्रॉली बुक करते समय 100/150 cft क्षमता और डंपिंग की दूरी (Km) पहले से तय करें।'],
  },
];
