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
import { SpaceDesignPreview } from './SpaceDesignPreview';

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

export interface SetuAssistantPayload {
  intentMode: 'repair' | 'build_design' | 'rate_quote';
  tradeCategory: string;
  replyText: string;
  askDesignConfirmation?: boolean;
  isSafetyHazard?: boolean;
  safetyMessage?: string;
  visualPlan?: { afterCaption?: string };
  editedImageBase64?: string | null;
  photoEditStatus?: 'needs_photo' | 'disabled' | 'failed';
  quotation?: SetuQuotation;
  upsellPrompt?: string;
  quickReplies?: string[];
  recommendedMaterialIds?: string[];
  websiteAction?: 'NONE' | 'BOOK_PRO' | 'ORDER_MATERIAL' | 'POST_BUDGET_JOB';
}

const photoEditNotices = {
  needs_photo: {
    en: 'Attach a photo of your space to see the design.',
    hi: 'डिज़ाइन देखने के लिए अपनी जगह की फोटो भेजें।',
  },
  disabled: {
    en: 'AI photo editing is currently unavailable.',
    hi: 'AI फोटो एडिट अभी उपलब्ध नहीं है।',
  },
  failed: {
    en: 'The photo edit failed. Try sending your request again.',
    hi: 'फोटो एडिट नहीं हो पाया। अपनी रिक्वेस्ट फिर भेजें।',
  },
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  photoUri?: string;
  originalPhotoUri?: string;
  payload?: SetuAssistantPayload;
}

interface SitePhoto {
  uri: string;
  base64: string;
}

