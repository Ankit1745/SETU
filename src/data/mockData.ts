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
  etaMinutes: number; // जैसे "15 मिनट में पहुंचेगा" (Uber style)
  isQuickAvailable: boolean; // क्या अर्जेंट/क्विक मोड में उपलब्ध है
  primaryRateType: 'दिहाड़ी' | 'स्क्वायर फुट' | 'प्रति पॉइंट' | 'शीट/रनिंग फुट' | 'पैकेज ठेका' | 'प्रति विजिट';
  dailyWageRate: number | null;      // कारीगर की अपनी दिहाड़ी (8 घंटे) - null means "भाव पूछें"
  helperRate: number | null;         // हेल्पर की दिहाड़ी - null means "भाव पूछें"
  contractUnitRate: number | null;   // ठेका यूनिट रेट - null means "भाव पूछें"
  unitLabel: string;          // ट्रेड-विशिष्ट यूनिट
  techniqueBadge?: string;    // मुख्य तकनीक टैग (जैसे "CNC कटिंग & 1mm मरीन माइका")
  techniqueDetail?: TechniqueSpec; // तकनीक और पारदर्शी रेट फॉर्मूला
  additionalRateCards?: { title: string; rate: string }[];
  bio: string;
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
  { id: 'स्क्वायर फुट', label: '📐 स्क्वायर फुट (Per Sq.Ft)' },
  { id: 'प्रति पॉइंट', label: '⚡ प्रति पॉइंट (Per Point)' },
  { id: 'शीट/रनिंग फुट', label: '🪚 शीट/रनिंग फुट (Unit)' },
  { id: 'पैकेज ठेका', label: '📦 संपूर्ण पैकेज (Lumpsum)' },
];

// 1. ALL COMPREHENSIVE CATEGORIES (Construction, Wedding, Quick Repair)
export const CATEGORIES: Category[] = [
  // Construction & Home
  { id: 'carpenter', nameHindi: 'बढ़ई (Carpenter)', nameEng: 'Carpenter', group: 'CONSTRUCTION', icon: 'hammer', color: '#B45309', applicableRateTypes: ['शीट/रनिंग फुट', 'दिहाड़ी', 'पैकेज ठेका'] },
  { id: 'mason', nameHindi: 'राजमिस्त्री (Mason)', nameEng: 'Mason', group: 'CONSTRUCTION', icon: 'wall', color: '#4B5563', applicableRateTypes: ['स्क्वायर फुट', 'दिहाड़ी', 'पैकेज ठेका'] },
  { id: 'labor', nameHindi: 'मजदूर/लेबर (Daily Wage)', nameEng: 'Labor', group: 'CONSTRUCTION', icon: 'account-hard-hat', color: '#D97706', applicableRateTypes: ['दिहाड़ी'] },
  { id: 'painter', nameHindi: 'पेंटर (Painter)', nameEng: 'Painter', group: 'CONSTRUCTION', icon: 'format-paint', color: '#7C3AED', applicableRateTypes: ['स्क्वायर फुट', 'दिहाड़ी', 'पैकेज ठेका'] },
  { id: 'electrician', nameHindi: 'इलेक्ट्रीशियन', nameEng: 'Electrician', group: 'CONSTRUCTION', icon: 'flash', color: '#EA580C', applicableRateTypes: ['प्रति पॉइंट', 'दिहाड़ी', 'पैकेज ठेका'] },
  { id: 'plumber', nameHindi: 'प्लंबर (Plumber)', nameEng: 'Plumber', group: 'CONSTRUCTION', icon: 'pipe', color: '#0284C7', applicableRateTypes: ['प्रति पॉइंट', 'पैकेज ठेका', 'दिहाड़ी'] },
  { id: 'welder', nameHindi: 'वेल्डर / फैब्रिकेटर', nameEng: 'Welder', group: 'CONSTRUCTION', icon: 'torch', color: '#334155', applicableRateTypes: ['स्क्वायर फुट', 'किलो वजन आधार'] },
  { id: 'tiling', nameHindi: 'टाइल्स & मार्बल फिक्सर', nameEng: 'Tiling', group: 'CONSTRUCTION', icon: 'view-grid', color: '#059669', applicableRateTypes: ['स्क्वायर फुट', 'दिहाड़ी'] },

  // Quick Repairs (Uber Style)
  { id: 'acrepair', nameHindi: 'AC रिपेयर & सर्विस', nameEng: 'AC Repair', group: 'QUICK_REPAIR', icon: 'air-conditioner', color: '#0284C7', applicableRateTypes: ['प्रति विजिट', 'पैकेज ठेका'] },
  { id: 'appliance', nameHindi: 'फ्रिज, वाशिंग मशीन रिपेयर', nameEng: 'Appliances', group: 'QUICK_REPAIR', icon: 'washing-machine', color: '#6366F1', applicableRateTypes: ['प्रति विजिट'] },
  { id: 'locksmith', nameHindi: 'ताला-चाबी (Locksmith)', nameEng: 'Locksmith', group: 'QUICK_REPAIR', icon: 'key-variant', color: '#CA8A04', applicableRateTypes: ['प्रति विजिट'] },

  // Wedding & Events
  { id: 'mandap', nameHindi: 'टेंट, मंडप & स्टेज', nameEng: 'Tent & Decor', group: 'WEDDING_EVENT', icon: 'tent', color: '#E11D48', applicableRateTypes: ['पैकेज ठेका'] },
  { id: 'catering', nameHindi: 'हलवाई & कैटरिंग टीम', nameEng: 'Catering', group: 'WEDDING_EVENT', icon: 'silverware-fork-knife', color: '#D97706', applicableRateTypes: ['प्रति व्यक्ति (Plate)', 'पैकेज ठेका'] },
  { id: 'photographer', nameHindi: 'वेडिंग फोटोग्राफर/DJ', nameEng: 'Photographer', group: 'WEDDING_EVENT', icon: 'camera', color: '#9333EA', applicableRateTypes: ['प्रति दिन पैकेज'] },
  { id: 'makeup', nameHindi: 'ब्राइडल मेकअप आर्टिस्ट', nameEng: 'Makeup Artist', group: 'WEDDING_EVENT', icon: 'face-woman-shimmer', color: '#DB2777', applicableRateTypes: ['प्रति ब्राइडल पैकेज'] },
  { id: 'band', nameHindi: 'शादी बैंड & घोड़ी बग्गी', nameEng: 'Wedding Band', group: 'WEDDING_EVENT', icon: 'trumpet', color: '#C026D3', applicableRateTypes: ['पैकेज ठेका'] },
];

