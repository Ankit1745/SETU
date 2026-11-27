/**
 * SETU Unified 15-Trade Rate Models, Market Research Benchmarks & Mandatory Validation Engine
 * Single source of truth for:
 *  - PartnerRegistrationModal (Step 1 categories + Step 3 trade-first rate cards)
 *  - ContractorDashboard (Live trade-specific rate editor)
 *  - BookingModal (Customer measurement fields, conditional options & calculators)
 *  - ContractorCard / ContractorDetailModal (Rich breakdown badges)
 */

export type CanonicalTradeId =
  | 'carpenter'
  | 'mason'
  | 'painter'
  | 'electrician'
  | 'plumber'
  | 'tiling'
  | 'false_ceiling'
  | 'welder'
  | 'aluminium_upvc'
  | 'waterproofing'
  | 'ac_repair'
  | 'labor'
  | 'wedding_tent'
  | 'caterer'
  | 'wedding_photo'
  | 'wedding_makeup';

export type RateInputKind =
  | 'daily'
  | 'helper'
  | 'contract'
  | 'percent'
  | 'kitchen_rft'
  | 'hardware_piece'
  | 'rebar_kg'
  | 'rebar_ton'
  | 'grill_supply'
  | 'skirting_rft'
  | 'cove_rft'
  | 'pelmet_rft'
  | 'fan_piece'
  | 'cable_meter'
  | 'copper_pipe_ft'
  | 'copper_pipe_m'
  | 'jcb_hour'
  | 'trolley_trip'
  | 'chair_table_day'
  | 'min_plates'
  | 'extra_plate'
  | 'event_hours'
  | 'with_material'
  | 'pipe_unit';

export interface TradeRateModeOption {
  id: string;
  labelHi: string;
  labelEn: string;
  unitHi: string;
  unitEn: string;
  /** Maps onto backend primaryRateType enum/string */
  primaryRateTypeLabel: string;
  /** Maps onto BookingModal / backend bookingMode */
  backendBookingMode: 'दिहाड़ी' | 'ठेका' | 'क्विक रिपेयर' | 'भाव_पूछें';
  defaultRate: number;
  fairRangeHi: string;
  defaultUnits: number;
  minAllowedRate: number;
  maxAllowedRate: number;
  /** Hint from Indian CPWD/DSR & city contractor market benchmarks */
  researchNoteHi: string;
  isDailyLike?: boolean;
  isPercentageLike?: boolean;
}

export interface TradeSubFieldDef {
  id: string;
  labelHi: string;
  labelEn: string;
  type: 'select' | 'number' | 'text' | 'multicheck';
  mandatory: boolean;
  options?: { value: string; labelHi: string; labelEn: string; rateMultiplier?: number }[];
  placeholderHi?: string;
  unitHi?: string;
  min?: number;
  max?: number;
  /** Show only when active mode id matches one of these (if omitted, always shown for the trade) */
  visibleInModes?: string[];
  helperNoteHi?: string;
}

export interface ContractorRateFieldDef {
  key: string;
  labelHi: string;
  subLabelHi: string;
  unitHi: string;
  placeholder: string;
  mandatoryWhenModes?: string[]; // Mandatory if contractor selects any of these modes as primary
  alwaysMandatory?: boolean;
  isNumeric: boolean;
  min?: number;
  max?: number;
  mapsToColumn?: 'dailyWageRate' | 'helperRate' | 'contractUnitRate';
  cardTitleHi?: string;
}

export interface TradeRateProfile {
  id: CanonicalTradeId;
  registrationLabelHi: string;
  nameHindi: string;
  nameEng: string;
  group: 'CONSTRUCTION' | 'WEDDING_EVENT' | 'QUICK_REPAIR';
  icon: string;
  color: string;
  aliases: string[];
  /** Ordered strictly by "फॉर्म में पहले दिखने वाले विकल्प" */
  rateModes: TradeRateModeOption[];
  contractorFields: ContractorRateFieldDef[];
  bookingFields: TradeSubFieldDef[];
  /** Mandatory default checklists or deliverables */
  defaultDeliverables?: string[];
  researchSummaryHi: string;
}

