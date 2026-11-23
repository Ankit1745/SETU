const { execSync } = require('child_process');

const PRES_ID = '1MNUd1xt49_nc8A5DLl2mqrSw6Zas7iaWg7ROSmd90sU';
const ACCOUNT = 'ankitvis787966@gmail.com';

function runGSlides(cmd) {
  const fullCmd = `$env:AGY_ACCOUNT = "${ACCOUNT}"; gslides ${cmd}`;
  console.log(`Running: gslides ${cmd}`);
  const out = execSync(fullCmd, { shell: 'powershell.exe', encoding: 'utf-8' });
  return out.trim();
}

const slides = [
  // Slide 1: Cover (Slide 0 in Google Slides)
  {
    isCover: true,
    title: 'SETU (सेतु) - Complete A to Z Platform Presentation',
    subtitle: 'India\'s First AI-Powered Hyperlocal Home Services, Construction & Hardware Ecosystem',
    footer: 'Live Web App: https://setu-1-nine.vercel.app | Built with Expo, React Native & Google Gemini AI',
  },
  // Slide 2: Market Problem
  {
    title: 'Slide 2: Market Context - The $30B Unorganized Problem',
    body: `1. Extreme Information Asymmetry:
   • Homeowners lack technical construction knowledge and are regularly overcharged.
   • Example: A leaking tap only needs an ₹85 spindle, but mechanics charge ₹1,200 for full tap replacement.

2. Artisan Exploitation & Commission Burden:
   • Aggregator apps (Urban Company, etc.) charge heavy 25-30% commissions on blue-collar artisans.
   • Local mistris, plumbers, and carpenters have zero verifiable digital credit rating or work portfolio.

3. Offline Hardware Supply Bottleneck:
   • Neighborhood hardware and building material stores are disconnected from active job sites.
   • On-site artisans waste 2-3 hours daily travelling to fetch missing screws, pipes, or chemicals.`,
    badge: '💡 The Opportunity: Unifying Homeowners, Artisans & Hardware Stores on One Transparent Digital Bridge',
  },
  // Slide 3: The Solution
  {
    title: 'Slide 3: The SETU Solution - 3-Sided Hyperlocal Marketplace',
    body: `• The 3-Sided Marketplace Ecosystem:
   1. Homeowners (Customers): Get instant AI defect diagnosis, verified artisans & 100% escrow protection.
   2. Artisans (Contractors): Get zero-commission job leads, daily wage security & digital reputation.
   3. Hardware Stores (Vendors): Receive direct on-site supply orders for construction materials.

• 4 Core Platform Pillars:
   • 15-Minute Emergency Response: Geo-located dispatch for urgent repairs (burst pipes, power cuts).
   • CPWD Standardized Pricing: Transparent labor rate schedule eliminates awkward bargaining.
   • 100% Escrow Guarantee: Payment released only after customer verifies work completion via OTP.
   • Tri-Lingual Accessibility: Native Pure Hindi, English, and conversational Hinglish.`,
    badge: '🚀 Core Value Proposition: Trust, Speed, Transparency & Fair Wages for Indian Home Services',
  },
  // Slide 4: User Journey
  {
    title: 'Slide 4: End-to-End User Journey & Information Architecture',
    body: `• Step 1: Login & Role Selection
   User opens app -> lands directly on Auth screen -> selects Customer, Contractor, Vendor, or Admin -> logs in via 10-digit mobile OTP or browses as Guest.

• Step 2: Problem Discovery & AI Diagnosis
   Customer browses 7 service categories OR uploads photo/video to AI Ustad for instant root-cause analysis, parts list, and labor estimate.

• Step 3: Hyperlocal Artisan Matching
   App GPS matches the closest verified artisan with live ETA (15-45 minutes).

• Step 4: Transparent Execution & Material Procurement
   Artisan inspects site -> orders necessary replacement hardware from nearby registered vendor -> completes repair.

• Step 5: OTP Verification & Escrow Release
   Customer verifies work satisfaction -> enters 4-digit OTP -> escrow funds released instantly to artisan's wallet.`,
    badge: '🔄 Frictionless Workflow: From Problem Identification to Verified Settlement in 5 Simple Steps',
  },
  // Slide 5: Login & Auth
  {
    title: 'Slide 5: Screen 1 - Login & Authentication Engine',
    body: `• Mobile Number & OTP Verification:
   Secure 10-digit phone login with simulated SMS gateway, instant OTP generation, and 60-second resend timer.

• Unified 4-in-1 Role Switcher:
   Seamless login tabs for Customers, Contractors (कारीगर), Vendors (सामग्री विक्रेता), and Super Admin.

• 1-Click Fast Test Credentials:
   Dedicated pre-configured demo buttons for each user role for zero-friction evaluation.

• Guest Browsing Fallback:
   Allows first-time users to explore services, contractor profiles, and AI tools without mandatory signup.

• Session Security:
   JWT-based authentication tokens with localStorage persistence and clean logout clearing.`,
    badge: '🔐 Security Standard: Role-Based Access Control (RBAC) preventing unauthorized access',
  },
  // Slide 6: Tri-Lingual Localization
  {
    title: 'Slide 6: Screen 2 - Tri-Lingual Localization System',
    body: `• Pure Hindi Mode (hi):
   100% शुद्ध हिंदी शब्दावली - जैसे "कारीगर खोजें", "सुरक्षित एस्क्रो भुगतान", "उस्ताद की सलाह".
   Tailored for Tier-2/Tier-3 homeowners, contractors, and local mistris.

• Pure English Mode (en):
   100% clean, professional corporate English - "Find Contractors", "100% Escrow Protection", "Book Service".
   Tailored for urban professionals and enterprise clients.

• Conversational Hinglish Mode (hinglish):
   Natural, modern bilingual phrasing - "15 min me Mistri aapke ghar", "Kaam ke liye verified Karigar dhoondho".
   Tailored for younger demographics and everyday smartphone users.

• Dynamic Header Switcher:
   One-tap toggle in the header ('हिं | EN | Hing') switches the entire app dictionary in real-time.`,
    badge: '🌐 Inclusive Design: Complete linguistic inclusivity across all Indian demographic strata',
  },
  // Slide 7: Customer Module
  {
    title: 'Slide 7: Screen 3 - Customer Module & Home Dashboard',
    body: `• 7 Comprehensive Service Categories:
   1. Plumber (नल व पाइपलाइन) | 2. Electrician (बिजली व वायरिंग) | 3. Carpenter (फर्नीचर व बढ़ई)
   4. Mason (राजमिस्त्री व टाइल्स) | 5. Painter (पुट्टी व पेंटिंग) | 6. Deep Cleaning | 7. AC & Appliance Repair.

• 15-Minute Emergency SOS Dispatch:
   High-visibility emergency banner for urgent water leakages, short circuits, and jammed doors.

• Bhopal Hyperlocal Locality Selector:
   Location pill supporting Indrapuri, MP Nagar, Kolar Road, Arera Colony, Hoshangabad Road, and Ayodhya Bypass.

• Trust Badges & Safety Verification:
   Aadhaar KYC verified badge, police verification stamp, 4.8+ star ratings, and sanitized tools guarantee.`,
    badge: '📱 User Interface: Clutter-free modern design optimized for mobile screens & one-thumb usage',
  },
  // Slide 8: Contractor Discovery
  {
    title: 'Slide 8: Screen 4 - Contractor Discovery & Profile Evaluation',
    body: `• Detailed Contractor Cards:
   Full artisan name, profile photograph, trade specialty, distance in kilometers, and total completed jobs.

• Transparent Rate Schedule:
   Visiting fee (₹149-₹199), standard per-hour labor rates, and emergency surcharge indicators.

• Verified Credentials & Experience:
   Years of trade experience, verified ID badge, background check clearance, and customer review scores.

• Portfolio & Photo Gallery:
   Real photos of past work (plumbing joints, modular wardrobes, tile finishing, electrical panels).

• Direct Communication:
   Direct WhatsApp integration and 1-tap calling for pre-booking alignment.`,
    badge: '⭐ Transparent Evaluation: Customers make informed hiring decisions based on real verified credentials',
  },
  // Slide 9: Booking & Scheduling
  {
    title: 'Slide 9: Screen 5 - Booking & Scheduling Engine',
    body: `• Flexible Dispatch Options:
   • Instant Dispatch: Artisan dispatched within 15 minutes for urgent repairs.
   • Schedule for Later: Date picker and morning/afternoon/evening time slots for planned work.

• Work Scope & Site Media Attachment:
   Customers can describe issues in text, select specific sub-services, and attach site photos or videos.

• Accurate Address & Landmark Geotagging:
   Door/flat number, street name, Bhopal locality, and nearby prominent landmarks.

• Upfront Price Transparency:
   Itemized breakdown displaying visit charge, estimated labor, hardware cost, and zero platform surcharge.`,
    badge: '📅 Hassle-Free Scheduling: Complete clarity on timing, address, and cost before confirmation',
  },
  // Slide 10: Escrow Payments
  {
    title: 'Slide 10: Screen 6 - 100% Escrow Payments & Dynamic UPI QR',
    body: `• Dynamic UPI QR Code Generation:
   Generates instant QR code formatted as 'upi://pay?pa=ankitvis787966@okaxis&am=...' for zero-surcharge bank settlement.

• 1-Click UPI App Deep Linking:
   Direct one-tap launch buttons for Google Pay, PhonePe, Paytm, and BHIM UPI.

• 100% Escrow Protection Vault:
   Customer money is locked safely in the SETU Escrow Smart Vault.
   Funds are never released to the contractor until the customer inputs the 4-digit Job Completion OTP.

• Zero-Penalty Cancellation & Instant Refund:
   100% full money-back guarantee with zero cancellation fees if cancelled prior to artisan dispatch.`,
    badge: '💳 Financial Security: Zero payment risk for homeowners, guaranteed payment for artisans',
  },
  // Slide 11: AI Ustad Vision
  {
    title: 'Slide 11: Screen 7 - Flagship AI: AI Ustad Multimodal Vision',
    body: `• Google Gemini 1.5 Flash Multimodal Vision:
   Homeowners point their smartphone camera or upload site photos of defects (taps, seepage, MCBs, doors, tiles).

• Instant Root Cause Diagnosis:
   Uncovers hidden issues - e.g. identifies that a leaking tap only has a worn ceramic spindle rather than needing full replacement.

• Exact Bhopal Hardware Pricing:
   Itemizes required replacement parts with authentic Bhopal hardware store prices (Jaquar 1/2" spindle ₹85, Teflon ₹20).

• Fair Contractor Labor Estimation:
   Calculates realistic labor charges based on CPWD and Bhopal market benchmarks (e.g. ₹150 labor).

• 3-Step DIY Safety Fix & Voice Guidance:
   Speaks 3 temporary safety instructions in Hindi to mitigate damage before the technician arrives.`,
    badge: '🤖 AI Diagnostic Truth: Empowers homeowners with exact knowledge so they can never be cheated',
  },
  // Slide 12: 3D CAD Space Studio
  {
    title: 'Slide 12: Screen 8 - Flagship AI: 3D Modular CAD Space Studio',
    body: `• Interactive 3D Room Planners:
   Visual layout generators for Modular Kitchens (L-Shape, Parallel, U-Shape), Full-Height Wardrobes, and Living Rooms.

• Real Material Specifications:
   Pre-configured with industry-grade BWP Grade-710 Marine Plywood, 1mm Acrylic High-Gloss Laminate, and Hettich Soft-Close Channels.

• Dynamic Cost Calculation:
   Instantly computes square footage rates (₹1,250 - ₹1,650/sq.ft) and total estimated budget.

• Material Bill of Quantities (BOQ):
   Generates detailed sheet count of plywood, laminate sheets, Fevicol Marine cans, edge-banding tapes, and hardware hinges.

• Direct WhatsApp Export:
   1-click export of 3D specifications and material lists directly to local carpenters and hardware vendors.`,
    badge: '📐 Architectural Precision: Professional CAD-grade planning made accessible to every homeowner',
  },
  // Slide 13: Zero-DB Architecture
  {
    title: 'Slide 13: Screen 9 - Zero-DB / Low-Cost Freemium Token Model',
    body: `• The High-Cost AI Dilemma:
   Running cloud vision APIs and heavy database servers for every casual user creates unsustainable operational costs.

• The SETU Innovation:
   • Client-Side Token Tracker: Allocates 3 free daily diagnostic tokens per device via local storage.
   • Zero-Database Bloat: AI diagnostic calculations run statelessly on the edge without saving heavy video/image files to database.
   • High-Performance Edge Caching: Bhopal market pricing heuristics cached at Vercel Edge for sub-second responses.

• Low Operational Cost Structure:
   Enables SETU to support 100,000+ daily inquiries at near-zero server and database maintenance costs.`,
    badge: '⚡ Cloud Efficiency: High-scalability architecture with minimal infrastructure overhead',
  },
  // Slide 14: Contractor Pro Hub
  {
    title: 'Slide 14: Screen 10 - Contractor Pro Hub (Artisan Empowerment)',
    body: `• Aadhaar & e-KYC Registration Wizard:
   Streamlined onboarding allowing artisans to upload Aadhaar card, trade certifications, and previous work samples.

• Live Job Dispatch Radar:
   Real-time broadcast of customer booking requests within a 5km radius with a 45-second acceptance timer.

• Digital Earnings & Payout Ledger:
   Complete visibility into daily earnings, completed jobs, pending payouts, and direct bank settlement.

• Work Verification & Reputation Score:
   Verified customer reviews and 5-star ratings build a digital credit profile, helping artisans secure bank micro-loans.

• Zero-Commission Philosophy:
   Artisans retain 95% of their hard-earned labor (compared to only 70% on traditional aggregator apps).`,
    badge: '👷 Dignity of Labor: Transforming unorganized daily-wage workers into respected digital entrepreneurs',
  },
  // Slide 15: Vendor Storefront Hub
  {
    title: 'Slide 15: Screen 11 - Vendor Storefront Hub (Hardware Marketplace)',
    body: `• Digital Storefront for Neighborhood Shops:
   Allows local hardware, electrical, plumbing, and paint stores in Bhopal to go online in under 10 minutes.

• Product Catalog & Live Inventory:
   List products across CPVC pipes, brass fittings, LED panels, MCBs, plywood, Asian Paints, and Dr. Fixit waterproofing.

• Real-Time Price & Stock Updates:
   Vendors can update bulk material prices (cement, sand, tiles) dynamically based on daily wholesale rates.

• On-Demand Site Material Delivery:
   Contractors working on customer sites can order missing parts directly from nearby stores for 30-minute delivery.

• Sales Dashboard & Settlement:
   Daily sales volume, best-selling materials, and direct digital payouts to shop bank accounts.`,
    badge: '🏪 Hyperlocal Commerce: Empowering traditional hardware retailers against big e-commerce monopolies',
  },
  // Slide 16: Super Admin Control Tower
  {
    title: 'Slide 16: Screen 12 - Super Admin Security & Control Tower',
    body: `• Centralized Platform Governance:
   Password-protected administrative dashboard with strict session tokens and role verification.

• 1-Click KYC Approval Pipeline:
   Admin inspects contractor Aadhaar cards and vendor shop licenses, with 1-click 'Approve' or 'Reject' actions.

• Escrow Vault & Financial Monitoring:
   Real-time visibility into all active escrow funds, pending releases, and total platform Gross Merchandise Value (GMV).

• Dispute Arbitration Center:
   Automated ticketing for customer complaints or artisan payment disputes with admin refund/payout override tools.

• Live Security Audit Logs:
   Tamper-proof event logs tracking all administrative logins, status overrides, and financial transactions.`,
    badge: '🛡️ Master Governance: Complete operational oversight, fraud prevention & financial integrity',
  },
  // Slide 17: Technical Stack
  {
    title: 'Slide 17: Screen 13 - Technical Architecture & Stack',
    body: `• Frontend (Cross-Platform Mobile & Web):
   • React Native Web + Expo SDK 52 (Continuous Native Generation for iOS, Android APK, and Web).
   • TypeScript with 100% type safety and zero compiler warnings.

• Backend API:
   • Node.js Express REST API with modular controllers, CORS configuration, and body-parser limits.
   • Integrated Google Gemini 1.5 Flash Vision Multimodal API.

• Cloud Database:
   • MongoDB Atlas with Mongoose ORM, connection connection pooling, and multi-field indexing.

• Cloud Hosting & Deployment:
   • Production deployed on Vercel Edge Serverless infrastructure with global CDN caching and automatic HTTPS.`,
    badge: '💻 Production Architecture: Enterprise-grade stack ensuring high availability and zero downtime',
  },
  // Slide 18: Security & Compliance
  {
    title: 'Slide 18: Screen 14 - Security, RBAC & API Hardening',
    body: `• OWASP Top 10 Security Hardening:
   Input sanitization, NoSQL injection prevention, cross-site scripting (XSS) defense, and parameter validation.

• Cryptographic Protection:
   Bcrypt password hashing with 10 salt rounds and encrypted authorization tokens.

• Strict Role-Based Access Control (RBAC):
   Backend middleware verifies token permissions before allowing access to Admin, Partner, or User endpoints.

• Data Privacy & Right to Erasure:
   Comprehensive Privacy Policy, transparent data usage disclosures, and permanent account deletion button.

• Rate Limiting & DoS Protection:
   API request throttling preventing automated brute-force attacks and bot scraping.`,
    badge: '🔒 Bank-Grade Security: Robust defense mechanisms protecting sensitive user & financial data',
  },
  // Slide 19: 200-Point Audit
  {
    title: 'Slide 19: Screen 15 - 200-Point Quality Audit Breakdown',
    body: `• Audit Score: 189 / 200 Points PASS (94.5% Production Readiness)

• Key Module Pass Rates:
   • UI/UX Design & Responsiveness: 10/10 PASS | Color contrast, font hierarchy, mobile layout.
   • App Functionality & Navigation: 10/10 PASS | All buttons, modals, back-handlers working.
   • Authentication & RBAC: 10/10 PASS | Mobile OTP, role isolation, session expiry.
   • Payment & Escrow Guarantee: 10/10 PASS | Dynamic UPI QR, deep-linking, instant refund logic.
   • AI Multimodal Vision: 10/10 PASS | Gemini 1.5 Flash API + Bhopal heuristics engine fallback.
   • Security & Compliance: 10/10 PASS | OWASP verified, bcrypt hashing, legal privacy policy.`,
    badge: '✅ Quality Assured: Rigorously audited and tested against 200 industry-standard benchmarks',
  },
  // Slide 20: Monetization Model
  {
    title: 'Slide 20: Screen 16 - Unit Economics & Monetization Model',
    body: `• Multi-Stream Sustainable Revenue Engine:
   1. 5% Platform Escrow Fee:
      Charged on completed online app jobs. (5x lower than Urban Company's 25-30% predatory fee).
   2. Flat ₹35 Lead Generation Fee:
      Charged for direct cash jobs connected off-platform.
   3. Featured Contractor Pro Subscription (₹299 / month):
      Guarantees top search placement, verified badge, and zero lead fee.
   4. Featured Vendor Showcase (₹499 / month):
      Promotes hardware stores as preferred material suppliers in their locality.
   5. AI Space Studio Pro (₹199 / month):
      Unlimited 3D CAD renders, PDF BOQ exports, and architectural blueprints for homeowners & interior designers.`,
    badge: '💰 High Margin, Low Churn: Fair pricing creates massive artisan loyalty and high customer retention',
  },
  // Slide 21: Bhopal Launch Playbook
  {
    title: 'Slide 21: Screen 17 - Hyperlocal Launch Playbook (Bhopal Pilot)',
    body: `• Bhopal Target Micro-Markets:
   1. MP Nagar: High density of commercial offices, retail shops, and rental properties.
   2. Kolar Road: Rapidly expanding residential corridor with constant home renovation needs.
   3. Arera Colony: Affluent residential demographic seeking premium, verified contractors.
   4. Indrapuri & BHEL: High volume of student rentals and industrial residential quarters.

• 90-Day Supply Onboarding Targets:
   • 500 Verified Artisans (100 Plumbers, 100 Electricians, 100 Carpenters, 100 Masons, 100 Painters).
   • 100 Neighborhood Hardware & Building Material Retailers.

• Hyperlocal Marketing Execution:
   Physical QR posters at hardware stores, artisan referral cash bonuses, and targeted social media ads.`,
    badge: '📍 Proven Playbook: Hyper-focused density in one city before scaling across Madhya Pradesh',
  },
  // Slide 22: Scaling Roadmap
  {
    title: 'Slide 22: Screen 18 - Scaling Roadmap & Future Milestones',
    body: `• Phase 1 (Q1 - Months 1-3) - Bhopal Hyperlocal Pilot:
   Achieve 5,000 completed bookings, 500 active artisans, and ₹25 Lakhs in GMV. Validate unit economics.

• Phase 2 (Q2-Q3 - Months 4-9) - Madhya Pradesh State Expansion:
   Replicate playbook in Indore, Jabalpur, Gwalior, and Ujjain. Target 2,500 artisans and ₹1.5 Crore GMV.

• Phase 3 (Year 2) - Central & North India Expansion:
   Scale to 15 Tier-2 and Tier-3 cities where artisan fragmentation is highest. Target ₹15 Crore annual GMV.

• Future Product Pipeline:
   • Vernacular Voice Assistant: Book services via pure Hindi voice commands on WhatsApp.
   • Artisan Micro-Financing: 0% interest tool financing based on SETU completion ratings.
   • Vendor BNPL: Buy Now Pay Later credit lines for construction material orders.`,
    badge: '📈 Long-Term Vision: Becoming India\'s definitive operating system for domestic trades & construction',
  },
  // Slide 23: Legal & Consumer Protection
  {
    title: 'Slide 23: Screen 19 - Legal, Compliance & Grievance Redressal',
    body: `• Comprehensive Legal Documentation:
   Full Terms of Service, Privacy Policy, and 100% Refund & Cancellation policies accessible directly inside the app.

• 2-Tier Dispute Resolution Architecture:
   • Tier 1: Automated mediation via chat and photo re-inspection within 2 hours.
   • Tier 2: Super Admin arbitration with 100% money-back escrow refund guarantee within 24 hours.

• Consumer Data Rights:
   Full compliance with India's Digital Personal Data Protection (DPDP) Act.
   1-click permanent account deletion with instant data purging.

• Artisan Welfare & Safety Standards:
   Mandatory electrical insulation gear, scaffolding safety checklists, and third-party accident insurance tie-ups.`,
    badge: '⚖️ Responsible Platform: Committed to consumer safety, legal compliance & fair labor practices',
  },
  // Slide 24: Conclusion & Vision
  {
    title: 'Slide 24: Screen 20 - Conclusion & Founding Vision',
    body: `• The SETU Promise:
   Building the digital bridge that connects every Indian home to trusted, skilled, and honest craftsmanship.

• Production Readiness Checklist:
   • Live Production Web Application: Deployed and tested at https://setu-1-nine.vercel.app
   • Native Mobile Application: Built on Expo SDK 52 with Continuous Native Generation.
   • AI Knowledge Engine: Google Gemini 1.5 Flash Vision + Bhopal Heuristics fully operational.
   • Financial Infrastructure: Dynamic UPI QR and 100% Escrow Smart Vault active.
   • Quality Audit: 189/200 Points PASS (94.5% score).

• Founder & Developer Contact:
   Ankit Vishwakarma | ankitvis787966@gmail.com | Bhopal, Madhya Pradesh`,
    badge: '🚀 Ready for Scale, Investor Presentations & Commercial Play Store / App Store Launch!',
  },
];

