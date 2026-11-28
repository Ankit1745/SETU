import { Contractor, MaterialItem } from './mockData';

export type PriceTier = 'budget' | 'standard' | 'luxury';

export interface ShowroomProduct {
  id: string;
  name: string;
  brand: string;
  qualitySpec?: string;
  tier: PriceTier;
  price: number;
  unit: string;
  approxQtyMultiplier?: number;
  supplierName: string;
  imageUrl: string;
  visualDescriptor: string;
}

export interface ShowroomGroup {
  groupId: string;
  groupTitle: string;
  items: ShowroomProduct[];
}

export type ShowroomProjectType =
  | 'bed'
  | 'kitchen'
  | 'wardrobe'
  | 'tv_unit_living'
  | 'door_window'
  | 'house'
  | 'tiles_flooring'
  | 'false_ceiling'
  | 'bathroom'
  | 'painting'
  | 'electrical'
  | 'iron_gate'
  | 'custom';

export const PROJECT_TYPE_LABELS: Record<ShowroomProjectType, { hi: string; en: string; trade: 'carpenter' | 'mason' | 'plumber' | 'electrician' | 'painter' | 'welder' | 'tiling' }> = {
  bed: { hi: 'बेड / पलंग निर्माण', en: 'Custom Bed Construction', trade: 'carpenter' },
  kitchen: { hi: 'मॉड्यूलर किचन', en: 'Modular Kitchen', trade: 'carpenter' },
  wardrobe: { hi: 'अलमारी / वॉर्डरोब', en: 'Wardrobe / Almirah', trade: 'carpenter' },
  tv_unit_living: { hi: 'टीवी यूनिट / सोफा / डाइनिंग', en: 'TV Unit / Living Furniture', trade: 'carpenter' },
  door_window: { hi: 'दरवाजा / चौखट / खिड़की', en: 'Door & Window Work', trade: 'carpenter' },
  house: { hi: 'मकान / कमरा / छत निर्माण', en: 'House / Masonry Construction', trade: 'mason' },
  tiles_flooring: { hi: 'टाइल्स / मार्बल / ग्रेनाइट फ्लोरिंग', en: 'Tiles & Marble Flooring', trade: 'tiling' },
  false_ceiling: { hi: 'फॉल सीलिंग / POP / PVC पैनल', en: 'False Ceiling & POP', trade: 'painter' },
  bathroom: { hi: 'बाथरूम & सैनिटरी फिटिंग', en: 'Bathroom & Plumbing', trade: 'plumber' },
  painting: { hi: 'पुट्टी, प्राइमर & पेंटिंग', en: 'Putty & Wall Painting', trade: 'painter' },
  electrical: { hi: 'बिजली वायरिंग & लाइटिंग', en: 'Electrical & Smart Lighting', trade: 'electrician' },
  iron_gate: { hi: 'लोहे का गेट / ग्रिल / स्टील रेलिंग', en: 'Iron Gate / Steel Railing', trade: 'welder' },
  custom: { hi: 'कस्टम निर्माण / फर्नीचर कार्य', en: 'Custom Work', trade: 'carpenter' },
};

