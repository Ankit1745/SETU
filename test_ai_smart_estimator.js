/**
 * SETU AI Ustad, Photo/Video Doctor & Smart Estimator Verification Suite
 * Validates the 6 mandatory tests specified by the user:
 * 
 * Test 1: "Kitchen ka nal tapak raha hai" -> Plumber (Disentangles Location vs Problem)
 * Test 2: "Kitchen ki almari ka hinge toot gaya" -> Carpenter (Disentangles Location vs Problem)
 * Test 3: "Bathroom me pani aa raha hai" -> Clarification question; follow-up "deewar se" maintains context
 * Test 4: Blurry photo or vision service offline -> Clear boundary, no fabricated tap diagnosis
 * Test 5: ₹900/day x 2 days -> ₹1,800 labour; empty/null rate -> "Contractor से quote लें (भाव पूछें)"
 * Test 6: "Switchboard se chingari aa rahi hai" -> High-risk safety alert, electrician category, zero DIY steps
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const assert = require('assert');

// 1. Auto-compile TypeScript module if dist is missing
if (!fs.existsSync('./dist/constructionAI.js')) {
  execSync('npx tsc src/services/constructionAI.ts --ignoreConfig --module commonjs --target es2020 --outDir ./dist');
}

const {
  parseCustomerProblem,
  analyzeConstructionQuery,
  diagnoseVisualProblem,
  calculateCustomerEstimate,
  formatVisualDiagnosisResult,
} = require('./dist/constructionAI.js');

// 2. Load Backend Server
process.env.ALLOW_LOCAL_FALLBACK = 'true';
const app = require('./backend/server');

let server;
const PORT = 5066;

function request(method, reqPath, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: reqPath,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed = responseBody;
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {}
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

const testResults = [];

function recordTest(name, passed, details = '') {
  testResults.push({ name, passed, details });
  const icon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} ${name}${details ? ' - ' + details : ''}`);
}

async function runAllTests() {
  console.log('\n=============================================================');
  console.log('🚀 RUNNING SETU AI USTAD & ESTIMATOR MANDATORY TEST SUITE');
  console.log('=============================================================\n');

  try {
    // ------------------------------------------------------------------------
    // TEST 1: "Kitchen ka nal tapak raha hai" -> Plumber
    // ------------------------------------------------------------------------
    console.log('🔍 Testing Test 1: Location vs Problem Disentanglement (Kitchen Tap Dripping)...');
    const t1 = parseCustomerProblem('Kitchen ka nal tapak raha hai');
    const t1Analysis = analyzeConstructionQuery('Kitchen ka nal tapak raha hai');

    const t1Passed =
      t1.category === 'plumber' &&
      t1.locationKey === 'kitchen' &&
      t1.understoodSummary.includes('किचन') &&
      t1Analysis.category === 'plumber';

    recordTest(
      'Test 1: "Kitchen ka nal tapak raha hai" → Plumber',
      t1Passed,
      `Category: ${t1.category}, Location: ${t1.location}, Action: ${t1.actionCategoryButton}`
    );

    // ------------------------------------------------------------------------
    // TEST 2: "Kitchen ki almari ka hinge toot gaya" -> Carpenter
    // ------------------------------------------------------------------------
    console.log('\n🔍 Testing Test 2: Location vs Problem Disentanglement (Kitchen Wardrobe Hinge)...');
    const t2 = parseCustomerProblem('Kitchen ki almari ka hinge toot gaya');
    const t2Analysis = analyzeConstructionQuery('Kitchen ki almari ka hinge toot gaya');

    const t2Passed =
      t2.category === 'carpenter' &&
      t2.locationKey === 'kitchen' &&
      t2.understoodSummary.includes('अलमारी') &&
      t2Analysis.category === 'carpenter';

    recordTest(
      'Test 2: "Kitchen ki almari ka hinge toot gaya" → Carpenter',
      t2Passed,
      `Category: ${t2.category}, Location: ${t2.location}, Action: ${t2.actionCategoryButton}`
    );

    // ------------------------------------------------------------------------
    // TEST 3: Ambiguous info asks clarification; follow-up maintains context
    // ------------------------------------------------------------------------
    console.log('\n🔍 Testing Test 3: Clarification & Multi-Turn Context Continuity...');
    // Turn 1: Incomplete query
    const t3Turn1 = parseCustomerProblem('Bathroom me pani aa raha hai');
    const t3Turn1Passed =
      t3Turn1.needsClarification === true &&
      t3Turn1.clarificationQuestion.includes('पानी नल से टपक रहा है, दीवार से रिस रहा है या फर्श पर जमा हो रहा है') &&
      Array.isArray(t3Turn1.clarificationOptions) &&
      t3Turn1.clarificationOptions.length === 3;

    // Turn 2: Follow-up response "deewar se" using previous turn context
    const t3Turn2 = parseCustomerProblem('deewar se', t3Turn1);
    const t3Turn2Passed =
      t3Turn2.needsClarification === false &&
      t3Turn2.locationKey === 'bathroom' &&
      t3Turn2.category === 'plumber' &&
      t3Turn2.understoodSummary.includes('दीवार से पानी रिस रहा है') &&
      t3Turn2.understoodSummary.includes('Bathroom (बाथरूम)');

    recordTest(
      'Test 3a: "Bathroom me pani aa raha hai" → Asks Clarification Question',
      t3Turn1Passed,
      `Question: "${t3Turn1.clarificationQuestion}"`
    );

    recordTest(
      'Test 3b: Follow-up "deewar se" maintains context → Bathroom Concealed Seepage / Plumber',
      t3Turn2Passed,
      `Understood: "${t3Turn2.understoodSummary}"`
    );

    // ------------------------------------------------------------------------
    // TEST 4: Blurry photo or offline vision service -> Clear boundary, no fake diagnosis
    // ------------------------------------------------------------------------
    console.log('\n🔍 Testing Test 4: Blurry Photo Boundary & Vision Service Failure Handling...');
    
    // 4a. Client heuristics return null for blurry/unclear queries (no fake tap diagnosis!)
    const t4ClientBlurry = diagnoseVisualProblem('blurry photo dark image', undefined, 'photo');
    const t4ClientPassed = t4ClientBlurry === null;

    recordTest(
      'Test 4a: Client Engine returns null for blurry/unclear photo (No fake tap diagnosis)',
      t4ClientPassed,
      `Result: ${t4ClientBlurry === null ? 'null (boundary preserved)' : 'unexpected fallback'}`
    );

    // 4b. Backend API rejects unreadable / missing photo with 400 error
    console.log('Starting backend server on port', PORT, 'to test /api/ai/diagnose-vision...');
    server = http.createServer(app).listen(PORT);
    await new Promise((r) => setTimeout(r, 600));

    const t4ApiResp = await request('POST', '/api/ai/diagnose-vision', {
      imageBase64: '',
      userQuery: '',
    });

    const t4ApiBlurryResp = await request('POST', '/api/ai/diagnose-vision', {
      imageBase64: 'data:image/jpeg;base64,blurrydata',
      userQuery: 'blurry dark photo',
    });

    const t4ApiPassed =
      t4ApiResp.status === 400 &&
      t4ApiBlurryResp.status === 400 &&
      t4ApiBlurryResp.body?.error?.includes('फोटो साफ नहीं है या समस्या स्पष्ट नहीं है');

    recordTest(
      'Test 4b: Backend Vision API returns 400 error on blurry photo (No fake tap diagnosis)',
      t4ApiPassed,
      `HTTP Status: ${t4ApiBlurryResp.status}, Error: "${t4ApiBlurryResp.body?.error}"`
    );

    // ------------------------------------------------------------------------
    // TEST 5: SETU Contractor Rate Math (₹900/day x 2 days = ₹1,800; null = Quote requested)
    // ------------------------------------------------------------------------
    console.log('\n🔍 Testing Test 5: Smart Estimator Contractor-Driven Rate Calculation...');
    
    // 5a. Contractor rate ₹900/day x 2 days = ₹1,800 labour
    const t5WithRate = calculateCustomerEstimate({
      workTitle: 'नल रिपेयर & प्लंबिंग कार्य',
      quantity: 2,
      unitType: 'day',
      contractorDailyRate: 900,
      materialItemsCatalog: [
        { name: 'ब्रास स्पिंडल', quantity: 1, unitRate: 85, unit: 'पीस' },
      ],
    });

    const t5WithRatePassed =
      t5WithRate.laborCost === 1800 &&
      t5WithRate.laborCostText === '₹1,800' &&
      t5WithRate.materialCost === 85 &&
      t5WithRate.totalCostEstimate === 1885 &&
      t5WithRate.isTentative === true;

    recordTest(
      'Test 5a: ₹900/day × 2 days → ₹1,800 labour + verified material ₹85 = ₹1,885',
      t5WithRatePassed,
      `Labor: ${t5WithRate.laborCostText}, Total: ${t5WithRate.totalCostText}, Tentative: ${t5WithRate.isTentative}`
    );

    // 5b. Contractor rate null / empty -> "Contractor से quote लें (भाव पूछें)"
    const t5NullRate = calculateCustomerEstimate({
      workTitle: 'सिविल चिनाई कार्य',
      quantity: 3,
      unitType: 'day',
      contractorDailyRate: null,
      materialItemsCatalog: [],
    });

    const t5NullRatePassed =
      t5NullRate.laborCost === null &&
      t5NullRate.laborCostText.includes('Contractor से quote लें (भाव पूछें)') &&
      t5NullRate.isTentative === true;

    recordTest(
      'Test 5b: Null/Empty Rate → "Contractor से quote लें (भाव पूछें)" (No auto-filled rate)',
      t5NullRatePassed,
      `Labor: "${t5NullRate.laborCostText}", Details: "${t5NullRate.laborDetails}"`
    );

    // ------------------------------------------------------------------------
    // TEST 6: "Switchboard se chingari aa rahi hai" -> Safety message & Electrician (No DIY)
    // ------------------------------------------------------------------------
    console.log('\n🔍 Testing Test 6: High-Risk Electrical Hazard & Safety Handling...');
    const t6 = parseCustomerProblem('Switchboard se chingari aa rahi hai');
    const t6Visual = diagnoseVisualProblem('Switchboard se chingari aa rahi hai', undefined, 'photo');

    const t6Passed =
      t6.isSafetyHazard === true &&
      t6.category === 'electrician' &&
      t6.safetyMessage.includes('तुरंत मुख्य DP / MCB (मेन स्विच) बंद करें') &&
      t6Visual !== null &&
      t6Visual.isSafetyHazard === true &&
      Array.isArray(t6Visual.diySteps) &&
      t6Visual.diySteps.length === 0; // DIY steps suppressed!

    recordTest(
      'Test 6: "Switchboard se chingari aa rahi hai" → Safety alert & Electrician (DIY suppressed)',
      t6Passed,
      `Hazard: ${t6.isSafetyHazard}, DIY Steps: ${t6Visual?.diySteps.length}, Message: "${t6.safetyMessage}"`
    );

    // ------------------------------------------------------------------------
    // TEST SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n=============================================================');
    console.log('📊 TEST EXECUTION SUMMARY:');
    const total = testResults.length;
    const passed = testResults.filter((r) => r.passed).length;
    const failed = total - passed;
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log('=============================================================\n');

    if (failed > 0) {
      console.error(`❌ ${failed} test(s) failed.`);
      process.exit(1);
    } else {
      console.log('🎉 ALL 6 MANDATORY AUDIT & AI TESTS PASSED PERFECTLY!');
      if (server) server.close();
      process.exit(0);
    }
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runAllTests();
