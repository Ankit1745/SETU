export interface Category {
  id: string;
  nameHindi: string;
  nameEng: string;
  group: 'CONSTRUCTION' | 'WEDDING_EVENT' | 'QUICK_REPAIR';
  icon: string;
  color: string;
  applicableRateTypes: string[];
}

export interface MaterialItem {
  id: string;
  vendorId?: string; // Links product strictly to its vendor store
  name: string;
  brand: string;
  category: string;
  mrp: number;
  sellingPrice: number;
  unit: string;
  bulkOffer: string;
  storeName: string;
  storeDistance: string;
  inStock: boolean;
  image: string;
}

export interface PortfolioPhoto {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  description: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  workDone: string;
  location: string;
  verifiedWork: boolean;
}

export interface WorkVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
  type: 'WALKTHROUGH' | 'CUSTOMER_TESTIMONIAL';
  author: string;
  videoUrl: string;
}

export interface TechniqueSpec {
  method: string;           // कारीगर की तकनीक (जैसे "सेंचुरी प्लाई + 1mm माइका पेस्टिंग + हाइड्रॉलिक हिंज")
  standardFormula: string;  // सटीक गणना (जैसे "माप × ₹350 प्रति 8x4 शीट")
  tools: string;            // उपयोग होने वाले टूल्स (जैसे "लेजर लेवलर, सर्कुलर कटर")
  warranty: string;         // काम की गारंटी (जैसे "5 वर्ष अलाइनमेंट वारंटी")
}

export interface Contractor {
  id: string;
  name: string;
  category: string;
  specialtyHindi: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  jobsCompleted: number;
  verified: boolean;
  distance: string;
  etaMinutes: number; // जैसे "15 मिनट में पहुंचेगा" (SETU Express)
  isQuickAvailable: boolean; // क्या अर्जेंट/क्विक मोड में उपलब्ध है
  primaryRateType: string;
  dailyWageRate: number | null;      // कारीगर की अपनी दिहाड़ी (8 घंटे) - null means "भाव पूछें"
  helperRate: number | null;         // हेल्पर की दिहाड़ी - null means "भाव पूछें"
  contractUnitRate: number | null;   // ठेका यूनिट रेट - null means "भाव पूछें"
  unitLabel: string;          // ट्रेड-विशिष्ट यूनिट
  tradeRateSpec?: Record<string, any>; // 15-ट्रेड विशेष रेट स्ट्रक्चर व शर्तें
  techniqueBadge?: string;    // मुख्य तकनीक टैग (जैसे "CNC कटिंग & 1mm मरीन माइका")
  techniqueDetail?: TechniqueSpec; // तकनीक और पारदर्शी रेट फॉर्मूला
  additionalRateCards?: { title: string; rate: string }[];
  bio: string;
  city?: string;
  locality?: string;
  accountHolderName?: string;
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
  userId?: string;
  phone?: string;
  phoneMasked: string;
  available: boolean;
  skills: string[];
  portfolioPhotos: PortfolioPhoto[];
  videos?: WorkVideo[];
  reviews: CustomerReview[];
  recommendedMaterials: MaterialItem[]; // सप्लायर का सामान सीधे कारीगर के साथ लिंक्ड
}

export interface MegaContract {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: string;
  color: string;
  estimatedBudgetRange: string;
  durationEstimate: string;
  description: string;
  includedServices: string[];
  includedMaterials: string[];
  milestones: { step: number; title: string; payoutPercent: number; desc: string }[];
}

export interface QuickServiceItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  estimatedTime: string;
  startingPrice: number;
  commonProblems: string[];
}

