import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';

import {
  diagnoseVisualProblem,
  calculate3DSpaceDesign,
  VisualProblemDiagnosis,
  SpaceDesign3D,
  VISUAL_PROBLEM_SCENARIOS,
} from '../services/constructionAI';
import { ApiService } from '../services/api';
import {
  openWhatsAppChat,
  formatAiDoctorWhatsAppMessage,
  format3DStudioWhatsAppMessage,
} from '../utils/whatsapp';
import { pickImageFromGallery, capturePhotoFromCamera } from '../utils/mediaPicker';
import { useResponsive } from '../hooks/useResponsive';

let _visionDiagSeq = 0;
function nextVisionDiagnosisId(): string {
  return `vision_${Date.now()}_${++_visionDiagSeq}`;
}

export interface AIDesignConsultation {
  isDesign: boolean;
  projectType: 'wardrobe' | 'kitchen' | 'masonry' | 'plumbing' | 'electrical' | 'repair';
  title: string;
  spaceObservation: string;
  dimensions: { lengthFt: number; widthFt: number; approxSqFt: number };
  proposedDesign: string;
  finishStyleName: string;
  cabinetBreakdown: Array<{ item: string; qty: number; description: string }>;
  materialBreakdown: Array<{ name: string; approxRate: number; unit: string; total?: number }>;
  estimatedLaborCharge: number;
  totalEstimate: number;
  ustadGuidance: string;
  estimatedFixTime?: string;
}

export const QUICK_PROMPTS = [
  { label: '🗄️ यहाँ अलमारी बनानी है', query: 'इस दीवार पर 3-डोर मॉडर्न अलमारी बनवानी है, स्पेस नाप और खर्च बताएं।' },
  { label: '🍳 यहाँ मॉड्यूलर किचन कैसा रहेगा?', query: 'यहाँ L-शेप मॉड्यूलर किचन बनवाना है, क्या साइज और बजट रहेगा?' },
  { label: '💰 कम बजट में क्या विकल्प है?', query: 'कम से कम बजट में यहाँ क्या और कैसे बन सकता है?' },
  { label: '⏱️ बनने में कितने दिन लगेंगे?', query: 'यह काम पूरा होने में कारीगर को कितने दिन लगेंगे?' },
];

export interface TradeVisualPreset {
  id: string;
  trade: 'kitchen' | 'wardrobe' | 'masonry' | 'plumbing' | 'electrical';
  title: string;
  styleName: string;
  renderUrl: string;
  rawSpaceUrl: string;
  description: string;
  finishKey: string;
}

export const TRADE_VISUAL_PRESETS: Record<string, TradeVisualPreset[]> = {
  kitchen: [
    {
      id: 'k_teak',
      trade: 'kitchen',
      title: 'प्रीमियम टीकवुड & ब्लैक ग्रेनाइट L-शेप',
      styleName: 'नेचुरल टीकवुड & मार्बल',
      renderUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'L-शेप मॉड्यूलर काउंटर, 45kg सॉफ्ट क्लोज ड्रॉअर्स, चिमनी व LED प्रोफाइल लाइट',
      finishKey: 'TEAK_WOOD',
    },
    {
      id: 'k_acrylic',
      trade: 'kitchen',
      title: 'मॉडर्न व्हाइट ऐक्रेलिक & क्वार्ट्ज स्लैब',
      styleName: '1.5mm हाई-ग्लॉस ऐक्रेलिक',
      renderUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'सेंचुरी BWP मरीन प्लाई, स्क्रैच-रेसिस्टेंट ग्लॉस और हाइड्रॉलिक लिफ्ट-अप कैबिनेट',
      finishKey: 'ACRYLIC',
    },
    {
      id: 'k_italian',
      trade: 'kitchen',
      title: 'इटैलियन मिनिमलिस्ट मैट चारकोल',
      styleName: 'इटैलियन PU लक्जरी',
      renderUrl: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'हैंडल-लेस प्रोफ़ाइल शटर, इनबिल्ट पैंट्री और मैजिक कॉर्नर बास्केट्स',
      finishKey: 'PU_GLOSS',
    },
  ],
  wardrobe: [
    {
      id: 'w_walnut',
      trade: 'wardrobe',
      title: 'फ्लोर-टू-सीलिंग डार्क वॉलनट स्लाइडिंग वॉर्डरोब',
      styleName: 'डार्क वॉलनट स्लाइडिंग',
      renderUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: '3 हैवी-ड्यूटी स्लाइडिंग शटर, फुल-लेंथ ड्रेसिंग मिरर, 4 इनर ड्रॉअर विथ डिजिटल लॉक',
      finishKey: 'TEAK_WOOD',
    },
    {
      id: 'w_glass',
      trade: 'wardrobe',
      title: 'ग्लास शटर वॉक-इन वॉर्डरोब विथ वार्म LED',
      styleName: 'ग्लास शटर प्रोफाइल',
      renderUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'टिन्टेड टफन्ड ग्लास, एल्युमिनियम प्रोफाइल फ्रेम और ऑटोमैटिक सेंसर वार्डरोब लाइट्स',
      finishKey: 'ACRYLIC',
    },
  ],
  masonry: [
    {
      id: 'm_duplex',
      trade: 'masonry',
      title: 'मॉडर्न 2-मंजिला होम 3D एलिवेशन',
      styleName: '2-मंजिला आधुनिक मकान',
      renderUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
      description: '4 RCC लोड-बेयरिंग कॉलम, 9 इंच लाल पक्की ईंट दीवार, लिंटेल बीम और ग्लास बालकनी',
      finishKey: 'RED_BRICK',
    },
    {
      id: 'm_brick',
      trade: 'masonry',
      title: 'रस्टिक रेड ब्रिक एक्सेन्ट & कंक्रीट बीम',
      styleName: 'रेड ब्रिक स्ट्रक्चर',
      renderUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
      description: '1:4 सीमेंट-रेत अनुपात मजबूत चिनाई, डॉक्टर फिक्सिट DPC और 7 फीट प्रवेश द्वार',
      finishKey: 'RED_BRICK',
    },
  ],
  plumbing: [
    {
      id: 'p_luxury',
      trade: 'plumbing',
      title: 'कंसील्ड क्रोम डाइवर्टर & सीलिंग रेन शॉवर',
      styleName: 'लक्जरी कंसील्ड बाथरूम',
      renderUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80',
      description: '1" CPVC मेन इनफ्लो, हॉट & कोल्ड सेपरेट सर्किट, 4" SWR ढलान ड्रेन और एंटी-कॉकरोच ट्रैप',
      finishKey: 'CPVC_SDR11',
    },
    {
      id: 'p_basin',
      trade: 'plumbing',
      title: 'वॉल-हंग प्रीमियम बेसिन & बॉटल ट्रैप',
      styleName: 'वॉल-हंग बेसिन फिटिंग',
      renderUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80',
      description: 'ब्रास एल्बो सॉकेट, कंसील्ड स्टॉप कॉक और 100 PSI प्रेशर टेस्टेड पाइपलाइन',
      finishKey: 'CPVC_SDR11',
    },
  ],
  electrical: [
    {
      id: 'e_profile',
      trade: 'electrical',
      title: 'वार्म COB सीलिंग प्रोफाइल लाइटिंग & टीवी वॉल',
      styleName: 'कंसील्ड प्रोफाइल लाइटिंग',
      renderUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: '25mm PVC कंड्यूट पाइप, 4 sq.mm AC पावर लाइन, 12-मॉड्यूलर मेन स्विचबोर्ड और शुद्ध कॉपर अर्थिंग',
      finishKey: 'FR_COPPER',
    },
    {
      id: 'e_living',
      trade: 'electrical',
      title: 'स्मार्ट होम ऑटोमेशन & एम्बिएंट लाइटिंग',
      styleName: 'स्मार्ट होम स्विचबोर्ड',
      renderUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
      rawSpaceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'हैवेल्स 32A MCB डिस्ट्रीब्यूशन, सीलिंग फैन जंक्शन और LED बैकलाइटिंग सर्किट',
      finishKey: 'FR_COPPER',
    },
  ],
};