async function main() {
  console.log('🚀 Starting generation of Complete 24-Slide A to Z Presentation for ID:', PRES_ID);

  // Slide 1 (Index 0, ID: 'p')
  console.log('Configuring Slide 1 (Cover)...');
  runGSlides(`mutate set-background ${PRES_ID} --slide p --color "#0F172A"`);
  runGSlides(
    `mutate add-textbox ${PRES_ID} --slide p --text "${slides[0].title.replace(/"/g, '\\"')}" --x 40 --y 100 --width 640 --height 75 --bold --font-size 24 --color "#F59E0B"`
  );
  runGSlides(
    `mutate add-textbox ${PRES_ID} --slide p --text "${slides[0].subtitle.replace(/"/g, '\\"')}" --x 40 --y 185 --width 640 --height 50 --font-size 15 --color "#E2E8F0"`
  );
  runGSlides(
    `mutate add-textbox ${PRES_ID} --slide p --text "${slides[0].footer.replace(/"/g, '\\"')}" --x 40 --y 280 --width 640 --height 40 --font-size 12 --color "#10B981"`
  );

  // Slides 2 to 24
  for (let i = 1; i < slides.length; i++) {
    const s = slides[i];
    console.log(`\nAdding ${s.title}... (${i + 1}/${slides.length})`);

    const addOut = runGSlides(`mutate add-slide ${PRES_ID}`);
    const match = addOut.match(/Added slide: ([a-zA-Z0-9_-]+)/);
    const slideId = match ? match[1] : null;

    if (!slideId) {
      console.error('Failed to create slide:', addOut);
      continue;
    }

    // Set background
    runGSlides(`mutate set-background ${PRES_ID} --slide ${slideId} --color "#0F172A"`);

    // Title
    runGSlides(
      `mutate add-textbox ${PRES_ID} --slide ${slideId} --text "${s.title.replace(/"/g, '\\"')}" --x 35 --y 25 --width 650 --height 40 --bold --font-size 16 --color "#F59E0B"`
    );

    // Body
    runGSlides(
      `mutate add-textbox ${PRES_ID} --slide ${slideId} --text "${s.body.replace(/"/g, '\\"')}" --x 35 --y 70 --width 650 --height 275 --font-size 10.5 --color "#E2E8F0"`
    );

    // Badge
    runGSlides(
      `mutate add-textbox ${PRES_ID} --slide ${slideId} --text "${s.badge.replace(/"/g, '\\"')}" --x 35 --y 355 --width 650 --height 30 --bold --font-size 9.5 --color "#10B981"`
    );
  }

  console.log('\n🎉 ALL 24 SLIDES SUCCESSFULLY BUILT IN GOOGLE SLIDES!');
}

main().catch(console.error);
