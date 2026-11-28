# SETU Platform — Complete Code Architecture (Hindi & English Guide)

यह दस्तावेज़ **SETU** के हर प्रमुख फ़ोल्डर, फ़ाइल, AI इंजन, Python सिस्टम, डेटाबेस मॉडल और सुरक्षा लेयर को सरल **हिन्दी + English** में समझाता है — साथ ही यह भी बताता है कि **यदि कोई फ़ाइल न हो या खराब हो जाए, तो वेबसाइट पर क्या असर पड़ेगा।**

---

## 1. Entry & Application Shell (ऐप का मुख्य ढांचा)

| File | क्या करता है (What it does - Hindi & English) | न होने / खराब होने पर असर (Impact if missing) |
| :--- | :--- | :--- |
| [App.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/App.tsx) | पूरे ऐप का मुख्य कंट्रोलर है। Auth स्थिति, Role-based स्क्रीन स्विच (`CUSTOMER`, `CONTRACTOR`, `VENDOR`, `ADMIN`), लाइव नोटिफिकेशन सिंक, लोकेशन, बुकिंग व `<AppAlertHost />` को जोड़ता है। | पूरी वेबसाइट/ऐप लोड ही नहीं होगी (Blank Screen / White Screen)। |
| [index.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/index.js) | Expo/React Native का बूट एंट्री पॉइंट जो `App` को रजिस्टर करता है। | ब्राउज़र और मोबाइल बंडल शुरू नहीं हो पाएगा। |
| [app.json](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/app.json) | ऐप का नाम, आइकन, स्प्लैश स्क्रीन, Android/iOS व Web आउटपुट कॉन्फ़िगरेशन (`single` SPA) संभालता है। | Expo build (`npm run build`) और मोबाइल आइकन/रूटिंग फेल हो जाएगी। |
| [vercel.json](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/vercel.json) | Vercel पर `/api/*` अनुरोधों को `api/index.js` Backend पर और बाकी को `index.html` फ्रंटएंड पर रूट करता है। | प्रोडक्शन पर हर `/api/...` कॉल पर `404 Not Found` आएगा। |

---

## 2. Frontend Screens (`src/screens/` — मुख्य पेज)

| File | क्या करता है (What it does) | न होने पर असर (Impact if missing) |
| :--- | :--- | :--- |
| [CustomerHome.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/screens/CustomerHome.tsx) | ग्राहक की होम स्क्रीन — हीरो कार्ड, सर्च व वॉइस सर्च, 15 ट्रेड कैटेगरी, बाजार भाव, पोस्ट-जॉब मॉडल, **सत्यापित कारीगर कार्ड** और **लाइव सप्लायर कच्चा माल शोरूम** दिखाती है। | ग्राहक न कारीगर ढूँढ पाएंगे न सामान/डिज़ाइन बुक कर पाएंगे। |
| [AdminDashboard.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/screens/AdminDashboard.tsx) | केवल सुपर एडमिन (`ADMIN` रोल) का 4-टैब कंट्रोल हब: (1) वित्त/KYC/विवाद, (2) **API व सिस्टम हब** (MongoDB, Cloudinary, Firebase, Fast2SMS, Python/AI), (3) लाइव डेटाबेस व ब्रॉडकास्ट, (4) **SETU-HERO प्राइवेट एडमिन AI**। | एडमिन KYC स्वीकृत नहीं कर पाएगा, न API मॉनिटर व SETU-HERO AI चला पाएगा। |
| [ContractorDashboard.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/screens/ContractorDashboard.tsx) | कारीगर का डैशबोर्ड — प्रोफाइल फोटो, 15-ट्रेड दर कार्ड, बैंक/UPI सेटअप, पोर्टफोलियो व बुकिंग कोटेशन प्रबंधन। | कारीगर अपने रेट, कोटेशन या ग्राहक अनुरोध स्वीकार नहीं कर पाएंगे। |
| [VendorDashboard.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/screens/VendorDashboard.tsx) | सप्लायर/दुकानदार का डैशबोर्ड — नया कच्चा माल जोड़ना, कीमत/स्टॉक अपडेट करना (जो तुरंत AI व होम शोरूम में जुड़ता है)। | दुकानदार अपना नया सामान/भाव प्लेटफॉर्म व AI में नहीं जोड़ पाएंगे। |

