/**
 * SETU Hardened Client API Service
 * Connects frontend screens to backend REST API with signed JWT authentication
 */

import { Platform } from 'react-native';

const isLocalhost =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');

const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.location?.origin &&
    !window.location.origin.includes('localhost:8081') &&
    !window.location.origin.includes('localhost:19006')
  ? `${window.location.origin}/api`
  : 'https://setu-1-nine.vercel.app/api';

let sessionAuthToken: string | null = null;

// Initialize token from storage if available
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
  try {
    sessionAuthToken = window.localStorage.getItem('setu_session_token');
  } catch (e) {
    // Ignore storage restrictions
  }
}

export const ApiService = {
  // Session Token Management
  setAuthToken: (token: string | null) => {
    sessionAuthToken = token;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('setu_session_token', token);
      } else {
        window.localStorage.removeItem('setu_session_token');
      }
    }
  },

  setAdminToken: (token: string) => {
    ApiService.setAuthToken(token);
  },

  getAuthToken: () => sessionAuthToken,

  clearAuthToken: () => {
    sessionAuthToken = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('setu_session_token');
    }
  },

  // Helper for auth headers
  getHeaders: (customHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    if (sessionAuthToken) {
      headers['Authorization'] = `Bearer ${sessionAuthToken}`;
    }
    return headers;
  },

  // 1. Health check
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.log('[API] Backend offline or unreachable:', err);
      return null;
    }
  },

  // 2. Fetch Contractors
  getContractors: async (category?: string, rateType?: string) => {
    try {
      const query = new URLSearchParams();
      if (category && category !== 'all') query.append('category', category);
      if (rateType && rateType !== 'ALL') query.append('rateType', rateType);

      const res = await fetch(`${API_BASE_URL}/contractors?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch contractors');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.log('[API] getContractors error:', err);
      return null;
    }
  },

  // 3. Update Contractor Profile & Rate Card (Owner Protected)
  updateContractorProfile: async (id: string, updates: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contractors/${id}/profile`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      console.log('[API] updateContractorProfile error:', err);
      return { success: false, error: 'सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  // 4. Partner Registration
  registerPartner: async (partnerData: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/partners/register`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify(partnerData),
      });
      return await res.json();
    } catch (err) {
      console.log('[API] registerPartner error:', err);
      return { success: false, error: 'पंजीकरण विफल: सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  // 5. Create Job / Booking (Idempotent)
  createBooking: async (bookingData: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify(bookingData),
      });
      return await res.json();
    } catch (err) {
      console.log('[API] createBooking error:', err);
      return { success: false, error: 'बुकिंग दर्ज नहीं हो सकी।' };
    }
  },

  // 6. Quotation Flow: Contractor sends formal quotation
  sendQuotation: async (bookingId: string, quoteDetails: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/quote`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify(quoteDetails),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'कोटेशन भेजने में त्रुटि।' };
    }
  },

  // 7. Quotation Flow: Customer approves quote (Price Lock)
  approveQuotation: async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/approve-quote`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'कोटेशन स्वीकार करने में त्रुटि।' };
    }
  },

  // 8. Quotation Flow: Propose revised quotation for extra work
  reviseQuotation: async (bookingId: string, revisionDetails: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/revise-quote`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify(revisionDetails),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'संशोधन भेजने में त्रुटि।' };
    }
  },

  // 9. Quotation Flow: Customer responds to revised quote
  respondRevision: async (bookingId: string, accept: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/respond-revision`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ accept }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'संशोधन प्रतिक्रिया में त्रुटि।' };
    }
  },

  // 10. Complete Booking with OTP Verification
  completeBooking: async (bookingId: string, otp: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ otp }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'पूर्णता सत्यापन में त्रुटि।' };
    }
  },

  // 11. Admin Metrics (Protected)
  getAdminMetrics: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: ApiService.getHeaders(),
      });
      if (!res.ok) throw new Error('Admin access denied');
      return await res.json();
    } catch (err) {
      console.log('[API] getAdminMetrics error:', err);
      return null;
    }
  },

  // 12. Admin KYC Action
  actionKyc: async (kycId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/kyc/action`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ id: kycId, action }),
      });
      return await res.json();
    } catch (err) {
      console.log('[API] actionKyc error:', err);
      return null;
    }
  },

  // 13. File Upload to Server
  // Strict: returns error on failure, never masks failure with dummy stock photos!
  uploadFile: async (
    base64Data: string,
    filename = 'site_media.jpg',
    type: 'portfolio' | 'kyc' | 'avatar' = 'portfolio',
    isPrivate = false
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ imageBase64: base64Data, filename, type, isPrivate }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'फाइल अपलोड विफल रहा।');
      }
      const data = await res.json();
      let fullUrl = data.url;
      if (fullUrl && fullUrl.startsWith('/uploads/')) {
        const origin = API_BASE_URL.replace(/\/api$/, '');
        fullUrl = `${origin}${fullUrl}`;
      }
      return { ...data, fullUrl };
    } catch (err: any) {
      console.error('[API] uploadFile error:', err);
      return {
        success: false,
        error: err.message || 'फाइल सर्वर पर अपलोड नहीं हो सकी। कृपया पुनः प्रयास करें।',
      };
    }
  },

  // 14. AI Multimodal Vision Diagnosis (Dual Engine: Backend REST + Client-Side Direct Gemini Fallback)
  diagnoseVision: async (imageBase64: string, userQuery = '', locality = 'भोपाल', language = 'hi') => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/diagnose-vision`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ imageBase64, userQuery, locality, language }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
      if (data?.error && !data.error.includes('AI सर्वर')) {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.log('[API] Backend diagnoseVision unreachable, activating direct Gemini:', err?.message);
    }

    // Direct Client-Side Google Gemini Multimodal Vision Fallback
    const clientKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (clientKey && imageBase64) {
      try {
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const mimeType = matches && matches[1] ? matches[1] : 'image/jpeg';
        const cleanBase64 = matches && matches[2] ? matches[2] : imageBase64;

        const querySection = userQuery ? `User notes / question: "${userQuery}"\n` : '';
        const promptText = `You are 'Ustad SETU', India's senior home renovation, interior design, and construction expert in ${locality}, MP.