export interface JobRequest {
  id: string;
  contractorId?: string; // Links direct booking specifically to chosen contractor
  category?: 'carpenter' | 'plumber' | 'electrician' | 'mason' | 'painter' | 'wedding_tent' | 'wedding_catering' | 'wedding_makeup' | 'wedding_photo' | 'event_dj' | 'ac_repair';
  customerName: string;
  workType: string;
  location: string;
  date: string;
  hiringType: string;
  budgetOffer: number;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface MarketRateItem {
  id: string;
  title: string;
  category: 'material' | 'labor';
  price: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeText: string;
  verifiedWholesaleMarket: string;
}

export const BHOPAL_MARKET_INDEX: MarketRateItem[] = [
  {
    id: 'm1',
    title: 'अल्ट्राटेक / ACC 53 ग्रेड सीमेंट',
    category: 'material',
    price: '₹365',
    unit: 'प्रति 50kg बोरी',
    trend: 'stable',
    changeText: 'स्थिर (पिछले हफ्ते समान)',
    verifiedWholesaleMarket: 'हमीदिया रोड थोक मंडी',
  },
  {
    id: 'm2',
    title: 'नर्मदा छनी रेत (Reticulated Sand)',
    category: 'material',
    price: '₹40',
    unit: 'प्रति घन फुट (cft)',
    trend: 'up',
    changeText: '+₹2 इस सप्ताह',
    verifiedWholesaleMarket: 'करौंद बाईपास डिपो',
  },
  {
    id: 'm3',
    title: 'टाटा टिस्कॉन / जिंदल सरिया (TMT 550D)',
    category: 'material',
    price: '₹59',
    unit: 'प्रति किलोग्राम (Kg)',
    trend: 'down',
    changeText: '-₹1.5 थोक छूट',
    verifiedWholesaleMarket: 'गोविंदपुरा इंडस्ट्रियल एरिया',
  },
  {
    id: 'm4',
    title: 'मास्टर राजमिस्त्री दिहाड़ी',
    category: 'labor',
    price: '₹850 - ₹950',
    unit: '8 घंटे शिफ्ट',
    trend: 'stable',
    changeText: 'मानक भोपाल दर',
    verifiedWholesaleMarket: 'एमपी नगर / 10 नंबर नाका',
  },
  {
    id: 'm5',
    title: 'मास्टर प्लंबर दिहाड़ी',
    category: 'labor',
    price: '₹850',
    unit: '8 घंटे शिफ्ट',
    trend: 'stable',
    changeText: 'मानक भोपाल दर',
    verifiedWholesaleMarket: 'न्यू मार्केट / अरेरा हब',
  },
  {
    id: 'm6',
    title: 'मास्टर कारपेंटर (बढ़ई) दिहाड़ी',
    category: 'labor',
    price: '₹950',
    unit: '8 घंटे शिफ्ट',
    trend: 'stable',
    changeText: 'मानक भोपाल दर',
    verifiedWholesaleMarket: 'अग्रवाल टिम्बर मार्केट',
  },
  {
    id: 'm7',
    title: 'विट्रीफाइड टाइल फिटिंग ठेका',
    category: 'labor',
    price: '₹24',
    unit: 'प्रति वर्ग फुट (Sq.Ft)',
    trend: 'stable',
    changeText: 'रासायनिक एडहेसिव फिटिंग',
    verifiedWholesaleMarket: 'होशंगाबाद रोड टाइल हब',
  },
  {
    id: 'm8',
    title: '2-कोट पुट्टी + रॉयल इमल्शन पेंटिंग',
    category: 'labor',
    price: '₹16',
    unit: 'प्रति वर्ग फुट (Sq.Ft)',
    trend: 'stable',
    changeText: 'मशीन सैंडिंग सहित',
    verifiedWholesaleMarket: 'कोलार रोड पेंटर्स यूनियन',
  },
];

export const RATE_TYPE_FILTERS = [
  { id: 'ALL', label: 'सभी दरें (All Rates)' },
  { id: 'दिहाड़ी', label: '🟢 केवल दिहाड़ी (Daily Shift)' },
  { id: 'स्क्वायर फुट', label: '📐 प्रति वर्ग फुट (Sq.Ft)' },
  { id: 'प्रति पॉइंट', label: '⚡ प्रति पॉइंट / फिटिंग' },
  { id: 'शीट/रनिंग फुट', label: '🪚 रनिंग फुट / शीट' },
  { id: 'पैकेज ठेका', label: '📦 पूरा ठेका / पैकेज' },
];

// 1. ALL COMPREHENSIVE CATEGORIES (All 15 Core Trades + Events + Quick Repairs)
export const CATEGORIES: Category[] = [
  // Construction & Home
  { id: 'carpenter', nameHindi: 'बढ़ई / फर्नीचर वाला', nameEng: 'Carpenter', group: 'CONSTRUCTION', icon: 'hammer', color: '#B45309', applicableRateTypes: ['प्रति वर्ग फुट', 'मटेरियल बिल का %', 'दिहाड़ी', 'रनिंग फुट', 'प्रति पीस'] },
  { id: 'mason', nameHindi: 'राजमिस्त्री / मकान ठेकेदार', nameEng: 'Mason', group: 'CONSTRUCTION', icon: 'wall', color: '#4B5563', applicableRateTypes: ['दिहाड़ी', 'स्क्वायर फुट', 'पूरे काम का ठेका', 'घन मीटर (m³)'] },
  { id: 'painter', nameHindi: 'पेंटर / पुट्टी वाला', nameEng: 'Painter', group: 'CONSTRUCTION', icon: 'format-paint', color: '#7C3AED', applicableRateTypes: ['स्क्वायर फुट', 'दिहाड़ी', 'पूरा ठेका'] },
  { id: 'electrician', nameHindi: 'इलेक्ट्रीशियन', nameEng: 'Electrician', group: 'CONSTRUCTION', icon: 'flash', color: '#EA580C', applicableRateTypes: ['प्रति पॉइंट', 'प्रति फिटिंग/पीस', 'दिहाड़ी', 'मेन केबल/मीटर'] },
  { id: 'plumber', nameHindi: 'प्लंबर (Plumber)', nameEng: 'Plumber', group: 'CONSTRUCTION', icon: 'pipe', color: '#0284C7', applicableRateTypes: ['प्रति फिटिंग', 'प्रति पॉइंट/लाइन', 'पूरा बाथरूम', 'प्रति विजिट', 'दिहाड़ी'] },
  { id: 'tiling', nameHindi: 'टाइल / मार्बल वाला', nameEng: 'Tiling', group: 'CONSTRUCTION', icon: 'view-grid', color: '#059669', applicableRateTypes: ['स्क्वायर फुट', 'रनिंग फुट', 'दिहाड़ी'] },
  { id: 'false_ceiling', nameHindi: 'POP / फॉल्स सीलिंग वाला', nameEng: 'POP & False Ceiling', group: 'CONSTRUCTION', icon: 'ceiling-light', color: '#0D9488', applicableRateTypes: ['स्क्वायर फुट', 'रनिंग फुट'] },
  { id: 'welder', nameHindi: 'सरिया बाँधने वाला / ग्रिल फैब्रिकेटर', nameEng: 'Rebar & Grill Fabricator', group: 'CONSTRUCTION', icon: 'torch', color: '#334155', applicableRateTypes: ['प्रति किलो', 'प्रति टन', 'दिहाड़ी'] },
  { id: 'aluminium_upvc', nameHindi: 'एल्युमिनियम / uPVC / ग्लास वाला', nameEng: 'Aluminium & Glass', group: 'CONSTRUCTION', icon: 'window-maximize', color: '#0369A1', applicableRateTypes: ['स्क्वायर फुट', 'वर्ग मीटर'] },
  { id: 'waterproofing', nameHindi: 'वॉटरप्रूफिंग वाला', nameEng: 'Waterproofing', group: 'CONSTRUCTION', icon: 'water-check', color: '#0E7490', applicableRateTypes: ['स्क्वायर फुट', 'पूरे काम का कोटेशन'] },
  { id: 'labor', nameHindi: 'हेल्पर / JCB / ट्रॉली', nameEng: 'Helper / JCB / Trolley', group: 'CONSTRUCTION', icon: 'account-hard-hat', color: '#D97706', applicableRateTypes: ['प्रति व्यक्ति-दिन', 'प्रति घंटा (JCB)', 'प्रति चक्कर (ट्रॉली)'] },

  // Quick Repairs (SETU Express)
  { id: 'ac_repair', nameHindi: 'AC मैकेनिक', nameEng: 'AC Mechanic', group: 'QUICK_REPAIR', icon: 'air-conditioner', color: '#0284C7', applicableRateTypes: ['प्रति AC', 'प्रति सर्विस/विजिट', 'कॉपर पाइप (/ft या /m)'] },
  { id: 'appliance', nameHindi: 'फ्रिज, वाशिंग मशीन रिपेयर', nameEng: 'Appliances', group: 'QUICK_REPAIR', icon: 'washing-machine', color: '#6366F1', applicableRateTypes: ['प्रति विजिट'] },
  { id: 'locksmith', nameHindi: 'ताला-चाबी (Locksmith)', nameEng: 'Locksmith', group: 'QUICK_REPAIR', icon: 'key-variant', color: '#CA8A04', applicableRateTypes: ['प्रति विजिट'] },

  // Wedding & Events
  { id: 'wedding_tent', nameHindi: 'टेंट / डेकोरेटर', nameEng: 'Tent & Decor', group: 'WEDDING_EVENT', icon: 'tent', color: '#E11D48', applicableRateTypes: ['स्क्वायर फुट', 'प्रति नग प्रति दिन', 'पूरा फंक्शन'] },
  { id: 'caterer', nameHindi: 'हलवाई / कैटरर', nameEng: 'Halwai & Caterer', group: 'WEDDING_EVENT', icon: 'silverware-fork-knife', color: '#D97706', applicableRateTypes: ['प्रति प्लेट', 'पूरा फंक्शन'] },
  { id: 'wedding_photo', nameHindi: 'वेडिंग फोटोग्राफर / DJ', nameEng: 'Photographer', group: 'WEDDING_EVENT', icon: 'camera', color: '#9333EA', applicableRateTypes: ['प्रति फंक्शन', 'पूरा पैकेज'] },
  { id: 'wedding_makeup', nameHindi: 'ब्राइडल मेकअप आर्टिस्ट', nameEng: 'Makeup Artist', group: 'WEDDING_EVENT', icon: 'face-woman-shimmer', color: '#DB2777', applicableRateTypes: ['प्रति फंक्शन', 'पूरा पैकेज'] },
  { id: 'band', nameHindi: 'शादी बैंड & घोड़ी बग्गी', nameEng: 'Wedding Band', group: 'WEDDING_EVENT', icon: 'trumpet', color: '#C026D3', applicableRateTypes: ['पैकेज ठेका'] },
];

// 2. QUICK REPAIR SERVICES (SETU Express 15-30 min response)
export const QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'qs1',
    title: 'नल लीकेज / पाइप ब्लॉक',
    category: 'plumber',
    icon: 'water-pump',
    estimatedTime: '15-20 मिनट',
    startingPrice: 199,
    commonProblems: ['नल टपक रहा है', 'पाइप लाइन लीक', 'बेसिन जाम है', 'टैंक ओवरफ्लो'],
  },
  {
    id: 'qs2',
    title: 'बिजली फॉल्ट / MCB ट्रिप',
    category: 'electrician',
    icon: 'flash-alert',
    estimatedTime: '15-25 मिनट',
    startingPrice: 199,
    commonProblems: ['बिजली चली गई/शॉर्ट सर्किट', 'MCB बार-बार गिर रही है', 'स्विच जल गया', 'इन्वर्टर बीप कर रहा है'],
  },
  {
    id: 'qs3',
    title: 'AC कूलिंग बंद / गैस लीकेज',
    category: 'acrepair',
    icon: 'snowflake-alert',
    estimatedTime: '20-30 मिनट',
    startingPrice: 349,
    commonProblems: ['ठंडी हवा नहीं आ रही', 'AC से पानी टपक रहा है', 'गैस चार्जिंग', 'पॉवर ऑन नहीं हो रही'],
  },
  {
    id: 'qs4',
    title: 'दरवाजे का ताला जाम / चाबी गुम',
    category: 'locksmith',
    icon: 'lock-open-alert',
    estimatedTime: '15 मिनट',
    startingPrice: 249,
    commonProblems: ['ताला नहीं खुल रहा', 'चाबी अंदर छूट गई', 'नया लॉक लगाना है'],
  },
];

