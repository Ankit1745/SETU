import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { Contractor } from '../data/mockData';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import { ApiService } from '../services/api';
import { pickImageFromGallery } from '../utils/mediaPicker';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';
import {
  getTradeRateProfile,
  calculateTradeBookingTotal,
  TradeSubFieldDef,
} from '../data/tradeRateConfig';

interface BookingModalProps {
  visible: boolean;
  contractor: Contractor | null;
  onClose: () => void;
  onConfirmBooking: (bookingDetails: any) => void;
  language?: Language;
  currentLocation?: string;
  initialMode?: 'दिहाड़ी' | 'ठेका' | 'भाव_पूछें';
  initialIncludeMaterials?: boolean;
  initialDescription?: string;
  initialLaborEstimate?: number;
  initialMaterialEstimate?: number;
}

interface MediaAttachment {
  id: string;
  type: 'photo' | 'video';
  title: string;
  url: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  contractor,
  onClose,
  onConfirmBooking,
  language = 'hi',
  currentLocation,
  initialMode = 'दिहाड़ी',
  initialIncludeMaterials = false,
  initialDescription = '',
  initialLaborEstimate = 0,
  initialMaterialEstimate = 0,
}) => {
  const isHindi = language !== 'en';

  const tradeProfile = contractor ? getTradeRateProfile(contractor.category) : null;
  const resolveInitialModeId = (): string => {
    if (!tradeProfile) return '';
    if (initialMode === 'दिहाड़ी') {
      const dailyOpt = tradeProfile.rateModes.find((m) => m.isDailyLike);
      if (dailyOpt) return dailyOpt.id;
    }
    const matchedByType = tradeProfile.rateModes.find(
      (m) => contractor && m.primaryRateTypeLabel === contractor.primaryRateType
    );
    return matchedByType ? matchedByType.id : tradeProfile.rateModes[0].id;
  };

  const initialModeId = resolveInitialModeId();
  const initialModeObj = tradeProfile?.rateModes.find((m) => m.id === initialModeId) || tradeProfile?.rateModes[0];

  const [selectedModeId, setSelectedModeId] = useState<string>(initialModeId);
  const [isQuoteInquiryMode, setIsQuoteInquiryMode] = useState<boolean>(initialMode === 'भाव_पूछें');
  const [bookingMode, setBookingMode] = useState<'दिहाड़ी' | 'ठेका' | 'भाव_पूछें'>(
    initialMode === 'भाव_पूछें'
      ? 'भाव_पूछें'
      : initialModeObj?.backendBookingMode === 'दिहाड़ी'
      ? 'दिहाड़ी'
      : 'ठेका'
  );
  const [subValues, setSubValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    if (tradeProfile) {
      for (const f of tradeProfile.bookingFields) {
        if (f.type === 'select' && f.options && f.options.length > 0) {
          defaults[f.id] = f.options[0].value;
        }
      }
      if (contractor?.tradeRateSpec) {
        const s = contractor.tradeRateSpec;
        if (s.minGuaranteePlates) defaults.minPlatesGuaranteed = String(s.minGuaranteePlates);
        if (s.extraPlateRate) defaults.extraPlatePrice = String(s.extraPlateRate);
        if (s.hoursPerFunction) defaults.functionHours = String(s.hoursPerFunction);
        if (s.includedServicesSummary) defaults.includedServicesText = String(s.includedServicesSummary);
        if (s.trolleyCapacitySpec) defaults.trolleyCapacity = String(s.trolleyCapacitySpec);
      }
    }
    return defaults;
  });

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE_ESCROW'>('CASH');
  const [daysCount, setDaysCount] = useState<string>('1'); // Default: 1 day
  const [thekaUnits, setThekaUnits] = useState<string>(
    String(initialModeObj?.defaultUnits || 150)
  );
  const [includeHelper, setIncludeHelper] = useState<boolean>(false); // Default: false (0 helpers)
  const [includeMaterialsCombo, setIncludeMaterialsCombo] = useState<boolean>(initialIncludeMaterials); // Default: false (0 materials)
  const [hasPriorityVisitPass, setHasPriorityVisitPass] = useState<boolean>(false); // Urban Company style ₹99 Visit Pass
  const [customWorkAddress, setCustomWorkAddress] = useState<string | null>(null);
  const workAddress = customWorkAddress ?? (currentLocation || 'एमपी नगर (ज़ोन-1), भोपाल • 462011');
  const [description, setDescription] = useState<string>(initialDescription);

  // Real Media attachments (Photo / Video of the problem or site)
  const [attachedMedia, setAttachedMedia] = useState<MediaAttachment[]>([]);
  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({ maxWidth: 680 });

  if (!contractor || !tradeProfile) return null;

  const activeMode =
    tradeProfile.rateModes.find((m) => m.id === selectedModeId) || tradeProfile.rateModes[0];
  const visibleSubFields: TradeSubFieldDef[] = tradeProfile.bookingFields.filter(
    (f) => !f.visibleInModes || f.visibleInModes.includes(activeMode.id)
  );

  // Resolve primary quantity across trade-specific sub-fields vs standalone counter
  const resolvePrimaryQty = (): number => {
    if (activeMode.isDailyLike) {
      if (subValues.helpersOrHoursCount) return Math.max(1, parseFloat(subValues.helpersOrHoursCount) || 1);
      return Math.max(1, parseInt(daysCount, 10) || 1);
    }
    const fieldQtyPriority = [
      subValues.builtUpAreaSqft,
      subValues.masonryCubicMeters,
      subValues.wiringPoints,
      subValues.fansOrFixtures,
      subValues.mainCableMeters,
      subValues.plumbingCount,
      subValues.floorTileSqft,
      subValues.mainCeilingSqft,
      subValues.steelWeightUnits,
      subValues.treatmentAreaSqft,
      subValues.helpersOrHoursCount,
      subValues.pandalAreaSqft,
      subValues.expectedTotalPlates,
      subValues.areaOrLength,
      subValues.hardwarePiecesCount,
    ].find((v) => v !== undefined && String(v).trim() !== '');
    if (fieldQtyPriority) return Math.max(1, parseFloat(fieldQtyPriority) || 1);
    return Math.max(1, parseFloat(thekaUnits) || 1);
  };

  const units = resolvePrimaryQty();

  // Compute transparent labor breakdown from centralized 15-trade rate engine
  const tradeCalc = isQuoteInquiryMode
    ? {
        totalLaborAmount: hasPriorityVisitPass ? 99 : 0,
        appliedRateLabel: hasPriorityVisitPass ? '₹99 प्रायोरिटी विज़िट पास' : 'भाव पूछें (साइट मुआयना)',
        breakdownLineHi: hasPriorityVisitPass ? '₹99 प्रायोरिटी विज़िट पास' : 'निःशुल्क साइट विज़िट',
        extraAddonsAmount: 0,
      }
    : calculateTradeBookingTotal({
        category: contractor.category,
        modeId: activeMode.id,
        units,
        contractorDailyRate: contractor.dailyWageRate,
        contractorHelperRate: contractor.helperRate,
        contractorUnitRate: contractor.contractUnitRate,
        contractorAdditionalCards: contractor.additionalRateCards,
        includeHelper,
        subValues,
        fallbackLaborEstimate: initialLaborEstimate,
      });

  const totalLaborAmount = tradeCalc.totalLaborAmount;

  // Check whether a standalone quantity field should be shown (avoid duplicate numeric box when subFields handle it)
  const subFieldsOwnQuantity = [
    'carpenter_material_pct',
    'carpenter_hardware_piece',
    'carpenter_sqft',
    'carpenter_kitchen_rft',
    'mason_full_contract',
    'mason_cubic_meter',
    'painter_full_contract',
    'electrician_point',
    'electrician_fitting',
    'electrician_cable_meter',
    'tiling_sqft',
    'pop_sqft',
    'welder_kg',
    'welder_ton',
    'wp_sqft',
    'wp_full_quote',
    'labor_helper_day',
    'labor_jcb_hour',
    'tent_sqft',
    'tent_per_item_day',
    'tent_full_function',
    'caterer_per_plate',
    'caterer_full_function',
    'event_per_function',
    'event_full_package',
    'makeup_per_function',
    'makeup_full_package',
  ].includes(activeMode.id);

  // Materials combo calculation (prefers AI 3-Way BOM raw material total when present)
  const comboPrice = contractor.recommendedMaterials?.reduce((acc, m) => acc + m.sellingPrice, 0) || 0;
  const finalMaterialAmount = includeMaterialsCombo
    ? initialMaterialEstimate > 0
      ? Math.round(initialMaterialEstimate)
      : comboPrice
    : 0;

  // Grand total & Advance Token math
  const grandTotal = totalLaborAmount + finalMaterialAmount;
  const escrowAdvanceToken = grandTotal > 0 ? Math.min(grandTotal, Math.max(0, Math.min(1000, Math.round(grandTotal * 0.15)))) : 0;
  const balanceOnOtpRelease = grandTotal - escrowAdvanceToken;
  
  // 3-Stage Milestone Escrow for Theka Contracts (Brick&Bolt model)
  const thekaMilestone1 = Math.round(grandTotal * 0.30);
  const thekaMilestone2 = Math.round(grandTotal * 0.40);
  const thekaMilestone3 = Math.max(0, grandTotal - thekaMilestone1 - thekaMilestone2);
  // Unified Platform Fee: flat ₹35 for Cash, 5% for Online (Contractor pays)
  const platformFee = paymentMethod === 'CASH' ? 35 : Math.round(grandTotal * 0.05);
  const setuEscrowUpiId = process.env.EXPO_PUBLIC_SETU_UPI_ID || 'setu.escrow@okaxis';

  const handleAddMedia = async (type: 'photo' | 'video') => {
    try {
      const picked = await pickImageFromGallery();
      if (!picked || !picked.base64) return;

      const uploadRes = await ApiService.uploadFile(
        picked.base64,
        picked.name || (type === 'photo' ? 'site_photo.jpg' : 'site_snapshot.jpg'),
        'portfolio'
      );

      if (uploadRes && uploadRes.success && (uploadRes.fullUrl || uploadRes.url)) {
        const finalUrl = uploadRes.fullUrl || uploadRes.url;
        const newMedia: MediaAttachment = {
          id: 'm_' + Date.now(),
          type: 'photo',
          title: picked.name || 'साइट फोटो',
          url: finalUrl,
        };
        setAttachedMedia((prev) => [...prev, newMedia]);
        showAppAlert(
          isHindi ? '📸 असली फोटो सर्वर पर सेव हुई' : '📸 Photo Uploaded',
          isHindi ? 'साइट की असली फोटो सर्वर पर सुरक्षित जुड़ चुकी है।' : 'Site media uploaded and saved to server.'
        );
      } else {
        showAppAlert('अपलोड विफल', uploadRes?.error || 'फोटो अपलोड नहीं हो सकी। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      showAppAlert('त्रुटि', 'अपलोड में समस्या: ' + err.message);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setAttachedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleBookingSubmit = () => {
    if (!workAddress.trim() || workAddress.trim().length < 5) {
      showAppAlert(
        isHindi ? 'पता अनिवार्य है (*)' : 'Site Address Required (*)',
        isHindi ? 'कृपया कार्य स्थल का पूरा पता (कम से कम 5 अक्षर) दर्ज करें।' : 'Please enter complete work site address.'
      );
      return;
    }

    if (isQuoteInquiryMode && !description.trim()) {
      showAppAlert(
        isHindi ? 'काम का विवरण अनिवार्य (*)' : 'Work Description Required (*)',
        isHindi
          ? 'कोटेशन मंगाने (भाव पूछें) के लिए नीचे 4 नंबर में संक्षेप में लिखें कि क्या काम करवाना है।'
          : 'Please describe the repair/job needed so contractor can quote accurately.'
      );
      return;
    }

    if (!isQuoteInquiryMode) {
      for (const f of visibleSubFields) {
        if (!f.mandatory) continue;
        const val = (subValues[f.id] || '').trim();
        if (!val) {
          showAppAlert(
            isHindi ? 'अनिवार्य जानकारी (*)' : 'Mandatory Field Missing (*)',
            isHindi
              ? `कृपया "${f.labelHi}" भरना अनिवार्य है।`
              : `Please provide mandatory field: ${f.labelEn}.`
          );
          return;
        }
        if (f.type === 'number') {
          const n = Number(val);
          const minAllowed = f.min !== undefined ? f.min : 1;
          if (!Number.isFinite(n) || n < minAllowed) {
            showAppAlert(
              isHindi ? 'अमान्य संख्या (*)' : 'Invalid Measurement (*)',
              isHindi
                ? `"${f.labelHi}" कम से कम ${minAllowed} (${f.unitHi || ''}) होनी चाहिए।`
                : `${f.labelEn} must be at least ${minAllowed}.`
            );
            return;
          }
          if (f.max !== undefined && n > f.max) {
            showAppAlert(
              isHindi ? 'अधिकतम सीमा जाँच' : 'Limit Exceeded',
              isHindi ? `"${f.labelHi}" अधिकतम ${f.max} हो सकती है।` : `${f.labelEn} cannot exceed ${f.max}.`
            );
            return;
          }
        }
      }

      // Cross-field check: caterer expected plates >= min guarantee
      if (tradeProfile.id === 'caterer' && activeMode.id === 'caterer_per_plate') {
        const minP = Number(subValues.minPlatesGuaranteed) || 0;
        const expP = Number(subValues.expectedTotalPlates) || 0;
        if (expP < minP) {
          showAppAlert(
            isHindi ? 'प्लेट गिनती जाँच (*)' : 'Plate Count Check (*)',
            isHindi
              ? `अनुमानित कुल प्लेट (${expP}) न्यूनतम प्लेट गारंटी (${minP}) से कम नहीं होनी चाहिए।`
              : `Expected plates (${expP}) cannot be less than minimum guaranteed plates (${minP}).`
          );
          return;
        }
      }
    }

    const specsSummary = visibleSubFields
      .map((f) => (subValues[f.id] ? `${f.labelHi}: ${subValues[f.id]}` : ''))
      .filter(Boolean)
      .join(' | ');
    const fullDescription = [description.trim(), specsSummary ? `माप/विवरण: ${specsSummary}` : '']
      .filter(Boolean)
      .join('\n');

    onConfirmBooking({
      contractorId: contractor.id,
      contractorName: contractor.name,
      category: contractor.category,
      bookingMode: isQuoteInquiryMode ? 'भाव_पूछें' : activeMode.backendBookingMode,
      workType: isQuoteInquiryMode
        ? `भाव पूछें (${tradeProfile.nameHindi})`
        : `${tradeProfile.nameHindi} — ${activeMode.labelHi}`,
      paymentMethod,
      totalLaborAmount,
      finalMaterialAmount,
      grandTotal,
      escrowAdvanceToken: paymentMethod === 'CASH' ? 0 : escrowAdvanceToken,
      balanceOnOtpRelease: paymentMethod === 'CASH' ? grandTotal : balanceOnOtpRelease,
      escrowInsuranceFee: 0,
      contractorPlatformFee: platformFee,
      workAddress: workAddress.trim(),
      description: fullDescription,
      attachedMedia,
      includeMaterialsCombo,
      strictValidation: true,
      workMeasurementSpec: {
        tradeId: tradeProfile.id,
        modeId: activeMode.id,
        modeLabel: activeMode.labelHi,
        units,
        subValues,
        breakdownLineHi: tradeCalc.breakdownLineHi,
      },
      date: new Date().toLocaleDateString('hi-IN'),
    });
  };

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.title}>
                {isHindi ? 'पारदर्शी बुकिंग & एस्क्रो गारंटी' : 'Transparent Booking & Escrow'}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>{contractor.name} • {contractor.specialtyHindi}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. First-visible Trade-Priority Hiring Modes */}
            <Text style={styles.sectionLabel}>
              {isHindi
                ? `1. ${tradeProfile.nameHindi} — दर विकल्प चुनें`
                : `1. Select Rate Model (${tradeProfile.nameEng})`}{' '}
              <Text style={styles.reqStar}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tradeModesScroll}
            >
              {tradeProfile.rateModes.map((mode) => {
                const isSel = !isQuoteInquiryMode && activeMode.id === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.tradeModeChip, isSel && styles.tradeModeChipActive]}
                    onPress={() => {
                      setIsQuoteInquiryMode(false);
                      setSelectedModeId(mode.id);
                      setBookingMode(mode.backendBookingMode === 'दिहाड़ी' ? 'दिहाड़ी' : 'ठेका');
                      setThekaUnits(String(mode.defaultUnits));
                    }}
                  >
                    <Text
                      style={[
                        styles.tradeModeChipText,
                        isSel && styles.tradeModeChipTextActive,
                      ]}
                    >
                      {isHindi ? mode.labelHi : mode.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Universal Quick Minor Repair / Ask Quote Tab */}
              <TouchableOpacity
                style={[styles.tradeModeChip, isQuoteInquiryMode && styles.tradeModeChipQuoteActive]}
                onPress={() => {
                  setIsQuoteInquiryMode(true);
                  setBookingMode('भाव_पूछें');
                }}
              >
                <Text
                  style={[
                    styles.tradeModeChipText,
                    isQuoteInquiryMode && styles.tradeModeChipTextActive,
                  ]}
                >
                  💬 {isHindi ? 'छोटा काम / भाव पूछें' : 'Ask Quote'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Research Benchmark Notice */}
            {!isQuoteInquiryMode && (
              <View style={styles.benchmarkHintCard}>
                <Ionicons name="analytics-outline" size={14} color="#0369A1" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benchmarkHintTitle}>
                    {activeMode.fairRangeHi}
                  </Text>
                  <Text style={styles.benchmarkHintSub}>{activeMode.researchNoteHi}</Text>
                </View>
              </View>
            )}

            {/* Inputs based on Selected Mode */}
            {isQuoteInquiryMode ? (
              <View style={styles.cardBox}>
                <Text style={styles.boxLabel}>
                  {isHindi ? 'छोटा काम / मरम्मत (जैसे नल वाशर, स्विच, छोटा फॉल्ट):' : 'Minor Work or Inspection:'}
                </Text>
                
                {/* Urban Company Model: ₹99 Priority Visit Pass (Adjustable on final bill) */}
                <TouchableOpacity
                  style={[
                    styles.visitPassOption,
                    hasPriorityVisitPass && styles.visitPassOptionActive,
                  ]}
                  onPress={() => setHasPriorityVisitPass(!hasPriorityVisitPass)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons
                      name={hasPriorityVisitPass ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={hasPriorityVisitPass ? '#1E40AF' : '#64748B'}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.visitPassTitle}>
                          {isHindi ? '⚡ ₹99 प्रायोरिटी विज़िट पास (Adjustable Pass)' : '⚡ ₹99 Priority Visit Pass'}
                        </Text>
                        <View style={styles.urbanBadge}>
                          <Text style={styles.urbanBadgeText}>100% एडजस्टेबल</Text>
                        </View>
                      </View>
                      <Text style={styles.visitPassSub}>
                        {isHindi
                          ? 'यदि आप काम करवाते हैं तो यह ₹99 फाइनल बिल में से माइनस (फ्री) हो जाएगा।'
                          : 'Deducted from your final bill if service is hired on site.'}
                      </Text>
                    </View>
                    <Text style={styles.visitPassPrice}>+₹99</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.helpText}>
                  {isHindi
                    ? '💡 कारीगर साइट पर आकर समस्या देखेगा और उचित कोटेशन देगा। ग्राहक के स्वीकार करने पर दाम लॉक होगा।'
                    : '💡 Pro visits your site and quotes fairly. Rate locks upon your acceptance.'}
                </Text>
              </View>
            ) : (
              <View style={styles.cardBox}>
                {/* Daily Wage counter & Helper option if daily-like */}
                {activeMode.isDailyLike && (
                  <>
                    <Text style={styles.boxLabel}>
                      {isHindi ? 'कितने दिनों की दिहाड़ी चाहिए?' : 'How many work days needed?'}{' '}
                      <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <View style={styles.counterRow}>
                      {['1', '2', '3', '5', '7'].map((d) => (
                        <TouchableOpacity
                          key={d}
                          style={[styles.counterPill, daysCount === d && styles.counterPillActive]}
                          onPress={() => setDaysCount(d)}
                        >
                          <Text
                            style={[
                              styles.counterText,
                              daysCount === d && styles.counterTextActive,
                            ]}
                          >
                            {d} {isHindi ? 'दिन' : 'Days'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {tradeProfile.id !== 'labor' && (
                      <TouchableOpacity
                        style={styles.toggleRow}
                        onPress={() => setIncludeHelper(!includeHelper)}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name={includeHelper ? 'check-box' : 'check-box-outline-blank'}
                          size={22}
                          color={COLORS.primary}
                        />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.toggleTitle}>
                            {isHindi
                              ? `सहायक हेल्पर कारीगर जोड़ें (${contractor.helperRate ? `+₹${contractor.helperRate}/दिन` : '+₹550/दिन मानक'})`
                              : `Add Assistant Helper (${contractor.helperRate ? `+₹${contractor.helperRate}/day` : '+₹550/day'})`}
                          </Text>
                          <Text style={styles.toggleSub}>
                            {isHindi
                              ? 'भारी सामान उठाने व काम तेज़ी से पूरा करने के लिए'
                              : 'For heavy lifting and 2x faster project completion'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {/* Standalone Quantity Input when mode isn't covered directly inside trade sub-fields */}
                {!activeMode.isDailyLike && !subFieldsOwnQuantity && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.boxLabel}>
                      {isHindi
                        ? `अनुमानित मात्रा (${activeMode.unitHi})`
                        : `Estimated Quantity (${activeMode.unitEn})`}{' '}
                      <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.textInput}
                        value={thekaUnits}
                        onChangeText={setThekaUnits}
                        keyboardType="numeric"
                        placeholder={String(activeMode.defaultUnits)}
                      />
                      <Text style={styles.unitText}>{activeMode.unitHi}</Text>
                    </View>
                  </View>
                )}

                {/* Conditional Trade-Specific Mandatory & Optional Fields */}
                {visibleSubFields.map((field) => {
                  const val = subValues[field.id] || '';
                  return (
                    <View key={field.id} style={styles.subFieldBlock}>
                      <Text style={styles.subFieldLabel}>
                        {isHindi ? field.labelHi : field.labelEn}
                        {field.mandatory && <Text style={styles.reqStar}> * अनिवार्य</Text>}
                      </Text>

                      {field.type === 'select' && field.options ? (
                        <View style={styles.selectPillsWrap}>
                          {field.options.map((opt) => {
                            const selected = val === opt.value;
                            return (
                              <TouchableOpacity
                                key={opt.value}
                                style={[
                                  styles.selectOptPill,
                                  selected && styles.selectOptPillActive,
                                ]}
                                onPress={() =>
                                  setSubValues((prev) => ({ ...prev, [field.id]: opt.value }))
                                }
                              >
                                <Text
                                  style={[
                                    styles.selectOptText,
                                    selected && styles.selectOptTextActive,
                                  ]}
                                >
                                  {isHindi ? opt.labelHi : opt.labelEn}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : (
                        <View style={styles.inputRow}>
                          <TextInput
                            style={[
                              styles.textInput,
                              field.type === 'text' && { fontSize: 13, fontWeight: '600' },
                            ]}
                            value={val}
                            onChangeText={(txt) =>
                              setSubValues((prev) => ({ ...prev, [field.id]: txt }))
                            }
                            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                            placeholder={field.placeholderHi || ''}
                          />
                          {field.unitHi ? (
                            <Text style={styles.unitText}>{field.unitHi}</Text>
                          ) : null}
                        </View>
                      )}

                      {field.helperNoteHi && (
                        <Text style={styles.helpText}>💡 {field.helperNoteHi}</Text>
                      )}
                    </View>
                  );
                })}

                <View style={styles.calcAppliedLine}>
                  <Text style={styles.calcAppliedText}>
                    📐 लागू दर: {tradeCalc.appliedRateLabel} ({tradeCalc.breakdownLineHi})
                  </Text>
                </View>

                {/* Brick&Bolt Model: 3-Stage Milestone Escrow Protection */}
                {!activeMode.isDailyLike && grandTotal > 0 && (
                  <View style={styles.milestoneBox}>
                    <View style={styles.milestoneHeader}>
                      <Ionicons name="shield-checkmark" size={15} color="#059669" />
                      <Text style={styles.milestoneTitle}>
                        {isHindi ? '3-चरण सुरक्षित एस्क्रो रिलीज (Brick&Bolt Protected)' : '3-Stage Milestone Escrow Release'}
                      </Text>
                    </View>
                    <View style={styles.milestoneStepRow}>
                      <View style={styles.milestonePill}>
                        <Text style={styles.milestonePillStep}>चरण 1 (30%)</Text>
                        <Text style={styles.milestonePillVal}>₹{thekaMilestone1.toLocaleString('en-IN')}</Text>
                        <Text style={styles.milestonePillSub}>सामग्री/साइट शुरुआत</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
                      <View style={styles.milestonePill}>
                        <Text style={styles.milestonePillStep}>चरण 2 (40%)</Text>
                        <Text style={styles.milestonePillVal}>₹{thekaMilestone2.toLocaleString('en-IN')}</Text>
                        <Text style={styles.milestonePillSub}>स्ट्रक्चर/फिटिंग पूर्ण</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
                      <View style={styles.milestonePill}>
                        <Text style={styles.milestonePillStep}>चरण 3 (30%)</Text>
                        <Text style={styles.milestonePillVal}>₹{thekaMilestone3.toLocaleString('en-IN')}</Text>
                        <Text style={styles.milestonePillSub}>अंतिम ग्राहक OTP</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Address */}
            <View style={styles.cardBox}>
              <Text style={styles.boxLabel}>
                {isHindi ? '2. कार्य स्थल का पता (Site Address)' : '2. Work Site Address'}{' '}
                <Text style={styles.reqStar}>*</Text>
              </Text>
              <TextInput
                style={styles.addressInput}
                value={workAddress}
                onChangeText={setCustomWorkAddress}
                placeholder={isHindi ? 'घर/दुकान का पूरा पता दर्ज करें' : 'Enter complete site address'}
                multiline
              />
            </View>

            {/* Photo / Video Upload Option */}
            <View style={styles.cardBox}>
              <View style={styles.mediaHeaderRow}>
                <View>
                  <Text style={styles.boxLabel}>
                    {isHindi ? '3. समस्या / साइट की फोटो & वीडियो:' : '3. Site Photos & Problem Videos:'}
                  </Text>
                  <Text style={styles.helpText}>
                    {isHindi 
                      ? 'फोटो/वीडियो डालने से सही औजार व सटीक कोटेशन मिलता है।'
                      : 'Attaching media helps pros assess exact tools & materials.'}
                  </Text>
                </View>
              </View>

              {/* Attached Media List */}
              <View style={styles.attachedMediaList}>
                {attachedMedia.map((m) => (
                  <View key={m.id} style={styles.mediaThumbCard}>
                    <Image source={{ uri: m.url }} style={styles.mediaThumbImg} />
                    <View style={styles.mediaTypeBadge}>
                      <MaterialIcons 
                        name={m.type === 'photo' ? 'camera-alt' : 'videocam'} 
                        size={12} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.mediaTypeBadgeText}>
                        {m.type === 'photo' ? (isHindi ? 'फोटो' : 'Photo') : (isHindi ? 'वीडियो' : 'Video')}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.mediaRemoveBtn}
                      onPress={() => handleRemoveMedia(m.id)}
                    >
                      <MaterialIcons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Upload Buttons */}
                <TouchableOpacity 
                  style={styles.uploadActionBtn}
                  onPress={() => handleAddMedia('photo')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add-a-photo" size={20} color={COLORS.primary} />
                  <Text style={styles.uploadActionText}>
                    {isHindi ? '+ फोटो' : '+ Photo'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadActionBtn}
                  onPress={() => handleAddMedia('video')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="video-call" size={22} color="#D97706" />
                  <Text style={[styles.uploadActionText, { color: '#D97706' }]}>
                    {isHindi ? '+ 15s वीडियो' : '+ 15s Video'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Smart Materials Combo Add-on (Automating Local Hardware Shop Sales) */}
            {contractor.recommendedMaterials && contractor.recommendedMaterials.length > 0 && (
              <View style={styles.comboCardBox}>
                <TouchableOpacity
                  style={styles.comboToggleRow}
                  onPress={() => setIncludeMaterialsCombo(!includeMaterialsCombo)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={includeMaterialsCombo ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color="#059669"
                  />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.comboTitle}>
                        {isHindi ? '🧱 आवश्यक मटेरियल किट साथ जोड़ें' : '🧱 Add Material Kit Bundle'}
                      </Text>
                      <View style={styles.blinkitBadge}>
                        <Text style={styles.blinkitBadgeText}>2 घंटे में डिलीवरी</Text>
                      </View>
                    </View>
                    <Text style={styles.comboSub}>
                      {isHindi 
                        ? 'नजदीकी अधिकृत हार्डवेयर स्टोर से थोक दर पर सामान सीधा साइट पर पहुँचेगा'
                        : 'Direct wholesale delivery to your site from nearest verified shop'}
                    </Text>
                  </View>
                  <Text style={styles.comboPriceText}>+₹{comboPrice.toLocaleString('en-IN')}</Text>
                </TouchableOpacity>

                {includeMaterialsCombo && (
                  <View style={styles.comboDetailsList}>
                    {contractor.recommendedMaterials.map((mat) => (
                      <View key={mat.id} style={styles.comboDetailItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.comboDetailName}>{mat.name}</Text>
                          <Text style={styles.comboDetailShop}>🏪 {mat.storeName}</Text>
                        </View>
                        <Text style={styles.comboDetailItemPrice}>₹{mat.sellingPrice}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Work details */}
            <View style={styles.cardBox}>
              <Text style={styles.boxLabel}>
                {isHindi
                  ? `4. काम का संक्षिप्त विवरण (${isQuoteInquiryMode ? 'अनिवार्य' : 'वैकल्पिक'}):`
                  : '4. Work Notes:'}
                {isQuoteInquiryMode && <Text style={styles.reqStar}> * अनिवार्य</Text>}
              </Text>
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                placeholder={isHindi ? 'उदा. किचन की अलमारी बनानी है, प्लाई आ चुकी है...' : 'e.g. Kitchen cabinets, plywood ready on site...'}
                multiline
              />
            </View>

            {/* 5. भुगतान का तरीका चुनें (Flipkart & Uber Dual Payment Models) */}
            <View style={styles.cardBox}>
              <Text style={styles.boxLabel}>
                {isHindi ? '5. भुगतान का तरीका चुनें (Payment Method):' : '5. Select Payment Method:'}
              </Text>

              <View style={styles.paymentOptionsContainer}>
                {/* 💵 Option 1: Cash on Completion (Flipkart/Uber Style) */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === 'CASH' && styles.paymentOptionCardActiveCash,
                  ]}
                  onPress={() => setPaymentMethod('CASH')}
                  activeOpacity={0.88}
                >
                  <View style={styles.paymentRadioRow}>
                    <Ionicons
                      name={paymentMethod === 'CASH' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={paymentMethod === 'CASH' ? '#16A34A' : '#94A3B8'}
                    />
                    <Text style={styles.paymentOptionHeading}>
                      {isHindi ? '💵 काम होने पर नकद / UPI दें (COD)' : '💵 Pay Cash / UPI After Work'}
                    </Text>
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>
                        {isHindi ? 'अग्रिम ₹0' : '₹0 Advance'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.paymentOptionDesc}>
                    {isHindi
                      ? 'आज ₹0 देना है। जब मिस्त्री घर आकर काम पूरा कर दे और आप संतुष्ट हों, तब सीधे नकद या QR स्कैन करके दें।'
                      : '₹0 due today. Inspect work on site and pay cash or UPI directly to contractor when satisfied.'}
                  </Text>
                </TouchableOpacity>

                {/* 🛡️ Option 2: Online Escrow Guarantee */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === 'ONLINE_ESCROW' && styles.paymentOptionCardActiveEscrow,
                  ]}
                  onPress={() => setPaymentMethod('ONLINE_ESCROW')}
                  activeOpacity={0.88}
                >
                  <View style={styles.paymentRadioRow}>
                    <Ionicons
                      name={paymentMethod === 'ONLINE_ESCROW' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={paymentMethod === 'ONLINE_ESCROW' ? '#4F46E5' : '#94A3B8'}
                    />
                    <Text style={styles.paymentOptionHeading}>
                      {isHindi ? '🛡️ सुरक्षित ऑनलाइन एस्क्रो' : '🛡️ Safe Online Escrow'}
                    </Text>
                    <View style={styles.warrantyBadge}>
                      <Text style={styles.warrantyBadgeText}>
                        {isHindi ? 'OTP सुरक्षा' : 'OTP Protection'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.paymentOptionDesc}>
                    {isHindi
                      ? 'टोकन राशि कारीगर विज़िट और साइट पुष्टि के लिए है। पूरा शेष भुगतान कार्य पूरा होने पर OTP द्वारा होगा।'
                      : 'Advance token confirms contractor visit. Remaining payment is released via OTP upon satisfactory completion.'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 100% Transparent Financial Breakdown & Win-Win-Win Escrow */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#059669" />
                <Text style={styles.summaryTopTitle}>
                  {isHindi ? '100% पारदर्शी वित्तीय ब्रेकडाउन (SETU Guarantee)' : '100% Transparent Financial Breakdown'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {isHindi ? `कुल लेबर मजदूरी (${bookingMode}):` : `Total Labor Wage (${bookingMode}):`}
                </Text>
                <Text style={styles.summaryValue}>₹{totalLaborAmount.toLocaleString('en-IN')}</Text>
              </View>

              {includeMaterialsCombo && finalMaterialAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {isHindi ? 'मटेरियल कॉम्बो (हार्डवेयर दुकान):' : 'Material Kit (Local Shop):'}
                  </Text>
                  <Text style={styles.summaryValue}>₹{finalMaterialAmount.toLocaleString('en-IN')}</Text>
                </View>
              )}

              <View style={[styles.summaryRow, { paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                <Text style={styles.grandTotalLabel}>
                  {isHindi ? 'कुल काम का बिल (Total Project):' : 'Total Project Estimate:'}
                </Text>
                <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
              </View>

              {/* Dynamic Split based on Payment Method */}
              {paymentMethod === 'CASH' ? (
                <View style={styles.cashNoticeBox}>
                  <View style={styles.cashNoticeRow}>
                    <Ionicons name="wallet-outline" size={16} color="#16A34A" />
                    <Text style={styles.cashNoticeTitle}>
                      {isHindi ? '💵 आज देय राशि: ₹0 (Zero Advance)' : '💵 Due Today: ₹0 (Zero Advance)'}
                    </Text>
                  </View>
                  <Text style={styles.cashNoticeSub}>
                    {isHindi
                      ? `• पूरा ₹${grandTotal.toLocaleString('en-IN')} काम पूरा होने पर सीधे मिस्त्री को नकद या UPI द्वारा दें।\n• ठेकेदार के SETU वॉलेट से मात्र ₹${platformFee} फ्लैट प्लेटफ़ॉर्म लीड फीस कटेगी।`
                      : `• Pay full ₹${grandTotal.toLocaleString('en-IN')} directly to pro via Cash/UPI on completion.\n• Minimal ₹${platformFee} flat platform lead fee deducted from pro wallet.`}
                  </Text>
                </View>
              ) : (
                <View style={styles.escrowSplitCard}>
                  <View style={styles.splitRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.splitLabel}>
                        {isHindi ? '🛡️ आज केवल अग्रिम टोकन (15% Escrow):' : '🛡️ Advance Token Due Today (15%):'}
                      </Text>
                      <Text style={styles.splitSub}>
                        {isHindi ? 'काम शुरू होने तक SETU सुरक्षित एस्क्रो में जमा' : 'Held safely in escrow until work commences'}
                      </Text>
                    </View>
                    <Text style={styles.advanceValue}>₹{escrowAdvanceToken.toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={[styles.splitRow, { marginTop: 8 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.splitLabel}>
                        {isHindi ? '📱 शेष भुगतान (Customer OTP पर):' : '📱 Balance on Completion (OTP Release):'}
                      </Text>
                      <Text style={styles.splitSub}>
                        {isHindi ? 'काम पूरा होने पर ही आपके OTP से कारीगर को मिलेगा' : 'Released only when you verify & share OTP'}
                      </Text>
                    </View>
                    <Text style={styles.balanceValue}>₹{balanceOnOtpRelease.toLocaleString('en-IN')}</Text>
                  </View>

                  {escrowAdvanceToken > 0 && (
                    <View style={styles.upiQrBox}>
                      <View style={styles.upiQrHeader}>
                        <Ionicons name="qr-code" size={15} color="#4F46E5" />
                        <Text style={styles.upiQrTitle}>
                          {isHindi ? `लाइव UPI QR प्रीव्यू (टोकन: ₹${escrowAdvanceToken}):` : `UPI QR Preview (₹${escrowAdvanceToken}):`}
                        </Text>
                      </View>
                      <View style={styles.qrImageContainer}>
                        <Image
                          source={{
                            uri: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${setuEscrowUpiId}&pn=SETU Escrow&am=${escrowAdvanceToken}&cu=INR`)}`,
                          }}
                          style={styles.qrImage}
                        />
                        <Text style={styles.upiIdText}>UPI ID: {setuEscrowUpiId}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.upiDirectPayBtn}
                        onPress={() => {
                          const upiUrl = `upi://pay?pa=${encodeURIComponent(setuEscrowUpiId)}&pn=SETU%20Escrow&am=${escrowAdvanceToken}&cu=INR`;
                          if (Platform.OS === 'web' && typeof window !== 'undefined') {
                            window.open(upiUrl, '_blank');
                          } else {
                            Linking.openURL(upiUrl).catch(() => {
                              showAppAlert('UPI ऍप', 'कृपया ऊपर दिए गए QR कोड को किसी भी UPI ऍप से स्कैन करें।');
                            });
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <FontAwesome5 name="mobile-alt" size={14} color="#FFFFFF" />
                        <Text style={styles.upiDirectPayText}>
                          {isHindi ? `PhonePe / GPay से ₹${escrowAdvanceToken} दें ➔` : `Pay ₹${escrowAdvanceToken} via UPI App ➔`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Contractor & Platform Win-Win-Win Transparency */}
              <View style={styles.transparencyBox}>
                <View style={styles.transparencyBadge}>
                  <Feather name="check-circle" size={14} color="#065F46" />
                  <Text style={styles.transparencyTitle}>
                    {isHindi ? 'नो-लूट फेयर मॉडल (Contractor Friendly):' : 'Fair Partner Model (Zero Exploitation):'}
                  </Text>
                </View>
                <Text style={styles.transparencyDesc}>
                  {isHindi
                    ? `• ठेकेदार से भारी 20-30% कमीशन की जगह मात्र ₹${platformFee} फ्लैट/एस्क्रो लीड फीस ली जाती है।\n• कारीगर की 100% मेहनत की कमाई उसी के पास रहती है!`
                    : `• Only a transparent ₹${platformFee} lead fee instead of brutal 20-30% commissions.\n• 100% of the hard-earned labor stays with the artisan!`}
                </Text>
              </View>

              {/* SETU Fair Payment & Cancellation Policy */}
              <View style={styles.refundPolicyBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MaterialIcons name="security" size={15} color="#059669" />
                  <Text style={styles.refundPolicyTitle}>
                    {isHindi ? 'SETU पारदर्शी भुगतान व रद्दीकरण नीति' : 'SETU Fair Payment & Cancellation Policy'}
                  </Text>
                </View>
                <Text style={styles.refundPolicyText}>
                  {isHindi
                    ? '• यदि कारीगर तय समय पर नहीं पहुंचता, तो आपका एस्क्रो टोकन तुरंत वापस होगा।\n• कारीगर के घर पहुंचने से पहले बिना किसी पेनल्टी के रद्द कर सकते हैं।'
                    : '• If contractor does not arrive on schedule, token is refunded immediately.\n• Free cancellation before contractor arrival with zero penalty.'}
                </Text>
              </View>
            </View>

            {/* 📋 PRE-CONFIRMATION SUMMARY CARD (Audit Requisite) */}
            <View style={styles.preConfirmCard}>
              <View style={styles.preConfirmHeader}>
                <Ionicons name="receipt-outline" size={18} color="#1E40AF" />
                <Text style={styles.preConfirmTitle}>
                  {isHindi ? '📋 बुकिंग सारांश (Pre-Confirmation)' : '📋 Pre-Confirmation Summary'}
                </Text>
              </View>

              <View style={styles.preConfirmRow}>
                <Text style={styles.preConfirmLabel}>कारीगर:</Text>
                <Text style={styles.preConfirmVal}>{contractor.name} ({contractor.specialtyHindi})</Text>
              </View>

              <View style={styles.preConfirmRow}>
                <Text style={styles.preConfirmLabel}>काम का प्रकार:</Text>
                <Text style={styles.preConfirmVal}>
                  {isQuoteInquiryMode
                    ? 'छोटा काम / साइट मुआयना (भाव पूछें)'
                    : `${activeMode.labelHi} — ${tradeCalc.breakdownLineHi}`}
                </Text>
              </View>

              <View style={styles.preConfirmRow}>
                <Text style={styles.preConfirmLabel}>तारीख & समय:</Text>
                <Text style={styles.preConfirmVal}>आज / तत्काल अथवा आपकी सुविधानुसार</Text>
              </View>

              <View style={styles.preConfirmRow}>
                <Text style={styles.preConfirmLabel}>पूरा पता:</Text>
                <Text style={styles.preConfirmVal} numberOfLines={2}>{workAddress}</Text>
              </View>

              <View style={styles.preConfirmDivider} />

              <View style={styles.preConfirmRow}>
                <Text style={styles.preConfirmGrandLabel}>कुल देय राशि:</Text>
                <Text style={styles.preConfirmGrandVal}>
                  {grandTotal > 0 ? `₹${grandTotal.toLocaleString('en-IN')}` : 'भाव पूछें (साइट पर तय)'}
                </Text>
              </View>

              <View style={styles.preConfirmRow}>
                <Text style={styles.preConfirmLabel}>आज का टोकन:</Text>
                <Text style={[styles.preConfirmVal, { color: '#059669', fontWeight: '800' }]}>
                  {paymentMethod === 'CASH' || grandTotal === 0 ? '₹0 (नकद / फ्री विज़िट)' : `₹${escrowAdvanceToken}`}
                </Text>
              </View>

              {/* DEMO SIMULATION NOTICE */}
              <View style={styles.demoSimNoticeBox}>
                <Ionicons name="information-circle" size={15} color="#B45309" />
                <Text style={styles.demoSimNoticeText}>
                  💡 यह सिर्फ़ डेमो सिमुलेशन है, कोई असली पैसा नहीं कटेगा।
                </Text>
              </View>
            </View>

            {/* Confirm & Book */}
            <TouchableOpacity
              style={[styles.submitBtn, paymentMethod === 'CASH' && styles.submitBtnCash]}
              onPress={handleBookingSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {paymentMethod === 'CASH'
                  ? (isHindi ? '✓ नकद बुकिंग कन्फर्म करें (₹0 अग्रिम) ➔' : 'Confirm Cash Booking (₹0 Due Now) ➔')
                  : (isHindi ? `सुरक्षित ऑनलाइन एस्क्रो टोकन दें (₹${escrowAdvanceToken}) ➔` : `Pay Escrow Token (₹${escrowAdvanceToken}) ➔`)}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 35 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeTabActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  modeTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  cardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  counterPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  counterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  counterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  counterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  helpText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addressInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    minHeight: 45,
  },
  mediaHeaderRow: {
    marginBottom: 8,
  },
  attachedMediaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  mediaThumbCard: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  mediaThumbImg: {
    width: '100%',
    height: '100%',
  },
  mediaTypeBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    gap: 3,
  },
  mediaTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadActionBtn: {
    width: 76,
    height: 76,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadActionText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  comboCardBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  comboToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },
  blinkitBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  blinkitBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  comboSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  comboPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  comboDetailsList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    gap: 6,
  },
  comboDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comboDetailName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  comboDetailShop: {
    fontSize: 9.5,
    color: COLORS.textMuted,
  },
  comboDetailItemPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  descInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    fontSize: 12,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  summaryTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  summaryTopTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  grandTotalLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  escrowSplitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  splitSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  advanceValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.accent,
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  insuranceValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  upiQrBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    alignItems: 'center',
  },
  upiQrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  upiQrTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#3730A3',
  },
  qrImageContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upiIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
  },
  upiDirectPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    marginTop: 10,
    width: '100%',
  },
  upiDirectPayText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  transparencyBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  transparencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  transparencyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  transparencyDesc: {
    fontSize: 10,
    color: '#047857',
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnCash: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  // Dual payment options styles (Flipkart/Uber)
  paymentOptionsContainer: {
    gap: 8,
  },
  paymentOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  paymentOptionCardActiveCash: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  paymentOptionCardActiveEscrow: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  paymentRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  paymentOptionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  warrantyBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warrantyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3730A3',
  },
  paymentOptionDesc: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
    marginLeft: 26,
    fontWeight: '500',
  },
  cashNoticeBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cashNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cashNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#166534',
  },
  cashNoticeSub: {
    fontSize: 10.5,
    color: '#15803D',
    lineHeight: 15,
    fontWeight: '600',
  },
  refundPolicyBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  refundPolicyTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
  },
  refundPolicyText: {
    fontSize: 10,
    color: '#047857',
    lineHeight: 14.5,
    fontWeight: '600',
  },
  preConfirmCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    padding: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  preConfirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  preConfirmTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  preConfirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  preConfirmLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  preConfirmVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1.6,
    textAlign: 'right',
  },
  preConfirmDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  preConfirmGrandLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  preConfirmGrandVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  demoSimNoticeBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoSimNoticeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
    flex: 1,
  },
  // Urban Company ₹99 Visit Pass
  visitPassOption: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  visitPassOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  visitPassTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  urbanBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  urbanBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  visitPassSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  visitPassPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
  },
  // Brick&Bolt 3-Stage Milestone Escrow
  milestoneBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#166534',
  },
  milestoneStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  milestonePill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  milestonePillStep: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  milestonePillVal: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 1,
  },
  milestonePillSub: {
    fontSize: 8.5,
    color: '#64748B',
    textAlign: 'center',
  },
  reqStar: {
    color: '#DC2626',
    fontWeight: '900',
  },
  tradeModesScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  tradeModeChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  tradeModeChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  tradeModeChipQuoteActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  tradeModeChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  tradeModeChipTextActive: {
    color: '#FFFFFF',
  },
  benchmarkHintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 10,
  },
  benchmarkHintTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  benchmarkHintSub: {
    fontSize: 10,
    color: '#0C4A6E',
    marginTop: 1,
  },
  subFieldBlock: {
    marginTop: 10,
  },
  subFieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  selectPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectOptPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  selectOptPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  selectOptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  selectOptTextActive: {
    color: '#1E40AF',
    fontWeight: '800',
  },
  calcAppliedLine: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 12,
  },
  calcAppliedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
});