export const TRADE_RATE_PROFILES: Record<CanonicalTradeId, TradeRateProfile> = {
  carpenter: {
    id: 'carpenter',
    registrationLabelHi: 'बढ़ई / फर्नीचर वाला',
    nameHindi: 'बढ़ई / फर्नीचर वाला',
    nameEng: 'Carpenter / Furniture',
    group: 'CONSTRUCTION',
    icon: 'hammer',
    color: '#B45309',
    aliases: ['carpenter', 'बढ़ई', 'कारपेंटर', 'फर्नीचर'],
    researchSummaryHi:
      'मेट्रो व नगर मानक: मॉड्यूलर वॉर्डरोब ₹320–₹500/sq.ft, किचन ₹1,100–₹1,700/रनिंग ft, या कुल प्लाईवुड+हार्डवेयर बिल का 18%–30% लेबर पर होता है।',
    rateModes: [
      {
        id: 'carpenter_sqft',
        labelHi: 'प्रति वर्ग फुट (Sq.Ft)',
        labelEn: 'Per Sq.Ft',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 350,
        fairRangeHi: '₹300 - ₹520 / sq.ft (वॉर्डरोब/पैनलिंग)',
        defaultUnits: 56,
        minAllowedRate: 80,
        maxAllowedRate: 2500,
        researchNoteHi: 'वॉर्डरोब और बॉक्स फर्नीचर की माप (लंबाई × ऊंचाई) से गणना।',
      },
      {
        id: 'carpenter_material_pct',
        labelHi: 'मटेरियल बिल का % (% Basis)',
        labelEn: '% of Material Bill',
        unitHi: 'मटेरियल बिल का %',
        unitEn: '% of material bill',
        primaryRateTypeLabel: 'मटेरियल बिल %',
        backendBookingMode: 'ठेका',
        defaultRate: 25,
        fairRangeHi: '18% - 35% (प्लाई + माइका + हार्डवेयर बिल पर)',
        defaultUnits: 1,
        minAllowedRate: 5,
        maxAllowedRate: 60,
        isPercentageLike: true,
        researchNoteHi: 'बेंगलुरु/मेट्रो मानक: कुल प्लाई व हार्डवेयर बिल का तय प्रतिशत कारीगरी।',
      },
      {
        id: 'carpenter_daily',
        labelHi: 'दिहाड़ी (8 घंटे शिफ्ट)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 950,
        fairRangeHi: '₹850 - ₹1,200 / दिन',
        defaultUnits: 1,
        minAllowedRate: 300,
        maxAllowedRate: 3000,
        isDailyLike: true,
        researchNoteHi: 'छोटे बदलाव, मरम्मत या कस्टम काम के लिए रोज़ाना मजदूरी।',
      },
      {
        id: 'carpenter_kitchen_rft',
        labelHi: 'किचन (प्रति रनिंग फुट)',
        labelEn: 'Kitchen (Running Ft)',
        unitHi: 'प्रति रनिंग फुट',
        unitEn: 'per running ft',
        primaryRateTypeLabel: 'शीट/रनिंग फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 1350,
        fairRangeHi: '₹1,100 - ₹1,800 / रनिंग ft (मॉड्यूलर किचन)',
        defaultUnits: 14,
        minAllowedRate: 250,
        maxAllowedRate: 5000,
        researchNoteHi: 'मॉड्यूलर किचन की लंबाई के अनुसार बेस + वॉल यूनिट कारीगरी।',
      },
      {
        id: 'carpenter_hardware_piece',
        labelHi: 'ड्रॉअर / हार्डवेयर (प्रति पीस)',
        labelEn: 'Drawer / Hardware (Per Piece)',
        unitHi: 'प्रति पीस',
        unitEn: 'per piece',
        primaryRateTypeLabel: 'प्रति पीस',
        backendBookingMode: 'ठेका',
        defaultRate: 250,
        fairRangeHi: '₹150 - ₹450 / पीस (चैनल, लॉक, कब्जे)',
        defaultUnits: 4,
        minAllowedRate: 50,
        maxAllowedRate: 2500,
        researchNoteHi: 'ड्रॉअर चैनल, हाइड्रोलिक कब्जे, हैंडल या मेन डोर लॉक फिटिंग।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'प्रति वर्ग फुट / मुख्य ठेका दर *',
        subLabelHi: 'फर्नीचर/वॉर्डरोब या मुख्य यूनिट की कारीगरी',
        unitHi: '₹ / sq.ft',
        placeholder: '350',
        mandatoryWhenModes: ['carpenter_sqft', 'carpenter_kitchen_rft', 'carpenter_hardware_piece'],
        isNumeric: true,
        min: 50,
        max: 25000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'materialBillPercent',
        labelHi: 'मटेरियल के बिल का प्रतिशत (%) *',
        subLabelHi: 'कुल प्लाई-माइका व हार्डवेयर बिल का % (उदा. 22)',
        unitHi: '%',
        placeholder: '22',
        mandatoryWhenModes: ['carpenter_material_pct'],
        isNumeric: true,
        min: 5,
        max: 60,
        cardTitleHi: 'मटेरियल बिल का % लेबर',
      },
      {
        key: 'dailyWageRate',
        labelHi: '1 दिन की दिहाड़ी (8 घंटे)',
        subLabelHi: 'मास्टर बढ़ई शिफ्ट दर',
        unitHi: '₹ / दिन',
        placeholder: '950',
        mandatoryWhenModes: ['carpenter_daily'],
        isNumeric: true,
        min: 300,
        max: 5000,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'सहायक हेल्पर की दिहाड़ी',
        subLabelHi: 'असिस्टेंट कारीगर चार्ज',
        unitHi: '₹ / दिन',
        placeholder: '550',
        isNumeric: true,
        min: 200,
        max: 3000,
        mapsToColumn: 'helperRate',
      },
      {
        key: 'kitchenRunningFtRate',
        labelHi: 'मॉड्यूलर किचन दर (रनिंग फुट)',
        subLabelHi: 'किचन काउंटर व कैबिनेट के लिए अलग से दिखाएं',
        unitHi: '₹ / रनिंग ft',
        placeholder: '1350',
        isNumeric: true,
        min: 200,
        max: 6000,
        cardTitleHi: 'मॉड्यूलर किचन (रनिंग फुट)',
      },
      {
        key: 'hardwarePerPieceRate',
        labelHi: 'ड्रॉअर / हार्डवेयर फिटिंग (प्रति पीस)',
        subLabelHi: 'चैनल, हिंज, लॉक या ड्रॉअर लगाने का प्रति पीस रेट',
        unitHi: '₹ / पीस',
        placeholder: '250',
        isNumeric: true,
        min: 50,
        max: 3000,
        cardTitleHi: 'ड्रॉअर / हार्डवेयर (प्रति पीस)',
      },
    ],
    bookingFields: [
      {
        id: 'carpenterWorkItem',
        labelHi: 'काम का प्रकार चुनें',
        labelEn: 'Select Carpentry Work',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'वॉर्डरोब / अलमारी', labelHi: 'वॉर्डरोब / अलमारी (Sq.Ft)', labelEn: 'Wardrobe (Sq.Ft)' },
          { value: 'मॉड्यूलर किचन', labelHi: 'मॉड्यूलर किचन (रनिंग फुट)', labelEn: 'Modular Kitchen (Running Ft)' },
          { value: 'बेड / TV यूनिट / पैनलिंग', labelHi: 'बेड / TV यूनिट / वॉल पैनलिंग', labelEn: 'Bed / TV Unit' },
          { value: 'ड्रॉअर / हार्डवेयर फिटिंग', labelHi: 'ड्रॉअर चैनल / लॉक / हिंज (प्रति पीस)', labelEn: 'Hardware / Drawer Fitting' },
        ],
      },
      {
        id: 'materialBillAmount',
        labelHi: 'अनुमानित प्लाईवुड व मटेरियल बिल राशि (₹)',
        labelEn: 'Estimated Material Bill (₹)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['carpenter_material_pct'],
        placeholderHi: 'उदा. 65000',
        unitHi: '₹ बिल',
        min: 1000,
        helperNoteHi: 'आपका प्लाई, माइका और हार्डवेयर का कुल बिल (कारीगर का % इसी पर लगेगा)।',
      },
      {
        id: 'areaOrLength',
        labelHi: 'कुल माप (वर्ग फुट या रनिंग फुट)',
        labelEn: 'Total Measurement (Sq.Ft / Running Ft)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['carpenter_sqft', 'carpenter_kitchen_rft'],
        placeholderHi: 'उदा. 60',
        unitHi: 'Sq.Ft / rft',
        min: 1,
      },
      {
        id: 'hardwarePiecesCount',
        labelHi: 'ड्रॉअर / दरवाजे / हार्डवेयर पीस की संख्या',
        labelEn: 'Drawer / Hardware Piece Count',
        type: 'number',
        mandatory: true,
        visibleInModes: ['carpenter_hardware_piece'],
        placeholderHi: 'उदा. 6',
        unitHi: 'पीस',
        min: 1,
      },
    ],
  },

  mason: {
    id: 'mason',
    registrationLabelHi: 'राजमिस्त्री / मकान ठेकेदार',
    nameHindi: 'राजमिस्त्री / मकान ठेकेदार',
    nameEng: 'Mason / Building Contractor',
    group: 'CONSTRUCTION',
    icon: 'wall',
    color: '#4B5563',
    aliases: ['mason', 'राजमिस्त्री', 'मिस्त्री', 'मकान ठेकेदार', 'सिविल'],
    researchSummaryHi:
      'CPWD DSR & स्थानीय बाजार: राजमिस्त्री दिहाड़ी ₹850–₹1,100, लेबर निर्माण ठेका ₹230–₹320/sq.ft, ईंट चिनाई ₹20–₹28/sq.ft या मोटी नींव चिनाई ₹1,400–₹2,100/m³।',
    rateModes: [
      {
        id: 'mason_daily',
        labelHi: 'दिहाड़ी (8 घंटे)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 900,
        fairRangeHi: '₹850 - ₹1,100 / दिन (+ हेल्पर ₹550)',
        defaultUnits: 1,
        minAllowedRate: 400,
        maxAllowedRate: 3000,
        isDailyLike: true,
        researchNoteHi: 'छोटी रिपेयर, बाउंड्री या एक दिन के काम के लिए।',
      },
      {
        id: 'mason_sqft',
        labelHi: 'प्रति वर्ग फुट (Sq.Ft)',
        labelEn: 'Per Sq.Ft',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 24,
        fairRangeHi: '₹18 - ₹30 / sq.ft (चिनाई/प्लास्टर) | ₹240 - ₹320 / sq.ft (मकान ठेका)',
        defaultUnits: 400,
        minAllowedRate: 10,
        maxAllowedRate: 3000,
        researchNoteHi: 'चिनाई दीवार, प्लास्टर या निर्मित क्षेत्र के अनुसार गणना।',
      },
      {
        id: 'mason_full_contract',
        labelHi: 'पूरे काम का ठेका (Full Work)',
        labelEn: 'Full Work Contract',
        unitHi: 'प्रति Sq.Ft निर्मित क्षेत्र',
        unitEn: 'per built-up sq.ft',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 265,
        fairRangeHi: '₹230 - ₹320 / sq.ft (केवल लेबर) | ₹1,550 - ₹1,950 / sq.ft (विद मटेरियल)',
        defaultUnits: 1000,
        minAllowedRate: 150,
        maxAllowedRate: 5000,
        researchNoteHi: 'संपूर्ण मकान निर्माण — निर्मित क्षेत्र (Built-up Sq.Ft) दर्ज करना अनिवार्य।',
      },
      {
        id: 'mason_cubic_meter',
        labelHi: 'मोटी चिनाई / फाउंडेशन (घन मीटर m³)',
        labelEn: 'Thick Masonry (Per Cubic Meter)',
        unitHi: 'प्रति घन मीटर (m³)',
        unitEn: 'per m³',
        primaryRateTypeLabel: 'घन मीटर (m³)',
        backendBookingMode: 'ठेका',
        defaultRate: 1550,
        fairRangeHi: '₹1,350 - ₹2,200 / घन मीटर (m³)',
        defaultUnits: 10,
        minAllowedRate: 500,
        maxAllowedRate: 6000,
        researchNoteHi: '9-इंच से मोटी दीवार, पत्थर चिनाई व नींव कंक्रीट कार्य (CPWD मानक m³)।',
      },
    ],
    contractorFields: [
      {
        key: 'dailyWageRate',
        labelHi: 'राजमिस्त्री दिहाड़ी (8 घंटे) *',
        subLabelHi: 'मास्टर राजमिस्त्री की प्रति दिन मजदूरी',
        unitHi: '₹ / दिन',
        placeholder: '900',
        mandatoryWhenModes: ['mason_daily'],
        isNumeric: true,
        min: 400,
        max: 4000,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर / बेलदार की दिहाड़ी',
        subLabelHi: 'रेत-सीमेंट व ईंट ढुलाई सहायक',
        unitHi: '₹ / दिन',
        placeholder: '550',
        isNumeric: true,
        min: 250,
        max: 2500,
        mapsToColumn: 'helperRate',
      },
      {
        key: 'contractUnitRate',
        labelHi: 'मकान ठेका / मुख्य Sq.Ft दर *',
        subLabelHi: 'मकान लेबर ठेका या चिनाई-प्लास्टर Sq.Ft दर',
        unitHi: '₹ / sq.ft',
        placeholder: '265',
        mandatoryWhenModes: ['mason_sqft', 'mason_full_contract', 'mason_cubic_meter'],
        isNumeric: true,
        min: 10,
        max: 5000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'brickworkRateSqft',
        labelHi: 'ईंट चिनाई दर (4.5"/9" दीवार)',
        subLabelHi: 'सामान्य दीवार चिनाई दर',
        unitHi: '₹ / sq.ft',
        placeholder: '24',
        isNumeric: true,
        min: 10,
        max: 250,
        cardTitleHi: 'दीवार ईंट चिनाई',
      },
      {
        key: 'thickMasonryM3Rate',
        labelHi: 'मोटी चिनाई / नींव दर (घन मीटर m³)',
        subLabelHi: 'पत्थर/नींव मोटी चिनाई के लिए m³ दर',
        unitHi: '₹ / m³',
        placeholder: '1550',
        mandatoryWhenModes: ['mason_cubic_meter'],
        isNumeric: true,
        min: 400,
        max: 6000,
        cardTitleHi: 'मोटी चिनाई (घन मीटर m³)',
      },
      {
        key: 'plasterRateSqft',
        labelHi: 'प्लास्टर दर (दीवार / छत)',
        subLabelHi: '12mm अंदरूनी या 20mm बाहरी प्लास्टर',
        unitHi: '₹ / sq.ft',
        placeholder: '18',
        isNumeric: true,
        min: 8,
        max: 150,
        cardTitleHi: 'प्लास्टर कार्य',
      },
    ],
    bookingFields: [
      {
        id: 'masonScope',
        labelHi: 'कार्य का प्रकार चुनें (चिनाई / प्लास्टर / मकान ठेका)',
        labelEn: 'Masonry Sub-work Type',
        type: 'select',
        mandatory: true,
        visibleInModes: ['mason_sqft', 'mason_full_contract', 'mason_cubic_meter'],
        options: [
          { value: 'मकान का ठेका (निर्मित क्षेत्र)', labelHi: 'मकान का ठेका (निर्मित क्षेत्र Sq.Ft)', labelEn: 'Full House Construction (Built-up Sq.Ft)', rateMultiplier: 1 },
          { value: 'दीवार चिनाई (Sq.Ft)', labelHi: 'दीवार चिनाई (दीवार का नाप)', labelEn: 'Brick Wall Masonry (Wall Size)', rateMultiplier: 1 },
          { value: 'मोटी चिनाई (घन मीटर m³)', labelHi: 'मोटी चिनाई / नींव (घन मीटर m³)', labelEn: 'Thick / Foundation Masonry (m³)', rateMultiplier: 1 },
          { value: 'प्लास्टर कार्य', labelHi: 'प्लास्टर कार्य (सतह अनुसार)', labelEn: 'Plastering Work', rateMultiplier: 1 },
        ],
      },
      {
        id: 'builtUpAreaSqft',
        labelHi: 'मकान का कुल निर्मित क्षेत्र (Built-up Area Sq.Ft)',
        labelEn: 'Built-up Area (Sq.Ft)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['mason_full_contract'],
        placeholderHi: 'उदा. 1000',
        unitHi: 'Sq.Ft',
        min: 50,
      },
      {
        id: 'wallDimensions',
        labelHi: 'दीवार का नाप (लंबाई × ऊंचाई फीट में, या कुल Sq.Ft)',
        labelEn: 'Wall Measurement (L x H or Sq.Ft)',
        type: 'text',
        mandatory: true,
        visibleInModes: ['mason_sqft'],
        placeholderHi: 'उदा. 20ft × 10ft (9 इंच दीवार) = 200 Sq.Ft',
      },
      {
        id: 'plasterSurface',
        labelHi: 'प्लास्टर होने वाली सतह चुनें',
        labelEn: 'Surface to be Plastered',
        type: 'select',
        mandatory: false,
        visibleInModes: ['mason_sqft'],
        options: [
          { value: 'कोई प्लास्टर नहीं / केवल चिनाई', labelHi: 'केवल चिनाई (प्लास्टर अभी नहीं)', labelEn: 'Masonry Only' },
          { value: 'अंदरूनी दीवार (12mm सिंगल कोट)', labelHi: 'अंदरूनी दीवार (12mm फिनिश)', labelEn: 'Internal Wall (12mm)' },
          { value: 'बाहरी दीवार (20mm डबल कोट वाटरप्रूफ)', labelHi: 'बाहरी दीवार (20mm डबल कोट)', labelEn: 'External Wall (20mm)' },
          { value: 'सीलिंग / छत प्लास्टर', labelHi: 'छत / सीलिंग प्लास्टर (6mm)', labelEn: 'Ceiling Plaster' },
          { value: 'अंदर + बाहर + छत संपूर्ण', labelHi: 'अंदर + बाहर + छत सभी सतह', labelEn: 'All Surfaces' },
        ],
      },
      {
        id: 'masonryCubicMeters',
        labelHi: 'मोटी चिनाई का घन आयतन (Cubic Meters m³)',
        labelEn: 'Thick Masonry Volume (m³)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['mason_cubic_meter'],
        placeholderHi: 'उदा. 12',
        unitHi: 'घन मीटर (m³)',
        min: 1,
      },
    ],
  },

  painter: {
    id: 'painter',
    registrationLabelHi: 'पेंटर / पुट्टी वाला',
    nameHindi: 'पेंटर / पुट्टी वाला',
    nameEng: 'Painter / Putty',
    group: 'CONSTRUCTION',
    icon: 'format-paint',
    color: '#7C3AED',
    aliases: ['painter', 'पेंटर', 'पुट्टी', 'रंगाई'],
    researchSummaryHi:
      'भारत मानक: केवल मजदूरी ₹7–₹12/sq.ft, पुट्टी+पेंट सामग्री सहित ₹15–₹28/sq.ft। आम तौर पर पेंटेबल दीवार+छत क्षेत्रफल फ्लोर कारपेट एरिया का ~3 गुना होता है।',
    rateModes: [
      {
        id: 'painter_sqft',
        labelHi: 'प्रति वर्ग फुट (Sq.Ft)',
        labelEn: 'Per Sq.Ft',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 14,
        fairRangeHi: '₹8-₹12 (सिर्फ मजदूरी) | ₹16-₹26 (सामान सहित)',
        defaultUnits: 800,
        minAllowedRate: 4,
        maxAllowedRate: 150,
        researchNoteHi: 'दीवार/छत, कोट की संख्या और सामान (मटेरियल) के अनुसार अलग दर लागू होगी।',
      },
      {
        id: 'painter_daily',
        labelHi: 'दिहाड़ी (8 घंटे)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 850,
        fairRangeHi: '₹750 - ₹1,000 / दिन',
        defaultUnits: 1,
        minAllowedRate: 350,
        maxAllowedRate: 2500,
        isDailyLike: true,
        researchNoteHi: '1 कमरे का टचअप, दरवाजे/ग्रिल पेंटिंग या छोटे काम के लिए।',
      },
      {
        id: 'painter_full_contract',
        labelHi: 'पूरा ठेका (Full House/Room)',
        labelEn: 'Full Contract',
        unitHi: 'पूरा पैकेज',
        unitEn: 'lumpsum package',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 14000,
        fairRangeHi: '₹12,000 - ₹32,000 (2BHK/3BHK पैकेज)',
        defaultUnits: 1,
        minAllowedRate: 2000,
        maxAllowedRate: 500000,
        researchNoteHi: 'संपूर्ण फ्लैट/बंगले की पुट्टी, प्राइमर व 2-3 कोट फिनिश।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'प्रति Sq.Ft दर (केवल मजदूरी) *',
        subLabelHi: 'बिना पेंट-पुट्टी के सिर्फ कारीगरी रेट',
        unitHi: '₹ / sq.ft',
        placeholder: '10',
        mandatoryWhenModes: ['painter_sqft', 'painter_full_contract'],
        isNumeric: true,
        min: 4,
        max: 200,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'withMaterialRateSqft',
        labelHi: 'सामान सहित दर (With Material)',
        subLabelHi: 'बिरला पुट्टी + प्राइमर + इमल्शन सहित प्रति Sq.Ft',
        unitHi: '₹ / sq.ft',
        placeholder: '20',
        isNumeric: true,
        min: 8,
        max: 300,
        cardTitleHi: 'सामान सहित (With Material)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'पेंटर दिहाड़ी (8 घंटे) *',
        subLabelHi: 'मास्टर पेंटर की रोजाना मजदूरी',
        unitHi: '₹ / दिन',
        placeholder: '850',
        mandatoryWhenModes: ['painter_daily'],
        isNumeric: true,
        min: 350,
        max: 3000,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर / घिसाई कारीगर दिहाड़ी',
        subLabelHi: 'सैंडिंग व सफाई सहायक',
        unitHi: '₹ / दिन',
        placeholder: '500',
        isNumeric: true,
        min: 200,
        max: 2000,
        mapsToColumn: 'helperRate',
      },
    ],
    bookingFields: [
      {
        id: 'paintSurface',
        labelHi: 'पेंट होने वाली सतह (Surface) चुनें',
        labelEn: 'Paint Surface',
        type: 'select',
        mandatory: true,
        visibleInModes: ['painter_sqft'],
        options: [
          { value: 'दीवार + छत दोनों', labelHi: 'दीवार + छत दोनों (Complete Room)', labelEn: 'Walls + Ceiling', rateMultiplier: 1.05 },
          { value: 'केवल दीवार (Walls)', labelHi: 'केवल दीवार (Walls Only)', labelEn: 'Walls Only', rateMultiplier: 1 },
          { value: 'केवल छत (Ceiling)', labelHi: 'केवल छत (Ceiling - +10% ऊंचाई श्रम)', labelEn: 'Ceiling Only', rateMultiplier: 1.1 },
          { value: 'बाहरी दीवार (Exterior)', labelHi: 'बाहरी दीवार (स्कैफोल्डिंग व वेदरकोट)', labelEn: 'Exterior Walls', rateMultiplier: 1.25 },
        ],
      },
      {
        id: 'paintCoats',
        labelHi: 'पुट्टी व पेंट कोट की संख्या चुनें',
        labelEn: 'Number of Coats',
        type: 'select',
        mandatory: true,
        visibleInModes: ['painter_sqft'],
        options: [
          { value: '2 कोट पुट्टी + 1 प्राइमर + 2 कोट पेंट', labelHi: '2 कोट पुट्टी + 1 प्राइमर + 2 कोट पेंट (नया काम)', labelEn: '2 Putty + 1 Primer + 2 Coats', rateMultiplier: 1.3 },
          { value: '1 प्राइमर + 2 कोट पेंट (रीपेंट)', labelHi: '1 प्राइमर + 2 कोट पेंट (रीपेंट)', labelEn: '1 Primer + 2 Coats Repaint', rateMultiplier: 1.0 },
          { value: 'केवल 2 कोट पेंट', labelHi: 'केवल 2 कोट इमल्शन पेंट', labelEn: '2 Coats Only', rateMultiplier: 0.85 },
          { value: '3 कोट प्रीमियम / रॉयल फिनिश', labelHi: '3 कोट प्रीमियम / टेक्सचर फिनिश', labelEn: '3 Coats Premium Finish', rateMultiplier: 1.45 },
        ],
      },
      {
        id: 'paintMaterialScope',
        labelHi: 'दर का दायरा: सिर्फ मजदूरी या सामान सहित?',
        labelEn: 'Labor Only vs With Material',
        type: 'select',
        mandatory: true,
        visibleInModes: ['painter_sqft'],
        options: [
          { value: 'सिर्फ मजदूरी (Labor Only)', labelHi: 'सिर्फ मजदूरी (सामान ग्राहक का)', labelEn: 'Labor Only', rateMultiplier: 1 },
          { value: 'सामान सहित (With Material)', labelHi: 'सामान सहित (पुट्टी + प्राइमर + पेंट)', labelEn: 'With Material (Putty+Paint)', rateMultiplier: 1.85 },
        ],
      },
    ],
  },

  electrician: {
    id: 'electrician',
    registrationLabelHi: 'इलेक्ट्रीशियन',
    nameHindi: 'इलेक्ट्रीशियन',
    nameEng: 'Electrician',
    group: 'CONSTRUCTION',
    icon: 'flash',
    color: '#EA580C',
    aliases: ['electrician', 'इलेक्ट्रीशियन', 'बिजली', 'वायरिंग'],
    researchSummaryHi:
      'मानक दरें: नई वायरिंग ₹90–₹150/पॉइंट, पंखा/गीजर/लाइट फिटिंग ₹150–₹400/पीस, मेन केबल ₹40–₹90/मीटर और दिहाड़ी ₹850–₹1,100/दिन।',
    rateModes: [
      {
        id: 'electrician_point',
        labelHi: 'प्रति पॉइंट (नई वायरिंग)',
        labelEn: 'Per Point (Wiring)',
        unitHi: 'प्रति पॉइंट',
        unitEn: 'per point',
        primaryRateTypeLabel: 'प्रति पॉइंट',
        backendBookingMode: 'ठेका',
        defaultRate: 110,
        fairRangeHi: '₹90 - ₹150 / पॉइंट (झिरी + पाइप + वायर + स्विच)',
        defaultUnits: 25,
        minAllowedRate: 40,
        maxAllowedRate: 800,
        researchNoteHi: 'स्विच, सॉकेट, लाइट व फैन पॉइंट प्रति पॉइंट के हिसाब से गिने जाते हैं।',
      },
      {
        id: 'electrician_fitting',
        labelHi: 'प्रति फिटिंग / पीस (पंखा/उपकरण)',
        labelEn: 'Per Fitting / Piece',
        unitHi: 'प्रति पीस / फिटिंग',
        unitEn: 'per fitting',
        primaryRateTypeLabel: 'प्रति फिटिंग/पीस',
        backendBookingMode: 'ठेका',
        defaultRate: 200,
        fairRangeHi: 'पंखा ₹150-₹250 | झूमर/गीजर ₹350-₹600 / पीस',
        defaultUnits: 4,
        minAllowedRate: 50,
        maxAllowedRate: 2500,
        researchNoteHi: 'सीलिंग फैन, एग्जॉस्ट, ट्यूबलाइट, MCB या गीजर लगाने का प्रति पीस रेट।',
      },
      {
        id: 'electrician_daily',
        labelHi: 'दिहाड़ी (8 घंटे)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 900,
        fairRangeHi: '₹800 - ₹1,100 / दिन',
        defaultUnits: 1,
        minAllowedRate: 350,
        maxAllowedRate: 3000,
        isDailyLike: true,
        researchNoteHi: 'दिनभर के मेंटेनेंस, फॉल्ट टेस्टिंग और विभिन्न रिपेयर कार्यों के लिए।',
      },
      {
        id: 'electrician_cable_meter',
        labelHi: 'मेन केबल / लाइन (प्रति मीटर)',
        labelEn: 'Main Cable (Per Meter)',
        unitHi: 'प्रति मीटर',
        unitEn: 'per meter',
        primaryRateTypeLabel: 'प्रति मीटर',
        backendBookingMode: 'ठेका',
        defaultRate: 55,
        fairRangeHi: '₹35 - ₹95 / मीटर (सब-मेन / आर्मर्ड केबल)',
        defaultUnits: 30,
        minAllowedRate: 15,
        maxAllowedRate: 500,
        researchNoteHi: 'मीटर बोर्ड से घर की मुख्य MCB तक भारी केबल बिछाने के लिए।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'नई वायरिंग दर (प्रति पॉइंट) *',
        subLabelHi: 'कंसील्ड या केसिंग वायरिंग प्रति पॉइंट रेट',
        unitHi: '₹ / पॉइंट',
        placeholder: '110',
        mandatoryWhenModes: ['electrician_point'],
        isNumeric: true,
        min: 30,
        max: 1500,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'fanFittingPerPieceRate',
        labelHi: 'पंखा / फिटिंग लगाना (प्रति पंखा/पीस) *',
        subLabelHi: 'सीलिंग फैन, स्विच बोर्ड, लाइट फिटिंग प्रति पीस',
        unitHi: '₹ / पीस',
        placeholder: '200',
        mandatoryWhenModes: ['electrician_fitting'],
        isNumeric: true,
        min: 40,
        max: 3000,
        cardTitleHi: 'पंखा / फिटिंग (प्रति पीस)',
      },
      {
        key: 'mainCablePerMeterRate',
        labelHi: 'मेन केबल बिछाने की दर (प्रति मीटर) *',
        subLabelHi: 'सब-मेन / थ्री-फेज आर्मर्ड केबल खींचने का रेट',
        unitHi: '₹ / मीटर',
        placeholder: '55',
        mandatoryWhenModes: ['electrician_cable_meter'],
        isNumeric: true,
        min: 10,
        max: 500,
        cardTitleHi: 'मेन केबल (प्रति मीटर)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'इलेक्ट्रीशियन दिहाड़ी (8 घंटे) *',
        subLabelHi: 'पूरे दिन के काम की मजदूरी',
        unitHi: '₹ / दिन',
        placeholder: '900',
        mandatoryWhenModes: ['electrician_daily'],
        isNumeric: true,
        min: 350,
        max: 3500,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर की दिहाड़ी',
        subLabelHi: 'वायर पुलिंग व ग्रूव कटिंग सहायक',
        unitHi: '₹ / दिन',
        placeholder: '500',
        isNumeric: true,
        min: 200,
        max: 2000,
        mapsToColumn: 'helperRate',
      },
    ],
    bookingFields: [
      {
        id: 'wiringPoints',
        labelHi: 'नई वायरिंग पॉइंट्स की संख्या (Light/Switch Points)',
        labelEn: 'New Wiring Points Count',
        type: 'number',
        mandatory: true,
        visibleInModes: ['electrician_point'],
        placeholderHi: 'उदा. 25',
        unitHi: 'पॉइंट',
        min: 1,
      },
      {
        id: 'fansOrFixtures',
        labelHi: 'पंखे / फिटिंग पीस की संख्या (Fans / Fixtures)',
        labelEn: 'Fans / Fixtures Count',
        type: 'number',
        mandatory: true,
        visibleInModes: ['electrician_fitting'],
        placeholderHi: 'उदा. 5',
        unitHi: 'पीस',
        min: 1,
      },
      {
        id: 'mainCableMeters',
        labelHi: 'मेन केबल की लंबाई (Meters)',
        labelEn: 'Main Cable Length (Meters)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['electrician_cable_meter'],
        placeholderHi: 'उदा. 35',
        unitHi: 'मीटर',
        min: 1,
      },
    ],
  },

  plumber: {
    id: 'plumber',
    registrationLabelHi: 'प्लंबर',
    nameHindi: 'प्लंबर',
    nameEng: 'Plumber',
    group: 'CONSTRUCTION',
    icon: 'pipe',
    color: '#0284C7',
    aliases: ['plumber', 'प्लंबर', 'सेनेटरी', 'पाइप'],
    researchSummaryHi:
      'प्लंबिंग दरें: फिटिंग ₹200–₹450/नग, कंसील्ड पॉइंट ₹220–₹350/पॉइंट, पूरा बाथरूम ₹3,500–₹6,000, छोटा रिपेयर ₹199–₹349/विज़िट और दिहाड़ी ₹850/दिन।',
    rateModes: [
      {
        id: 'plumber_fitting',
        labelHi: 'प्रति फिटिंग (नल/कमोड/बेसिन)',
        labelEn: 'Per Fitting',
        unitHi: 'प्रति फिटिंग',
        unitEn: 'per fitting',
        primaryRateTypeLabel: 'प्रति फिटिंग',
        backendBookingMode: 'ठेका',
        defaultRate: 280,
        fairRangeHi: '₹200 - ₹550 / फिटिंग',
        defaultUnits: 5,
        minAllowedRate: 80,
        maxAllowedRate: 2500,
        researchNoteHi: 'वॉल मिक्सर, शावर, कमोड, सिंक, गीजर या नल लगाने का रेट।',
      },
      {
        id: 'plumber_point',
        labelHi: 'प्रति पॉइंट / लाइन',
        labelEn: 'Per Point / Line',
        unitHi: 'प्रति पॉइंट',
        unitEn: 'per point',
        primaryRateTypeLabel: 'प्रति पॉइंट',
        backendBookingMode: 'ठेका',
        defaultRate: 250,
        fairRangeHi: '₹220 - ₹380 / पॉइंट (CPVC/UPVC + प्रेशर टेस्ट)',
        defaultUnits: 10,
        minAllowedRate: 100,
        maxAllowedRate: 1200,
        researchNoteHi: 'नए बाथरूम/किचन में गर्म-ठंडे पानी व ड्रेनेज पॉइंट बनाना।',
      },
      {
        id: 'plumber_bathroom',
        labelHi: 'पूरा बाथरूम पैकेज',
        labelEn: 'Complete Bathroom',
        unitHi: 'प्रति बाथरूम',
        unitEn: 'per bathroom',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 4500,
        fairRangeHi: '₹3,500 - ₹6,500 / बाथरूम (जियारी + पाइप + सेनेटरी फिटिंग)',
        defaultUnits: 1,
        minAllowedRate: 1500,
        maxAllowedRate: 25000,
        researchNoteHi: 'संपूर्ण बाथरूम में कंसील्ड डाइवर्टर से लेकर फाइनल एक्सेसरी फिटिंग तक।',
      },
      {
        id: 'plumber_visit',
        labelHi: 'छोटा रिपेयर / विज़िट',
        labelEn: 'Small Repair / Visit',
        unitHi: 'प्रति काम / विज़िट',
        unitEn: 'per visit',
        primaryRateTypeLabel: 'प्रति विजिट',
        backendBookingMode: 'क्विक रिपेयर',
        defaultRate: 199,
        fairRangeHi: '₹199 - ₹349 / विज़िट (लीकेज/ब्लॉकेज/वॉशर)',
        defaultUnits: 1,
        minAllowedRate: 99,
        maxAllowedRate: 1500,
        researchNoteHi: 'नल लीकेज, सिंक ड्रेन जाम या टंकी फ्लोट वाल्व रिपेयर के लिए।',
      },
      {
        id: 'plumber_daily',
        labelHi: 'दिहाड़ी (दिनभर का काम)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 850,
        fairRangeHi: '₹800 - ₹1,000 / दिन',
        defaultUnits: 1,
        minAllowedRate: 350,
        maxAllowedRate: 3000,
        isDailyLike: true,
        researchNoteHi: 'एक से ज्यादा छोटे रिपेयर व पूरे दिन के प्लंबिंग मेंटेनेंस हेतु।',
      },
    ],
    contractorFields: [
      {
        key: 'fittingPerPieceRate',
        labelHi: 'प्रति फिटिंग दर (नल/बेसिन/मिक्सर) *',
        subLabelHi: 'नया सेनेटरी आइटम इंस्टॉल करने का रेट',
        unitHi: '₹ / फिटिंग',
        placeholder: '280',
        mandatoryWhenModes: ['plumber_fitting'],
        isNumeric: true,
        min: 50,
        max: 3000,
        cardTitleHi: 'सेनेटरी फिटिंग (प्रति नग)',
      },
      {
        key: 'pointLineRate',
        labelHi: 'प्रति पॉइंट / पाइपलाइन दर *',
        subLabelHi: 'CPVC/SWR लाइन का प्रति पॉइंट रेट',
        unitHi: '₹ / पॉइंट',
        placeholder: '250',
        mandatoryWhenModes: ['plumber_point'],
        isNumeric: true,
        min: 80,
        max: 1500,
        cardTitleHi: 'पाइपलाइन पॉइंट',
      },
      {
        key: 'contractUnitRate',
        labelHi: 'पूरा बाथरूम पैकेज दर *',
        subLabelHi: '1 बाथरूम की संपूर्ण फिटिंग का ठेका',
        unitHi: '₹ / बाथरूम',
        placeholder: '4500',
        mandatoryWhenModes: ['plumber_bathroom'],
        isNumeric: true,
        min: 1000,
        max: 25000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'visitChargeRate',
        labelHi: 'छोटा रिपेयर / विज़िट चार्ज *',
        subLabelHi: 'इमरजेंसी लीकेज या छोटे काम की शुरुआती विज़िट',
        unitHi: '₹ / विज़िट',
        placeholder: '199',
        mandatoryWhenModes: ['plumber_visit'],
        isNumeric: true,
        min: 99,
        max: 2000,
        cardTitleHi: 'रिपेयर / विज़िट चार्ज',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'प्लंबर दिहाड़ी (दिनभर का काम) *',
        subLabelHi: '8 घंटे शिफ्ट मजदूरी',
        unitHi: '₹ / दिन',
        placeholder: '850',
        mandatoryWhenModes: ['plumber_daily'],
        isNumeric: true,
        min: 350,
        max: 3500,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर की दिहाड़ी',
        subLabelHi: 'दीवार झिरी व फिटिंग सहायक',
        unitHi: '₹ / दिन',
        placeholder: '500',
        isNumeric: true,
        min: 200,
        max: 2000,
        mapsToColumn: 'helperRate',
      },
    ],
    bookingFields: [
      {
        id: 'plumberWorkScope',
        labelHi: 'काम का प्रकार चुनें',
        labelEn: 'Plumbing Work Type',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'छोटा रिपेयर / लीकेज (प्रति विज़िट)', labelHi: 'छोटा रिपेयर / लीकेज (प्रति विज़िट)', labelEn: 'Minor Repair / Visit' },
          { value: 'नल / कमोड / गीजर फिटिंग', labelHi: 'नल / कमोड / गीजर फिटिंग (प्रति नग)', labelEn: 'Fixture Installation' },
          { value: 'नई पाइपलाइन (प्रति पॉइंट)', labelHi: 'नई पाइपलाइन (प्रति पॉइंट/लाइन)', labelEn: 'New Point / Line' },
          { value: 'पूरा बाथरूम ठेका', labelHi: 'पूरा बाथरूम निर्माण ठेका', labelEn: 'Complete Bathroom Contract' },
        ],
      },
      {
        id: 'plumbingCount',
        labelHi: 'फिटिंग / पॉइंट्स / बाथरूम की गिनती',
        labelEn: 'Fittings / Points / Bathrooms Count',
        type: 'number',
        mandatory: true,
        visibleInModes: ['plumber_fitting', 'plumber_point', 'plumber_bathroom'],
        placeholderHi: 'उदा. 4',
        unitHi: 'यूनिट',
        min: 1,
      },
    ],
  },

  tiling: {
    id: 'tiling',
    registrationLabelHi: 'टाइल / मार्बल वाला',
    nameHindi: 'टाइल / मार्बल वाला',
    nameEng: 'Tiles & Marble Fixer',
    group: 'CONSTRUCTION',
    icon: 'view-grid',
    color: '#059669',
    aliases: ['tiling', 'टाइल', 'टाइल्स', 'मार्बल', 'ग्रेनाइट'],
    researchSummaryHi:
      'टाइल-मार्बल दरें: फर्श ₹22–₹35/sq.ft, दीवार ₹25–₹40/sq.ft, स्कर्टिंग व पत्थर की एज पॉलिश (मोल्डिंग) अलग से ₹25–₹75/रनिंग फुट।',
    rateModes: [
      {
        id: 'tiling_sqft',
        labelHi: 'प्रति वर्ग फुट (फर्श & दीवार)',
        labelEn: 'Per Sq.Ft (Floor & Wall)',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 26,
        fairRangeHi: '₹20 - ₹40 / sq.ft (सामान्य टाइल) | ₹45 - ₹85 / sq.ft (ग्रेनाइट/मार्बल)',
        defaultUnits: 500,
        minAllowedRate: 12,
        maxAllowedRate: 500,
        researchNoteHi: 'फर्श और दीवार के वर्ग फुट व स्कर्टिंग/एज पॉलिश के रनिंग फुट अलग गिने जाते हैं।',
      },
      {
        id: 'tiling_rft',
        labelHi: 'प्रति रनिंग फुट (स्कर्टिंग & एज पॉलिश)',
        labelEn: 'Per Running Ft (Skirting & Edge Polish)',
        unitHi: 'प्रति रनिंग फुट',
        unitEn: 'per running ft',
        primaryRateTypeLabel: 'शीट/रनिंग फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 45,
        fairRangeHi: 'स्कर्टिंग ₹20-₹35/rft | ग्रेनाइट बुल-नोज़ एज पॉलिश ₹45-₹85/rft',
        defaultUnits: 120,
        minAllowedRate: 12,
        maxAllowedRate: 400,
        researchNoteHi: 'किचन काउंटर, सीढ़ियों की नोज़िंग व दीवार स्कर्टिंग के लिए रनिंग फुट।',
      },
      {
        id: 'tiling_daily',
        labelHi: 'दिहाड़ी (8 घंटे)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 1000,
        fairRangeHi: '₹900 - ₹1,250 / दिन',
        defaultUnits: 1,
        minAllowedRate: 400,
        maxAllowedRate: 3500,
        isDailyLike: true,
        researchNoteHi: 'टूटी हुई टाइल बदलने, ग्राउटिंग या छोटे पैच वर्क के लिए।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'फर्श टाइल फिटिंग दर (Sq.Ft) *',
        subLabelHi: 'फ्लोरिंग टाइल/मार्बल लगाने की मुख्य दर',
        unitHi: '₹ / sq.ft',
        placeholder: '26',
        mandatoryWhenModes: ['tiling_sqft'],
        isNumeric: true,
        min: 10,
        max: 500,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'wallTileSqftRate',
        labelHi: 'दीवार टाइल फिटिंग दर (Wall Sq.Ft)',
        subLabelHi: 'बाथरूम व किचन वॉल टाइल कटिंग सहित',
        unitHi: '₹ / sq.ft',
        placeholder: '32',
        isNumeric: true,
        min: 12,
        max: 500,
        cardTitleHi: 'दीवार टाइल (Sq.Ft)',
      },
      {
        key: 'skirtingEdgeRftRate',
        labelHi: 'स्कर्टिंग व पत्थर एज पॉलिश (रनिंग फुट) *',
        subLabelHi: '4" स्कर्टिंग, डबल मोल्डिंग व सीढ़ी नोज़िंग दर',
        unitHi: '₹ / रनिंग ft',
        placeholder: '45',
        mandatoryWhenModes: ['tiling_rft'],
        isNumeric: true,
        min: 12,
        max: 500,
        cardTitleHi: 'स्कर्टिंग & एज पॉलिश (rft)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'कारीगर दिहाड़ी (8 घंटे) *',
        subLabelHi: 'रोज़ाना शिफ्ट चार्ज',
        unitHi: '₹ / दिन',
        placeholder: '1000',
        mandatoryWhenModes: ['tiling_daily'],
        isNumeric: true,
        min: 400,
        max: 4000,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर की दिहाड़ी',
        subLabelHi: 'घोल बनाने व टाइल कटिंग सहायक',
        unitHi: '₹ / दिन',
        placeholder: '550',
        isNumeric: true,
        min: 200,
        max: 2000,
        mapsToColumn: 'helperRate',
      },
    ],
    bookingFields: [
      {
        id: 'floorTileSqft',
        labelHi: 'फर्श का क्षेत्रफल (Floor Sq.Ft)',
        labelEn: 'Floor Area (Sq.Ft)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['tiling_sqft'],
        placeholderHi: 'उदा. 400',
        unitHi: 'Sq.Ft',
        min: 1,
      },
      {
        id: 'wallTileSqft',
        labelHi: 'दीवार टाइल्स का क्षेत्रफल (Wall Sq.Ft)',
        labelEn: 'Wall Area (Sq.Ft)',
        type: 'number',
        mandatory: false,
        visibleInModes: ['tiling_sqft'],
        placeholderHi: 'उदा. 180 (या 0)',
        unitHi: 'Sq.Ft',
        min: 0,
      },
      {
        id: 'skirtingEdgeRft',
        labelHi: 'स्कर्टिंग व पत्थर एज पॉलिश (रनिंग फुट)',
        labelEn: 'Skirting & Stone Edge Polish (Running Ft)',
        type: 'number',
        mandatory: false,
        visibleInModes: ['tiling_sqft', 'tiling_rft'],
        placeholderHi: 'उदा. 85',
        unitHi: 'रनिंग ft',
        min: 0,
        helperNoteHi: 'दीवार के निचले कोने (Skirting) व सीढ़ी/किचन पत्थर पॉलिश की लंबाई अलग जुड़ती है।',
      },
    ],
  },

  false_ceiling: {
    id: 'false_ceiling',
    registrationLabelHi: 'POP / फॉल्स सीलिंग वाला',
    nameHindi: 'POP / फॉल्स सीलिंग वाला',
    nameEng: 'POP & False Ceiling',
    group: 'CONSTRUCTION',
    icon: 'ceiling-light',
    color: '#0D9488',
    aliases: ['false_ceiling', 'pop', 'सीलिंग', 'फॉल्स सीलिंग', 'जिप्सम'],
    researchSummaryHi:
      'POP/जिप्सम फॉल्स सीलिंग: मुख्य सपाट छत ₹75–₹125/sq.ft, जबकि कोव लाइट, लाइट स्लॉट व पर्दे का पेलमेट अलग से ₹65–₹115/रनिंग फुट गिना जाता है।',
    rateModes: [
      {
        id: 'pop_sqft',
        labelHi: 'प्रति वर्ग फुट (मुख्य छत)',
        labelEn: 'Per Sq.Ft (Main Ceiling)',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 95,
        fairRangeHi: '₹75 - ₹135 / sq.ft (GI चैनल + जिप्सम/POP)',
        defaultUnits: 250,
        minAllowedRate: 35,
        maxAllowedRate: 500,
        researchNoteHi: 'मुख्य सपाट/प्लस-माइनस छत वर्ग फुट में और कोव/पेलमेट रनिंग फुट में।',
      },
      {
        id: 'pop_rft',
        labelHi: 'प्रति रनिंग फुट (कोव, स्लॉट & पेलमेट)',
        labelEn: 'Per Running Ft (Cove & Pelmet)',
        unitHi: 'प्रति रनिंग फुट',
        unitEn: 'per running ft',
        primaryRateTypeLabel: 'शीट/रनिंग फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 80,
        fairRangeHi: '₹65 - ₹120 / रनिंग ft (कोव, LED स्लॉट & पर्दा पेलमेट)',
        defaultUnits: 70,
        minAllowedRate: 30,
        maxAllowedRate: 500,
        researchNoteHi: 'कोव कटआउट, हिडन LED लाइट स्लॉट और कर्टेन पेलमेट रनिंग फुट से गिने जाते हैं।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'मुख्य छत फॉल्स सीलिंग (प्रति Sq.Ft) *',
        subLabelHi: 'Saint-Gobain/Gyproc या POP मेश सहित मुख्य छत दर',
        unitHi: '₹ / sq.ft',
        placeholder: '95',
        mandatoryWhenModes: ['pop_sqft'],
        isNumeric: true,
        min: 30,
        max: 500,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'coveAndSlotRftRate',
        labelHi: 'कोव / लाइट स्लॉट / पर्दा पेलमेट (रनिंग फुट) *',
        subLabelHi: 'कर्टेन पेलमेट और LED कोव लाइट बॉर्डर दर',
        unitHi: '₹ / रनिंग ft',
        placeholder: '80',
        mandatoryWhenModes: ['pop_rft'],
        isNumeric: true,
        min: 25,
        max: 500,
        cardTitleHi: 'कोव, लाइट स्लॉट & पेलमेट (rft)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'POP कारीगर दिहाड़ी (रिपेयर/टचअप)',
        subLabelHi: 'छोटी मरम्मत या कॉर्निस मोल्डिंग हेतु',
        unitHi: '₹ / दिन',
        placeholder: '950',
        isNumeric: true,
        min: 400,
        max: 3500,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर की दिहाड़ी',
        subLabelHi: 'सीलिंग चैनल व मचान सहायक',
        unitHi: '₹ / दिन',
        placeholder: '550',
        isNumeric: true,
        min: 200,
        max: 2000,
        mapsToColumn: 'helperRate',
      },
    ],
    bookingFields: [
      {
        id: 'popBoardType',
        labelHi: 'फॉल्स सीलिंग मटेरियल व प्रकार चुनें',
        labelEn: 'Ceiling System',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'जिप्सम बोर्ड + GI फ्रेम (संपूर्ण)', labelHi: 'जिप्सम बोर्ड + GI फ्रेम 0.5mm', labelEn: 'Gypsum + GI Frame' },
          { value: 'POP जाली + मोल्डिंग (हैंड फिनिश)', labelHi: 'सुपर व्हाइट POP + जाली (मजबूत)', labelEn: 'POP + Mesh' },
          { value: 'केवल कारीगरी (सामान ग्राहक का)', labelHi: 'केवल लेबर (मटेरियल ग्राहक देगा)', labelEn: 'Labor Only' },
        ],
      },
      {
        id: 'mainCeilingSqft',
        labelHi: 'मुख्य छत का क्षेत्रफल (Main Ceiling Sq.Ft)',
        labelEn: 'Main Ceiling Area (Sq.Ft)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['pop_sqft'],
        placeholderHi: 'उदा. 250',
        unitHi: 'Sq.Ft',
        min: 10,
      },
      {
        id: 'covePelmetRft',
        labelHi: 'कोव, लाइट स्लॉट व पर्दे का पेलमेट (Running Ft)',
        labelEn: 'Cove, Light Slot & Curtain Pelmet (Running Ft)',
        type: 'number',
        mandatory: false,
        visibleInModes: ['pop_sqft', 'pop_rft'],
        placeholderHi: 'उदा. 65',
        unitHi: 'रनिंग ft',
        min: 0,
        helperNoteHi: 'कोव, LED स्लॉट व पेलमेट की लंबाई रनिंग फुट में अलग जुड़ती है।',
      },
    ],
  },

  welder: {
    id: 'welder',
    registrationLabelHi: 'सरिया बाँधने वाला / ग्रिल फैब्रिकेटर',
    nameHindi: 'सरिया बाँधने वाला / ग्रिल फैब्रिकेटर',
    nameEng: 'Rebar Binder & Grill Fabricator',
    group: 'CONSTRUCTION',
    icon: 'torch',
    color: '#334155',
    aliases: ['welder', 'वेल्डर', 'सरिया', 'ग्रिल', 'फैब्रिकेटर', 'लोहा'],
    researchSummaryHi:
      'महत्वपूर्ण: सरिया कटिंग-बाँधने की मजदूरी ₹5–₹8/kg (₹5,000–₹7,500/टन) है, जबकि तैयार MS ग्रिल/गेट सप्लाई व फिटिंग ₹95–₹135/kg होती है—दोनों रेट अलग-अलग रखें।',
    rateModes: [
      {
        id: 'welder_kg',
        labelHi: 'प्रति किलो (Kg)',
        labelEn: 'Per Kg',
        unitHi: 'प्रति किलो (Kg)',
        unitEn: 'per kg',
        primaryRateTypeLabel: 'किलो वजन आधार',
        backendBookingMode: 'ठेका',
        defaultRate: 110,
        fairRangeHi: 'सरिया मजदूरी: ₹5-₹8/kg | तैयार ग्रिल सप्लाई+फिटिंग: ₹95-₹135/kg',
        defaultUnits: 120,
        minAllowedRate: 3,
        maxAllowedRate: 1000,
        researchNoteHi: 'चुनें कि यह सरिया बाँधने की मजदूरी है या तैयार ग्रिल सप्लाई व फिटिंग।',
      },
      {
        id: 'welder_ton',
        labelHi: 'प्रति टन (Ton - सरिया कार्य)',
        labelEn: 'Per Ton (Rebar)',
        unitHi: 'प्रति टन',
        unitEn: 'per ton',
        primaryRateTypeLabel: 'प्रति टन',
        backendBookingMode: 'ठेका',
        defaultRate: 5800,
        fairRangeHi: '₹4,800 - ₹7,800 / टन (TMT कटिंग, रिंग बनाना, बाँधना)',
        defaultUnits: 2,
        minAllowedRate: 2500,
        maxAllowedRate: 35000,
        researchNoteHi: 'स्लैब/बीम/कॉलम सरिया जाल बाँधने के लिए मानक प्रति टन (1000 Kg) दर।',
      },
      {
        id: 'welder_daily',
        labelHi: 'दिहाड़ी (8 घंटे)',
        labelEn: 'Daily Wage',
        unitHi: 'प्रति दिन',
        unitEn: 'per day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 900,
        fairRangeHi: '₹850 - ₹1,100 / दिन',
        defaultUnits: 1,
        minAllowedRate: 400,
        maxAllowedRate: 3500,
        isDailyLike: true,
        researchNoteHi: 'गेट वेल्डिंग रिपेयर, कब्जे वेल्ड करना या छोटे सरिया जोड़ने के लिए।',
      },
    ],
    contractorFields: [
      {
        key: 'rebarBindingPerKgRate',
        labelHi: 'सरिया बाँधने की मजदूरी (प्रति किलो) *',
        subLabelHi: 'केवल सरिया कटिंग, बेंडिंग व तार से बाँधना (TMT लेबर)',
        unitHi: '₹ / किलो',
        placeholder: '6',
        mandatoryWhenModes: ['welder_kg', 'welder_ton'],
        isNumeric: true,
        min: 2,
        max: 50,
        cardTitleHi: 'सरिया बाँधना (मजदूरी / Kg)',
      },
      {
        key: 'rebarBindingPerTonRate',
        labelHi: 'सरिया बाँधना (प्रति टन) *',
        subLabelHi: '1000 Kg स्लैब/फाउंडेशन सरिया बाँधने का ठेका',
        unitHi: '₹ / टन',
        placeholder: '5800',
        mandatoryWhenModes: ['welder_ton'],
        isNumeric: true,
        min: 2000,
        max: 25000,
        cardTitleHi: 'सरिया बाँधना (प्रति टन)',
      },
      {
        key: 'contractUnitRate',
        labelHi: 'तैयार ग्रिल सप्लाई व फिटिंग (अलग एंट्री) *',
        subLabelHi: 'MS खिड़की ग्रिल, रेलिंग या गेट लोहे व पेंट प्राइमर सहित प्रति किलो',
        unitHi: '₹ / किलो',
        placeholder: '110',
        mandatoryWhenModes: ['welder_kg'],
        isNumeric: true,
        min: 15,
        max: 600,
        mapsToColumn: 'contractUnitRate',
        cardTitleHi: 'तैयार ग्रिल सप्लाई व फिटिंग (/Kg)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'वेल्डर / सरिया मिस्त्री दिहाड़ी *',
        subLabelHi: '8 घंटे शिफ्ट चार्ज',
        unitHi: '₹ / दिन',
        placeholder: '900',
        mandatoryWhenModes: ['welder_daily'],
        isNumeric: true,
        min: 400,
        max: 3500,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'helperRate',
        labelHi: 'हेल्पर की दिहाड़ी',
        subLabelHi: 'सरिया मोड़ने व वेल्डिंग सहायक',
        unitHi: '₹ / दिन',
        placeholder: '550',
        isNumeric: true,
        min: 200,
        max: 2000,
        mapsToColumn: 'helperRate',
      },
    ],
    bookingFields: [
      {
        id: 'welderScope',
        labelHi: 'काम चुनें: सरिया बाँधना vs तैयार ग्रिल सप्लाई व फिटिंग',
        labelEn: 'Rebar Labor vs Grill Supply & Fit',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'सरिया बाँधने की मजदूरी (केवल लेबर)', labelHi: 'सरिया बाँधने की मजदूरी (केवल लेबर)', labelEn: 'Rebar Binding (Labor Only)' },
          { value: 'तैयार ग्रिल / रेलिंग सप्लाई व फिटिंग', labelHi: 'तैयार ग्रिल / गेट सप्लाई व फिटिंग (सामान सहित)', labelEn: 'Ready Grill Supply & Fitting' },
        ],
      },
      {
        id: 'steelWeightUnits',
        labelHi: 'अनुमानित वजन (किलो या टन में)',
        labelEn: 'Estimated Weight (Kg / Tons)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['welder_kg', 'welder_ton'],
        placeholderHi: 'उदा. 120',
        unitHi: 'Kg / टन',
        min: 1,
      },
    ],
  },

  aluminium_upvc: {
    id: 'aluminium_upvc',
    registrationLabelHi: 'एल्युमिनियम / uPVC / ग्लास वाला',
    nameHindi: 'एल्युमिनियम / uPVC / ग्लास वाला',
    nameEng: 'Aluminium, uPVC & Glazing',
    group: 'CONSTRUCTION',
    icon: 'window-maximize',
    color: '#0369A1',
    aliases: ['aluminium_upvc', 'aluminium', 'upvc', 'एल्युमिनियम', 'ग्लास', 'खिड़की'],
    researchSummaryHi:
      'एल्युमिनियम/uPVC खिड़कियां ₹320–₹680/sq.ft (या ₹3,450–₹7,300/m²) होती हैं। दर खिड़की के बाहरी नाप, ग्लास की मोटाई (5mm/8mm/12mm टफन) व फ्रेम पर निर्भर करती है।',
    rateModes: [
      {
        id: 'glazing_sqft',
        labelHi: 'प्रति वर्ग फुट (Sq.Ft)',
        labelEn: 'Per Sq.Ft',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 420,
        fairRangeHi: 'एल्युमिनियम ₹320-₹480 | uPVC ₹480-₹720 / sq.ft',
        defaultUnits: 48,
        minAllowedRate: 120,
        maxAllowedRate: 2500,
        researchNoteHi: 'बाहरी फ्रेम माप (चौड़ाई × ऊंचाई), ग्लास मोटाई और फिटिंग का दायरा दर्ज करें।',
      },
      {
        id: 'glazing_sqm',
        labelHi: 'प्रति वर्ग मीटर (Sq.M / m²)',
        labelEn: 'Per Sq.Meter',
        unitHi: 'प्रति वर्ग मीटर (m²)',
        unitEn: 'per m²',
        primaryRateTypeLabel: 'वर्ग मीटर',
        backendBookingMode: 'ठेका',
        defaultRate: 4500,
        fairRangeHi: '₹3,500 - ₹7,500 / m²',
        defaultUnits: 5,
        minAllowedRate: 1200,
        maxAllowedRate: 25000,
        researchNoteHi: 'कमर्शियल व बड़े प्रोजेक्ट टेंडर हेतु मानक m² माप (1 m² = 10.764 sq.ft)।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'एल्युमिनियम / uPVC सप्लाई+फिटिंग (प्रति Sq.Ft) *',
        subLabelHi: 'फ्रेम, 5mm/Toughened ग्लास व सिलिकॉन सील सहित दर',
        unitHi: '₹ / sq.ft',
        placeholder: '420',
        mandatoryWhenModes: ['glazing_sqft'],
        isNumeric: true,
        min: 100,
        max: 3000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'glazingSqMeterRate',
        labelHi: 'प्रति वर्ग मीटर दर (m²) *',
        subLabelHi: 'मीटर माप के प्रोजेक्ट्स हेतु',
        unitHi: '₹ / m²',
        placeholder: '4500',
        mandatoryWhenModes: ['glazing_sqm'],
        isNumeric: true,
        min: 1000,
        max: 30000,
        cardTitleHi: 'ग्लेजिंग दर (प्रति वर्ग मीटर)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'ग्लास फिटर दिहाड़ी (रिपेयर/रोलर बदलना)',
        subLabelHi: 'स्लाइडिंग रोलर या सिलिकॉन रिपेयर हेतु',
        unitHi: '₹ / दिन',
        placeholder: '950',
        isNumeric: true,
        min: 400,
        max: 3500,
        mapsToColumn: 'dailyWageRate',
      },
    ],
    bookingFields: [
      {
        id: 'windowOuterSize',
        labelHi: 'खिड़की / पार्टीशन का बाहरी नाप (चौड़ाई × ऊंचाई)',
        labelEn: 'Window Outer Dimensions (W x H)',
        type: 'text',
        mandatory: true,
        placeholderHi: 'उदा. 5ft × 4ft (2 खिड़की) = 40 Sq.Ft',
      },
      {
        id: 'glassThickness',
        labelHi: 'ग्लास की मोटाई व टाइप चुनें',
        labelEn: 'Glass Thickness & Type',
        type: 'select',
        mandatory: true,
        options: [
          { value: '5mm क्लियर / टिंटेड ग्लास', labelHi: '5mm क्लियर / ब्राउन टिंटेड ग्लास', labelEn: '5mm Clear/Tinted', rateMultiplier: 1.0 },
          { value: '8mm टफन सेफ्टी ग्लास', labelHi: '8mm टफन (Toughened) ग्लास', labelEn: '8mm Toughened', rateMultiplier: 1.2 },
          { value: '12mm टफन ग्लास (शॉवर/ऑफिस)', labelHi: '12mm हेवी टफन ग्लास', labelEn: '12mm Heavy Toughened', rateMultiplier: 1.4 },
          { value: 'DGU डबल ग्लेज्ड साउंडप्रूफ', labelHi: 'DGU डबल ग्लेज्ड (साउंडप्रूफ / हीट इंसुलेशन)', labelEn: 'DGU Soundproof', rateMultiplier: 1.65 },
        ],
      },
      {
        id: 'frameAndScope',
        labelHi: 'फ्रेम और फिटिंग का दायरा चुनें',
        labelEn: 'Frame & Fitting Scope',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'uPVC 3-ट्रैक (ग्लास + मच्छर जाली + फिटिंग)', labelHi: 'uPVC 3-ट्रैक (ग्लास + मच्छर जाली + सिलिकॉन फिटिंग)', labelEn: 'uPVC 3-Track + Mesh + Fit' },
          { value: 'एल्युमिनियम 3-ट्रैक (जिंदल सेक्शन + ग्लास + फिटिंग)', labelHi: 'जिंदल एल्युमिनियम 3-ट्रैक (फ्रेम + ग्लास + फिटिंग)', labelEn: 'Aluminium 3-Track + Mesh' },
          { value: 'एल्युमिनियम 2-ट्रैक स्लाइडिंग + ग्लास', labelHi: 'एल्युमिनियम 2-ट्रैक (बिना जाली)', labelEn: 'Aluminium 2-Track' },
          { value: 'फ्रेमलेस टफन ग्लास पार्टीशन / डोर', labelHi: 'फ्रेमलेस टफन ग्लास + पैच फिटिंग', labelEn: 'Frameless Toughened + Patch Fit' },
          { value: 'केवल ग्लास बदलना (पुराने फ्रेम में)', labelHi: 'केवल टूटा ग्लास बदलना (पुराना फ्रेम)', labelEn: 'Glass Replacement Only' },
        ],
      },
    ],
  },

  waterproofing: {
    id: 'waterproofing',
    registrationLabelHi: 'वॉटरप्रूफिंग वाला',
    nameHindi: 'वॉटरप्रूफिंग वाला',
    nameEng: 'Waterproofing Specialist',
    group: 'CONSTRUCTION',
    icon: 'water-check',
    color: '#0E7490',
    aliases: ['waterproofing', 'वॉटरप्रूफिंग', 'वाटरप्रूफ', 'सीपेज'],
    researchSummaryHi:
      'वॉटरप्रूफिंग दरें: छत केमिकल + फाइबर मेश कोटिंग ₹40–₹75/sq.ft, बाहरी दीवार Damp-Proof ₹32–₹55/sq.ft, और बेसमेंट क्रिस्टलाइन इंजेक्शन ₹75–₹130/sq.ft (5-10 साल वारंटी)।',
    rateModes: [
      {
        id: 'wp_sqft',
        labelHi: 'प्रति वर्ग फुट (Sq.Ft)',
        labelEn: 'Per Sq.Ft',
        unitHi: 'प्रति वर्ग फुट',
        unitEn: 'per sq.ft',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 48,
        fairRangeHi: '₹35 - ₹95 / sq.ft (Dr. Fixit / Fosroc / APP शीट)',
        defaultUnits: 500,
        minAllowedRate: 18,
        maxAllowedRate: 500,
        researchNoteHi: 'सतह (छत, बाहरी दीवार या बेसमेंट) और कुल क्षेत्रफल के अनुसार सही केमिकल तय होता है।',
      },
      {
        id: 'wp_full_quote',
        labelHi: 'पूरे काम का कोटेशन (Lumpsum)',
        labelEn: 'Full Job Quotation',
        unitHi: 'पूरा पैकेज कोटेशन',
        unitEn: 'lumpsum quotation',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'भाव_पूछें',
        defaultRate: 18000,
        fairRangeHi: 'बाथरूम ट्रीटमेंट ₹6,500+ | टेरेस पैकेज ₹18,000+',
        defaultUnits: 1,
        minAllowedRate: 2500,
        maxAllowedRate: 500000,
        researchNoteHi: 'सीपेज जांच कर 5 से 10 वर्ष की वारंटी के साथ पक्का कोटेशन।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'वॉटरप्रूफिंग ट्रीटमेंट दर (प्रति Sq.Ft) *',
        subLabelHi: 'प्राइमर + 2 कोट केमिकल + फाइबर मेश सहित',
        unitHi: '₹ / sq.ft',
        placeholder: '48',
        alwaysMandatory: true,
        isNumeric: true,
        min: 15,
        max: 400,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'साइट जांच / इंस्पेक्शन या पैच दिहाड़ी',
        subLabelHi: 'छोटे क्रैक फिलिंग कार्य हेतु',
        unitHi: '₹ / दिन',
        placeholder: '900',
        isNumeric: true,
        min: 400,
        max: 3500,
        mapsToColumn: 'dailyWageRate',
      },
    ],
    bookingFields: [
      {
        id: 'waterproofingSurface',
        labelHi: 'ट्रीटमेंट की सतह चुनें (कहाँ सीलन/लीकेज है?)',
        labelEn: 'Select Waterproofing Surface',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'छत / टेरेस (Terrace)', labelHi: 'छत / टेरेस (Terrace Coating)', labelEn: 'Terrace / Roof' },
          { value: 'बाहरी दीवार (Exterior Wall)', labelHi: 'बाहरी दीवार (Damp-Proof Seal)', labelEn: 'Exterior Wall' },
          { value: 'बेसमेंट / लिफ्ट पिट', labelHi: 'बेसमेंट / अंडरग्राउंड पिट (Crystalline/Grouting)', labelEn: 'Basement' },
          { value: 'बाथरूम संकन स्लैब / टंकी', labelHi: 'बाथरूम संकन / पानी की टंकी', labelEn: 'Bathroom / Water Tank' },
        ],
      },
      {
        id: 'treatmentAreaSqft',
        labelHi: 'कितनी सतह पर ट्रीटमेंट होगा (कुल क्षेत्रफल Sq.Ft)',
        labelEn: 'Treatment Area (Sq.Ft)',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 500',
        unitHi: 'Sq.Ft',
        min: 10,
      },
    ],
  },

  ac_repair: {
    id: 'ac_repair',
    registrationLabelHi: 'AC मैकेनिक',
    nameHindi: 'AC मैकेनिक',
    nameEng: 'AC Mechanic',
    group: 'QUICK_REPAIR',
    icon: 'air-conditioner',
    color: '#0284C7',
    aliases: ['ac_repair', 'acrepair', 'ac', 'एसी', 'कंप्रेसर', 'कूलिंग'],
    researchSummaryHi:
      'AC सर्विस मानक: फोम जेट सर्विस ₹499–₹699, स्प्लिट AC इंस्टॉलेशन ₹1,200–₹1,600/AC। अतिरिक्त कॉपर पाइप ₹280–₹350/फुट (या ₹950–₹1,150/मीटर) अलग लाइन में जुड़ता है।',
    rateModes: [
      {
        id: 'ac_per_unit',
        labelHi: 'प्रति AC (इंस्टॉल / अनइंस्टॉल)',
        labelEn: 'Per AC Unit',
        unitHi: 'प्रति AC',
        unitEn: 'per AC',
        primaryRateTypeLabel: 'प्रति AC',
        backendBookingMode: 'ठेका',
        defaultRate: 1400,
        fairRangeHi: 'स्प्लिट AC इंस्टॉल ₹1,200 - ₹1,600 | विंडो AC ₹750 - ₹1,000',
        defaultUnits: 1,
        minAllowedRate: 400,
        maxAllowedRate: 5000,
        researchNoteHi: 'अतिरिक्त कॉपर पाइप व ड्रेन पाइप की दर नीचे अलग लाइन में जुड़ेगी।',
      },
      {
        id: 'ac_service_visit',
        labelHi: 'प्रति सर्विस / विज़िट',
        labelEn: 'Per Service / Visit',
        unitHi: 'प्रति सर्विस / विज़िट',
        unitEn: 'per service/visit',
        primaryRateTypeLabel: 'प्रति विजिट',
        backendBookingMode: 'क्विक रिपेयर',
        defaultRate: 499,
        fairRangeHi: 'जेट सर्विस ₹499 - ₹699 | गैस रिफिल ₹1,800 - ₹2,600 | चेकअप विज़िट ₹299',
        defaultUnits: 1,
        minAllowedRate: 199,
        maxAllowedRate: 5000,
        researchNoteHi: 'फोम-जेट वॉश, कूलिंग कॉइल क्लीनिंग या गैस लीकेज टेस्टिंग।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'प्रति AC इंस्टॉलेशन दर *',
        subLabelHi: 'नया स्प्लिट/विंडो AC फिटिंग चार्ज (बिना अतिरिक्त पाइप)',
        unitHi: '₹ / AC',
        placeholder: '1400',
        mandatoryWhenModes: ['ac_per_unit'],
        isNumeric: true,
        min: 400,
        max: 5000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'प्रति सर्विस / विज़िट दर *',
        subLabelHi: 'जेट-पंप AC सर्विस या डायग्नोसिस विज़िट शुल्क',
        unitHi: '₹ / सर्विस',
        placeholder: '499',
        mandatoryWhenModes: ['ac_service_visit'],
        isNumeric: true,
        min: 149,
        max: 4000,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'copperPipeRate',
        labelHi: 'अतिरिक्त कॉपर पाइप (अलग लाइन में) *',
        subLabelHi: 'इंसुलेशन + वायर सहित अतिरिक्त कॉपर पाइप की दर',
        unitHi: '₹ / फुट (या मीटर)',
        placeholder: '310',
        alwaysMandatory: true,
        isNumeric: true,
        min: 100,
        max: 2500,
        cardTitleHi: 'अतिरिक्त कॉपर पाइप (अलग लाइन)',
      },
    ],
    bookingFields: [
      {
        id: 'acServiceType',
        labelHi: 'AC काम का प्रकार चुनें',
        labelEn: 'AC Service / Job Type',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'स्प्लिट AC इंस्टॉलेशन', labelHi: 'नया स्प्लिट AC इंस्टॉलेशन (प्रति AC)', labelEn: 'Split AC Install' },
          { value: 'फोम-जेट डीप सर्विस', labelHi: 'फोम-जेट पंप सर्विस (प्रति AC)', labelEn: 'Foam-Jet Service' },
          { value: 'गैस चार्जिंग + वैक्यूम टेस्ट', labelHi: 'R32 / R410 गैस रिफिल + लीक चेक', labelEn: 'Gas Refill' },
          { value: 'AC अनइंस्टॉलेशन / शिफ्टिंग', labelHi: 'AC उतारना व दूसरी जगह लगाना', labelEn: 'Uninstallation / Shifting' },
          { value: 'कूलिंग/पानी टपकना विज़िट', labelHi: 'खराबी जांच विज़िट (रिपेयर)', labelEn: 'Inspection Visit' },
        ],
      },
      {
        id: 'extraCopperPipeQty',
        labelHi: 'अतिरिक्त कॉपर पाइप लंबाई (अलग बिल लाइन में जुड़ेगी)',
        labelEn: 'Extra Copper Pipe Length (Separate Billing Line)',
        type: 'number',
        mandatory: false,
        placeholderHi: 'उदा. 10 (फुट या मीटर)',
        unitHi: 'फुट / मीटर',
        min: 0,
        helperNoteHi: 'अधिकांश AC के साथ 10 ft स्टैंडर्ड पाइप आता है; अतिरिक्त पाइप अलग लाइन में जुड़ता है।',
      },
      {
        id: 'extraCopperPipeUnit',
        labelHi: 'कॉपर पाइप की माप इकाई',
        labelEn: 'Copper Pipe Unit',
        type: 'select',
        mandatory: false,
        options: [
          { value: 'फुट', labelHi: 'प्रति फुट (₹280 - ₹350/फुट)', labelEn: 'Per Foot' },
          { value: 'मीटर', labelHi: 'प्रति मीटर (₹950 - ₹1,150/मीटर)', labelEn: 'Per Meter' },
        ],
      },
    ],
  },

  labor: {
    id: 'labor',
    registrationLabelHi: 'हेल्पर / JCB / ट्रॉली',
    nameHindi: 'हेल्पर / JCB / ट्रॉली',
    nameEng: 'Helper, JCB & Trolley',
    group: 'CONSTRUCTION',
    icon: 'account-hard-hat',
    color: '#D97706',
    aliases: ['labor', 'हेल्पर', 'मजदूर', 'jcb', 'जेसीबी', 'ट्रॉली', 'मलबा', 'मिट्टी'],
    researchSummaryHi:
      'स्थानीय मानक: हेल्पर ₹500–₹650/व्यक्ति-दिन, JCB खुदाई ₹950–₹1,300/घंटा (न्यूनतम 2 घंटे), मिट्टी/मलबा ट्रॉली ₹1,400–₹2,500/चक्कर (क्षमता 100-150 cft व दूरी अनुसार)।',
    rateModes: [
      {
        id: 'labor_helper_day',
        labelHi: 'हेल्पर (प्रति व्यक्ति-दिन)',
        labelEn: 'Helper (Per Person-Day)',
        unitHi: 'प्रति व्यक्ति-दिन',
        unitEn: 'per person-day',
        primaryRateTypeLabel: 'दिहाड़ी',
        backendBookingMode: 'दिहाड़ी',
        defaultRate: 550,
        fairRangeHi: '₹500 - ₹650 / व्यक्ति-दिन (8 घंटे)',
        defaultUnits: 2,
        minAllowedRate: 300,
        maxAllowedRate: 1800,
        isDailyLike: true,
        researchNoteHi: 'मलबा हटाने, सामान चढ़ाने या कारीगर सहायता के लिए प्रति व्यक्ति-दिन।',
      },
      {
        id: 'labor_jcb_hour',
        labelHi: 'JCB मशीन (प्रति घंटा)',
        labelEn: 'JCB (Per Hour)',
        unitHi: 'प्रति घंटा',
        unitEn: 'per hour',
        primaryRateTypeLabel: 'प्रति घंटा (JCB)',
        backendBookingMode: 'ठेका',
        defaultRate: 1100,
        fairRangeHi: '₹950 - ₹1,350 / घंटा (डीजल व ऑपरेटर सहित)',
        defaultUnits: 3,
        minAllowedRate: 600,
        maxAllowedRate: 4000,
        researchNoteHi: 'नींव खुदाई, प्लॉट लेवलिंग और मलबा लोडिंग (JCB घंटों के हिसाब से)।',
      },
      {
        id: 'labor_trolley_trip',
        labelHi: 'मिट्टी / मलबा ट्रॉली (प्रति चक्कर)',
        labelEn: 'Earth / Debris Trolley (Per Trip)',
        unitHi: 'प्रति चक्कर',
        unitEn: 'per trip',
        primaryRateTypeLabel: 'प्रति चक्कर (ट्रॉली)',
        backendBookingMode: 'ठेका',
        defaultRate: 1600,
        fairRangeHi: '₹1,200 - ₹2,600 / चक्कर (क्षमता व दूरी अनुसार)',
        defaultUnits: 2,
        minAllowedRate: 600,
        maxAllowedRate: 10000,
        researchNoteHi: 'ट्रॉली क्षमता (cft / टन) और डंपिंग दूरी (Km) दर्ज करना अनिवार्य है।',
      },
    ],
    contractorFields: [
      {
        key: 'dailyWageRate',
        labelHi: 'हेल्पर मजदूरी (प्रति व्यक्ति-दिन) *',
        subLabelHi: '8 घंटे शिफ्ट प्रति मजदूर/हेल्पर',
        unitHi: '₹ / व्यक्ति-दिन',
        placeholder: '550',
        mandatoryWhenModes: ['labor_helper_day'],
        isNumeric: true,
        min: 300,
        max: 2000,
        mapsToColumn: 'dailyWageRate',
      },
      {
        key: 'jcbHourlyRate',
        labelHi: 'JCB मशीन किराया (प्रति घंटा) *',
        subLabelHi: 'डीजल और ऑपरेटर सहित प्रति घंटा दर',
        unitHi: '₹ / घंटा',
        placeholder: '1100',
        mandatoryWhenModes: ['labor_jcb_hour'],
        isNumeric: true,
        min: 600,
        max: 5000,
        cardTitleHi: 'JCB खुदाई/लोडिंग (/घंटा)',
      },
      {
        key: 'contractUnitRate',
        labelHi: 'मिट्टी / मलबे की ट्रॉली (प्रति चक्कर) *',
        subLabelHi: 'ट्रैक्टर-ट्रॉली या डंपर प्रति चक्कर दर',
        unitHi: '₹ / चक्कर',
        placeholder: '1600',
        mandatoryWhenModes: ['labor_trolley_trip'],
        isNumeric: true,
        min: 500,
        max: 12000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'trolleyCapacitySpec',
        labelHi: 'ट्रॉली की क्षमता (Capacity - उदा. 100 cft / 3 टन) *',
        subLabelHi: 'ट्रैक्टर ट्रॉली या डंपर की मानक भराई क्षमता',
        unitHi: 'क्षमता',
        placeholder: '100 cft (3 टन)',
        mandatoryWhenModes: ['labor_trolley_trip'],
        isNumeric: false,
        cardTitleHi: 'ट्रॉली मानक क्षमता',
      },
    ],
    bookingFields: [
      {
        id: 'trolleyCapacity',
        labelHi: 'ट्रॉली की क्षमता चुनें (Capacity)',
        labelEn: 'Trolley Capacity',
        type: 'select',
        mandatory: true,
        visibleInModes: ['labor_trolley_trip'],
        options: [
          { value: '100 cft मानक ट्रैक्टर ट्रॉली (~3 टन)', labelHi: '100 cft मानक ट्रैक्टर ट्रॉली (~3 टन)', labelEn: '100 cft Tractor Trolley' },
          { value: '150 cft बड़ी डंपर ट्रॉली (~5 टन)', labelHi: '150 cft बड़ी ट्रॉली (~5 टन)', labelEn: '150 cft Large Trolley' },
          { value: '300+ cft हाईवा / डंपर (~10 टन)', labelHi: '300+ cft हाईवा डंपर (~10 टन)', labelEn: 'Highwa Dumper' },
        ],
      },
      {
        id: 'trolleyDistanceKm',
        labelHi: 'साइट से डंपिंग / सप्लाई की दूरी (Km)',
        labelEn: 'Trip Distance (Km)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['labor_trolley_trip'],
        placeholderHi: 'उदा. 6',
        unitHi: 'Km (दूरी)',
        min: 1,
        max: 100,
        helperNoteHi: '5 Km से अधिक दूरी पर ईंधन अंतर अलग जुड़ सकता है।',
      },
      {
        id: 'helpersOrHoursCount',
        labelHi: 'हेल्पर संख्या या JCB घंटे',
        labelEn: 'Helpers Count / JCB Hours',
        type: 'number',
        mandatory: true,
        visibleInModes: ['labor_helper_day', 'labor_jcb_hour'],
        placeholderHi: 'उदा. 3',
        unitHi: 'व्यक्ति / घंटे',
        min: 1,
      },
    ],
  },

  wedding_tent: {
    id: 'wedding_tent',
    registrationLabelHi: 'टेंट / डेकोरेटर',
    nameHindi: 'टेंट / डेकोरेटर',
    nameEng: 'Tent & Decorator',
    group: 'WEDDING_EVENT',
    icon: 'tent',
    color: '#E11D48',
    aliases: ['wedding_tent', 'mandap', 'टेंट', 'डेकोरेटर', 'मंडप', 'पंडाल'],
    researchSummaryHi:
      'टेंट किराया गणना: पंडाल क्षेत्रफल (₹18–₹55/sq.ft) + कुर्सियां (₹15–₹25/नग) + टेबल (₹90–₹150/नग) और इन्हें किराये के कुल दिनों (Rental Days) से गुणा कर स्पष्ट जोड़ा जाता है।',
    rateModes: [
      {
        id: 'tent_sqft',
        labelHi: 'प्रति वर्ग फुट (पंडाल)',
        labelEn: 'Per Sq.Ft (Pandal)',
        unitHi: 'प्रति Sq.Ft / दिन',
        unitEn: 'per sq.ft / day',
        primaryRateTypeLabel: 'स्क्वायर फुट',
        backendBookingMode: 'ठेका',
        defaultRate: 24,
        fairRangeHi: 'सामान्य पंडाल ₹18-₹28 | वाटरप्रूफ जर्मन हैंगर ₹45-₹75 / sq.ft',
        defaultUnits: 1500,
        minAllowedRate: 10,
        maxAllowedRate: 300,
        researchNoteHi: 'पंडाल का कुल क्षेत्र (Sq.Ft), कुर्सी-टेबल व किराये के दिन अलग गिने जाते हैं।',
      },
      {
        id: 'tent_per_item_day',
        labelHi: 'प्रति नग प्रति दिन (कुर्सी / टेबल / गद्दा)',
        labelEn: 'Per Piece Per Day',
        unitHi: 'प्रति नग प्रति दिन',
        unitEn: 'per piece / day',
        primaryRateTypeLabel: 'प्रति नग प्रति दिन',
        backendBookingMode: 'ठेका',
        defaultRate: 22,
        fairRangeHi: 'कुर्सी ₹15-₹25 | टेबल ₹100-₹150 | बेड/गद्दा ₹140 / दिन',
        defaultUnits: 150,
        minAllowedRate: 10,
        maxAllowedRate: 1500,
        researchNoteHi: 'कुर्सी-टेबल की संख्या और किराये के दिनों की स्पष्ट अलग गिनती।',
      },
      {
        id: 'tent_full_function',
        labelHi: 'पूरा फंक्शन पैकेज',
        labelEn: 'Complete Function Package',
        unitHi: 'पूरा फंक्शन',
        unitEn: 'full function',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 45000,
        fairRangeHi: '₹28,000 - ₹1,50,000 (स्टेज, लाइटिंग, मंडप व सिटिंग)',
        defaultUnits: 1,
        minAllowedRate: 8000,
        maxAllowedRate: 1500000,
        researchNoteHi: 'शादी, रिसेप्शन या सगाई का कम्प्लीट टेंट + फ्लोरल डेकोर पैकेज।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'पंडाल किराया (प्रति वर्ग फुट / दिन) *',
        subLabelHi: 'टेंट + कारपेट + साइड वॉल सहित प्रति Sq.Ft दर',
        unitHi: '₹ / sq.ft / दिन',
        placeholder: '24',
        mandatoryWhenModes: ['tent_sqft'],
        isNumeric: true,
        min: 8,
        max: 400,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'chairPerDayRate',
        labelHi: 'कुर्सी / सीट (प्रति नग प्रति दिन) *',
        subLabelHi: 'कवर वाली कुर्सी या VIP चेयर प्रति दिन किराया',
        unitHi: '₹ / नग / दिन',
        placeholder: '20',
        mandatoryWhenModes: ['tent_per_item_day'],
        isNumeric: true,
        min: 5,
        max: 500,
        cardTitleHi: 'कुर्सी (प्रति नग/दिन)',
      },
      {
        key: 'tablePerDayRate',
        labelHi: 'टेबल / काउंटर (प्रति नग प्रति दिन) *',
        subLabelHi: 'डाइनिंग टेबल / बुफे टेबल क्लॉथ सहित प्रति दिन',
        unitHi: '₹ / नग / दिन',
        placeholder: '120',
        mandatoryWhenModes: ['tent_per_item_day'],
        isNumeric: true,
        min: 30,
        max: 2000,
        cardTitleHi: 'टेबल (प्रति नग/दिन)',
      },
      {
        key: 'fullFunctionPackageRate',
        labelHi: 'पूरा फंक्शन पैकेज (लंपसम) *',
        subLabelHi: 'स्टेज + पंडाल + लाइटिंग कम्प्लीट पैकेज',
        unitHi: '₹ / फंक्शन',
        placeholder: '45000',
        mandatoryWhenModes: ['tent_full_function'],
        isNumeric: true,
        min: 5000,
        max: 2500000,
        cardTitleHi: 'पूरा फंक्शन पैकेज',
      },
    ],
    bookingFields: [
      {
        id: 'pandalAreaSqft',
        labelHi: 'पंडाल का क्षेत्रफल (Sq.Ft)',
        labelEn: 'Pandal Area (Sq.Ft)',
        type: 'number',
        mandatory: true,
        visibleInModes: ['tent_sqft'],
        placeholderHi: 'उदा. 1500',
        unitHi: 'Sq.Ft',
        min: 50,
      },
      {
        id: 'chairsCount',
        labelHi: 'कुर्सियों की संख्या (Chairs Count)',
        labelEn: 'Number of Chairs',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 150',
        unitHi: 'कुर्सियां',
        min: 0,
      },
      {
        id: 'tablesCount',
        labelHi: 'टेबल की संख्या (Tables Count)',
        labelEn: 'Number of Tables',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 15',
        unitHi: 'टेबल',
        min: 0,
      },
      {
        id: 'rentalDays',
        labelHi: 'किराये के कुल दिन (Rental Days - अलग गिनती)',
        labelEn: 'Rental Days',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 2',
        unitHi: 'दिन',
        min: 1,
        max: 30,
        helperNoteHi: 'पंडाल, कुर्सी व टेबल का किराया चुने गए दिनों से स्पष्ट गुणा होगा।',
      },
    ],
  },

  caterer: {
    id: 'caterer',
    registrationLabelHi: 'हलवाई / कैटरर',
    nameHindi: 'हलवाई / कैटरर',
    nameEng: 'Halwai & Caterer',
    group: 'WEDDING_EVENT',
    icon: 'silverware-fork-knife',
    color: '#D97706',
    aliases: ['caterer', 'catering', 'wedding_catering', 'हलवाई', 'कैटरर', 'कैटरिंग'],
    researchSummaryHi:
      'कैटरिंग नियम: हमेशा मेन्यू तय कर "न्यूनतम गारंटी प्लेट" (उदा. 100 प्लेट) व न्यूनतम सीमा से ऊपर "प्रति अतिरिक्त प्लेट दर" अलग से दर्ज की जाती है ताकि आखिरी वक्त में बिल विवाद न हो।',
    rateModes: [
      {
        id: 'caterer_per_plate',
        labelHi: 'प्रति प्लेट (Per Plate)',
        labelEn: 'Per Plate',
        unitHi: 'प्रति प्लेट',
        unitEn: 'per plate',
        primaryRateTypeLabel: 'प्रति व्यक्ति (Plate)',
        backendBookingMode: 'ठेका',
        defaultRate: 450,
        fairRangeHi: 'हलवाई सिर्फ मजदूरी: ₹120-₹220 | पूर्ण वेज थाली: ₹380-₹950 / प्लेट',
        defaultUnits: 150,
        minAllowedRate: 80,
        maxAllowedRate: 3500,
        researchNoteHi: 'मेन्यू, न्यूनतम प्लेट गारंटी और अतिरिक्त प्लेट दर सब स्पष्ट दर्ज करें।',
      },
      {
        id: 'caterer_full_function',
        labelHi: 'पूरा फंक्शन ठेका',
        labelEn: 'Full Function Package',
        unitHi: 'पूरा फंक्शन',
        unitEn: 'full function',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 85000,
        fairRangeHi: '₹45,000 - ₹3,50,000 (मेहमान संख्या अनुसार)',
        defaultUnits: 1,
        minAllowedRate: 10000,
        maxAllowedRate: 3000000,
        researchNoteHi: 'ब्रेकफास्ट, लंच, डिनर व स्नैक्स का सम्पूर्ण एकमुश्त फंक्शन ठेका।',
      },
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'स्टैंडर्ड प्रति प्लेट दर *',
        subLabelHi: 'न्यूनतम गारंटी सीमा तक प्रति थाली/प्लेट दर',
        unitHi: '₹ / प्लेट',
        placeholder: '450',
        alwaysMandatory: true,
        isNumeric: true,
        min: 70,
        max: 5000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'minGuaranteePlates',
        labelHi: 'न्यूनतम प्लेट शर्त (Min Plates) *',
        subLabelHi: 'कम से कम कितनी प्लेटों की बुकिंग अनिवार्य है (उदा. 100)',
        unitHi: 'प्लेट',
        placeholder: '100',
        alwaysMandatory: true,
        isNumeric: true,
        min: 20,
        max: 2000,
        cardTitleHi: 'न्यूनतम प्लेट गारंटी',
      },
      {
        key: 'extraPlateRate',
        labelHi: 'न्यूनतम के बाद अतिरिक्त प्लेट दर *',
        subLabelHi: 'गारंटी से ज्यादा मेहमान आने पर हर अतिरिक्त प्लेट का रेट',
        unitHi: '₹ / अति. प्लेट',
        placeholder: '380',
        alwaysMandatory: true,
        isNumeric: true,
        min: 60,
        max: 5000,
        cardTitleHi: 'अतिरिक्त प्लेट दर (Min से ऊपर)',
      },
      {
        key: 'dailyWageRate',
        labelHi: 'केवल हलवाई कारीगरी (मजदूरी/दिन)',
        subLabelHi: 'यदि सामान ग्राहक देगा (सिर्फ कुकिंग टीम)',
        unitHi: '₹ / दिन',
        placeholder: '1500',
        isNumeric: true,
        min: 500,
        max: 15000,
        mapsToColumn: 'dailyWageRate',
      },
    ],
    bookingFields: [
      {
        id: 'cateringMenuType',
        labelHi: 'मेन्यू श्रेणी चुनें (Menu Selection)',
        labelEn: 'Select Menu Tier',
        type: 'select',
        mandatory: true,
        options: [
          { value: 'केवल हलवाई कारीगरी (सामान ग्राहक का)', labelHi: 'केवल हलवाई टीम (राशन ग्राहक का)', labelEn: 'Halwai Labor Only', rateMultiplier: 0.4 },
          { value: 'स्टैंडर्ड शाकाहारी थाली (2 सब्जी, पनीर, रायता, स्वीट)', labelHi: 'स्टैंडर्ड शाकाहारी मेन्यू (2 सब्जी + पनीर + मिठाई)', labelEn: 'Standard Veg Menu', rateMultiplier: 1.0 },
          { value: 'डिलक्स वेडिंग मेन्यू (चाट लाइव + 3 मिठाई + स्टार्टर)', labelHi: 'डिलक्स शादी मेन्यू (चाट + स्टार्टर + डेज़र्ट)', labelEn: 'Deluxe Wedding Menu', rateMultiplier: 1.4 },
          { value: 'शाही प्रीमियम बुफे (ऑल लाइव काउंटर्स)', labelHi: 'शाही प्रीमियम बुफे (साउथ/चाइनीज लाइव काउंटर)', labelEn: 'Royal Premium Buffet', rateMultiplier: 1.85 },
        ],
      },
      {
        id: 'minPlatesGuaranteed',
        labelHi: 'न्यूनतम प्लेट गारंटी (Minimum Plates)',
        labelEn: 'Minimum Guaranteed Plates',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 100',
        unitHi: 'न्यूनतम प्लेट',
        min: 20,
      },
      {
        id: 'expectedTotalPlates',
        labelHi: 'अनुमानित कुल प्लेटें (अतिरिक्त प्लेटें स्वतः जुड़ेंगी)',
        labelEn: 'Expected Total Plates',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 160',
        unitHi: 'कुल प्लेट',
        min: 20,
      },
      {
        id: 'extraPlatePrice',
        labelHi: 'अतिरिक्त प्लेट दर (न्यूनतम से ऊपर प्रति प्लेट ₹)',
        labelEn: 'Extra Plate Rate (₹ above min)',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 380',
        unitHi: '₹ / अति. प्लेट',
        min: 50,
      },
    ],
  },

  wedding_photo: {
    id: 'wedding_photo',
    registrationLabelHi: 'वेडिंग फोटोग्राफर / मेकअप आर्टिस्ट',
    nameHindi: 'वेडिंग फोटोग्राफर / मेकअप आर्टिस्ट',
    nameEng: 'Wedding Photographer & Videographer',
    group: 'WEDDING_EVENT',
    icon: 'camera',
    color: '#9333EA',
    aliases: ['wedding_photo', 'photographer', 'फोटोग्राफर', 'कैमरा', 'वेडिंग फोटोग्राफर', 'इवेंट'],
    researchSummaryHi:
      'वेडिंग फोटो/मेकअप मानक: प्रति फंक्शन में तय कवरेज घंटे (जैसे 6-8 घंटे) व शामिल डिलीवरेबल्स (Candid, Traditional, Drone, Reel, Karizma एल्बम) लिखना अनिवार्य है।',
    rateModes: [
      {
        id: 'event_per_function',
        labelHi: 'प्रति फंक्शन (Per Function)',
        labelEn: 'Per Function',
        unitHi: 'प्रति फंक्शन',
        unitEn: 'per function',
        primaryRateTypeLabel: 'प्रति फंक्शन',
        backendBookingMode: 'ठेका',
        defaultRate: 15000,
        fairRangeHi: 'हल्दी/मेहंदी/सगाई ₹10,000 - ₹25,000 / फंक्शन',
        defaultUnits: 1,
        minAllowedRate: 2500,
        maxAllowedRate: 200000,
        researchNoteHi: 'एक फंक्शन के तय घंटे और शामिल सेवाओं की सूची अवश्य चुनें।',
      },
      {
        id: 'event_full_package',
        labelHi: 'पूरा पैकेज (Full Wedding Package)',
        labelEn: 'Full Package',
        unitHi: 'पूरा विवाह पैकेज',
        unitEn: 'full package',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 55000,
        fairRangeHi: '₹35,000 - ₹1,50,000 (प्री-वेडिंग + 2 दिन + एल्बम)',
        defaultUnits: 1,
        minAllowedRate: 8000,
        maxAllowedRate: 1000000,
        researchNoteHi: 'सभी रस्मों (हल्दी, संगीत, शादी, रिसेप्शन) के कुल घंटे व डिलीवरेबल्स सहित।',
      },
    ],
    defaultDeliverables: [
      'Traditional फोटो + 4K वीडियो',
      'Candid फोटोग्राफी',
      'सिनेमैटिक रील्स / हाईलाइट्स',
      'ड्रोन (Drone) कवरेज',
      'प्रिंटेड Karizma एल्बम',
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'प्रति फंक्शन पैकेज दर *',
        subLabelHi: '1 इवेंट/फंक्शन (जैसे हल्दी, रिसेप्शन या संगीत) का शुल्क',
        unitHi: '₹ / फंक्शन',
        placeholder: '15000',
        alwaysMandatory: true,
        isNumeric: true,
        min: 2000,
        max: 250000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'fullWeddingPackageRate',
        labelHi: 'संपूर्ण शादी पैकेज दर *',
        subLabelHi: 'सभी फंक्शन, एल्बम व वीडियो सहित कम्प्लीट पैकेज',
        unitHi: '₹ / पूरा पैकेज',
        placeholder: '55000',
        mandatoryWhenModes: ['event_full_package'],
        isNumeric: true,
        min: 5000,
        max: 1500000,
        cardTitleHi: 'पूरा विवाह पैकेज',
      },
      {
        key: 'hoursPerFunction',
        labelHi: 'एक फंक्शन में कवरेज घंटे *',
        subLabelHi: 'उदा. प्रति फंक्शन कितने घंटे सेवा रहेगी (जैसे 8 घंटे)',
        unitHi: 'घंटे / फंक्शन',
        placeholder: '8',
        alwaysMandatory: true,
        isNumeric: true,
        min: 2,
        max: 24,
        cardTitleHi: 'प्रति फंक्शन घंटे',
      },
      {
        key: 'includedServicesSummary',
        labelHi: 'शामिल सेवाएँ (Deliverables) *',
        subLabelHi: 'उदा. Candid, Traditional 4K, Drone, Reel व 40-शीट एल्बम',
        unitHi: 'सेवा सूची',
        placeholder: 'Candid + 4K Video + Drone + 40 Sheet Album',
        alwaysMandatory: true,
        isNumeric: false,
        cardTitleHi: 'शामिल सेवाएँ',
      },
    ],
    bookingFields: [
      {
        id: 'functionHours',
        labelHi: 'एक फंक्शन में कितने घंटे कवरेज चाहिए? (Hours)',
        labelEn: 'Hours per Function',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 8',
        unitHi: 'घंटे',
        min: 2,
        max: 24,
      },
      {
        id: 'includedServicesText',
        labelHi: 'कौन-सी सेवाएँ पैकेज में शामिल रहेंगी? (लिखें या चुनें)',
        labelEn: 'Included Services / Deliverables',
        type: 'text',
        mandatory: true,
        placeholderHi: 'उदा. Candid + Traditional 4K वीडियो + ड्रोन + 1 Karizma एल्बम',
      },
    ],
  },

  wedding_makeup: {
    id: 'wedding_makeup',
    registrationLabelHi: 'ब्राइडल मेकअप आर्टिस्ट',
    nameHindi: 'ब्राइडल मेकअप आर्टिस्ट',
    nameEng: 'Bridal & Party Makeup Artist',
    group: 'WEDDING_EVENT',
    icon: 'face-woman-shimmer',
    color: '#DB2777',
    aliases: ['wedding_makeup', 'makeup', 'मेकअप', 'ब्राइडल', 'ब्यूटी'],
    researchSummaryHi:
      'मेकअप सेवा नियम: प्रति फंक्शन या ब्राइडल पैकेज में लगने वाले घंटे (उदा. 3-4 घंटे), मेकअप प्रकार (HD / Airbrush / प्रोफेशनल ब्रांड्स), हेयरस्टाइल व ड्रेपिंग शामिल है या नहीं—लिखना अनिवार्य है।',
    rateModes: [
      {
        id: 'makeup_per_function',
        labelHi: 'प्रति फंक्शन / एक सिटिंग',
        labelEn: 'Per Function',
        unitHi: 'प्रति फंक्शन',
        unitEn: 'per function',
        primaryRateTypeLabel: 'प्रति फंक्शन',
        backendBookingMode: 'ठेका',
        defaultRate: 9500,
        fairRangeHi: 'पार्टी मेकअप ₹2,500 - ₹4,500 | सगाई/हल्दी ₹6,500 - ₹12,000',
        defaultUnits: 1,
        minAllowedRate: 1000,
        maxAllowedRate: 100000,
        researchNoteHi: 'एक फंक्शन की समयावधि (घंटे) और शामिल सेवाएँ दर्ज करें।',
      },
      {
        id: 'makeup_full_package',
        labelHi: 'पूरा ब्राइडल पैकेज',
        labelEn: 'Full Bridal Package',
        unitHi: 'पूरा ब्राइडल पैकेज',
        unitEn: 'full package',
        primaryRateTypeLabel: 'पैकेज ठेका',
        backendBookingMode: 'ठेका',
        defaultRate: 24000,
        fairRangeHi: '₹15,000 - ₹45,000 (HD/Airbrush ब्राइडल + हल्दी + रिसेप्शन)',
        defaultUnits: 1,
        minAllowedRate: 5000,
        maxAllowedRate: 250000,
        researchNoteHi: 'मेहंदी से विदाई तक कम्प्लीट ब्राइडल + फैमिली पैकेज।',
      },
    ],
    defaultDeliverables: [
      'HD / Airbrush प्रोफेशनल मेकअप बेस',
      'हेयर स्टाइलिंग व फ्लावर सेटिंग',
      'लहंगा / साड़ी ड्रेपिंग व पिनिंग',
      'फेक आईलैशेज व लेंस फिटिंग',
    ],
    contractorFields: [
      {
        key: 'contractUnitRate',
        labelHi: 'प्रति फंक्शन / ब्राइडल शुल्क *',
        subLabelHi: 'एक मुख्य मेकअप सिटिंग का चार्ज',
        unitHi: '₹ / फंक्शन',
        placeholder: '9500',
        alwaysMandatory: true,
        isNumeric: true,
        min: 1000,
        max: 150000,
        mapsToColumn: 'contractUnitRate',
      },
      {
        key: 'fullWeddingPackageRate',
        labelHi: 'पूरा ब्राइडल मल्टी-फंक्शन पैकेज *',
        subLabelHi: 'सगाई, हल्दी और शादी कम्प्लीट पैकेज',
        unitHi: '₹ / पैकेज',
        placeholder: '24000',
        mandatoryWhenModes: ['makeup_full_package'],
        isNumeric: true,
        min: 4000,
        max: 400000,
        cardTitleHi: 'पूरा ब्राइडल पैकेज',
      },
      {
        key: 'hoursPerFunction',
        labelHi: 'एक फंक्शन में समय (घंटे) *',
        subLabelHi: 'उदा. तैयारी में लगने वाले घंटे (जैसे 4 घंटे)',
        unitHi: 'घंटे',
        placeholder: '4',
        alwaysMandatory: true,
        isNumeric: true,
        min: 1,
        max: 16,
        cardTitleHi: 'प्रति फंक्शन घंटे',
      },
      {
        key: 'includedServicesSummary',
        labelHi: 'शामिल सेवाएँ *',
        subLabelHi: 'उदा. Airbrush, Hairstyling, Saree/Lehenga Draping, Lashes',
        unitHi: 'सेवा सूची',
        placeholder: 'HD/Airbrush + Hair Styling + Lehnga Draping + Lashes',
        alwaysMandatory: true,
        isNumeric: false,
        cardTitleHi: 'शामिल सेवाएँ',
      },
    ],
    bookingFields: [
      {
        id: 'functionHours',
        labelHi: 'फंक्शन के लिए कितने घंटे समय चाहिए? (Hours)',
        labelEn: 'Hours per Function',
        type: 'number',
        mandatory: true,
        placeholderHi: 'उदा. 4',
        unitHi: 'घंटे',
        min: 1,
        max: 16,
      },
      {
        id: 'includedServicesText',
        labelHi: 'शामिल सेवाएँ दर्ज करें (मेकअप टाइप, हेयर, ड्रेपिंग)',
        labelEn: 'Included Services',
        type: 'text',
        mandatory: true,
        placeholderHi: 'उदा. Airbrush मेकअप + हेयर स्टाइलिंग + लहंगा ड्रेपिंग',
      },
    ],
  },
};