function stripClientNegatedClauses(text = ''): string {
  const raw = (text || '').trim();
  if (!raw) return '';
  const stripped = raw
    .replace(/(?:not\s+a?\s+|don't\s+want\s+|do\s+not\s+want\s+|without\s+|no\s+)[^,.;!?]+/gi, ' ')
    .replace(/(?:[^\s,;।]+\s+(?:का|की|के|वाला|वाली)\s+)?[^\s,;।]+\s+(?:नहीं|मत|छोड़कर|ना)(?=$|[\s,;।.!?])(?:\s*(?:चाहिए|बनाना|बनवाना|दिखाओ|करना|लगाना))?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length >= 3 ? stripped : raw;
}

/**
 * Normalizes any AI or user-provided project tag strictly so explicit customer text
 * ALWAYS takes priority over hallucinated/stale AI tags, handles negations & Hinglish spellings.
 */
export function normalizeProjectType(rawType?: string | null, contextText = ''): ShowroomProjectType {
  const cleanedText = stripClientNegatedClauses(contextText);
  const textOnly = cleanedText.toLowerCase().trim();

  const exactKeys: ShowroomProjectType[] = [
    'bed',
    'kitchen',
    'wardrobe',
    'tv_unit_living',
    'door_window',
    'house',
    'tiles_flooring',
    'false_ceiling',
    'bathroom',
    'painting',
    'electrical',
    'iron_gate',
    'custom',
  ];
  const rawLower = (rawType || '').toLowerCase().trim() as ShowroomProjectType;

  // 1. Check explicit user contextText FIRST so hallucinated rawType never overrides what customer asked!
  if (textOnly) {
    if (/(पेंट|पुट्टी|पॉलिश|वाटरप्रूफ|रंगना|paint|putty|polish|repaint)/i.test(textOnly) && !/(नया बेड|नया दरवाजा|नया किचन|नई अलमारी|build|banwana|बनवाना)/i.test(textOnly)) {
      return 'painting';
    }
    if (/पूजा घर|पूजा रूम|पूजा कक्ष|pooja ghar|puja ghar|pooja room|mandir|मंदिर|temple|mandap/.test(textOnly)) {
      return 'custom';
    }
    if (/ड्रेसिंग टेबल|dressing table|ड्रेसिंग यूनिट|dressing unit|ऑफिस केबिन|ऑफिस डेस्क|स्टडी टेबल|study table|office cabin|reception counter|शॉप काउंटर|दुकान काउंटर/.test(textOnly)) {
      return 'custom';
    }
    if (/बेड(?=$|[\s,।.!?])|डबल बेड|सिंगल बेड|पलंग|पलँग|तखत|दीवान|\bbed\b|double bed|king bed|queen bed|hydraulic bed|\bcot\b|palangh?|takhat/.test(textOnly)) {
      return 'bed';
    }
    if (/अलमारी|वॉर्डरोब|wardrobe|almirah|almari|almera|almira|cupboard|closet/.test(textOnly)) {
      return 'wardrobe';
    }
    if (/किचन|रसोई|rasoi|kitchen|modular kitchen/.test(textOnly)) {
      return 'kitchen';
    }
    if (/दरवाजा|दरवाज़ा|चौखट|खिड़की|पल्ला|\bdoor\b|window|chaukhat|chowkhat|darwa?za|khidaki|khidki/.test(textOnly)) {
      return 'door_window';
    }
    if (/गेट|ग्रिल|रेलिंग|टीन शेड|शेड|शटर|लोहा|वेल्ड|\bgate\b|grill|railing|shed|steel|iron|fabrication/.test(textOnly)) {
      return 'iron_gate';
    }
    if (/फॉल सीलिंग|सीलिंग|पीओपी|पैनल|ceiling|\bpop\b|gypsum|pvc panel/.test(textOnly)) {
      return 'false_ceiling';
    }
    if (/टाइल्स|टाइल|मार्बल|ग्रेनाइट|फ्लोरिंग|फर्श|सीढ़ी|tile|marble|granite|flooring|farsh|stair/.test(textOnly)) {
      return 'tiles_flooring';
    }
    if (/पेंट|पुट्टी|रंग|सफेदी|वाटरप्रूफ|पॉलिश|paint|putty|waterproof/.test(textOnly)) {
      return 'painting';
    }
    if (/बिजली|वायर|स्विच|पंखा|झूमर|लाइट|सोलर|\bac\b|एसी |cooling|electric|wiring|light|mcb/.test(textOnly)) {
      return 'electrical';
    }
    if (/बाथरूम|टॉयलेट|वॉशरूम|नहाने|गीजर|प्लंब|bathroom|washroom|toilet|sanitary|geyser/.test(textOnly)) {
      return 'bathroom';
    }
    if (/टीवी|सोफा|डाइनिंग|मेज|कुर्सी|टेबल|tv unit|sofa|dining|crockery|living room|लिविंग रूम/.test(textOnly)) {
      return 'tv_unit_living';
    }
    if (/घर|मकान|कमरा बना|दीवार बना|छत बना|छत टपक|प्लॉट|लेंटर|नींव|चिनाई|बिल्डिंग|house|home|makan|plot|wall|roof|duplex|masonry/.test(textOnly)) {
      return 'house';
    }
    if (/काउंटर|counter|दुकान|dukaan?|shop|केबिन|cabin|ऑफिस|office|झूला|झुला|jhoola|jhula|jula|swing|ड्रेसिंग|dressing|bookshelf|shoe rack|shoe stand|partition/.test(textOnly)) {
      return 'custom';
    }
  }

  // 2. Fallback to AI-provided rawType when text alone was generic (e.g. "इसका कलर बदलो")
  if (exactKeys.includes(rawLower)) {
    return rawLower;
  }
  return 'custom';
}

/**
 * 100% RAW MATERIALS ("कच्चा माल") SUPPLIER CATALOG
 * Strictly raw wood, ply, mica, steel, cement, pipes, wires, stone & fittings —
 * zero pre-built readymade beds/kitchens! Customer picks raw materials -> SETU builds the model!
 */
export const SUPPLIER_SHOWROOM: Record<ShowroomProjectType, ShowroomGroup[]> = {
  bed: [
    {
      groupId: 'timber_ply',
      groupTitle: '1. मुख्य ढांचा — लकड़ी व प्लाईवुड (कच्चा माल)',
      items: [
        {
          id: 'bed_ply_budget',
          name: 'कॉमर्शियल MR प्लाई 19mm (8x4 शीट)',
          brand: 'Greenply Eco MR',
          qualitySpec: 'IS:303 ग्रेड • सूखे बेडरूम हेतु किफ़ायती प्लाई',
          tier: 'budget',
          price: 1350,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'गुप्ता टिंबर & प्लाई, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean modern commercial plywood queen-size box bed frame',
        },
        {
          id: 'bed_ply_std',
          name: 'सेंचुरी BWP 710 वॉटरप्रूफ प्लाई 19mm',
          brand: 'CenturyPly Sainik',
          qualitySpec: 'IS:710 मरीन ग्रेड • दीमक व नमी-रोधी',
          tier: 'standard',
          price: 2450,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'heavy-duty solid king-size BWP plywood box bed structure with thick side borders',
        },
        {
          id: 'bed_timber_lux',
          name: 'असली MP सागवान / शीशम लकड़ी पटिये',
          brand: 'Royal Sagwan Timber',
          qualitySpec: '100% सीज़न्ड ठोस लकड़ी • 25 साल लाइफ',
          tier: 'luxury',
          price: 2150,
          unit: 'प्रति घन फुट',
          approxQtyMultiplier: 8,
          supplierName: 'अग्रवाल आरा मशीन & टिंबर, हबीबगंज',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'handcrafted solid seasoned Burma teakwood and Sheesham timber bed legs, sturdy solid wood frame with natural wood grain polish',
        },
      ],
    },
    {
      groupId: 'bed_surface',
      groupTitle: '2. ऊपरी फिनिश — माइका, विनीयर व कुशन फैब्रिक (कच्चा माल)',
      items: [
        {
          id: 'bed_mica_budget',
          name: 'मैट वुड-ग्रेन सनमाइका (0.8mm शीट)',
          brand: 'Merino Matte',
          qualitySpec: 'स्क्रैच-रोधी मैट टेक्सचर • 8x4 शीट',
          tier: 'budget',
          price: 850,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 3,
          supplierName: 'गुप्ता टिंबर & प्लाई, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'warm light oak matte sunmica finish on bed frame and plain flat headboard',
        },
        {
          id: 'bed_mica_std',
          name: 'रॉयल टीक / वॉलनट 1mm माइका शीट',
          brand: 'Greenlam Classic',
          qualitySpec: '1mm हैवी टेक्सचर • नेचुरल लकड़ी लुक',
          tier: 'standard',
          price: 1650,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 3,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'rich dark walnut teak textured 1mm laminate finish with upholstered tufted beige headboard and neat linen',
        },
        {
          id: 'bed_cushion_lux',
          name: 'नेचुरल टीक विनीयर + स्विस वेल्वेट व 40D फोम रोल',
          brand: 'Century Veneer + Sleepwell',
          qualitySpec: '4mm रियल वुड विनीयर + कुशन हेडबोर्ड मटीरियल',
          tier: 'luxury',
          price: 3200,
          unit: 'प्रति शीट/रोल',
          approxQtyMultiplier: 3,
          supplierName: 'अरेरा टिंबर & अपहोल्स्ट्री गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury fluted wooden veneer paneling with plush velvet cushioned tall headboard, natural melamine satin sheen',
        },
      ],
    },
    {
      groupId: 'bed_hardware',
      groupTitle: '3. बेड हार्डवेयर — हाइड्रॉलिक पंप, स्क्रू & गोंद (कच्चा माल)',
      items: [
        {
          id: 'bed_hw_budget',
          name: 'L-एंगल, स्टार स्क्रू + फेविकोल SH (2kg)',
          brand: 'Pidilite & Ebco',
          qualitySpec: 'स्टैंडर्ड मैनुअल स्टोरेज बॉक्स फिटिंग किट',
          tier: 'budget',
          price: 1250,
          unit: 'पूरा फिटिंग सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'sturdy clean low-profile wooden bed box storage with crisp mattress setup',
        },
        {
          id: 'bed_hw_std',
          name: '125kg हाइड्रॉलिक गैस-लिफ्ट पंप + फेविकोल मरीन (5kg)',
          brand: 'Hettich & Pidilite',
          qualitySpec: 'आसान लिफ्टिंग हाइड्रॉलिक स्टोरेज सिस्टम',
          tier: 'standard',
          price: 3600,
          unit: 'हाइड्रॉलिक किट',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern hydraulic lift-up storage king bed with integrated floating bedside side-tables',
        },
        {
          id: 'bed_hw_lux',
          name: 'हेफेले सॉफ्ट-क्लोज़ बेड ड्रॉअर + वार्म LED प्रोफाइल किट',
          brand: 'Hafele Germany',
          qualitySpec: 'बेड के नीचे 2 बड़े ड्रॉअर + बैकलाइट हेडबोर्ड स्ट्रिप',
          tier: 'luxury',
          price: 6400,
          unit: 'लक्ज़री हार्डवेयर पैक',
          approxQtyMultiplier: 1,
          supplierName: 'अरेरा टिंबर & अपहोल्स्ट्री गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'under-bed glow LED warm backlit headboard ambiance with built-in floating drawer nightstands',
        },
      ],
    },
  ],

  kitchen: [
    {
      groupId: 'ply_board',
      groupTitle: '1. किचन बॉडी प्लाई / बोर्ड शीट्स (कच्चा माल)',
      items: [
        {
          id: 'k_ply_budget',
          name: 'BWR 303 वॉटर-रेसिस्टेंट प्लाई 18mm',
          brand: 'Greenply BWR',
          qualitySpec: 'सेमी-वॉटरप्रूफ IS:303 • बेसिक किचन बॉक्स',
          tier: 'budget',
          price: 1650,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'solid neat modular kitchen carcass boxes',
        },
        {
          id: 'k_ply_std',
          name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm',
          brand: 'CenturyPly Sainik 710',
          qualitySpec: '100% बॉइलिंग वाटरप्रूफ • सिंक हेतु सर्वश्रेष्ठ',
          tier: 'standard',
          price: 2450,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'heavy-duty moisture-proof modular kitchen cabinets',
        },
        {
          id: 'k_ply_lux',
          name: 'HDHMR हाई-डेंसिटी ग्रीन बोर्ड 18mm',
          brand: 'Action Tesa HDHMR',
          qualitySpec: 'दीमक व नमी 100% सुरक्षित • CNC राउटर फिनिश',
          tier: 'luxury',
          price: 2950,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'precision CNC fluted and handleless modular kitchen cabinetry',
        },
      ],
    },
    {
      groupId: 'mica',
      groupTitle: '2. शटर माइका / एक्रेलिक शीट्स (कच्चा माल)',
      items: [
        {
          id: 'k_mica_budget',
          name: 'इकोनॉमी मैट माइका (0.8mm शीट)',
          brand: 'Merino Lite',
          qualitySpec: 'क्लीन मैट क्रीम / बेज लैमिनेट',
          tier: 'budget',
          price: 850,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean matte warm beige 0.8mm sunmica kitchen cabinet shutters',
        },
        {
          id: 'k_mica_std',
          name: 'रॉयल टीकवुड 1mm टेक्सचर माइका शीट',
          brand: 'Greenlam Classic',
          qualitySpec: '1mm हीट व स्क्रैच प्रूफ • 2mm PVC एज-बैंडिंग योग्य',
          tier: 'standard',
          price: 1650,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'rich natural dark teakwood 1mm sunmica shutters with brushed handles',
        },
        {
          id: 'k_mica_lux',
          name: '1.5mm हाई-ग्लॉस क्रिस्टल एक्रेलिक शीट',
          brand: 'Rehau Acrylic',
          qualitySpec: 'मिरर ग्लास लुक • एंटी-फिंगरप्रिंट जर्मन शीट',
          tier: 'luxury',
          price: 3400,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'mirror-finish high-gloss cream and warm walnut acrylic shutters with concealed G-profile handles and under-cabinet LED strip',
        },
      ],
    },
    {
      groupId: 'countertop',
      groupTitle: '3. पत्थर / काउंटरटॉप स्लैब (कच्चा माल)',
      items: [
        {
          id: 'k_stn_budget',
          name: 'ब्लैक ग्रेनाइट पॉलिश स्लैब',
          brand: 'Rajasthan Jet Black',
          qualitySpec: '18mm हैवी ड्यूटी भारतीय ग्रेनाइट पत्थर',
          tier: 'budget',
          price: 170,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 24,
          supplierName: 'न्यू मार्केट मार्बल & ग्रेनाइट',
          imageUrl: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'polished black granite countertop with stainless steel sink',
        },
        {
          id: 'k_stn_std',
          name: 'वाइट गैलेक्सी क्वार्ट्ज़ स्लैब',
          brand: 'Kalinga Stone Quartz',
          qualitySpec: 'दाग-रोधी 20mm नॉन-पोरस इंजीनियर पत्थर',
          tier: 'standard',
          price: 340,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 24,
          supplierName: 'न्यू मार्केट मार्बल & ग्रेनाइट',
          imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'crisp white quartz stone countertop with sleek backsplash',
        },
        {
          id: 'k_stn_lux',
          name: 'इटैलियन सतवारियो मार्बल स्लैब',
          brand: 'Italian Imported',
          qualitySpec: 'हाई-लक्ज़री नेचुरल गोल्डन-वेन मार्बल स्लैब',
          tier: 'luxury',
          price: 580,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 24,
          supplierName: 'अरेरा मार्बल गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'Italian white Satvario marble countertop and full-height seamless marble backsplash',
        },
      ],
    },
    {
      groupId: 'drawers',
      groupTitle: '4. चैनल, हिंज, बास्केट & फेविकोल (कच्चा माल)',
      items: [
        {
          id: 'k_drw_budget',
          name: 'SS-202 वायर बास्केट सेट + फेविकोल मरीन',
          brand: 'Standard SS-202',
          qualitySpec: '5 बेसिक कटलरी/थाली स्टील बास्केट + हिंज',
          tier: 'budget',
          price: 4200,
          unit: 'हार्डवेयर सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'classic hinged lower shutters and standard steel cutlery drawers',
        },
        {
          id: 'k_drw_std',
          name: 'एबको सॉफ्ट-क्लोज़ टैंडेम चैनल किट (5 पीस)',
          brand: 'Ebco Pro',
          qualitySpec: '45kg लोड क्षमता • बिना आवाज स्लो-क्लोज़ चैनल',
          tier: 'standard',
          price: 8800,
          unit: 'चैनल सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'wide seamless tandem soft-close drawers with aluminum G-profile handles',
        },
        {
          id: 'k_drw_lux',
          name: 'हेटिक कॉर्नर मैजिक बास्केट + हाइड्रॉलिक लिफ्टर',
          brand: 'Hettich Germany',
          qualitySpec: 'जर्मन 3D एडजस्टमेंट + लिफ्ट-अप अपर शटर पंप',
          tier: 'luxury',
          price: 15500,
          unit: 'जर्मन पैक',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'hydraulic lift-up upper frosted glass cabinets and wide black chimney hood with cove lighting',
        },
      ],
    },
  ],

  wardrobe: [
    {
      groupId: 'ply',
      groupTitle: '1. अलमारी प्लाईवुड / ब्लॉकबोर्ड शीट्स (कच्चा माल)',
      items: [
        {
          id: 'w_ply_budget',
          name: 'MR कॉमर्शियल प्लाई 18mm (8x4)',
          brand: 'Local ISI Ply',
          qualitySpec: 'IS:303 • सूखे बेडरूम अलमारी हेतु',
          tier: 'budget',
          price: 1450,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean neat built-in bedroom wardrobe structure',
        },
        {
          id: 'w_ply_std',
          name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm',
          brand: 'CenturyPly Sainik',
          qualitySpec: 'सीलिंग व दीवार नमी-रोधी IS:710 शीट',
          tier: 'standard',
          price: 2450,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'tall floor-to-ceiling waterproof plywood wardrobe with upper loft storage',
        },
      ],
    },
    {
      groupId: 'mica',
      groupTitle: '2. शटर माइका / विनीयर / ग्लास शीट (कच्चा माल)',
      items: [
        {
          id: 'w_mica_budget',
          name: 'व्हाइट & ग्रे मैट माइका (0.8mm)',
          brand: 'Merino 0.8mm',
          qualitySpec: 'मिनिमलिस्ट हल्के रंग का लैमिनेट',
          tier: 'budget',
          price: 850,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'matte light grey and white 3-door hinged wardrobe with overhead loft shutters',
        },
        {
          id: 'w_mica_std',
          name: 'डार्क वॉलनट टीकवुड 1mm माइका शीट',
          brand: 'Greenlam Teak',
          qualitySpec: 'रियल वुड ग्रेन 1mm लैमिनेट',
          tier: 'standard',
          price: 1650,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'rich dark walnut teakwood sliding wardrobe with full-length dressing mirror and brass profile handles',
        },
        {
          id: 'w_mica_lux',
          name: 'टिन्टेड फ्लूटेड ग्लास + एल्युमीनियम शटर प्रोफाइल',
          brand: 'Saint-Gobain & Alu',
          qualitySpec: '5mm टफन्ड टिन्टेड ग्लास + गोल्डन एल्युमीनियम फ्रेम',
          tier: 'luxury',
          price: 3500,
          unit: 'प्रति शटर पैनल',
          approxQtyMultiplier: 4,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'designer tinted fluted-glass door floor-to-ceiling wardrobe with warm interior LED strips and bronze trim',
        },
      ],
    },
    {
      groupId: 'wardrobe_hw',
      groupTitle: '3. स्लाइडिंग ट्रैक, सॉफ्ट-क्लोज़ हिंज & लॉक (कच्चा माल)',
      items: [
        {
          id: 'w_hw_budget',
          name: '12 SS हिंज + टावर बोल्ट + गॉदरेज लॉक',
          brand: 'Godrej / Dorsett',
          qualitySpec: 'ओपन डोर अलमारी हार्डवेयर सेट',
          tier: 'budget',
          price: 1850,
          unit: 'पूरा सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'neat hinged wardrobe shutters with vertical stainless handles',
        },
        {
          id: 'w_hw_std',
          name: 'हेटिक सॉफ्ट-क्लोज़ हिंज (12 पीस) + मैट ब्लैक प्रोफाइल हैंडल',
          brand: 'Hettich & Ebco',
          qualitySpec: 'स्टैंडर्ड साइलेंट सॉफ्ट-क्लोज़ हार्डवेयर सेट',
          tier: 'standard',
          price: 3800,
          unit: 'सॉफ्ट-क्लोज़ सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern matte black profile handles with smooth soft-close wardrobe doors',
        },
        {
          id: 'w_hw_lux',
          name: 'हेटिक स्लाइडिंग डोर चैनल + सेंसर LED स्ट्रिप',
          brand: 'Hettich & Syska LED',
          qualitySpec: 'हैवी 80kg सॉफ्ट-क्लोज़ स्लाइडिंग ट्रैक',
          tier: 'luxury',
          price: 6800,
          unit: 'स्लाइडिंग किट',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'flush seamless sliding wardrobe with recessed warm LED sensor glow',
        },
      ],
    },
  ],

  tv_unit_living: [
    {
      groupId: 'frame_sheet',
      groupTitle: '1. प्लाईवुड, WPC लूवर्स व चारकोल शीट्स (कच्चा माल)',
      items: [
        {
          id: 'tv_ply_budget',
          name: '18mm कॉमर्शियल प्लाई + बेसिक PVC शीट',
          brand: 'Greenply MR',
          qualitySpec: 'सादा मजबूत टीवी यूनिट / सोफा / टेबल फ्रेम हेतु',
          tier: 'budget',
          price: 1450,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean floating wooden TV console with matte beige wall backdrop',
        },
        {
          id: 'tv_louver_std',
          name: 'वुडन WPC फ्लूटेड लूवर्स पैनल + BWR प्लाई',
          brand: 'E3 / Pare WPC',
          qualitySpec: '10 फीट × 6 इंच वॉटरप्रूफ रिब्ड वुड पैनल',
          tier: 'standard',
          price: 980,
          unit: 'प्रति पैनल',
          approxQtyMultiplier: 8,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'vertical fluted warm walnut WPC wall louvers with sleek floating drawer unit and backlit LED strip',
        },
        {
          id: 'tv_charcoal_lux',
          name: 'मार्बल UV शीट + मेटैलिक गोल्ड चारकोल पैनल',
          brand: 'Euro Pratik / Merino',
          qualitySpec: '8x4 फीट इटैलियन मार्बल लुक हाई-ग्लॉस शीट',
          tier: 'luxury',
          price: 3600,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'अरेरा टिंबर & डेकोर हब',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury Italian marble bookmatch UV wall sheet flanked by fluted charcoal panels and warm architectural cove lighting',
        },
      ],
    },
    {
      groupId: 'upholstery_fit',
      groupTitle: '2. फोम, फैब्रिक रोल, चैनल व LED प्रोफाइल (कच्चा माल)',
      items: [
        {
          id: 'tv_mat_budget',
          name: 'सॉफ्ट-क्लोज़ ड्रॉअर चैनल + केबल मैनेजर',
          brand: 'Ebco Hardware',
          qualitySpec: '4 ड्रॉअर चैनल + हिडन वायरिंग पाइप',
          tier: 'budget',
          price: 2200,
          unit: 'फिटिंग सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clutter-free floating drawers with hidden TV wiring',
        },
        {
          id: 'tv_sofa_std',
          name: '40-डेंसिटी स्लीपवेल फोम + स्यूड फैब्रिक रोल',
          brand: 'Sleepwell + DDecor',
          qualitySpec: 'सोफा / हेडबोर्ड / सीटिंग निर्माण हेतु कच्चा माल',
          tier: 'standard',
          price: 1850,
          unit: 'प्रति शीट/मीटर',
          approxQtyMultiplier: 5,
          supplierName: 'अरेरा टिंबर & अपहोल्स्ट्री गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'plush clean linen & suede upholstered seating / living furniture with warm natural wood base',
        },
      ],
    },
  ],

  door_window: [
    {
      groupId: 'door_raw',
      groupTitle: '1. चौखट & दरवाजा/खिड़की पल्ला (कच्चा माल)',
      items: [
        {
          id: 'dw_flush_budget',
          name: 'पाइनवुड फ्लश डोर ब्लैंक + GI चौखट',
          brand: 'Century / ISI Flush',
          qualitySpec: '32mm सॉलिड कोर रॉ फ्लश डोर (पेंट/माइका हेतु तैयार)',
          tier: 'budget',
          price: 2400,
          unit: 'प्रति दरवाजा रॉ',
          approxQtyMultiplier: 2,
          supplierName: 'गुप्ता टिंबर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean smooth modern wooden door with sleek steel frame',
        },
        {
          id: 'dw_wpc_std',
          name: 'WPC दीमक-प्रूफ चौखट + 1mm टीक माइका डोर',
          brand: 'Sintex / E3 WPC',
          qualitySpec: '100% वॉटरप्रूफ व दीमक-रोधी फ्रेम + लैमिनेटेड डोर',
          tier: 'standard',
          price: 4600,
          unit: 'चौखट + पल्ला रॉ',
          approxQtyMultiplier: 2,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern teakwood-textured flush entrance door with fluted grooves and brass trim',
        },
        {
          id: 'dw_teak_lux',
          name: 'असली सागवान (Teak) लकड़ी पल्ला व नक्काशी फ्रेम',
          brand: 'Burma / CP Teak',
          qualitySpec: 'सीज़न्ड ठोस सागवान पटिये (मेन गेट / मंदिर / कमरा)',
          tier: 'luxury',
          price: 9800,
          unit: 'प्रति दरवाजा लकड़ी',
          approxQtyMultiplier: 1,
          supplierName: 'अग्रवाल आरा मशीन & टिंबर, हबीबगंज',
          imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'handcrafted solid teakwood paneled main door with natural gloss varnish and brass handle',
        },
      ],
    },
    {
      groupId: 'door_hw',
      groupTitle: '2. मॉर्टाइस लॉक, हैवी कब्जे & पॉलिश (कच्चा माल)',
      items: [
        {
          id: 'dw_lock_budget',
          name: 'SS 5-इंच बॉल-बेयरिंग कब्जे (4 पीस) + लATCH',
          brand: 'Link / Ebco',
          qualitySpec: 'स्टेनलेस स्टील रस्ट-फ्री फिटिंग्स',
          tier: 'budget',
          price: 950,
          unit: 'प्रति दरवाजा सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean brushed steel door hinges and cylindrical lock',
        },
        {
          id: 'dw_lock_std',
          name: 'गोदरेज / डोरसेट हैवी मॉर्टाइस लॉक + 8mm टफन्ड ग्लास',
          brand: 'Godrej & Saint-Gobain',
          qualitySpec: 'एंटी-थेफ्ट हैवी लॉक + फ्रॉस्टेड ग्लास (खिड़की/दरवाजा)',
          tier: 'standard',
          price: 2900,
          unit: 'लॉक + पॉलिश सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'architectural satin brass pull handle and tempered glass panel accents',
        },
      ],
    },
  ],

  house: [
    {
      groupId: 'cement_steel',
      groupTitle: '1. सीमेंट & TMT सरिया — मूल स्ट्रक्चर (कच्चा माल)',
      items: [
        {
          id: 'h_mat_budget',
          name: 'बिरला / जेके PPC सीमेंट + कामधेनु TMT 10mm',
          brand: 'JK Super + Kamdhenu',
          qualitySpec: 'सिंगल-फ्लोर व बाउंड्री वाल हेतु मानक स्ट्रक्चर पैक',
          tier: 'budget',
          price: 360,
          unit: 'प्रति बोरी (सीमेंट+सरिया बेस)',
          approxQtyMultiplier: 90,
          supplierName: 'किसान बिल्डिंग मटेरियल, करोंद',
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean single-story modern Indian home with solid concrete columns, red clay brick facade, and plaster boundary wall',
        },
        {
          id: 'h_mat_std',
          name: 'अल्ट्राटेक सीमेंट + टाटा टिस्कॉन 550D सरिया',
          brand: 'UltraTech + Tata Tiscon',
          qualitySpec: 'भूकंप-रोधी 550D सरिया + 53-ग्रेड OPC/PPC सीमेंट',
          tier: 'standard',
          price: 395,
          unit: 'प्रति बोरी पैक यूनिट',
          approxQtyMultiplier: 120,
          supplierName: 'भोपाल बिल्डिंग मटेरियल हब, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'newly built 2-story modern Indian duplex home with warm wood pergola, glass balcony railing and exterior lighting',
        },
        {
          id: 'h_mat_lux',
          name: 'अल्ट्राटेक वेदरप्रूफ + जिंदल पैंथर Fe550D (लक्ज़री)',
          brand: 'UltraTech WeatherPlus + Jindal',
          qualitySpec: 'मजबूत बहु-मंजिला (G+2/डुप्लेक्स) निर्माण ग्रेड',
          tier: 'luxury',
          price: 430,
          unit: 'प्रति बोरी पैक यूनिट',
          approxQtyMultiplier: 150,
          supplierName: 'अरेरा स्टील & सीमेंट डिपो',
          imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury contemporary Indian villa elevation with cantilevered concrete slabs, glass terrace and stone cladding',
        },
      ],
    },
    {
      groupId: 'bricks_blocks',
      groupTitle: '2. ईंट / AAC ब्लॉक / नर्मदा रेत & गिट्टी (कच्चा माल)',
      items: [
        {
          id: 'h_brk_budget',
          name: 'अव्वल कड़क लाल ईंटें + क्रश सैंड (प्रति 1,000 पैक)',
          brand: 'MP Red Clay Bhatta',
          qualitySpec: '1 नंबर पक्की लाल ईंटें (लोड-बेयरिंग चिनाई)',
          tier: 'budget',
          price: 7500,
          unit: 'प्रति 1,000 ईंट',
          approxQtyMultiplier: 6,
          supplierName: 'किसान बिल्डिंग मटेरियल, करोंद',
          imageUrl: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'exposed red brick masonry accents and clean plastered home structure',
        },
        {
          id: 'h_brk_std',
          name: 'हल्के AAC थर्मल ब्लॉक + ब्लॉक एडहेसिव पैक',
          brand: 'Biltech / Magicrete AAC',
          qualitySpec: 'गर्मी से बचाव (कमरे ठंडे) + कम सीमेंट खपत + तेज चिनाई',
          tier: 'standard',
          price: 6200,
          unit: 'प्रति 100 ब्लॉक पैक',
          approxQtyMultiplier: 8,
          supplierName: 'भोपाल बिल्डिंग मटेरियल हब, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'crisp razor-straight plastered exterior walls with clean architectural lines',
        },
      ],
    },
    {
      groupId: 'waterproofing',
      groupTitle: '3. छत व नींव वाटरप्रूफिंग केमिकल (कच्चा माल)',
      items: [
        {
          id: 'h_wp_std',
          name: 'डॉ. फिक्सिट LW+ 5 लीटर + 20mm गिट्टी ट्रीटमेंट',
          brand: 'Pidilite Dr. Fixit',
          qualitySpec: 'नींव DPC व छत लेंटर सीलन-रोधी केमिकल',
          tier: 'standard',
          price: 980,
          unit: 'प्रति 5L केन',
          approxQtyMultiplier: 4,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'fresh waterproof white exterior terrace parapet and sealed slab finish',
        },
      ],
    },
  ],

  tiles_flooring: [
    {
      groupId: 'tile_stone',
      groupTitle: '1. टाइल्स / मार्बल / ग्रेनाइट कच्चा माल',
      items: [
        {
          id: 'fl_tile_budget',
          name: 'मोरबी सिरेमिक मैट फ्लोर टाइल्स (2x2 ft)',
          brand: 'Morbi Standard',
          qualitySpec: 'रफ व साफ-सुथरा एंटी-स्किड मैट फिनिश',
          tier: 'budget',
          price: 42,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 250,
          supplierName: 'होशंगाबाद रोड टाइल हब',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'neat warm beige 2x2 matte ceramic floor tiles with tight uniform joints',
        },
        {
          id: 'fl_tile_std',
          name: 'कजारिया 4x2 ft हाई-ग्लॉस विट्रीफाइड (PGVT)',
          brand: 'Kajaria / Somany',
          qualitySpec: 'मार्बल टेक्सचर डबल-चार्ज ज़ीरो-जॉइंट टाइल्स',
          tier: 'standard',
          price: 82,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 250,
          supplierName: 'होशंगाबाद रोड टाइल हब',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'mirror-polished large-format 4x2 cream and subtle vein vitrified flooring with seamless finish',
        },
        {
          id: 'fl_marble_lux',
          name: 'इटैलियन सतवारियो / कटनी मार्बल स्लैब (कच्चा)',
          brand: 'Italian / Katni Cut',
          qualitySpec: '18mm डायमंड-पॉलिश नेचुरल मार्बल स्लैब',
          tier: 'luxury',
          price: 195,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 250,
          supplierName: 'अरेरा मार्बल गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'bookmatched glossy white Italian marble slab flooring with brass inlay skirting',
        },
      ],
    },
    {
      groupId: 'adhesive_grout',
      groupTitle: '2. टाइल केमिकल एडहेसिव, स्पेसर & एपॉक्सी ग्राउट (कच्चा माल)',
      items: [
        {
          id: 'fl_adh_budget',
          name: 'रोफ़ T02 केमिकल एडहेसिव + सफ़ेद ग्राउट (20kg)',
          brand: 'Pidilite Roff',
          qualitySpec: 'खोखलापन व टाइल उखड़ने से 100% सुरक्षा',
          tier: 'budget',
          price: 540,
          unit: 'प्रति 20kg बैग',
          approxQtyMultiplier: 8,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'level laser-aligned clean tile grout joints',
        },
        {
          id: 'fl_adh_std',
          name: 'MYK लाटीक्रीट 325 हाइ-बॉन्ड एडहेसिव + स्टेन-प्रूफ ग्राउट',
          brand: 'MYK Laticrete',
          qualitySpec: '4x2 विट्रीफाइड व बाथरूम फ्लोर के लिए स्टैंडर्ड केमिकल बॉन्ड',
          tier: 'standard',
          price: 680,
          unit: 'प्रति 20kg बैग',
          approxQtyMultiplier: 8,
          supplierName: 'होशंगाबाद रोड टाइल हब',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'precise thin-joint seamless grout lines across vitrified floor',
        },
        {
          id: 'fl_adh_lux',
          name: 'लाटीक्रीट गोल्ड एडहेसिव + ग्लिटर एपॉक्सी ग्राउट',
          brand: 'MYK Laticrete',
          qualitySpec: 'मार्बल व बड़ी टाइल्स हेतु वॉटरप्रूफ बॉन्ड',
          tier: 'luxury',
          price: 890,
          unit: 'प्रति 20kg बैग',
          approxQtyMultiplier: 8,
          supplierName: 'अरेरा मार्बल गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'zero-gap glossy epoxy tile flooring finish',
        },
      ],
    },
  ],

  false_ceiling: [
    {
      groupId: 'board_pvc',
      groupTitle: '1. जिप्सम बोर्ड / POP बोरी / PVC सीलिंग पैनल (कच्चा माल)',
      items: [
        {
          id: 'fc_pop_budget',
          name: 'साकरणी POP बैग (25kg) + मुर्गा जाली रोल',
          brand: 'Sakarni Plaster',
          qualitySpec: 'हाथ से मोल्डिंग व कॉर्नर बॉर्डर फॉल सीलिंग हेतु',
          tier: 'budget',
          price: 340,
          unit: 'प्रति 25kg बोरी',
          approxQtyMultiplier: 12,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean smooth white POP false ceiling border with central warm cove light',
        },
        {
          id: 'fc_gyp_std',
          name: 'सेंट-गोबेन जिप्रोक 12.5mm जिप्सम बोर्ड (6x4)',
          brand: 'Saint-Gobain Gyproc',
          qualitySpec: 'फायर व क्रैक-रेसिस्टेंट प्रीमियम मॉडर्न सीलिंग शीट',
          tier: 'standard',
          price: 540,
          unit: 'प्रति 6x4 शीट',
          approxQtyMultiplier: 10,
          supplierName: 'भोपाल सीलिंग & इंटीरियर स्टोर',
          imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'layered modern recessed gypsum false ceiling with warm yellow perimeter cove LED glow and recessed COB spots',
        },
        {
          id: 'fc_pvc_lux',
          name: 'हेवी वुड-फिनिश PVC पैनल + रैफ़्टर लॉग (10ft)',
          brand: 'EuroPVC Super',
          qualitySpec: '100% वॉटरप्रूफ, बिना पेंट वाला वुड-टेक्सचर पैनल',
          tier: 'luxury',
          price: 320,
          unit: 'प्रति 10ft पैनल',
          approxQtyMultiplier: 20,
          supplierName: 'भोपाल सीलिंग & इंटीरियर स्टोर',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'architectural warm teakwood-grain ceiling slats with black recessed profile lights and cove ambience',
        },
      ],
    },
    {
      groupId: 'frame_lights',
      groupTitle: '2. GI स्टील चैनल फ्रेम + कोव LED लाइट किट (कच्चा माल)',
      items: [
        {
          id: 'fc_frame_std',
          name: '0.55mm GI चैनल फ्रेम + 30m LED प्रोफाइल/COB पैक',
          brand: 'Philips LED + TATA GI',
          qualitySpec: 'जंग-रोधी हैवी स्टील चैनल + वार्म वाइट कोव लाइट्स',
          tier: 'standard',
          price: 4800,
          unit: 'प्रति कमरा फ्रेम+लाइट पैक',
          approxQtyMultiplier: 1,
          supplierName: 'शर्मा इलेक्ट्रिकल्स & सीलिंग, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'soft warm 3000K recessed COB spotlights and seamless ceiling cove illumination',
        },
      ],
    },
  ],

  bathroom: [
    {
      groupId: 'pipes_tiles',
      groupTitle: '1. CPVC पाइप्स & एंटी-स्किड टाइल लॉट (कच्चा माल)',
      items: [
        {
          id: 'bt_pipe_budget',
          name: 'सुप्रीम CPVC SDR-11 पाइप बंडल + फिटिंग्स',
          brand: 'Supreme Pipes',
          qualitySpec: 'गर्म/ठंडे पानी की कंसील्ड पाइपलाइन + सॉल्वेंट',
          tier: 'budget',
          price: 3100,
          unit: 'प्रति बंडल सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'neat tiled Indian bathroom with new chrome wall mixer and clean shower plumbing',
        },
        {
          id: 'bt_tile_std',
          name: 'कजारिया एंटी-स्किड बाथरूम टाइल्स + एस्ट्रल CPVC पैक',
          brand: 'Kajaria & Astral',
          qualitySpec: 'फिसलन-रोधी फ्लोर + मॉइस्चर प्रूफ वॉल टाइल सेट',
          tier: 'standard',
          price: 12500,
          unit: 'सम्पूर्ण टाइल व पाइप लॉट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern clean slate-grey anti-skid tiled bathroom with concealed chrome mixer and rain shower',
        },
      ],
    },
    {
      groupId: 'sanitary',
      groupTitle: '2. डाइवर्टर / शॉवर / कमोड फिटिंग (कच्चा माल)',
      items: [
        {
          id: 'bt_san_budget',
          name: 'पैरीवेयर (Parryware) बेसिक कमोड + क्रोम बिब कॉक सेट',
          brand: 'Parryware',
          qualitySpec: 'किफ़ायती सिरेमिक कमोड व हैवी ब्रास नल सेट',
          tier: 'budget',
          price: 3800,
          unit: 'बेसिक सैनिटरी सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'neat functional Indian bathroom ceramic basin and chrome taps',
        },
        {
          id: 'bt_san_std',
          name: 'सेरा (Cera) वॉल मिक्सर, शॉवर & बेसिन सेट',
          brand: 'Cera Sanitaryware',
          qualitySpec: '10 साल ब्रास बॉडी वारंटी • ISI क्रोम फिनिश',
          tier: 'standard',
          price: 5400,
          unit: 'पूरा ब्रास सेट',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर & सेनेटरी, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'bright clean ceramic washbasin and chrome wall faucet',
        },
        {
          id: 'bt_san_lux',
          name: 'जगुआर कंसील्ड डाइवर्टर + LED मिरर वैनिटी सेट',
          brand: 'Jaquar / Kohler',
          qualitySpec: 'हाई-फ़्लो थर्मोस्टैटिक डाइवर्टर + एंटी-फॉग मिरर',
          tier: 'luxury',
          price: 16500,
          unit: 'लक्ज़री सैनिटरी सेट',
          approxQtyMultiplier: 1,
          supplierName: 'अरेरा बाथ स्टूडियो',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury marble-tiled modern bathroom with backlit oval LED mirror, floating wooden vanity counter and concealed chrome rain shower',
        },
      ],
    },
  ],

  painting: [
    {
      groupId: 'paint',
      groupTitle: '1. वॉल पुट्टी, प्राइमर & पेंट बाल्टी (कच्चा माल)',
      items: [
        {
          id: 'pt_eco',
          name: 'बिरला पुट्टी (2 बैग) + ट्रैक्टर इमल्शन (10L)',
          brand: 'Birla White + Asian Paints',
          qualitySpec: 'कम बजट में साफ स्मूथ मैट पेंट पैक (~400 sq.ft)',
          tier: 'budget',
          price: 3400,
          unit: 'कम्प्लीट मटीरियल किट',
          approxQtyMultiplier: 1,
          supplierName: 'रंग महल पेंट्स, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean freshly painted warm ivory smooth walls',
        },
        {
          id: 'pt_std',
          name: '2-कोट बिरला पुट्टी + रॉयल शाइन पेंट (10L)',
          brand: 'Asian Paints Royale',
          qualitySpec: 'वॉशेबल एंटी-स्टेन सैटिन लक्ज़री फिनिश (~400 sq.ft)',
          tier: 'standard',
          price: 6800,
          unit: 'रॉयल मटीरियल किट',
          approxQtyMultiplier: 1,
          supplierName: 'रंग महल पेंट्स, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'freshly painted luxury satin cream and sage green accent wall interior',
        },
        {
          id: 'pt_lux',
          name: 'रॉयल प्ले टेक्सचर बेस + डैम्पप्रूफ केमिकल कोट',
          brand: 'Asian Paints Apex / Royale Play',
          qualitySpec: 'सीलन-रोधी प्राइमर + डिज़ाइनर टेक्सचर मटीरियल',
          tier: 'luxury',
          price: 9800,
          unit: 'टेक्सचर + वाटरप्रूफ किट',
          approxQtyMultiplier: 1,
          supplierName: 'रंग महल पेंट्स, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'warm designer textured lime-wash accent wall with soft satin sheen',
        },
      ],
    },
  ],

  electrical: [
    {
      groupId: 'lighting',
      groupTitle: '1. FR-LSH कॉपर वायर, स्विचबोर्ड & LED (कच्चा माल)',
      items: [
        {
          id: 'el_budget',
          name: 'एंकर रोमा वायर (2 कॉइल) + मॉड्यूलर प्लेट सेट',
          brand: 'Anchor Panasonic',
          qualitySpec: '1.5mm लाइट + 2.5mm सॉकेट प्योर कॉपर वायर',
          tier: 'budget',
          price: 3800,
          unit: 'प्रति कमरा वायर+स्विच पैक',
          approxQtyMultiplier: 1,
          supplierName: 'शर्मा इलेक्ट्रिकल्स, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'neat modular white switch plates and clean bright LED panel ceiling',
        },
        {
          id: 'el_std',
          name: 'हैवेल्स FR-LSH वायर + लेग्रैंड स्विच + RCCB किट',
          brand: 'Havells & Legrand',
          qualitySpec: 'आग व करंट-शॉक सुरक्षा वाला सम्पूर्ण कमरा पैक',
          tier: 'standard',
          price: 6800,
          unit: 'सेफ्टी वायरिंग पैक',
          approxQtyMultiplier: 1,
          supplierName: 'शर्मा इलेक्ट्रिकल्स, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern bright Indian room with warm COB recessed ceiling spotlights and sleek brushed-grey Legrand switches',
        },
        {
          id: 'el_lux',
          name: 'पॉलीकैब कॉपर + स्मार्ट टच ग्लास स्विच & COB लाइट्स',
          brand: 'Polycab & Schneider',
          qualitySpec: 'ऐप/रिमोट कंट्रोल ग्लास स्विच पैनल + लक्ज़री प्रोफाइल LED',
          tier: 'luxury',
          price: 12200,
          unit: 'स्मार्ट होम पैक',
          approxQtyMultiplier: 1,
          supplierName: 'अरेरा स्मार्ट इलेक्ट्रिकल्स',
          imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury warm architectural COB lighting, concealed cove strips and black crystal glass smart touch switch panels',
        },
      ],
    },
  ],

  iron_gate: [
    {
      groupId: 'metal_pipes',
      groupTitle: '1. MS आयरन / स्टेनलेस स्टील पाइप व शीट (कच्चा माल)',
      items: [
        {
          id: 'ig_ms_budget',
          name: 'टाटा MS स्क्वेयर पाइप & एंगल (16-गेज)',
          brand: 'Tata Structura MS',
          qualitySpec: 'मजबूत घर का गेट / खिड़की ग्रिल / शेड फ्रेम हेतु',
          tier: 'budget',
          price: 74,
          unit: 'प्रति किलोग्राम (Kg)',
          approxQtyMultiplier: 120,
          supplierName: 'गोविंदपुरा आयरन & स्टील डिपो',
          imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'sturdy matte black painted MS wrought-iron gate and safety grille with clean vertical bars',
        },
        {
          id: 'ig_cnc_std',
          name: 'CNC लेजर कट MS शीट + 14-गेज हैवी पाइप',
          brand: 'Jindal MS + CNC Plate',
          qualitySpec: 'मॉडर्न जाली डिज़ाइन लेजर कट गेट प्लेट + वुड स्ट्रिप लुक',
          tier: 'standard',
          price: 105,
          unit: 'प्रति किलोग्राम (Kg)',
          approxQtyMultiplier: 140,
          supplierName: 'गोविंदपुरा आयरन & स्टील डिपो',
          imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern Indian home entrance main gate with geometric CNC laser-cut iron jaali and warm walnut WPC slat inserts',
        },
        {
          id: 'ig_ss_lux',
          name: 'जिंदल 304 ग्रेड स्टेनलेस स्टील (SS) + टफन्ड ग्लास',
          brand: 'Jindal Stainless 304',
          qualitySpec: 'जीवनभर जंग न लगने वाला मिरर-फिनिश बालकनी/सीढ़ी स्टील',
          tier: 'luxury',
          price: 255,
          unit: 'प्रति किलोग्राम (Kg)',
          approxQtyMultiplier: 70,
          supplierName: 'अरेरा स्टील & ग्लास हब',
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'sleek mirror-finish SS-304 stainless steel balcony and staircase railing with clear 12mm toughened glass panels',
        },
      ],
    },
    {
      groupId: 'welding_paint',
      groupTitle: '2. रेड ऑक्साइड प्राइमर, इनेमल पेंट, लॉक & कब्जे (कच्चा माल)',
      items: [
        {
          id: 'ig_paint_std',
          name: 'एशियन रेड-ऑक्साइड प्राइमर + ग्लॉस पेंट + हैवी बेयरिंग कब्जे',
          brand: 'Asian Paints Apcolite',
          qualitySpec: 'जंग से बचाव व स्मूथ गेट मूवमेंट हेतु जरूरी मटीरियल',
          tier: 'standard',
          price: 2400,
          unit: 'पेंट + हार्डवेयर पैक',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'weatherproof charcoal grey matte enamel painted steel structure',
        },
      ],
    },
  ],

  custom: [
    {
      groupId: 'custom_structure',
      groupTitle: '1. मुख्य ढांचा कच्चा माल (प्लाई / लकड़ी / लोहा)',
      items: [
        {
          id: 'cust_budget',
          name: 'कॉमर्शियल प्लाई / MS पाइप (किफ़ायती रेंज)',
          brand: 'Standard ISI Grade',
          qualitySpec: 'बजट के अनुसार टिकाऊ निर्माण सामग्री',
          tier: 'budget',
          price: 1450,
          unit: 'प्रति यूनिट शीट',
          approxQtyMultiplier: 3,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean custom handcrafted wooden and steel functional installation',
        },
        {
          id: 'cust_std',
          name: 'सेंचुरी BWP 710 मरीन प्लाई / सागवान (पॉपुलर)',
          brand: 'CenturyPly / MP Teak',
          qualitySpec: 'दीमक व नमी-रोधी लॉन्ग-लाइफ क्वालिटी',
          tier: 'standard',
          price: 2450,
          unit: 'प्रति यूनिट शीट',
          approxQtyMultiplier: 3,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'rich teakwood & waterproof marine ply custom handcrafted interior work with natural polish',
        },
      ],
    },
    {
      groupId: 'custom_finish',
      groupTitle: '2. फिनिश व हार्डवेयर (माइका / ग्लास / LED / गोंद)',
      items: [
        {
          id: 'cust_fin_std',
          name: '1mm टेक्सचर माइका + सॉफ्ट-क्लोज़ हार्डवेयर + LED किट',
          brand: 'Greenlam & Ebco',
          qualitySpec: 'संपूर्ण फिनिशिंग कच्चा माल',
          tier: 'standard',
          price: 2800,
          unit: 'फिनिश पैक',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean designer laminate, subtle brass trim and warm recessed LED lighting',
        },
      ],
    },
  ],
};

/**
 * Location-aware wage & supplier availability adjustment across India.
 */
export interface RegionalRateProfile {
  regionLabel: string;
  laborMultiplier: number;
  dailyMasterRate: number;
  dailyHelperRate: number;
  deliveryNote: string;
  localHubs: string[];
}

export function getRegionalRateProfile(locality = 'भोपाल'): RegionalRateProfile {
  const loc = (locality || 'भोपाल').toLowerCase();
  const cleanArea = (locality || 'एमपी नगर, भोपाल').split('•')[0].trim();

  if (/delhi|नoida|नोएडा|noida|gurgaon|gurugram|गुड़गांव|गुरुग्राम|faridabad|ghaziabad|ncr|दिल्ली/.test(loc)) {
    return {
      regionLabel: locality,
      laborMultiplier: 1.25,
      dailyMasterRate: 1100,
      dailyHelperRate: 650,
      deliveryNote: 'दिल्ली NCR थोक मंडी मानक से 3-4 घंटे में साइट डिलीवरी',
      localHubs: ['कीर्ति नगर टिंबर मार्केट मानक', 'चावड़ी बाजार हार्डवेयर हब मानक', 'नोएडा सेक्टर-9 डिपो'],
    };
  }
  if (/mumbai|मुंबई|navi mumbai|thane|pune|पुणे|bangalore|bengaluru|बेंगलुरु|hyderabad|हैदराबाद/.test(loc)) {
    return {
      regionLabel: locality,
      laborMultiplier: 1.3,
      dailyMasterRate: 1150,
      dailyHelperRate: 700,
      deliveryNote: `${cleanArea} लोकल सप्लायर हब से उसी दिन साइट डिलीवरी`,
      localHubs: [`${cleanArea} बिल्डिंग मटेरियल हब`, 'शहर थोक टिंबर & टाइल मार्केट मानक'],
    };
  }
  if (/kolkata|कोलकाता|chennai|चेन्नई|ahmedabad|अहमदाबाद|surat|सूरत|kochi|कोच्चि|chandigarh|चंडीगढ़/.test(loc)) {
    return {
      regionLabel: locality,
      laborMultiplier: 1.15,
      dailyMasterRate: 1020,
      dailyHelperRate: 600,
      deliveryNote: `${cleanArea} शहर मंडी से 2-4 घंटे में साइट डिलीवरी`,
      localHubs: [`${cleanArea} टिंबर & हार्डवेयर मंडी मानक`, 'शहर थोक सैनिटरी & टाइल मार्केट'],
    };
  }
  if (/indore|इंदौर|jaipur|जयपुर|lucknow|लखनऊ|kanpur|कानपुर|nagpur|नागपुर|patna|पटना|raipur|रायपुर|varanasi|वाराणसी|ranchi|रांची|jabalpur|जबलपुर|gwalior|ग्वालियर|ujjain|उज्जैन/.test(loc)) {
    return {
      regionLabel: locality,
      laborMultiplier: 1.05,
      dailyMasterRate: 950,
      dailyHelperRate: 550,
      deliveryNote: `${cleanArea} थोक मंडी से 2-4 घंटे में डिलीवरी`,
      localHubs: [`${cleanArea} लोहा / टिंबर मंडी मानक`, `${cleanArea} मेन हार्डवेयर बाजार`],
    };
  }

  // Default Bhopal / regional market hub benchmarks
  const hubs = [`${cleanArea} स्थानीय टिंबर & हार्डवेयर मानक`, 'हमीदिया रोड / गोविंदपुरा थोक मंडी', 'अरेरा & होशंगाबाद रोड सप्लायर हब'];
  if (/कोलार|kolar/.test(loc)) hubs[0] = 'कोलार रोड टिंबर & टाइल मंडी मानक';
  else if (/अरेरा|arera|शाहपुरा|shahpura|चूना/.test(loc)) hubs[0] = 'अरेरा / 10 नंबर मार्केट हार्डवेयर हब';
  else if (/करोंद|karond|बैरागढ़|bairagarh/.test(loc)) hubs[0] = 'करोंद / बैरागढ़ बिल्डिंग मटेरियल मंडी';

  return {
    regionLabel: locality,
    laborMultiplier: 1.0,
    dailyMasterRate: 900,
    dailyHelperRate: 520,
    deliveryNote: `${cleanArea} में नजदीकी सप्लायर से 2-3 घंटे में डिलीवरी`,
    localHubs: hubs,
  };
}

/**
 * Parses explicit monetary budgets from text cleanly without falsely matching PIN codes or phone numbers.
 * Prioritizes current message budget (including Hindi words/fractions) over stale drawer preset.
 */
function parseSingleBudgetStringClient(rawText = ''): number | null {
  const clean = (rawText || '').replace(/,/g, '').trim();
  if (!clean) return null;
  if (/(?:बजट|budget|rs|₹)\s*[:=]?\s*-\d+/i.test(clean)) return null;

  if (/डेढ़\s*(?:लाख|lakh|lac)/i.test(clean)) return 150000;
  if (/सवा\s*(?:लाख|lakh|lac)/i.test(clean)) return 125000;
  if (/ढाई\s*(?:लाख|lakh|lac)/i.test(clean)) return 250000;
  if (/पौने\s*दो\s*(?:लाख|lakh|lac)/i.test(clean)) return 175000;
  if (/पचास\s*(?:हजार|hajar)/i.test(clean)) return 50000;
  if (/बीस\s*(?:हजार|hajar)/i.test(clean)) return 20000;
  if (/तीस\s*(?:हजार|hajar)/i.test(clean)) return 30000;
  if (/चालीस\s*(?:हजार|hajar)/i.test(clean)) return 40000;
  if (/साठ\s*(?:हजार|hajar)/i.test(clean)) return 60000;
  if (/अस्सी\s*(?:हजार|hajar)/i.test(clean)) return 80000;

  const croreMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:करोड़|करोड|crore|cr\b)/i);
  if (croreMatch) {
    const val = Math.round(parseFloat(croreMatch[1]) * 10000000);
    if (val >= 1000000 && val <= 100000000) return val;
  }

  const sadheLakhMatch = clean.match(/साढ़े\s*(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac)/i);
  if (sadheLakhMatch) {
    const val = Math.round((parseFloat(sadheLakhMatch[1]) + 0.5) * 100000);
    if (val >= 50000 && val <= 50000000) return val;
  }

  const lakhMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac)/i);
  if (lakhMatch) {
    const val = Math.round(parseFloat(lakhMatch[1]) * 100000);
    if (val >= 1000 && val <= 50000000) return val;
  }
  const kMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:हजार|hajar|k\b)/i);
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
}

