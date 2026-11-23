export type Language = 'hi' | 'en' | 'hinglish';

export const TRANSLATIONS = {
  hi: {
    // Header & Brand
    appName: 'SETU',
    tagline: 'कारीगर • सामग्री • ठेका (भोपाल)',
    workWithUs: 'पार्टनर बनें',
    quickSos: 'SETU Quick ⚡',
    searchPlaceholder: 'प्लंबर, बढ़ई, पेंटर, AC सर्विस, शादी टेंट खोजें...',
    pointsLabel: 'रिवॉर्ड सिक्के',
    loginRegister: 'लॉगिन / रजिस्टर',

    // Needs Selector
    needTitle: 'आज आपको क्या सेवा चाहिए?',
    needSub: 'अपनी जरूरत चुनें, हम सही कारीगर और दुकान दिखाएंगे',
    needAll: 'सभी सेवाएं',
    needQuick: 'क्विक रिपेयर ⚡',
    needQuickSub: '15-30 मिनट में',
    needConstruction: 'घर निर्माण 🏗️',
    needConstructionSub: 'मिस्त्री, बढ़ई, पेंटर',
    needWedding: 'शादी & इवेंट्स 🎉',
    needWeddingSub: 'टेंट, हलवाई, DJ',
    needMaterials: 'सामग्री कॉम्बो 🧱',
    needMaterialsSub: 'सीमेंट, प्लाई, सेनेटरी',

    // Rate Filters
    allRates: 'सभी दरें',
    dailyRate: 'दिहाड़ी (Shift)',
    contractRate: 'ठेका (Sq.ft/Unit)',
    quickAvailable: 'अभी उपलब्ध 🟢',

    // AI Ustad Live Doctor & 3D Studio
    aiHeroLive: 'LIVE AI उस्ताद वीडियो कॉल',
    aiHeroFree: '100% फ्री परामर्श',
    aiHeroTitle: 'कैमरे पर समस्या दिखाएं, AI उस्ताद लाइव रेट व सामान बताएगा!',
    aiHeroSub: 'नल टपकना, सीलन, या 3D किचन डिज़ाइन • तुरंत समाधान व भोपाल का मानक रेट',
    aiScanBtn: 'फ्री वीडियो स्कैन शुरू करें ➔',
    ai3dStudioBtn: '3D किचन डिज़ाइन',
    aiDoctorTitle: 'AI उस्ताद 📹',
    aiDoctorSub: 'लाइव वीडियो समाधान',

    // Cards
    nearbyTitle: 'आपके पास सत्यापित कुशल कारीगर',
    nearbySub: 'सत्यापित आधार KYC • असली काम की फोटो • 100% एस्क्रो सुरक्षा',
    verifiedBadge: 'सत्यापित',
    reviewsText: 'समीक्षाएं',
    awayText: 'दूर',
    etaText: 'पहुंच समय',
    dailyWage: 'दिहाड़ी दर',
    contractWage: 'ठेका दर',
    photosCount: 'काम की फोटो',
    viewDetails: 'विस्तार से देखें',
    hireNow: 'बुक करें',
    safeCall: 'कॉल करें',
    comboMaterialBadge: 'सामग्री कॉम्बो उपलब्ध',

    // Mega Contracts
    megaTitle: 'ऑल-इन-वन मेगा कॉन्ट्रैक्ट्स',
    megaSub: 'शून्य से अंत तक संपूर्ण ठेका • सुरक्षित 6 माइलस्टोन्स',
    viewMilestones: 'प्लान व माइलस्टोन्स ➔',

    // AI Estimator
    aiTitle: 'SETU AI बजट कैलकुलेटर',
    aiSub: 'कमरे का साइज डालें, कारीगर व सामग्री का सटीक बजट जानें',
    aiAction: 'बजट निकालें ➔',

    // Bottom Navigation
    navExplore: 'होम',
    navQuick: 'क्विक 15m',
    navEstimator: 'बजट कैलकुलेटर',
    navBookings: 'मेरी बुकिंग्स',
    navPartner: 'पार्टनर हब',
    navProfile: 'खाता',

    // Role Switcher Banner
    backToCustomer: '← वापस ग्राहक शॉपिंग ऐप पर जाएँ',
    contractorPortal: 'कारीगर पोर्टल (Pro Dashboard)',
    vendorPortal: 'दुकानदार पोर्टल (Store Hub)',
    adminPortal: 'एडमिन कंट्रोल हब (Admin Desk)',

    // Partner Registration
    partnerRegTitle: 'SETU पार्टनर नेटवर्क',
    partnerRegSub: 'Urban Company व Flipkart की तरह अपने काम को ऑनलाइन ले जाएं',
    partnerContractor: 'कुशल कारीगर / ठेकेदार बनें',
    partnerVendor: 'मटेरियल सप्लायर बनें',

    // Status
    onlineStatus: 'ऑनलाइन • तुरंत उपलब्ध',
    offlineStatus: 'व्यस्त • नए ऑर्डर बंद',

    // Auth & Welcome
    welcomeTitle: 'SETU में आपका स्वागत है',
    welcomeSub: 'कारीगर • सामग्री • ठेका (भोपाल)',
    welcomeDesc: '15 मिनट में सत्यापित कारीगर, उचित दरें और लाइव AI समस्या समाधान।',
    customerLogin: 'ग्राहक लॉगिन (Customer)',
    contractorLogin: 'कारीगर लॉगिन (Contractor)',
    vendorLogin: 'दुकानदार लॉगिन (Store Owner)',
    adminLogin: 'एडमिन लॉगिन (Admin)',
    enterMobile: 'अपना 10-अंकीय मोबाइल नंबर दर्ज करें',
    getOtp: 'OTP प्राप्त करें ➔',
    verifyOtp: 'सत्यापित करें व आगे बढ़ें ➔',
    browseAsGuest: 'अतिथि के रूप में देखें (Skip / Guest) ➔',
    fastDemoLogin: '⚡ 1-क्लिक टेस्ट लॉगिन:',
  },

  en: {
    // Header & Brand
    appName: 'SETU',
    tagline: 'Labor • Materials • Turnkey (Bhopal)',
    workWithUs: 'Become a Partner',
    quickSos: 'SETU Quick ⚡',
    searchPlaceholder: 'Search plumber, carpenter, painter, electrician, tent...',
    pointsLabel: 'Reward Coins',
    loginRegister: 'Login / Register',

    // Needs Selector
    needTitle: 'What service do you need today?',
    needSub: 'Select your requirement to discover verified pros and hardware stores',
    needAll: 'All Services',
    needQuick: 'Quick Repair ⚡',
    needQuickSub: 'Within 15-30 mins',
    needConstruction: 'Home & Build 🏗️',
    needConstructionSub: 'Mason, Carpenter, Painter',
    needWedding: 'Wedding & Events 🎉',
    needWeddingSub: 'Tent, Caterer, DJ, Lights',
    needMaterials: 'Materials Combo 🧱',
    needMaterialsSub: 'Cement, Plywood, Sanitary',

    // Rate Filters
    allRates: 'All Rates',
    dailyRate: 'Daily Shift',
    contractRate: 'Turnkey (Sq.ft)',
    quickAvailable: 'Available Now 🟢',

    // AI Ustad Live Doctor & 3D Studio
    aiHeroLive: 'LIVE AI DOCTOR VIDEO CALL',
    aiHeroFree: '100% Free Consultation',
    aiHeroTitle: 'Show the defect on camera, AI analyzes root cause & fair cost live!',
    aiHeroSub: 'Leaking tap, wall seepage, or 3D kitchen design • Instant diagnosis & Bhopal rates',
    aiScanBtn: 'Start Free Video Scan ➔',
    ai3dStudioBtn: '3D Kitchen Studio',
    aiDoctorTitle: 'AI Doctor 📹',
    aiDoctorSub: 'Live Video Fix',

    // Cards
    nearbyTitle: 'Top Verified Pros Near You',
    nearbySub: 'Aadhaar Verified • Portfolio Photos • 100% Escrow Protection',
    verifiedBadge: 'Verified',
    reviewsText: 'Reviews',
    awayText: 'away',
    etaText: 'Arrival ETA',
    dailyWage: 'Daily Wage',
    contractWage: 'Contract Rate',
    photosCount: 'Work Photos',
    viewDetails: 'View Profile',
    hireNow: 'Book Now',
    safeCall: 'Call Pro',
    comboMaterialBadge: 'Material Combo Included',

    // Mega Contracts
    megaTitle: 'Turnkey Mega Contracts',
    megaSub: 'End-to-End complete project delivery with 6 Escrow milestones',
    viewMilestones: 'View Plan & Milestones ➔',

    // AI Estimator
    aiTitle: 'SETU AI Cost Estimator',
    aiSub: 'Enter room dimensions for instant labor & material estimates',
    aiAction: 'Calculate Budget ➔',

    // Bottom Navigation
    navExplore: 'Home',
    navQuick: 'Quick 15m',
    navEstimator: 'Estimator',
    navBookings: 'My Bookings',
    navPartner: 'Partner Hub',
    navProfile: 'Account',

    // Role Switcher Banner
    backToCustomer: '← Back to Customer Shopping App',
    contractorPortal: 'Contractor Portal (Pro Dashboard)',
    vendorPortal: 'Vendor Portal (Store Hub)',
    adminPortal: 'Super Admin Hub (Admin Desk)',

    // Partner Registration
    partnerRegTitle: 'SETU Partner Network',
    partnerRegSub: 'Scale your trade or store like Urban Company & Amazon',
    partnerContractor: 'Join as Skilled Contractor / Pro',
    partnerVendor: 'Join as Material Supplier / Store',

    // Status
    onlineStatus: 'Online • Available for dispatch',
    offlineStatus: 'Busy • Orders paused',

    // Auth & Welcome
    welcomeTitle: 'Welcome to SETU',
    welcomeSub: 'Labor • Materials • Turnkey (Bhopal)',
    welcomeDesc: '15-min verified artisans, transparent rates, and live AI problem diagnosis.',
    customerLogin: 'Customer Login',
    contractorLogin: 'Contractor Login',
    vendorLogin: 'Store Owner Login',
    adminLogin: 'Admin Login',
    enterMobile: 'Enter your 10-digit mobile number',
    getOtp: 'Get OTP ➔',
    verifyOtp: 'Verify & Continue ➔',
    browseAsGuest: 'Explore as Guest ➔',
    fastDemoLogin: '⚡ 1-Click Fast Test Login:',
  },

  hinglish: {
    // Header & Brand
    appName: 'SETU',
    tagline: 'Karigar • Material • Theka (Bhopal)',
    workWithUs: 'Partner Banein',
    quickSos: 'SETU Quick ⚡',
    searchPlaceholder: 'Plumber, Carpenter, Painter, AC Service, Tent dhoondho...',
    pointsLabel: 'Reward Coins',
    loginRegister: 'Login / Register',

    // Needs Selector
    needTitle: 'Aaj aapko kaunsi service chahiye?',
    needSub: 'Apni requirement chuno, hum best karigar aur shop dikhayenge',
    needAll: 'Sabhi Services',
    needQuick: 'Quick Repair ⚡',
    needQuickSub: '15-30 min me',
    needConstruction: 'Ghar Nirman 🏗️',
    needConstructionSub: 'Mistri, Badhai, Painter',
    needWedding: 'Shaadi & Events 🎉',
    needWeddingSub: 'Tent, Halwai, DJ, Lights',
    needMaterials: 'Material Combo 🧱',
    needMaterialsSub: 'Cement, Ply, Sanitary',

    // Rate Filters
    allRates: 'Sabhi Rates',
    dailyRate: 'Dihadi (Daily Shift)',
    contractRate: 'Theka (Sq.ft/Lumpsum)',
    quickAvailable: 'Abhi Available 🟢',

    // AI Ustad Live Doctor & 3D Studio
    aiHeroLive: 'LIVE AI USTAD VIDEO CALL',
    aiHeroFree: '100% Free Consultation',
    aiHeroTitle: 'Camera pe problem dikhao, AI Ustad live rate aur samaan batayega!',
    aiHeroSub: 'Nal tapakna, seelan, ya 3D kitchen design • Turant solution aur Bhopal market rates',
    aiScanBtn: 'Free Video Scan Shuru Karein ➔',
    ai3dStudioBtn: '3D Kitchen Studio',
    aiDoctorTitle: 'AI Ustad 📹',
    aiDoctorSub: 'Live Video Solution',

    // Cards
    nearbyTitle: 'Aapke Paas Verified Skilled Karigar',
    nearbySub: 'Aadhaar Verified KYC • Asli Kaam ki Photos • 100% Escrow Guarantee',
    verifiedBadge: 'Verified',
    reviewsText: 'Reviews',
    awayText: 'door',
    etaText: 'Aane ka time',
    dailyWage: 'Dihadi Rate',
    contractWage: 'Theka Rate',
    photosCount: 'Kaam Photos',
    viewDetails: 'Profile Dekhein',
    hireNow: 'Book Karein',
    safeCall: 'Call Karein',
    comboMaterialBadge: 'Material Combo Included',

    // Mega Contracts
    megaTitle: 'All-in-One Mega Theka',
    megaSub: 'Zero se end tak complete theka • Safe 6 Escrow milestones',
    viewMilestones: 'Plan & Milestones Dekhein ➔',

    // AI Estimator
    aiTitle: 'SETU AI Budget Calculator',
    aiSub: 'Kamre ka size daalo, karigar aur material ka exact budget jaano',
    aiAction: 'Budget Nikalein ➔',

    // Bottom Navigation
    navExplore: 'Home',
    navQuick: 'Quick 15m',
    navEstimator: 'Budget Calculator',
    navBookings: 'Meri Bookings',
    navPartner: 'Partner Hub',
    navProfile: 'Account',

    // Role Switcher Banner
    backToCustomer: '← Wapas Customer App par jayein',
    contractorPortal: 'Karigar Portal (Pro Dashboard)',
    vendorPortal: 'Dukandar Portal (Store Hub)',
    adminPortal: 'Super Admin Hub (Admin Desk)',

    // Partner Registration
    partnerRegTitle: 'SETU Partner Network',
    partnerRegSub: 'Urban Company aur Amazon ki tarah apna kaam online le jayein',
    partnerContractor: 'Skilled Karigar / Contractor banein',
    partnerVendor: 'Material Supplier / Shop banein',

    // Status
    onlineStatus: 'Online • Turant Available',
    offlineStatus: 'Busy • Naye Orders Paused',

    // Auth & Welcome
    welcomeTitle: 'SETU me Aapka Swagat Hai',
    welcomeSub: 'Karigar • Material • Theka (Bhopal)',
    welcomeDesc: '15 min me verified karigar, standard rates aur live AI problem solution.',
    customerLogin: 'Customer Login',
    contractorLogin: 'Karigar Login (Contractor)',
    vendorLogin: 'Dukandar Login (Store Owner)',
    adminLogin: 'Admin Login',
    enterMobile: 'Apna 10-digit mobile number enter karein',
    getOtp: 'OTP Paayein ➔',
    verifyOtp: 'Verify karke Aage Badhein ➔',
    browseAsGuest: 'Guest banke dekhein ➔',
    fastDemoLogin: '⚡ 1-Click Fast Test Login:',
  },
};