interface AIVideoDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  currentLocation: string;
  onOpenContractorCategory?: (category: string) => void;
}

export const AIVideoDoctorModal: React.FC<AIVideoDoctorModalProps> = ({
  visible,
  onClose,
  language,
  currentLocation,
  onOpenContractorCategory,
}) => {
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'video' | 'studio' | 'gyan'>('video');

  // ==========================================
  // FREEMIUM TOKEN / ZERO-DB LOCAL TRACKER
  // ==========================================
  const [dailyCredits, setDailyCredits] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const dateKey = new Date().toISOString().slice(0, 10);
        const todayKey = `setu_ai_credits_${dateKey}`;
        const saved = window.localStorage.getItem(todayKey);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          return Number.isFinite(parsed) ? Math.max(0, Math.min(10, parsed)) : 3;
        }
        window.localStorage.setItem(todayKey, '3');
      } catch {
        // Fallback in-memory
      }
    }
    return 3;
  });
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [demoBonusClaimed, setDemoBonusClaimed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const dateKey = new Date().toISOString().slice(0, 10);
        return window.localStorage.getItem(`setu_ai_bonus_${dateKey}`) === '1';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [viewportImgFailed, setViewportImgFailed] = useState<boolean>(false);
  const isScanningRef = useRef<boolean>(false);
  const visionScanSeqRef = useRef<number>(0);
  const voiceRecognitionRef = useRef<any>(null);

  useEffect(() => {
    const syncTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const dateKey = new Date().toISOString().slice(0, 10);
          const todayKey = `setu_ai_credits_${dateKey}`;
          const saved = window.localStorage.getItem(todayKey);
          if (saved !== null) {
            const parsed = parseInt(saved, 10);
            setDailyCredits(Number.isFinite(parsed) ? Math.max(0, Math.min(10, parsed)) : 3);
          } else {
            window.localStorage.setItem(todayKey, '3');
            setDailyCredits(3);
          }
          setDemoBonusClaimed(window.localStorage.getItem(`setu_ai_bonus_${dateKey}`) === '1');
        } catch {
          // Fallback in-memory
        }
      }
    }, 0);
    if (!visible && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    return () => {
      clearTimeout(syncTimer);
      if (voiceRecognitionRef.current) {
        try {
          voiceRecognitionRef.current.abort();
        } catch {
          // ignore
        }
        voiceRecognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [visible]);

  const consumeCredit = (): boolean => {
    if (dailyCredits <= 0) {
      setIsPaywallOpen(true);
      return false;
    }
    const next = Math.max(0, dailyCredits - 1);
    setDailyCredits(next);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const todayKey = `setu_ai_credits_${new Date().toISOString().slice(0, 10)}`;
        window.localStorage.setItem(todayKey, next.toString());
      } catch {
        // ignore
      }
    }
    return true;
  };

  // ==========================================
  // TAB 1: AI VIDEO CALL / VISUAL DOCTOR STATE
  // ==========================================
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(12);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('tap_leakage');
  const [diagnosisResult, setDiagnosisResult] = useState<VisualProblemDiagnosis | null>(null);
  const [aiDesignConsultation, setAiDesignConsultation] = useState<AIDesignConsultation | null>(null);
  const [visionError, setVisionError] = useState<string>('');
  const [sourceContext, setSourceContext] = useState<'photo' | 'video_frame' | 'sample_demo'>('photo');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string>('');
  const [attachedMediaBase64, setAttachedMediaBase64] = useState<string>('');
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // REAL LIVE CAMERA (WebRTC & Mobile Viewfinder)
  const videoRef = useRef<any>(null);
  const mediaStreamRef = useRef<any>(null);
  const [isCameraLive, setIsCameraLive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraPermissionError, setCameraPermissionError] = useState<string>('');

  const startRealCamera = useCallback(async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        setCameraPermissionError('');
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        mediaStreamRef.current = stream;
        setIsCameraLive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.log('[Camera] Error starting live camera:', err);
        setIsCameraLive(false);
        setCameraPermissionError('कृपया ब्राउज़र में कैमरा अनुमति दें ताकि AI उस्ताद आपकी समस्या लाइव देख सके।');
      }
    }
  }, [cameraFacing]);

  const stopRealCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraLive(false);
  }, []);

  const handleToggleFlipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Start real camera when modal is open and on video tab
  useEffect(() => {
    const camTimer = setTimeout(() => {
      if (visible && activeTab === 'video' && !attachedMediaUrl) {
        void startRealCamera();
      } else {
        stopRealCamera();
      }
    }, 0);
    return () => {
      clearTimeout(camTimer);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [visible, activeTab, attachedMediaUrl, startRealCamera, stopRealCamera]);

  // Capture real live camera frame & scan automatically (charges credit ONLY after valid capture)
  const handleCaptureLiveFrame = async () => {
    if (isScanningRef.current) return;

    // 1. If camera stream is live, grab canvas snapshot
    let frameBase64 = '';
    if (typeof document !== 'undefined' && videoRef.current && isCameraLive) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          frameBase64 = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.log('[Capture] Error capturing canvas frame:', e);
      }
    }

    if (frameBase64) {
      if (!consumeCredit()) return;
      setAttachedMediaUrl(frameBase64);
      setAttachedMediaBase64(frameBase64);
      stopRealCamera();
      await runAIVisionDiagnosis(frameBase64, customQuery, 'video_frame');
      ApiService.uploadFile(frameBase64, `live_snap_${Date.now()}.jpg`, 'portfolio').catch(() => {});
      return;
    }

    // 2. If camera stream is not live, open camera capture or gallery picker FIRST before consuming credit
    try {
      const captured = (await capturePhotoFromCamera()) || (await pickImageFromGallery());
      if (captured && captured.base64) {
        if (!consumeCredit()) return;
        setAttachedMediaUrl(captured.uri);
        setAttachedMediaBase64(captured.base64);
        await runAIVisionDiagnosis(captured.base64, customQuery, 'photo');
        ApiService.uploadFile(captured.base64, captured.name || `photo_${Date.now()}.jpg`, 'portfolio').catch(() => {});
      }
    } catch (err: any) {
      console.log('[Capture] Error capturing photo:', err);
    }
  };

  // AI Multimodal Vision Diagnosis Runner (Gemini Multimodal Vision Engine)
  const runAIVisionDiagnosis = async (imageBase64: string, query: string, ctx: 'photo' | 'video_frame' | 'sample_demo' = 'photo') => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    const scanSeq = ++visionScanSeqRef.current;
    setIsScanning(true);
    setVisionError('');
    setSourceContext(ctx);
    const activeUserQuery = (query || customQuery || '').trim();
    try {
      const apiResp = await ApiService.diagnoseVision(
        imageBase64,
        activeUserQuery,
        currentLocation || 'भोपाल',
        language
      );
      if (scanSeq !== visionScanSeqRef.current) return;

      if (apiResp?.success && apiResp.diagnosis) {
        const d = apiResp.diagnosis;

        // Guard repairs/hazards strictly so plumbing/electrical/wall crack photos never hijack into Wardrobe/Kitchen cards
        const isRepairSignal =
          Boolean(d.isSafetyHazard) ||
          d.projectType === 'repair' ||
          /लीक|leak|टपक|चिंगारी|spark|ट्रिप|trip|शॉर्ट|short circuit|जाम|jam|चटक|crack|सीलन|seepage|रिपेयर|repair|खराब|टूटा|broken|बदबू/i.test(activeUserQuery);

        const isDesign =
          !isRepairSignal &&
          (Boolean(d.isDesignRequest) ||
            /अलमारी|अलमरी|wardrobe|almirah|kitchen|किचन|मॉड्यूलर|modular|elevation|मॉडल|डिजाइन|design/i.test(activeUserQuery));

        if (isDesign) {
          const detectedTrade: 'wardrobe' | 'kitchen' | 'masonry' | 'plumbing' | 'electrical' =
            (d.projectType === 'wardrobe' || /अलमारी|अलमरी|wardrobe|almirah/i.test(activeUserQuery)) ? 'wardrobe' :
            (d.projectType === 'kitchen' || /kitchen|किचन/i.test(activeUserQuery)) ? 'kitchen' :
            (d.projectType === 'masonry' || /elevation|मकान|दीवार|brick/i.test(activeUserQuery)) ? 'masonry' :
            (d.projectType === 'plumbing' || /bath|बाथरूम|नल/i.test(activeUserQuery)) ? 'plumbing' :
            (d.projectType === 'electrical' || /light|लाइट|वायरिंग/i.test(activeUserQuery)) ? 'electrical' : 'wardrobe';

          const nextL = Number(d.estimatedDimensions?.lengthFt) || 8;
          const nextW = Number(d.estimatedDimensions?.widthFt) || 7;
          const nextFinish = d.recommendedFinish || (detectedTrade === 'wardrobe' ? 'TEAK_WOOD' : 'ACRYLIC');

          handleUpdateStudioDesign(detectedTrade, studioLayout, nextFinish, nextL, nextW);
          setVisualMode('after');

          const safeLabor = Math.max(0, Number(d.estimatedLaborCharge) || 12000);
          const safeTotal = Math.max(safeLabor, Number(d.totalEstimate) || 42000);
          const consultation: AIDesignConsultation = {
            isDesign: true,
            projectType: detectedTrade,
            title: d.problemTitle || `${detectedTrade === 'wardrobe' ? 'अलमारी / वार्डरोब' : 'मॉड्यूलर स्पेस'} 3D डिजाइन`,
            spaceObservation: d.spaceObservationHindi || d.visibleObservation || 'दीवार व कमरे का स्पेस विश्लेषण पूरा हुआ।',
            dimensions: {
              lengthFt: nextL,
              widthFt: nextW,
              approxSqFt: Number(d.estimatedDimensions?.approxSqFt) || nextL * nextW,
            },
            proposedDesign: d.proposedDesignHindi || `${nextL}x${nextW} फीट के लिए कस्टम 3D मॉडल तैयार किया गया है।`,
            finishStyleName: d.finishStyleName || 'प्रीमियम फिनिश विथ सॉफ्ट-क्लोज हार्डवेयर',
            cabinetBreakdown: d.cabinetBreakdown || [],
            materialBreakdown: d.requiredParts || [],
            estimatedLaborCharge: safeLabor,
            totalEstimate: safeTotal,
            ustadGuidance: d.ustadGuidanceHindi || d.ustadAdvice || 'इस जगह पर शानदार मॉडल बन सकता है। नीचे 3D डिजाइन और सामग्री लागत देखें।',
            estimatedFixTime: d.estimatedFixTime || '4 से 5 कार्य दिवस',
          };

          setAiDesignConsultation(consultation);
          setDiagnosisResult(null);
          speakDiagnosis(consultation.ustadGuidance);
          return;
        }

        const safeParts = (d.requiredParts || []).map((p: any) => ({
          name: `${p.name || 'स्पेयर पार्ट'} (${p.brand || 'ISI'})`,
          approxPrice: Math.max(0, Number(p.approxRate) || 100),
          unit: p.unit || '1 पीस',
        }));
        const safeLaborCharge = Math.max(0, Number(d.estimatedLaborCharge) || 180);
        const mapped: VisualProblemDiagnosis = {
          id: nextVisionDiagnosisId(),
          category: d.tradeCategory || 'plumber',
          titleHindi: d.problemTitle || (language === 'en' ? 'Home Repair Issue' : 'घरेलू मरम्मत समस्या'),
          visibleObservation: d.visibleObservation || d.visualSymptom || d.problemTitle || 'सतह पर समस्या का लक्षण दिखाई दे रहा है।',
          inferredCause: d.inferredCause || d.rootCause || 'आंतरिक कारण की जांच साइट मुआयने से की जानी चाहिए।',
          visualSymptom: d.visualSymptom || d.rootCause || '',
          realProblem: d.inferredCause || d.rootCause || '',
          sourceContext: ctx,
          isSafetyHazard: d.isSafetyHazard || d.severity === 'EMERGENCY' || false,
          safetyMessage: d.safetyMessage || (d.isSafetyHazard ? '⚠️ आपातकालीन सुरक्षा चेतावनी: तुरंत मुख्य DP / MCB बंद करें!' : undefined),
          neededHardware: safeParts,
          laborEstimate: {
            description: `${(currentLocation || 'भोपाल').split('•')[0].trim()} मानक कारीगर मजदूरी चार्ज`,
            approxPrice: safeLaborCharge,
          },
          totalEstimatedCost:
            safeParts.reduce((sum: number, p: any) => sum + (Number(p.approxPrice) || 0), 0) + safeLaborCharge,
          diySteps: d.isSafetyHazard ? [] : d.diySteps || [],
          karigarAdvice: d.ustadAdvice || '',
        };
        setDiagnosisResult(mapped);
        setAiDesignConsultation(null);
        speakDiagnosis(mapped.titleHindi + '. ' + mapped.visibleObservation);
        return;
      } else if (apiResp?.error && /साफ नहीं|अमान्य|सीमा पूर्ण/.test(apiResp.error)) {
        setVisionError(apiResp.error);
        return;
      }
    } catch (e) {
      console.log('AI Vision error:', e);
    } finally {
      isScanningRef.current = false;
      setIsScanning(false);
    }

    // Heuristics fallback when server returns 502 / offline & user typed a query
    if (activeUserQuery) {
      const diag = diagnoseVisualProblem(activeUserQuery, undefined, ctx);
      if (diag) {
        setDiagnosisResult(diag);
        setAiDesignConsultation(null);
        speakDiagnosis(diag.titleHindi + '. ' + diag.visibleObservation);
        return;
      }
    }

    setVisionError('फोटो का विश्लेषण अभी उपलब्ध नहीं है। कृपया अच्छी रोशनी में साफ फोटो लें या समस्या का विवरण लिखकर बताएं।');
  };

  // In-call timer
  useEffect(() => {
    let timer: any;
    if (visible && isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, isCallActive]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Scan & Diagnose Demo Scenarios (Explicitly sample demo mode)
  const handlePerformDiagnosis = (scenarioKey: string) => {
    if (!consumeCredit()) return;

    setSelectedScenarioKey(scenarioKey);
    setIsScanning(true);
    setVisionError('');
    setSourceContext('sample_demo');
    setTimeout(() => {
      const diag = diagnoseVisualProblem(scenarioKey, undefined, 'sample_demo');
      setDiagnosisResult(diag);
      setAiDesignConsultation(null);
      setIsScanning(false);

      if (diag) {
        speakDiagnosis(diag.titleHindi + '. ' + diag.visibleObservation);
      }
    }, 800);
  };

  const handleCustomScan = (overrideQuery?: string) => {
    const textToScan = (overrideQuery || customQuery).trim();
    if (!textToScan) {
      Alert.alert('कृपया लिखें', 'अपनी समस्या, अलमारी या डिजाइन का नाम लिखें।');
      return;
    }
    if (overrideQuery) {
      setCustomQuery(overrideQuery);
    }
    if (!consumeCredit()) return;

    const payloadMedia = attachedMediaBase64 || (attachedMediaUrl.startsWith('data:') ? attachedMediaUrl : '');
    runAIVisionDiagnosis(payloadMedia, textToScan, payloadMedia ? 'photo' : 'sample_demo');
  };

  // Text-To-Speech (AI Ustad speaks Hindi)
  const speakDiagnosis = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
      }
    }
  };

  // Upload Real Photo / Video to Backend & Immediately Trigger AI Diagnosis
  const handleUploadSiteMedia = async (type: 'photo' | 'video') => {
    setIsUploadingMedia(true);
    try {
      const picked = await pickImageFromGallery();
      setIsUploadingMedia(false);
      if (!picked || !picked.base64) {
        return;
      }

      setAttachedMediaUrl(picked.uri);
      setAttachedMediaBase64(picked.base64);
      // Immediately run real AI diagnosis automatically!
      runAIVisionDiagnosis(picked.base64, customQuery, 'photo');

      // Upload file to backend asynchronously in background (non-blocking)
      ApiService.uploadFile(picked.base64, picked.name || 'site_media.jpg', 'portfolio').catch(() => {});
    } catch (err: any) {
      setIsUploadingMedia(false);
      console.log('[Upload] Media pick error:', err);
    }
  };

  // Send to Bhopal Karigar via WhatsApp
  const handleSendToKarigarWhatsApp = () => {
    if (!diagnosisResult) return;
    const msg = formatAiDoctorWhatsAppMessage({
      contractorName: 'रमेश जी / संबंधित कारीगर',
      problemTitle: diagnosisResult.titleHindi,
      diagnosis: diagnosisResult.realProblem || diagnosisResult.visibleObservation || '',
      estimatedCost: `₹${diagnosisResult.totalEstimatedCost} (सामान ₹${diagnosisResult.neededHardware.reduce((acc, h) => acc + h.approxPrice, 0)} + लेबर ₹${diagnosisResult.laborEstimate.approxPrice})`,
      partsNeeded: diagnosisResult.neededHardware.map(
        (h) => `${h.name} (~₹${h.approxPrice})`
      ),
      userLocation: currentLocation,
      mediaUrl: attachedMediaUrl,
    });
    openWhatsAppChat('', msg);
  };

  // ==========================================
  // TAB 2: MULTI-TRADE AR 3D SPATIAL STUDIO STATE
  // (Customer, Carpenter, Mason, Plumber, Electrician)
  // ==========================================
  const [studioType, setStudioType] = useState<'kitchen' | 'wardrobe' | 'masonry' | 'plumbing' | 'electrical'>('kitchen');
  const [studioLayout, setStudioLayout] = useState<string>('L_SHAPE');
  const [studioFinish, setStudioFinish] = useState<string>('ACRYLIC');
  const [studioLength, setStudioLength] = useState<number>(10);
  const [studioWidth, setStudioWidth] = useState<number>(8);
  const [showLive3DOverlay, setShowLive3DOverlay] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(15);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceSpeechBubble, setVoiceSpeechBubble] = useState<string>('');
  const [visualMode, setVisualMode] = useState<'after' | 'before'>('after');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('k_teak');

  const currentPresets = TRADE_VISUAL_PRESETS[studioType] || TRADE_VISUAL_PRESETS.kitchen;
  const activePreset = currentPresets.find((p) => p.id === selectedPresetId) || currentPresets[0];

  const [studioDesign, setStudioDesign] = useState<SpaceDesign3D>(() =>
    calculate3DSpaceDesign({
      type: 'kitchen',
      layout: 'L_SHAPE',
      finish: 'ACRYLIC',
      lengthFt: 10,
      widthFt: 8,
      locality: currentLocation || 'भोपाल',
    })
  );

  const handleUpdateStudioDesign = (
    nextType: 'kitchen' | 'wardrobe' | 'masonry' | 'plumbing' | 'electrical' = studioType,
    nextLayout = studioLayout,
    nextFinish = studioFinish,
    nextLength = studioLength,
    nextWidth = studioWidth,
    nextPresetId?: string
  ) => {
    setStudioType(nextType);
    setStudioLayout(nextLayout);
    setStudioFinish(nextFinish);
    setStudioLength(nextLength);
    setStudioWidth(nextWidth);

    if (nextPresetId) {
      setSelectedPresetId(nextPresetId);
    } else if (nextType !== studioType) {
      const presets = TRADE_VISUAL_PRESETS[nextType] || [];
      if (presets.length > 0) {
        setSelectedPresetId(presets[0].id);
      }
    }

    const updated = calculate3DSpaceDesign({
      type: nextType,
      layout: nextLayout,
      finish: nextFinish,
      lengthFt: nextLength,
      widthFt: nextWidth,
      locality: currentLocation || 'भोपाल',
    });
    setStudioDesign(updated);
  };

  // Voice Interaction (AI Ustad Live Hindi Voice Chat with Stop toggle & leak guard)
  const startVoiceInput = () => {
    if (isVoiceListening && voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      voiceRecognitionRef.current = null;
      setIsVoiceListening(false);
      return;
    }
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = 'hi-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceRecognitionRef.current = recognition;
        setIsVoiceListening(true);
        recognition.onstart = () => {
          setIsVoiceListening(true);
          setVoiceSpeechBubble('🎤 बोलिए भाई, AI उस्ताद सुन रहा है...');
        };
        recognition.onresult = (event: any) => {
          voiceRecognitionRef.current = null;
          setIsVoiceListening(false);
          const transcript = event.results[0][0].transcript;
          setVoiceSpeechBubble(`🗣️ आपने पूछा: "${transcript}"`);
          handleProcessVoiceQuery(transcript);
        };
        recognition.onerror = () => {
          voiceRecognitionRef.current = null;
          setIsVoiceListening(false);
          setVoiceSpeechBubble('बोलने के लिए माइक पर दोबारा टैप करें');
        };
        recognition.onend = () => {
          voiceRecognitionRef.current = null;
          setIsVoiceListening(false);
        };
        recognition.start();
      } catch (e) {
        setIsVoiceListening(false);
        const promptText = window.prompt('अपनी समस्या या सवाल बोलें/लिखें (जैसे: यहाँ अलमारी कैसी बनेगी?):', 'यहाँ अलमारी कैसी बनेगी?');
        if (promptText) {
          setVoiceSpeechBubble(`🗣️ "${promptText}"`);
          handleProcessVoiceQuery(promptText);
        }
      }
    } else {
      const promptText = typeof window !== 'undefined' ? window.prompt('अपनी समस्या या सवाल बोलें/लिखें:', 'यहाँ अलमारी कैसी बनेगी?') : null;
      if (promptText) {
        setVoiceSpeechBubble(`🗣️ "${promptText}"`);
        handleProcessVoiceQuery(promptText);
      }
    }
  };

  const handleProcessVoiceQuery = (query: string) => {
    const q = query.toLowerCase();
    let detectedTrade: 'kitchen' | 'wardrobe' | 'masonry' | 'plumbing' | 'electrical' = studioType;
    let reply = '';

    if (q.includes('किचन') || q.includes('रसोई') || q.includes('चूल्हा') || q.includes('सिंक') || q.includes('kitchen')) {
      detectedTrade = 'kitchen';
      reply = 'किचन के लिए मैंने L-शेप 3D मॉड्यूलर लेआउट तैयार किया है। नीचे सामान की लिस्ट और कारीगर खर्च देखें।';
    } else if (q.includes('अलमारी') || q.includes('वॉर्डरोब') || q.includes('कवर्ड') || q.includes('wardrobe') || q.includes('कपड़े') || q.includes('almirah')) {
      detectedTrade = 'wardrobe';
      reply = 'अलमारी के लिए 3D वॉर्डरोब डिज़ाइन लोड हो गया है। इसमें 4 इनर ड्रॉअर और लॉफ्ट स्पेस जोड़ा गया है।';
    } else if (q.includes('मिस्त्री') || q.includes('दीवार') || q.includes('ईंट') || q.includes('सीमेंट') || q.includes('मकान') || q.includes('घर') || q.includes('पिलर') || q.includes('mason')) {
      detectedTrade = 'masonry';
      reply = 'राजमिस्त्री के लिए 3D दीवार और 4 RCC पिलर का फ्रेम तैयार है। 14 बोरी सीमेंट और 1400 ईंटों का अनुमान निकला है।';
    } else if (q.includes('प्लम्बर') || q.includes('नल') || q.includes('पाइप') || q.includes('गीज़र') || q.includes('लीकेज') || q.includes('पानी') || q.includes('drain') || q.includes('plumber')) {
      detectedTrade = 'plumbing';
      reply = 'प्लम्बर के लिए हॉट और कोल्ड कंसील्ड 3D पाइपलाइन और 2.5% ढलान वाला ड्रेनेज सर्किट तैयार है।';
    } else if (q.includes('बिजली') || q.includes('लाइट') || q.includes('तार') || q.includes('बोर्ड') || q.includes('वायरिंग') || q.includes('ac') || q.includes('electrician')) {
      detectedTrade = 'electrical';
      reply = 'इलेक्ट्रीशियन के लिए कंसील्ड कंड्यूट वायरिंग और MCB लोड डिस्ट्रीब्यूशन का 3D मैप तैयार है।';
    } else {
      reply = `आपकी समस्या "${query}" के लिए 3D विश्लेषण तैयार है।`;
    }

    handleUpdateStudioDesign(detectedTrade);
    speakDiagnosis(reply);
  };

  const handleSendStudioWhatsApp = () => {
    const tradeTitles: Record<string, string> = {
      kitchen: 'मास्टर कारपेंटर (Modular Kitchen)',
      wardrobe: 'मास्टर कारपेंटर (Wardrobe & Almirah)',
      masonry: 'मास्टर राजमिस्त्री / ठेकेदार (House & Masonry)',
      plumbing: 'मास्टर प्लम्बर (Concealed Plumbing)',
      electrical: 'मास्टर इलेक्ट्रीशियन (Concealed Wiring)',
    };
    const msg = format3DStudioWhatsAppMessage({
      contractorName: tradeTitles[studioType] || 'सत्यापित कारीगर',
      projectType: studioDesign.layoutTitle,
      layoutName: studioDesign.finishTitle,
      finishType: studioDesign.ustadAdvice.slice(0, 80) + '...',
      dimensions: `${studioLength}x${studioWidth} ft`,
      approxSqFt: studioDesign.totalSqFt,
      estimatedTotal: `₹${studioDesign.grandTotal.toLocaleString('en-IN')} (सामान ₹${studioDesign.totalMaterialCost.toLocaleString('en-IN')} + लेबर ₹${studioDesign.laborCost.toLocaleString('en-IN')})`,
      userLocation: currentLocation,
    });
    openWhatsAppChat('', msg);
  };

  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({
    maxWidth: 960,
    fixedHeight: true,
    desktopHeight: '90%',
    fullScreenOnMobile: true,
  });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={isDialog} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
        {/* Top Header & Tab Controls */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.titleBadgeRow}>
              <View style={styles.liveRedDot} />
              <Text style={styles.headerTitle}>SETU AI उस्ताद & 3D स्टूडियो</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {(currentLocation || 'भोपाल').split('•')[0]} • लाइव वीडियो समाधान
            </Text>
          </View>
          <TouchableOpacity
            style={styles.creditsPill}
            onPress={() => setIsPaywallOpen(true)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="bolt" size={11} color="#F59E0B" />
            <Text style={styles.creditsText}>{dailyCredits}/3 फ़्री</Text>
          </TouchableOpacity>
        </View>

        {/* Simplified 2-Mode Navigation Bar */}
        <View style={styles.navTabsRow}>
          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'video' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('video')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles"
              size={18}
              color={activeTab === 'video' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navTabText,
                activeTab === 'video' && styles.navTabTextActive,
              ]}
            >
              ✨ 3D रूम डिज़ाइनर
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'gyan' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('gyan')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="school"
              size={18}
              color={activeTab === 'gyan' ? '#10B981' : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navTabText,
                activeTab === 'gyan' && { color: '#10B981', fontWeight: '800' },
              ]}
            >
              📚 उस्ताद ज्ञान & नियम
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TAB 1: 3D रूम डिज़ाइनर & आसान एआई समाधान (EASY 3-STEP FLOW FOR EVERYONE) */}
        {/* ========================================================================= */}
        {activeTab === 'video' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Step 1-2-3 Progress Stepper */}
            <View style={styles.easyStepperCard}>
              <View style={styles.easyStepBadge}>
                <View style={styles.easyStepCircle}><Text style={styles.easyStepNum}>1</Text></View>
                <Text style={styles.easyStepTitle}>फोटो दिखाएं</Text>
              </View>
              <View style={styles.easyStepLine} />
              <View style={styles.easyStepBadge}>
                <View style={[styles.easyStepCircle, { backgroundColor: '#8B5CF6' }]}><Text style={styles.easyStepNum}>2</Text></View>
                <Text style={styles.easyStepTitle}>काम चुनें / बोलें</Text>
              </View>
              <View style={styles.easyStepLine} />
              <View style={styles.easyStepBadge}>
                <View style={[styles.easyStepCircle, { backgroundColor: '#10B981' }]}><Text style={styles.easyStepNum}>3</Text></View>
                <Text style={styles.easyStepTitle}>3D & खर्च देखें</Text>
              </View>
            </View>

            {/* STEP 1: फोटो दिखाएं */}
            <View style={styles.stepSectionCard}>
              <View style={styles.stepHeaderRow}>
                <Text style={styles.stepHeaderBadge}>स्टेप 1</Text>
                <Text style={styles.stepHeaderTitle}>📸 अपने कमरे / जगह की फोटो दिखाएं</Text>
              </View>

              <View style={styles.photoActionRow}>
                <TouchableOpacity
                  style={styles.photoActionPrimaryBtn}
                  onPress={() => {
                    setIsCallActive(true);
                    handleUploadSiteMedia('photo');
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                  <Text style={styles.photoActionPrimaryText}>कैमरा से फोटो लें</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoActionSecondaryBtn}
                  onPress={() => handleUploadSiteMedia('photo')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="images" size={18} color="#0F172A" />
                  <Text style={styles.photoActionSecondaryText}>गैलरी से फोटो चुनें</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* STEP 2: आप क्या काम कराना चाहते हैं? */}
            <View style={styles.stepSectionCard}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.stepHeaderBadge, { backgroundColor: '#8B5CF6' }]}>स्टेप 2</Text>
                <Text style={styles.stepHeaderTitle}>✨ आप क्या काम कराना चाहते हैं?</Text>
              </View>

              <View style={styles.tradeGridRow}>
                {[
                  { key: 'wardrobe', icon: '🚪', label: '3D अलमारी', query: 'इस जगह में अलमारी बनानी है, कैसी बनेगी?' },
                  { key: 'kitchen', icon: '🍳', label: 'मॉड्यूलर किचन', query: 'यहाँ आधुनिक मॉड्यूलर किचन बनाना है' },
                  { key: 'masonry', icon: '🧱', label: 'मकान / दीवार', query: 'दीवार व मकान का काम कराना है' },
                  { key: 'plumbing', icon: '🚿', label: 'प्लम्बर / पाइप', query: 'पाइपलाइन व लीकेज ठीक करानी है' },
                  { key: 'electrical', icon: '⚡', label: 'बिजली / लाइट', query: 'वायरिंग व लाइटिंग का काम है' },
                  { key: 'general', icon: '🔧', label: 'सामान्य रिपेयर', query: 'घर की सामान्य मरम्मत करानी है' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.tradeCardTile,
                      studioType === item.key && styles.tradeCardTileActive,
                    ]}
                    onPress={() => {
                      if (item.key !== 'general') {
                        handleUpdateStudioDesign(item.key as any);
                      }
                      setCustomQuery(item.query);
                      handleCustomScan(item.query);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tradeCardIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.tradeCardLabel,
                        studioType === item.key && styles.tradeCardLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Voice Mic or Quick Typing */}
              <View style={styles.voiceChatBar}>
                <TouchableOpacity
                  style={[styles.voiceMicBigBtn, isVoiceListening && styles.voiceMicBigBtnActive]}
                  onPress={startVoiceInput}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isVoiceListening ? 'mic' : 'mic-outline'} size={20} color="#FFFFFF" />
                  <Text style={styles.voiceMicBigText}>
                    {isVoiceListening ? 'सुन रहे हैं...' : 'बोलकर बताएं'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.simpleQueryInputRow}>
                  <TextInput
                    style={styles.simpleQueryInput}
                    value={customQuery}
                    onChangeText={setCustomQuery}
                    placeholder="उदा: मुझे यहाँ अलमारी बनवानी है..."
                    placeholderTextColor="#64748B"
                    onSubmitEditing={() => handleCustomScan()}
                  />

                  <TouchableOpacity
                    style={styles.simpleQuerySubmitBtn}
                    onPress={() => handleCustomScan()}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {voiceSpeechBubble ? (
                <Text style={{ color: '#FBBF24', fontSize: 11.5, marginTop: 6, fontWeight: '700' }}>
                  {voiceSpeechBubble}
                </Text>
              ) : null}
            </View>

            {/* STEP 3: 3D डिज़ाइन & खर्च देखें */}
            <View style={styles.stepSectionCard}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.stepHeaderBadge, { backgroundColor: '#10B981' }]}>स्टेप 3</Text>
                <Text style={styles.stepHeaderTitle}>📐 आपका 3D डिज़ाइन & खर्च का सटीक हिसाब</Text>
              </View>

              {/* Clean Viewport Card */}
              <View style={styles.cleanViewportCard}>
                <View style={styles.beforeAfterHeaderPill}>
                  <TouchableOpacity
                    style={[styles.togglePillBtn, visualMode === 'before' && styles.togglePillBtnActive]}
                    onPress={() => setVisualMode('before')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.togglePillText, visualMode === 'before' && styles.togglePillTextActive]}>
                      📸 आपकी जगह (Before)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.togglePillBtn, visualMode === 'after' && styles.togglePillBtnActive]}
                    onPress={() => setVisualMode('after')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.togglePillText, visualMode === 'after' && styles.togglePillTextActive]}>
                      ✨ 3D डिज़ाइन (After)
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cleanImageContainer}>
                  {viewportImgFailed ? (
                    <View style={[styles.cleanViewportImage, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
                      <Ionicons name="image-outline" size={36} color="#64748B" />
                      <Text style={{ color: '#94A3B8', fontSize: 12 }}>प्रीव्यू इमेज लोड नहीं हो सकी</Text>
                    </View>
                  ) : (
                    <Image
                      source={{
                        uri:
                          visualMode === 'before'
                            ? attachedMediaUrl || activePreset.rawSpaceUrl
                            : activePreset.renderUrl,
                      }}
                      style={styles.cleanViewportImage}
                      resizeMode="cover"
                      onError={() => setViewportImgFailed(true)}
                    />
                  )}
                  <View style={styles.viewportWatermarkBadge}>
                    <Text style={styles.viewportWatermarkText}>
                      {visualMode === 'before' ? '📸 आपकी मूल जगह' : `✨ 3D मॉडल: ${activePreset.title}`}
                    </Text>
                  </View>
                </View>

                {/* Quick Finish Selection Chips */}
                <View style={styles.finishChipsWrap}>
                  <Text style={styles.finishLabel}>पसंदीदा फिनिश चुनें:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.finishChipsRow}>
                      {currentPresets.map((preset) => (
                        <TouchableOpacity
                          key={preset.id}
                          style={[
                            styles.finishChipPill,
                            selectedPresetId === preset.id && styles.finishChipPillActive,
                          ]}
                          onPress={() => {
                            setSelectedPresetId(preset.id);
                            setViewportImgFailed(false);
                            setVisualMode('after');
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.finishChipPillText,
                              selectedPresetId === preset.id && styles.finishChipPillTextActive,
                            ]}
                          >
                            {preset.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Simple Summary Card */}
              <View style={styles.simpleSummaryCard}>
                <View style={styles.summaryTopRow}>
                  <View style={styles.summaryMetricItem}>
                    <Text style={styles.summaryMetricLabel}>नाप (लंबाई x चौड़ाई)</Text>
                    <Text style={styles.summaryMetricValue}>
                      {aiDesignConsultation?.dimensions
                        ? `${aiDesignConsultation.dimensions.lengthFt} x ${aiDesignConsultation.dimensions.widthFt} फीट`
                        : `${studioLength} x ${studioWidth} फीट`}
                    </Text>
                  </View>
                  <View style={styles.summaryMetricItem}>
                    <Text style={styles.summaryMetricLabel}>अनुमानित क्षेत्रफल</Text>
                    <Text style={styles.summaryMetricValue}>
                      {aiDesignConsultation?.dimensions
                        ? `${aiDesignConsultation.dimensions.approxSqFt} sq ft`
                        : `${studioDesign.totalSqFt} sq ft`}
                    </Text>
                  </View>
                  <View style={styles.summaryMetricItem}>
                    <Text style={styles.summaryMetricLabel}>बनने का समय</Text>
                    <Text style={styles.summaryMetricValue}>
                      {aiDesignConsultation?.estimatedFixTime || '3 से 4 दिन'}
                    </Text>
                  </View>
                </View>

                {/* Total Cost Box */}
                {(() => {
                  const aiTotal = Number(aiDesignConsultation?.totalEstimate) || 0;
                  const aiLabor = Number(aiDesignConsultation?.estimatedLaborCharge) || 0;
                  const boundedLabor = aiTotal > 0 ? Math.min(aiLabor, aiTotal) : studioDesign.laborCost;
                  const computedMaterial = aiTotal > 0 ? Math.max(0, aiTotal - boundedLabor) : studioDesign.totalMaterialCost;
                  const computedGrand = aiTotal > 0 ? Math.max(aiTotal, boundedLabor) : studioDesign.grandTotal;
                  const cleanCityLabel = (currentLocation || 'आपके शहर').split('•')[0].split(',')[0].trim();
                  return (
                    <>
                      <View style={styles.summaryCostBox}>
                        <View style={styles.summaryCostRow}>
                          <Text style={styles.summaryCostSubLabel}>📦 सामग्री लागत (प्लाई, माइका, फिटिंग्स):</Text>
                          <Text style={styles.summaryCostSubVal}>
                            ₹{computedMaterial.toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.summaryCostRow}>
                          <Text style={styles.summaryCostSubLabel}>🔨 कुशल कारीगर मजदूरी ({cleanCityLabel}):</Text>
                          <Text style={styles.summaryCostSubVal}>
                            ₹{boundedLabor.toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.summaryCostDivider} />
                        <View style={styles.summaryTotalRow}>
                          <Text style={styles.summaryTotalLabel}>कुल खर्च (सामान + मजदूरी):</Text>
                          <Text style={styles.summaryTotalVal}>
                            ₹{computedGrand.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>
                    </>
                  );
                })()}

                {/* Ustad Advice */}
                <View style={styles.simpleUstadCard}>
                  <Text style={styles.simpleUstadEmoji}>👳‍♂️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.simpleUstadTitle}>SETU उस्ताद की सीधी सलाह:</Text>
                    <Text style={styles.simpleUstadText}>
                      {aiDesignConsultation?.ustadGuidance ||
                        activePreset.description ||
                        studioDesign.ustadAdvice}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.speakerBtn}
                    onPress={() =>
                      speakDiagnosis(
                        aiDesignConsultation?.ustadGuidance ||
                          activePreset.description ||
                          studioDesign.ustadAdvice
                      )
                    }
                  >
                    <Ionicons
                      name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
                      size={20}
                      color="#A5B4FC"
                    />
                  </TouchableOpacity>
                </View>

                {/* One Direct WhatsApp Button to Hire Verified Contractor */}
                <TouchableOpacity
                  style={styles.bigGreenConnectBtn}
                  onPress={handleSendStudioWhatsApp}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name="whatsapp" size={18} color="#FFFFFF" />
                  <Text style={styles.bigGreenConnectText}>
                    💬 {(currentLocation || 'नजदीकी').split('•')[0].split(',')[0].trim()} के वेरिफ़ाईड कारीगर से बात करें
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* TAB 3: USTAD GYAN & KARIGAR TRAINING */}
        {/* ========================================================================= */}
        {activeTab === 'gyan' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.gyanHeroCard}>
              <Text style={styles.gyanHeroEmoji}>🎓</Text>
              <Text style={styles.gyanHeroTitle}>SETU उस्ताद निर्माण संहिता (Master Code)</Text>
              <Text style={styles.gyanHeroSubtitle}>
                कारीगर और ग्राहक दोनों के लिए CPWD व IS कोड पर आधारित सत्य नियम
              </Text>
            </View>

            {/* Rule 1: Plywood */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>01</Text>
                <Text style={styles.gyanHeaderTitle}>प्लाईवुड: कमर्शियल vs मरीन प्लाई का सच</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • अक्सर ठेकेदार सस्ते मुनाफे के लिए MR Grade (कमर्शियल प्लाई) लगाते हैं जो दीमक और नमी से 2 साल में फूल जाती है।{'\n'}
                • किचन और बाथरूम में हमेशा <Text style={{ fontWeight: '800' }}>IS:710 मरीन ग्रेड 100% वॉटरप्रूफ प्लाई</Text> ही लगाएं।{'\n'}
                • फेविकोल मरीन में पानी मिलाने से रोकें; पानी मिलाने से 6 महीने बाद माइका पर बुलबुले उभर आते हैं।
              </Text>
            </View>

            {/* Rule 2: Plumbing */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>02</Text>
                <Text style={styles.gyanHeaderTitle}>प्लंबिंग: 10-Bar प्रेशर टेस्टिंग का नियम</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • CPVC सॉल्वेंट वेल्डिंग के बाद टाइल्स लगाने से पहले कम से कम 24 घंटे 10-Bar हाइड्रोस्टैटिक प्रेशर टेस्ट जरूरी है।{'\n'}
                • नल के स्पिंडल में जब भी लीकेज हो, पूरा नल न बदलें। केवल ₹85 का ब्रास स्पिंडल बदलने से काम हो जाता है।
              </Text>
            </View>

            {/* Rule 3: Masonry & Slab */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>03</Text>
                <Text style={styles.gyanHeaderTitle}>छत ढलाई & कंक्रीट: 14 दिन तराई का नियम</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • छत ढलाई में बिना नीडल वाइब्रेटर के कभी काम न होने दें। वाइब्रेटर न चलाने से कंक्रीट में छिद्र रह जाते हैं और बारिश में छत चूने लगती है।{'\n'}
                • ढलाई के बाद 14 दिन लगातार क्यारियां बनाकर पानी भरा रहना चाहिए, तभी कंक्रीट अपनी पूरी 100% मजबूती हासिल करता है।
              </Text>
            </View>

            {/* Rule 4: Electrical */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>04</Text>
                <Text style={styles.gyanHeaderTitle}>इलेक्ट्रिकल: 30mA RCCB शॉक प्रोटेक्शन</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • हर घर के डिस्ट्रीब्यूशन बोर्ड में 30mA RCCB लगा होना चाहिए। यह किसी बच्चे या व्यक्ति को करंट लगते ही 0.03 सेकंड में बिजली काट देता है और जान बचाता है।{'\n'}
                • AC और गीजर के लिए कभी भी 2.5mm से पतली तार न डलवाएं।
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* PAYWALL / TOKEN RECHARGE MODAL */}
        {/* ========================================================================= */}
        <Modal visible={isPaywallOpen} transparent animationType="fade" onRequestClose={() => setIsPaywallOpen(false)}>
          <View style={styles.paywallOverlay}>
            <View style={styles.paywallCard}>
              <View style={styles.paywallIcon}>
                <FontAwesome5 name="crown" size={32} color="#D97706" />
              </View>
              <Text style={styles.paywallTitle}>आज का फ्री कोटा पूर्ण हुआ!</Text>
              <Text style={styles.paywallDesc}>
                आपने आज के 3 फ्री AI उस्ताद वीडियो स्कैन पूरे कर लिए हैं। कल सुबह यह फिर से स्वतः रिसेट हो जाएगा।
              </Text>

              <View style={styles.paywallPriceBox}>
                <Text style={styles.paywallPrice}>सिर्फ ₹19 / दिन</Text>
                <Text style={styles.paywallPerk}>• असीमित लाइव वीडियो डायग्नोसिस</Text>
                <Text style={styles.paywallPerk}>• 3D किचन & वॉर्डरोब ब्लूप्रिंट</Text>
                <Text style={styles.paywallPerk}>• सीधे उस्ताद से वॉइस परामर्श</Text>
              </View>

              <TouchableOpacity
                style={styles.paywallBtn}
                onPress={() => {
                  if (demoBonusClaimed) {
                    Alert.alert('सीमा पूर्ण', 'आज का डेमो बोनस कोटा पहले ही लिया जा चुका है।');
                    return;
                  }
                  setDailyCredits(10);
                  setDemoBonusClaimed(true);
                  if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                      const dateKey = new Date().toISOString().slice(0, 10);
                      window.localStorage.setItem(`setu_ai_credits_${dateKey}`, '10');
                      window.localStorage.setItem(`setu_ai_bonus_${dateKey}`, '1');
                    } catch {
                      // ignore
                    }
                  }
                  setIsPaywallOpen(false);
                  Alert.alert('🎉 प्रीमियम पास एक्टिवेटेड', 'आपको आज के लिए 10 डेमो AI स्कैन दिए गए हैं!');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.paywallBtnText}>₹19 टोकन जोड़ें (डेमो)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paywallSecondaryBtn}
                onPress={() => {
                  setIsPaywallOpen(false);
                  handleSendToKarigarWhatsApp();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.paywallSecondaryText}>
                  या {(currentLocation || 'नजदीकी').split('•')[0].split(',')[0].trim()} के कारीगर से मुफ़्त में पूछें ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  closeBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 10,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#475569',
  },
  creditsText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  navTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  navTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  navTabBtnActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tabContent: {
    flex: 1,
    padding: 12,
  },
  // Simple 3-Step Stepper Header
  easyStepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  easyStepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  easyStepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  easyStepNum: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  easyStepTitle: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '800',
  },
  easyStepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  // Step Section Card
  stepSectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepHeaderBadge: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  // Step 1: Photo Action Row
  photoActionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  photoActionPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  photoActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  photoActionSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  photoActionSecondaryText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  photoActionFlipBtn: {
    backgroundColor: '#334155',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Step 2: Trade Cards Grid
  tradeGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tradeCardTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  tradeCardTileActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  tradeCardIcon: {
    fontSize: 18,
  },
  tradeCardLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  tradeCardLabelActive: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  // Voice Chat Bar
  voiceChatBar: {
    marginTop: 2,
    gap: 8,
  },
  voiceMicBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 12,
  },
  voiceMicBigBtnActive: {
    backgroundColor: '#EF4444',
  },
  voiceMicBigText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  simpleQueryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
  },
  simpleQueryInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 8,
  },
  simpleQuerySubmitBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Step 3: Clean Viewport Card
  cleanViewportCard: {
    backgroundColor: '#020617',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  beforeAfterHeaderPill: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 4,
    borderRadius: 8,
    margin: 8,
    gap: 6,
  },
  togglePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  togglePillBtnActive: {
    backgroundColor: '#F59E0B',
  },
  togglePillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  togglePillTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  cleanImageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  cleanViewportImage: {
    width: '100%',
    height: '100%',
  },
  viewportWatermarkBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewportWatermarkText: {
    color: '#FBBF24',
    fontSize: 10.5,
    fontWeight: '800',
  },
  finishChipsWrap: {
    padding: 8,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  finishLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  finishChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  finishChipPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  finishChipPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: '#F59E0B',
  },
  finishChipPillText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '700',
  },
  finishChipPillTextActive: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  // Step 3: Simple Summary Card
  simpleSummaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  summaryMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryMetricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryMetricValue: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
  },
  summaryCostBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  summaryCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryCostSubLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCostSubVal: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  summaryCostDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 6,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
  },
  summaryTotalVal: {
    color: '#F59E0B',
    fontSize: 17,
    fontWeight: '900',
  },
  simpleUstadCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E1B4B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#6366F1',
    marginBottom: 12,
    gap: 8,
  },
  simpleUstadEmoji: {
    fontSize: 22,
  },
  simpleUstadTitle: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  simpleUstadText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
  },
  speakerBtn: {
    padding: 4,
  },
  bigGreenConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  bigGreenConnectText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },
  viewfinderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  viewfinderTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  callTimerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  viewfinderActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  viewfinderSmallBtn: {
    backgroundColor: '#334155',
    padding: 6,
    borderRadius: 8,
  },
  cameraFrame: {
    height: 240,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraSnapshot: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraPromptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraSubprompt: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 4,
    textAlign: 'center',
  },
  startLiveCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
    marginTop: 12,
  },
  startLiveCameraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  retakeLiveBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  retakeLiveText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserBar: {
    width: '90%',
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    marginBottom: 16,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  doctorPipBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  doctorPipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorPipEmoji: {
    fontSize: 14,
  },
  doctorPipName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  doctorPipStatus: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '700',
  },
  viewfinderBottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
    gap: 8,
  },
  cameraToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  cameraToolText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  scanNowActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  scanNowActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  scenariosSection: {
    marginTop: 14,
  },
  sectionHeaderTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  scenarioChipsRow: {
    gap: 8,
  },
  scenarioChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scenarioChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  scenarioChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  scenarioChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  quickPromptsSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  quickPromptsHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickPromptChipText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '700',
  },
  designConsultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  designConsultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  designConsultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#B45309',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  designConsultBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  spaceMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
    gap: 6,
  },
  spaceMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  spaceMetricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  spaceMetricVal: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  ustadSpeechCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E1B4B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#6366F1',
    marginBottom: 12,
    gap: 8,
  },
  ustadSpeechEmoji: {
    fontSize: 24,
  },
  ustadSpeechTitle: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  ustadSpeechBody: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  designDetailSection: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  designSectionTitle: {
    color: '#F59E0B',
    fontSize: 11.5,
    fontWeight: '900',
    marginBottom: 6,
  },
  designProposedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  designFinishTag: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  cabRowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  cabRowQty: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
  },
  cabRowTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  cabRowDesc: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  matEstimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  matEstimateName: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  matEstimateRate: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },
  costGrandCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 4,
  },
  costGrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  costGrandLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  costGrandVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  costGrandLabelTotal: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '900',
  },
  costGrandValTotal: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '900',
  },
  bookKarigarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  bookKarigarActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  customQueryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  customInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 8,
  },
  customQueryBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  reportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  listenVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listenVoiceText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  reportTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  visionErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  visionErrorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  visionErrorText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 16,
  },
  visionErrorSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  observationBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    marginBottom: 10,
  },
  observationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  observationTitle: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '800',
  },
  observationText: {
    color: '#1E3A8A',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  hazardWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  hazardWarningTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  hazardWarningText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 16,
  },
  realCauseBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    marginBottom: 12,
  },
  realCauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  realCauseTitle: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
  },
  realCauseDesc: {
    color: '#78350F',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  reportSectionBox: {
    marginBottom: 12,
  },
  reportSectionTitle: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  hardwareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  hwInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  hwName: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  hwPriceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hwPriceText: {
    color: '#0F172A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  costBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  costLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  costValue: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 6,
  },
  grandCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandCostLabel: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '900',
  },
  grandCostValue: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },
  fairPriceNote: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 6,
  },
  diyBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  diyTitle: {
    color: '#1D4ED8',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  diyStepText: {
    color: '#1E3A8A',
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },
  ustadAdviceBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  ustadAdviceText: {
    color: '#92400E',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  actionButtonsRow: {
    gap: 8,
  },
  whatsAppCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  whatsAppCallText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  openCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  openCategoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  // STUDIO STYLES
  studioTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  studioTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  studioTypeBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8B5CF6',
  },
  studioTypeEmoji: {
    fontSize: 18,
  },
  studioTypeText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  studioTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  studioSection: {
    marginBottom: 14,
  },
  studioSectionHeader: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  studioChipsScroll: {
    gap: 8,
  },
  studioChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  studioChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  studioChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  studioChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dimensionsBox: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  dimensionsTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  dimButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dimPillBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dimPillBtnActive: {
    backgroundColor: '#8B5CF6',
  },
  dimPillText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '700',
  },
  dimPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  schematicCanvasCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  schematicCanvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
  },
  canvasLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  canvasLiveText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  schematicSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  blueprintArea: {
    height: 200,
    position: 'relative',
    backgroundColor: '#020617',
    padding: 10,
  },
  blueprintGrid: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
  },
  blueprintBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  blueprintBoxLabel: {
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  blueprintWatermark: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  blueprintWatermarkText: {
    color: '#334155',
    fontSize: 8.5,
    fontWeight: '800',
  },
  breakdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  breakdownTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  cabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 8,
  },
  cabBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cabBadgeQty: {
    color: '#F59E0B',
    fontSize: 10.5,
    fontWeight: '900',
  },
  cabDetails: {
    flex: 1,
  },
  cabItemName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cabItemDesc: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
  studioEstimateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  estimateTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  matCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  matName: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '700',
  },
  matQty: {
    color: '#64748B',
    fontSize: 9.5,
  },
  matTotal: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // GYAN STYLES
  gyanHeroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gyanHeroEmoji: {
    fontSize: 32,
  },
  gyanHeroTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  gyanHeroSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  gyanCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gyanCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  gyanNum: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
  },
  gyanHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    flex: 1,
  },
  gyanBodyText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 17,
  },

  // PAYWALL STYLES
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paywallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  paywallIcon: {
    marginBottom: 10,
  },
  paywallTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  paywallDesc: {
    color: '#64748B',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  paywallPriceBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  paywallPrice: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  paywallPerk: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  paywallBtn: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  paywallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  paywallSecondaryBtn: {
    marginTop: 10,
    paddingVertical: 6,
  },
  paywallSecondaryText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
  // Multi-Trade AR Selector Pills
  tradePillBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    overflow: 'scroll',
  },
  tradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tradePillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#818CF8',
  },
  tradePillIcon: {
    fontSize: 12,
  },
  tradePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tradePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // Viewfinder 3D AR & Voice Buttons
  viewfinder3DBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  viewfinder3DBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#F59E0B',
  },
  viewfinder3DText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  viewfinderMicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  viewfinderMicBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
  },
  viewfinderMicText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  // AR 3D Photorealistic Overlay Container
  ar3DOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  visualBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    alignItems: 'flex-start',
    zIndex: 12,
  },
  visualModeTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
  },
  visualModeTagText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },
  beforeAfterSwitchContainer: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 24,
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    zIndex: 15,
  },
  beforeAfterSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  beforeAfterSwitchBtnActive: {
    backgroundColor: '#F59E0B',
  },
  beforeAfterSwitchText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  beforeAfterSwitchTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  visualBottomInfoBar: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  visualBottomInfoText: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  styleSelectorContainer: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  styleSelectorHeader: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  styleChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  styleChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  styleChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: '#F59E0B',
  },
  styleChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  styleChipTextActive: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  blueprintRenderImage: {
    width: '100%',
    height: 190,
    borderRadius: 8,
  },
  blueprintSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    gap: 6,
  },
  blueprintSpecItem: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '700',
  },
  // Voice Bubble Card
  voiceBubbleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF2FF',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  voiceBubbleText: {
    color: '#1E1B4B',
    fontSize: 12,
    fontWeight: '800',
  },
  voiceBubbleSub: {
    color: '#4F46E5',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  // Spatial Estimate Card & Tables
  spatialEstimateCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  spatialCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spatialCardTitle: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '900',
  },
  liveTradeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveTradeBadgeText: {
    color: '#15803D',
    fontSize: 10.5,
    fontWeight: '800',
  },
  spatialCardSubtitle: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
  },
  materialEstimateTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableHeadTitle: {
    color: '#1E293B',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  tableItemName: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  tableItemQty: {
    color: '#64748B',
    fontSize: 10,
  },
  tableItemTotal: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '800',
  },
  componentBreakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cbRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 3,
  },
  cbBullet: {
    color: '#4F46E5',
    fontWeight: '900',
    fontSize: 14,
  },
  cbItemTitle: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '700',
  },
  cbItemDesc: {
    color: '#64748B',
    fontSize: 10,
  },
  spatialCostTotalBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  costSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  costSplitLabel: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '600',
  },
  costSplitVal: {
    color: '#92400E',
    fontSize: 11.5,
    fontWeight: '700',
  },
  costGrandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabelText: {
    color: '#78350F',
    fontSize: 12.5,
    fontWeight: '900',
  },
  grandTotalValText: {
    color: '#15803D',
    fontSize: 16,
    fontWeight: '900',
  },
  spatialUstadAdvice: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  ustadAdviceIcon: {
    fontSize: 14,
  },
  spatialActionBtns: {
    gap: 8,
  },
  spatialWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 11,
    borderRadius: 10,
  },
  spatialWhatsAppText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  spatialHireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 11,
    borderRadius: 10,
  },
  spatialHireText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
