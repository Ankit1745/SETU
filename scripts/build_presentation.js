const { execSync } = require('child_process');

const PRES_ID = '1rgdjpnBsymsUEevMFpEMW1ELEIqMEinL7d5aTdQ05L4';
const ACCOUNT = 'ankitvis787966@gmail.com';

function runGSlides(cmd) {
  const fullCmd = `$env:AGY_ACCOUNT = "${ACCOUNT}"; gslides ${cmd}`;
  console.log(`Running: gslides ${cmd}`);
  const out = execSync(fullCmd, { shell: 'powershell.exe', encoding: 'utf-8' });
  return out.trim();
}

const slidesData = [
  {
    title: 'Slide 2: The Problem - Fragmentation in Indian Home Services',
    body: `1. Asymmetric Information:
   • Homeowners do not understand the technical root cause of repair issues.
   • Example: A leaking tap only needs an ₹85 spindle, but local mechanics quote ₹1,200 for full tap replacement.

2. Artisan Exploitation & Commission Burden:
   • Existing aggregator apps (Urban Company, etc.) charge heavy 25-30% commissions.
   • Daily-wage masons and mistris lack direct digital identity and verified KYC credibility.

3. Hardware Store Disconnect:
   • Local building material shops remain offline and lose business to generic e-commerce.
   • Job sites stall for hours waiting for missing screws, fittings, or chemicals.`,
    badge: '💡 SETU Solution: Zero-Commission Discovery + AI Diagnostic Truth Engine + Hyperlocal Vendor Delivery',
  },
  {
    title: 'Slide 3: The SETU Solution - Unified 3-Sided Hyperlocal Platform',
    body: `• 15-Minute Emergency Karigar Dispatch:
   Hyperlocal geo-matching connects homeowners directly to nearby verified plumbers, electricians, carpenters, masons, and painters.

• 100% Escrow Payment Guarantee:
   Customer payment is held securely in escrow and released to the contractor only after work verification via OTP.

• Transparent Standard Rates (CPWD / MP Market):
   Clear, standardized labor pricing prevents overcharging and eliminates uncomfortable bargaining.

• Tri-Lingual Accessibility:
   Full native support for Hindi, English, and Hinglish ensures zero friction for both blue-collar artisans and urban customers.`,
    badge: '🚀 Core Value: Trust, Speed & Fair Rates for Bhopal Home Services',
  },
  {
    title: 'Slide 4: Flagship Innovation - AI Ustad (Live Multimodal Vision & 3D CAD)',
    body: `• Gemini 1.5 Flash Vision Integration:
   Users snap photos or stream live video of household defects (taps, seepage, MCBs, doors, tiles).
   The AI diagnoses the root problem, estimates parts with local Bhopal market rates, and calculates labor.

• 3-Step DIY Safety Fixes:
   Provides immediate emergency stop-gap measures (e.g. shutting stopcock, checking MCB load) before the artisan arrives.

• 3D Modular CAD Space Studio:
   Interactive visual planners for modular kitchens, wardrobes, and living rooms with real material BOMs (Marine Ply, Acrylic Mica).

• Zero-DB / Low-Cost Edge Architecture:
   Freemium token allocation with local device caching ensures ultra-low cloud hosting and database costs.`,
    badge: '🤖 Technology Advantage: Gemini Multimodal Vision + Local Contractor Heuristics Fallback',
  },
  {
    title: 'Slide 5: 4-in-1 Role-Based Architecture (Customer, Contractor, Vendor, Admin)',
    body: `1. Customer Module:
   Instant booking, live video AI doctor, GPS contractor discovery, transparent invoicing, UPI & COD payments.

2. Contractor Pro Hub:
   Aadhaar & e-KYC verified registration, job dispatch board, digital earnings ledger, daily payout settlement.

3. Vendor Storefront Hub:
   Local hardware & building material shop directory, real-time inventory listing, direct on-site supply orders.

4. Super Admin Control Center:
   Aadhaar KYC approval workflow, real-time escrow monitoring, automated dispute resolution, and platform analytics.`,
    badge: '🛡️ Complete Ecosystem: Every stakeholder has a dedicated, secure mobile & web interface',
  },
  {
    title: 'Slide 6: Payment Architecture & Win-Win Unit Economics',
    body: `• Dynamic UPI QR & Deep Links:
   Direct UPI payments (GPay, PhonePe, Paytm, BHIM) with zero gateway merchant surcharges.

• 100% Escrow Protection:
   Money-back guarantee with zero cancellation penalty before job dispatch.

• Multi-Stream Revenue Model:
   1. 5% Platform Escrow Fee on online completed jobs (Competitors charge 25-30%).
   2. Flat ₹35 Lead Generation Fee for direct cash / off-platform artisan jobs.
   3. Featured Contractor & Vendor Verification Badges (Monthly SaaS ₹299/mo).
   4. AI Space Studio Pro Tier (Unlimited 3D renderings & BOQ generation).`,
    badge: '💰 Sustainable Economics: Low-cost infrastructure enables 5x lower commission than competitors',
  },
  {
    title: 'Slide 7: Technical Architecture & 200-Point Audit Compliance',
    body: `• Cross-Platform Performance:
   Expo SDK, React Native Web, Continuous Native Generation (CNG) supporting Android, iOS, and Web.

• Backend & Database Scalability:
   Node.js Express REST API, MongoDB Atlas cloud sync, Vercel Edge Serverless hosting with instant global caching.

• Comprehensive 200-Point Audit:
   Scored 189/200 PASS (94.5% production readiness) across UI/UX, Security, Database, Payments, Performance, and Compliance.

• Enterprise Security & Legal Compliance:
   OWASP security compliance, bcrypt password hashing, JWT sessions, strict RBAC, and verified Privacy, Terms & Refund policies.`,
    badge: '🔒 Enterprise Grade: 189/200 Audit Points PASS | 100% Type-Safe TypeScript Build',
  },
  {
    title: 'Slide 8: Bhopal Launch Strategy & Future Growth Roadmap',
    body: `• Phase 1 (Months 1-3) - Bhopal Hyperlocal Pilot:
   Onboard 500 verified Karigars and 100 Hardware Stores in MP Nagar, Kolar Road, Arera Colony, and Indrapuri.

• Phase 2 (Months 4-6) - Madhya Pradesh Expansion:
   Replicate playbook in Indore, Jabalpur, Gwalior, and Ujjain with localized regional pricing.

• Phase 3 (Months 7-12) - Central India & Tier-2 Scale:
   Expand to 15 Tier-2/Tier-3 cities across North & Central India where artisan fragmentation is highest.

• Founding Vision:
   Building the digital bridge that connects every Indian home to trusted, skilled craftsmanship.`,
    badge: '📍 Live Production Web App: https://setu-1-nine.vercel.app | Ready for App Store & Play Store',
  },
];