export function parseBudgetFromClientText(
  text = '',
  explicitBudget?: number | null,
  fallbackHistoryTexts: string[] = []
): number | null {
  const fromCurrentText = parseSingleBudgetStringClient(text);
  if (fromCurrentText !== null) return fromCurrentText;

  if (explicitBudget && Number(explicitBudget) >= 500 && Number(explicitBudget) <= 100000000) {
    return Math.round(Number(explicitBudget));
  }

  for (let i = fallbackHistoryTexts.length - 1; i >= 0; i -= 1) {
    const histVal = parseSingleBudgetStringClient(fallbackHistoryTexts[i]);
    if (histVal !== null) return histVal;
  }
  return null;
}

/**
 * Client-side bespoke raw material generator for offline fallback parity with backend.
 */
export function buildCustomMaterialGroupsClient(userText = '', locality = 'भोपाल'): ShowroomGroup[] {
  const region = getRegionalRateProfile(locality);
  const store = region.localHubs[0] || `${locality} सप्लायर मानक`;
  const q = (userText || '').toLowerCase();

  if (/मंदिर|mandir|temple|पूजा/.test(q)) {
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
          { id: 'cm_f1', name: 'वार्म कोव LED प्रोफाइल + ब्रास घंटी हैंगिंग सेट', brand: 'Philips LED + Brass', qualitySpec: 'संपूर्ण पूजा सामग्री ड्रॉअर व लाइट किट', tier: 'standard', price: 2200, unit: 'फिनिश सेट', approxQtyMultiplier: 1, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'warm spiritual backlighting and neat brass handle drawers' },
        ],
      },
    ];
  }

  if (/काउंटर|counter|दुकान|shop|showroom|कैफे|cafe/.test(q)) {
    return [
      {
        groupId: 'counter_body',
        groupTitle: '1. काउंटर बॉडी — HDHMR बोर्ड / प्लाईवुड + फ्लूटेड पैनल (कच्चा माल)',
        items: [
          { id: 'cnt_b1', name: '18mm BWR प्लाई + सादा माइका शीट', brand: 'Greenply + Merino', qualitySpec: 'किफ़ायती मजबूत दुकान काउंटर ढांचा', tier: 'budget', price: 1550, unit: 'प्रति शीट', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'clean commercial laminated retail counter desk' },
          { id: 'cnt_b2', name: 'एक्शन टेसा HDHMR 18mm + WPC फ्लूटेड लूवर्स', brand: 'Action Tesa + E3 WPC', qualitySpec: 'मॉडर्न रिब्ड फ्रंट और स्क्रैच-प्रूफ बॉडी', tier: 'standard', price: 2850, unit: 'प्रति शीट/सेट', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'modern fluted dark walnut wood reception counter with warm LED strip base' },
          { id: 'cnt_b3', name: 'सतवारियो मार्बल / क्वार्ट्ज़ टॉप + गोल्ड स्टेनलेस स्ट्रिप', brand: 'Kalinga Stone + SS-304', qualitySpec: 'शोरूम लक्ज़री रिसेप्शन टॉप', tier: 'luxury', price: 360, unit: 'प्रति sq.ft', approxQtyMultiplier: 22, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'luxury white Satvario marble countertop shop desk with brushed gold inlay trim' },
        ],
      },
    ];
  }

  if (/ड्रेसिंग|dressing|vanity|आईना|mirror/.test(q)) {
    return [
      {
        groupId: 'dressing_body',
        groupTitle: '1. ड्रेसिंग टेबल बॉडी & सेंट-गोबेन मिरर (कच्चा माल)',
        items: [
          { id: 'dr_1', name: '19mm BWR प्लाई + मिरर + कॉस्मेटिक ड्रॉअर', brand: 'Greenply + Saint-Gobain', qualitySpec: 'किफ़ायती फुल-लेंथ ड्रेसिंग टेबल', tier: 'budget', price: 1850, unit: 'प्रति शीट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'wooden dressing vanity table with tall full-length mirror and storage drawers' },
          { id: 'dr_2', name: 'HDHMR फ्लूटेड वैनिटी + टच LED हॉलीवुड मिरर', brand: 'Action Tesa + Saint-Gobain', qualitySpec: 'स्टैंडर्ड वार्म बैक-लिट वैनिटी मिरर', tier: 'standard', price: 2950, unit: 'प्रति शीट/सेट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'modern backlit oval LED vanity mirror with fluted drawer dresser' },
          { id: 'dr_3', name: 'PVD गोल्ड फ्रेम मिरर + PU ग्लॉस मार्बल टॉप वैनिटी', brand: 'Kohler / Marino PU', qualitySpec: 'लक्ज़री बुटीक ड्रेसिंग कॉर्नर', tier: 'luxury', price: 5400, unit: 'प्रीमियम सेट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'luxury brushed brass framed backlit dressing mirror with marble vanity top' },
        ],
      },
    ];
  }

  if (/झूला|jhula|swing/.test(q)) {
    return [
      {
        groupId: 'jhula_frame',
        groupTitle: '1. सागवान झूला पाटा & हैवी ब्रास/SS चैन (कच्चा माल)',
        items: [
          { id: 'jh_1', name: 'शीशम/पॉपलर स्विंग सीट + 8mm MS चैन सेट', brand: 'Local Hardwood + Jindal', qualitySpec: 'किफ़ायती बालकनी झूला फ्रेम', tier: 'budget', price: 1450, unit: 'प्रति सेट/Cft', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'warm balcony wooden swing seat suspended with sturdy chains' },
          { id: 'jh_2', name: 'MP सागवान नक्काशी पाटा + असली पीतल चैन (350kg)', brand: 'MP Sagwan + Brass Hub', qualitySpec: 'प्रीमियम पारंपरिक मजबूत झूला', tier: 'luxury', price: 2650, unit: 'प्रति Cft/सेट', approxQtyMultiplier: 5, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'royal carved teakwood indoor jhula swing with heavy brass chains and bolsters' },
        ],
      },
    ];
  }

  if (/ऑफिस|office|study|डेस्क|desk|केबिन|cabin|टेबल|table/.test(q)) {
    return [
      {
        groupId: 'office_desk',
        groupTitle: '1. स्टडी/ऑफिस डेस्क — प्लाईवुड/HDHMR & स्टील लेग (कच्चा माल)',
        items: [
          { id: 'of_1', name: '19mm कमर्शियल प्लाई + मैट लैमिनेट + कीबोर्ड ट्रे', brand: 'Century + Merino', qualitySpec: 'साफ-सुथरा वर्क फ्रॉम होम / स्टडी डेस्क', tier: 'budget', price: 1650, unit: 'प्रति शीट', approxQtyMultiplier: 3, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'clean wooden study desk with overhead book shelves' },
          { id: 'of_2', name: 'एक्शन टेसा HDHMR + 12mm टफन्ड ग्लास पार्टीशन', brand: 'Action Tesa + Modiguard', qualitySpec: 'ऑफिस केबिन व बॉस टेबल सेटअप', tier: 'standard', price: 2900, unit: 'प्रति शीट/पैनल', approxQtyMultiplier: 4, supplierName: store, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80', visualDescriptor: 'modern executive wood and black metal cabin desk with frosted glass partition' },
        ],
      },
    ];
  }

  return SUPPLIER_SHOWROOM.custom;
}

export interface ThreeWayQuoteItem {
  name: string;
  gradeOrBrand?: string;
  qtyRate: string;
  supplierStore?: string;
  amount: number;
}

export interface ThreeWayQuotationData {
  includeQuotation: boolean;
  projectTitle: string;
  projectType: ShowroomProjectType;
  locality: string;
  dimensionsSummary: string;
  estimatedDuration: string;
  customerBudget?: number | null;
  onlyKarigar: {
    title: string;
    subtitle: string;
    laborTotal: number;
    estimatedDays: string;
    breakdown: string[];
    rateNote: string;
  };
  materialAndKarigar: {
    title: string;
    subtitle: string;
    items: ThreeWayQuoteItem[];
    materialTotal: number;
    laborTotal: number;
    grandTotal: number;
    warrantyNote: string;
  };
  onlyMaterial: {
    title: string;
    subtitle: string;
    items: ThreeWayQuoteItem[];
    materialTotal: number;
    deliveryNote: string;
  };
  budgetFitNote: string;
  isWithinBudget: boolean | null;
  suggestedTierUpgradeOrSave?: string;
}

/**
 * Computes transparent 3-way Indian quotations:
 * 1) Without Maal / Only Karigar
 * 2) Maal + Karigar Combo
 * 3) Only Kaccha Maal (Supplier Wholesale BOM)
 */
export function buildThreeWayQuotation(params: {
  projectType: ShowroomProjectType;
  projectTitle: string;
  dimensionsSummary?: string;
  estimatedDuration?: string;
  locality?: string;
  customerBudget?: number | null;
  selectedProducts?: ShowroomProduct[];
  aiItems?: ThreeWayQuoteItem[];
  aiLaborTotal?: number;
}): ThreeWayQuotationData {
  const {
    projectType,
    projectTitle,
    dimensionsSummary = 'मानक साइट नाप',
    estimatedDuration,
    locality = 'भोपाल',
    customerBudget = null,
    selectedProducts = [],
    aiItems = [],
    aiLaborTotal,
  } = params;

  const region = getRegionalRateProfile(locality);
  const cleanArea = (locality || 'भोपाल').split('•')[0].trim();

  // Build Raw Material BOM Items (Priority: Customer Picked Items -> AI Items -> Showroom Budget-Matched Tier)
  let rawItems: ThreeWayQuoteItem[] = [];

  if (selectedProducts && selectedProducts.length > 0) {
    rawItems = selectedProducts.map((p) => {
      const qty = Math.max(1, Number(p.approxQtyMultiplier) || 1);
      return {
        name: p.name,
        gradeOrBrand: p.qualitySpec || p.brand,
        qtyRate: `${qty} × ${p.unit} @ ₹${Number(p.price).toLocaleString('en-IN')}`,
        supplierStore: p.supplierName || region.localHubs[0],
        amount: Math.round(Number(p.price) * qty),
      };
    });
  } else if (aiItems && aiItems.length > 0) {
    rawItems = aiItems.map((it) => ({
      name: it.name,
      gradeOrBrand: it.gradeOrBrand || 'सत्यापित मानक ग्रेड',
      qtyRate: it.qtyRate || 'अनुमानित मात्रा',
      supplierStore: it.supplierStore || region.localHubs[0],
      amount: Math.max(0, Math.round(Number(it.amount) || 0)),
    }));
  } else {
    const groups = SUPPLIER_SHOWROOM[projectType] || SUPPLIER_SHOWROOM.custom;
    // Pick budget-appropriate tier automatically
    let desiredTier: PriceTier = 'standard';
    if (customerBudget && customerBudget > 0) {
      const stdCost = groups.reduce((s, g) => {
        const it = g.items.find((x) => x.tier === 'standard') || g.items[0];
        return s + (it ? it.price * (it.approxQtyMultiplier || 1) : 0);
      }, 0);
      if (customerBudget < stdCost * 1.15) desiredTier = 'budget';
      else if (customerBudget > stdCost * 2.1) desiredTier = 'luxury';
    }
    rawItems = groups.map((g) => {
      const picked = g.items.find((x) => x.tier === desiredTier) || g.items[0];
      const qty = Math.max(1, Number(picked.approxQtyMultiplier) || 1);
      return {
        name: picked.name,
        gradeOrBrand: picked.qualitySpec || picked.brand,
        qtyRate: `${qty} × ${picked.unit} @ ₹${picked.price.toLocaleString('en-IN')}`,
        supplierStore: picked.supplierName,
        amount: Math.round(picked.price * qty),
      };
    });
  }

  const materialTotal = rawItems.reduce((s, i) => s + i.amount, 0);

  // Realistic Karigar Labor Math adjusted by Regional Multiplier
  const defaultLaborByType: Record<ShowroomProjectType, { days: number; ratio: number; min: number; durationLabel: string }> = {
    bed: { days: 4, ratio: 0.32, min: 4200, durationLabel: '4 से 5 दिन' },
    kitchen: { days: 6, ratio: 0.28, min: 7500, durationLabel: '5 से 7 दिन' },
    wardrobe: { days: 5, ratio: 0.30, min: 6000, durationLabel: '4 से 6 दिन' },
    tv_unit_living: { days: 3, ratio: 0.30, min: 3500, durationLabel: '3 से 4 दिन' },
    door_window: { days: 2, ratio: 0.28, min: 1800, durationLabel: '1 से 2 दिन' },
    house: { days: 90, ratio: 0.35, min: 120000, durationLabel: '3 से 5 माह' },
    tiles_flooring: { days: 4, ratio: 0.35, min: 4500, durationLabel: '3 से 5 दिन' },
    false_ceiling: { days: 4, ratio: 0.35, min: 4000, durationLabel: '3 से 4 दिन' },
    bathroom: { days: 4, ratio: 0.30, min: 4500, durationLabel: '3 से 5 दिन' },
    painting: { days: 4, ratio: 0.45, min: 3600, durationLabel: '3 से 4 दिन' },
    electrical: { days: 3, ratio: 0.30, min: 2800, durationLabel: '2 से 3 दिन' },
    iron_gate: { days: 3, ratio: 0.28, min: 3200, durationLabel: '3 से 4 दिन' },
    custom: { days: 3, ratio: 0.32, min: 3200, durationLabel: '3 से 5 दिन' },
  };

  const cfg = defaultLaborByType[projectType] || defaultLaborByType.custom;
  const computedLabor = aiLaborTotal && aiLaborTotal > 0
    ? Math.round(aiLaborTotal * region.laborMultiplier)
    : Math.max(Math.round(cfg.min * region.laborMultiplier), Math.round(materialTotal * cfg.ratio));

  const grandTotal = materialTotal + computedLabor;
  const estDays = estimatedDuration || cfg.durationLabel;
  const helperNote = cfg.days >= 4
    ? `मुख्य कारीगर (₹${region.dailyMasterRate}/दिन) + हेल्पर सहायता शामिल`
    : `मुख्य कारीगर मेकिंग व फिनिशिंग चार्ज (${cleanArea} मानक)`;

  let budgetFitNote = `📍 ${cleanArea} क्षेत्र के ताजा होलसेल व कारीगर मानकों पर आधारित पारदर्शी कोटेशन।`;
  let isWithinBudget: boolean | null = null;
  let suggestedTierUpgradeOrSave: string | undefined;

  if (customerBudget && customerBudget > 0) {
    if (projectType === 'house' && customerBudget < 250000) {
      isWithinBudget = false;
      budgetFitNote = `⚠️ आपका ₹${customerBudget.toLocaleString('en-IN')} बजट पूरे पक्के मकान निर्माण (सामान्यतः ₹1,650+/sq.ft) के लिए काफी कम है — इसमें केवल 1 कमरे की मरम्मत, बाउंड्री वॉल या आंशिक चिनाई-प्लास्टर ही संभव है।`;
      suggestedTierUpgradeOrSave = '💡 टिप: कम से कम ₹5–8 लाख से चरणबद्ध निर्माण शुरू करें या पहले सिंगल कमरा/बाउंड्री का काम कराएं।';
    } else if (grandTotal <= customerBudget) {
      isWithinBudget = true;
      const saved = customerBudget - grandTotal;
      budgetFitNote = `✅ शानदार! आपका ₹${customerBudget.toLocaleString('en-IN')} बजट आराम से फिट है (पैकेज में ~₹${saved.toLocaleString('en-IN')} की बचत भी होगी)।`;
    } else if (computedLabor <= customerBudget) {
      isWithinBudget = false;
      const diff = grandTotal - customerBudget;
      budgetFitNote = `⚠️ फुल पैकेज ₹${customerBudget.toLocaleString('en-IN')} बजट से ₹${diff.toLocaleString('en-IN')} ऊपर है — आप ऊपर "किफ़ायती कच्चा माल" चुनकर या केवल कारीगर/कच्चा माल अलग से चुनकर बजट कंट्रोल कर सकते हैं!`;
      suggestedTierUpgradeOrSave = '💡 टिप: "किफ़ायती रेंज" का कच्चा माल चुनने पर यह काम आपके बजट के अंदर आ जाएगा।';
    } else {
      isWithinBudget = false;
      budgetFitNote = `💡 आपका बजट ₹${customerBudget.toLocaleString('en-IN')} थोड़ा कम है — हमने कम लागत वाला विकल्प व सिर्फ कारीगर विकल्प साथ में दिया है।`;
      suggestedTierUpgradeOrSave = 'आप "बजट में एडजस्ट करें" दबाकर सस्ता कच्चा माल पैक देख सकते हैं।';
    }
  }

  return {
    includeQuotation: true,
    projectTitle,
    projectType,
    locality,
    dimensionsSummary,
    estimatedDuration: estDays,
    customerBudget,
    onlyKarigar: {
      title: '1. बिना माल — केवल कारीगर',
      subtitle: 'कच्चा माल आप खुद देंगे • SETU से सिर्फ अनुभवी कारीगर आएगा',
      laborTotal: computedLabor,
      estimatedDays: estDays,
      breakdown: [
        helperNote,
        `अनुमानित समय: ${estDays} • टूल्स व मशीन कारीगर खुद लाएगा`,
        '0% मिडिलमैन कमीशन • काम के बाद OTP वेरिफाइड भुगतान',
      ],
      rateNote: `${cleanArea} क्षेत्रीय औसत दर: ₹${region.dailyMasterRate}/दिन (या पक्का ठेका)`,
    },
    materialAndKarigar: {
      title: '2. कच्चा माल + कारीगर (सम्पूर्ण पैकेज)',
      subtitle: 'सत्यापित सप्लायर से असली कच्चा माल + SETU कारीगर द्वारा निर्माण',
      items: rawItems,
      materialTotal,
      laborTotal: computedLabor,
      grandTotal,
      warrantyNote: '🛡️ शुद्ध कच्चा माल बिल + 1 साल फिटिंग वारंटी शामिल (नोट: GST बिल व अनलोडिंग दरें चालान अनुसार लागू)',
    },
    onlyMaterial: {
      title: '3. केवल कच्चा माल (थोक सप्लायर ऑर्डर)',
      subtitle: 'अगर आपका खुद का मिस्त्री है — सिर्फ शुद्ध कच्चा माल मंगाएं',
      items: rawItems,
      materialTotal,
      deliveryNote: `🚚 ${region.deliveryNote} (नोट: थोक माल पर GST व भाड़ा/अनलोडिंग अलग से पारदर्शी बिल पर होगा)`,
    },
    budgetFitNote,
    isWithinBudget,
    suggestedTierUpgradeOrSave,
  };
}

/**
 * Converts newly added VendorDashboard materials matching a project into an interactive
 * AI Showroom Group so customer AI designs & 3-way quotations automatically use real live shop stock first.
 */
export function buildLiveSupplierShowroomGroup(params: {
  materials: MaterialItem[];
  tradeCategory?: string;
  projectType?: ShowroomProjectType;
  locality?: string;
}): ShowroomGroup | null {
  const ranked = rankSupplierMaterialsForProject(params);
  if (!ranked || ranked.length === 0) return null;

  return {
    groupId: 'live_supplier_stock',
    groupTitle: '🏪 लाइव सप्लायर स्टॉक (आपके शहर की दुकानों से सीधे जुड़े रेट)',
    items: ranked.map((m, idx) => {
      const price = Number(m.sellingPrice) || Number(m.mrp) || 500;
      const tier: PriceTier = price >= 2800 ? 'luxury' : price <= 1300 ? 'budget' : 'standard';
      return {
        id: m.id || `live_mat_${idx}`,
        name: m.name,
        brand: m.brand || m.storeName || 'वेरिफाइड सप्लायर',
        qualitySpec: `${m.brand ? `${m.brand} • ` : ''}${m.bulkOffer || (m.inStock !== false ? 'तुरंत स्टॉक उपलब्ध' : 'ऑर्डर पर उपलब्ध')}`,
        tier,
        price,
        unit: m.unit || 'प्रति नग',
        approxQtyMultiplier: 2,
        supplierName: m.storeName || 'लोकल SETU सप्लायर',
        imageUrl: m.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80',
        visualDescriptor: `${m.brand || ''} ${m.name} (${m.category}) authentic Indian construction raw material`.trim(),
      };
    }),
  };
}

/**
 * Filters & ranks platform contractors strictly matching requested trade, availability, customer locality & budget.
 * Automatically boosts newly registered verified/live contractors to the top as profiles join.
 */
export function rankContractorsForProject(params: {
  contractors: Contractor[];
  tradeCategory?: string;
  projectType?: ShowroomProjectType;
  locality?: string;
  estimatedLaborBudget?: number | null;
}): Contractor[] {
  const {
    contractors = [],
    tradeCategory,
    projectType,
    locality = '',
    estimatedLaborBudget = null,
  } = params;

  const fallbackTrade = projectType && PROJECT_TYPE_LABELS[projectType]
    ? PROJECT_TYPE_LABELS[projectType].trade
    : 'carpenter';
  const targetTrade = (tradeCategory && tradeCategory !== 'all' ? tradeCategory : fallbackTrade).toLowerCase();

  // Map tiling/welder/ac_repair onto exact or closest categories
  const acceptableCategories = new Set([targetTrade]);
  if (targetTrade === 'tiling') acceptableCategories.add('mason');
  if (targetTrade === 'welder') {
    acceptableCategories.add('mason');
    acceptableCategories.add('carpenter');
  }
  if (targetTrade === 'ac_repair') acceptableCategories.add('electrician');

  const availablePool = contractors.filter(
    (c) => acceptableCategories.has((c.category || '').toLowerCase()) && c.available !== false
  );
  let matched = availablePool.length > 0
    ? availablePool
    : contractors.filter((c) => acceptableCategories.has((c.category || '').toLowerCase()));

  if (matched.length === 0) {
    matched = contractors.filter(
      (c) => ['carpenter', 'mason', 'plumber', 'electrician', 'painter'].includes(c.category) && c.available !== false
    );
  }
  if (matched.length === 0) {
    matched = contractors.slice(0, 6);
  }

  const areaWords = locality
    .toLowerCase()
    .split(/[,•\s()]+/)
    .filter((w) => w.length >= 3);

  const scoreContractor = (c: Contractor, idx: number) => {
    const profileText = `${c.bio || ''} ${c.distance || ''} ${(c as any).city || ''} ${(c as any).locality || ''} ${c.name || ''} ${c.specialtyHindi || ''} ${(c.skills || []).join(' ')}`.toLowerCase();
    const isExactCategory = (c.category || '').toLowerCase() === targetTrade;
    const isFreshRegistered = !String(c.id || '').startsWith('c_seed_');
    const createdTs = (c as any).createdAt ? new Date((c as any).createdAt).getTime() : 0;
    const recencyScore = Number.isFinite(createdTs) && createdTs > 0
      ? Math.max(0, 12 - Math.floor((Date.now() - createdTs) / (1000 * 60 * 60 * 24 * 3)))
      : Math.max(0, 8 - idx);

    const skillBonus =
      (targetTrade === 'ac_repair' && /(ac|कूलिंग|एसी|split|compressor)/i.test(profileText) ? 25 : 0) +
      (targetTrade === 'welder' && /(weld|वेल्ड|लोहा|iron|gate|grill)/i.test(profileText) ? 25 : 0) +
      (targetTrade === 'tiling' && /(टाइल|tile|marble|granite|फ्लोर)/i.test(profileText) ? 25 : 0);
    const fitsContract =
      estimatedLaborBudget && estimatedLaborBudget > 0 && c.contractUnitRate && c.contractUnitRate <= estimatedLaborBudget
        ? 14
        : 0;
    const fitsDaily =
      estimatedLaborBudget && estimatedLaborBudget > 0 && c.dailyWageRate && c.dailyWageRate * 4 <= estimatedLaborBudget
        ? 12
        : 0;

    return (
      (isExactCategory ? 35 : 10) +
      (isFreshRegistered ? 20 : 0) +
      recencyScore +
      (c.available !== false ? 30 : -40) +
      (c.verified ? 30 : 0) +
      (c.rating || 0) * 8 +
      skillBonus +
      (areaWords.some((w) => profileText.includes(w)) ? 22 : 0) +
      (fitsContract || fitsDaily) +
      (c.etaMinutes ? Math.max(0, 15 - Math.floor(c.etaMinutes / 4)) : 0)
    );
  };

  return [...matched]
    .map((c, idx) => ({ c, s: scoreContractor(c, idx) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c)
    .slice(0, 5);
}

/**
 * Filters platform vendor materials strictly matching trade/project + customer budget & locality.
 * Automatically boosts newly added live supplier inventory to surface real merchant rates first.
 */
export function rankSupplierMaterialsForProject(params: {
  materials: MaterialItem[];
  tradeCategory?: string;
  projectType?: ShowroomProjectType;
  customerBudget?: number | null;
  locality?: string;
}): MaterialItem[] {
  const { materials = [], tradeCategory, projectType, customerBudget, locality = '' } = params;
  const fallbackTrade = projectType && PROJECT_TYPE_LABELS[projectType]
    ? PROJECT_TYPE_LABELS[projectType].trade
    : 'carpenter';
  const target = (tradeCategory && tradeCategory !== 'all' ? tradeCategory : fallbackTrade).toLowerCase();

  const matchingTrades = new Set([target]);
  if (target === 'tiling') matchingTrades.add('mason');
  if (target === 'welder') {
    matchingTrades.add('carpenter');
    matchingTrades.add('mason');
  }
  if (target === 'ac_repair') matchingTrades.add('electrician');
  matchingTrades.add('general');

  // Exclude unrelated wedding/catering vendors strictly
  let filtered = materials.filter(
    (m) => matchingTrades.has((m.category || '').toLowerCase()) &&
      !['wedding_makeup', 'wedding_catering', 'caterer', 'wedding_tent', 'wedding_photo', 'event_dj'].includes((m.category || '').toLowerCase())
  );

  if (filtered.length === 0) {
    filtered = materials.filter(
      (m) => !['wedding_makeup', 'wedding_catering', 'caterer', 'wedding_tent', 'wedding_photo', 'event_dj'].includes((m.category || '').toLowerCase())
    );
  }

  const areaWords = (locality || '')
    .toLowerCase()
    .split(/[,•\s()]+/)
    .filter((w) => w.length >= 3);

  filtered.sort((a, b) => {
    const aExact = (a.category || '').toLowerCase() === target ? 4 : 0;
    const bExact = (b.category || '').toLowerCase() === target ? 4 : 0;
    const aStock = a.inStock !== false ? 5 : -10;
    const bStock = b.inStock !== false ? 5 : -10;
    const aArea = areaWords.some((w) => `${a.storeName || ''} ${a.name || ''}`.toLowerCase().includes(w)) ? 3 : 0;
    const bArea = areaWords.some((w) => `${b.storeName || ''} ${b.name || ''}`.toLowerCase().includes(w)) ? 3 : 0;
    const aFits = customerBudget && customerBudget > 0 && a.sellingPrice <= customerBudget ? 2 : 0;
    const bFits = customerBudget && customerBudget > 0 && b.sellingPrice <= customerBudget ? 2 : 0;
    const scoreA = aExact + aStock + aArea + aFits;
    const scoreB = bExact + bStock + bArea + bFits;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.sellingPrice - b.sellingPrice;
  });

  return filtered.slice(0, 6);
}