---

## 3. Core UI Components & Custom Alerts (`src/components/`, `src/utils/`)

| File | क्या करता है (What it does) | न होने पर असर (Impact if missing) |
| :--- | :--- | :--- |
| [Header.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/Header.tsx) | स्टिकी नेविगेशन बार — SETU लोगो, भाषा स्विचर (`हिं / EN / Hing`), **नोटिफिकेशन बेल (`🔔`)**, यूज़र प्रोफाइल, पार्टनर बटन, लोकेशन व Quick 15m। | नेविगेशन, भाषा परिवर्तन, लॉगआउट व नोटिफिकेशन बेल गायब हो जाएंगे। |
| [BottomNavBar.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/BottomNavBar.tsx) | मोबाइल व टैबलेट के लिए सुरक्षित-स्पेसिंग (safe-area) वाला निचला बार (होम, क्विक 15m, SETU AI, पार्टनर हब, खाता)। | मोबाइल यूज़र्स के लिए मुख्य सेक्शंस तक पहुँचना कठिन हो जाएगा। |
| [AppAlertHost.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/AppAlertHost.tsx) & [appAlert.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/utils/appAlert.ts) | **ब्राउज़र के भद्दे पॉपअप की जगह** SETU का अपना थीम वाला कस्टम डायलॉग और टॉप स्लाइडिंग टोस्ट बैनर दिखाता है। | अलर्ट या कन्फर्मेशन डायलॉग नहीं दिखेंगे या ब्राउज़र के डिफ़ॉल्ट पॉपअप पर निर्भर रहना पड़ेगा। |
| [NotificationCenterModal.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/NotificationCenterModal.tsx) | नई बुकिंग, कोटेशन, KYC सत्यापन, सप्लायर स्टॉक व एडमिन ब्रॉडकास्ट की पूरी सूची व Read/Unread प्रबंधन। | उपयोगकर्ताओं को रियल-टाइम अपडेट और बेल आइकन हिस्ट्री नहीं दिखेगी। |
| [AuthLandingScreen.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/AuthLandingScreen.tsx) & [firebaseAuth.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/services/firebaseAuth.ts) | Google Sign-In, अनिवार्य Email Verification लिंक व Mobile SMS OTP लॉगिन। बिना ईमेल वेरिफाई किए अकाउंट अंदर नहीं जाने देता। | बिना सत्यापन नकली ईमेल अकाउंट बन सकते हैं और मोबाइल लॉगिन बंद हो जाएगा। |
| [SetuAIStudioModal.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/SetuAIStudioModal.tsx), [SpaceDesignCanvas.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/SpaceDesignCanvas.tsx), [VisualMaterialPicker.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/VisualMaterialPicker.tsx), [ThreeWayQuotationCard.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/ThreeWayQuotationCard.tsx) | ग्राहक का मुख्य **SETU AI डिज़ाइनर व रेट एक्सपर्ट** — फोटो एडिट/ब्लूप्रिंट प्रीव्यू, कच्चा माल प्रयोगशाला (लाइव दुकान स्टॉक सहित), ऑटो/मैनुअल मैस्कॉट वॉइस व 3-तरफ़ा कोटेशन। | AI डिज़ाइन, कच्चे माल की तुलना, AI वॉइस व स्वचालित 3-टाइप कोटेशन सिस्टम बंद हो जाएगा। |
| [CascadingCategoryDropdowns.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/CascadingCategoryDropdowns.tsx) & [setuVoice.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/utils/setuVoice.ts) | 12 मुख्य श्रेणियों व उप-श्रेणियों के सर्चेबल 2-लेवल ड्रॉपडाउन + कस्टम कार्य इनपुट दिखाता है; `setuVoice.ts` Gemini 3.8 TTS और ट्यून्ड Web Speech के जरिए SETU की मैच्ड हिंदी आवाज़ चलाता है। | पार्टनर रजिस्ट्रेशन/जॉब पोस्ट में क्लीन कैटेगरी चयन और AI मैस्कॉट की मैच्ड आवाज़ नहीं चलेगी। |
| [BookingModal.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/BookingModal.tsx), [PartnerRegistrationModal.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/PartnerRegistrationModal.tsx), [AdminSecurityModal.tsx](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/components/AdminSecurityModal.tsx) | 15-ट्रेड बुकिंग सत्यापन, कारीगर/सप्लायर KYC ऑनबोर्डिंग, और पासवर्ड-प्रोटेक्टेड एडमिन लॉगिन गेट। | नई बुकिंग, पार्टनर रजिस्ट्रेशन या सुरक्षित एडमिन प्रवेश संभव नहीं होगा। |

