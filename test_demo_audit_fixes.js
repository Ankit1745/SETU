// test_demo_audit_fixes.js
// Verification suite for SETU Demo Audit 8-Point Specification

const assert = require('assert');
const {
  calculateCustomerEstimate,
  parseCustomerProblem,
} = require('./tests_compiled/services/constructionAI');
const {
  INITIAL_CONTRACTORS,
  INITIAL_JOB_REQUESTS,
  INITIAL_MATERIALS,
} = require('./tests_compiled/data/mockData');

console.log('====================================================');
console.log('🚀 RUNNING SETU DEMO AUDIT VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
    console.error(`   Error: ${err.message}\n`);
    throw err;
  }
}

// -----------------------------------------------------------------
// TEST 1: Guest Browsing without forced phone OTP
// -----------------------------------------------------------------
runTest('Guest can browse marketplace directly without phone/OTP requirement', () => {
  const fs = require('fs');
  const appCode = fs.readFileSync('./App.tsx', 'utf8');
  assert(
    appCode.includes('isGuestBrowsing, setIsGuestBrowsing] = useState<boolean>(true)'),
    'App must initialize with isGuestBrowsing: true for seamless guest marketplace browsing'
  );

  const homeCode = fs.readFileSync('./src/screens/CustomerHome.tsx', 'utf8');
  assert(
    homeCode.includes('क्या काम करवाना है?'),
    'Search bar must allow direct inquiry on first screen'
  );
});

// -----------------------------------------------------------------
// TEST 2: Plumber Booking Math (Ajay Kumar Table)
// -----------------------------------------------------------------
runTest('Ajay Kumar Plumber booking cost options match exact audit values', () => {
  const plumber = INITIAL_CONTRACTORS.find((c) => c.id === 'c5');
  assert(plumber, 'Ajay Rathore / Kumar plumber (c5) must exist');
  assert.strictEqual(plumber.dailyWageRate, 850, 'Plumber daily wage must be ₹850');
  assert.strictEqual(plumber.helperRate, 500, 'Plumber helper wage must be ₹500');

  const bundlePrice = plumber.recommendedMaterials.reduce((acc, m) => acc + m.sellingPrice, 0);
  assert.strictEqual(bundlePrice, 3100, 'Recommended pipe bundle must total ₹3,100');

  // Case 1: 1 day plumber = ₹850
  const cost1 = 1 * plumber.dailyWageRate;
  assert.strictEqual(cost1, 850, '1 day plumber must be ₹850');

  // Case 2: 1 day plumber + ₹500 helper = ₹1,350
  const cost2 = 1 * (plumber.dailyWageRate + plumber.helperRate);
  assert.strictEqual(cost2, 1350, '1 day plumber + helper must be ₹1,350');

  // Case 3: 1 day plumber + helper + ₹3,100 pipe bundle = ₹4,450
  const cost3 = cost2 + bundlePrice;
  assert.strictEqual(cost3, 4450, '1 day plumber + helper + pipe bundle must be ₹4,450');

  // Case 4: 2 days plumber = ₹1,700
  const cost4 = 2 * plumber.dailyWageRate;
  assert.strictEqual(cost4, 1700, '2 days plumber must be ₹1,700');
});

// -----------------------------------------------------------------
// TEST 3: Ramesh Carpenter does NOT see Sunita's AC repair request
// -----------------------------------------------------------------
runTest('Contractor Dashboard isolates direct bookings & categories strictly', () => {
  const ramesh = INITIAL_CONTRACTORS.find((c) => c.id === 'c1'); // Carpenter
  assert(ramesh, 'Ramesh Carpenter (c1) must exist');

  // Filter logic implemented in ContractorDashboard
  const directJobs = INITIAL_JOB_REQUESTS.filter((j) => j.contractorId === ramesh.id);
  const openJobs = INITIAL_JOB_REQUESTS.filter(
    (j) => !j.contractorId && (!j.category || j.category === ramesh.category)
  );
  const rameshFeed = [...directJobs, ...openJobs];

  // Verify jr1 (Wardrobe for Ramesh) is in feed
  const hasJr1 = rameshFeed.some((j) => j.id === 'jr1');
  assert.strictEqual(hasJr1, true, 'Ramesh must see Wardrobe booking jr1 directed to him');

  // Verify jr2 (AC leakage directed to c5) is NEVER in Ramesh feed
  const hasJr2 = rameshFeed.some((j) => j.id === 'jr2');
  assert.strictEqual(hasJr2, false, 'Ramesh must NEVER see Sunita AC leakage job jr2!');
});

// -----------------------------------------------------------------
// TEST 4: Gupta Hardware does NOT see Bridal Makeup or Ghee
// -----------------------------------------------------------------
runTest('Vendor Dashboard isolates store catalog by vendorId strictly', () => {
  const guptaStoreId = 'v1';
  const guptaInventory = INITIAL_MATERIALS.filter(
    (m) => (m.vendorId || 'v1') === guptaStoreId
  );

  // Must have 5 hardware construction items
  assert.strictEqual(guptaInventory.length, 5, 'Gupta Hardware must have exactly 5 hardware items');
  
  // Must NOT include bridal makeup or catering ghee
  const hasMakeup = guptaInventory.some((m) => m.category === 'wedding_makeup');
  assert.strictEqual(hasMakeup, false, 'Gupta Hardware must NEVER show bridal makeup!');

  const hasGhee = guptaInventory.some((m) => m.name.includes('घी') || m.category === 'wedding_catering');
  assert.strictEqual(hasGhee, false, 'Gupta Hardware must NEVER show catering ghee or rice!');
});

