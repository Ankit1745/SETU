export type PriceTier = 'budget' | 'standard' | 'luxury';

export interface ShowroomProduct {
  id: string;
  name: string;
  brand: string;
  tier: PriceTier;
  price: number;
  unit: string;
  approxQtyMultiplier?: number; // e.g. 6 sheets, 1 set, 25 sq.ft for auto-estimating impact
  supplierName: string;
  imageUrl: string;
  visualDescriptor: string; // Sent directly to AI image generator so chosen mica/wood/stone renders realistically
}

export interface ShowroomGroup {
  groupId: string;
  groupTitle: string;
  items: ShowroomProduct[];
}

export type ShowroomProjectType =
  | 'kitchen'
  | 'wardrobe'
  | 'bedroom'
  | 'house'
  | 'bathroom'
  | 'electrical'
  | 'painting';

export const SUPPLIER_SHOWROOM: Record<ShowroomProjectType, ShowroomGroup[]> = {
  kitchen: [
    {
      groupId: 'mica',
      groupTitle: '1. माइका / सनमाइका फिनिश चुनें',
      items: [
        {
          id: 'k_mica_budget',
          name: 'इकोनॉमी मैट माइका (0.8mm)',
          brand: 'Merino Lite',
          tier: 'budget',
          price: 850,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean matte warm beige 0.8mm laminate cabinet shutters',
        },
        {
          id: 'k_mica_std',
          name: 'रॉयल टीकवुड टेक्सचर 1mm माइका',
          brand: 'Greenlam Classic',
          tier: 'standard',
          price: 1650,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'rich natural dark teakwood textured 1mm sunmica shutters with subtle wood grain',
        },
        {
          id: 'k_mica_lux',
          name: 'हाई-ग्लॉस क्रिस्टल ऐक्रेलिक शीट',
          brand: 'Rehau Gloss',
          tier: 'luxury',
          price: 3400,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'mirror-finish high-gloss cream and warm walnut acrylic shutters with concealed G-profile handles and warm strip lighting',
        },
      ],
    },
    {
      groupId: 'drawers',
      groupTitle: '2. ड्रॉअर, चैनल & बास्केट चुनें',
      items: [
        {
          id: 'k_drw_budget',
          name: 'स्टेनलेस वायर बास्केट सेट',
          brand: 'Standard SS-202',
          tier: 'budget',
          price: 4200,
          unit: 'पूरा सेट (5 बास्केट)',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'classic hinged lower doors and standard cutlery drawer fronts',
        },
        {
          id: 'k_drw_std',
          name: 'सॉफ्ट-क्लोज़ टैंडेम ड्रॉअर बॉक्स',
          brand: 'Ebco Pro',
          tier: 'standard',
          price: 9800,
          unit: 'पूरा सेट (5 ड्रॉअर)',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'wide seamless tandem soft-close drawers with brushed aluminum handle profiles',
        },
        {
          id: 'k_drw_lux',
          name: 'कॉर्नर मैजिक बास्केट + हाइड्रॉलिक चिमनी सेट',
          brand: 'Hettich Germany',
          tier: 'luxury',
          price: 18500,
          unit: 'फुल प्रीमियम पैक',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury glass-hood black chimney, hydraulic lift-up upper shutters, wide tandem drawers and warm under-cabinet cove LED glow',
        },
      ],
    },
    {
      groupId: 'countertop',
      groupTitle: '3. पत्थर / काउंटरटॉप चुनें',
      items: [
        {
          id: 'k_stn_budget',
          name: 'ब्लैक ग्रेनाइट पॉलिश स्लैब',
          brand: 'Rajasthan Jet Black',
          tier: 'budget',
          price: 170,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 24,
          supplierName: 'न्यू मार्केट मार्बल & ग्रेनाइट',
          imageUrl: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'polished black granite countertop with stainless sink and backsplash',
        },
        {
          id: 'k_stn_std',
          name: 'वाइट गैलेक्सी क्वार्ट्ज़ टॉप',
          brand: 'Kalinga Quartz',
          tier: 'standard',
          price: 340,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 24,
          supplierName: 'न्यू मार्केट मार्बल & ग्रेनाइट',
          imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'crisp white quartz stone countertop with sleek marble vein backsplash',
        },
        {
          id: 'k_stn_lux',
          name: 'इटैलियन सतवारियो मार्बल स्लैब',
          brand: 'Italian Imported',
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
  ],

  bedroom: [
    {
      groupId: 'bed_frame',
      groupTitle: '1. असली लकड़ी / हाइड्रॉलिक बेड चुनें',
      items: [
        {
          id: 'b_bed_budget',
          name: 'कमर्शियल प्लाई क्वीन बॉक्स बेड',
          brand: 'Greenply Eco',
          tier: 'budget',
          price: 16500,
          unit: 'पूरा बेड (मजदूरी सहित)',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean modern queen wooden bed with neat white linen sheets and warm bedside lamp',
        },
        {
          id: 'b_bed_std',
          name: 'शीशम & टीकवुड हाइड्रॉलिक किंग बेड',
          brand: 'Century BWP 710',
          tier: 'standard',
          price: 26500,
          unit: 'फुल हाइड्रॉलिक बेड',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury handcrafted king-size solid teakwood bed with upholstered cushioned headboard, fluffy bedding and floating wood side tables',
        },
        {
          id: 'b_bed_lux',
          name: 'वॉल-पैनल रॉयल कुशन बेड विथ LED',
          brand: 'Italian PU & Velvet',
          tier: 'luxury',
          price: 38000,
          unit: 'मास्टर बेडरूम सेट',
          approxQtyMultiplier: 1,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'designer floor-to-ceiling fluted wooden wall paneling behind a luxury upholstered king bed with warm ambient backlighting',
        },
      ],
    },
    {
      groupId: 'mica',
      groupTitle: '2. अलमारी व फर्नीचर का माइका चुनें',
      items: [
        {
          id: 'b_mica_budget',
          name: 'मैट आइवरी लैमिनेट शीट',
          brand: 'Merino Matte',
          tier: 'budget',
          price: 900,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'built-in matte ivory hinged wardrobe next to the bed',
        },
        {
          id: 'b_mica_std',
          name: 'वॉलनट वुड स्लाइडिंग वॉर्डरोब माइका',
          brand: 'Greenlam 1mm',
          tier: 'standard',
          price: 1750,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'floor-to-ceiling dark walnut wood sliding wardrobe with loft storage',
        },
        {
          id: 'b_mica_lux',
          name: 'टिन्टेड ग्लास + गोल्डन प्रोफाइल वॉर्डरोब',
          brand: 'Saint-Gobain & Alu',
          tier: 'luxury',
          price: 3600,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 6,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'glass-door illuminated designer wardrobe with warm yellow strip lights inside',
        },
      ],
    },
  ],

  wardrobe: [
    {
      groupId: 'ply',
      groupTitle: '1. प्लाईवुड क्वालिटी चुनें',
      items: [
        {
          id: 'w_ply_budget',
          name: 'MR कमर्शियल प्लाई 18mm',
          brand: 'Local ISI Ply',
          tier: 'budget',
          price: 1450,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'neat built-in bedroom wardrobe',
        },
        {
          id: 'w_ply_std',
          name: 'सेंचुरी BWP 710 मरीन प्लाई 19mm',
          brand: 'CenturyPly Sainik',
          tier: 'standard',
          price: 2400,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 5,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'heavy-duty moisture-resistant bedroom wardrobe with full loft',
        },
      ],
    },
    {
      groupId: 'mica',
      groupTitle: '2. अलमारी माइका / शटर फिनिश चुनें',
      items: [
        {
          id: 'w_mica_budget',
          name: 'व्हाइट & ग्रे मैट माइका',
          brand: 'Merino 0.8mm',
          tier: 'budget',
          price: 850,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'matte light grey and white 3-door hinged wardrobe with full upper loft',
        },
        {
          id: 'w_mica_std',
          name: 'डार्क वॉलनट टीकवुड 1mm माइका',
          brand: 'Greenlam Teak',
          tier: 'standard',
          price: 1650,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'rich dark walnut teakwood sliding wardrobe with full-length dressing mirror and brass handles',
        },
        {
          id: 'w_mica_lux',
          name: 'हाई-ग्लॉस ग्लास शटर & सेंसर LED',
          brand: 'Rehau Glass & LED',
          tier: 'luxury',
          price: 3500,
          unit: 'प्रति शीट',
          approxQtyMultiplier: 4,
          supplierName: 'भोपाल टिंबर & लैमिनेट हब',
          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'designer tinted glass-door floor-to-ceiling wardrobe with warm interior LED strips and sleek bronze frame',
        },
      ],
    },
  ],

  house: [
    {
      groupId: 'structure',
      groupTitle: '1. मकान निर्माण टाइप व स्ट्रक्चर चुनें',
      items: [
        {
          id: 'h_str_budget',
          name: 'सिंगल-फ्लोर 2BHK स्टैंडर्ड ब्रिक होम',
          brand: 'Red Clay Brick + UltraTech',
          tier: 'budget',
          price: 1250,
          unit: 'प्रति sq.ft (सामान सहित)',
          approxQtyMultiplier: 800,
          supplierName: 'भोपाल बिल्डिंग मटेरियल हब',
          imageUrl: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'clean single-story Indian modern home with red brick accent front porch, paved driveway and plaster boundary wall',
        },
        {
          id: 'h_str_std',
          name: '2-मंजिला आधुनिक डुप्लेक्स (ग्लास बालकनी)',
          brand: 'AAC Block + Ultratech RCC',
          tier: 'standard',
          price: 1550,
          unit: 'प्रति sq.ft (मटेरियल + लेबर)',
          approxQtyMultiplier: 1000,
          supplierName: 'भोपाल बिल्डिंग मटेरियल हब',
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'photorealistic newly built 2-story modern Indian duplex home with warm wood pergola, glass balcony railing, white & grey exterior facade lighting',
        },
        {
          id: 'h_str_lux',
          name: 'निर्माणाधीन स्ट्रक्चर (कॉलम, छत लेंटर & ईंट)',
          brand: 'TMT Fe550D + PPC Cement',
          tier: 'luxury',
          price: 1850,
          unit: 'प्रति sq.ft (टर्नकी लक्ज़री)',
          approxQtyMultiplier: 1000,
          supplierName: 'गुप्ता हार्डवेयर & सप्लायर्स',
          imageUrl: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'authentic realistic Indian house actively under masonry construction on a residential plot with red brick walls, concrete RCC pillars, scaffolding and masons structure',
        },
      ],
    },
    {
      groupId: 'paint',
      groupTitle: '2. बाहरी पेंट & टाइल्स फिनिश चुनें',
      items: [
        {
          id: 'h_pnt_std',
          name: 'एशियन पेंट्स अपेक्स वेदरप्रूफ',
          brand: 'Asian Paints Apex',
          tier: 'standard',
          price: 28,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 400,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'fresh waterproof warm white and terracotta exterior facade finish',
        },
        {
          id: 'h_pnt_lux',
          name: 'रॉयल एलिवेशन स्टोन क्लैडिंग & ड्रेनेज',
          brand: 'Birla + Kajaria',
          tier: 'luxury',
          price: 65,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 400,
          supplierName: 'अरेरा मार्बल गैलरी',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'natural stone cladding front facade with architectural warm exterior spotlights',
        },
      ],
    },
  ],

  bathroom: [
    {
      groupId: 'sanitary',
      groupTitle: '1. बाथरूम टाइल्स & फिटिंग रेंज चुनें',
      items: [
        {
          id: 'bt_std',
          name: 'मैट एंटी-स्किड टाइल्स + जगुआर स्टॉप कॉक',
          brand: 'Kajaria & Jaquar',
          tier: 'standard',
          price: 18500,
          unit: 'सम्पूर्ण बाथरूम पैक',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern clean tiled Indian bathroom with chrome wall mixer tap, rain shower and anti-skid grey stone floor tiles',
        },
        {
          id: 'bt_lux',
          name: 'कंसील्ड डायवर्टर + LED मिरर वैनिटी',
          brand: 'Kohler & Supreme CPVC',
          tier: 'luxury',
          price: 34000,
          unit: 'लक्ज़री वैनिटी पैक',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'luxury marble-tiled modern bathroom with backlit oval LED mirror, floating wooden vanity counter and concealed chrome shower',
        },
      ],
    },
  ],

  electrical: [
    {
      groupId: 'lighting',
      groupTitle: '1. लाइटिंग & मॉड्यूलर बोर्ड रेंज चुनें',
      items: [
        {
          id: 'el_std',
          name: 'फिनोलेक्स FR-LSH वायर + LED पैनल सेट',
          brand: 'Finolex & Havells',
          tier: 'standard',
          price: 8500,
          unit: 'प्रति कमरा पैक',
          approxQtyMultiplier: 1,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'modern bright Indian living room ceiling with recessed warm COB LED spotlights, false ceiling cove glow and neat modular switches',
        },
      ],
    },
  ],

  painting: [
    {
      groupId: 'paint',
      groupTitle: '1. पुट्टी व पेंट पैकेज चुनें',
      items: [
        {
          id: 'pt_std',
          name: '2-कोट बिरला पुट्टी + रॉयल शाइन पेंट',
          brand: 'Birla & Asian Paints',
          tier: 'standard',
          price: 24,
          unit: 'प्रति sq.ft',
          approxQtyMultiplier: 400,
          supplierName: 'गुप्ता हार्डवेयर, एमपी नगर',
          imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
          visualDescriptor: 'freshly painted smooth satin cream and warm sage green feature wall interior',
        },
      ],
    },
  ],
};