// 2. QUICK REPAIR SERVICES (Uber / Rapido Style 15-30 min response)
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

// 4. RICH CONTRACTORS WITH LINKED SUPPLIER MATERIALS
export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'c1',
    name: 'रमेश शर्मा (मास्टर कारपेंटर)',
    category: 'carpenter',
    specialtyHindi: 'मॉड्यूलर किचन, वॉर्डरोब & बेड निर्माण',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    rating: 4.9,
    reviewsCount: 142,
    experienceYears: 12,
    jobsCompleted: 215,
    verified: true,
    distance: '1.2 km दूर',
    etaMinutes: 20,
    isQuickAvailable: true,
    primaryRateType: 'शीट/रनिंग फुट',
    dailyWageRate: 950,
    helperRate: 550,
    contractUnitRate: 350,
    unitLabel: 'प्रति 8x4 शीट कटिंग/मेकिंग',
    techniqueBadge: 'CNC कटिंग & 1mm मरीन माइका तकनीक',
    techniqueDetail: {
      method: 'सेंचुरी 19mm वॉटरप्रूफ प्लाई + 1mm लैमिनेट + फेविकोल मरीन + सॉफ्ट क्लोज हिंज',
      standardFormula: 'माप के अनुसार: ₹350 प्रति 8x4 शीट अथवा ₹400/sq.ft',
      tools: 'लेजर लेवलर, 4-इंच कटर, एज-बैंडिंग मशीन',
      warranty: '5 वर्ष हिंज & अलाइनमेंट वारंटी',
    },
    additionalRateCards: [
      { title: 'मॉड्यूलर किचन (रनिंग फुट)', rate: '₹1,200 / रनिंग ft' },
      { title: 'वॉर्डरोब स्लाइडिंग डोर', rate: '₹400 / sq.ft' },
      { title: 'दरवाजा फ्रेम व पल्ला फिटिंग', rate: '₹850 / दरवाजा' },
      { title: 'क्विक रिपेयर विजिट (लॉक/दराज)', rate: '₹250 / विजिट' },
    ],
    bio: '12 साल का अनुभव। खुद के आधुनिक कटर व लेजर टूल्स। फिनिशिंग और समय पर काम की पूरी गारंटी।',
    phoneMasked: '+91 98XXX-XX102',
    available: true,
    skills: ['Modular Kitchen', 'Wardrobe', 'CNC Fitting', 'Door Polish'],
    portfolioPhotos: [
      {
        id: 'p1',
        title: 'लक्ज़री ऐक्रेलिक मॉड्यूलर किचन',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
        date: 'अक्टूबर 2026',
        description: 'सॉफ्ट-क्लोज हाइड्रॉलिक हिंज और प्रोफाइल हैंडल के साथ 10x8 ft किचन।',
      },
      {
        id: 'p2',
        title: 'मास्टर बेडरूम वॉर्डरोब (स्लाइडिंग)',
        imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        date: 'सितम्बर 2026',
        description: 'सेंचुरी प्लाई और ग्लॉसी लैमिनेट के साथ 9 ft ऊंची वॉर्डरोब।',
      },
    ],
    videos: [
      {
        id: 'v1',
        title: 'मॉड्यूलर किचन साइट वॉकथ्रू & फिनिशिंग',
        thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400',
        duration: '1:45 min',
        date: '28 अक्टूबर 2026',
        type: 'WALKTHROUGH',
        author: 'रमेश शर्मा (कारीगर वीडियो)',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
      {
        id: 'v2',
        title: 'ग्राहक वीडियो समीक्षा: "शोरूम जैसी फिनिशिंग मिली"',
        thumbnail: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
        duration: '0:58 min',
        date: '2 नवम्बर 2026',
        type: 'CUSTOMER_TESTIMONIAL',
        author: 'अमित कुमार सिंह (सत्यापित ग्राहक)',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ],
    reviews: [
      {
        id: 'r1',
        customerName: 'अमित कुमार सिंह',
        rating: 5,
        date: '28 अक्टूबर 2026',
        comment: 'रमेश जी ने हमारे फ्लैट का पूरा मॉड्यूलर किचन बनाया। फिनिशिंग शोरूम जैसी है और सामान भी सही रेट पर दिलवाया।',
        workDone: 'मॉड्यूलर किचन & वॉर्डरोब',
        location: 'अरेरा कॉलोनी, भोपाल',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm1',
        name: 'सेंचुरी 19mm वॉटरप्रूफ प्लाईवुड (8x4 ft)',
        brand: 'Century Ply',
        category: 'carpenter',
        mrp: 3200,
        sellingPrice: 2750,
        unit: 'प्रति शीट',
        bulkOffer: '10 शीट पर 5% छूट',
        storeName: 'अग्रवाल टिम्बर स्टोर (1.1 km)',
        storeDistance: '1.1 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=150',
      },
      {
        id: 'rm2',
        name: 'फेविकोल मरीन वाटरप्रूफ (5 Kg)',
        brand: 'Pidilite Fevicol',
        category: 'carpenter',
        mrp: 1450,
        sellingPrice: 1220,
        unit: 'प्रति डिब्बा',
        bulkOffer: 'फ्री फेविकोल ट्यूब',
        storeName: 'गुप्ता हार्डवेयर (0.8 km)',
        storeDistance: '0.8 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150',
      },
    ],
  },
  {
    id: 'c5',
    name: 'अजय राठौर (प्लंबिंग & लीकेज स्पेशलिस्ट)',
    category: 'plumber',
    specialtyHindi: 'बाथरूम फिटिंग, इमरजेंसी लीकेज & टैंक फिटिंग',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    rating: 4.8,
    reviewsCount: 112,
    experienceYears: 7,
    jobsCompleted: 165,
    verified: true,
    distance: '0.8 km दूर',
    etaMinutes: 15,
    isQuickAvailable: true, // Quick service ready!
    primaryRateType: 'प्रति विजिट',
    dailyWageRate: 850,
    helperRate: 500,
    contractUnitRate: 4200,
    unitLabel: 'प्रति बाथरूम फुल फिटिंग पैकेज',
    techniqueBadge: 'CPVC सॉल्वेंट वेल्डिंग & 10-Bar प्रेशर टेस्ट',
    techniqueDetail: {
      method: 'सुप्रीम/एस्ट्रल CPVC पाइप्स + सॉल्वेंट सीमेंट + प्रेशर टेस्टिंग (शून्य लीकेज)',
      standardFormula: 'प्रति पॉइंट: ₹180/पॉइंट | डायग्नोसिस: ₹199 मानक',
      tools: 'हाइड्रोस्टेटिक प्रेशर पंप, पाइप थ्रेडर',
      warranty: '1 वर्ष लीकेज-फ्री गारंटी',
    },
    additionalRateCards: [
      { title: 'क्विक लीकेज रिपेयर विजिट', rate: '₹199 / विजिट' },
      { title: 'कंसील्ड CPVC पाइप लाइन', rate: '₹40 / रनिंग ft' },
      { title: '1000L वाटर टैंक इंस्टॉलेशन', rate: '₹1,200 / यूनिट' },
    ],
    bio: 'आधुनिक प्लंबिंग उपकरण। 15-20 मिनट में इमरजेंसी लीकेज रिपेयर उपलब्ध।',
    phoneMasked: '+91 88XXX-XX901',
    available: true,
    skills: ['Leakage Fix', 'CPVC Piping', 'Water Tank', 'Sanitary Fitting'],
    portfolioPhotos: [
      {
        id: 'p5_1',
        title: 'मॉडर्न लग्जरी बाथरूम सेनेटरी फिटिंग',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
        date: 'अक्टूबर 2026',
        description: 'डाइवर्टर, वॉल-हंग कमोड और शावर पार्टीशन।',
      },
    ],
    videos: [
      {
        id: 'v_plumb1',
        title: 'कंसील्ड डाइवर्टर प्रेशर टेस्टिंग वीडियो',
        thumbnail: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
        duration: '1:10 min',
        date: '15 अक्टूबर 2026',
        type: 'WALKTHROUGH',
        author: 'अजय राठौर (प्लंबर वॉकथ्रू)',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
      {
        id: 'v_plumb2',
        title: 'ग्राहक वीडियो रिव्यू: "15 मिनट में इमरजेंसी लीकेज ठीक किया"',
        thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
        duration: '0:45 min',
        date: '18 अक्टूबर 2026',
        type: 'CUSTOMER_TESTIMONIAL',
        author: 'संजय तिवारी (अशोक नगर)',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ],
    reviews: [
      {
        id: 'r5_1',
        customerName: 'संजय तिवारी',
        rating: 5,
        date: '12 अक्टूबर 2026',
        comment: 'रात को अचानक पाइप फट गया था, अजय भाई 15 मिनट में पहुंचे और ठीक कर दिया।',
        workDone: 'इमरजेंसी पाइप लीकेज फिक्स',
        location: 'अशोक नगर',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_plumb1',
        name: 'सुप्रीम CPVC 1 इंच पाइप बंडल (10 पीस)',
        brand: 'Supreme Pipes',
        category: 'plumber',
        mrp: 3800,
        sellingPrice: 3100,
        unit: 'प्रति बंडल',
        bulkOffer: 'सॉल्वेंट सीमेंट फ्री',
        storeName: 'गुप्ता हार्डवेयर & सेनेटरी',
        storeDistance: '0.8 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150',
      },
    ],
  },
  {
    id: 'c4',
    name: 'विजय यादव (सीनियर इलेक्ट्रीशियन)',
    category: 'electrician',
    specialtyHindi: 'कंसील्ड वायरिंग, शॉर्ट सर्किट & MCB रिपेयर',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 4.9,
    reviewsCount: 95,
    experienceYears: 9,
    jobsCompleted: 180,
    verified: true,
    distance: '0.9 km दूर',
    etaMinutes: 18,
    isQuickAvailable: true,
    primaryRateType: 'प्रति पॉइंट',
    dailyWageRate: 800,
    helperRate: 450,
    contractUnitRate: 140,
    unitLabel: 'प्रति स्विच बोर्ड/प्वाइंट',
    techniqueBadge: 'कंसील्ड वॉल कटिंग & लोड-बैलेंसिंग तकनीक',
    techniqueDetail: {
      method: 'डस्ट-फ्री वॉल चेज़र + हैवेल्स FR-LSH वायर + MCB लोड बैलेंसिंग',
      standardFormula: 'प्रति स्विचबोर्ड पॉइंट: ₹140 | MCB बॉक्स: ₹650',
      tools: 'लेजर वॉल चेज़र, 1000V इंसुलेटेड किट',
      warranty: 'शॉर्ट-सर्किट फ्री इंस्टॉलेशन',
    },
    additionalRateCards: [
      { title: 'इमरजेंसी फॉल्ट चेक & रिपेयर', rate: '₹199 / विजिट' },
      { title: 'MCB बॉक्स & अर्थिंग सेटअप', rate: '₹1,500 / सेट' },
    ],
    bio: 'शॉर्ट-सर्किट से बचाव व सुरक्षित वायरिंग। 24x7 इमरजेंसी सर्विस उपलब्ध।',
    phoneMasked: '+91 91XXX-XX550',
    available: true,
    skills: ['Concealed Wiring', 'Appliance Repair', 'Earthing', 'Solar Setup'],
    portfolioPhotos: [
      {
        id: 'p4_1',
        title: 'मॉड्यूलर MCB डिस्ट्रीब्यूशन पैनल',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
        date: 'अक्टूबर 2026',
        description: '8-वे MCB और कॉपर अर्थिंग वायरिंग।',
      },
    ],
    reviews: [
      {
        id: 'r4_1',
        customerName: 'गौरव मल्होत्रा',
        rating: 5,
        date: '25 अक्टूबर 2026',
        comment: 'MCB बार-बार गिर रही थी, 15 मिनट में आकर अर्थिंग फॉल्ट ठीक किया।',
        workDone: 'MCB फॉल्ट रिपेयर',
        location: 'काकादेव',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_elec1',
        name: 'हैवेल्स लाइफलाइन 1.5 sq mm वायर (90m)',
        brand: 'Havells',
        category: 'electrician',
        mrp: 2450,
        sellingPrice: 1980,
        unit: 'प्रति रोल',
        bulkOffer: '3 रोल पर 1 टेस्टर फ्री',
        storeName: 'शर्मा इलेक्ट्रिकल्स',
        storeDistance: '1.0 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150',
      },
    ],
  },
  {
    id: 'c7',
    name: 'इमरान कुरैशी (AC कूलिंग & गैस एक्सपर्ट)',
    category: 'acrepair',
    specialtyHindi: 'स्प्लिट/विंडो AC सर्विस, गैस चार्जिंग & रिपेयर',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    rating: 4.8,
    reviewsCount: 78,
    experienceYears: 6,
    jobsCompleted: 140,
    verified: true,
    distance: '1.4 km दूर',
    etaMinutes: 25,
    isQuickAvailable: true,
    primaryRateType: 'प्रति विजिट',
    dailyWageRate: 900,
    helperRate: 450,
    contractUnitRate: 399,
    unitLabel: 'प्रति जेट पंप डीप सर्विस',
    additionalRateCards: [
      { title: 'जेट पंप वॉटर डीप सर्विस', rate: '₹399 / AC' },
      { title: 'AC गैस टॉप-अप / फुल चार्जिंग', rate: '₹1,800 / यूनिट' },
      { title: 'AC अनइंस्टॉलेशन + री-इंस्टॉल', rate: '₹1,200 / यूनिट' },
    ],
    bio: 'सभी ब्रांड्स (Daikin, Voltas, LG, Hitachi) के एक्सपर्ट। जेट पंप से 100% कूलिंग सर्विस।',
    phoneMasked: '+91 93XXX-XX711',
    available: true,
    skills: ['Jet Wash', 'Gas Charging', 'PCB Repair', 'Installation'],
    portfolioPhotos: [
      {
        id: 'p7_1',
        title: 'जेट पंप वाटर डीप क्लीनिंग',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
        date: 'मई 2026',
        description: 'कूलिंग कॉइल और ब्लोअर की पूरी सर्विस।',
      },
    ],
    reviews: [
      {
        id: 'r7_1',
        customerName: 'अंशुमान जोशी',
        rating: 5,
        date: '20 अक्टूबर 2026',
        comment: 'AC में कूलिंग बिल्कुल खत्म हो गई थी, इमरान जी ने तुरंत गैस लीक ढूंढकर भर दी। 10/10!',
        workDone: 'AC गैस लीकेज फिक्स & सर्विस',
        location: 'लाजपत नगर',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_ac1',
        name: 'फ्लोरो R32 इको-फ्रेंडली AC रेफ्रिजरेंट गैस (3 Kg)',
        brand: 'Floron',
        category: 'acrepair',
        mrp: 2600,
        sellingPrice: 2150,
        unit: 'प्रति कैन',
        bulkOffer: 'फ्री गेज चेकर',
        storeName: 'कूलटेक एयरकॉन सप्लायर्स',
        storeDistance: '1.4 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150',
      },
    ],
  },
  {
    id: 'c8',
    name: 'प्रिया शर्मा (ब्राइडल मेकअप आर्टिस्ट)',
    category: 'makeup',
    specialtyHindi: 'HD ब्राइडल मेकअप, प्री-वेडिंग लुक & हेयर स्टाइलिंग',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 4.9,
    reviewsCount: 84,
    experienceYears: 8,
    jobsCompleted: 115,
    verified: true,
    distance: '2.1 km दूर',
    etaMinutes: 30,
    isQuickAvailable: false,
    primaryRateType: 'पैकेज ठेका',
    dailyWageRate: 2500,
    helperRate: 800,
    contractUnitRate: 12000,
    unitLabel: 'प्रति ब्राइडल HD मेकअप पैकेज',
    additionalRateCards: [
      { title: 'एयरब्रश ब्राइडल मेकअप', rate: '₹18,000 / पैकेज' },
      { title: 'सगाई / रिसेप्शन लुक', rate: '₹6,500 / सिटिंग' },
      { title: 'पार्टी मेकअप (प्रति व्यक्ति)', rate: '₹2,200 / पर्सन' },
    ],
    bio: 'लक्ज़री ब्राइडल स्टूडियो। MAC, Huda Beauty, NARS के 100% ओरिजिनल इंटरनेशनल प्रोडक्ट्स।',
    phoneMasked: '+91 96XXX-XX980',
    available: true,
    skills: ['HD Bridal Makeup', 'Airbrush', 'Hair Styling', 'Draping'],
    portfolioPhotos: [
      {
        id: 'p8_1',
        title: 'रॉयल रेड बनारसी ब्राइडल लुक',
        imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600',
        date: 'नवम्बर 2026',
        description: 'सॉफ्ट ग्लैम HD मेकअप और फ्लोरल जूड़ा हेयरस्टाइल।',
      },
    ],
    reviews: [
      {
        id: 'r8_1',
        customerName: 'नेहा कपूर',
        rating: 5,
        date: '02 नवम्बर 2026',
        comment: 'मेरी शादी का मेकअप इतना नेचुरल और खूबसूरत था कि सब तारीफ कर रहे थे। 12 घंटे तक टिका रहा!',
        workDone: 'ब्राइडल HD मेकअप & हेयर स्टाइल',
        location: 'स्वरूप नगर',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_mu1',
        name: 'लक्ज़री ब्राइडल स्किनकेयर & प्राइमर किट',
        brand: 'MAC Studio',
        category: 'makeup',
        mrp: 4500,
        sellingPrice: 3800,
        unit: 'प्रति किट',
        bulkOffer: 'फ्री मेकअप फिक्सर स्प्रे',
        storeName: 'ग्लो ब्यूटी कॉस्मेटिक्स',
        storeDistance: '1.2 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150',
      },
    ],
  },
  {
    id: 'c9',
    name: 'रॉयल कैटरर्स & हलवाई संघ',
    category: 'catering',
    specialtyHindi: 'शुद्ध शाकाहारी खाना, 50+ डिशेस बुफे & वेटर टीम',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
    rating: 4.8,
    reviewsCount: 71,
    experienceYears: 15,
    jobsCompleted: 190,
    verified: true,
    distance: '3.0 km दूर',
    etaMinutes: 45,
    isQuickAvailable: false,
    primaryRateType: 'पैकेज ठेका',
    dailyWageRate: 1800,
    helperRate: 650,
    contractUnitRate: 450,
    unitLabel: 'प्रति प्लेट (संपूर्ण 42 आइटम्स मेन्यू)',
    additionalRateCards: [
      { title: 'रॉयल वेडिंग बुफे (प्रति प्लेट)', rate: '₹650 / प्लेट' },
      { title: 'चाट, गोलगप्पे & लाइव स्टॉल', rate: '₹120 / प्लेट' },
      { title: 'हलवाई लेबर केवल (500 लोग)', rate: '₹35,000 / इवेंट' },
    ],
    bio: 'शुद्ध देसी घी की मिठाइयां और हाइजीनिक लाइव किचन। 30 प्रशिक्षित वेटर स्टाफ।',
    phoneMasked: '+91 95XXX-XX220',
    available: true,
    skills: ['Halwai Team', 'Live Chaat', 'Italian & Chinese', 'Uniformed Waiters'],
    portfolioPhotos: [
      {
        id: 'p9_1',
        title: 'रॉयल वेडिंग बुफे & लाइव काउंटर सेटअप',
        imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
        date: 'अक्टूबर 2026',
        description: 'कॉपर चाफिंग डिश और फ्रेश फ्लावर बुफे प्रेजेंटेशन।',
      },
    ],
    reviews: [
      {
        id: 'r9_1',
        customerName: 'राजीव सिंघानिया',
        rating: 5,
        date: '24 अक्टूबर 2026',
        comment: 'खाने का स्वाद अद्भुत था, खास तौर पर दाल मखनी और रसमलाई। सभी मेहमान संतुष्ट थे।',
        workDone: '600 मेहमानों का वेडिंग डिनर',
        location: 'विष्णुपुरी',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_cat1',
        name: 'अमूल शुद्ध देसी घी (15 Kg टिन)',
        brand: 'Amul Dairy',
        category: 'catering',
        mrp: 9400,
        sellingPrice: 8750,
        unit: 'प्रति टिन',
        bulkOffer: '5 टिन पर ₹200 प्रति टिन छूट',
        storeName: 'महावीर किराना & होलसेल मर्चेंट',
        storeDistance: '2.0 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150',
      },
    ],
  },
  {
    id: 'c10',
    name: 'रोहित सिनेमैटिक्स (वेडिंग फोटोग्राफी)',
    category: 'photographer',
    specialtyHindi: 'कैंडिड फोटोग्राफी, 4K ड्रोन & सिनेमैटिक टीज़र',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4.9,
    reviewsCount: 52,
    experienceYears: 7,
    jobsCompleted: 98,
    verified: true,
    distance: '1.8 km दूर',
    etaMinutes: 30,
    isQuickAvailable: false,
    primaryRateType: 'पैकेज ठेका',
    dailyWageRate: 3500,
    helperRate: 1000,
    contractUnitRate: 45000,
    unitLabel: 'प्रति 2-दिवसीय संपूर्ण वेडिंग कवरेज',
    additionalRateCards: [
      { title: '4K सिनेमैटिक ड्रोन कवरेज', rate: '₹12,000 / दिन' },
      { title: 'प्री-वेडिंग शूट (लोकेशन सहित)', rate: '₹22,000 / शूट' },
      { title: 'प्रीमियम लेदर फोटो एल्बम', rate: '₹8,500 / एल्बम' },
    ],
    bio: 'सोनी FX3 सिनेमा कैमरे और DJI ड्रोन के साथ बॉलीवुड स्टाइल वेडिंग वीडियो।',
    phoneMasked: '+91 97XXX-XX331',
    available: true,
    skills: ['Candid Photo', '4K Drone', 'Cinematic Video', 'Album Design'],
    portfolioPhotos: [
      {
        id: 'p10_1',
        title: 'सिनेमैटिक जयमाला ड्रोन शॉट',
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
        date: 'अक्टूबर 2026',
        description: 'कोल्ड पायरो फायरवर्क के साथ 4K स्लो-मोशन फ्रेम।',
      },
    ],
    reviews: [
      {
        id: 'r10_1',
        customerName: 'सिद्धार्थ वर्मा',
        rating: 5,
        date: '28 अक्टूबर 2026',
        comment: 'टीज़र इतना शानदार बनाया कि हमारे सारे रिश्तेदारों ने स्टेटस पर लगाया। रोहित बहुत टैलेंटेड हैं।',
        workDone: '2 दिन का वेडिंग & रिसेप्शन शूट',
        location: 'इन्दिरा नगर',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_photo1',
        name: 'इटैलियन प्रीमियम मैटेलिक फोटो पेपर (250 GSM)',
        brand: 'Kodak Professional',
        category: 'photographer',
        mrp: 3500,
        sellingPrice: 2900,
        unit: 'प्रति 100 शीट्स',
        bulkOffer: 'फ्री लेमिनेशन फिल्म',
        storeName: 'अपेक्स फोटो सप्लायर्स',
        storeDistance: '1.5 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150',
      },
    ],
  },
  {
    id: 'c2',
    name: 'सोनू वर्मा (कलर & वाटरप्रूफिंग एक्सपर्ट)',
    category: 'painter',
    specialtyHindi: 'रॉयल लक्ज़री पेंट, पुट्टी & वाटरप्रूफिंग',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.8,
    reviewsCount: 89,
    experienceYears: 8,
    jobsCompleted: 130,
    verified: true,
    distance: '2.5 km दूर',
    etaMinutes: 35,
    isQuickAvailable: false,
    primaryRateType: 'स्क्वायर फुट',
    dailyWageRate: 850,
    helperRate: 500,
    contractUnitRate: 16,
    unitLabel: 'प्रति sq.ft (पुट्टी + 2 कोट)',
    techniqueBadge: '2-कोट बिरला पुट्टी + रॉयल रोलर स्मूथ तकनीक',
    techniqueDetail: {
      method: 'एमरी 180 सैंडिंग + 2-कोट वाटरप्रूफ पुट्टी + प्राइमर + 2-कोट रॉयल इमल्शन',
      standardFormula: '₹16-₹22 प्रति sq.ft (दीवार के वास्तविक माप अनुसार)',
      tools: 'मशीन सैंडर, माइक्रोफाइबर रोलर',
      warranty: '3 वर्ष नो-पीलिंग वारंटी',
    },
    additionalRateCards: [
      { title: 'रॉयल लक्ज़री शाइन पेंट', rate: '₹22 / sq.ft' },
      { title: 'टेक्सचर डिज़ाइन वॉल', rate: '₹45 / sq.ft' },
      { title: 'छत वाटरप्रूफिंग कोटिंग', rate: '₹28 / sq.ft' },
    ],
    bio: 'एशियन पेंट्स सर्टिफाइड पेंटर। साफ-सुथरा काम, बिना किसी दाग-धब्बे के।',
    phoneMasked: '+91 94XXX-XX334',
    available: true,
    skills: ['Wall Putty', 'Texture Design', 'Waterproofing', 'Spray Paint'],
    portfolioPhotos: [
      {
        id: 'p2_1',
        title: 'रॉयल प्ले टेक्सचर एक्सेंट वॉल',
        imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600',
        date: 'अक्टूबर 2026',
        description: 'ड्राइंग रूम में गोल्डन मेटैलिक टेक्सचर फिनिश।',
      },
    ],
    reviews: [
      {
        id: 'r2_1',
        customerName: 'विकास बाजपेयी',
        rating: 5,
        date: '20 अक्टूबर 2026',
        comment: 'सोनू की टीम ने पेंट करने से पहले सारा फर्नीचर कवर किया। बहुत साफ काम किया।',
        workDone: 'फुल हाउस पेंटिंग (2BHK)',
        location: 'कल्याणपुर',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_paint1',
        name: 'एशियन पेंट्स अपोलो रॉयल लक्ज़री इमल्शन (20L)',
        brand: 'Asian Paints',
        category: 'painter',
        mrp: 8200,
        sellingPrice: 7100,
        unit: 'प्रति बाल्टी',
        bulkOffer: '1 रोलर किट फ्री',
        storeName: 'रंग महल पेंट्स (1.5 km)',
        storeDistance: '1.5 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150',
      },
      {
        id: 'rm_paint2',
        name: 'बिड़ला व्हाइट वॉल केयर पुट्टी (40 Kg बैग)',
        brand: 'Birla White',
        category: 'painter',
        mrp: 980,
        sellingPrice: 850,
        unit: 'प्रति बैग',
        bulkOffer: '5 बैग पर फ्री डिलीवरी',
        storeName: 'रंग महल पेंट्स (1.5 km)',
        storeDistance: '1.5 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150',
      },
    ],
  },
  {
    id: 'c3',
    name: 'मोहम्मद आरिफ़ (राजमिस्त्री & कंक्रीट ठेकेदार)',
    category: 'mason',
    specialtyHindi: 'मकान निर्माण, नींव चिनाई, आरसीसी छत & टाइल्स',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4.7,
    reviewsCount: 178,
    experienceYears: 16,
    jobsCompleted: 310,
    verified: true,
    distance: '3.2 km दूर',
    etaMinutes: 40,
    isQuickAvailable: false,
    primaryRateType: 'स्क्वायर फुट',
    dailyWageRate: 1050,
    helperRate: 600,
    contractUnitRate: 28,
    unitLabel: 'प्रति sq.ft (विट्रिफाइड टाइल्स)',
    techniqueBadge: '1:4 साहुल चिनाई & लेजर टाइल्स लेवल तकनीक',
    techniqueDetail: {
      method: 'अव्वल लाल ईंट + 1:4 सीमेंट मसाला + 4x2 विट्रिफाइड स्पेसर तकनीक',
      standardFormula: '₹28/sq.ft (टाइल्स) | ₹22/sq.ft (चिनाई) - माप आधारित',
      tools: 'मैग्नेटिक लेजर लेवल, 2mm टाइल स्पेसर',
      warranty: 'शून्य-जॉइंट क्रैक वारंटी',
    },
    additionalRateCards: [
      { title: 'दीवार प्लास्टर (दोनो तरफ)', rate: '₹14 / sq.ft' },
      { title: 'मार्बल घिसाई व फिटिंग', rate: '₹38 / sq.ft' },
      { title: 'ईंट चिनाई (9 इंच दीवार)', rate: '₹22 / sq.ft' },
    ],
    bio: '10 लोगों की कुशल लेबर टीम। नींव से लेकर छत तक का ठेका व दिहाड़ी काम उपलब्ध।',
    phoneMasked: '+91 97XXX-XX871',
    available: false,
    skills: ['Brick Laying', 'Tiles/Marble', 'Plaster', 'RCC Roof'],
    portfolioPhotos: [
      {
        id: 'p3_1',
        title: 'लिविंग रूम इटैलियन मार्बल फिटिंग',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
        date: 'सितम्बर 2026',
        description: 'ज़ीरो-जॉइंट 4x2 विट्रिफाइड टाइल्स और वॉटरप्रूफ ग्राउट।',
      },
    ],
    reviews: [
      {
        id: 'r3_1',
        customerName: 'दीपक चौरसिया',
        rating: 4.8,
        date: '10 सितम्बर 2026',
        comment: 'टाइल्स का लेवल बिल्कुल सीधा है। आरिफ भाई को 15+ साल का गहरा तजुर्बा है।',
        workDone: 'ड्राइंग और दोनों बेडरूम में फ्लोरिंग',
        location: 'श्याम नगर',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_mason1',
        name: 'ACC सुरक्षा पावर सीमेंट (50 Kg)',
        brand: 'ACC Cement',
        category: 'mason',
        mrp: 410,
        sellingPrice: 375,
        unit: 'प्रति बोरी',
        bulkOffer: '50 बोरी पर ₹15/बोरी फ्लैट छूट',
        storeName: 'किसान बिल्डिंग मैटेरियल सप्लायर',
        storeDistance: '2.0 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150',
      },
    ],
  },
  {
    id: 'c6',
    name: 'राज टेंट & डेकोरेटर्स (वेडिंग मंडप कॉन्ट्रैक्टर)',
    category: 'mandap',
    specialtyHindi: 'वाटरप्रूफ जर्मन हैंगर, मंडप, स्टेज & लाइट',
    avatar: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=150',
    rating: 4.9,
    reviewsCount: 64,
    experienceYears: 14,
    jobsCompleted: 110,
    verified: true,
    distance: '4.0 km दूर',
    etaMinutes: 50,
    isQuickAvailable: false,
    primaryRateType: 'पैकेज ठेका',
    dailyWageRate: 1500,
    helperRate: 650,
    contractUnitRate: 38000,
    unitLabel: 'प्रति 300-400 मेहमान संपूर्ण पैकेज',
    additionalRateCards: [
      { title: 'भव्य जयमाला स्टेज (फ्लोरल)', rate: '₹15,000 / स्टेज' },
      { title: 'एंट्री टनल & वॉकवे लाइटिंग', rate: '₹8,000 / गेट' },
      { title: 'साउंड & डीजे सेटअप (8 घंटे)', rate: '₹12,000 / नाइट' },
    ],
    bio: 'शादी, सगाई, बर्थडे और सभी आयोजनों का संपूर्ण ठेका। हलवाई टीम भी उपलब्ध।',
    phoneMasked: '+91 99XXX-XX412',
    available: true,
    skills: ['Stage Decor', 'Sound System', 'Waterproof Tent', 'Catering Staff'],
    portfolioPhotos: [
      {
        id: 'p6_1',
        title: 'रॉयल पैलेस वेडिंग थीम डेकोरेशन',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        date: 'अक्टूबर 2026',
        description: '500 मेहमानों का वाटरप्रूफ जर्मन हैंगर टेंट और स्टेज।',
      },
    ],
    reviews: [
      {
        id: 'r6_1',
        customerName: 'मनीष अग्रवाल',
        rating: 5,
        date: '04 नवम्बर 2026',
        comment: 'मेरी बहन की शादी का पूरा टेंट और डेकोरेशन बहुत भव्य किया। मेहमान बहुत खुश हुए!',
        workDone: 'वेडिंग टेंट, लाइटिंग & स्टेज',
        location: 'गंगा बैराज रोड',
        verifiedWork: true,
      },
    ],
    recommendedMaterials: [
      {
        id: 'rm_event1',
        name: 'प्रीमियम रेड कार्पेट & वाटरप्रूफ टेंट फैब्रिक (1000 sq.ft)',
        brand: 'DecorPro',
        category: 'mandap',
        mrp: 12000,
        sellingPrice: 9800,
        unit: 'प्रति रोल',
        bulkOffer: 'फ्री इंस्टॉलेशन क्लिप्स',
        storeName: 'भोपाल टेंट & फैब्रिक हाउस',
        storeDistance: '2.5 km',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150',
      },
    ],
  },
];

// Vendor Store Catalogs (Strict Isolation: Hardware vs Makeup vs Catering)
export const INITIAL_MATERIALS: MaterialItem[] = [
  // 1. गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर (Vendor v1)
  {
    id: 'mat_h1',
    vendorId: 'v1',
    name: 'सुप्रीम CPVC 1 इंच पाइप बंडल (10 पीस)',
    brand: 'Supreme Pipes',
    category: 'plumber',
    mrp: 3800,
    sellingPrice: 3100,
    unit: 'प्रति बंडल',
    bulkOffer: '5 बंडल पर 5% अतिरिक्त छूट',
    storeName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
    storeDistance: '0.8 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150',
  },
  {
    id: 'mat_h2',
    vendorId: 'v1',
    name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm (8x4)',
    brand: 'CenturyPly',
    category: 'carpenter',
    mrp: 2950,
    sellingPrice: 2400,
    unit: 'प्रति शीट',
    bulkOffer: '10 शीट पर फ्री डिलीवरी',
    storeName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
    storeDistance: '0.8 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=150',
  },
  {
    id: 'mat_h3',
    vendorId: 'v1',
    name: 'बिरला वाइट वॉलकेयर पुट्टी (40 Kg)',
    brand: 'Birla White',
    category: 'painter',
    mrp: 1050,
    sellingPrice: 850,
    unit: 'प्रति बैग',
    bulkOffer: '5 बैग पर ₹150 छूट',
    storeName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
    storeDistance: '0.8 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150',
  },
  {
    id: 'mat_h4',
    vendorId: 'v1',
    name: 'Roff T02 टाइल एडहेसिव केमिकल (20 Kg)',
    brand: 'Pidilite Roff',
    category: 'mason',
    mrp: 460,
    sellingPrice: 380,
    unit: 'प्रति बैग',
    bulkOffer: '10 बैग पर फ्री ग्राउट',
    storeName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
    storeDistance: '0.8 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=150',
  },
  {
    id: 'mat_h5',
    vendorId: 'v1',
    name: 'फिनोलेक्स 2.5 sq.mm FR-LSH कॉपर वायर',
    brand: 'Finolex',
    category: 'electrician',
    mrp: 1450,
    sellingPrice: 1200,
    unit: 'प्रति बंडल (90m)',
    bulkOffer: '3 बंडल पर 5% छूट',
    storeName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
    storeDistance: '0.8 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150',
  },

  // 2. रानी ब्राइडल मेकअप स्टूडियो & ब्यूटी स्टोर, अरेरा कॉलोनी (Vendor v2)
  {
    id: 'mat_m1',
    vendorId: 'v2',
    name: 'Kryolan & MAC प्रोफेशनल HD ब्राइडल मेकअप किट',
    brand: 'Kryolan / MAC',
    category: 'wedding_makeup',
    mrp: 5800,
    sellingPrice: 4500,
    unit: 'प्रति किट',
    bulkOffer: 'ब्राइडल पैकेज के साथ कॉम्प्लिमेंटरी फिक्सर',
    storeName: 'रानी ब्राइडल स्टूडियो, अरेरा कॉलोनी',
    storeDistance: '1.5 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
  },
  {
    id: 'mat_m2',
    vendorId: 'v2',
    name: 'ऑर्गेनिक डार्क-स्टेन ब्राइडल मेहंदी कोन्स (12 पीस बॉक्स)',
    brand: 'Sojat Organic',
    category: 'wedding_makeup',
    mrp: 480,
    sellingPrice: 360,
    unit: 'प्रति बॉक्स',
    bulkOffer: '2 बॉक्स पर ₹50 छूट',
    storeName: 'रानी ब्राइडल स्टूडियो, अरेरा कॉलोनी',
    storeDistance: '1.5 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150',
  },

  // 3. भोपाल कैटरर्स & शुद्ध मिष्ठान भंडार, न्यू मार्केट (Vendor v3)
  {
    id: 'mat_c1',
    vendorId: 'v3',
    name: 'शुद्ध देशी गाय का दानेदार घी (5 लीटर टीन)',
    brand: 'Sanchi / Amul',
    category: 'wedding_catering',
    mrp: 3600,
    sellingPrice: 3200,
    unit: 'प्रति 5L टीन',
    bulkOffer: '10 टीन पर थोक भाव',
    storeName: 'भोपाल कैटरर्स & प्रोविजन्स, न्यू मार्केट',
    storeDistance: '2.2 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=150',
  },
  {
    id: 'mat_c2',
    vendorId: 'v3',
    name: 'दावत रॉयल बासमती प्रीमियम राइस (25 Kg बैग)',
    brand: 'Daawat',
    category: 'wedding_catering',
    mrp: 3100,
    sellingPrice: 2750,
    unit: 'प्रति बैग',
    bulkOffer: '5 बैग पर फ्री डिलीवरी',
    storeName: 'भोपाल कैटरर्स & प्रोविजन्स, न्यू मार्केट',
    storeDistance: '2.2 km',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150',
  },
];

export const INITIAL_JOB_REQUESTS: JobRequest[] = [
  {
    id: 'jr1',
    contractorId: 'c1', // Directed specifically to Ramesh Sharma (Carpenter)
    category: 'carpenter',
    customerName: 'अमित कुमार सिंह',
    workType: 'मास्टर बेडरूम वॉर्डरोब (8x7 ft)',
    location: 'अरेरा कॉलोनी (E-3), भोपाल',
    date: '16 नवम्बर 2026',
    hiringType: 'ठेका',
    budgetOffer: 18000,
    description: '8x7 ft की स्लाइडिंग वॉर्डरोब बनानी है। 3 दिन में काम चाहिए।',
    status: 'PENDING',
  },
  {
    id: 'jr2',
    contractorId: 'c5', // Directed specifically to Ajay (AC/Plumbing Specialist) - NOT Ramesh!
    category: 'ac_repair',
    customerName: 'सुनीता त्रिपाठी',
    workType: 'AC में पानी टपक रहा है (इमरजेंसी)',
    location: 'ग्रीन पार्क अपार्टमेंट्स',
    date: 'आज अभी',
    hiringType: 'प्रति विजिट',
    budgetOffer: 349,
    description: 'लिविंग रूम का 1.5 टन डाइकिन स्प्लिट AC पानी फेंक रहा है।',
    status: 'PENDING',
  },
];
