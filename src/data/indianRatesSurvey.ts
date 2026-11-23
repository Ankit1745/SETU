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
];