export const ORDERED_15_TRADES: TradeRateProfile[] = [
  TRADE_RATE_PROFILES.carpenter,
  TRADE_RATE_PROFILES.mason,
  TRADE_RATE_PROFILES.painter,
  TRADE_RATE_PROFILES.electrician,
  TRADE_RATE_PROFILES.plumber,
  TRADE_RATE_PROFILES.tiling,
  TRADE_RATE_PROFILES.false_ceiling,
  TRADE_RATE_PROFILES.welder,
  TRADE_RATE_PROFILES.aluminium_upvc,
  TRADE_RATE_PROFILES.waterproofing,
  TRADE_RATE_PROFILES.ac_repair,
  TRADE_RATE_PROFILES.labor,
  TRADE_RATE_PROFILES.wedding_tent,
  TRADE_RATE_PROFILES.caterer,
  TRADE_RATE_PROFILES.wedding_photo,
  TRADE_RATE_PROFILES.wedding_makeup,
];

/** Registration quick picker options (all 15 groups + separate Bridal Makeup option for clarity) */
export const REGISTRATION_TRADE_OPTIONS: { id: CanonicalTradeId; label: string }[] = ORDERED_15_TRADES.map((t) => ({
  id: t.id,
  label: t.registrationLabelHi,
}));

export function normalizeTradeCategory(input: string = ''): CanonicalTradeId {
  const s = String(input || '').trim().toLowerCase();
  if (!s) return 'carpenter';

  // Exact keys first
  if (s in TRADE_RATE_PROFILES) return s as CanonicalTradeId;

  // Aliases order matters: check specific phrases before generic ones
  if (s.includes('false_ceiling') || s.includes('pop') || s.includes('सीलिंग') || s.includes('जिप्सम')) return 'false_ceiling';
  if (s.includes('aluminium') || s.includes('upvc') || s.includes('ग्लास') || s.includes('एल्युमिनियम')) return 'aluminium_upvc';
  if (s.includes('waterproof') || s.includes('वॉटरप्रूफ') || s.includes('वाटरप्रूफ')) return 'waterproofing';
  if (s.includes('weld') || s.includes('सरिया') || s.includes('ग्रिल') || s.includes('फैब्रिकेटर') || s.includes('वेल्ड')) return 'welder';
  if (s.includes('tiling') || s.includes('tile') || s.includes('टाइल') || s.includes('मार्बल')) return 'tiling';
  if (s.includes('jcb') || s.includes('ट्रॉली') || s.includes('हेल्पर') || s.includes('labor') || s.includes('मजदूर') || s.includes('मलबा')) return 'labor';
  if (s.includes('ac') || s.includes('एसी')) return 'ac_repair';
  if (s.includes('cater') || s.includes('हलवाई') || s.includes('कैटर') || s.includes('प्लेट')) return 'caterer';
  if (s.includes('फोटोग्राफर') || s.includes('photo') || s.includes('फोटो') || s.includes('कैमरा') || s.includes('dj')) return 'wedding_photo';
  if (s.includes('makeup') || s.includes('मेकअप') || s.includes('ब्राइडल')) return 'wedding_makeup';
  if (s.includes('tent') || s.includes('mandap') || s.includes('टेंट') || s.includes('डेकोर') || s.includes('पंडाल')) return 'wedding_tent';
  if (s.includes('paint') || s.includes('पेंटर') || s.includes('पुट्टी')) return 'painter';
  if (s.includes('electr') || s.includes('इलेक्ट्र') || s.includes('बिजली') || s.includes('वायर')) return 'electrician';
  if (s.includes('plumb') || s.includes('प्लंबर') || s.includes('नल')) return 'plumber';
  if (s.includes('mason') || s.includes('मिस्त्री') || s.includes('राजमिस्त्री') || s.includes('मकान')) return 'mason';
  if (s.includes('carpenter') || s.includes('बढ़ई') || s.includes('फर्नीचर')) return 'carpenter';

  return 'mason';
}