// 3. MEGA CONTRACTS (Zero to End House Construction & All-in-One Wedding)
export const MEGA_PROJECTS: MegaContract[] = [
  {
    id: 'mega_house',
    title: '🏠 "नींव से छत तक" संपूर्ण मकान निर्माण',
    subtitle: 'Zero to End Turnkey Construction Contract',
    tag: 'मेगा हाउस कॉन्ट्रैक्ट',
    icon: 'home-city',
    color: '#1E3A8A',
    estimatedBudgetRange: '₹1,450 - ₹1,850 प्रति sq.ft (लेबर + मटीरियल)',
    durationEstimate: '4 से 6 महीने',
    description:
      'आर्किटेक्ट नक्शा, नींव खुदाई, सरिया-सीमेंट चिनाई, आरसीसी छत, प्लंबिंग, कंसील्ड वायरिंग, पुट्टी-पेंट और टाइल्स फिटिंग — संपूर्ण काम एक ही वेरीफाइड सुपरवाइजर टीम द्वारा।',
    includedServices: [
      'राजमिस्त्री & लेबर टीम (नींव से छत तक)',
      'प्लंबर (सैनिटरी & पाइपलाइन फिटिंग)',
      'इलेक्ट्रीशियन (कंसील्ड वायरिंग & MCB)',
      'पेंटर (पुट्टी, प्राइमर & 2 कोट पेंट)',
      'टाइल्स & मार्बल कारीगर',
    ],
    includedMaterials: [
      'ACC/अल्ट्राटेक 53 ग्रेड सीमेंट',
      'टाटा टिस्कॉन / जिंदल FE-550D सरिया',
      'अव्वल लाल ईंटें & बदरपुर रेत',
      'हैवेल्स वायर & सुप्रीम CPVC पाइप्स',
    ],
    milestones: [
      { step: 1, title: 'नींव & प्लिंथ बीम', payoutPercent: 15, desc: 'खुदाई, फाउंडेशन कंक्रीट और प्लिंथ बीम पूर्ण' },
      { step: 2, title: 'ग्राउंड फ्लोर चिनाई & लिंटेल', payoutPercent: 20, desc: 'दीवारें और लिंटेल लेवल तक चिनाई' },
      { step: 3, title: 'RCC छत ढलाई (Slab Casting)', payoutPercent: 25, desc: 'सरिया जाल, कंक्रीट ढलाई और 14 दिन तराई' },
      { step: 4, title: 'कंसील्ड प्लंबिंग & वायरिंग', payoutPercent: 15, desc: 'अंडरग्राउंड पाइप और बिजली झिरी कटिंग' },
      { step: 5, title: 'प्लास्टर & टाइल्स/मार्बल', payoutPercent: 15, desc: 'आंतरिक/बाहरी प्लास्टर और फ्लोरिंग' },
      { step: 6, title: 'पुट्टी, पेंटिंग & फाइनल पजेशन', payoutPercent: 10, desc: 'फाइनल टचअप और चाबी हैंडओवर' },
    ],
  },
  {
    id: 'mega_wedding',
    title: '💍 "शुभ विवाह" ऑल-इन-वन मेगा पैकेज',
    subtitle: 'Complete 360° Wedding Turnkey Management',
    tag: 'मेगा वेडिंग कॉन्ट्रैक्ट',
    icon: 'heart-multiple',
    color: '#9D174D',
    estimatedBudgetRange: '₹2,50,000 - ₹8,50,000 (मेहमानों की संख्या अनुसार)',
    durationEstimate: '2 से 3 दिन का भव्य आयोजन',
    description:
      'वाटरप्रूफ जर्मन हैंगर टेंट, जयमाला स्टेज डेकोरेशन, हलवाई & 500+ लोगों की कैटरिंग लेबर, सिनेमैटिक वेडिंग फोटोग्राफी, ब्राइडल मेकअप, साउंड & डीजे — एक ही सुरक्षित कॉन्ट्रैक्ट पर।',
    includedServices: [
      'भव्य टेंट, मंडप & जयमाला स्टेज डेकोरेशन',
      'हलवाई वेटर कैटरिंग स्टाफ (25+ टीम)',
      'सिनेमैटिक फोटोग्राफर + ड्रोन वीडियोग्राफी',
      'प्रोफेशनल ब्राइडल HD मेकअप आर्टिस्ट',
      'डीजे, लेजर लाइटिंग & शादी शहनाई बैंड',
    ],
    includedMaterials: [
      'वाटरप्रूफ जर्मन हैंगर फैब्रिक & कार्पेट',
      'ताजे ऑर्किड & गुलाब फूलों का डेकोर',
      'हाई-पावर 10,000W ऑडियो साउंड सेटअप',
      'गोल्डन थीम डिनर क्रॉकरी & बुफे काउंटर्स',
    ],
    milestones: [
      { step: 1, title: 'बुकिंग टोकन & थीम फाइनल', payoutPercent: 20, desc: 'तारीख लॉक और स्टेज/मेन्यू डिजाइन अप्रूव' },
      { step: 2, title: 'टेंट ढांचा & लाइटिंग सेटअप', payoutPercent: 30, desc: 'कार्यक्रम से 1 दिन पहले स्थल तैयार' },
      { step: 3, title: 'मंडप, स्टेज & फूड प्रिपरेशन', payoutPercent: 30, desc: 'विवाह के दिन मुख्य तैयारी पूर्ण' },
      { step: 4, title: 'सफल विदाई & फाइनल सेटलमेंट', payoutPercent: 20, desc: 'सभी सेवाओं के सत्यापन के बाद रिलीज' },
    ],
  },
];

// 4. REAL VERIFIED CONTRACTORS & VENDORS (Loaded dynamically from server DB; zero hardcoded fake accounts)
export const INITIAL_CONTRACTORS: Contractor[] = [];

export const INITIAL_MATERIALS: MaterialItem[] = [];

export const INITIAL_JOB_REQUESTS: JobRequest[] = [];