---

## 4. Data, Auto-Matching Algorithms & API Client (`src/data/`, `src/services/`)

| File | क्या करता है (What it does) | न होने पर असर (Impact if missing) |
| :--- | :--- | :--- |
| [serviceCatalog.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/data/serviceCatalog.ts) | सभी **12 मुख्य श्रेणियों (Construction, Repair, Events, IT, Hospitality, Home Care, Auto, Beauty, Business/Legal, Education, Industrial, Custom)** और उनकी उप-श्रेणियों का सिंगल सोर्स ऑफ़ ट्रुथ। | होम स्क्रीन, पार्टनर ऑनबोर्डिंग व जॉब पोस्टिंग की मुख्य व उप-श्रेणियाँ लोड नहीं होंगी। |
| [supplierShowroom.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/data/supplierShowroom.ts) | 12+ प्रोजेक्ट्स का कच्चा माल डेटाबेस + **`rankContractorsForProject`**, **`rankSupplierMaterialsForProject`**, व **`buildLiveSupplierShowroomGroup`** एल्गोरिथ्म जो नए कारीगर व दुकानदार के माल को अपने आप सबसे ऊपर लाता है। | AI डिज़ाइन में नए जुड़े कारीगर व दुकानदारों का ताज़ा स्टॉक स्वतः सुझाव में नहीं आएगा। |
| [tradeRateConfig.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/data/tradeRateConfig.ts) | सभी कारीगर ट्रेड व नए व्यावसायिक डोमेन (`it_digital`, `hospitality_retail`, `home_care`, `auto_transport`, `beauty_wellness`, `business_legal`, `education`, `industrial`, `other_custom`) के दर मॉडल और माप नियम। | बुकिंग व रेट कार्ड में अमान्य या अधूरे माप से ग़लत बिल बनेंगे। |
| [api.ts](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/src/services/api.ts) | फ्रंटएंड और बैकएंड (`/api/...`) के बीच सुरक्षित JWT हेडर के साथ पूरा REST API क्लाइंट (`synthesizeSetuVoice` `/api/ai/tts` सहित)। | डेटा सेव होना, लॉगिन टोकन, AI वॉइस/चैट कॉल और एडमिन एक्शन बंद हो जाएंगे। |

---

## 5. Backend, Self-Dependent AI, Python Engine & Admin Hero (`backend/`)