export function getTradeRateProfile(categoryOrTrade: string = ''): TradeRateProfile {
  return TRADE_RATE_PROFILES[normalizeTradeCategory(categoryOrTrade)];
}

export interface BookingCalculationInput {
  category: string;
  modeId: string;
  units: number;
  contractorDailyRate?: number | null;
  contractorHelperRate?: number | null;
  contractorUnitRate?: number | null;
  contractorAdditionalCards?: { title: string; rate: string }[];
  includeHelper?: boolean;
  subValues: Record<string, string>;
  fallbackLaborEstimate?: number;
}

function parseFirstNumberFromCard(cards: { title: string; rate: string }[] | undefined, keywordMatch: string): number | null {
  if (!Array.isArray(cards)) return null;
  const hit = cards.find((c) => (c.title || '').toLowerCase().includes(keywordMatch.toLowerCase()));
  if (!hit) return null;
  const m = String(hit.rate || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

/**
 * Deterministic, research-backed quote engine for every trade's rate modes + conditional parameters.
 */
export function calculateTradeBookingTotal(input: BookingCalculationInput): {
  totalLaborAmount: number;
  appliedRateLabel: string;
  breakdownLineHi: string;
  extraAddonsAmount: number;
} {
  const profile = getTradeRateProfile(input.category);
  const mode = profile.rateModes.find((m) => m.id === input.modeId) || profile.rateModes[0];
  const qty = Math.max(1, Number(input.units) || 1);
  const cards = input.contractorAdditionalCards;
  const sub = input.subValues || {};

  // Daily-wage mode across trades
  if (mode.isDailyLike) {
    const baseDaily = Number(input.contractorDailyRate) > 0 ? Number(input.contractorDailyRate) : mode.defaultRate;
    const helperAdd = input.includeHelper
      ? Number(input.contractorHelperRate) > 0
        ? Number(input.contractorHelperRate)
        : 550
      : 0;
    const total = Math.round(qty * (baseDaily + helperAdd));
    return {
      totalLaborAmount: total,
      appliedRateLabel: `₹${baseDaily}/दिन${helperAdd > 0 ? ` (+₹${helperAdd} हेल्पर)` : ''}`,
      breakdownLineHi: `${qty} दिन × ₹${baseDaily + helperAdd}`,
      extraAddonsAmount: 0,
    };
  }

  // Trade-specific specialized calculations
  if (profile.id === 'carpenter') {
    if (mode.id === 'carpenter_material_pct') {
      const pctFromCard = parseFirstNumberFromCard(cards, 'बिल का %');
      const pct = pctFromCard && pctFromCard <= 60 ? pctFromCard : mode.defaultRate;
      const bill = Math.max(0, Number(sub.materialBillAmount) || 0);
      const total = Math.round((bill * pct) / 100);
      return {
        totalLaborAmount: total,
        appliedRateLabel: `मटेरियल बिल का ${pct}%`,
        breakdownLineHi: `₹${bill.toLocaleString('en-IN')} बिल × ${pct}%`,
        extraAddonsAmount: 0,
      };
    }
    if (mode.id === 'carpenter_kitchen_rft') {
      const rate = parseFirstNumberFromCard(cards, 'किचन') || Number(input.contractorUnitRate) || mode.defaultRate;
      const total = Math.round(qty * rate);
      return {
        totalLaborAmount: total,
        appliedRateLabel: `₹${rate}/रनिंग ft`,
        breakdownLineHi: `${qty} रनिंग ft × ₹${rate}`,
        extraAddonsAmount: 0,
      };
    }
    if (mode.id === 'carpenter_hardware_piece') {
      const rate = parseFirstNumberFromCard(cards, 'हार्डवेयर') || mode.defaultRate;
      const pieces = Math.max(1, Number(sub.hardwarePiecesCount) || qty);
      const total = Math.round(pieces * rate);
      return {
        totalLaborAmount: total,
        appliedRateLabel: `₹${rate}/पीस`,
        breakdownLineHi: `${pieces} पीस × ₹${rate}`,
        extraAddonsAmount: 0,
      };
    }
  }

  if (profile.id === 'painter' && mode.id === 'painter_sqft') {
    const baseLabor = Number(input.contractorUnitRate) > 0 ? Number(input.contractorUnitRate) : 10;
    const withMatRate = parseFirstNumberFromCard(cards, 'सामान सहित');
    const surfaceOpt = mode && profile.bookingFields.find((f) => f.id === 'paintSurface')?.options?.find((o) => o.value === sub.paintSurface);
    const coatsOpt = profile.bookingFields.find((f) => f.id === 'paintCoats')?.options?.find((o) => o.value === sub.paintCoats);
    const isWithMaterial = (sub.paintMaterialScope || '').includes('सामान सहित');
    const unitRate = isWithMaterial
      ? (withMatRate || Math.round(baseLabor * 1.85))
      : baseLabor;
    const surfMult = surfaceOpt?.rateMultiplier || 1;
    const coatMult = coatsOpt?.rateMultiplier || 1;
    const effectiveRate = Math.max(4, Math.round(unitRate * surfMult * coatMult));
    return {
      totalLaborAmount: Math.round(qty * effectiveRate),
      appliedRateLabel: `₹${effectiveRate}/sq.ft (${isWithMaterial ? 'सामान सहित' : 'केवल मजदूरी'})`,
      breakdownLineHi: `${qty} sq.ft × ₹${effectiveRate}`,
      extraAddonsAmount: 0,
    };
  }

  if (profile.id === 'tiling' && mode.id === 'tiling_sqft') {
    const floorSqft = Math.max(1, Number(sub.floorTileSqft) || qty);
    const wallSqft = Math.max(0, Number(sub.wallTileSqft) || 0);
    const skirtingRft = Math.max(0, Number(sub.skirtingEdgeRft) || 0);
    const floorRate = Number(input.contractorUnitRate) || mode.defaultRate;
    const wallRate = parseFirstNumberFromCard(cards, 'दीवार टाइल') || Math.round(floorRate + 4);
    const skirtRate = parseFirstNumberFromCard(cards, 'स्कर्टिंग') || 40;
    const total = Math.round(floorSqft * floorRate + wallSqft * wallRate + skirtingRft * skirtRate);
    return {
      totalLaborAmount: total,
      appliedRateLabel: `फर्श ₹${floorRate}/sq.ft + स्कर्टिंग/एज ₹${skirtRate}/rft`,
      breakdownLineHi: `फर्श ${floorSqft} + दीवार ${wallSqft} sq.ft + ${skirtingRft} rft`,
      extraAddonsAmount: Math.round(skirtingRft * skirtRate),
    };
  }

  if (profile.id === 'false_ceiling' && mode.id === 'pop_sqft') {
    const mainSqft = Math.max(1, Number(sub.mainCeilingSqft) || qty);
    const coveRft = Math.max(0, Number(sub.covePelmetRft) || 0);
    const mainRate = Number(input.contractorUnitRate) || mode.defaultRate;
    const coveRate = parseFirstNumberFromCard(cards, 'कोव') || 80;
    const addon = Math.round(coveRft * coveRate);
    return {
      totalLaborAmount: Math.round(mainSqft * mainRate + addon),
      appliedRateLabel: `छत ₹${mainRate}/sq.ft${coveRft > 0 ? ` + कोव ₹${coveRate}/rft` : ''}`,
      breakdownLineHi: `मुख्य ${mainSqft} sq.ft + कोव/पेलमेट ${coveRft} rft`,
      extraAddonsAmount: addon,
    };
  }

  if (profile.id === 'welder') {
    const isRebar = (sub.welderScope || '').includes('सरिया') || mode.id === 'welder_ton';
    if (isRebar) {
      const rate =
        mode.id === 'welder_ton'
          ? (parseFirstNumberFromCard(cards, 'टन') || 5800)
          : (parseFirstNumberFromCard(cards, 'सरिया') || 6);
      const w = Math.max(1, Number(sub.steelWeightUnits) || qty);
      return {
        totalLaborAmount: Math.round(w * rate),
        appliedRateLabel: mode.id === 'welder_ton' ? `सरिया मजदूरी ₹${rate}/टन` : `सरिया मजदूरी ₹${rate}/kg`,
        breakdownLineHi: `${w} ${mode.id === 'welder_ton' ? 'टन' : 'Kg'} × ₹${rate}`,
        extraAddonsAmount: 0,
      };
    }
    const grillRate = Number(input.contractorUnitRate) || parseFirstNumberFromCard(cards, 'ग्रिल') || 110;
    const w = Math.max(1, Number(sub.steelWeightUnits) || qty);
    return {
      totalLaborAmount: Math.round(w * grillRate),
      appliedRateLabel: `ग्रिल सप्लाई+फिटिंग ₹${grillRate}/kg`,
      breakdownLineHi: `${w} Kg × ₹${grillRate}`,
      extraAddonsAmount: 0,
    };
  }

  if (profile.id === 'ac_repair') {
    const baseAcRate =
      mode.id === 'ac_service_visit'
        ? (Number(input.contractorDailyRate) > 0 && Number(input.contractorDailyRate) < 1000
            ? Number(input.contractorDailyRate)
            : parseFirstNumberFromCard(cards, 'सर्विस') || mode.defaultRate)
        : (Number(input.contractorUnitRate) || mode.defaultRate);
    const pipeLen = Math.max(0, Number(sub.extraCopperPipeQty) || 0);
    const isMeter = (sub.extraCopperPipeUnit || '').includes('मीटर');
    const pipeCardRate = parseFirstNumberFromCard(cards, 'कॉपर पाइप');
    const pipeRate = pipeCardRate
      ? (isMeter && pipeCardRate < 600 ? Math.round(pipeCardRate * 3.28) : pipeCardRate)
      : (isMeter ? 1020 : 310);
    const pipeAddon = Math.round(pipeLen * pipeRate);
    const total = Math.round(qty * baseAcRate + pipeAddon);
    return {
      totalLaborAmount: total,
      appliedRateLabel: `₹${baseAcRate}/${mode.id === 'ac_service_visit' ? 'सर्विस' : 'AC'}${pipeAddon > 0 ? ` + पाइप ₹${pipeAddon}` : ''}`,
      breakdownLineHi: `${qty} AC × ₹${baseAcRate}${pipeLen > 0 ? ` + ${pipeLen} ${isMeter ? 'm' : 'ft'} कॉपर पाइप (₹${pipeRate}/unit)` : ''}`,
      extraAddonsAmount: pipeAddon,
    };
  }

  if (profile.id === 'labor' && mode.id === 'labor_jcb_hour') {
    const jcbRate = parseFirstNumberFromCard(cards, 'jcb') || mode.defaultRate;
    const hrs = Math.max(1, Number(sub.helpersOrHoursCount) || qty);
    return {
      totalLaborAmount: Math.round(hrs * jcbRate),
      appliedRateLabel: `JCB ₹${jcbRate}/घंटा`,
      breakdownLineHi: `${hrs} घंटे × ₹${jcbRate}`,
      extraAddonsAmount: 0,
    };
  }

  if (profile.id === 'labor' && mode.id === 'labor_trolley_trip') {
    const tripRate = Number(input.contractorUnitRate) || mode.defaultRate;
    const km = Math.max(1, Number(sub.trolleyDistanceKm) || 5);
    const extraKmCharge = km > 8 ? (km - 8) * 60 * qty : 0;
    return {
      totalLaborAmount: Math.round(qty * tripRate + extraKmCharge),
      appliedRateLabel: `ट्रॉली ₹${tripRate}/चक्कर`,
      breakdownLineHi: `${qty} चक्कर × ₹${tripRate} (${km} Km)${extraKmCharge > 0 ? ` + दूरी ₹${extraKmCharge}` : ''}`,
      extraAddonsAmount: extraKmCharge,
    };
  }

  if (profile.id === 'wedding_tent') {
    const days = Math.max(1, Number(sub.rentalDays) || 1);
    if (mode.id === 'tent_full_function') {
      const pkg = Number(input.contractorUnitRate) > 3000 ? Number(input.contractorUnitRate) : mode.defaultRate;
      return {
        totalLaborAmount: Math.round(pkg * days),
        appliedRateLabel: `₹${pkg}/फंक्शन`,
        breakdownLineHi: `पैकेज × ${days} दिन`,
        extraAddonsAmount: 0,
      };
    }
    const chairs = Math.max(0, Number(sub.chairsCount) || 0);
    const tables = Math.max(0, Number(sub.tablesCount) || 0);
    const chairRate = parseFirstNumberFromCard(cards, 'कुर्सी') || 20;
    const tableRate = parseFirstNumberFromCard(cards, 'टेबल') || 120;
    const furnitureTotal = Math.round((chairs * chairRate + tables * tableRate) * days);
    const pandalSqft = mode.id === 'tent_sqft' ? Math.max(1, Number(sub.pandalAreaSqft) || qty) : 0;
    const pandalRate = Number(input.contractorUnitRate) > 0 && Number(input.contractorUnitRate) < 1000 ? Number(input.contractorUnitRate) : 24;
    const pandalTotal = Math.round(pandalSqft * pandalRate * days);
    return {
      totalLaborAmount: pandalTotal + furnitureTotal,
      appliedRateLabel: `पंडाल ₹${pandalRate}/sq.ft + कुर्सी/टेबल × ${days} दिन`,
      breakdownLineHi: `${pandalSqft > 0 ? `${pandalSqft} sq.ft + ` : ''}${chairs} कुर्सी + ${tables} टेबल × ${days} दिन`,
      extraAddonsAmount: furnitureTotal,
    };
  }

  if (profile.id === 'caterer') {
    if (mode.id === 'caterer_full_function') {
      const pkg = Number(input.contractorUnitRate) > 5000 ? Number(input.contractorUnitRate) : mode.defaultRate;
      return {
        totalLaborAmount: Math.round(pkg * qty),
        appliedRateLabel: `पूरा फंक्शन ₹${pkg.toLocaleString('en-IN')}`,
        breakdownLineHi: `${qty} फंक्शन × ₹${pkg.toLocaleString('en-IN')}`,
        extraAddonsAmount: 0,
      };
    }
    const minPlates = Math.max(20, Number(sub.minPlatesGuaranteed) || 100);
    const totalPlates = Math.max(minPlates, Number(sub.expectedTotalPlates) || qty);
    const baseRate = Number(input.contractorUnitRate) > 0 && Number(input.contractorUnitRate) < 5000 ? Number(input.contractorUnitRate) : 450;
    const extraRate = Math.max(50, Number(sub.extraPlatePrice) || Math.round(baseRate * 0.85));
    const menuOpt = profile.bookingFields.find((f) => f.id === 'cateringMenuType')?.options?.find((o) => o.value === sub.cateringMenuType);
    const mult = menuOpt?.rateMultiplier || 1;
    const effBase = Math.round(baseRate * mult);
    const effExtra = Math.round(extraRate * mult);
    const extraPlates = Math.max(0, totalPlates - minPlates);
    const total = Math.round(minPlates * effBase + extraPlates * effExtra);
    return {
      totalLaborAmount: total,
      appliedRateLabel: `न्यूनतम ${minPlates} @ ₹${effBase} + अति. @ ₹${effExtra}`,
      breakdownLineHi: `${minPlates} × ₹${effBase} + ${extraPlates} अति. प्लेट × ₹${effExtra}`,
      extraAddonsAmount: extraPlates * effExtra,
    };
  }

  // Generic unit fallback (plumber, electrician, aluminium_upvc, waterproofing, wedding_photo, wedding_makeup)
  const effectiveUnitRate =
    Number(input.contractorUnitRate) > 0
      ? Number(input.contractorUnitRate)
      : input.fallbackLaborEstimate && input.fallbackLaborEstimate > 0
      ? input.fallbackLaborEstimate
      : mode.defaultRate;

  const total =
    input.fallbackLaborEstimate && input.fallbackLaborEstimate > 0 && !(Number(input.contractorUnitRate) > 0)
      ? Math.round(input.fallbackLaborEstimate)
      : Math.round(qty * effectiveUnitRate);

  return {
    totalLaborAmount: total,
    appliedRateLabel: `₹${effectiveUnitRate} / ${mode.unitHi}`,
    breakdownLineHi: `${qty} ${mode.unitHi} × ₹${effectiveUnitRate}`,
    extraAddonsAmount: 0,
  };
}
