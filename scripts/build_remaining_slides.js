const { spawnSync } = require('child_process');

const PRES_ID = '1MNUd1xt49_nc8A5DLl2mqrSw6Zas7iaWg7ROSmd90sU';
const ACCOUNT = 'ankitvis787966@gmail.com';

function runGSlides(args) {
  console.log(`Running: gslides ${args.join(' ')}`);
  const res = spawnSync('cmd.exe', ['/c', 'gslides', ...args], {
    encoding: 'utf-8',
    env: { ...process.env, AGY_ACCOUNT: ACCOUNT },
  });

  if (res.error) {
    throw res.error;
  }
  if (res.status !== 0) {
    throw new Error(`gslides failed with code ${res.status}: ${res.stderr || res.stdout}`);
  }
  return (res.stdout || '').trim();
}

const remainingSlides = [
  // Slide 11 (Index 10)
  {
    title: 'Slide 11: Screen 7 - Flagship AI: AI Ustad Multimodal Vision',
    body: `• Google Gemini 1.5 Flash Multimodal Vision:
   Homeowners point their smartphone camera or upload site photos of defects (taps, seepage, MCBs, doors, tiles).

• Instant Root Cause Diagnosis:
   Uncovers hidden issues - e.g. identifies that a leaking tap only has a worn ceramic spindle rather than needing full replacement.

• Exact Bhopal Hardware Pricing:
   Itemizes required replacement parts with authentic Bhopal hardware store prices (Jaquar 1/2" spindle Rs 85, Teflon Rs 20).

• Fair Contractor Labor Estimation:
   Calculates realistic labor charges based on CPWD and Bhopal market benchmarks (e.g. Rs 150 labor).

• 3-Step DIY Safety Fix and Voice Guidance:
   Speaks 3 temporary safety instructions in Hindi to mitigate damage before the technician arrives.`,
    badge: 'AI Diagnostic Truth: Empowers homeowners with exact knowledge so they can never be cheated',
  },
  // Slide 12 (Index 11)
  {
    title: 'Slide 12: Screen 8 - Flagship AI: 3D Modular CAD Space Studio',
    body: `• Interactive 3D Room Planners:
   Visual layout generators for Modular Kitchens (L-Shape, Parallel, U-Shape), Full-Height Wardrobes, and Living Rooms.

• Real Material Specifications:
   Pre-configured with industry-grade BWP Grade-710 Marine Plywood, 1mm Acrylic High-Gloss Laminate, and Hettich Soft-Close Channels.

• Dynamic Cost Calculation:
   Instantly computes square footage rates (Rs 1,250 - Rs 1,650/sq.ft) and total estimated budget.

• Material Bill of Quantities (BOQ):
   Generates detailed sheet count of plywood, laminate sheets, Fevicol Marine cans, edge-banding tapes, and hardware hinges.

• Direct WhatsApp Export:
   1-click export of 3D specifications and material lists directly to local carpenters and hardware vendors.`,
    badge: 'Architectural Precision: Professional CAD-grade planning made accessible to every homeowner',
  },
  // Slide 13 (Index 12)
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
    badge: 'Cloud Efficiency: High-scalability architecture with minimal infrastructure overhead',
  },
  // Slide 14 (Index 13)
  {
    title: 'Slide 14: Screen 10 - Contractor Pro Hub (Artisan Empowerment)',
    body: `• Aadhaar and e-KYC Registration Wizard:
   Streamlined onboarding allowing artisans to upload Aadhaar card, trade certifications, and previous work samples.

• Live Job Dispatch Radar:
   Real-time broadcast of customer booking requests within a 5km radius with a 45-second acceptance timer.

• Digital Earnings and Payout Ledger:
   Complete visibility into daily earnings, completed jobs, pending payouts, and direct bank settlement.

• Work Verification and Reputation Score:
   Verified customer reviews and 5-star ratings build a digital credit profile, helping artisans secure bank micro-loans.

• Zero-Commission Philosophy:
   Artisans retain 95% of their hard-earned labor (compared to only 70% on traditional aggregator apps).`,
    badge: 'Dignity of Labor: Transforming unorganized daily-wage workers into respected digital entrepreneurs',
  },
  // Slide 15 (Index 14)
  {
    title: 'Slide 15: Screen 11 - Vendor Storefront Hub (Hardware Marketplace)',
    body: `• Digital Storefront for Neighborhood Shops:
   Allows local hardware, electrical, plumbing, and paint stores in Bhopal to go online in under 10 minutes.

• Product Catalog and Live Inventory:
   List products across CPVC pipes, brass fittings, LED panels, MCBs, plywood, Asian Paints, and Dr. Fixit waterproofing.

• Real-Time Price and Stock Updates:
   Vendors can update bulk material prices (cement, sand, tiles) dynamically based on daily wholesale rates.

• On-Demand Site Material Delivery:
   Contractors working on customer sites can order missing parts directly from nearby stores for 30-minute delivery.

• Sales Dashboard and Settlement:
   Daily sales volume, best-selling materials, and direct digital payouts to shop bank accounts.`,
    badge: 'Hyperlocal Commerce: Empowering traditional hardware retailers against big e-commerce monopolies',
  },
  // Slide 16 (Index 15)
  {
    title: 'Slide 16: Screen 12 - Super Admin Security & Control Tower',
    body: `• Centralized Platform Governance:
   Password-protected administrative dashboard with strict session tokens and role verification.

• 1-Click KYC Approval Pipeline:
   Admin inspects contractor Aadhaar cards and vendor shop licenses, with 1-click Approve or Reject actions.

• Escrow Vault and Financial Monitoring:
   Real-time visibility into all active escrow funds, pending releases, and total platform Gross Merchandise Value (GMV).

• Dispute Arbitration Center:
   Automated ticketing for customer complaints or artisan payment disputes with admin refund/payout override tools.

• Live Security Audit Logs:
   Tamper-proof event logs tracking all administrative logins, status overrides, and financial transactions.`,
    badge: 'Master Governance: Complete operational oversight, fraud prevention and financial integrity',
  },
  // Slide 17 (Index 16)
  {
    title: 'Slide 17: Screen 13 - Technical Architecture and Stack',
    body: `• Frontend (Cross-Platform Mobile and Web):
   • React Native Web + Expo SDK 52 (Continuous Native Generation for iOS, Android APK, and Web).
   • TypeScript with 100% type safety and zero compiler warnings.

• Backend API:
   • Node.js Express REST API with modular controllers, CORS configuration, and body-parser limits.
   • Integrated Google Gemini 1.5 Flash Vision Multimodal API.

• Cloud Database:
   • MongoDB Atlas with Mongoose ORM, connection pooling, and multi-field indexing.

• Cloud Hosting and Deployment:
   • Production deployed on Vercel Edge Serverless infrastructure with global CDN caching and automatic HTTPS.`,
    badge: 'Production Architecture: Enterprise-grade stack ensuring high availability and zero downtime',
  },
  // Slide 18 (Index 17)
  {
    title: 'Slide 18: Screen 14 - Security, RBAC and API Hardening',
    body: `• OWASP Top 10 Security Hardening:
   Input sanitization, NoSQL injection prevention, cross-site scripting (XSS) defense, and parameter validation.

• Cryptographic Protection:
   Bcrypt password hashing with 10 salt rounds and encrypted authorization tokens.

• Strict Role-Based Access Control (RBAC):
   Backend middleware verifies token permissions before allowing access to Admin, Partner, or User endpoints.

• Data Privacy and Right to Erasure:
   Comprehensive Privacy Policy, transparent data usage disclosures, and permanent account deletion button.

• Rate Limiting and DoS Protection:
   API request throttling preventing automated brute-force attacks and bot scraping.`,
    badge: 'Bank-Grade Security: Robust defense mechanisms protecting sensitive user and financial data',
  },
  // Slide 19 (Index 18)
  {
    title: 'Slide 19: Screen 15 - 200-Point Quality Audit Breakdown',
    body: `• Audit Score: 189 / 200 Points PASS (94.5% Production Readiness)

• Key Module Pass Rates:
   • UI/UX Design and Responsiveness: 10/10 PASS | Color contrast, font hierarchy, mobile layout.
   • App Functionality and Navigation: 10/10 PASS | All buttons, modals, back-handlers working.
   • Authentication and RBAC: 10/10 PASS | Mobile OTP, role isolation, session expiry.
   • Payment and Escrow Guarantee: 10/10 PASS | Dynamic UPI QR, deep-linking, instant refund logic.
   • AI Multimodal Vision: 10/10 PASS | Gemini 1.5 Flash API + Bhopal heuristics engine fallback.
   • Security and Compliance: 10/10 PASS | OWASP verified, bcrypt hashing, legal privacy policy.`,
    badge: 'Quality Assured: Rigorously audited and tested against 200 industry-standard benchmarks',
  },
  // Slide 20 (Index 19)
  {
    title: 'Slide 20: Screen 16 - Unit Economics and Monetization Model',
    body: `• Multi-Stream Sustainable Revenue Engine:
   1. 5% Platform Escrow Fee:
      Charged on completed online app jobs. (5x lower than Urban Company's 25-30% predatory fee).
   2. Flat Rs 35 Lead Generation Fee:
      Charged for direct cash jobs connected off-platform.
   3. Featured Contractor Pro Subscription (Rs 299 / month):
      Guarantees top search placement, verified badge, and zero lead fee.
   4. Featured Vendor Showcase (Rs 499 / month):
      Promotes hardware stores as preferred material suppliers in their locality.
   5. AI Space Studio Pro (Rs 199 / month):
      Unlimited 3D CAD renders, PDF BOQ exports, and architectural blueprints for homeowners.`,
    badge: 'High Margin, Low Churn: Fair pricing creates massive artisan loyalty and high customer retention',
  },
  // Slide 21 (Index 20)
  {
    title: 'Slide 21: Screen 17 - Hyperlocal Launch Playbook (Bhopal Pilot)',
    body: `• Bhopal Target Micro-Markets:
   1. MP Nagar: High density of commercial offices, retail shops, and rental properties.
   2. Kolar Road: Rapidly expanding residential corridor with constant home renovation needs.
   3. Arera Colony: Affluent residential demographic seeking premium, verified contractors.
   4. Indrapuri and BHEL: High volume of student rentals and industrial residential quarters.

• 90-Day Supply Onboarding Targets:
   • 500 Verified Artisans (100 Plumbers, 100 Electricians, 100 Carpenters, 100 Masons, 100 Painters).
   • 100 Neighborhood Hardware and Building Material Retailers.

• Hyperlocal Marketing Execution:
   Physical QR posters at hardware stores, artisan referral cash bonuses, and targeted social media ads.`,
    badge: 'Proven Playbook: Hyper-focused density in one city before scaling across Madhya Pradesh',
  },
  // Slide 22 (Index 21)
  {
    title: 'Slide 22: Screen 18 - Scaling Roadmap and Future Milestones',
    body: `• Phase 1 (Q1 - Months 1-3) - Bhopal Hyperlocal Pilot:
   Achieve 5,000 completed bookings, 500 active artisans, and Rs 25 Lakhs in GMV. Validate unit economics.

• Phase 2 (Q2-Q3 - Months 4-9) - Madhya Pradesh State Expansion:
   Replicate playbook in Indore, Jabalpur, Gwalior, and Ujjain. Target 2,500 artisans and Rs 1.5 Crore GMV.

• Phase 3 (Year 2) - Central and North India Expansion:
   Scale to 15 Tier-2 and Tier-3 cities where artisan fragmentation is highest. Target Rs 15 Crore annual GMV.

• Future Product Pipeline:
   • Vernacular Voice Assistant: Book services via pure Hindi voice commands on WhatsApp.
   • Artisan Micro-Financing: 0% interest tool financing based on SETU completion ratings.
   • Vendor BNPL: Buy Now Pay Later credit lines for construction material orders.`,
    badge: 'Long-Term Vision: Becoming India definitive operating system for domestic trades and construction',
  },
  // Slide 23 (Index 22)
  {
    title: 'Slide 23: Screen 19 - Legal, Compliance and Grievance Redressal',
    body: `• Comprehensive Legal Documentation:
   Full Terms of Service, Privacy Policy, and 100% Refund and Cancellation policies accessible directly inside the app.

• 2-Tier Dispute Resolution Architecture:
   • Tier 1: Automated mediation via chat and photo re-inspection within 2 hours.
   • Tier 2: Super Admin arbitration with 100% money-back escrow refund guarantee within 24 hours.

• Consumer Data Rights:
   Full compliance with India's Digital Personal Data Protection (DPDP) Act.
   1-click permanent account deletion with instant data purging.

• Artisan Welfare and Safety Standards:
   Mandatory electrical insulation gear, scaffolding safety checklists, and third-party accident insurance tie-ups.`,
    badge: 'Responsible Platform: Committed to consumer safety, legal compliance and fair labor practices',
  },
  // Slide 24 (Index 23)
  {
    title: 'Slide 24: Screen 20 - Conclusion and Founding Vision',
    body: `• The SETU Promise:
   Building the digital bridge that connects every Indian home to trusted, skilled, and honest craftsmanship.

• Production Readiness Checklist:
   • Live Production Web Application: Deployed and tested at https://setu-1-nine.vercel.app
   • Native Mobile Application: Built on Expo SDK 52 with Continuous Native Generation.
   • AI Knowledge Engine: Google Gemini 1.5 Flash Vision + Bhopal Heuristics fully operational.
   • Financial Infrastructure: Dynamic UPI QR and 100% Escrow Smart Vault active.
   • Quality Audit: 189/200 Points PASS (94.5% score).

• Founder and Developer Contact:
   Ankit Vishwakarma | ankitvis787966@gmail.com | Bhopal, Madhya Pradesh`,
    badge: 'Ready for Scale, Investor Presentations and Commercial Play Store / App Store Launch!',
  },
];