| File | क्या करता है (What it does) | न होने पर असर (Impact if missing) |
| :--- | :--- | :--- |
| [server.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/server.js) & [api/index.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/api/index.js) | पूरा Express REST API सर्वर — OTP/Firebase Auth, Cloudinary अपलोड, बुकिंग/एस्क्रो, नोटिफिकेशन, AI रूट्स, और केवल `ADMIN` के लिए सिस्टम कंट्रोल व Hero AI रूट्स। | पूरा बैकएंड API और डेटाबेस लेनदेन ठप पड़ जाएगा। |
| [auth.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/auth.js) | HMAC-SHA256 JWT टोकन जनरेशन/वेरिफिकेशन + `requireAuth` व `requireRole('ADMIN')` मिडलवेयर। | सुरक्षा टूट जाएगी — कोई भी अनधिकृत व्यक्ति प्राइवेट डेटा या एडमिन रूट्स खोल पाएगा। |
| [db.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/db.js) & `backend/models/*` | MongoDB Atlas कनेक्शन + Mongoose स्कीमा (`User`, `Contractor`, `Material`, `Booking`, `KycApplication`, `Dispute`, `Notification`) व `database.json` लोकल फेलओवर। | डेटा क्लाउड या डिस्क में स्थायी रूप से सुरक्षित नहीं रहेगा। |
| [setuMasterEngine.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/setuMasterEngine.js) & [setuSelfEngine.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/setuSelfEngine.js) | **SETU का आत्मनिर्भर AI दिमाग (Self-Dependent Brain)** — बिना Gemini/ChatGPT के भी हिंदी/Hinglish/English सवाल समझता है, लकड़ी/सीमेंट/वायरिंग तकनीकी तुलना करता है, लाइव कारीगर/माल मैच करता है और **SVG आर्किटेक्चरल ब्लूप्रिंट** खुद रेंडर करता है। | यदि बाहरी Gemini/इमेज सर्वर बंद या महंगा हो जाए तो SETU AI रुक जाएगा (इन फाइलों से SETU 100% आत्मनिर्भर रहता है)। |
| [aiLearningEngine.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/aiLearningEngine.js) | ग्राहकों के 👍/👎 फीडबैक, शहर की पसंद व AI सर्किट-ब्रेकर (ऑटो फेलओवर हेल्थ) को याद रखता है। | AI समय के साथ स्मार्ट नहीं होगा और किसी बाहरी इंजन के फेल होने पर तुरंत स्विच नहीं करेगा। |
| [setu_python_brain.py](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/python_ai/setu_python_brain.py) & [pythonBridge.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/pythonBridge.js) | **Python 3 मात्रात्मक व कोड-ऑडिट इंजन** — IS-456 नियम से सीमेंट/सरिया/प्लाई/टाइल/पेंट का वैज्ञानिक गणित निकालता है + वेबसाइट के सुरक्षा बग व RBAC गार्ड स्कैन करता है (सर्वरलेस के लिए JS पैरिटी बैकअप सहित)। | सिविल/इंटीरियर सामग्री का सटीक Python क्वांटिटेटिव ऑडिट व ऑटो-सिक्योरिटी स्कैन काम नहीं करेगा। |
| [adminHeroEngine.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/adminHeroEngine.js) | **SETU-HERO (केवल सुपर एडमिन का प्राइवेट AI)** — पूरी साइट की सुरक्षा, बग्स, खाते/एस्क्रो, लंबित KYC, Fast2SMS बैलेंस व आगे के डेवलपमेंट सुझाव तैयार करता है। | एडमिन को सिंगल-क्लिक स्मार्ट वेबसाइट ऑडिट और पर्सनल कमांड AI सुविधा नहीं मिलेगी। |
| [notificationEngine.js](file:///c:/Users/ankit_13rrakn/OneDrive/Desktop/SETU1/backend/notificationEngine.js) | नई बुकिंग, कोटेशन, KYC अपडेट, नए पार्टनर/सामान और एडमिन ब्रॉडकास्ट पर रोल के अनुसार सुरक्षित नोटिफिकेशन जारी करता है। | रीयल-टाइम इन-ऐप अलर्ट और एडमिन ब्रॉडकास्ट सिस्टम काम नहीं करेगा। |

---

## 6. Environment Keys (`.env` / Vercel Variables — एडमिन सुरक्षा कुंजियाँ)

- **`MONGODB_URI`**: क्लाउड डेटाबेस कनेक्शन। न होने पर लोकल `database.json` फेलओवर चलेगा (सर्वरलेस में अस्थायी)।
- **`JWT_SECRET`**: लॉगिन सत्रों को साइन करने की गुप्त कुंजी। कमज़ोर होने पर टोकन सुरक्षा घटती है।
- **`ADMIN_SECRET_KEY` / `ADMIN_USERNAME`**: सुपर एडमिन लॉगिन के लिए। गलत/न होने पर एडमिन डैशबोर्ड लॉक रहेगा।
- **`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`**: अपलोड की गई फ़ोटो और प्राइवेट KYC दस्तावेज़ों को स्थायी CDN पर रखने के लिए।
- **`SMS_API_KEY` (Fast2SMS) / `TWOFACTOR_API_KEY`**: असली मोबाइल OTP भेजने के लिए।
- **`FIREBASE_PROJECT_ID` (`setu-e786b`)**: Google Sign-In और ईमेल सत्यापन टोकन जांचने के लिए।
- **`GEMINI_API_KEY` (वैकल्पिक/Optional)** एवं **`SETU_GEMINI_VOICE_ID`**: यदि मौजूद हो तो Gemini AI व `gemini-3.8-flash-tts` वॉइस डिज़ाइन (`POST /api/ai/tts`) चलता है; न होने पर भी **SETU Self-AI (`setuSelfEngine.js` + Python)** व ट्यून्ड Web Speech आवाज़ 100% काम करते हैं!
