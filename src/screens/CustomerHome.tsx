import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import {
  CATEGORIES,
  MEGA_PROJECTS,
  RATE_TYPE_FILTERS,
  BHOPAL_MARKET_INDEX,
  Contractor,
  MegaContract,
  QuickServiceItem,
} from '../data/mockData';
import { ContractorCard } from '../components/ContractorCard';
import { SmartEstimatorModal } from '../components/SmartEstimatorModal';
import { BookingModal } from '../components/BookingModal';
import { ContractorDetailModal } from '../components/ContractorDetailModal';
import { QuickServiceModal } from '../components/QuickServiceModal';
import { MegaContractModal } from '../components/MegaContractModal';
import { RateSurveyModal } from '../components/RateSurveyModal';
import { SetuAIAssistantModal } from '../components/SetuAIAssistantModal';
import { AIVideoDoctorModal } from '../components/AIVideoDoctorModal';
import { COLORS } from '../theme/colors';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface CustomerHomeProps {
  contractors: Contractor[];
  currentLocation: string;
  onOpenLocationPicker: () => void;
  onNewBookingCreated: (booking: any) => void;
  showQuickModalDirectly?: boolean;
  onCloseQuickModalDirectly?: () => void;
  showEstimatorDirectly?: boolean;
  onCloseEstimatorDirectly?: () => void;
  language?: Language;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  contractors,
  currentLocation,
  onOpenLocationPicker,
  onNewBookingCreated,
  showQuickModalDirectly = false,
  onCloseQuickModalDirectly,
  showEstimatorDirectly = false,
  onCloseEstimatorDirectly,
  language = 'hi',
}) => {
  const t = TRANSLATIONS[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeed, setSelectedNeed] = useState<'ALL' | 'QUICK' | 'CONSTRUCTION' | 'WEDDING' | 'MATERIALS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRateType, setSelectedRateType] = useState<string>('ALL');

  // Real Speech Recognition (बोलने वाला सेक्शन)
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Modals state
  const [showAIVideoDoctor, setShowAIVideoDoctor] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [showEstimator, setShowEstimator] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showRateSurveyModal, setShowRateSurveyModal] = useState(false);
  const [selectedMegaContract, setSelectedMegaContract] = useState<MegaContract | null>(null);
  const [selectedContractorForBooking, setSelectedContractorForBooking] = useState<Contractor | null>(null);
  const [selectedContractorForDetail, setSelectedContractorForDetail] = useState<Contractor | null>(null);

  // Airtasker / Thumbtack Model: Post-a-Job (Custom Task & Budget Posting)
  const [showPostTaskModal, setShowPostTaskModal] = useState(false);
  const [postTaskTitle, setPostTaskTitle] = useState('');
  const [postTaskBudget, setPostTaskBudget] = useState('');
  const [postTaskCategory, setPostTaskCategory] = useState<'carpenter' | 'plumber' | 'electrician' | 'mason' | 'painter'>('carpenter');

  const handlePostTaskSubmit = () => {
    if (!postTaskTitle.trim() || !postTaskBudget.trim()) {
      Alert.alert(
        language === 'hi' ? 'अधूरी जानकारी' : 'Incomplete details',
        language === 'hi' ? 'कृपया काम का विवरण और अपना बजट अवश्य लिखें।' : 'Please provide work title and budget.'
      );
      return;
    }
    const newJob = {
      id: 'jr_' + Date.now(),
      category: postTaskCategory,
      workType: postTaskTitle,
      hiringType: 'ओपन कस्टम जॉब (Budget Offer)',
      customerName: 'सत्यापित ग्राहक',
      location: currentLocation.split('•')[0].trim() || 'भोपाल',
      budgetOffer: parseFloat(postTaskBudget) || 1200,
      description: `ग्राहक द्वारा पोस्ट किया गया ओपन टास्क। बजट: ₹${postTaskBudget}`,
      date: 'तत्काल / आज ही',
      status: 'PENDING',
    };
    onNewBookingCreated(newJob);
    setShowPostTaskModal(false);
    setPostTaskTitle('');
    setPostTaskBudget('');
    Alert.alert(
      language === 'hi' ? '🎉 आपका काम लाइव हो गया!' : '🎉 Job Posted Successfully!',
      language === 'hi'
        ? `"${newJob.workType}" के लिए पास के कारीगरों को अलर्ट भेज दिया गया है। वे आपके बजट (₹${newJob.budgetOffer}) पर जल्द संपर्क करेंगे।`
        : `Nearby contractors alerted for "${newJob.workType}" with budget ₹${newJob.budgetOffer}.`
    );
  };

  // Sync external direct modal triggers
  React.useEffect(() => {
    if (showQuickModalDirectly) {
      setShowQuickModal(true);
    }
  }, [showQuickModalDirectly]);

  React.useEffect(() => {
    if (showEstimatorDirectly) {
      setShowEstimator(true);
    }
  }, [showEstimatorDirectly]);

  // Restore active contractor profile / booking modal on browser refresh
  React.useEffect(() => {
    if (typeof window !== 'undefined' && contractors && contractors.length > 0) {
      const hash = window.location?.hash || '';
      const matchDetail = hash.match(/contractor=([^&]+)/);
      const matchBooking = hash.match(/booking=([^&]+)/);
      const targetDetailId = matchDetail ? matchDetail[1] : window.localStorage?.getItem('setu_active_contractor_detail');
      const targetBookingId = matchBooking ? matchBooking[1] : window.localStorage?.getItem('setu_active_contractor_booking');

      if (targetDetailId && !selectedContractorForDetail) {
        const found = contractors.find(
          (c) => c.id === targetDetailId || (c as any).customId === targetDetailId || (c as any).userId === targetDetailId
        );
        if (found) setSelectedContractorForDetail(found);
      }

      if (targetBookingId && !selectedContractorForBooking) {
        const found = contractors.find(
          (c) => c.id === targetBookingId || (c as any).customId === targetBookingId || (c as any).userId === targetBookingId
        );
        if (found) setSelectedContractorForBooking(found);
      }
    }
  }, [contractors]);

  const handleOpenContractorDetail = (c: Contractor) => {
    setSelectedContractorForDetail(c);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('setu_active_contractor_detail', c.id);
      try {
        window.history?.replaceState(null, '', '#contractor=' + c.id);
      } catch (e) {}
    }
  };

  const handleCloseContractorDetail = () => {
    setSelectedContractorForDetail(null);
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('setu_active_contractor_detail');
      try {
        if (window.location?.hash?.includes('contractor=')) {
          window.history?.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {}
    }
  };

  const handleOpenBooking = (c: Contractor) => {
    setSelectedContractorForBooking(c);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('setu_active_contractor_booking', c.id);
      try {
        window.history?.replaceState(null, '', '#booking=' + c.id);
      } catch (e) {}
    }
  };

  const handleCloseBooking = () => {
    setSelectedContractorForBooking(null);
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('setu_active_contractor_booking');
      try {
        if (window.location?.hash?.includes('booking=')) {
          window.history?.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {}
    }
  };

  // Dynamic filter for contractors based on Selected Need, Category, and Rate Type
  const filteredContractors = contractors.filter((c) => {
    // 1. Need filter
    if (selectedNeed === 'QUICK' && !c.isQuickAvailable) return false;
    if (selectedNeed === 'CONSTRUCTION' && !['carpenter', 'mason', 'plumber', 'electrician', 'painter', 'ac_repair'].includes(c.category)) return false;
    if (selectedNeed === 'WEDDING' && !['wedding_tent', 'wedding_catering', 'event_dj', 'wedding_photo', 'wedding_makeup'].includes(c.category)) return false;
    if (selectedNeed === 'MATERIALS' && (!c.recommendedMaterials || c.recommendedMaterials.length === 0)) return false;

    // 2. Specific Category filter
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;

    // 3. Rate Type filter
    if (selectedRateType !== 'ALL') {
      if (selectedRateType === 'दिहाड़ी' && (!c.dailyWageRate || c.dailyWageRate <= 0)) return false;
      if (selectedRateType !== 'दिहाड़ी' && c.primaryRateType !== selectedRateType) return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchSpecialty = c.specialtyHindi.toLowerCase().includes(q);
      const matchSkill = c.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchSpecialty && !matchSkill) return false;
    }

    return true;
  });

  const handleCall = (contractor: Contractor) => {
    const rawDigits = contractor.phone
      ? contractor.phone.replace(/\D/g, '')
      : (contractor.phoneMasked?.replace(/\D/g, '') || '');

    if (!rawDigits || rawDigits.length < 10 || rawDigits.includes('9812345678') || contractor.phoneMasked?.includes('XXX')) {
      Alert.alert(
        language === 'hi' ? 'सीधा कॉल अनुपलब्ध' : 'Direct Call Unavailable',
        language === 'hi'
          ? 'कारीगर का सीधा फोन नंबर उपलब्ध नहीं है। कृपया ऐप के माध्यम से बुकिंग या कोटेशन अनुरोध भेजें।'
          : 'Contractor phone number not available. Please send a booking or quotation request through the app.'
      );
      return;
    }
    const phone = rawDigits.slice(-10);
    const telUrl = `tel:+91${phone}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = telUrl;
    } else {
      Linking.openURL(telUrl).catch(() => {
        Alert.alert(
          'कॉल डायलर',
          `कृपया सीधे +91 ${phone} पर डायल करें।`
        );
      });
    }
  };

  const handleBookingConfirmed = (booking: any) => {
    handleCloseBooking();
    onNewBookingCreated(booking);
    Alert.alert(
      language === 'hi' ? '🎉 बुकिंग सफल!' : '🎉 Booking Confirmed!',
      language === 'hi'
        ? `आपकी बुकिंग ${booking.contractorName} के पास भेज दी गई है। ₹${booking.escrowAdvanceToken} का टोकन SETU एस्क्रो में सुरक्षित है।`
        : `Booking sent to ${booking.contractorName}. Token of ₹${booking.escrowAdvanceToken} is safe in SETU Escrow.`,
      [{ text: language === 'hi' ? 'ठीक है' : 'OK' }]
    );
  };

  const handleQuickDispatch = (service: QuickServiceItem, problem: string) => {
    setShowQuickModal(false);
    onNewBookingCreated({
      bookingMode: 'क्विक रिपेयर',
      contractorName: `${service.title} (अजय राठौर)`,
      totalLaborAmount: service.startingPrice,
      escrowAdvanceToken: 0,
      workAddress: currentLocation,
      description: `इमरजेंसी समस्या: ${problem}`,
      date: 'तत्काल (15 मिनट)',
    });
    Alert.alert(
      language === 'hi' ? '⚡ नजदीकी कारीगर रवाना!' : '⚡ Nearby Pro Dispatched!',
      language === 'hi'
        ? `${service.title} के लिए पास के कारीगर को अलर्ट भेज दिया गया है। 15-20 मिनट में आपकी लोकेशन पर पहुंचेगा।`
        : `Nearby pro alerted for ${service.title}. Reaching your location in 15-20 minutes.`
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
          recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onstart = () => {
            setIsListening(true);
            setLiveTranscript(
              language === 'hi'
                ? '🎙️ सुन रहा हूँ... अपनी जरूरत बोलें (उदा. "बढ़ई चाहिए", "नल टपक रहा है")'
                : '🎙️ Listening... Speak your need (e.g. "Need carpenter", "Leaking tap")'
            );
          };

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('');
            setLiveTranscript(transcript);
            setSearchQuery(transcript);
          };

          recognition.onerror = (e: any) => {
            console.log('Voice recognition ended/error:', e);
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

    // Fallback if browser permission is blocked
    Alert.alert(
      language === 'hi' ? '🎙️ वॉयस असिस्टेंट' : '🎙️ Voice Assistant',
      language === 'hi'
        ? 'कृपया ब्राउज़र में माइक्रोफोन अनुमति दें अथवा नीचे दिए गए तुरंत विकल्पों पर टैप करें।'
        : 'Please allow microphone access or tap on quick categories below.'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
      >
        {/* 1. TOP DISCOVERY & SEARCH CARD (Direct Landing without OTP requirement) */}
        <View style={styles.topDiscoveryCard}>
          {/* "क्या काम करवाना है?" Search Input */}
          <View style={styles.mainSearchRow}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.mainSearchInput}
              placeholder={language === 'hi' ? 'क्या काम करवाना है? (बढ़ई, प्लंबर, वायरिंग...)' : 'What work do you need? (Carpenter, Plumber...)'}
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
              <MaterialIcons name="mic" size={20} color={isListening ? '#EF4444' : COLORS.primary} />
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
                // Focus on pros list
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.findProsBtnText}>
                {language === 'hi' ? 'कारीगर खोजें ➔' : 'Find Pros ➔'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. 5 PRIMARY CATEGORIES */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
            {[
              { id: 'all', label: language === 'hi' ? '🌟 सभी' : 'All', action: () => { setSelectedCategory('all'); setSelectedNeed('ALL'); } },
              { id: 'plumber', label: language === 'hi' ? '🚰 प्लंबर' : 'Plumber', action: () => { setSelectedCategory('plumber'); setSelectedNeed('ALL'); } },
              { id: 'electrician', label: language === 'hi' ? '⚡ बिजली' : 'Electrician', action: () => { setSelectedCategory('electrician'); setSelectedNeed('ALL'); } },
              { id: 'carpenter', label: language === 'hi' ? '🪚 बढ़ई' : 'Carpenter', action: () => { setSelectedCategory('carpenter'); setSelectedNeed('ALL'); } },
              { id: 'mason', label: language === 'hi' ? '🧱 मिस्त्री' : 'Mason', action: () => { setSelectedCategory('mason'); setSelectedNeed('ALL'); } },
              { id: 'wedding', label: language === 'hi' ? '🎪 इवेंट & शादी' : 'Events', action: () => { setSelectedNeed('WEDDING'); setSelectedCategory('all'); } },
            ].map((cat) => {
              const isActive = (cat.id === 'all' && selectedCategory === 'all' && selectedNeed === 'ALL') ||
                (cat.id === selectedCategory) ||
                (cat.id === 'wedding' && selectedNeed === 'WEDDING');
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
        </View>

        {/* 3. SINGLE CLEAN "समस्या बताकर कारीगर खोजें" (AI USTAD) */}
        <View style={styles.aiAssistStrip}>
          <TouchableOpacity
            style={styles.aiAssistBtn}
            onPress={() => {
              setAiQuery('');
              setShowAIAssistant(true);
            }}
            activeOpacity={0.88}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={styles.aiSparkleBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiAssistBtnTitle}>
                  {language === 'hi' ? '✨ समस्या बताकर कारीगर खोजें' : '✨ Find Pro by Describing Problem'}
                </Text>
                <Text style={styles.aiAssistBtnSub} numberOfLines={1}>
                  {language === 'hi' ? 'AI उस्ताद आपकी समस्या समझकर सही कारीगर दिखाएगा' : 'AI understands problem and matches right contractor'}
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={22} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* 4. AIRTASKER / THUMBTACK FEATURE: "अपना काम और बजट पोस्ट करें" (Post a Custom Job) */}
        <View style={styles.postJobBannerStrip}>
          <TouchableOpacity
            style={styles.postJobBtn}
            onPress={() => setShowPostTaskModal(true)}
            activeOpacity={0.88}
          >
            <View style={styles.postJobIconWrap}>
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.postJobTitle}>
                  {language === 'hi' ? '📝 अपना काम और बजट पोस्ट करें' : '📝 Post a Job & Name Budget'}
                </Text>
                <View style={styles.postJobFreeTag}>
                  <Text style={styles.postJobFreeTagText}>फ्री कोटेशन</Text>
                </View>
              </View>
              <Text style={styles.postJobSub}>
                {language === 'hi' ? 'अपनी जरूरत बताएं, पास के कारीगर आपके बजट में संपर्क करेंगे' : 'Post details, nearby contractors will bid within your budget'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* 5. THUMBTACK / INFRA.MARKET FEATURE: "आज का भोपाल बाजार भाव सूचकांक" (Daily Market Rate Index) */}
        <View style={styles.marketIndexSection}>
          <View style={styles.marketIndexHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="stats-chart" size={15} color="#D97706" />
              <Text style={styles.marketIndexTitle}>
                {language === 'hi' ? '📊 आज का भोपाल बाजार भाव' : '📊 Today’s Bhopal Market Rates'}
              </Text>
            </View>
            <Text style={styles.marketIndexSub}>
              {language === 'hi' ? 'थोक मंडी सत्यापित औसत' : 'Verified Wholesale Averages'}
            </Text>
          </View>

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
        </View>

        {/* 5. NEARBY PROS LIST */}
        <View style={styles.prosSection}>
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
              <Ionicons name="search-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>
                {language === 'hi' ? 'कोई कारीगर नहीं मिला' : 'No Pros Found'}
              </Text>
              <Text style={styles.emptySub}>
                {language === 'hi'
                  ? 'कृपया सर्च शब्द बदलें या अन्य श्रेणी चुनें।'
                  : 'Please adjust your search or clear filters.'}
              </Text>
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
            </View>
          ) : (
            filteredContractors.map((contractor) => (
              <ContractorCard
                key={contractor.id}
                contractor={contractor}
                language={language}
                onViewProfilePress={handleOpenContractorDetail}
                onBookPress={handleOpenBooking}
                onCallPress={handleCall}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* 📹 PERSISTENT SLEEK FLOATING ACTION BUTTON (AI Ustad Live Video Call & 3D Studio - Compact Circular FAB) */}
      <TouchableOpacity
        style={styles.floatingAIFab}
        onPress={() => setShowAIVideoDoctor(true)}
        activeOpacity={0.88}
        accessibilityLabel={language === 'hi' ? 'AI उस्ताद लाइव वीडियो' : 'AI Doctor Live Video'}
      >
        <Ionicons name="videocam" size={22} color="#FFFFFF" />
        <View style={styles.floatingFabBadgePulse} />
      </TouchableOpacity>

      {/* MODALS */}
      {/* -1. SETU AI Video Doctor & 3D Studio Modal */}
      <AIVideoDoctorModal
        visible={showAIVideoDoctor}
        onClose={() => setShowAIVideoDoctor(false)}
        language={language}
        currentLocation={currentLocation}
        onOpenContractorCategory={(category) => {
          setSelectedCategory(category);
          setSelectedNeed('ALL');
        }}
      />

      {/* 0. SETU AI Trending Technique & Rate Assistant Modal */}
      <SetuAIAssistantModal
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        language={language}
        initialQuery={aiQuery}
        onSelectContractorCategory={(category) => {
          setSelectedCategory(category);
          setSelectedNeed('ALL');
        }}
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
          visible={!!selectedContractorForBooking}
          contractor={selectedContractorForBooking}
          onClose={handleCloseBooking}
          onConfirmBooking={handleBookingConfirmed}
          language={language}
          currentLocation={currentLocation}
        />
      )}

      {/* All-India Fair Rate Benchmarks Survey Modal */}
      <RateSurveyModal
        visible={showRateSurveyModal}
        onClose={() => setShowRateSurveyModal(false)}
      />

      {/* 3. AI Cost & Labor Estimator Modal */}
      <SmartEstimatorModal
        visible={showEstimator}
        contractors={contractors}
        onClose={() => {
          setShowEstimator(false);
          if (onCloseEstimatorDirectly) onCloseEstimatorDirectly();
        }}
        onSelectContractorCategory={(category) => {
          setShowEstimator(false);
          if (onCloseEstimatorDirectly) onCloseEstimatorDirectly();
          setSelectedCategory(category);
          setSelectedNeed('CONSTRUCTION');
        }}
      />

      {/* 4. Uber/Rapido Quick SOS Service Modal */}
      <QuickServiceModal
        visible={showQuickModal}
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
            Alert.alert(
              language === 'hi' ? 'कंसल्टेशन बुक हुआ' : 'Consultation Scheduled',
              language === 'hi'
                ? `"${c.title}" के लिए SETU इंजीनियर 24 घंटे में संपर्क करेंगे।`
                : `SETU Chief Engineer will connect within 24 hours.`
            );
          }}
        />
      )}

      {/* 7. Airtasker / Thumbtack Model: Post Custom Job & Budget Modal */}
      <Modal visible={showPostTaskModal} transparent animationType="slide" onRequestClose={() => setShowPostTaskModal(false)}>
        <View style={styles.postModalOverlay}>
          <View style={styles.postModalCard}>
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
            <Text style={styles.inputFieldLabel}>काम का विवरण (क्या करवाना है?):</Text>
            <TextInput
              style={styles.postTextInput}
              placeholder="उदा. बेडरूम में 2 अलमारी के हैंडल और 1 नया लॉक लगाना है"
              value={postTaskTitle}
              onChangeText={setPostTaskTitle}
              multiline
            />

            {/* Trade Category Selection */}
            <Text style={styles.inputFieldLabel}>कारीगर की श्रेणी:</Text>
            <View style={styles.categorySelectRow}>
              {[
                { id: 'carpenter', label: '🪚 बढ़ई' },
                { id: 'plumber', label: '🚰 प्लंबर' },
                { id: 'electrician', label: '⚡ बिजली' },
                { id: 'mason', label: '🧱 मिस्त्री' },
                { id: 'painter', label: '🎨 पेंटर' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.catSelectPill,
                    postTaskCategory === c.id && styles.catSelectPillActive,
                  ]}
                  onPress={() => setPostTaskCategory(c.id as any)}
                >
                  <Text
                    style={[
                      styles.catSelectText,
                      postTaskCategory === c.id && styles.catSelectTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Budget Offer */}
            <Text style={styles.inputFieldLabel}>आपका बजट ऑफर (₹ कुल लेबर):</Text>
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
  searchSection: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
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
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4338CA',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  floatingFabBadgePulse: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // Airtasker / Thumbtack Post a Job Strip
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
  // Thumbtack / Infra.Market Market Index
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
