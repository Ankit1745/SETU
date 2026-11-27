import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  BHOPAL_MARKET_INDEX,
  INITIAL_MATERIALS,
  Contractor,
  MaterialItem,
  MegaContract,
  QuickServiceItem,
} from '../data/mockData';
import { showAppAlert } from '../utils/appAlert';
import { ContractorCard } from '../components/ContractorCard';
import { BookingModal } from '../components/BookingModal';
import { ContractorDetailModal } from '../components/ContractorDetailModal';
import { QuickServiceModal } from '../components/QuickServiceModal';
import { MegaContractModal } from '../components/MegaContractModal';
import { RateSurveyModal } from '../components/RateSurveyModal';
import { SetuAIStudioModal, SetuBookingPrefill } from '../components/SetuAIStudioModal';
import { COLORS } from '../theme/colors';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { getSetuLogo } from '../constants/logos';
import { useResponsive } from '../hooks/useResponsive';
import { ORDERED_15_TRADES, normalizeTradeCategory } from '../data/tradeRateConfig';

interface CustomerHomeProps {
  contractors: Contractor[];
  materials?: MaterialItem[];
  currentLocation: string;
  isLocationPickerOpen?: boolean;
  onOpenLocationPicker: () => void;
  onNewBookingCreated: (booking: any) => void;
  showQuickModalDirectly?: boolean;
  onCloseQuickModalDirectly?: () => void;
  showEstimatorDirectly?: boolean;
  onCloseEstimatorDirectly?: () => void;
  language?: Language;
}

function safeLocalGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage?.getItem(key) ?? null : null;
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage?.setItem(key, value);
  } catch {
    // Ignore quota / private browsing errors
  }
}