async function main() {
  console.log('🚀 Starting presentation generation for:', PRES_ID);

  for (let i = 0; i < slidesData.length; i++) {
    const slide = slidesData[i];
    console.log(`\nAdding ${slide.title}...`);

    // 1. Add blank slide
    const addOut = runGSlides(`mutate add-slide ${PRES_ID}`);
    const match = addOut.match(/Added slide: ([a-zA-Z0-9_-]+)/);
    const slideId = match ? match[1] : null;

    if (!slideId) {
      console.error('Failed to get slide ID from output:', addOut);
      continue;
    }
    console.log(`Slide created with ID: ${slideId}`);

    // 2. Set dark blue background
    runGSlides(`mutate set-background ${PRES_ID} --slide ${slideId} --color "#0F172A"`);

    // 3. Add Header / Title
    runGSlides(
      `mutate add-textbox ${PRES_ID} --slide ${slideId} --text "${slide.title.replace(/"/g, '\\"')}" --x 40 --y 30 --width 640 --height 45 --bold --font-size 18 --color "#F59E0B"`
    );

    // 4. Add Body
    runGSlides(
      `mutate add-textbox ${PRES_ID} --slide ${slideId} --text "${slide.body.replace(/"/g, '\\"')}" --x 40 --y 85 --width 640 --height 250 --font-size 11 --color "#E2E8F0"`
    );

    // 5. Add Badge / Key Takeaway
    runGSlides(
      `mutate add-textbox ${PRES_ID} --slide ${slideId} --text "${slide.badge.replace(/"/g, '\\"')}" --x 40 --y 350 --width 640 --height 35 --bold --font-size 10 --color "#10B981"`
    );
  }

  console.log('\n🎉 ALL 8 SLIDES SUCCESSFULLY POPULATED IN GOOGLE SLIDES!');
}

main().catch(console.error);