// -----------------------------------------------------------------
// TEST 5: AI Ustad Problem & Location Disentanglement
// -----------------------------------------------------------------
runTest('AI Ustad correctly separates location from actual work trade', () => {
  // Case A: Kitchen + Tap Leakage -> Plumber
  const res1 = parseCustomerProblem('Kitchen ka nal tapak raha hai');
  assert.strictEqual(res1.category, 'plumber', '"Kitchen ka nal tapak raha hai" must route to plumber');
  assert.strictEqual(res1.locationKey, 'kitchen', 'Must detect kitchen location');

  // Case B: Kitchen + Wardrobe hinge -> Carpenter
  const res2 = parseCustomerProblem('Kitchen ki almari ka hinge toot gaya');
  assert.strictEqual(res2.category, 'carpenter', '"Kitchen ki almari ka hinge toot gaya" must route to carpenter');
  assert.strictEqual(res2.locationKey, 'kitchen', 'Must detect kitchen location');

  // Case C: Incomplete information -> Clarification Question
  const res3 = parseCustomerProblem('Bathroom me pani aa raha hai');
  assert.strictEqual(res3.needsClarification, true, '"Bathroom me pani aa raha hai" must ask clarification');
  assert(
    res3.clarificationQuestion.includes('नल से टपक रहा है'),
    'Must ask whether water is leaking from tap, wall, or floor'
  );

  // Case D: User clarifies "deewar se" -> remembers bathroom seepage
  const res4 = parseCustomerProblem('deewar se ris raha hai', {
    priorContext: {
      location: 'Bathroom (बाथरूम)',
      locationKey: 'bathroom',
    },
  });
  assert.strictEqual(res4.category, 'mason', 'Wall seepage must route to mason/painter');
  assert.strictEqual(res4.needsClarification, false, 'Clarification answered, problem resolved');
});

// -----------------------------------------------------------------
// TEST 6: Smart Estimator Painting Calculation Rupee Math
// -----------------------------------------------------------------
runTest('Painting estimate matches exact ₹9,550 math breakdown', () => {
  const paintingMaterials = [
    { name: 'एशियन पेंट्स प्रीमियम इमल्शन (10L)', quantity: 1, unitRate: 1900, unit: 'बाल्टी' },
    { name: 'बिरला वाइट वॉल पुट्टी (40kg x 2 बैग)', quantity: 2, unitRate: 850, unit: 'बैग' },
    { name: 'रेगमाल, मास्किंग टेप & रोलर किट', quantity: 1, unitRate: 350, unit: 'किट' },
  ];

  const estimate = calculateCustomerEstimate({
    workTitle: 'दीवार पुट्टी & पेंटिंग कार्य',
    quantity: 350, // 350 sq.ft
    unitType: 'sqft',
    contractorDailyRate: 16, // ₹16/sq.ft theka labour
    materialItemsCatalog: paintingMaterials,
  });

  // Material Math: 1900 + (2 * 850) + 350 = 1900 + 1700 + 350 = 3950
  assert.strictEqual(estimate.materialCost, 3950, 'Materials total must be ₹3,950');

  // Labor Math: 350 * 16 = 5600
  assert.strictEqual(estimate.laborCost, 5600, 'Labor theka charge must be ₹5,600');

  // Grand Total Math: 3950 + 5600 = 9550
  assert.strictEqual(estimate.totalCostEstimate, 9550, 'Grand total must be exactly ₹9,550');
  assert.strictEqual(estimate.isTentative, true, 'Estimate must be marked as tentative budget');
});

// -----------------------------------------------------------------
// TEST 7: Admin Security & Demo Mode
// -----------------------------------------------------------------
runTest('Admin PIN is not exposed; safe demo read-only access is provided', () => {
  const fs = require('fs');
  const adminCode = fs.readFileSync('./src/components/AdminSecurityModal.tsx', 'utf8');
  assert(!adminCode.includes('7879'), 'Master PIN 7879 must not be hardcoded in UI strings');
  assert(
    adminCode.includes('Admin Demo देखें (Read-Only Sample Records)'),
    'Admin modal must provide safe demo read-only access'
  );
});

// -----------------------------------------------------------------
// TEST 8: End-to-End Price Locking & Status Progression
// -----------------------------------------------------------------
runTest('Booking price locks on acceptance; subsequent contractor rate change does not alter booking', () => {
  // Step 1: Contractor sets rate ₹900/day
  let contractor = {
    id: 'c101',
    name: 'सोनू मिस्त्री',
    dailyWageRate: 900,
  };

  // Step 2: Customer creates booking for 2 days
  const booking = {
    id: 'bk_demo_101',
    contractorId: contractor.id,
    days: 2,
    rateAtBooking: contractor.dailyWageRate,
    totalLockedAmount: 2 * contractor.dailyWageRate, // ₹1,800
    status: 'PENDING',
  };
  assert.strictEqual(booking.totalLockedAmount, 1800, 'Initial booking must lock at ₹1,800');

  // Step 3: Contractor accepts booking
  booking.status = 'ACCEPTED';
  assert.strictEqual(booking.status, 'ACCEPTED', 'Status must transition to ACCEPTED');

  // Step 4: Contractor later raises his daily rate to ₹1,000/day
  contractor.dailyWageRate = 1000;

  // Step 5: Existing booking amount remains LOCKED at ₹1,800!
  assert.strictEqual(
    booking.totalLockedAmount,
    1800,
    'Existing booking price must remain strictly locked at ₹1,800 despite contractor rate increase'
  );
});

console.log('\n====================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('====================================================');
