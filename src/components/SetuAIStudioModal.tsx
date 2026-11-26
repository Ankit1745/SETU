import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import { getSetuLogo } from '../constants/logos';
import { Contractor, MaterialItem } from '../data/mockData';
import { ApiService } from '../services/api';
import { pickImageFromGallery, capturePhotoFromCamera } from '../utils/mediaPicker';
import { openWhatsAppChat } from '../utils/whatsapp';
import { SpaceDesignCanvas, SetuVisualPlan } from './SpaceDesignCanvas';
import { VisualMaterialPicker } from './VisualMaterialPicker';
import { ThreeWayQuotationCard, QuoteModeKey } from './ThreeWayQuotationCard';
import { useResponsive } from '../hooks/useResponsive';
import {
  ShowroomGroup,
  ShowroomProduct,
  ShowroomProjectType,
  ThreeWayQuotationData,
  normalizeProjectType,
  rankContractorsForProject,
  rankSupplierMaterialsForProject,
} from '../data/supplierShowroom';

export interface SetuQuotationItem {
  name: string;
  qtyRate: string;
  amount: number;
}

export interface SetuQuotation {
  includeQuotation: boolean;
  projectTitle: string;
  dimensionsSummary: string;
  estimatedDuration: string;
  items: SetuQuotationItem[];
  materialTotal: number;
  laborTotal: number;
  grandTotal: number;
  budgetFitNote?: string;
}

export interface SetuBookingPrefill {
  mode?: 'दिहाड़ी' | 'ठेका' | 'भाव_पूछें';
  includeMaterials?: boolean;
  description?: string;
  initialLaborEstimate?: number;
  initialMaterialEstimate?: number;
}

export interface SetuAssistantPayload {
  intentMode: 'repair' | 'build_design' | 'rate_quote';
  interactionStage?: 'repair' | 'explore_design' | 'quote_ready';
  tradeCategory: string;
  replyText: string;
  showMaterialPicker?: boolean;
  productPickerProjectType?: ShowroomProjectType | string;
  customMaterialGroups?: ShowroomGroup[] | null;
  sceneContextPrompt?: string;
  isSafetyHazard?: boolean;
  safetyMessage?: string;
  visualPreviewReady?: boolean;
  visualPlan?: SetuVisualPlan;
  renderedImageUrl?: string | null;
  editedImageBase64?: string | null;
  inPlaceEditRequired?: boolean;
  inPlaceEditPrompt?: string;
  serverHasPaidImageEditor?: boolean;
  isEditingInPhoto?: boolean;
  inPhotoEditError?: string | null;
  quotation?: SetuQuotation;
  threeWayQuotations?: ThreeWayQuotationData;
  customerBudget?: number | null;
  locality?: string;
  upsellPrompt?: string;
  quickReplies?: string[];
  recommendedMaterialIds?: string[];
  websiteAction?: 'NONE' | 'BOOK_PRO' | 'ORDER_MATERIAL' | 'POST_BUDGET_JOB';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  photoUri?: string;
  payload?: SetuAssistantPayload;
}

interface SetuAIStudioModalProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  currentLocation: string;
  contractors: Contractor[];
  materials: MaterialItem[];
  initialPrompt?: string;
  onBookContractor: (contractor: Contractor, prefill?: SetuBookingPrefill) => void;
  onFilterCategory: (category: string) => void;
  onOpenBudgetJobPost?: (prefill?: { title?: string; category?: string; budget?: number }) => void;
  onOpenLocationPicker?: () => void;
}

function detectCustomSubTopicClient(text = ''): string {
  const q = (text || '').toLowerCase();
  if (/मंदिर|mandir|temple|पूजा/.test(q)) return 'mandir';
  if (/काउंटर|counter|दुकान|shop|showroom|कैफे|cafe/.test(q)) return 'counter';
  if (/ड्रेसिंग|dressing|vanity|आईना|mirror/.test(q)) return 'dressing';
  if (/झूला|jhula|jhoola|swing/.test(q)) return 'jhula';
  if (/ऑफिस|office|study|डेस्क|desk|केबिन|cabin/.test(q)) return 'office';
  return '';
}

const BUDGET_PRESETS = [
  { labelHi: 'बजट तय नहीं', labelEn: 'No Cap', value: 0 },
  { labelHi: '₹15,000 तक', labelEn: 'Up to ₹15k', value: 15000 },
  { labelHi: '₹30,000 तक', labelEn: 'Up to ₹30k', value: 30000 },
  { labelHi: '₹60,000 तक', labelEn: 'Up to ₹60k', value: 60000 },
  { labelHi: '₹2 लाख+', labelEn: '₹2L+', value: 250000 },
];

// Clean raw LLM text artifacts (stray HTML tags, excessive asterisks) safely for mobile React Native Text
function sanitizeAiDisplayText(raw?: string | null): string {
  return String(raw || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\[([^\]]+)\]\((?:javascript|vbscript|data):[^)]*\)/gi, '$1')
    .trim();
}