Analyze this photo carefully. Determine whether the user wants a Space Design / Renovation (e.g. Almirah, Wardrobe, Kitchen, Bathroom, Elevation, Wall, Lighting) or a Repair problem.
${querySection}
If unreadable or black, return: { "unreadable": true, "error": "फोटो साफ नहीं है, कृपया लाइट में साफ फोटो लें या समस्या का विवरण लिखें।" }
Otherwise return PURE JSON:
{
  "unreadable": false,
  "isDesignRequest": boolean,
  "projectType": "wardrobe" | "kitchen" | "masonry" | "plumbing" | "electrical" | "repair",
  "problemTitle": "string in Hindi",
  "spaceObservationHindi": "string in Hindi",
  "estimatedDimensions": { "lengthFt": 8, "widthFt": 7, "approxSqFt": 56 },
  "proposedDesignHindi": "string in Hindi",
  "recommendedFinish": "TEAK_WOOD" | "ACRYLIC" | "PU_GLOSS" | "LAMINATE" | "RED_BRICK" | "CPVC_SDR11" | "FR_COPPER",
  "finishStyleName": "string in Hindi",
  "visibleObservation": "string in Hindi",
  "inferredCause": "string in Hindi",
  "tradeCategory": "carpenter" | "plumber" | "electrician" | "mason" | "painter",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "isSafetyHazard": false,
  "safetyMessage": "string in Hindi",
  "cabinetBreakdown": [ { "item": "string", "qty": 1, "description": "string in Hindi" } ],
  "requiredParts": [ { "name": "string", "approxRate": 100, "unit": "string", "total": 1000 } ],
  "estimatedLaborCharge": 5000,
  "totalEstimate": 25000,
  "diySteps": [ "string" ],
  "ustadAdvice": "string in Hindi",
  "ustadGuidanceHindi": "string in conversational, friendly Bhopali Hindi answering client questions and explaining design & cost.",
  "estimatedFixTime": "string in Hindi"
}`;

        for (const model of ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest']) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientKey}`;
            const geminiResp = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }, { inline_data: { mime_type: mimeType, data: cleanBase64 } }] }],
                generationConfig: { response_mime_type: 'application/json' },
              }),
            });

            if (geminiResp.ok) {
              const gData = await geminiResp.json();
              const rawJson = gData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawJson) {
                const parsed = JSON.parse(rawJson);
                if (parsed.unreadable) {
                  return { success: false, error: parsed.error };
                }
                return { success: true, engine: `Client Google Gemini Vision (${model})`, diagnosis: parsed };
              }
            }
          } catch (mErr) {
            // try next model in fallback list
          }
        }
      } catch (geminiClientErr: any) {
        console.log('[API] Client-side Gemini error:', geminiClientErr?.message);
      }
    }

    return {
      success: false,
      error: 'AI सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।',
    };
  },

  // 15. Unified SETU Master Artisan Chat Engine (/api/ai/setu-chat)
  setuChat: async (params: {
    messages: { role: 'user' | 'assistant'; text: string; hasImage?: boolean }[];
    imageBase64?: string;
    locality?: string;
    language?: string;
    platformContractors?: any[];
    platformMaterials?: any[];
    selectedProducts?: any[];
    sceneContextPrompt?: string;
    regenerateSeed?: number;
  }) => {
    const {
      messages,
      imageBase64 = '',
      locality = 'भोपाल',
      language = 'hi',
      platformContractors = [],
      platformMaterials = [],
      selectedProducts = [],
      sceneContextPrompt = '',
      regenerateSeed = 0,
    } = params;

    try {
      const res = await fetch(`${API_BASE_URL}/ai/setu-chat`, {
        method: 'POST',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({
          messages,
          imageBase64,
          locality,
          language,
          platformContractors,
          platformMaterials,
          selectedProducts,
          sceneContextPrompt,
          regenerateSeed,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json;
      }
      if (json?.error && !json.error.includes('AI सर्वर')) {
        return { success: false, error: json.error };
      }
    } catch (err: any) {
      console.log('[API] Backend setu-chat unreachable, trying client Gemini:', err?.message);
    }

    // Direct Client Fallback when running offline / Expo dev without backend server
    const clientKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (clientKey) {
      try {
        const latestMsg = messages[messages.length - 1]?.text || '';
        const historyStr = messages
          .slice(-8)
          .map((m) => `${m.role === 'assistant' ? 'SETU' : 'Customer'}: ${m.text}${m.hasImage ? ' [Photo Attached]' : ''}`)
          .join('\n');

        const langNote =
          language === 'en'
            ? 'Write replyText in clear polite Indian English.'
            : 'Write replyText in simple, warm conversational Hindi/Hinglish.';

        const selectedNote =
          selectedProducts.length > 0
            ? `\nCUSTOMER SELECTED SUPPLIER ITEMS (MUST USE EXACT PRICES & DESCRIPTORS IN QUOTATION & PHOTOREALISTIC PROMPT):\n${JSON.stringify(selectedProducts.map((p) => ({ name: p.name, brand: p.brand, tier: p.tier, price: p.price, unit: p.unit, qty: p.approxQtyMultiplier || 1, visualDescriptor: p.visualDescriptor })))}\n`
            : '';

        const sceneNote = sceneContextPrompt ? `\nPRIOR SCENE ANCHORS: "${sceneContextPrompt}"\n` : '';

        const promptText = `You are "SETU", India's master artisan & home renovation/construction showroom expert in ${locality}.
${langNote}
Strictly handle home construction, modular kitchen, wardrobe, bed, repair, plumbing, electrical, painting, masonry, rates, quotations, materials, and hiring.
Auto-detect "repair" (no material picker, direct cost/parts/pro) vs "build_design" (if no selectedProducts passed & user hasn't confirmed final render yet: set showMaterialPicker=true, visualPreviewReady=false, detect productPickerProjectType among "kitchen"|"wardrobe"|"bedroom"|"house"|"bathroom"|"electrical"|"painting" and capture architectural sceneContextPrompt in English; if selectedProducts passed or user asked to render: set showMaterialPicker=false, visualPreviewReady=true, write rich 50-word English DSLR photography photorealisticPrompt combining sceneContextPrompt + selected materials!) vs "rate_quote".
Contractors: ${JSON.stringify(platformContractors.slice(0, 8).map((c) => ({ id: c.id, name: c.name, category: c.category, dailyWageRate: c.dailyWageRate, contractUnitRate: c.contractUnitRate })))}
Materials: ${JSON.stringify(platformMaterials.slice(0, 8).map((m) => ({ id: m.id, name: m.name, brand: m.brand, category: m.category, price: m.sellingPrice, storeName: m.storeName })))}
${selectedNote}${sceneNote}History:\n${historyStr}\nLatest: "${latestMsg || (imageBase64 ? '[Customer uploaded photo without text — inspect photo and proactively respond!]' : '')}"
Return PURE JSON with: unreadable(boolean), intentMode("repair"|"build_design"|"rate_quote"), tradeCategory("carpenter"|"plumber"|"electrician"|"mason"|"painter"|"all"), replyText(string), showMaterialPicker(boolean), productPickerProjectType("kitchen"|"wardrobe"|"bedroom"|"house"|"bathroom"|"electrical"|"painting"), sceneContextPrompt(string), isSafetyHazard(boolean), safetyMessage(string), visualPreviewReady(boolean), photorealisticPrompt(string), visualPlan({designType,title,finishLabel,dimensionsLabel,afterCaption}), quotation({includeQuotation,projectTitle,dimensionsSummary,estimatedDuration,items:[{name,qtyRate,amount}],materialTotal,laborTotal,grandTotal,budgetFitNote}), upsellPrompt(string), quickReplies(string[]), recommendedMaterialIds(string[]), websiteAction("NONE"|"BOOK_PRO"|"ORDER_MATERIAL"|"POST_BUDGET_JOB").`;

        const parts: any[] = [{ text: promptText }];
        if (imageBase64) {
          const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          parts.push({
            inline_data: {
              mime_type: (matches && matches[1]) || 'image/jpeg',
              data: (matches && matches[2]) || imageBase64,
            },
          });
        }

        for (const model of ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite']) {
          try {
            const gResp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts }],
                  generationConfig: { response_mime_type: 'application/json' },
                }),
              }
            );
            if (gResp.ok) {
              const gJson = await gResp.json();
              const rawText = gJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                const parsed = JSON.parse(rawText);
                if (parsed.unreadable) {
                  return { success: false, error: parsed.error || 'फोटो साफ नहीं है, कृपया दोबारा लें।' };
                }
                const seed = regenerateSeed || Math.floor(Math.random() * 900000) + 100;
                const pPrompt = parsed.photorealisticPrompt || (parsed.visualPlan ? `Real architectural interior photograph of ${parsed.visualPlan.title}, ${parsed.visualPlan.finishLabel}, DSLR photography, no text` : '');
                const renderedImageUrl =
                  parsed.visualPreviewReady && pPrompt
                    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(pPrompt)}?width=800&height=540&model=flux&nologo=true&seed=${seed}`
                    : null;
                return { success: true, engine: `SETU (${model})`, data: { ...parsed, renderedImageUrl } };
              }
            }
          } catch {
            // fallback to next candidate model
          }
        }
      } catch (clientErr) {
        console.log('[API] Client setuChat error:', clientErr);
      }
    }

    return {
      success: false,
      error: 'SETU से संपर्क नहीं हो सका। कृपया इंटरनेट या सर्वर जांचें।',
    };
  },
};