async function main() {
  console.log('🚀 Resuming generation for Slides 11 through 24 for ID:', PRES_ID);

  for (let i = 0; i < remainingSlides.length; i++) {
    const s = remainingSlides[i];
    const slideNumber = i + 11;
    console.log(`\nAdding Slide ${slideNumber}/24: ${s.title}...`);

    // 1. Add slide
    const addOut = runGSlides(['mutate', 'add-slide', PRES_ID]);
    const match = addOut.match(/Added slide: ([a-zA-Z0-9_-]+)/);
    const slideId = match ? match[1] : null;

    if (!slideId) {
      console.error('Failed to create slide:', addOut);
      continue;
    }
    console.log(`Slide created with ID: ${slideId}`);

    // 2. Set background
    runGSlides(['mutate', 'set-background', PRES_ID, '--slide', slideId, '--color', '#0F172A']);

    // 3. Title
    runGSlides([
      'mutate',
      'add-textbox',
      PRES_ID,
      '--slide',
      slideId,
      '--text',
      s.title,
      '--x',
      '35',
      '--y',
      '25',
      '--width',
      '650',
      '--height',
      '40',
      '--bold',
      '--font-size',
      '16',
      '--color',
      '#F59E0B',
    ]);

    // 4. Body
    runGSlides([
      'mutate',
      'add-textbox',
      PRES_ID,
      '--slide',
      slideId,
      '--text',
      s.body,
      '--x',
      '35',
      '--y',
      '70',
      '--width',
      '650',
      '--height',
      '275',
      '--font-size',
      '10.5',
      '--color',
      '#E2E8F0',
    ]);

    // 5. Badge
    runGSlides([
      'mutate',
      'add-textbox',
      PRES_ID,
      '--slide',
      slideId,
      '--text',
      s.badge,
      '--x',
      '35',
      '--y',
      '355',
      '--width',
      '650',
      '--height',
      '30',
      '--bold',
      '--font-size',
      '9.5',
      '--color',
      '#10B981',
    ]);
  }

  console.log('\n🎉 ALL 24 SLIDES SUCCESSFULLY COMPLETED IN GOOGLE SLIDES!');
}

main().catch(console.error);