export const SetuAIStudioModal: React.FC<SetuAIStudioModalProps> = ({
  visible,
  onClose,
  language,
  currentLocation,
  contractors,
  materials,
  initialPrompt = '',
  onBookContractor,
  onFilterCategory,
  onOpenBudgetJobPost,
  onOpenLocationPicker,
}) => {
  const isEn = language === 'en';
  const cityLabel = (currentLocation || 'भोपाल').split('•')[0].trim();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string>('');
  const [pendingPhotoBase64, setPendingPhotoBase64] = useState<string>('');

  // Active workspace context across turns (prevents category drift like Bed -> Kitchen)
  const [activeSitePhotoUri, setActiveSitePhotoUri] = useState<string>('');
  const [activeSitePhotoBase64, setActiveSitePhotoBase64] = useState<string>('');
  const [sceneContextPrompt, setSceneContextPrompt] = useState<string>('');
  const [activeProjectType, setActiveProjectType] = useState<string>('');
  const [activeCustomTopic, setActiveCustomTopic] = useState<string>('');
  const [lastSelectedProducts, setLastSelectedProducts] = useState<ShowroomProduct[]>([]);
  const [manualPickerMsgId, setManualPickerMsgId] = useState<string | null>(null);

  // Customer Budget & Pre-Quote Drawer state
  const [customerBudget, setCustomerBudget] = useState<number>(0);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('');
  const [showBudgetDrawer, setShowBudgetDrawer] = useState<boolean>(false);
  const [quotePromptMsgId, setQuotePromptMsgId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const scrollRef = useRef<any>(null);
  const isSendingRef = useRef<boolean>(false);
  const sessionSeqRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const lastHandledPromptRef = useRef<string>('');
  const ttsActiveRef = useRef<boolean>(false);

  // Stop speechSynthesis & active microphone stream automatically whenever modal closes or unmounts
  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    if (!visible) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      resetTimer = setTimeout(() => {
        setSpeakingMsgId(null);
        setIsListening(false);
      }, 0);
    }
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [visible]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  const speakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      Alert.alert(
        isEn ? 'Audio Playback' : 'ऑडियो सूचना',
        isEn
          ? 'Voice reading is available on supported browsers.'
          : 'आवाज़ में सुनने की सुविधा अभी आपके डिवाइस ब्राउज़र में उपलब्ध नहीं है।'
      );
      return;
    }
    try {
      if (speakingMsgId === msgId) {
        ttsActiveRef.current = false;
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleaned = sanitizeAiDisplayText(text);
      const rawChunks = cleaned
        .split(/(?<=[।.!?])\s+|\n+/)
        .map((c) => c.trim())
        .filter(Boolean);
      const chunks = rawChunks.length > 0 ? rawChunks : [cleaned.slice(0, 240)];

      ttsActiveRef.current = true;
      setSpeakingMsgId(msgId);
      let chunkIdx = 0;

      const speakNextChunk = () => {
        if (!ttsActiveRef.current || chunkIdx >= chunks.length) {
          ttsActiveRef.current = false;
          setSpeakingMsgId(null);
          return;
        }
        const utterance = new SpeechSynthesisUtterance(chunks[chunkIdx]);
        utterance.lang = isEn ? 'en-IN' : 'hi-IN';
        utterance.rate = 0.96;
        utterance.onend = () => {
          chunkIdx += 1;
          speakNextChunk();
        };
        utterance.onerror = () => {
          ttsActiveRef.current = false;
          setSpeakingMsgId(null);
        };
        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    } catch {
      ttsActiveRef.current = false;
      setSpeakingMsgId(null);
    }
  };

  const handleResetChat = () => {
    sessionSeqRef.current += 1;
    ttsActiveRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setMessages([]);
    setInputText('');
    setPendingPhotoUri('');
    setPendingPhotoBase64('');
    setActiveSitePhotoUri('');
    setActiveSitePhotoBase64('');
    setSceneContextPrompt('');
    setActiveProjectType('');
    setActiveCustomTopic('');
    setLastSelectedProducts([]);
    setManualPickerMsgId(null);
    setQuotePromptMsgId(null);
    setSpeakingMsgId(null);
    setIsListening(false);
    setIsLoading(false);
    isSendingRef.current = false;
  };

  const handleClearActiveSitePhoto = () => {
    setActiveSitePhotoUri('');
    setActiveSitePhotoBase64('');
    setSceneContextPrompt('');
  };

  const handleAttachPhoto = async (source: 'camera' | 'gallery') => {
    const picked =
      source === 'camera' ? await capturePhotoFromCamera() : await pickImageFromGallery();
    if (!picked) return;
    setPendingPhotoUri(picked.uri);
    setPendingPhotoBase64(picked.base64 || picked.uri);
    setActiveSitePhotoUri(picked.uri);
    setActiveSitePhotoBase64(picked.base64 || picked.uri);
    setSceneContextPrompt('');
  };

  const triggerInPlaceEdit = useCallback(
    async (
      targetMsgId: string,
      sitePhotoB64: string,
      editPrompt: string,
      seed = 0,
      preferServer = true
    ) => {
      if (!sitePhotoB64 || !editPrompt) return;
      const seqAtStart = sessionSeqRef.current;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetMsgId && m.payload
            ? { ...m, payload: { ...m.payload, isEditingInPhoto: true, inPhotoEditError: null } }
            : m
        )
      );

      let editRes: any = null;
      try {
        editRes = await ApiService.editPhotoInPlace({
          imageBase64: sitePhotoB64,
          editPrompt,
          seed,
          preferServer,
        });
      } catch (editErr: any) {
        editRes = { success: false, error: editErr?.message || 'In-photo edit failed' };
      }

      if (seqAtStart !== sessionSeqRef.current) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== targetMsgId || !m.payload) return m;
          if (editRes?.success && editRes?.editedImageBase64) {
            return {
              ...m,
              payload: {
                ...m.payload,
                editedImageBase64: editRes.editedImageBase64,
                isEditingInPhoto: false,
                inPhotoEditError: null,
              },
            };
          }
          return {
            ...m,
            payload: {
              ...m.payload,
              isEditingInPhoto: false,
              inPhotoEditError: editRes?.quotaExceeded
                ? 'QUOTA_EXCEEDED'
                : editRes?.error || 'In-photo edit failed',
            },
          };
        })
      );
    },
    []
  );

  const handleSendMessage = useCallback(
    async (
      overrideText?: string,
      chosenProducts?: ShowroomProduct[],
      regenerateSeed = 0,
      quoteRequested = false,
      budgetOverride?: number
    ) => {
      if (isSendingRef.current || isLoading) return;
      const textToSend = (overrideText !== undefined ? overrideText : inputText).trim();
      const photoToSendUri = pendingPhotoUri;
      const photoToSendB64 = pendingPhotoBase64 || activeSitePhotoBase64;
      const activeBudget = budgetOverride !== undefined ? budgetOverride : customerBudget;

      if (!textToSend && !photoToSendUri) return;
      const seqAtSend = sessionSeqRef.current;
      isSendingRef.current = true;

      const userMsg: ChatMessage = {
        id: 'u_' + Date.now(),
        role: 'user',
        text:
          textToSend ||
          (isEn ? 'Uploaded site photo — please inspect & advise.' : 'यह फोटो देखें और सही मॉडल बताएं।'),
        photoUri: photoToSendUri || undefined,
      };

      const apiHistory = [...messages, userMsg].slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
        hasImage: !!m.photoUri,
      }));
      setMessages((prev) => [...prev, userMsg].slice(-25));
      if (overrideText === undefined) setInputText('');
      setPendingPhotoUri('');
      setPendingPhotoBase64('');
      setManualPickerMsgId(null);
      setQuotePromptMsgId(null);
      setIsLoading(true);
      scrollToBottom();

      // Keep activeProjectType sharp while switching immediately on new item OR custom-to-custom subtopic switch
      const customSubTopic = detectCustomSubTopicClient(textToSend);
      const explicitCustomTopic = Boolean(customSubTopic);
      const detectedCurrent = normalizeProjectType(undefined, textToSend);
      const switchedCustomSubtopic = Boolean(
        explicitCustomTopic && activeCustomTopic && customSubTopic !== activeCustomTopic
      );
      const switchedProject = Boolean(
        switchedCustomSubtopic ||
          (activeProjectType &&
            ((detectedCurrent !== 'custom' && detectedCurrent !== activeProjectType) ||
              (explicitCustomTopic && activeProjectType !== 'custom')))
      );

      if (switchedProject) {
        setLastSelectedProducts([]);
      }
      if (explicitCustomTopic) {
        setActiveCustomTopic(customSubTopic);
      } else if (detectedCurrent !== 'custom') {
        setActiveCustomTopic('');
      }

      const effectiveActiveProject = explicitCustomTopic
        ? 'custom'
        : detectedCurrent !== 'custom'
        ? detectedCurrent
        : activeProjectType;

      // Optimize network bandwidth: compact pro/material metadata + skip re-sending heavy imageBase64 when sceneContextPrompt is already known
      const compactContractors = contractors.slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        dailyWageRate: c.dailyWageRate,
        contractUnitRate: c.contractUnitRate,
      }));
      const compactMaterials = materials.slice(0, 10).map((m) => ({
        id: m.id,
        name: m.name,
        brand: m.brand,
        category: m.category,
        sellingPrice: m.sellingPrice,
        storeName: m.storeName,
      }));
      const shouldSendImageToChat = Boolean(pendingPhotoBase64 || (!sceneContextPrompt && activeSitePhotoBase64));

      let resp: any = null;
      try {
        resp = await Promise.race([
          ApiService.setuChat({
            messages: apiHistory,
            imageBase64: shouldSendImageToChat ? photoToSendB64 : '',
            locality: currentLocation || cityLabel,
            language,
            budget: activeBudget > 0 ? activeBudget : null,
            quoteRequested,
            activeProjectType: effectiveActiveProject,
            platformContractors: compactContractors,
            platformMaterials: compactMaterials,
            selectedProducts: chosenProducts || (switchedProject ? [] : lastSelectedProducts),
            sceneContextPrompt,
            regenerateSeed,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('नेटवर्क टाइमआउट (25s) — कृपया पुनः प्रयास करें।')), 25000)
          ),
        ]);
      } catch (reqErr: any) {
        resp = { success: false, error: reqErr?.message };
      } finally {
        if (seqAtSend === sessionSeqRef.current) {
          setIsLoading(false);
          isSendingRef.current = false;
        }
      }

      if (seqAtSend !== sessionSeqRef.current) return;

      if (resp?.success && resp?.data) {
        const payload: SetuAssistantPayload = resp.data;
        if (payload.sceneContextPrompt) {
          setSceneContextPrompt(payload.sceneContextPrompt);
        }
        if (payload.productPickerProjectType) {
          setActiveProjectType(String(payload.productPickerProjectType));
        }
        if (payload.customerBudget && payload.customerBudget > 0) {
          const parsedB = Number(payload.customerBudget);
          setCustomerBudget(parsedB);
          setCustomBudgetInput(String(parsedB));
        }

        const needsInPlaceEdit = Boolean(
          payload.visualPreviewReady &&
            payload.inPlaceEditRequired &&
            !payload.editedImageBase64 &&
            photoToSendB64
        );
        const assistantId = 'a_' + Date.now();
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          text: sanitizeAiDisplayText(payload.replyText),
          payload: needsInPlaceEdit ? { ...payload, isEditingInPhoto: true } : payload,
        };
        setMessages((prev) => {
          const combined = [...prev, assistantMsg].slice(-25);
          // Prune stale heavy base64 images from older turns (>4 assistant turns old) to prevent mobile RAM bloat
          let assistantSeen = 0;
          for (let i = combined.length - 1; i >= 0; i--) {
            if (combined[i].role === 'assistant') {
              assistantSeen += 1;
              if (assistantSeen > 4 && combined[i].payload?.editedImageBase64) {
                combined[i] = {
                  ...combined[i],
                  payload: { ...combined[i].payload!, editedImageBase64: null },
                };
              }
            }
          }
          return combined;
        });
        scrollToBottom();

        if (needsInPlaceEdit) {
          const fallbackEditPrompt =
            payload.inPlaceEditPrompt ||
            `Keep the exact same room walls, floor, ceiling, doors, windows, camera angle and lighting completely unchanged. Seamlessly install ${payload.visualPlan?.title || 'requested installation'} (${payload.visualPlan?.finishLabel || 'realistic natural wood and stone finish'}) inside this photo, raw DSLR photography, no text.`;
          triggerInPlaceEdit(
            assistantId,
            photoToSendB64,
            fallbackEditPrompt,
            regenerateSeed,
            Boolean(payload.serverHasPaidImageEditor)
          );
        }
      } else {
        const errText =
          resp?.error ||
          (isEn
            ? 'Could not reach SETU right now. Please try again.'
            : 'अभी SETU से जुड़ने में दिक्कत आई, कृपया दोबारा प्रयास करें।');
        const errMsg: ChatMessage = {
          id: 'err_' + Date.now(),
          role: 'assistant',
          text: errText,
        };
        setMessages((prev) => [...prev, errMsg].slice(-25));
        scrollToBottom();
      }
    },
    [
      isLoading,
      inputText,
      pendingPhotoUri,
      pendingPhotoBase64,
      activeSitePhotoBase64,
      customerBudget,
      isEn,
      messages,
      scrollToBottom,
      activeProjectType,
      activeCustomTopic,
      currentLocation,
      cityLabel,
      language,
      contractors,
      materials,
      lastSelectedProducts,
      sceneContextPrompt,
      triggerInPlaceEdit,
    ]
  );

  useEffect(() => {
    if (!visible || !initialPrompt) return;
    if (initialPrompt === lastHandledPromptRef.current && messages.length > 0) return;
    lastHandledPromptRef.current = initialPrompt;
    const timer = setTimeout(() => {
      handleSendMessage(initialPrompt);
    }, 50);
    return () => clearTimeout(timer);
  }, [visible, initialPrompt, messages.length, handleSendMessage]);

  const handleVoiceInput = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    ) {
      try {
        const SpeechRec =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = isEn ? 'en-IN' : 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        setIsListening(true);
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
          setIsListening(false);
          recognitionRef.current = null;
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            handleSendMessage(transcript);
          }
        };
        recognition.onerror = () => {
          recognitionRef.current = null;
          setIsListening(false);
        };
        recognition.onend = () => {
          recognitionRef.current = null;
          setIsListening(false);
        };
        recognition.start();
        return;
      } catch {
        recognitionRef.current = null;
        setIsListening(false);
      }
    }

    Alert.alert(
      isEn ? 'Voice Assistant' : 'बोलकर बताएं',
      isEn
        ? 'Microphone is not supported in this browser view. Please type your need below.'
        : 'कृपया माइक्रोफोन अनुमति दें या नीचे बॉक्स में अपनी बात लिखें।'
    );
  };

  const handleShareQuotationWhatsApp = (q: SetuQuotation, matchedPro?: Contractor) => {
    const itemsText = (q.items || [])
      .map((it) => `• ${it.name} (${it.qtyRate}) — ₹${Number(it.amount || 0).toLocaleString('en-IN')}`)
      .join('\n');

    const msg = `नमस्ते${matchedPro ? ` ${matchedPro.name} जी` : ''},
मैंने *SETU AI* पर अपने काम का कोटेशन व अनुमान बनवाया है:

🏠 *काम:* ${q.projectTitle}
📐 *नाप / अवधि:* ${q.dimensionsSummary} (${q.estimatedDuration})
📍 *शहर/इलाका:* ${currentLocation}

📦 *ज़रूरी सामान विवरण:*
${itemsText || '• साइट विज़िट पर तय किया जाएगा'}

💰 *सामान खर्च:* ₹${Number(q.materialTotal || 0).toLocaleString('en-IN')}
🔨 *कारीगर मजदूरी:* ₹${Number(q.laborTotal || 0).toLocaleString('en-IN')}
✅ *कुल अनुमानित बजट:* ₹${Number(q.grandTotal || 0).toLocaleString('en-IN')}

कृपया साइट विज़िट और पक्के काम के लिए समय बताएं।`;

    openWhatsAppChat(matchedPro?.phone || '', msg);
  };

  const applyCustomBudget = (valStr: string) => {
    setCustomBudgetInput(valStr);
    const parsed = parseInt(valStr.replace(/\D/g, ''), 10);
    setCustomerBudget(!isNaN(parsed) && parsed > 0 ? parsed : 0);
  };

  const logoSource = getSetuLogo(language);
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
        {/* Clean Master Karigar Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoBox}>
              <Image source={logoSource} style={styles.headerLogoImg} resizeMode="cover" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.brandRow}>
                <Text style={styles.brandName}>SETU</Text>
                <View style={styles.expertPill}>
                  <Text style={styles.expertPillText}>
                    {isEn ? 'Master Karigar AI' : 'मास्टर कारीगर AI'}
                  </Text>
                </View>
              </View>
              <View style={styles.headerSubRow}>
                <TouchableOpacity
                  style={styles.headerLocChip}
                  onPress={onOpenLocationPicker}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location" size={11} color="#F59E0B" />
                  <Text style={styles.headerLocText} numberOfLines={1}>
                    {cityLabel}
                  </Text>
                  {onOpenLocationPicker ? (
                    <Ionicons name="chevron-down" size={11} color="#94A3B8" />
                  ) : null}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.headerBudgetChip, customerBudget > 0 && styles.headerBudgetChipActive]}
                  onPress={() => setShowBudgetDrawer((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="wallet-outline" size={11} color={customerBudget > 0 ? '#34D399' : '#CBD5E1'} />
                  <Text style={[styles.headerBudgetText, customerBudget > 0 && styles.headerBudgetTextActive]}>
                    {customerBudget > 0
                      ? `₹${customerBudget.toLocaleString('en-IN')}`
                      : isEn
                      ? 'Set Budget'
                      : 'बजट सेट करें'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            {messages.length > 0 && (
              <TouchableOpacity style={styles.iconCircleBtn} onPress={handleResetChat} activeOpacity={0.8}>
                <Ionicons name="refresh" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconCircleBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Top Budget Selector Drawer */}
        {showBudgetDrawer && (
          <View style={styles.budgetDrawer}>
            <Text style={styles.budgetDrawerLabel}>
              {isEn
                ? 'Choose your target budget — SETU will filter raw material grades & local pros automatically:'
                : 'अपना अनुमानित बजट चुनें — SETU उसी हिसाब से कच्चा माल और कारीगर दिखाएगा:'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.budgetPillsRow}>
                {BUDGET_PRESETS.map((bp) => {
                  const isActive = customerBudget === bp.value;
                  return (
                    <TouchableOpacity
                      key={bp.value}
                      style={[styles.budgetPresetPill, isActive && styles.budgetPresetPillActive]}
                      onPress={() => {
                        setCustomerBudget(bp.value);
                        setCustomBudgetInput(bp.value > 0 ? String(bp.value) : '');
                      }}
                    >
                      <Text style={[styles.budgetPresetText, isActive && styles.budgetPresetTextActive]}>
                        {isEn ? bp.labelEn : bp.labelHi}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.customBudgetRow}>
              <TextInput
                style={styles.customBudgetInput}
                value={customBudgetInput}
                onChangeText={applyCustomBudget}
                keyboardType="numeric"
                placeholder={isEn ? 'Or type custom ₹ (e.g. 25000)' : 'या खुद बजट ₹ लिखें (जैसे 25000)'}
                placeholderTextColor="#64748B"
              />
              <TouchableOpacity
                style={styles.budgetDoneBtn}
                onPress={() => setShowBudgetDrawer(false)}
              >
                <Text style={styles.budgetDoneText}>{isEn ? 'Apply' : 'सेव करें'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeWrap}>
              <View style={styles.welcomeAvatar}>
                <Image source={logoSource} style={styles.welcomeAvatarImg} resizeMode="cover" />
              </View>
              <Text style={styles.welcomeTitle}>
                {isEn ? 'Namaste! I am SETU' : 'नमस्ते! मैं SETU हूँ'}
              </Text>
              <Text style={styles.welcomeSub}>
                {isEn
                  ? 'Your Master Karigar for any work in the world. First preview realistic models crafted from different raw material grades right inside your photo — and when ready, unlock your 3-Way Smart Quotation (Karigar Only / Maal+Karigar / Raw Maal Only).'
                  : 'हर काम का उस्ताद! पहले अपनी जगह की फोटो या जरूरत बताएं — अलग-अलग कच्चे माल में असली मॉडल बनाकर देखें। जब डिज़ाइन दिल को भा जाए, तब एक क्लिक में 3-टाइप कोटेशन पाएं!'}
              </Text>

              <View style={styles.starterStack}>
                {[
                  {
                    icon: '🛏️',
                    text: isEn
                      ? 'Design a new double bed & show raw material wood/mica options'
                      : 'मुझे नया डबल बेड बनवाना है — कच्चा माल व मॉडल दिखाओ',
                  },
                  {
                    icon: '🍳',
                    text: isEn
                      ? 'Design modular kitchen & try different mica/stone models'
                      : 'मुझे नया किचन बनवाना है — अलग-अलग माइका व पत्थर में दिखाओ',
                  },
                  {
                    icon: '🏛️',
                    text: isEn
                      ? 'Custom work (Mandir / TV Unit / Iron Gate / False Ceiling)'
                      : 'कस्टम काम (पूजा मंदिर / टीवी यूनिट / मेन गेट / फॉल सीलिंग) बनवाना है',
                  },
                  {
                    icon: '🏠',
                    text: isEn
                      ? 'Build house on empty plot & test raw materials'
                      : 'खाली प्लॉट पर नया मकान बनवाना है — पहले मॉडल दिखाओ',
                  },
                  {
                    icon: '🔧',
                    text: isEn
                      ? 'Fix water leakage / switchboard spark immediately'
                      : 'घर में नल लीकेज या बिजली की समस्या ठीक करानी है',
                  },
                ].map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.starterChip}
                    onPress={() => handleSendMessage(s.text)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.starterIcon}>{s.icon}</Text>
                    <Text style={styles.starterText}>{s.text}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((msg, idx) => {
              if (msg.role === 'user') {
                return (
                  <View key={msg.id} style={styles.userMsgRow}>
                    <View style={styles.userBubble}>
                      {msg.photoUri ? (
                        <Image
                          source={{ uri: msg.photoUri }}
                          style={styles.userAttachedThumb}
                          resizeMode="cover"
                        />
                      ) : null}
                      <Text style={styles.userMsgText}>{msg.text}</Text>
                    </View>
                  </View>
                );
              }

              const p = msg.payload;
              const normalizedType = normalizeProjectType(
                p?.productPickerProjectType || activeProjectType,
                msg.text
              );
              const matchedPros = p
                ? rankContractorsForProject({
                    contractors,
                    tradeCategory: p.tradeCategory,
                    projectType: normalizedType,
                    locality: p.locality || currentLocation || cityLabel,
                    estimatedLaborBudget: p.threeWayQuotations?.onlyKarigar?.laborTotal || null,
                  })
                : [];
              const matchedPro = matchedPros[0];
              const matchedMats = p
                ? rankSupplierMaterialsForProject({
                    materials,
                    tradeCategory: p.tradeCategory,
                    projectType: normalizedType,
                    customerBudget: customerBudget > 0 ? customerBudget : p.customerBudget,
                    locality: p.locality || currentLocation || cityLabel,
                  })
                : [];

              const isLatestAssistant = idx === messages.length - 1;
              const isExploreStage = p?.interactionStage === 'explore_design' || (p?.visualPreviewReady && !p?.threeWayQuotations?.includeQuotation && p?.intentMode !== 'repair');
              const isPickerVisible = Boolean(
                manualPickerMsgId === msg.id ||
                  (p?.showMaterialPicker && (isLatestAssistant || p?.interactionStage === 'explore_design'))
              );
              const showThreeWay = Boolean(p?.threeWayQuotations?.includeQuotation);

              return (
                <View key={msg.id} style={styles.assistantMsgRow}>
                  <View style={styles.assistantHeaderBar}>
                    <View style={styles.miniSetuBadge}>
                      <Text style={styles.miniSetuText}>SETU</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.ttsBtn}
                      onPress={() => speakText(msg.id, msg.text)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={speakingMsgId === msg.id ? 'volume-high' : 'volume-medium-outline'}
                        size={15}
                        color="#94A3B8"
                      />
                      <Text style={styles.ttsText}>
                        {speakingMsgId === msg.id ? (isEn ? 'Stop' : 'रुकें') : isEn ? 'Listen' : 'सुनें'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.assistantCard}>
                    {p?.isSafetyHazard && p?.safetyMessage ? (
                      <View style={styles.hazardBanner}>
                        <Ionicons name="warning" size={16} color="#FEF2F2" />
                        <Text style={styles.hazardText}>{p.safetyMessage}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.assistantText}>{msg.text}</Text>

                    {/* Visual Model Canvas */}
                    {p?.visualPreviewReady && p?.visualPlan ? (
                      <SpaceDesignCanvas
                        userPhotoUri={activeSitePhotoUri}
                        renderedImageUri={p.editedImageBase64 || p.renderedImageUrl}
                        isEditingPhoto={Boolean(p.isEditingInPhoto)}
                        inPhotoEditError={p.inPhotoEditError}
                        onRetryInPhotoEdit={() =>
                          triggerInPlaceEdit(
                            msg.id,
                            activeSitePhotoBase64,
                            p.inPlaceEditPrompt ||
                              `Keep the exact same room unchanged and install ${p.visualPlan?.title || 'requested finish'} cleanly in place.`,
                            Math.floor(Math.random() * 900000) + 100,
                            Boolean(p.serverHasPaidImageEditor)
                          )
                        }
                        visualPlan={p.visualPlan}
                        language={language}
                        onRegenerateAngle={() =>
                          handleSendMessage(
                            isEn
                              ? 'Generate another realistic design variation with the same raw materials'
                              : 'इसी कच्चे माल में एक नया डिज़ाइन लुक बनाकर दिखाओ',
                            lastSelectedProducts,
                            Math.floor(Math.random() * 900000) + 100
                          )
                        }
                      />
                    ) : null}

                    {/* Raw Materials Showroom Playground ("कच्चा माल चुनकर नया मॉडल बनाएं") */}
                    {isPickerVisible && p?.intentMode !== 'repair' ? (
                      <VisualMaterialPicker
                        key={`${normalizedType}_${activeCustomTopic || 'std'}_${(p?.customMaterialGroups || []).map((g) => g.groupId).join('_')}`}
                        projectType={normalizedType}
                        customGroups={p?.customMaterialGroups}
                        initialSelected={lastSelectedProducts}
                        budget={customerBudget > 0 ? customerBudget : p?.customerBudget}
                        language={language}
                        onSelectionChange={(items) => setLastSelectedProducts(items)}
                        onGenerateWithSelection={(items) => {
                          setLastSelectedProducts(items);
                          const names = items.map((i) => `${i.name} (₹${i.price}/${i.unit})`).join(', ');
                          handleSendMessage(
                            isEn
                              ? `Rebuild my design model realistically using these selected raw materials: ${names}`
                              : `इन चुने हुए कच्चे माल से मेरी जगह का नया असली मॉडल बनाकर दिखाओ: ${names}`,
                            items
                          );
                        }}
                        onRequestFinalQuote={(items) => {
                          setLastSelectedProducts(items);
                          setQuotePromptMsgId(msg.id);
                        }}
                      />
                    ) : null}

                    {/* Quick button to reopen raw material picker when hidden */}
                    {!isPickerVisible && p?.intentMode !== 'repair' && (p?.visualPreviewReady || showThreeWay) ? (
                      <TouchableOpacity
                        style={styles.changeMicaBtn}
                        onPress={() => setManualPickerMsgId(msg.id)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="color-palette-outline" size={14} color="#FBBF24" />
                        <Text style={styles.changeMicaText}>
                          {isEn
                            ? 'Play With Different Raw Material Quality & Rates'
                            : 'अलग-अलग कच्चा माल (रेट & क्वालिटी) चुनकर मॉडल बदलें'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {/* Dedicated On-Demand "Now Give Me 3-Way Quotation" Confirmation Strip */}
                    {(isExploreStage && !isPickerVisible) || quotePromptMsgId === msg.id ? (
                      <View style={styles.quoteCtaCard}>
                        <View style={styles.quoteCtaHeader}>
                          <Ionicons name="calculator" size={16} color="#10B981" />
                          <Text style={styles.quoteCtaTitle}>
                            {isEn ? 'Ready For Exact Budget & 3-Way Quotation?' : 'डिज़ाइन पसंद आया? अब 3-टाइप कोटेशन पाएं!'}
                          </Text>
                        </View>
                        <Text style={styles.quoteCtaSub}>
                          {isEn
                            ? `Based on ${cityLabel} rates — get: ① Only Karigar ② Maal+Karigar ③ Only Raw Maal`
                            : `📍 ${cityLabel} के हिसाब से: ① बिना माल (सिर्फ कारीगर) ② माल + कारीगर ③ केवल कच्चा माल`}
                        </Text>

                        {/* Optional Inline Budget Input Before Generating Final Quote */}
                        <View style={styles.inlineBudgetRow}>
                          <TextInput
                            style={styles.inlineBudgetInput}
                            value={customBudgetInput}
                            onChangeText={applyCustomBudget}
                            keyboardType="numeric"
                            placeholder={isEn ? 'Target Budget ₹ (Optional)' : 'अपना बजट ₹ लिखें (वैकल्पिक)'}
                            placeholderTextColor="#64748B"
                          />
                          {onOpenLocationPicker ? (
                            <TouchableOpacity style={styles.inlineLocBtn} onPress={onOpenLocationPicker}>
                              <Ionicons name="location-outline" size={13} color="#FBBF24" />
                              <Text style={styles.inlineLocText} numberOfLines={1}>
                                {cityLabel}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={styles.getQuoteFinalBtn}
                          onPress={() =>
                            handleSendMessage(
                              customerBudget > 0
                                ? `मुझे अब ₹${customerBudget.toLocaleString('en-IN')} बजट और ${cityLabel} लोकेशन के अनुसार तीनों प्रकार (बिना माल केवल कारीगर, माल + कारीगर, और केवल माल) का कोटेशन दो`
                                : `मुझे अब ${cityLabel} लोकेशन के अनुसार तीनों प्रकार (बिना माल केवल कारीगर, माल + कारीगर, और केवल माल) का पक्का कोटेशन दो`,
                              lastSelectedProducts,
                              0,
                              true,
                              customerBudget
                            )
                          }
                          activeOpacity={0.88}
                        >
                          <Ionicons name="document-text" size={16} color="#022C22" />
                          <Text style={styles.getQuoteFinalText}>
                            {isEn ? 'Generate 3-Type Quotation Now' : '📋 मुझे अब 3-टाइप कोटेशन दो'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {/* 3-TYPE SMART QUOTATION CARD (On-Demand After Exploration) */}
                    {showThreeWay && p?.threeWayQuotations ? (
                      <ThreeWayQuotationCard
                        quotation={p.threeWayQuotations}
                        matchedPro={matchedPro}
                        language={language}
                        onBookMode={(mode: QuoteModeKey, amount: number, summaryText: string) => {
                          if (!matchedPro) {
                            onClose();
                            onFilterCategory(p?.tradeCategory || 'all');
                            return;
                          }
                          const chosenMode =
                            mode === 'only_karigar'
                              ? matchedPro.dailyWageRate
                                ? 'दिहाड़ी'
                                : 'ठेका'
                              : matchedPro.contractUnitRate
                              ? 'ठेका'
                              : matchedPro.dailyWageRate
                              ? 'दिहाड़ी'
                              : 'भाव_पूछें';
                          onClose();
                          onBookContractor(matchedPro, {
                            mode: chosenMode,
                            includeMaterials: mode === 'material_and_karigar',
                            initialLaborEstimate:
                              mode === 'only_material'
                                ? 0
                                : Number(p.threeWayQuotations?.onlyKarigar?.laborTotal || 0),
                            initialMaterialEstimate:
                              mode === 'material_and_karigar'
                                ? Number(p.threeWayQuotations?.materialAndKarigar?.materialTotal || 0)
                                : 0,
                            description: `${summaryText} • अनुमान: ₹${Number(amount || 0).toLocaleString('en-IN')}`,
                          });
                        }}
                        onChangeMaterials={() => setManualPickerMsgId(msg.id)}
                        onAdjustBudget={() => {
                          const projectDefaultFloor =
                            normalizedType === 'house'
                              ? 350000
                              : ['kitchen', 'wardrobe', 'bathroom'].includes(normalizedType)
                              ? 35000
                              : 18000;
                          const targetB = customerBudget > 0 ? customerBudget : projectDefaultFloor;
                          setLastSelectedProducts([]);
                          handleSendMessage(
                            isEn
                              ? `Suggest cheaper budget-friendly raw materials under ₹${targetB} for this same design and show updated 3-way quotation`
                              : `इसी डिज़ाइन को मेरे ₹${targetB.toLocaleString('en-IN')} बजट में फिट करने के लिए किफ़ायती कच्चा माल और नया 3-टाइप कोटेशन दो`,
                            [],
                            0,
                            true,
                            targetB
                          );
                        }}
                      />
                    ) : null}

                    {/* Legacy Single Quotation Receipt ONLY for Quick Repairs */}
                    {!showThreeWay && p?.quotation?.includeQuotation ? (
                      <View style={styles.quoteCard}>
                        <View style={styles.quoteHeader}>
                          <Text style={styles.quoteTitle}>📋 {p.quotation.projectTitle}</Text>
                          <Text style={styles.quoteMeta}>
                            {p.quotation.dimensionsSummary} • {p.quotation.estimatedDuration}
                          </Text>
                        </View>

                        {(p.quotation.items || []).map((item, qIdx) => (
                          <View key={qIdx} style={styles.quoteItemRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.quoteItemName}>{item.name}</Text>
                              <Text style={styles.quoteItemSub}>{item.qtyRate}</Text>
                            </View>
                            <Text style={styles.quoteItemPrice}>
                              ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                            </Text>
                          </View>
                        ))}

                        <View style={styles.quoteDivider} />
                        <View style={styles.quoteGrandRow}>
                          <Text style={styles.quoteGrandLabel}>
                            {isEn ? 'Estimated Total' : 'अनुमानित खर्च'}
                          </Text>
                          <Text style={styles.quoteGrandVal}>
                            ₹{Number(p.quotation.grandTotal || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.waShareBtn}
                          onPress={() => handleShareQuotationWhatsApp(p.quotation!, matchedPro)}
                          activeOpacity={0.85}
                        >
                          <FontAwesome5 name="whatsapp" size={14} color="#FFFFFF" />
                          <Text style={styles.waShareText}>
                            {isEn ? 'Send Quotation on WhatsApp' : 'WhatsApp पर कोटेशन भेजें'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {/* Master Karigar Tip */}
                    {p?.upsellPrompt ? (
                      <View style={styles.upsellBox}>
                        <Ionicons name="bulb-outline" size={15} color="#FBBF24" />
                        <Text style={styles.upsellText}>{p.upsellPrompt}</Text>
                      </View>
                    ) : null}

                    {/* Location & Budget Filtered Raw Material Suppliers */}
                    {(showThreeWay || p?.intentMode === 'repair') && matchedMats.length > 0 && (
                      <View style={styles.matStrip}>
                        <Text style={styles.stripHeading}>
                          🏪 {cityLabel} {isEn ? 'Verified Raw Material Suppliers:' : 'के सत्यापित सप्लायर (आपके बजट व काम के अनुसार):'}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {matchedMats.map((m) => (
                              <TouchableOpacity
                                key={m.id}
                                style={styles.matChipCard}
                                onPress={() => {
                                  const vendorShowroomItem: ShowroomProduct = {
                                    id: m.id,
                                    name: m.name,
                                    brand: m.brand || 'Verified Supplier',
                                    qualitySpec: `${m.brand || 'Verified'} • ${m.unit || 'इकाई'} थोक दर`,
                                    tier: 'standard',
                                    price: Number(m.sellingPrice) || 0,
                                    unit: m.unit || 'यूनिट',
                                    approxQtyMultiplier: 1,
                                    supplierName: m.storeName || cityLabel,
                                    imageUrl: m.image || '',
                                    visualDescriptor: `${m.name} (${m.brand}) finish`,
                                  };
                                  const nextPicked = [
                                    vendorShowroomItem,
                                    ...lastSelectedProducts.filter((x) => x.id !== vendorShowroomItem.id),
                                  ];
                                  setLastSelectedProducts(nextPicked);
                                  handleSendMessage(
                                    isEn
                                      ? `Use ${m.name} (₹${m.sellingPrice}) in my 3-way quotation`
                                      : `मेरे कोटेशन में ${m.name} (₹${m.sellingPrice}) जोड़कर नया हिसाब बताओ`,
                                    nextPicked,
                                    0,
                                    true
                                  );
                                }}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.matChipName} numberOfLines={2}>
                                  {m.name}
                                </Text>
                                <Text style={styles.matChipPrice}>
                                  ₹{m.sellingPrice.toLocaleString('en-IN')} / {m.unit}
                                </Text>
                                <Text style={styles.matChipStore} numberOfLines={1}>
                                  📍 {m.storeName}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}

                    {/* Location & Budget Filtered Verified Karigars (Shown in Quote Ready or Urgent Repair) */}
                    {matchedPro && (showThreeWay || p?.intentMode === 'repair' || p?.websiteAction === 'BOOK_PRO') ? (
                      <View style={styles.proMatchCard}>
                        <Text style={styles.matchedProBanner}>
                          👷 {cityLabel} {isEn ? 'Best Matched Verified Pro:' : 'में आपके काम व बजट के बेस्ट कारीगर:'}
                        </Text>
                        <View style={styles.proInfoRow}>
                          <Image source={{ uri: matchedPro.avatar }} style={styles.proAvatar} />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={styles.proName} numberOfLines={1}>
                                {matchedPro.name}
                              </Text>
                              {matchedPro.verified && (
                                <MaterialIcons name="verified" size={14} color="#38BDF8" />
                              )}
                            </View>
                            <Text style={styles.proMeta} numberOfLines={1}>
                              {matchedPro.specialtyHindi} • {matchedPro.rating > 0 ? `★ ${matchedPro.rating}` : (isEn ? 'New Pro' : 'नया प्रो')} •{' '}
                              {matchedPro.dailyWageRate
                                ? `₹${matchedPro.dailyWageRate}/दिन`
                                : matchedPro.contractUnitRate
                                ? `₹${matchedPro.contractUnitRate} (${matchedPro.unitLabel})`
                                : 'रेट पूछें'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.proActionsRow}>
                          <TouchableOpacity
                            style={styles.bookNowBtn}
                            onPress={() => {
                              onClose();
                              onBookContractor(matchedPro, {
                                description: p?.threeWayQuotations?.projectTitle
                                  ? `${p.threeWayQuotations.projectTitle} (${cityLabel})`
                                  : undefined,
                              });
                            }}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.bookNowText}>
                              {isEn ? 'Book Now' : '📅 अभी बुक करें'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.seeAllProsBtn}
                            onPress={() => {
                              onClose();
                              onFilterCategory(p?.tradeCategory || 'all');
                            }}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.seeAllProsText}>
                              {isEn ? 'View All Pros' : 'सभी कारीगर देखें'}
                            </Text>
                          </TouchableOpacity>

                          {onOpenBudgetJobPost ? (
                            <TouchableOpacity
                              style={styles.seeAllProsBtn}
                              onPress={() => {
                                const suggestedBudget =
                                  customerBudget > 0
                                    ? customerBudget
                                    : p?.customerBudget || p?.threeWayQuotations?.materialAndKarigar?.grandTotal || 0;
                                onClose();
                                onOpenBudgetJobPost({
                                  title: p?.threeWayQuotations?.projectTitle || p?.visualPlan?.title || '',
                                  category: p?.tradeCategory || 'general',
                                  budget: suggestedBudget > 0 ? suggestedBudget : undefined,
                                });
                              }}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.seeAllProsText}>
                                {isEn ? 'Post Budget' : 'बजट पोस्ट करें'}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    ) : null}

                    {/* Direct Website Action CTA Banner when triggered without matched pro card */}
                    {p?.websiteAction === 'ORDER_MATERIAL' || (p?.websiteAction === 'POST_BUDGET_JOB' && !matchedPro) ? (
                      <TouchableOpacity
                        style={styles.seeAllProsBtn}
                        onPress={() => {
                          if (p.websiteAction === 'ORDER_MATERIAL') {
                            openWhatsAppChat(
                              '',
                              `नमस्ते SETU सप्लायर, मुझे ${cityLabel} में ${p?.visualPlan?.title || 'कच्चा माल'} ऑर्डर करना है। कृपया ताजा थोक रेट भेजें।`
                            );
                          } else if (onOpenBudgetJobPost) {
                            onClose();
                            onOpenBudgetJobPost({
                              title: p?.threeWayQuotations?.projectTitle || p?.visualPlan?.title || '',
                              category: p?.tradeCategory || 'general',
                              budget: customerBudget > 0 ? customerBudget : p?.customerBudget || undefined,
                            });
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.seeAllProsText}>
                          {p.websiteAction === 'ORDER_MATERIAL'
                            ? isEn
                              ? '🪵 Order Raw Material BOM on WhatsApp'
                              : '🪵 सप्लायर से सीधे कच्चा माल मंगाएं'
                            : isEn
                            ? '📢 Post Custom Budget Task Now'
                            : '📢 इस बजट में ओपन जॉब पोस्ट करें'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {/* Contextual Follow-up Chips */}
                    {p?.quickReplies && p.quickReplies.length > 0 ? (
                      <View style={styles.quickRepliesWrap}>
                        {p.quickReplies.slice(0, 4).map((qr, qIdx) => {
                          const isQuoteChip = /कोटेशन|quotation|cotion|quote|रेट/i.test(qr);
                          return (
                            <TouchableOpacity
                              key={qIdx}
                              style={[styles.quickReplyPill, isQuoteChip && styles.quickReplyQuotePill]}
                              onPress={() => {
                                if (qr.includes('रेंज बदल') || qr.includes('कच्चा माल ट्राई') || qr.toLowerCase().includes('change range')) {
                                  setManualPickerMsgId(msg.id);
                                } else if (isQuoteChip) {
                                  handleSendMessage(qr, lastSelectedProducts, 0, true, customerBudget);
                                } else {
                                  handleSendMessage(qr);
                                }
                              }}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.quickReplyText}>{qr}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={styles.loadingText}>
                {isEn ? 'SETU is crafting your model & rates...' : 'SETU आपका मॉडल और कच्चा माल हिसाब तैयार कर रहा है...'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Clean Chat Composer */}
        <View style={styles.composerWrap}>
          {pendingPhotoUri ? (
            <View style={styles.pendingPhotoStrip}>
              <Image source={{ uri: pendingPhotoUri }} style={styles.pendingThumb} />
              <Text style={styles.pendingPhotoLabel} numberOfLines={1}>
                {isEn
                  ? 'Photo ready — tell SETU what to build (e.g. "build double bed here") or tap Send'
                  : 'फोटो तैयार है — लिखें क्या बनवाना है (जैसे "यहाँ बेड बनाना है") या भेजें ➤'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPendingPhotoUri('');
                  setPendingPhotoBase64('');
                }}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : activeSitePhotoUri ? (
            <View style={styles.pendingPhotoStrip}>
              <Image source={{ uri: activeSitePhotoUri }} style={styles.pendingThumb} />
              <Text style={styles.pendingPhotoLabel} numberOfLines={1}>
                {isEn
                  ? 'Active room photo attached for edits — tap × to switch room/photo'
                  : 'आपकी जगह की फोटो सक्रिय है — नई जगह देखने के लिए × दबाकर हटाएं'}
              </Text>
              <TouchableOpacity onPress={handleClearActiveSitePhoto}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.composerRow}>
            <TouchableOpacity
              style={styles.mediaIconBtn}
              onPress={() => handleAttachPhoto('camera')}
              activeOpacity={0.8}
              accessibilityLabel="Camera"
            >
              <Ionicons name="camera-outline" size={21} color="#E2E8F0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaIconBtn}
              onPress={() => handleAttachPhoto('gallery')}
              activeOpacity={0.8}
              accessibilityLabel="Gallery"
            >
              <Ionicons name="image-outline" size={21} color="#E2E8F0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaIconBtn, isListening && styles.micListeningBtn]}
              onPress={handleVoiceInput}
              activeOpacity={0.8}
              accessibilityLabel="Voice"
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={21}
                color={isListening ? '#FFFFFF' : '#F59E0B'}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.composerInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                isListening
                  ? isEn
                    ? 'Listening...'
                    : 'सुन रहा हूँ, बोलें...'
                  : isEn
                  ? 'Ask SETU what to build or repair...'
                  : 'जो बनवाना या रिपेयर कराना है लिखें...'
              }
              placeholderTextColor="#64748B"
              multiline
              maxLength={400}
              onKeyPress={(e: any) => {
                if (Platform.OS === 'web' && e?.nativeEvent?.key === 'Enter' && !e?.nativeEvent?.shiftKey) {
                  e.preventDefault?.();
                  handleSendMessage();
                }
              }}
              onSubmitEditing={() => handleSendMessage()}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() && !pendingPhotoUri) || isLoading ? styles.sendBtnDisabled : null,
              ]}
              onPress={() => handleSendMessage()}
              disabled={(!inputText.trim() && !pendingPhotoUri) || isLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="send" size={17} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 48 : 14,
    paddingBottom: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  headerLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerLogoImg: {
    width: '100%',
    height: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  expertPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  expertPillText: {
    color: '#FBBF24',
    fontSize: 9.5,
    fontWeight: '800',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  headerLocChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    maxWidth: 145,
  },
  headerLocText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  headerBudgetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  headerBudgetChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  headerBudgetText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  headerBudgetTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetDrawer: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 8,
  },
  budgetDrawerLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  budgetPillsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  budgetPresetPill: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  budgetPresetPillActive: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
  },
  budgetPresetText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  budgetPresetTextActive: {
    color: '#A7F3D0',
    fontWeight: '900',
  },
  customBudgetRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  customBudgetInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
  },
  budgetDoneBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
  },
  budgetDoneText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '900',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 14,
    paddingBottom: 24,
  },
  welcomeWrap: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 10,
  },
  welcomeAvatar: {
    width: 68,
    height: 68,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  welcomeAvatarImg: {
    width: '100%',
    height: '100%',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 7,
  },
  welcomeSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  starterStack: {
    width: '100%',
    gap: 9,
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 13,
  },
  starterIcon: {
    fontSize: 17,
  },
  starterText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  userMsgRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  userBubble: {
    maxWidth: '84%',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 10,
  },
  userAttachedThumb: {
    width: 210,
    height: 145,
    borderRadius: 10,
    marginBottom: 6,
  },
  userMsgText: {
    color: '#F8FAFC',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
  },
  assistantMsgRow: {
    alignItems: 'flex-start',
    marginBottom: 18,
    width: '100%',
  },
  assistantHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  miniSetuBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniSetuText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  ttsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  ttsText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  assistantCard: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
  },
  hazardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    padding: 9,
    borderRadius: 10,
    marginBottom: 8,
  },
  hazardText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  assistantText: {
    color: '#F1F5F9',
    fontSize: 13.5,
    lineHeight: 20.5,
    fontWeight: '500',
  },
  quoteCtaCard: {
    backgroundColor: 'rgba(6, 78, 59, 0.45)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
    gap: 7,
  },
  quoteCtaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quoteCtaTitle: {
    color: '#A7F3D0',
    fontSize: 12.5,
    fontWeight: '900',
  },
  quoteCtaSub: {
    color: '#D1FAE5',
    fontSize: 11,
    lineHeight: 16,
  },
  inlineBudgetRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  inlineBudgetInput: {
    flex: 1,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#047857',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 12,
  },
  inlineLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 8,
    maxWidth: 125,
  },
  inlineLocText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  getQuoteFinalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#34D399',
    paddingVertical: 10,
    borderRadius: 10,
  },
  getQuoteFinalText: {
    color: '#022C22',
    fontSize: 12.5,
    fontWeight: '900',
  },
  quoteCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quoteHeader: {
    marginBottom: 8,
  },
  quoteTitle: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '900',
  },
  quoteMeta: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  quoteItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  quoteItemName: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '700',
  },
  quoteItemSub: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  quoteItemPrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: '#475569',
    marginVertical: 7,
  },
  quoteGrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
  },
  quoteGrandLabel: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
  },
  quoteGrandVal: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
  },
  waShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 9,
    marginTop: 9,
  },
  waShareText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  upsellBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 10,
    padding: 9,
    marginTop: 10,
  },
  upsellText: {
    flex: 1,
    color: '#FDE68A',
    fontSize: 11.5,
    lineHeight: 16.5,
    fontWeight: '700',
  },
  matStrip: {
    marginTop: 10,
  },
  stripHeading: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  matChipCard: {
    width: 165,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 8,
  },
  matChipName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  matChipPrice: {
    color: '#34D399',
    fontSize: 11.5,
    fontWeight: '900',
    marginTop: 2,
  },
  matChipStore: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 2,
  },
  proMatchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  matchedProBanner: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 7,
  },
  proInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },
  proAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#334155',
  },
  proName: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  proMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  proActionsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  bookNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  seeAllProsBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  seeAllProsText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  quickRepliesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  quickReplyPill: {
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickReplyQuotePill: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  quickReplyText: {
    color: '#E0E7FF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    color: '#FBBF24',
    fontSize: 12.5,
    fontWeight: '700',
  },
  composerWrap: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  pendingPhotoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pendingThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  pendingPhotoLabel: {
    flex: 1,
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    backgroundColor: '#1E293B',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mediaIconBtn: {
    width: 34,
    height: 36,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micListeningBtn: {
    backgroundColor: '#EF4444',
  },
  composerInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    minHeight: 38,
    maxHeight: 90,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeMicaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  changeMicaText: {
    color: '#FBBF24',
    fontSize: 11.5,
    fontWeight: '900',
  },
  sendBtnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
});
