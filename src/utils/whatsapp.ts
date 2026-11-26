import { Linking, Platform } from 'react-native';
import { showAppAlert } from './appAlert';

/**
 * Clean phone number to Indian 10-digit international format (+91XXXXXXXXXX)
 * Returns empty string if no valid contact phone was provided (never routes to a hardcoded third party!).
 */
export function formatIndianPhoneNumber(phone?: string | null): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return '';
}

/**
 * Open WhatsApp chat with pre-filled message seamlessly on Web & Native Android/iOS.
 * If recipient phone is missing/unverified, opens WhatsApp's contact picker share URL instead of messaging a hardcoded number.
 */
export async function openWhatsAppChat(phone: string | undefined | null, message: string): Promise<void> {
  const cleanPhone = formatIndianPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);

  const nativeUrl = cleanPhone
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`
    : `whatsapp://send?text=${encodedText}`;
  const webUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(webUrl, '_blank');
    }
    return;
  }

  // Native Mobile (Android / iOS)
  try {
    const supported = await Linking.canOpenURL(nativeUrl);
    if (supported) {
      await Linking.openURL(nativeUrl);
    } else {
      // Fallback to web URL inside mobile browser
      await Linking.openURL(webUrl);
    }
  } catch (err) {
    console.warn('[WhatsApp] Native deep-link failed, falling back to web:', err);
    try {
      await Linking.openURL(webUrl);
    } catch {
      showAppAlert(
        'WhatsApp नहीं खुला',
        'कृपया जांचें कि आपके फ़ोन में WhatsApp इनस्टॉल है या नहीं।'
      );
    }
  }
}

/**
 * Generate formatted WhatsApp message for AI Doctor Consultation to Contractor
 */
export function formatAiDoctorWhatsAppMessage(params: {
  contractorName: string;
  problemTitle: string;
  diagnosis: string;
  estimatedCost: string;
  partsNeeded: string[];
  userLocation: string;
  mediaUrl?: string;
}): string {
  const partsList = params.partsNeeded.map((p) => `  • ${p}`).join('\n');
  return `नमस्ते ${params.contractorName} जी,
मैंने SETU ऐप पर आपकी प्रोफाइल देखी है।

🤖 *SETU AI उस्ताद (लाइव वीडियो रिपोर्ट)*:
📍 *लोकेशन:* ${params.userLocation}
🔍 *समस्या:* ${params.problemTitle}
🛠️ *AI निदान:* ${params.diagnosis}
💰 *अनुमानित खर्च:* ${params.estimatedCost}

📦 *ज़रूरी सामान:*
${partsList}
${params.mediaUrl ? `\n📸 *साइट फोटो/वीडियो:* ${params.mediaUrl}` : ''}

क्या आप इसे देखने आ सकते हैं? कृपया अपनी विज़िट का समय और चार्ज बताएं।
धन्यवाद! (SETU ऐप के माध्यम से)`;
}

/**
 * Generate formatted WhatsApp message for 3D Modular Kitchen / Wardrobe Quote
 */
export function format3DStudioWhatsAppMessage(params: {
  contractorName: string;
  projectType: string;
  layoutName: string;
  finishType: string;
  dimensions: string;
  approxSqFt: number;
  estimatedTotal: string;
  userLocation: string;
}): string {
  return `नमस्ते ${params.contractorName} जी,
मैंने SETU 3D स्टूडियो में अपने घर का डिज़ाइन तैयार किया है:

🎨 *प्रोजेक्ट:* ${params.projectType}
📐 *लेआउट:* ${params.layoutName} (${params.dimensions})
✨ *फिनिश:* ${params.finishType}
📏 *कुल माप:* लगभग ${params.approxSqFt} sq.ft
💵 *SETU अनुमानित बजट:* ${params.estimatedTotal}
📍 *साइट लोकेशन:* ${params.userLocation}

मैं आपसे साइट विज़िट करवा कर काम शुरू करवाना चाहता हूँ। कृपया बताएं आप कब आ सकते हैं?
धन्यवाद!`;
}