function safeLocalRemove(key: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage?.removeItem(key);
  } catch {
    // Ignore
  }
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  contractors,
  materials = INITIAL_MATERIALS,
  currentLocation,
  isLocationPickerOpen = false,
  onOpenLocationPicker,
  onNewBookingCreated,
  showQuickModalDirectly = false,
  onCloseQuickModalDirectly,
  showEstimatorDirectly = false,
  onCloseEstimatorDirectly,
  language = 'hi',
}) => {
  const t = TRANSLATIONS[language];
  const {
    width,
    isTabletOrDesktop,
    isSplitDesktop,
    isDesktop,
    horizontalPadding,
    shellStyle,
    getModalStyles,
  } = useResponsive();
  const proCols = width >= 1180 ? 3 : width >= 720 ? 2 : 1;
  const proCardWidth = proCols === 3 ? '32.2%' : proCols === 2 ? '48.8%' : '100%';
  const postModalResponsive = getModalStyles({ maxWidth: 620 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeed, setSelectedNeed] = useState<'ALL' | 'QUICK' | 'CONSTRUCTION' | 'WEDDING' | 'MATERIALS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRateType, setSelectedRateType] = useState<string>('ALL');

  // Real Speech Recognition
  const [isListening, setIsListening] = useState(false);

  // Unified SETU AI Studio & Modals state
  const [showSetuAI, setShowSetuAI] = useState(false);
  const [setuInitialPrompt, setSetuInitialPrompt] = useState('');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showRateSurveyModal, setShowRateSurveyModal] = useState(false);
  const [selectedMegaContract, setSelectedMegaContract] = useState<MegaContract | null>(null);
  const [selectedContractorForBooking, setSelectedContractorForBooking] = useState<Contractor | null>(() => {
    if (typeof window === 'undefined' || !contractors || contractors.length === 0) return null;
    const hash = window.location?.hash || '';
    const matchBooking = hash.match(/booking=([^&]+)/);
    const targetBookingId = matchBooking ? matchBooking[1] : safeLocalGet('setu_active_contractor_booking');
    return targetBookingId
      ? contractors.find((c) => c.id === targetBookingId || (c as any).customId === targetBookingId || (c as any).userId === targetBookingId) || null
      : null;
  });
  const [bookingPrefill, setBookingPrefill] = useState<SetuBookingPrefill | null>(null);
  const [selectedContractorForDetail, setSelectedContractorForDetail] = useState<Contractor | null>(() => {
    if (typeof window === 'undefined' || !contractors || contractors.length === 0) return null;
    const hash = window.location?.hash || '';
    const matchDetail = hash.match(/contractor=([^&]+)/);
    const targetDetailId = matchDetail ? matchDetail[1] : safeLocalGet('setu_active_contractor_detail');
    return targetDetailId
      ? contractors.find((c) => c.id === targetDetailId || (c as any).customId === targetDetailId || (c as any).userId === targetDetailId) || null
      : null;
  });

  // Custom Job Posting (Task & Budget Posting)
  const [showPostTaskModal, setShowPostTaskModal] = useState(false);
  const [postTaskTitle, setPostTaskTitle] = useState('');
  const [postTaskBudget, setPostTaskBudget] = useState('');
  const [postTaskAddress, setPostTaskAddress] = useState('');
  const [postTaskCategory, setPostTaskCategory] = useState<string>('carpenter');
  const scrollViewRef = React.useRef<any>(null);
  const [prosSectionY, setProsSectionY] = useState<number>(0);

  const handlePostTaskSubmit = () => {
    const budgetNum = Number(postTaskBudget.trim());
    const finalSiteAddr = (postTaskAddress.trim() || currentLocation.split('•')[0].trim() || 'भोपाल');
    if (postTaskTitle.trim().length < 5) {
      showAppAlert(
        language === 'en' ? 'Mandatory Work Description (*)' : 'काम का विवरण अनिवार्य (*)',
        language === 'en' ? 'Please describe the work needed (at least 5 characters).' : 'कृपया कम से कम 5 अक्षरों में स्पष्ट लिखें कि क्या काम करवाना है।'
      );
      return;
    }
    if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
      showAppAlert(
        language === 'en' ? 'Mandatory Budget (*)' : 'बजट राशि अनिवार्य (*)',
        language === 'en' ? 'Please enter a valid positive budget (> 0).' : 'कृपया वैध धनात्मक अनुमानित बजट (₹ > 0) अवश्य लिखें।'
      );
      return;
    }
    const newJob = {
      id: 'jr_' + Date.now(),
      contractorId: 'open_market',
      contractorName: 'ओपन कस्टम जॉब',
      category: postTaskCategory,
      bookingMode: 'भाव_पूछें',
      workType: postTaskTitle.trim(),
      hiringType: 'ओपन कस्टम जॉब (Budget Offer)',
      customerName: 'सत्यापित ग्राहक',
      location: finalSiteAddr,
      workAddress: finalSiteAddr,
      budgetOffer: Math.round(budgetNum),
      totalLaborAmount: Math.round(budgetNum),
      description: `ग्राहक द्वारा पोस्ट किया गया ओपन टास्क (${finalSiteAddr})। बजट: ₹${Math.round(budgetNum)}`,
      date: 'तत्काल / आज ही',
      status: 'PENDING',
    };
    onNewBookingCreated(newJob);
    setShowPostTaskModal(false);
    setPostTaskTitle('');
    setPostTaskBudget('');
    setPostTaskAddress('');
    showAppAlert(
      language === 'en' ? '🎉 Job Posted Successfully!' : '🎉 आपका काम लाइव हो गया!',
      language === 'en'
        ? `Nearby contractors alerted for "${newJob.workType}" with budget ₹${newJob.budgetOffer}.`
        : `"${newJob.workType}" के लिए पास के कारीगरों को अलर्ट भेज दिया गया है। वे आपके बजट (₹${newJob.budgetOffer}) पर जल्द संपर्क करेंगे।`
    );
  };

  const isQuickModalOpen = showQuickModal || showQuickModalDirectly;
  const isSetuModalOpen = showSetuAI || showEstimatorDirectly;

  const handleOpenContractorDetail = (c: Contractor) => {
    setSelectedContractorForDetail(c);
    if (typeof window !== 'undefined') {
      safeLocalSet('setu_active_contractor_detail', c.id);
      try {
        window.history?.replaceState(null, '', '#contractor=' + c.id);
      } catch {}
    }
  };

  const handleCloseContractorDetail = () => {
    setSelectedContractorForDetail(null);
    if (typeof window !== 'undefined') {
      safeLocalRemove('setu_active_contractor_detail');
      try {
        if (window.location?.hash?.includes('contractor=')) {
          window.history?.replaceState(null, '', window.location.pathname + (window.location.search || ''));
        }
      } catch {}
    }
  };

  const handleOpenBooking = (c: Contractor, prefill?: SetuBookingPrefill) => {
    setBookingPrefill(prefill || null);
    setSelectedContractorForBooking(c);
    if (typeof window !== 'undefined') {
      safeLocalSet('setu_active_contractor_booking', c.id);
      try {
        window.history?.replaceState(null, '', '#booking=' + c.id);
      } catch {}
    }
  };

  const handleCloseBooking = () => {
    setSelectedContractorForBooking(null);
    setBookingPrefill(null);
    if (typeof window !== 'undefined') {
      safeLocalRemove('setu_active_contractor_booking');
      try {
        if (window.location?.hash?.includes('booking=')) {
          window.history?.replaceState(null, '', window.location.pathname + (window.location.search || ''));
        }
      } catch {}
    }
  };

  // Dynamic filter for contractors based on Selected Need, Category, and Rate Type
  const filteredContractors = contractors.filter((c) => {
    const cat = c.category || 'general';
    const normProCat = normalizeTradeCategory(cat);
    // 1. Need filter
    if (selectedNeed === 'QUICK' && !c.isQuickAvailable) return false;
    if (
      selectedNeed === 'CONSTRUCTION' &&
      !['carpenter', 'mason', 'painter', 'electrician', 'plumber', 'tiling', 'false_ceiling', 'welder', 'aluminium_upvc', 'waterproofing', 'ac_repair', 'labor'].includes(normProCat)
    ) {
      return false;
    }
    if (
      selectedNeed === 'WEDDING' &&
      !['wedding_tent', 'caterer', 'wedding_photo', 'wedding_makeup'].includes(normProCat)
    ) {
      return false;
    }
    if (selectedNeed === 'MATERIALS' && (!c.recommendedMaterials || c.recommendedMaterials.length === 0)) return false;

    // 2. Specific Category filter (normalize all aliases seamlessly)
    if (selectedCategory !== 'all') {
      const catNorm = normalizeTradeCategory(selectedCategory);
      if (normProCat !== catNorm) return false;
    }

    // 3. Rate Type filter
    if (selectedRateType !== 'ALL') {
      if (selectedRateType === 'दिहाड़ी' && (!c.dailyWageRate || c.dailyWageRate <= 0)) return false;
      if (selectedRateType !== 'दिहाड़ी' && c.primaryRateType !== selectedRateType) return false;
    }

    // 4. Search query (null-safe)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchSpecialty = (c.specialtyHindi || '').toLowerCase().includes(q);
      const matchSkill = Array.isArray(c.skills) && c.skills.some((s) => String(s).toLowerCase().includes(q));
      if (!matchName && !matchSpecialty && !matchSkill) return false;
    }

    return true;
  });

  const handleCall = (contractor: Contractor) => {
    const directDigits = (contractor.phone || '').replace(/\D/g, '');
    const maskedDigits = (contractor.phoneMasked && !contractor.phoneMasked.includes('XXX'))
      ? contractor.phoneMasked.replace(/\D/g, '')
      : '';
    const rawDigits = directDigits.length >= 10 ? directDigits : maskedDigits;

    if (!rawDigits || rawDigits.length < 10) {
      showAppAlert(
        language === 'en' ? 'Direct Call Unavailable' : 'सीधा कॉल अनुपलब्ध',
        language === 'en'
          ? 'Contractor phone number not available. Please send a booking or quotation request through the app.'
          : 'कारीगर का सीधा फोन नंबर सार्वजनिक नहीं है। कृपया ऐप के माध्यम से बुकिंग या कोटेशन अनुरोध भेजें।'
      );
      return;
    }
    const phone = rawDigits.slice(-10);
    const telUrl = `tel:+91${phone}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = telUrl;
    } else {
      Linking.openURL(telUrl).catch(() => {
        showAppAlert('कॉल डायलर', `कृपया सीधे +91 ${phone} पर डायल करें।`);
      });
    }
  };

  const handleBookingConfirmed = (booking: any) => {
    handleCloseBooking();
    onNewBookingCreated(booking);
    showAppAlert(
      language === 'en' ? '🎉 Booking Confirmed!' : '🎉 बुकिंग सफल!',
      language === 'en'
        ? `Booking sent to ${booking.contractorName}. Token of ₹${booking.escrowAdvanceToken} is safe in SETU Escrow.`
        : `आपकी बुकिंग ${booking.contractorName} के पास भेज दी गई है। ₹${booking.escrowAdvanceToken} का टोकन SETU एस्क्रो में सुरक्षित है।`,
      [{ text: language === 'en' ? 'OK' : 'ठीक है' }]
    );
  };

  const handleQuickDispatch = (service: QuickServiceItem, problem: string) => {
    setShowQuickModal(false);
    if (onCloseQuickModalDirectly) onCloseQuickModalDirectly();
    onNewBookingCreated({
      contractorId: 'c_quick',
      category: service.category || 'general',
      bookingMode: 'क्विक रिपेयर',
      workType: `क्विक रिपेयर: ${service.title}`,
      contractorName: `${service.title} (SETU एक्सप्रेस कारीगर)`,
      totalLaborAmount: service.startingPrice,
      escrowAdvanceToken: 0,
      workAddress: currentLocation,
      description: `इमरजेंसी समस्या: ${problem}`,
      date: 'तत्काल (15 मिनट)',
    });
    showAppAlert(
      language === 'en' ? '⚡ Nearby Pro Dispatched!' : '⚡ नजदीकी कारीगर रवाना!',
      language === 'en'
        ? `Nearby pro alerted for ${service.title}. Reaching your location in 15-20 minutes.`
        : `${service.title} के लिए पास के कारीगर को अलर्ट भेज दिया गया है। 15-20 मिनट में आपकी लोकेशन पर पहुंचेगा।`
    );
  };

  // Real Speech Recognition (Voice AI)
  const handleStartVoiceSearch = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onstart = () => {
            setIsListening(true);
          };

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('');
            setSearchQuery(transcript);
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch (e) {
          console.error('Speech recognition failed to start:', e);
        }
      }
    }

    showAppAlert(
      language === 'en' ? '🎙️ Voice Assistant' : '🎙️ वॉयस असिस्टेंट',
      language === 'en'
        ? 'Please allow microphone access or tap on quick categories below.'
        : 'कृपया ब्राउज़र में माइक्रोफोन अनुमति दें अथवा नीचे दिए गए तुरंत विकल्पों पर टैप करें।'
    );
  };

  const logoSource = getSetuLogo(language);

  return (
    <View style={[styles.container, isTabletOrDesktop && { backgroundColor: '#EFF3F8' }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainScrollContent,
          isTabletOrDesktop && { paddingHorizontal: horizontalPadding, paddingTop: 14, paddingBottom: 48 },
        ]}
      >
        <View style={shellStyle}>
          {/* Hero Row: 3D Spotlight + Search Card side-by-side on Desktop */}
          <View style={isSplitDesktop ? styles.heroSplitRow : undefined}>
            {/* 🌟 3D HERO BRAND SPOTLIGHT CARD */}
            <View
              style={[
                styles.heroSpotlightCard,
                isTabletOrDesktop && { marginHorizontal: 0, marginTop: 0, marginBottom: isSplitDesktop ? 0 : 12 },
                isSplitDesktop && { flex: 1.05, justifyContent: 'space-between', padding: 18 },
              ]}
            >
              <View style={styles.heroSpotlightContent}>
                <View style={styles.heroLogo3DContainer}>
                  <Image source={logoSource} style={styles.heroLogo3DImg} resizeMode="cover" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.heroSpotlightTitle}>
                      {language === 'hi' ? 'सेतु • विश्वसनीय साथी' : 'SETU • Trusted Network'}
                    </Text>
                    <View style={styles.heroLiveBadge}>
                      <View style={styles.heroLiveDot} />
                      <Text style={styles.heroLiveText}>15m LIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.heroSpotlightSub}>
                    {language === 'hi'
                      ? 'भोपाल का 3D स्मार्ट नेटवर्क: 15 मिनट में सत्यापित कारीगर • उचित दरें'
                      : 'Bhopal’s 3D Smart Network: 15-min verified contractors • Fixed Rates'}
                  </Text>
                </View>
              </View>

              {/* Quick Metrics & Trust Badges Strip */}
              <View style={styles.heroMetricsStrip}>
                <View style={styles.heroMetricItem}>
                  <Ionicons name="shield-checkmark" size={13} color="#22C55E" />
                  <Text style={styles.heroMetricText}>
                    {language === 'hi' ? '0% धोखाधड़ी' : '0% Fraud Risk'}
                  </Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetricItem}>
                  <Ionicons name="flash" size={13} color="#EA580C" />
                  <Text style={styles.heroMetricText}>
                    {language === 'hi' ? '15m एक्सप्रेस' : '15m Express'}
                  </Text>
                </View>
                <View style={styles.heroMetricDivider} />
                <View style={styles.heroMetricItem}>
                  <Ionicons name="lock-closed" size={12} color="#0284C7" />
                  <Text style={styles.heroMetricText}>
                    {language === 'hi' ? 'एस्क्रो सुरक्षित' : 'Escrow Safe'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 1. TOP DISCOVERY & SEARCH CARD */}
            <View
              style={[
                styles.topDiscoveryCard,
                isTabletOrDesktop && styles.topDiscoveryCardDesktop,
                isSplitDesktop && { flex: 1, justifyContent: 'center' },
              ]}
            >
          {/* "क्या काम करवाना है?" Search Input */}
          <View style={styles.mainSearchRow}>
            <Ionicons name="search" size={20} color="#2563EB" />
            <TextInput
              style={styles.mainSearchInput}
              placeholder={language === 'hi' ? 'क्या काम करवाना है? (बढ़ई, प्लंबर, वायरिंग, पुट्टी...)' : 'What work do you need? (Carpenter, Plumber, Wiring...)'}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.mainMicBtn, isListening && styles.mainMicBtnActive]}
              onPress={handleStartVoiceSearch}
            >
              <MaterialIcons name="mic" size={20} color={isListening ? '#EF4444' : '#2563EB'} />
            </TouchableOpacity>
          </View>

          {/* Location Selector & Search Action */}
          <View style={styles.locAndActionRow}>
            <TouchableOpacity
              style={styles.localityPickerBtn}
              onPress={onOpenLocationPicker}
              activeOpacity={0.8}
            >
              <Ionicons name="location" size={15} color="#D97706" />
              <Text style={styles.localityPickerText} numberOfLines={1}>
                {currentLocation.split('•')[0].trim() || 'इलाका चुनें (भोपाल)'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.findProsBtn}
              onPress={() => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, prosSectionY - 10), animated: true });
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.findProsBtnText}>
                {language === 'hi' ? 'कारीगर खोजें ➔' : 'Find Pros ➔'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
          </View>

        {/* 2. 3D INTERACTIVE CATEGORIES (All 15+ Trades) */}
        <View style={[styles.categoriesSection, isTabletOrDesktop && styles.categoriesSectionDesktop]}>
          {(() => {
            const catList = [
              { id: 'all', label: language === 'hi' ? '🌟 सभी कारीगर' : 'All Pros', action: () => { setSelectedCategory('all'); setSelectedNeed('ALL'); } },
              ...ORDERED_15_TRADES.map((tr) => ({
                id: tr.id,
                label: tr.registrationLabelHi.split('/')[0].trim(),
                action: () => { setSelectedCategory(tr.id); setSelectedNeed('ALL'); },
              })),
            ];
            return isTabletOrDesktop ? (
              <View style={[styles.categoryPillsScroll, styles.categoryPillsDesktopWrap]}>
                {catList.map((cat) => {
                  const isActive =
                    (cat.id === 'all' && selectedCategory === 'all' && selectedNeed === 'ALL') ||
                    cat.id === selectedCategory;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                      onPress={cat.action}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
                {catList.map((cat) => {
                  const isActive =
                    (cat.id === 'all' && selectedCategory === 'all' && selectedNeed === 'ALL') ||
                    cat.id === selectedCategory;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                      onPress={cat.action}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            );
          })()}
        </View>

        {/* 3 & 4. UNIFIED AI STUDIO + POST CUSTOM JOB ROW (side-by-side on Desktop) */}
        <View style={isSplitDesktop ? styles.dualStripRow : undefined}>
          {/* 3. SINGLE UNIFIED SETU MASTER ARTISAN AI ENTRY */}
          <View
            style={[
              styles.aiAssistStrip,
              isTabletOrDesktop && { paddingHorizontal: 0, backgroundColor: 'transparent' },
              isSplitDesktop && { flex: 1, paddingVertical: 0 },
            ]}
          >
            <TouchableOpacity
              style={[styles.aiAssistBtn, isSplitDesktop && { height: '100%' }]}
              onPress={() => {
                setSetuInitialPrompt('');
                setShowSetuAI(true);
              }}
              activeOpacity={0.88}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <View style={styles.aiSparkleBadge}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiAssistBtnTitle}>
                    {language === 'hi' ? '✨ SETU AI से पूछें (डिज़ाइन, रेट & रिपेयर)' : '✨ Ask SETU AI (Design, Rates & Repairs)'}
                  </Text>
                  <Text style={styles.aiAssistBtnSub} numberOfLines={1}>
                    {language === 'hi' ? 'फोटो भेजें — SETU आपका पूरा काम, बजट और डिज़ाइन संभालेगा' : 'Send photo — SETU handles estimate, design & booking'}
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={22} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* 4. POST A CUSTOM JOB & BUDGET */}
          <View
            style={[
              styles.postJobBannerStrip,
              isTabletOrDesktop && { paddingHorizontal: 0, backgroundColor: 'transparent' },
              isSplitDesktop && { flex: 1, paddingVertical: 0 },
            ]}
          >
            <TouchableOpacity
              style={[styles.postJobBtn, isSplitDesktop && { height: '100%' }]}
              onPress={() => setShowPostTaskModal(true)}
              activeOpacity={0.88}
            >
              <View style={styles.postJobIconWrap}>
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.postJobTitle}>
                    {language === 'hi' ? '📝 अपना काम और बजट पोस्ट करें' : '📝 Post a Job & Name Budget'}
                  </Text>
                  <View style={styles.postJobFreeTag}>
                    <Text style={styles.postJobFreeTagText}>फ्री कोटेशन</Text>
                  </View>
                </View>
                <Text style={styles.postJobSub} numberOfLines={1}>
                  {language === 'hi' ? 'अपनी जरूरत बताएं, पास के कारीगर आपके बजट में संपर्क करेंगे' : 'Post details, nearby contractors will bid within your budget'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. DAILY CITY MARKET RATE INDEX */}
        <View style={[styles.marketIndexSection, isTabletOrDesktop && styles.marketIndexSectionDesktop]}>
          <View style={styles.marketIndexHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="stats-chart" size={15} color="#D97706" />
              <Text style={styles.marketIndexTitle}>
                {language === 'hi' ? '📊 आज का भोपाल बाजार भाव' : '📊 Today’s Bhopal Market Rates'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowRateSurveyModal(true)}
              style={{ marginTop: 4 }}
            >
              <Text style={[styles.marketIndexSub, { color: '#1D4ED8', fontWeight: '700' }]}>
                {language === 'en' ? 'Rate Index ➔' : 'सभी राज्यों के भाव देखें ➔'}
              </Text>
            </TouchableOpacity>
          </View>

          {isTabletOrDesktop ? (
            <View style={styles.marketIndexGridDesktop}>
              {BHOPAL_MARKET_INDEX.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.marketIndexCard,
                    { width: isDesktop ? '23.8%' : '48.8%' },
                  ]}
                >
                  <View style={styles.marketIndexTop}>
                    <Text style={styles.marketIndexItemTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.marketTrendBadge, item.trend === 'up' ? styles.trendUp : item.trend === 'down' ? styles.trendDown : styles.trendStable]}>
                      <Text style={[styles.marketTrendText, item.trend === 'up' ? styles.trendUpText : item.trend === 'down' ? styles.trendDownText : styles.trendStableText]}>
                        {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '●'} {item.changeText}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.marketPriceRow}>
                    <Text style={styles.marketPriceVal}>{item.price}</Text>
                    <Text style={styles.marketPriceUnit}>/ {item.unit}</Text>
                  </View>
                  <Text style={styles.marketSourceText}>📍 {item.verifiedWholesaleMarket}</Text>
                </View>
              ))}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketIndexScroll}>
              {BHOPAL_MARKET_INDEX.map((item) => (
                <View key={item.id} style={styles.marketIndexCard}>
                  <View style={styles.marketIndexTop}>
                    <Text style={styles.marketIndexItemTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.marketTrendBadge, item.trend === 'up' ? styles.trendUp : item.trend === 'down' ? styles.trendDown : styles.trendStable]}>
                      <Text style={[styles.marketTrendText, item.trend === 'up' ? styles.trendUpText : item.trend === 'down' ? styles.trendDownText : styles.trendStableText]}>
                        {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '●'} {item.changeText}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.marketPriceRow}>
                    <Text style={styles.marketPriceVal}>{item.price}</Text>
                    <Text style={styles.marketPriceUnit}>/ {item.unit}</Text>
                  </View>
                  <Text style={styles.marketSourceText}>📍 {item.verifiedWholesaleMarket}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 5. NEARBY PROS LIST */}
        <View
          style={[styles.prosSection, isTabletOrDesktop && { paddingHorizontal: 0, marginTop: 16 }]}
          onLayout={(e) => setProsSectionY(e.nativeEvent.layout.y)}
        >
          <View style={styles.areaLiveBanner}>
            <View style={styles.areaLiveLeft}>
              <Ionicons name="location" size={14} color={COLORS.secondary} />
              <Text style={styles.areaLiveText} numberOfLines={1}>
                {currentLocation.split('•')[0].trim()}
              </Text>
            </View>
            <TouchableOpacity onPress={onOpenLocationPicker} style={styles.changeLocBtn}>
              <Text style={styles.changeLocBtnText}>
                {language === 'hi' ? 'लोकेशन बदलें ➔' : 'Change ➔'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.prosHeaderRow}>
            <View>
              <Text style={styles.prosSectionTitle}>{t.nearbyTitle}</Text>
              <Text style={styles.prosSectionSub}>
                {filteredContractors.length} {language === 'hi' ? 'सत्यापित कारीगर उपलब्ध (15 मिनट आगमन)' : 'Verified pros available (15m arrival)'}
              </Text>
            </View>
          </View>

          {filteredContractors.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name={contractors.length === 0 ? 'construct-outline' : 'search-outline'} size={36} color={COLORS.primary} />
              <Text style={styles.emptyTitle}>
                {contractors.length === 0
                  ? (language === 'hi' ? 'अभी कोई असली कारीगर प्रोफाइल लाइव नहीं है' : 'No Verified Pros Listed Yet')
                  : (language === 'hi' ? 'कोई कारीगर नहीं मिला' : 'No Pros Found')}
              </Text>
              <Text style={styles.emptySub}>
                {contractors.length === 0
                  ? (language === 'hi'
                      ? 'सभी पुरानी सैंपल प्रोफाइल हटा दी गई हैं। अब आप अपना काम पोस्ट कर सकते हैं या पार्टनर के रूप में असली ID जोड़ सकते हैं।'
                      : 'All sample profiles are cleared. Post your job requirement or join with your verified partner profile.')
                  : (language === 'hi'
                      ? 'कृपया सर्च शब्द बदलें या अन्य श्रेणी चुनें।'
                      : 'Please adjust your search or clear filters.')}
              </Text>
              {contractors.length === 0 ? (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => setShowPostTaskModal(true)}
                >
                  <Text style={styles.resetBtnText}>
                    {language === 'hi' ? '📝 अपना काम व बजट पोस्ट करें ➔' : '📝 Post Job & Budget ➔'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedNeed('ALL');
                    setSelectedCategory('all');
                    setSelectedRateType('ALL');
                  }}
                >
                  <Text style={styles.resetBtnText}>
                    {language === 'hi' ? 'सभी फिल्टर रीसेट करें' : 'Reset All Filters'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={proCols > 1 ? styles.prosGridContainer : undefined}>
              {filteredContractors.map((contractor) => (
                <ContractorCard
                  key={contractor.id}
                  contractor={contractor}
                  language={language}
                  onViewProfilePress={handleOpenContractorDetail}
                  onBookPress={handleOpenBooking}
                  onCallPress={handleCall}
                  containerStyle={
                    proCols > 1
                      ? { width: proCardWidth as any, marginBottom: 0 }
                      : undefined
                  }
                />
              ))}
            </View>
          )}
        </View>
        </View>
      </ScrollView>

      {/* ✨ UNIFIED SETU AI FLOATING BUTTON */}
      <TouchableOpacity
        style={[
          styles.floatingAIFab,
          {
            bottom: isDesktop ? 24 : 14,
            right: isTabletOrDesktop ? 24 : 12,
          },
        ]}
        onPress={() => {
          setSetuInitialPrompt('');
          setShowSetuAI(true);
        }}
        activeOpacity={0.88}
        accessibilityLabel="SETU AI"
      >
        <Ionicons name="sparkles" size={16} color="#FBBF24" />
        <Text style={styles.floatingFabLabel}>SETU</Text>
        <View style={styles.floatingFabBadgePulse} />
      </TouchableOpacity>

      {/* MODALS */}
      {/* 0. Unified SETU Master Artisan Chat & In-Photo Designer */}
      <SetuAIStudioModal
        visible={Boolean(isSetuModalOpen && !isLocationPickerOpen)}
        onClose={() => {
          setShowSetuAI(false);
          setSetuInitialPrompt('');
          if (showEstimatorDirectly && onCloseEstimatorDirectly) {
            onCloseEstimatorDirectly();
          }
        }}
        language={language}
        currentLocation={currentLocation}
        contractors={contractors}
        materials={materials}
        initialPrompt={setuInitialPrompt}
        onBookContractor={(c, prefill) => handleOpenBooking(c, prefill)}
        onFilterCategory={(category) => {
          setSelectedCategory(category);
          setSelectedNeed('ALL');
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, prosSectionY - 10), animated: true });
          }, 180);
        }}
        onOpenBudgetJobPost={(prefill) => {
          if (prefill?.title) setPostTaskTitle(prefill.title);
          if (prefill?.budget && prefill.budget > 0) setPostTaskBudget(String(prefill.budget));
          if (prefill?.category) setPostTaskCategory(prefill.category as any);
          setShowPostTaskModal(true);
        }}
        onOpenLocationPicker={onOpenLocationPicker}
      />

      {/* 1. Contractor Detail Profile Modal */}
      {selectedContractorForDetail && (
        <ContractorDetailModal
          visible={!!selectedContractorForDetail}
          contractor={selectedContractorForDetail}
          onClose={handleCloseContractorDetail}
          onBookPress={(c) => {
            handleCloseContractorDetail();
            handleOpenBooking(c);
          }}
          onCallPress={handleCall}
        />
      )}

      {/* 2. Direct Escrow Advance Booking Modal */}
      {selectedContractorForBooking && (
        <BookingModal
          key={`${selectedContractorForBooking.id}_${bookingPrefill?.mode || 'default'}_${bookingPrefill?.includeMaterials ? 'mat' : 'nomat'}_${bookingPrefill?.initialLaborEstimate || 0}_${bookingPrefill?.initialMaterialEstimate || 0}`}
          visible={!!selectedContractorForBooking}
          contractor={selectedContractorForBooking}
          onClose={handleCloseBooking}
          onConfirmBooking={handleBookingConfirmed}
          language={language}
          currentLocation={currentLocation}
          initialMode={bookingPrefill?.mode || 'दिहाड़ी'}
          initialIncludeMaterials={Boolean(bookingPrefill?.includeMaterials)}
          initialDescription={bookingPrefill?.description || ''}
          initialLaborEstimate={bookingPrefill?.initialLaborEstimate || 0}
          initialMaterialEstimate={bookingPrefill?.initialMaterialEstimate || 0}
        />
      )}

      {/* All-India Fair Rate Benchmarks Survey Modal */}
      <RateSurveyModal
        visible={showRateSurveyModal}
        onClose={() => setShowRateSurveyModal(false)}
      />

      {/* 4. SETU Express Quick SOS Service Modal */}
      <QuickServiceModal
        visible={isQuickModalOpen}
        onClose={() => {
          setShowQuickModal(false);
          if (onCloseQuickModalDirectly) onCloseQuickModalDirectly();
        }}
        onDispatchConfirmed={handleQuickDispatch}
      />

      {/* 5. Turnkey Mega Contract Modal */}
      {selectedMegaContract && (
        <MegaContractModal
          visible={!!selectedMegaContract}
          contract={selectedMegaContract}
          onClose={() => setSelectedMegaContract(null)}
          onRequestConsultation={(c: MegaContract) => {
            setSelectedMegaContract(null);
            showAppAlert(
              language === 'en' ? 'Consultation Scheduled' : 'कंसल्टेशन बुक हुआ',
              language === 'en'
                ? `SETU Chief Engineer will connect within 24 hours.`
                : `"${c.title}" के लिए SETU इंजीनियर 24 घंटे में संपर्क करेंगे।`
            );
          }}
        />
      )}

      {/* 7. Post Custom Job & Budget Modal */}
      <Modal visible={showPostTaskModal} transparent animationType="slide" onRequestClose={() => setShowPostTaskModal(false)}>
        <View style={postModalResponsive.overlayStyle}>
          <View style={[styles.postModalCard, postModalResponsive.containerStyle]}>
            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.postModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="create" size={18} color="#059669" />
                <Text style={styles.postModalTitle}>
                  {language === 'hi' ? 'अपना काम और बजट पोस्ट करें' : 'Post Work & Set Budget'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowPostTaskModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.postModalSub}>
              {language === 'hi' 
                ? 'अपनी जरूरत और बजट बताएं, पास के सत्यापित कारीगर सीधे संपर्क करेंगे:'
                : 'Post your custom requirement & budget for nearby verified pros to bid:'}
            </Text>

            {/* Work Title */}
            <Text style={styles.inputFieldLabel}>
              काम का विवरण (क्या करवाना है?) <Text style={{ color: '#DC2626', fontWeight: '900' }}>* अनिवार्य</Text>
            </Text>
            <TextInput
              style={styles.postTextInput}
              placeholder="उदा. बेडरूम में 2 अलमारी के हैंडल और 1 नया लॉक लगाना है"
              value={postTaskTitle}
              onChangeText={setPostTaskTitle}
              multiline
            />

            {/* Trade Category Selection (All 15+ Trades) */}
            <Text style={styles.inputFieldLabel}>
              कारीगर की श्रेणी <Text style={{ color: '#DC2626', fontWeight: '900' }}>*</Text>
            </Text>
            <View style={styles.categorySelectRow}>
              {ORDERED_15_TRADES.map((tr) => (
                <TouchableOpacity
                  key={tr.id}
                  style={[
                    styles.catSelectPill,
                    postTaskCategory === tr.id && styles.catSelectPillActive,
                  ]}
                  onPress={() => setPostTaskCategory(tr.id)}
                >
                  <Text
                    style={[
                      styles.catSelectText,
                      postTaskCategory === tr.id && styles.catSelectTextActive,
                    ]}
                  >
                    {tr.registrationLabelHi}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Site Location */}
            <Text style={styles.inputFieldLabel}>कार्य स्थल का इलाका / पता:</Text>
            <TextInput
              style={[styles.postTextInput, { minHeight: 38 }]}
              placeholder={currentLocation.split('•')[0].trim() || 'उदा. एमपी नगर, भोपाल'}
              value={postTaskAddress}
              onChangeText={setPostTaskAddress}
            />

            {/* Budget Offer */}
            <Text style={styles.inputFieldLabel}>
              आपका अनुमानित बजट ऑफर (₹ कुल लेबर) <Text style={{ color: '#DC2626', fontWeight: '900' }}>*</Text>
            </Text>
            <View style={styles.budgetInputRow}>
              <Text style={styles.budgetCurrency}>₹</Text>
              <TextInput
                style={styles.budgetInput}
                placeholder="उदा. 800"
                keyboardType="numeric"
                value={postTaskBudget}
                onChangeText={setPostTaskBudget}
              />
              <Text style={styles.budgetUnit}>कुल बजट</Text>
            </View>

            <View style={styles.postNoticeBox}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.postNoticeText}>
                {language === 'hi'
                  ? '100% फ्री पोस्टिंग: कोई अग्रिम शुल्क नहीं। कारीगर के काम पूरा करने पर ही भुगतान होगा।'
                  : '100% Free to post: Zero upfront fee. Pay only upon satisfactory completion.'}
              </Text>
            </View>

            <TouchableOpacity style={styles.submitPostJobBtn} onPress={handlePostTaskSubmit} activeOpacity={0.85}>
              <Text style={styles.submitPostJobBtnText}>
                {language === 'hi' ? 'जॉब पोस्ट करें (कारीगरों को अलर्ट भेजें) ➔' : 'Broadcast Job to Pros ➔'}
              </Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  heroSplitRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    marginBottom: 14,
  },
  topDiscoveryCardDesktop: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  categoriesSectionDesktop: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    paddingVertical: 10,
  },
  categoryPillsDesktopWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  dualStripRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
    marginBottom: 14,
  },
  marketIndexSectionDesktop: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  marketIndexGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 10,
  },
  prosGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'stretch',
  },
  searchSection: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // 3D Hero Brand Spotlight Styles
  heroSpotlightCard: {
    backgroundColor: '#0B1120',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 122, 0, 0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 0 16px rgba(255, 122, 0, 0.15)',
      },
      default: {
        shadowColor: '#FF7A00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  heroSpotlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroLogo3DContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FF7A00',
    ...Platform.select({
      web: {
        boxShadow: '0 0 12px rgba(255, 122, 0, 0.5)',
      },
    }),
  },
  heroLogo3DImg: {
    width: '100%',
    height: '100%',
  },
  heroSpotlightTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroSpotlightSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },
  heroLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    gap: 4,
  },
  heroLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  heroLiveText: {
    color: '#22C55E',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  heroMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetricText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  heroMetricDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Top Discovery Search Box & Locality
  topDiscoveryCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mainSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  mainSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  mainMicBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  mainMicBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  locAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  localityPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  localityPickerText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  findProsBtn: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  findProsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Categories Section
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryPillsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // Clean AI Assist Strip
  aiAssistStrip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  aiAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  aiSparkleBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAssistBtnTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#3730A3',
  },
  aiAssistBtnSub: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  voiceButton: {
    padding: 3,
  },
  // 📹 HERO BANNER: AI उस्ताद वीडियो कॉल & 3D स्टूडियो
  aiHeroBannerWrap: {
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  aiHeroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  aiHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveCallRedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  liveCallPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  aiFreeTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  aiFreeTagText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
  },
  aiHeroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  aiHeroTextWrap: {
    flex: 1,
  },
  aiHeroTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    lineHeight: 18,
  },
  aiHeroSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 14,
  },
  aiHeroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  aiHeroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  aiStartCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  aiStartCallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ai3dStudioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  ai3dStudioPillText: {
    color: '#C4B5FD',
    fontSize: 10.5,
    fontWeight: '800',
  },
  // 🤖 AI TRENDING SECTION & CLEAN MODE TABS
  aiTrendingSection: {
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  aiTrendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTrendingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiSparkleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTrendingTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E293B',
  },
  askAiPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  askAiPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  aiChipsScroll: {
    gap: 8,
  },
  aiTrendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aiTrendingCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  aiCardArrow: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiCardArrowText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
  },
  cleanModeTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginVertical: 8,
    gap: 6,
  },
  cleanModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  cleanModeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cleanModeTabActiveRed: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  cleanModeTabText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  cleanModeTabTextActive: {
    color: '#FFFFFF',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  prosSection: {
    paddingHorizontal: 12,
    marginTop: 10,
    paddingBottom: 24,
  },
  prosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  prosSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  prosSectionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  rateSurveyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  surveyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateSurveyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  surveyTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  surveyTagText: {
    color: COLORS.primary,
    fontSize: 8.5,
    fontWeight: '800',
  },
  rateSurveySub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  areaLiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  areaLiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  areaLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  changeLocBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  changeLocBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  voiceAssistantStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  voiceAiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  micPulseDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAiText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  quickVoiceSuggestions: {
    gap: 6,
    alignItems: 'center',
  },
  quickVoiceChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  quickVoiceChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  quickVoiceChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickVoiceChipTextActive: {
    color: COLORS.primaryDark,
  },
  storiesSection: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  storiesContainer: {
    paddingHorizontal: 12,
    gap: 12,
    alignItems: 'center',
  },
  storyBubble: {
    alignItems: 'center',
    width: 60,
  },
  storyRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    backgroundColor: '#FFFFFF',
  },
  storyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  voiceAiPillListening: {
    backgroundColor: '#EF4444',
  },
  micPulseDotActive: {
    backgroundColor: '#FFFFFF',
  },
  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voiceModalBox: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  voiceOrbWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  voicePulseRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  voiceOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  voiceModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  voiceModalSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  transcriptCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 16,
  },
  transcriptText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  voiceDoneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  voiceDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  mainScrollContent: {
    paddingBottom: 120,
  },
  floatingAIFab: {
    position: 'absolute',
    bottom: 74,
    right: 14,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  floatingFabLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  floatingFabBadgePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // Post a Job Strip
  postJobBannerStrip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
  },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  postJobIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postJobTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },
  postJobFreeTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  postJobFreeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  postJobSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  // Regional Material & Labor Market Index
  marketIndexSection: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  marketIndexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  marketIndexTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  marketIndexSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  marketIndexScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  marketIndexCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    width: 175,
  },
  marketIndexTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  marketIndexItemTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#78350F',
    flex: 1,
  },
  marketTrendBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 4,
  },
  trendUp: {
    backgroundColor: '#FEE2E2',
  },
  trendDown: {
    backgroundColor: '#DCFCE7',
  },
  trendStable: {
    backgroundColor: '#F1F5F9',
  },
  marketTrendText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  trendUpText: {
    color: '#DC2626',
  },
  trendDownText: {
    color: '#16A34A',
  },
  trendStableText: {
    color: '#64748B',
  },
  marketPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  marketPriceVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  marketPriceUnit: {
    fontSize: 9.5,
    color: '#B45309',
    fontWeight: '600',
  },
  marketSourceText: {
    fontSize: 8.5,
    color: '#A16207',
    marginTop: 4,
  },
  // Post Task Modal Styles
  postModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  postModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },
  postModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  postModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  postModalSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 15,
  },
  inputFieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  postTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    minHeight: 55,
    textAlignVertical: 'top',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catSelectPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catSelectPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  catSelectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  catSelectTextActive: {
    color: '#FFFFFF',
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  budgetCurrency: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    height: 38,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  budgetUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  postNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
  },
  postNoticeText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  submitPostJobBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  submitPostJobBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
