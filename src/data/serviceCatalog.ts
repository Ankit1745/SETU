import { CanonicalTradeId } from './tradeRateConfig';

export interface ServiceSubcategoryItem {
  id: string;
  nameEn: string;
  nameHi: string;
  /** Maps onto CanonicalTradeId for rate templates, validation & AI estimators */
  canonicalTradeId: CanonicalTradeId;
  isCustom?: boolean;
}

export interface MainServiceCategory {
  id: string;
  number: number;
  nameEn: string;
  nameHi: string;
  icon: string;
  color: string;
  subcategories: ServiceSubcategoryItem[];
}

export const SERVICE_CATEGORIES: MainServiceCategory[] = [
  {
    id: 'construction',
    number: 1,
    nameEn: 'Home & Building Construction',
    nameHi: 'घर और भवन निर्माण - नया काम',
    icon: 'home-city-outline',
    color: '#D97706',
    subcategories: [
      { id: 'const_civil_contractor', nameEn: 'Civil Contractor / Rajmistri', nameHi: 'मकान ठेकेदार / राजमिस्त्री - टीम सहित', canonicalTradeId: 'mason' },
      { id: 'const_architect', nameEn: 'Architect & Structural Designer', nameHi: 'आर्किटेक्ट / नक्शा बनाने वाला', canonicalTradeId: 'mason' },
      { id: 'const_interior_modular', nameEn: 'Interior Designer & Modular Kitchen', nameHi: 'इंटीरियर डिजाइनर / मॉड्यूलर किचन', canonicalTradeId: 'carpenter' },
      { id: 'const_electrical_new', nameEn: 'New Electrical Fitting & Wiring', nameHi: 'नयी बिजली फिटिंग / वायरिंग ठेकेदार', canonicalTradeId: 'electrician' },
      { id: 'const_plumbing_new', nameEn: 'New Plumbing & Sanitary Fitting', nameHi: 'नयी प्लंबिंग / नल फिटिंग ठेकेदार', canonicalTradeId: 'plumber' },
      { id: 'const_carpenter_new', nameEn: 'Carpenter & Furniture Maker', nameHi: 'बढ़ई / नया फर्नीचर बनाने वाला', canonicalTradeId: 'carpenter' },
      { id: 'const_painter', nameEn: 'Painter, Putty & Polish', nameHi: 'पेंटर / पुट्टी और पॉलिश ठेकेदार', canonicalTradeId: 'painter' },
      { id: 'const_tile_marble', nameEn: 'Tile, Marble & Granite Mason', nameHi: 'टाइल / मार्बल / ग्रेनाइट ठेकेदार', canonicalTradeId: 'tiling' },
      { id: 'const_pop_ceiling', nameEn: 'POP & False Ceiling Specialist', nameHi: 'POP / फॉल्स सीलिंग ठेकेदार', canonicalTradeId: 'false_ceiling' },
      { id: 'const_sariya_grill', nameEn: 'Sariya Binder / Steel & Grill Fabricator', nameHi: 'सरिया बाँधने वाला / ग्रिल और गेट फैब्रिकेटर', canonicalTradeId: 'welder' },
      { id: 'const_aluminium_upvc', nameEn: 'Aluminium, uPVC & Glass Work', nameHi: 'एल्युमिनियम / uPVC / ग्लास वाला', canonicalTradeId: 'aluminium_upvc' },
      { id: 'const_waterproofing', nameEn: 'Waterproofing Specialist', nameHi: 'वॉटरप्रूफिंग वाला', canonicalTradeId: 'waterproofing' },
      { id: 'const_labor_jcb', nameEn: 'Labour, Helper, JCB, Crane & Trolley', nameHi: 'हेल्पर / लेबर / JCB / क्रेन / ट्रॉली', canonicalTradeId: 'labor' },
      { id: 'const_other', nameEn: 'Other Construction Work', nameHi: 'अन्य निर्माण कार्य', canonicalTradeId: 'mason', isCustom: true },
    ],
  },
  {
    id: 'repair',
    number: 2,
    nameEn: 'Repair & Maintenance',
    nameHi: 'रिपेयरिंग और मेंटेनेंस',
    icon: 'wrench-outline',
    color: '#DC2626',
    subcategories: [
      { id: 'rep_electrician', nameEn: 'Electrician Repair', nameHi: 'बिजली रिपेयरिंग - पंखा, स्विच, बोर्ड, इनवर्टर', canonicalTradeId: 'electrician' },
      { id: 'rep_plumber', nameEn: 'Plumber Repair', nameHi: 'प्लंबर रिपेयरिंग - लीकेज, नल, टंकी, पाइप', canonicalTradeId: 'plumber' },
      { id: 'rep_carpenter', nameEn: 'Carpenter Repair', nameHi: 'फर्नीचर, दरवाजा और लॉक रिपेयरिंग', canonicalTradeId: 'carpenter' },
      { id: 'rep_ac_cooling', nameEn: 'AC & Cooling Repair / Gas Refill', nameHi: 'AC और कूलर रिपेयरिंग / गैस रिफिल', canonicalTradeId: 'ac_repair' },
      { id: 'rep_appliance', nameEn: 'Home Appliance Repair', nameHi: 'फ्रिज, वॉशिंग मशीन, गीजर, RO, माइक्रोवेव रिपेयर', canonicalTradeId: 'ac_repair' },
      { id: 'rep_laptop_mobile', nameEn: 'Laptop, Computer & Mobile Repair', nameHi: 'लैपटॉप, कंप्यूटर और मोबाइल रिपेयर', canonicalTradeId: 'it_digital' },
      { id: 'rep_cctv_biometric', nameEn: 'CCTV & Biometric Repair', nameHi: 'CCTV कैमरा और बायोमेट्रिक रिपेयर', canonicalTradeId: 'electrician' },
      { id: 'rep_handyman', nameEn: 'General Handyman / Odd-Job Fixer', nameHi: 'छोटे-मोटे घरेलू रिपेयर काम', canonicalTradeId: 'general' },
      { id: 'rep_other', nameEn: 'Other Repair Work', nameHi: 'अन्य रिपेयरिंग काम', canonicalTradeId: 'general', isCustom: true },
    ],
  },
  {
    id: 'events',
    number: 3,
    nameEn: 'Events & Weddings',
    nameHi: 'इवेंट और शादी-समारोह',
    icon: 'party-popper',
    color: '#DB2777',
    subcategories: [
      { id: 'ev_planner', nameEn: 'Wedding & Event Planner', nameHi: 'वेडिंग और इवेंट प्लानर', canonicalTradeId: 'wedding_tent' },
      { id: 'ev_tent_stage', nameEn: 'Tent, Pandal & Stage Decorator', nameHi: 'टेंट / पंडाल / स्टेज डेकोरेटर', canonicalTradeId: 'wedding_tent' },
      { id: 'ev_caterer', nameEn: 'Halwai & Catering Services', nameHi: 'हलवाई / कैटरर - टीम सहित', canonicalTradeId: 'caterer' },
      { id: 'ev_photo_drone', nameEn: 'Photographer, Videographer & Drone', nameHi: 'फोटोग्राफर, वीडियोग्राफर और ड्रोन टीम', canonicalTradeId: 'wedding_photo' },
      { id: 'ev_makeup', nameEn: 'Bridal & Party Makeup Artist', nameHi: 'ब्राइडल और पार्टी मेकअप आर्टिस्ट', canonicalTradeId: 'wedding_makeup' },
      { id: 'ev_mehndi', nameEn: 'Mehndi Artist', nameHi: 'मेहंदी आर्टिस्ट', canonicalTradeId: 'wedding_makeup' },
      { id: 'ev_dj_sound', nameEn: 'DJ, Sound & Lighting', nameHi: 'DJ / साउंड और लाइटिंग वाला', canonicalTradeId: 'wedding_photo' },
      { id: 'ev_band_dhol', nameEn: 'Baraat Band, Ghodi & Dhol', nameHi: 'बारात बैंड / घोड़ी / ढोल वाला', canonicalTradeId: 'wedding_tent' },
      { id: 'ev_anchor_host', nameEn: 'Anchor / Host & Event Staff', nameHi: 'एंकर / होस्ट और इवेंट टीम', canonicalTradeId: 'wedding_photo' },
      { id: 'ev_other', nameEn: 'Other Event Service', nameHi: 'अन्य इवेंट सर्विस', canonicalTradeId: 'wedding_tent', isCustom: true },
    ],
  },
  {
    id: 'it_digital',
    number: 4,
    nameEn: 'IT, Software & Digital Services',
    nameHi: 'आईटी, सॉफ्टवेयर और डिजिटल काम',
    icon: 'laptop',
    color: '#2563EB',
    subcategories: [
      { id: 'it_video_editor', nameEn: 'Video Editor & Motion Graphics', nameHi: 'वीडियो एडिटर / YouTube और रील्स एडिटर', canonicalTradeId: 'it_digital' },
      { id: 'it_graphic_ui', nameEn: 'Graphic & UI/UX Designer', nameHi: 'ग्राफिक डिजाइनर / थंबनेल, लोगो और पोस्टर', canonicalTradeId: 'it_digital' },
      { id: 'it_web_dev', nameEn: 'Website & Web App Developer', nameHi: 'वेबसाइट डेवलपर', canonicalTradeId: 'it_digital' },
      { id: 'it_mobile_app', nameEn: 'Mobile App Developer (Android / iOS)', nameHi: 'मोबाइल ऐप डेवलपर - Android / iOS', canonicalTradeId: 'it_digital' },
      { id: 'it_erp_software', nameEn: 'Custom Software & ERP Builder', nameHi: 'सॉफ्टवेयर और बिलिंग सिस्टम बनाने वाला', canonicalTradeId: 'it_digital' },
      { id: 'it_digital_marketing', nameEn: 'Social Media & Digital Marketing', nameHi: 'डिजिटल मार्केटिंग / सोशल मीडिया मैनेजर', canonicalTradeId: 'it_digital' },
      { id: 'it_content_voice', nameEn: 'Content Writer & Voiceover Artist', nameHi: 'कंटेंट राइटर / वॉइसओवर आर्टिस्ट', canonicalTradeId: 'it_digital' },
      { id: 'it_other', nameEn: 'Other IT / Digital Work', nameHi: 'अन्य डिजिटल काम', canonicalTradeId: 'it_digital', isCustom: true },
    ],
  },
  {
    id: 'hospitality_retail',
    number: 5,
    nameEn: 'Hotel, Restaurant & Retail Staff',
    nameHi: 'होटल, रेस्टोरेंट और दुकान स्टाफ',
    icon: 'silverware-fork-knife',
    color: '#EA580C',
    subcategories: [
      { id: 'hosp_chef', nameEn: 'Professional Chef / Commercial Cook', nameHi: 'होटल / रेस्टोरेंट शेफ और कुक', canonicalTradeId: 'hospitality_retail' },
      { id: 'hosp_barista_tandoor', nameEn: 'Cafe Barista / Fast Food & Tandoor Master', nameHi: 'कैफे / फास्ट फूड / तंदूर मास्टर', canonicalTradeId: 'hospitality_retail' },
      { id: 'hosp_waiter_steward', nameEn: 'Waiter, Steward & Kitchen Manager', nameHi: 'वेटर / कैप्टन / किचन मैनेजर', canonicalTradeId: 'hospitality_retail' },
      { id: 'hosp_receptionist', nameEn: 'Hotel Receptionist & Front Desk', nameHi: 'होटल रिसेप्शनिस्ट और फ्रंट डेस्क', canonicalTradeId: 'hospitality_retail' },
      { id: 'hosp_retail_sales', nameEn: 'Retail Shop Salesperson & Cashier', nameHi: 'दुकान / शोरूम सेल्समैन और कैशियर', canonicalTradeId: 'hospitality_retail' },
    ],
  },
  {
    id: 'home_care',
    number: 6,
    nameEn: 'Home Care & Domestic Services',
    nameHi: 'घरेलू देखभाल और सफाई',
    icon: 'broom',
    color: '#059669',
    subcategories: [
      { id: 'hc_deep_cleaning', nameEn: 'Deep Home, Bathroom & Kitchen Cleaning', nameHi: 'घर, बाथरूम और किचन डीप क्लीनिंग टीम', canonicalTradeId: 'home_care' },
      { id: 'hc_sofa_tank', nameEn: 'Sofa, Carpet & Water Tank Cleaning', nameHi: 'सोफा, कारपेट और पानी की टंकी सफाई', canonicalTradeId: 'home_care' },
      { id: 'hc_pest_control', nameEn: 'Pest Control & Termite Treatment', nameHi: 'पेस्ट कंट्रोल / दीमक और कॉकरोच इलाज', canonicalTradeId: 'home_care' },
      { id: 'hc_home_cook', nameEn: 'Home Cook / Tiffin Maker', nameHi: 'घरेलू खाना बनाने वाला / कुक', canonicalTradeId: 'home_care' },
      { id: 'hc_maid_housekeeping', nameEn: 'Maid / Housekeeping Staff', nameHi: 'घरेलू कामवाली / हाउसकीपिंग', canonicalTradeId: 'home_care' },
      { id: 'hc_elderly_nanny', nameEn: 'Babysitter / Nanny & Elderly Care', nameHi: 'बच्चों और बुजुर्गों की देखभाल', canonicalTradeId: 'home_care' },
      { id: 'hc_gardener', nameEn: 'Gardener / Mali', nameHi: 'माली / गार्डन देखभाल', canonicalTradeId: 'home_care' },
      { id: 'hc_other', nameEn: 'Other Home Care Service', nameHi: 'अन्य घरेलू सेवा', canonicalTradeId: 'home_care', isCustom: true },
    ],
  },
  {
    id: 'auto_transport',
    number: 7,
    nameEn: 'Automobile & Transport',
    nameHi: 'गाड़ी रिपेयरिंग और ट्रांसपोर्ट',
    icon: 'car-wrench',
    color: '#0284C7',
    subcategories: [
      { id: 'auto_car_mech', nameEn: 'Car Mechanic & Servicing', nameHi: 'कार मैकेनिक और सर्विसिंग', canonicalTradeId: 'auto_transport' },
      { id: 'auto_bike_mech', nameEn: 'Bike / Two-Wheeler Mechanic', nameHi: 'बाइक / स्कूटी मैकेनिक', canonicalTradeId: 'auto_transport' },
      { id: 'auto_ac_electrician', nameEn: 'Auto Electrician & Car AC Mechanic', nameHi: 'गाड़ी का इलेक्ट्रिशियन और AC मैकेनिक', canonicalTradeId: 'auto_transport' },
      { id: 'auto_puncture_roadside', nameEn: 'Tyre Puncture & Roadside Breakdown', nameHi: 'टायर पंचर और ऑन-रोड रिपेयर', canonicalTradeId: 'auto_transport' },
      { id: 'auto_car_wash', nameEn: 'Car Wash & Detailing', nameHi: 'कार वॉशिंग और क्लीनिंग', canonicalTradeId: 'auto_transport' },
      { id: 'auto_driver', nameEn: 'Personal / Commercial Driver', nameHi: 'ड्राइवर - कार / कमर्शियल वाहन', canonicalTradeId: 'auto_transport' },
      { id: 'auto_packers_tempo', nameEn: 'Packers & Movers / Tempo & Mini-Truck', nameHi: 'पैकर्स एंड मूवर्स / लोडिंग टेम्पो / मिनी ट्रक', canonicalTradeId: 'auto_transport' },
      { id: 'auto_other', nameEn: 'Other Automobile / Transport Work', nameHi: 'अन्य वाहन / ट्रांसपोर्ट सेवा', canonicalTradeId: 'auto_transport', isCustom: true },
    ],
  },
  {
    id: 'beauty_wellness',
    number: 8,
    nameEn: 'Beauty, Wellness & Healthcare',
    nameHi: 'ब्यूटी, फिटनेस और हेल्थकेयर',
    icon: 'spa',
    color: '#9333EA',
    subcategories: [
      { id: 'bw_salon_women', nameEn: 'Salon at Home - Women', nameHi: 'महिलाओं के लिए घर पर पार्लर सेवा', canonicalTradeId: 'beauty_wellness' },
      { id: 'bw_salon_men', nameEn: 'Salon & Grooming - Men', nameHi: 'पुरुषों के लिए घर पर सैलून / हेयरकट', canonicalTradeId: 'beauty_wellness' },
      { id: 'bw_massage_spa', nameEn: 'Massage & Spa Therapist', nameHi: 'मसाज और थेरेपी', canonicalTradeId: 'beauty_wellness' },
      { id: 'bw_yoga_fitness', nameEn: 'Yoga & Personal Fitness Trainer', nameHi: 'योगा और फिटनेस ट्रेनर', canonicalTradeId: 'beauty_wellness' },
      { id: 'bw_physio_nurse', nameEn: 'Physiotherapist & Home Nurse', nameHi: 'फिजियोथेरेपिस्ट और होम नर्स', canonicalTradeId: 'beauty_wellness' },
      { id: 'bw_other', nameEn: 'Other Wellness Service', nameHi: 'अन्य हेल्थ / ब्यूटी सेवा', canonicalTradeId: 'beauty_wellness', isCustom: true },
    ],
  },
  {
    id: 'business_legal',
    number: 9,
    nameEn: 'Business, Office & Legal Services',
    nameHi: 'बिज़नेस, ऑफिस स्टाफ और कानूनी काम',
    icon: 'briefcase-check-outline',
    color: '#334155',
    subcategories: [
      { id: 'biz_receptionist', nameEn: 'Receptionist, Front-Desk & Office Admin', nameHi: 'ऑफिस रिसेप्शनिस्ट और एडमिन स्टाफ', canonicalTradeId: 'business_legal' },
      { id: 'biz_data_entry', nameEn: 'Data Entry & Back-Office Operator', nameHi: 'डेटा एंट्री और कंप्यूटर ऑपरेटर', canonicalTradeId: 'business_legal' },
      { id: 'biz_ca_gst', nameEn: 'CA / Tax & GST Consultant', nameHi: 'CA / टैक्स और GST सलाहकार', canonicalTradeId: 'business_legal' },
      { id: 'biz_lawyer', nameEn: 'Lawyer & Legal Advisor', nameHi: 'वकील / कानूनी सलाहकार', canonicalTradeId: 'business_legal' },
      { id: 'biz_rto_docs', nameEn: 'Documentation, RTO & License Agent', nameHi: 'दस्तावेज़, RTO और लाइसेंस एजेंट', canonicalTradeId: 'business_legal' },
      { id: 'biz_insurance_loan', nameEn: 'Insurance & Loan Advisor', nameHi: 'इंश्योरेंस और लोन एजेंट', canonicalTradeId: 'business_legal' },
      { id: 'biz_security_guard', nameEn: 'Security Guard & Bouncer Agency', nameHi: 'सिक्योरिटी गार्ड और बाउंसर', canonicalTradeId: 'business_legal' },
      { id: 'biz_other', nameEn: 'Other Business / Legal Work', nameHi: 'अन्य बिज़नेस सेवा', canonicalTradeId: 'business_legal', isCustom: true },
    ],
  },
  {
    id: 'education',
    number: 10,
    nameEn: 'Education, Coaching & Training',
    nameHi: 'शिक्षा, ड्राइविंग और ट्रेनिंग',
    icon: 'school-outline',
    color: '#7C3AED',
    subcategories: [
      { id: 'edu_driving', nameEn: 'Motor Driving School & Instructor', nameHi: 'ड्राइविंग स्कूल / कार-बाइक चलाना सिखाने वाला', canonicalTradeId: 'education' },
      { id: 'edu_home_tutor', nameEn: 'Home Tutor - School Subjects', nameHi: 'होम ट्यूटर - स्कूल पढ़ाई', canonicalTradeId: 'education' },
      { id: 'edu_competitive', nameEn: 'Competitive Exam Coach', nameHi: 'प्रतियोगी परीक्षा कोचिंग', canonicalTradeId: 'education' },
      { id: 'edu_spoken_english', nameEn: 'Spoken English & Language Tutor', nameHi: 'स्पोकन इंग्लिश और भाषा शिक्षक', canonicalTradeId: 'education' },
      { id: 'edu_music_dance', nameEn: 'Music, Dance & Art Teacher', nameHi: 'संगीत, डांस और आर्ट टीचर', canonicalTradeId: 'education' },
      { id: 'edu_computer_coding', nameEn: 'Computer & Coding Instructor', nameHi: 'कंप्यूटर और कोडिंग टीचर', canonicalTradeId: 'education' },
      { id: 'edu_other', nameEn: 'Other Teaching / Training', nameHi: 'अन्य ट्रेनिंग', canonicalTradeId: 'education', isCustom: true },
    ],
  },
  {
    id: 'industrial',
    number: 11,
    nameEn: 'Industrial & Commercial Work',
    nameHi: 'इंडस्ट्रियल और कमर्शियल काम',
    icon: 'factory',
    color: '#B45309',
    subcategories: [
      { id: 'ind_heavy_welder', nameEn: 'Heavy Welder & Industrial Fabricator', nameHi: 'हैवी वेल्डर और इंडस्ट्रियल फैब्रिकेटर', canonicalTradeId: 'industrial' },
      { id: 'ind_cnc_lathe', nameEn: 'CNC / Lathe Machine Operator', nameHi: 'CNC / लेथ मशीन ऑपरेटर', canonicalTradeId: 'industrial' },
      { id: 'ind_hvac_cold', nameEn: 'Commercial HVAC & Cold Storage Tech', nameHi: 'कमर्शियल AC और कोल्ड स्टोरेज मैकेनिक', canonicalTradeId: 'industrial' },
      { id: 'ind_solar', nameEn: 'Solar Panel Installer & Technician', nameHi: 'सोलर पैनल लगाने और रिपेयर करने वाला', canonicalTradeId: 'industrial' },
      { id: 'ind_borewell', nameEn: 'Borewell & Submersible Pump Tech', nameHi: 'बोरवेल और सबमर्सिबल पंप मैकेनिक', canonicalTradeId: 'industrial' },
      { id: 'ind_other', nameEn: 'Other Industrial Work', nameHi: 'अन्य इंडस्ट्रियल काम', canonicalTradeId: 'industrial', isCustom: true },
    ],
  },
  {
    id: 'other_custom',
    number: 12,
    nameEn: 'Other / Custom Work',
    nameHi: 'अन्य कोई भी काम',
    icon: 'star-plus-outline',
    color: '#475569',
    subcategories: [
      { id: 'custom_skill', nameEn: 'Specify Your Work / Custom Skill', nameHi: 'अपना काम खुद लिखें', canonicalTradeId: 'other_custom', isCustom: true },
    ],
  },
];

export function getMainCategoryById(mainId: string): MainServiceCategory {
  return SERVICE_CATEGORIES.find((m) => m.id === mainId) || SERVICE_CATEGORIES[0];
}

export function getSubcategoryById(subId: string): { main: MainServiceCategory; sub: ServiceSubcategoryItem } | null {
  for (const main of SERVICE_CATEGORIES) {
    const hit = main.subcategories.find((s) => s.id === subId);
    if (hit) return { main, sub: hit };
  }
  return null;
}

export function formatSubcategoryLabel(sub: ServiceSubcategoryItem, language: string = 'hi'): string {
  if (language === 'en') return `${sub.nameEn} (${sub.nameHi})`;
  return `${sub.nameHi} • ${sub.nameEn}`;
}