interface SetuAIStudioModalProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  currentLocation: string;
  contractors: Contractor[];
  materials: MaterialItem[];
  initialPrompt?: string;
  onBookContractor: (contractor: Contractor) => void;
  onFilterCategory: (category: string) => void;
  onOpenBudgetJobPost?: () => void;
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
}) => {
  const isEn = language === 'en';
  const cityLabel = (currentLocation || 'भोपाल').split('•')[0].trim();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState<SitePhoto>();
  const [activeSitePhoto, setActiveSitePhoto] = useState<SitePhoto>();

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const scrollRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  const speakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEn ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.96;
      utterance.onstart = () => setSpeakingMsgId(msgId);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingMsgId(null);
    }
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    setInputText('');
    setPendingPhoto(undefined);
    setActiveSitePhoto(undefined);
    setSpeakingMsgId(null);
  };

  const handleAttachPhoto = async (source: 'camera' | 'gallery') => {
    const picked =
      source === 'camera' ? await capturePhotoFromCamera() : await pickImageFromGallery();
    if (!picked) return;
    setPendingPhoto({ uri: picked.uri, base64: picked.base64 || picked.uri });
  };

  const handleSendMessage = useCallback(async (overrideText?: string) => {
    if (isLoading) return;
    const textToSend = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!textToSend && !pendingPhoto) return;
    const sourcePhoto = pendingPhoto ?? activeSitePhoto;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      role: 'user',
      text: textToSend || (isEn ? 'Uploaded site photo — please inspect & advise.' : 'यह फोटो देखें और बताएं।'),
      photoUri: pendingPhoto?.uri,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (overrideText === undefined) setInputText('');
    if (pendingPhoto) setActiveSitePhoto(pendingPhoto);
    setPendingPhoto(undefined);
    setIsLoading(true);
    scrollToBottom();

    const apiHistory = nextMessages.map((m) => ({
      role: m.role,
      text: m.text,
      hasImage: !!m.photoUri,
    }));

    const resp = await ApiService.setuChat({
      messages: apiHistory,
      imageBase64: sourcePhoto?.base64,
      locality: cityLabel,
      language,
      platformContractors: contractors,
      platformMaterials: materials,
    });

    setIsLoading(false);

    if (resp?.success && resp?.data) {
      const payload: SetuAssistantPayload = resp.data;
      const assistantMsg: ChatMessage = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        text: payload.replyText,
        originalPhotoUri: sourcePhoto?.uri,
        payload,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      scrollToBottom();
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
      setMessages((prev) => [...prev, errMsg]);
      scrollToBottom();
    }
  }, [
    isLoading,
    inputText,
    pendingPhoto,
    activeSitePhoto,
    isEn,
    messages,
    scrollToBottom,
    cityLabel,
    language,
    contractors,
    materials,
  ]);

  useEffect(() => {
    if (!visible || !initialPrompt || messages.length > 0) return;
    const timer = setTimeout(() => {
      handleSendMessage(initialPrompt);
    }, 50);
    return () => clearTimeout(timer);
  }, [visible, initialPrompt, messages.length, handleSendMessage]);

  const handleVoiceInput = () => {
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

        recognition.onresult = (event: any) => {
          setIsListening(false);
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            handleSendMessage(transcript);
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch {
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

    openWhatsAppChat(matchedPro?.phone || '9812345678', msg);
  };

  const findBestContractor = (category?: string): Contractor | undefined => {
    if (!contractors || contractors.length === 0) return undefined;
    if (category && category !== 'all') {
      const exact = contractors.find((c) => c.category === category && c.verified);
      if (exact) return exact;
      const anyCat = contractors.find((c) => c.category === category);
      if (anyCat) return anyCat;
    }
    return contractors.find((c) => c.verified) || contractors[0];
  };

  const findMatchedMaterials = (ids?: string[], category?: string): MaterialItem[] => {
    if (!materials || materials.length === 0) return [];
    const byId = (ids || [])
      .map((id) => materials.find((m) => m.id === id || (m as any)._id === id))
      .filter(Boolean) as MaterialItem[];
    if (byId.length > 0) return byId.slice(0, 3);
    if (category && category !== 'all') {
      const byCat = materials.filter((m) => m.category === category);
      if (byCat.length > 0) return byCat.slice(0, 3);
    }
    return [];
  };

  const logoSource = getSetuLogo(language);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Minimal ChatGPT-Style Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoBox}>
              <Image source={logoSource} style={styles.headerLogoImg} resizeMode="cover" />
            </View>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.brandName}>SETU</Text>
                <View style={styles.expertPill}>
                  <Text style={styles.expertPillText}>
                    {isEn ? 'Master Artisan AI' : 'मास्टर कारीगर AI'}
                  </Text>
                </View>
              </View>
              <Text style={styles.brandSub} numberOfLines={1}>
                {cityLabel} • {isEn ? 'Rates, Design & Repairs' : 'डिज़ाइन, रेट & रिपेयर उस्ताद'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {messages.length > 0 && (
              <TouchableOpacity style={styles.iconCircleBtn} onPress={handleResetChat} disabled={isLoading} activeOpacity={0.8}>
                <Ionicons name="refresh" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconCircleBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

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
                  ? 'Your trusted Master Karigar. Send a photo of any repair problem or empty room/plot — I will understand what is needed, calculate exact material & labor costs, and design it on your photo.'
                  : 'आपका अपना अनुभवी कारीगर और कोटेशन उस्ताद। खाली जगह, किचन, अलमारी या किसी खराबी की फोटो भेजें — खर्च, सामान और डिज़ाइन तुरंत मिलेगा।'}
              </Text>

              <View style={styles.starterStack}>
                {[
                  {
                    icon: '🍳',
                    text: isEn
                      ? 'Design modular kitchen & give material budget'
                      : 'मुझे नया किचन बनवाना है — सामान और खर्च बताओ',
                  },
                  {
                    icon: '🏠',
                    text: isEn
                      ? 'Plan house construction rate & layout for my plot'
                      : 'खाली प्लॉट पर घर बनवाना है — नक्शा और रेट बताओ',
                  },
                  {
                    icon: '🔧',
                    text: isEn
                      ? 'Fix water leakage / wiring issue & estimate cost'
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
            messages.map((msg) => {
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
              const matchedPro = p ? findBestContractor(p.tradeCategory) : undefined;
              const matchedMats = p ? findMatchedMaterials(p.recommendedMaterialIds, p.tradeCategory) : [];

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
                    {/* Emergency Hazard Banner if relevant */}
                    {p?.isSafetyHazard && p?.safetyMessage ? (
                      <View style={styles.hazardBanner}>
                        <Ionicons name="warning" size={16} color="#FEF2F2" />
                        <Text style={styles.hazardText}>{p.safetyMessage}</Text>
                      </View>
                    ) : null}

                    {/* Conversational Reply */}
                    <Text style={styles.assistantText}>{msg.text}</Text>

                    {p?.editedImageBase64 && msg.originalPhotoUri ? (
                      <SpaceDesignPreview
                        originalUri={msg.originalPhotoUri}
                        editedUri={p.editedImageBase64}
                        caption={p.visualPlan?.afterCaption}
                        isEn={isEn}
                      />
                    ) : null}
                    {p?.photoEditStatus ? (
                      <Text style={styles.photoEditNotice} accessibilityLiveRegion="polite">
                        {photoEditNotices[p.photoEditStatus][isEn ? 'en' : 'hi']}
                      </Text>
                    ) : null}

                    {/* Clean Itemized Quotation Receipt */}
                    {p?.quotation?.includeQuotation ? (
                      <View style={styles.quoteCard}>
                        <View style={styles.quoteHeader}>
                          <Text style={styles.quoteTitle}>📋 {p.quotation.projectTitle}</Text>
                          <Text style={styles.quoteMeta}>
                            {p.quotation.dimensionsSummary} • {p.quotation.estimatedDuration}
                          </Text>
                        </View>

                        {(p.quotation.items || []).map((item, idx) => (
                          <View key={idx} style={styles.quoteItemRow}>
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

                        <View style={styles.quoteSubtotalRow}>
                          <Text style={styles.quoteSubtotalLabel}>
                            {isEn ? 'Materials Total:' : 'सामान कुल:'}
                          </Text>
                          <Text style={styles.quoteSubtotalVal}>
                            ₹{Number(p.quotation.materialTotal || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.quoteSubtotalRow}>
                          <Text style={styles.quoteSubtotalLabel}>
                            {isEn ? 'Karigar Labor:' : 'कारीगर मजदूरी:'}
                          </Text>
                          <Text style={styles.quoteSubtotalVal}>
                            ₹{Number(p.quotation.laborTotal || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <View style={styles.quoteGrandRow}>
                          <Text style={styles.quoteGrandLabel}>
                            {isEn ? 'Total Estimate' : 'कुल अनुमानित खर्च'}
                          </Text>
                          <Text style={styles.quoteGrandVal}>
                            ₹{Number(p.quotation.grandTotal || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {p.quotation.budgetFitNote ? (
                          <Text style={styles.budgetFitNote}>💡 {p.quotation.budgetFitNote}</Text>
                        ) : null}

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

                    {/* Proactive Upsell Tip (Supplier Mica / Drawer Upgrade) */}
                    {p?.upsellPrompt ? (
                      <View style={styles.upsellBox}>
                        <Ionicons name="diamond-outline" size={15} color="#FBBF24" />
                        <Text style={styles.upsellText}>{p.upsellPrompt}</Text>
                      </View>
                    ) : null}

                    {/* Platform Vendor Materials Strip */}
                    {matchedMats.length > 0 && (
                      <View style={styles.matStrip}>
                        <Text style={styles.stripHeading}>
                          🏪 {isEn ? 'Verified Supplier Items:' : 'सत्यापित दुकानदार का सामान:'}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {matchedMats.map((m) => (
                              <TouchableOpacity
                                key={m.id}
                                style={styles.matChipCard}
                                onPress={() =>
                                  handleSendMessage(
                                    isEn
                                      ? `Use ${m.name} (₹${m.sellingPrice}) in my quotation & design`
                                      : `मेरे डिज़ाइन और कोटेशन में ${m.name} (₹${m.sellingPrice}) जोड़कर दिखाओ`
                                  )
                                }
                                activeOpacity={0.85}
                              >
                                <Text style={styles.matChipName} numberOfLines={1}>
                                  {m.name}
                                </Text>
                                <Text style={styles.matChipPrice}>
                                  ₹{m.sellingPrice} / {m.unit}
                                </Text>
                                <Text style={styles.matChipStore} numberOfLines={1}>
                                  {m.storeName}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}

                    {/* Direct Matched Verified Karigar Card */}
                    {matchedPro && (p?.intentMode === 'repair' || p?.editedImageBase64 || p?.websiteAction === 'BOOK_PRO') ? (
                      <View style={styles.proMatchCard}>
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
                              {matchedPro.specialtyHindi} • ★ {matchedPro.rating} •{' '}
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
                              onBookContractor(matchedPro);
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
                              {isEn ? 'View All' : 'सभी कारीगर देखें'}
                            </Text>
                          </TouchableOpacity>

                          {onOpenBudgetJobPost ? (
                            <TouchableOpacity
                              style={styles.seeAllProsBtn}
                              onPress={() => {
                                onClose();
                                onOpenBudgetJobPost();
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

                    {/* Quick Contextual Follow-up Chips */}
                    {p?.quickReplies && p.quickReplies.length > 0 ? (
                      <View style={styles.quickRepliesWrap}>
                        {p.quickReplies.slice(0, 4).map((qr, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.quickReplyPill}
                            onPress={() => handleSendMessage(qr)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.quickReplyText}>{qr}</Text>
                          </TouchableOpacity>
                        ))}
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
                {isEn ? 'SETU is inspecting & calculating...' : 'SETU जांच और हिसाब कर रहा है...'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Clean ChatGPT-Style Composer */}
        <View style={styles.composerWrap}>
          {pendingPhoto ? (
            <View style={styles.pendingPhotoStrip}>
              <Image source={{ uri: pendingPhoto.uri }} style={styles.pendingThumb} />
              <Text style={styles.pendingPhotoLabel} numberOfLines={1}>
                {isEn
                  ? 'Photo ready — tell SETU what to fix/build or tap Send ➤'
                  : 'फोटो तैयार है — लिखें क्या बनवाना/ठीक कराना है या सीधा भेजें ➤'}
              </Text>
              <TouchableOpacity onPress={() => setPendingPhoto(undefined)}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
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
                  ? 'Ask SETU or send a photo...'
                  : 'SETU से पूछें (उदा. यहाँ किचन बनाना है)...'
              }
              placeholderTextColor="#64748B"
              multiline
              maxLength={400}
              onSubmitEditing={() => handleSendMessage()}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() && !pendingPhoto) || isLoading ? styles.sendBtnDisabled : null,
              ]}
              onPress={() => handleSendMessage()}
              disabled={(!inputText.trim() && !pendingPhoto) || isLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="send" size={17} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 48 : 14,
    paddingBottom: 12,
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
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  expertPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  expertPillText: {
    color: '#FBBF24',
    fontSize: 9.5,
    fontWeight: '800',
  },
  brandSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
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
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 14,
    paddingBottom: 24,
  },
  welcomeWrap: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 10,
  },
  welcomeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 14,
  },
  welcomeAvatarImg: {
    width: '100%',
    height: '100%',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  welcomeSub: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  starterStack: {
    width: '100%',
    gap: 10,
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  starterIcon: {
    fontSize: 18,
  },
  starterText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12.5,
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
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
  },
  photoEditNotice: {
    marginTop: 10,
    color: '#FCD34D',
    fontSize: 13,
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
  quoteSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  quoteSubtotalLabel: {
    color: '#CBD5E1',
    fontSize: 11.5,
  },
  quoteSubtotalVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quoteGrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#475569',
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
  budgetFitNote: {
    color: '#34D399',
    fontSize: 11,
    marginTop: 5,
    fontWeight: '700',
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
    fontSize: 12,
    lineHeight: 17,
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
    width: 155,
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
    maxHeight: 90,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
});
