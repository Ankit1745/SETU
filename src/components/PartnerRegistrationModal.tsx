import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { pickImageFromGallery } from '../utils/mediaPicker';
import { ApiService } from '../services/api';
import { Language } from '../i18n/translations';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';
import { detectLiveGpsLocation } from '../utils/liveLocation';
import {
  ORDERED_15_TRADES,
  getTradeRateProfile,
  normalizeTradeCategory,
} from '../data/tradeRateConfig';

interface PartnerRegistrationModalProps {
  visible: boolean;
  initialType?: 'CONTRACTOR' | 'VENDOR';
  language?: Language;
  onClose: () => void;
  onRegistrationComplete: (partnerData: any) => Promise<boolean> | boolean | void;
}

export const PartnerRegistrationModal: React.FC<PartnerRegistrationModalProps> = ({
  visible,
  initialType = 'CONTRACTOR',
  language = 'hi',
  onClose,
  onRegistrationComplete,
}) => {
  const _isEn = language === 'en';
  const [partnerType, setPartnerType] = useState<'CONTRACTOR' | 'VENDOR'>(initialType);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Basic Info & Trade / Store
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedTrade, setSelectedTrade] = useState(ORDERED_15_TRADES[0].registrationLabelHi);
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('भोपाल');
  const [locality, setLocality] = useState('एमपी नगर');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // STEP 2: Identity & KYC Verification (SETU Verified Pro)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [noCriminalRecord, setNoCriminalRecord] = useState(true);
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // STEP 3: Experience, Tools & Dynamic 15-Trade Rate Card
  const activeTradeProfile = getTradeRateProfile(selectedTrade);
  const [selectedPrimaryModeId, setSelectedPrimaryModeId] = useState<string>(
    ORDERED_15_TRADES[0].rateModes[0].id
  );
  const [tradeFieldValues, setTradeFieldValues] = useState<Record<string, string>>({});
  const [experienceYears, setExperienceYears] = useState('0');
  const [isTeamThekedar, setIsTeamThekedar] = useState(false);
  const [teamSize, setTeamSize] = useState('1');
  const [hasOwnTools] = useState(true);
  const [dailyRate, setDailyRate] = useState('');
  const [helperRate, setHelperRate] = useState('');
  const [thekaRate, setThekaRate] = useState('');
  const [thekaUnitLabel, setThekaUnitLabel] = useState(ORDERED_15_TRADES[0].rateModes[0].unitHi);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('10');
  const [minFreeDeliveryAmount, setMinFreeDeliveryAmount] = useState('3000');

  const handleSelectTradeOption = (tradeLabel: string) => {
    setSelectedTrade(tradeLabel);
    const prof = getTradeRateProfile(tradeLabel);
    const firstMode = prof.rateModes[0];
    setSelectedPrimaryModeId(firstMode.id);
    setThekaUnitLabel(firstMode.unitHi);
    setDailyRate('');
    setHelperRate('');
    setThekaRate('');
    setTradeFieldValues({});
  };

  const handleTradeFieldChange = (fieldKey: string, val: string, mapsTo?: string) => {
    setTradeFieldValues((prev) => ({ ...prev, [fieldKey]: val }));
    if (mapsTo === 'dailyWageRate' || fieldKey === 'dailyWageRate') setDailyRate(val);
    if (mapsTo === 'helperRate' || fieldKey === 'helperRate') setHelperRate(val);
    if (mapsTo === 'contractUnitRate' || fieldKey === 'contractUnitRate') setThekaRate(val);
  };

  // STEP 4: Bank Account & UPI Setup for Instant Escrow Payouts
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // STEP 5: Portfolio Photos
  const [workPhotoTitle, setWorkPhotoTitle] = useState('');
  const [workPhotoUrl, setWorkPhotoUrl] = useState('');

  const handlePickImage = async (type: 'avatar' | 'aadhaar' | 'work') => {
    setIsUploading(true);
    try {
      const picked = await pickImageFromGallery();
      if (!picked || !picked.base64) {
        setIsUploading(false);
        return;
      }

      const isKyc = type === 'aadhaar';
      const folder = isKyc ? 'kyc' : type === 'avatar' ? 'avatar' : 'portfolio';
      const uploadRes = await ApiService.uploadFile(
        picked.base64,
        picked.name || (isKyc ? 'kyc_document.jpg' : type === 'avatar' ? 'profile_photo.jpg' : 'work_photo.jpg'),
        folder,
        isKyc
      );

      setIsUploading(false);
      if (uploadRes && uploadRes.success) {
        const fileRef = isKyc ? (uploadRes.privateRef || uploadRes.filename) : (uploadRes.fullUrl || uploadRes.url);
        if (isKyc) {
          setAadhaarPhotoUrl(fileRef);
          showAppAlert('✅ केवाईसी दस्तावेज सुरक्षित', 'आपका पहचान पत्र सुरक्षित प्राइवेट स्टोरेज में अपलोड हो गया है। केवल अधिकृत एडमिन सत्यापन हेतु देख सकते हैं।');
        } else if (type === 'avatar') {
          setAvatarUrl(fileRef);
          showAppAlert('✅ प्रोफाइल फोटो अपलोड सफल', 'आपकी असली प्रोफाइल फोटो जुड़ चुकी है।');
        } else {
          setWorkPhotoUrl(fileRef);
          showAppAlert('✅ फोटो अपलोड सफल', 'आपकी कार्य फोटो सफलतापूर्वक जुड़ गई है!');
        }
      } else {
        showAppAlert('अपलोड विफल', uploadRes?.error || 'फाइल अपलोड नहीं हो सकी।');
      }
    } catch (err: any) {
      setIsUploading(false);
      showAppAlert('त्रुटि', 'फाइल अपलोड में समस्या: ' + err.message);
    }
  };

  const handleDetectPartnerGps = async () => {
    setIsDetectingGps(true);
    const res = await detectLiveGpsLocation();
    setIsDetectingGps(false);
    if (res.ok) {
      if (res.city) setCity(res.city);
      if (res.area) setLocality(res.area);
      showAppAlert(
        '📍 लाइव लोकेशन सेट हुई',
        `आपका वर्तमान पता पहचाना गया: ${res.formattedLocation}`
      );
    } else {
      showAppAlert('GPS लोकेशन', res.error || 'GPS लोकेशन नहीं मिल सकी। कृपया शहर व इलाका हाथ से भरें।');
    }
  };

  const totalSteps = partnerType === 'CONTRACTOR' ? 5 : 4;

  const parseSafeOptionalRate = (raw: string): number | null | 'INVALID' => {
    if (!raw.trim()) return null;
    const num = Number(raw.trim());
    if (!Number.isFinite(num) || num <= 0) return 'INVALID';
    return Math.round(num);
  };

  const handleNext = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (currentStep === 1) {
      if (fullName.trim().length < 2) {
        showAppAlert('अनिवार्य जानकारी (*)', 'कृपया अपना पूरा नाम (कम से कम 2 अक्षर) अवश्य दर्ज करें।');
        return;
      }
      if (cleanPhone.length !== 10) {
        showAppAlert('अनिवार्य जानकारी (*)', 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।');
        return;
      }
      if (partnerType === 'VENDOR' && storeName.trim().length < 2) {
        showAppAlert('अनिवार्य जानकारी (*)', 'कृपया अपनी दुकान / फर्म का नाम दर्ज करें।');
        return;
      }
      if (!city.trim() || !locality.trim()) {
        showAppAlert('अनिवार्य जानकारी (*)', 'कृपया अपना शहर और कार्य क्षेत्र / इलाका दर्ज करें।');
        return;
      }
    } else if (currentStep === 2) {
      if (partnerType === 'CONTRACTOR') {
        const aadhaarDigits = aadhaarNumber.replace(/\D/g, '');
        if (aadhaarDigits.length !== 12) {
          showAppAlert('KYC अनिवार्य (*)', 'सुरक्षा सत्यापन हेतु सही 12 अंकों का आधार नंबर दर्ज करें।');
          return;
        }
        if (!noCriminalRecord) {
          showAppAlert('घोषणा अनिवार्य (*)', 'रजिस्ट्रेशन आगे बढ़ाने के लिए स्वच्छ पृष्ठभूमि घोषणा (Self Declaration) स्वीकार करना अनिवार्य है।');
          return;
        }
      } else {
        const gstClean = gstNumber.trim().toUpperCase();
        const panClean = panNumber.trim().toUpperCase();
        if (gstClean.length < 10 && panClean.length < 10) {
          showAppAlert('व्यापार KYC अनिवार्य (*)', 'सप्लायर सत्यापन के लिए वैध GSTIN (15 अंक) अथवा PAN कार्ड नंबर दर्ज करें।');
          return;
        }
      }
    } else if (currentStep === 3) {
      if (partnerType === 'CONTRACTOR') {
        if (!selectedPrimaryModeId) {
          showAppAlert('दर तरीका अनिवार्य (*)', 'कृपया फॉर्म में सबसे पहले दिखने वाला अपना मुख्य दर तरीका चुनें।');
          return;
        }
        for (const field of activeTradeProfile.contractorFields) {
          const isMandatory =
            Boolean(field.alwaysMandatory) ||
            Boolean(field.mandatoryWhenModes && field.mandatoryWhenModes.includes(selectedPrimaryModeId));
          const rawVal = (tradeFieldValues[field.key] || '').trim();

          if (isMandatory && !rawVal) {
            showAppAlert(
              'अनिवार्य दर जानकारी (*)',
              `"${field.labelHi.replace(' *', '')}" भरना इस श्रेणी/मोड के लिए अनिवार्य है।`
            );
            return;
          }

          if (rawVal && field.isNumeric) {
            const num = Number(rawVal);
            if (!Number.isFinite(num) || num <= 0) {
              showAppAlert('अमान्य दर', `"${field.labelHi.replace(' *', '')}" केवल धनात्मक संख्या (> 0) होनी चाहिए।`);
              return;
            }
            if (field.min !== undefined && num < field.min) {
              showAppAlert('दर सीमा जाँच', `"${field.labelHi.replace(' *', '')}" कम से कम ${field.min} (${field.unitHi}) होनी चाहिए।`);
              return;
            }
            if (field.max !== undefined && num > field.max) {
              showAppAlert('दर सीमा जाँच', `"${field.labelHi.replace(' *', '')}" अधिकतम ${field.max} (${field.unitHi}) हो सकती है।`);
              return;
            }
          }
        }
      } else {
        const radiusNum = Number(deliveryRadiusKm);
        if (!Number.isFinite(radiusNum) || radiusNum <= 0) {
          showAppAlert('अनिवार्य जानकारी (*)', 'कृपया डिलीवरी दायरा (Km > 0) दर्ज करें।');
          return;
        }
      }
    } else if (currentStep === 4 && partnerType === 'CONTRACTOR') {
      // Work photo & title are optional during fast onboarding; validate URL if entered
      const candidateUrl = workPhotoUrl.trim();
      if (candidateUrl && !candidateUrl.startsWith('/uploads/') && !/^https:\/\//i.test(candidateUrl)) {
        showAppAlert('अमान्य फोटो लिंक', 'कृपया वैध HTTPS इमेज URL डालें अथवा ऊपर बटन से असली फोटो अपलोड करें।');
        return;
      }
    } else if (currentStep === totalSteps) {
      // Bank details & UPI are OPTIONAL now — only validate format if user partially entered them
      if (upiId.trim() && (!upiId.trim().includes('@') || upiId.trim().length < 5)) {
        showAppAlert('अमान्य UPI ID', 'यदि आप UPI जोड़ रहे हैं तो सही UPI ID (उदा. name@okaxis) दर्ज करें या खाली छोड़ दें।');
        return;
      }
      if (ifscCode.trim() && ifscCode.trim().length !== 11) {
        showAppAlert('अमान्य IFSC कोड', 'IFSC कोड ठीक 11 अक्षर/अंकों का होता है (या इसे अभी खाली छोड़ें)।');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const parsedDaily = parseSafeOptionalRate(dailyRate);
    const parsedHelper = parseSafeOptionalRate(helperRate);
    const parsedTheka = parseSafeOptionalRate(thekaRate);

    const activeMode =
      activeTradeProfile.rateModes.find((m) => m.id === selectedPrimaryModeId) ||
      activeTradeProfile.rateModes[0];
    const resolvedCategory = normalizeTradeCategory(selectedTrade);

    // Build structured additionalRateCards from all entered trade-specific fields
    const additionalRateCards: { title: string; rate: string }[] = [];
    for (const f of activeTradeProfile.contractorFields) {
      const val = (tradeFieldValues[f.key] || '').trim();
      if (!val || !f.cardTitleHi) continue;
      if (f.key === 'materialBillPercent') {
        additionalRateCards.push({ title: f.cardTitleHi, rate: `${val}% (बिल अनुसार)` });
      } else if (f.isNumeric && !f.unitHi.includes('₹')) {
        additionalRateCards.push({ title: f.cardTitleHi, rate: `${val} ${f.unitHi}` });
      } else if (f.isNumeric) {
        additionalRateCards.push({ title: f.cardTitleHi, rate: `₹${val} ${f.unitHi.replace('₹ ', '')}` });
      } else {
        additionalRateCards.push({ title: f.cardTitleHi, rate: val });
      }
    }

    const newPartner = {
      name: fullName.trim(),
      phone: cleanPhone,
      role: partnerType,
      category: partnerType === 'VENDOR' ? 'general' : resolvedCategory,
      tradeOrShop: partnerType === 'CONTRACTOR' ? selectedTrade : storeName.trim() || `${fullName.trim()} हार्डवेयर स्टोर`,
      city: city.trim() || 'भोपाल',
      locality: locality.trim() || 'एमपी नगर',
      primaryRateType: partnerType === 'CONTRACTOR' ? activeMode.primaryRateTypeLabel : 'थोक विक्रेता',
      primaryRateMode: selectedPrimaryModeId,
      dailyWageRate: parsedDaily === 'INVALID' ? null : parsedDaily,
      helperRate: parsedHelper === 'INVALID' ? null : parsedHelper,
      contractUnitRate: parsedTheka === 'INVALID' ? null : parsedTheka,
      unitLabel: (thekaUnitLabel || activeMode.unitHi).trim() || 'प्रति काम',
      additionalRateCards,
      tradeRateSpec: {
        primaryModeId: selectedPrimaryModeId,
        ...tradeFieldValues,
      },
      strictValidation: true,
      experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
      isTeamThekedar,
      teamSize: isTeamThekedar ? Math.max(1, parseInt(teamSize, 10) || 4) : 1,
      hasOwnTools,
      noCriminalRecord,
      deliveryRadiusKm: Math.max(1, parseInt(deliveryRadiusKm, 10) || 10),
      minFreeDeliveryAmount: Math.max(0, parseInt(minFreeDeliveryAmount, 10) || 0),
      accountHolderName: accountHolderName.trim(),
      bankAccount: bankAccountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId.trim(),
      aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
      panNumber: panNumber.trim().toUpperCase(),
      gstNumber: gstNumber.trim().toUpperCase(),
      aadhaarDocRef: aadhaarPhotoUrl,
      avatarUrl: avatarUrl.trim(),
      workPhotoUrl: workPhotoUrl.trim(),
      workPhotoTitle: workPhotoTitle.trim(),
      kycStatus: 'PENDING_APPROVAL',
      verified: false,
      rating: 0,
      reviewsCount: 0,
      registeredAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      const ok = await onRegistrationComplete(newPartner);
      if (ok === false) return;
      onClose();
      showAppAlert(
        '🎉 आवेदन सफलतापूर्वक सबमिट हुआ!',
        `बधाई हो ${fullName}! आपका पार्टनर पंजीकरण आवेदन सबमिट हो गया है और आप अपने डैशबोर्ड में प्रवेश कर रहे हैं।`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({
    maxWidth: 720,
    fixedHeight: true,
    mobileHeight: '92%',
    desktopHeight: '90%',
  });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.headerTitle}>
                {partnerType === 'CONTRACTOR'
                  ? 'कारीगर / ठेकेदार ऑनबोर्डिंग'
                  : 'सप्लायर (दुकानदार) रजिस्ट्रेशन'}
              </Text>
              <Text style={styles.headerSub}>
                चरण {currentStep} / {totalSteps} • आधिकारिक पार्टनर अनुबंध {_isEn ? '(Partner)' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Partner Role Toggle (Contractor vs Vendor) */}
          <View style={styles.typeToggleRow}>
            <TouchableOpacity
              style={[styles.typeBtn, partnerType === 'CONTRACTOR' && styles.typeBtnActive]}
              onPress={() => {
                setPartnerType('CONTRACTOR');
                setCurrentStep(1);
              }}
            >
              <FontAwesome5
                name="hammer"
                size={13}
                color={partnerType === 'CONTRACTOR' ? '#FFFFFF' : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  partnerType === 'CONTRACTOR' && styles.typeBtnTextActive,
                ]}
              >
                1. कुशल कारीगर / ठेकेदार
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, partnerType === 'VENDOR' && styles.typeBtnActive]}
              onPress={() => {
                setPartnerType('VENDOR');
                setCurrentStep(1);
              }}
            >
              <MaterialIcons
                name="storefront"
                size={15}
                color={partnerType === 'VENDOR' ? '#FFFFFF' : COLORS.textSecondary}
              />
              <Text
                style={[styles.typeBtnText, partnerType === 'VENDOR' && styles.typeBtnTextActive]}
              >
                2. मटेरियल सप्लायर (दुकानदार)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${(currentStep / totalSteps) * 100}%` },
              ]}
            />
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* ================= STEP 1: BASIC INFO & TRADE ================= */}
            {currentStep === 1 && (
              <View>
                <Text style={styles.stepHeader}>चरण 1: बुनियादी जानकारी & कार्य श्रेणी</Text>
                <Text style={styles.stepHint}>
                  ग्राहक आपको इसी नाम और श्रेणी के आधार पर खोजेंगे।
                </Text>

                <Text style={styles.label}>
                  आपका पूरा नाम (आधार के अनुसार)<Text style={styles.reqStar}> *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="उदा. रमेश कुमार शर्मा"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.label}>
                  मोबाइल नंबर (WhatsApp/OTP)<Text style={styles.reqStar}> *</Text>
                </Text>
                <View style={styles.phoneBox}>
                  <Text style={styles.prefix}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Profile Photo / Selfie Upload */}
                <Text style={styles.label}>आपकी असली प्रोफाइल फोटो / सेल्फी (ऐच्छिक):</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#EEF2FF',
                      borderWidth: 1,
                      borderColor: '#C7D2FE',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => handlePickImage('avatar')}
                    disabled={isUploading}
                  >
                    <Ionicons name="person-circle-outline" size={18} color="#4F46E5" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#4F46E5' }}>
                      {avatarUrl ? '✓ प्रोफाइल फोटो बदलें' : '📷 प्रोफाइल फोटो चुनें / खींचें'}
                    </Text>
                  </TouchableOpacity>

                  {isUploading ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#10B981' }}
                    />
                  ) : (
                    <Text style={{ fontSize: 11, color: '#64748B' }}>चेहरे की साफ फोटो से 3x बुकिंग्स</Text>
                  )}
                </View>

                {partnerType === 'CONTRACTOR' ? (
                  <>
                    <Text style={styles.label}>
                      आपकी मुख्य कारीगरी (सभी 15+ श्रेणियाँ)<Text style={styles.reqStar}> *</Text>
                    </Text>
                    <View style={styles.tradeGrid}>
                      {ORDERED_15_TRADES.map((tr) => {
                        const trade = tr.registrationLabelHi;
                        return (
                          <TouchableOpacity
                            key={tr.id}
                            style={[
                              styles.tradePill,
                              selectedTrade === trade && styles.tradePillActive,
                            ]}
                            onPress={() => handleSelectTradeOption(trade)}
                          >
                            <Text
                              style={[
                                styles.tradePillText,
                                selectedTrade === trade && styles.tradePillTextActive,
                              ]}
                            >
                              {trade}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>
                      दुकान का पूरा नाम (Shop/Firm Name)<Text style={styles.reqStar}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="उदा. गुप्ता हार्डवेयर & बिल्डिंग मैटेरियल"
                      value={storeName}
                      onChangeText={setStoreName}
                    />
                  </>
                )}

                {/* Live GPS Quick Autofill */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#EFF6FF',
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    marginTop: 10,
                  }}
                  onPress={handleDetectPartnerGps}
                  disabled={isDetectingGps}
                >
                  {isDetectingGps ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialIcons name="my-location" size={16} color={COLORS.primary} />
                  )}
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: COLORS.primary }}>
                    {isDetectingGps
                      ? 'लाइव GPS लोकेशन खोजी जा रही है...'
                      : '📍 लाइव GPS से मेरा शहर व इलाका स्वतः भरें'}
                  </Text>
                </TouchableOpacity>

                {/* Live GPS Quick Autofill */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#EFF6FF',
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    marginTop: 10,
                  }}
                  onPress={handleDetectPartnerGps}
                  disabled={isDetectingGps}
                >
                  {isDetectingGps ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialIcons name="my-location" size={16} color={COLORS.primary} />
                  )}
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: COLORS.primary }}>
                    {isDetectingGps
                      ? 'लाइव GPS लोकेशन खोजी जा रही है...'
                      : '📍 लाइव GPS से मेरा शहर व इलाका स्वतः भरें'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>
                      शहर (City)<Text style={styles.reqStar}> *</Text>
                    </Text>
                    <TextInput style={styles.input} value={city} onChangeText={setCity} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.label}>
                      कार्य क्षेत्र / इलाका<Text style={styles.reqStar}> *</Text>
                    </Text>
                    <TextInput style={styles.input} value={locality} onChangeText={setLocality} />
                  </View>
                </View>
              </View>
            )}

            {/* ================= STEP 2: IDENTITY & KYC ================= */}
            {currentStep === 2 && (
              <View>
                <Text style={styles.stepHeader}>चरण 2: सरकारी पहचान & सुरक्षा सत्यापन (KYC)</Text>
                <Text style={styles.stepHint}>
                  सुरक्षित भुगतानों और ग्राहकों के भरोसे के लिए लाल * वाले फील्ड अनिवार्य हैं।
                </Text>

                {partnerType === 'CONTRACTOR' ? (
                  <>
                    <Text style={styles.label}>
                      12 अंकों का आधार नंबर (Aadhaar Number)<Text style={styles.reqStar}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="XXXX-XXXX-XXXX"
                      keyboardType="numeric"
                      maxLength={14}
                      value={aadhaarNumber}
                      onChangeText={setAadhaarNumber}
                    />

                    {/* Real Aadhaar Document Photo Upload */}
                    <Text style={styles.label}>📷 असली आधार कार्ड फोटो (Front / Back):</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: '#EEF2FF',
                          borderWidth: 1,
                          borderColor: '#C7D2FE',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                        onPress={() => handlePickImage('aadhaar')}
                      >
                        <Ionicons name="camera" size={16} color="#4F46E5" />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#4F46E5' }}>
                          {aadhaarPhotoUrl ? '✓ आधार फोटो बदलें' : 'आधार फोटो चुनें'}
                        </Text>
                      </TouchableOpacity>

                      {isUploading ? (
                        <ActivityIndicator size="small" color="#4F46E5" />
                      ) : aadhaarPhotoUrl ? (
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }} numberOfLines={1}>
                          🔒 आधार अपलोड हुआ: {aadhaarPhotoUrl}
                        </Text>
                      ) : (
                        <Text style={{ fontSize: 11, color: '#64748B', fontStyle: 'italic' }}>
                          फोटो जरूरी है (ब्लू टिक हेतु)
                        </Text>
                      )}
                    </View>

                    <Text style={styles.label}>पैन कार्ड नंबर (PAN - टैक्स & TDS हेतु):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ABCDE1234F (Optional)"
                      autoCapitalize="characters"
                      value={panNumber}
                      onChangeText={setPanNumber}
                    />

                    {/* Police Clear Declaration */}
                    <View style={styles.declarationBox}>
                      <Switch
                        value={noCriminalRecord}
                        onValueChange={setNoCriminalRecord}
                        trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                        thumbColor={noCriminalRecord ? COLORS.accent : '#94A3B8'}
                      />
                      <Text style={styles.declarationText}>
                        मैं प्रमाणित करता हूँ कि मेरे विरुद्ध कोई आपराधिक मामला लंबित नहीं है और मेरा
                        व्यवहार स्वच्छ है। (Self Declaration)<Text style={styles.reqStar}> * अनिवार्य</Text>
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>
                      GSTIN नंबर (15 अंक) अथवा नीचे PAN दर्ज करें<Text style={styles.reqStar}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="09AAACG1234F1Z5 (यदि कम्पोजिट है तो पैन दें)"
                      autoCapitalize="characters"
                      value={gstNumber}
                      onChangeText={setGstNumber}
                    />

                    <Text style={styles.label}>दुकानदार / प्रोपराइटर का पैन कार्ड:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ABCDE1234F"
                      autoCapitalize="characters"
                      value={panNumber}
                      onChangeText={setPanNumber}
                    />
                  </>
                )}

                <View style={styles.kycSecurityBadge}>
                  <Ionicons name="shield-checkmark" size={18} color="#059669" />
                  <Text style={styles.kycSecurityText}>
                    आपका डेटा सुरक्षित है। SETU एडमिन सत्यापन के बाद आपको &apos;वेरीफाइड प्रो&apos; ब्लू टिक मिलेगा।
                  </Text>
                </View>
              </View>
            )}

            {/* ================= STEP 3: RATE CARD & EXPERIENCE ================= */}
            {currentStep === 3 && (
              <View>
                {partnerType === 'CONTRACTOR' ? (
                  <>
                    <Text style={styles.stepHeader}>चरण 3: ट्रेड रेट-कार्ड, अनुभव & टूल्स</Text>
                    <Text style={styles.stepHint}>
                      SETU पर आप अपनी दरें और कार्य का दायरा पूरी पारदर्शिता से खुद तय करते हैं।
                    </Text>

                    <Text style={styles.label}>काम का कुल अनुभव (Years):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="उदा. 8 वर्ष"
                      keyboardType="numeric"
                      value={experienceYears}
                      onChangeText={setExperienceYears}
                    />

                    {/* Solo vs Team */}
                    <View style={styles.toggleCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>क्या आपके पास अपनी लेबर टीम है? (ठेकेदार)</Text>
                        <Text style={styles.toggleSub}>
                          {isTeamThekedar
                            ? 'हाँ, मैं टीम के साथ बड़े प्रोजेक्ट्स का ठेका लेता हूँ'
                            : 'नहीं, मैं मुख्य रूप से अकेले काम करता हूँ'}
                        </Text>
                      </View>
                      <Switch
                        value={isTeamThekedar}
                        onValueChange={setIsTeamThekedar}
                        trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                        thumbColor={isTeamThekedar ? COLORS.primary : '#94A3B8'}
                      />
                    </View>

                    {isTeamThekedar && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.label}>आपकी टीम में कितने कारीगर/लेबर हैं?</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="उदा. 4-6 लोग"
                          keyboardType="numeric"
                          value={teamSize}
                          onChangeText={setTeamSize}
                        />
                      </View>
                    )}

                    {/* Rates Inputs: Dynamic Trade-First Schema */}
                    <View style={styles.rateCardInputBox}>
                      <Text style={styles.rateBoxTitle}>
                        💰 {activeTradeProfile.nameHindi} — डिजिटल रेट-कार्ड (* अनिवार्य):
                      </Text>

                      {/* Research-backed Fair Benchmark Tip */}
                      <View style={styles.researchTipBanner}>
                        <Ionicons name="bulb-outline" size={14} color="#92400E" />
                        <Text style={styles.researchTipText}>
                          {activeTradeProfile.researchSummaryHi}
                        </Text>
                      </View>

                      {/* 1. First-visible Priority Rate Mode Selector */}
                      <Text style={styles.rateFieldLabel}>
                        ग्राहक फॉर्म में सबसे पहले दिखने वाला आपका मुख्य दर विकल्प चुनें
                        <Text style={styles.reqStar}> *</Text>
                      </Text>
                      <View style={styles.modeChipsWrap}>
                        {activeTradeProfile.rateModes.map((mode) => {
                          const isSelected = selectedPrimaryModeId === mode.id;
                          return (
                            <TouchableOpacity
                              key={mode.id}
                              style={[styles.modeChip, isSelected && styles.modeChipActive]}
                              onPress={() => {
                                setSelectedPrimaryModeId(mode.id);
                                setThekaUnitLabel(mode.unitHi);
                              }}
                            >
                              <Text
                                style={[
                                  styles.modeChipText,
                                  isSelected && styles.modeChipTextActive,
                                ]}
                              >
                                {mode.labelHi}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {(() => {
                        const selMode =
                          activeTradeProfile.rateModes.find((m) => m.id === selectedPrimaryModeId) ||
                          activeTradeProfile.rateModes[0];
                        return (
                          <View style={styles.modeFairHintBox}>
                            <Text style={styles.modeFairRangeText}>
                              📊 बाजार मानक ({selMode.labelHi}): {selMode.fairRangeHi}
                            </Text>
                            <Text style={styles.modeResearchSub}>{selMode.researchNoteHi}</Text>
                          </View>
                        );
                      })()}

                      {/* Dynamic Trade-Specific Rate Entries */}
                      {activeTradeProfile.contractorFields.map((field) => {
                        const isMandatory =
                          Boolean(field.alwaysMandatory) ||
                          Boolean(
                            field.mandatoryWhenModes &&
                              field.mandatoryWhenModes.includes(selectedPrimaryModeId)
                          );
                        const val = tradeFieldValues[field.key] || '';
                        return (
                          <View key={field.key} style={styles.dynamicRateFieldWrap}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text style={styles.rateFieldLabel}>
                                {field.labelHi.replace(' *', '')}
                                {isMandatory && <Text style={styles.reqStar}> * अनिवार्य</Text>}
                              </Text>
                              <Text style={styles.rateUnitPill}>{field.unitHi}</Text>
                            </View>
                            <Text style={styles.rateFieldSub}>{field.subLabelHi}</Text>
                            <TextInput
                              style={[
                                styles.rateInput,
                                isMandatory && !val.trim() && styles.rateInputMandatoryHighlight,
                              ]}
                              placeholder={field.placeholder}
                              keyboardType={field.isNumeric ? 'numeric' : 'default'}
                              value={val}
                              onChangeText={(txt) =>
                                handleTradeFieldChange(field.key, txt, field.mapsToColumn)
                              }
                            />
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.stepHeader}>चरण 3: दुकान की डिलीवरी दायरा & शर्तें</Text>
                    <Text style={styles.stepHint}>
                      तय करें कि आप कितने किलोमीटर तक निर्माण सामग्री डिलीवर करेंगे।
                    </Text>

                    <Text style={styles.label}>अधिकतम डिलीवरी दायरा (Kilometers):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="उदा. 10 km"
                      keyboardType="numeric"
                      value={deliveryRadiusKm}
                      onChangeText={setDeliveryRadiusKm}
                    />

                    <Text style={styles.label}>फ्री डिलीवरी की न्यूनतम आर्डर सीमा (₹):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="उदा. 3000"
                      keyboardType="numeric"
                      value={minFreeDeliveryAmount}
                      onChangeText={setMinFreeDeliveryAmount}
                    />
                  </>
                )}
              </View>
            )}

            {/* ================= STEP 4: WORK PHOTOS (Contractor) OR BANK (Vendor) ================= */}
            {currentStep === 4 && partnerType === 'CONTRACTOR' && (
              <View>
                <Text style={styles.stepHeader}>चरण 4: पिछले काम की तस्वीरें (ऐच्छिक / Portfolio)</Text>
                <Text style={styles.stepHint}>
                  अपने बेहतरीन कार्यों की वास्तविक तस्वीरें जोड़ने पर ग्राहकों का भरोसा कई गुना बढ़ जाता है।
                </Text>

                <Text style={styles.label}>
                  हाल ही में किए गए प्रोजेक्ट का नाम (वैकल्पिक):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="उदा. लक्ज़री 10x8 मॉड्यूलर किचन - सिविल लाइन्स"
                  value={workPhotoTitle}
                  onChangeText={setWorkPhotoTitle}
                />

                <Text style={styles.label}>फोटो इमेज लिंक (URL अथवा असली फोटो अपलोड):</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#EEF2FF',
                      borderWidth: 1,
                      borderColor: '#C7D2FE',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => handlePickImage('work')}
                  >
                    <Ionicons name="camera" size={16} color="#4F46E5" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#4F46E5' }}>
                      {workPhotoUrl ? '✓ काम की फोटो बदलें' : '📷 काम की असली फोटो अपलोड करें'}
                    </Text>
                  </TouchableOpacity>

                  {workPhotoUrl ? (
                    <Image
                      source={{ uri: workPhotoUrl }}
                      style={{ width: 44, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#10B981' }}
                    />
                  ) : null}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="https://... (या ऊपर बटन से असली फोटो चुनें)"
                  value={workPhotoUrl}
                  onChangeText={setWorkPhotoUrl}
                />

                <View style={styles.photoTipCard}>
                  <Ionicons name="camera" size={24} color="#4338CA" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.photoTipTitle}>प्रो टिप: साफ और अच्छी लाइटिंग में फोटो लें</Text>
                    <Text style={styles.photoTipSub}>
                      फिनिशिंग की तस्वीरें देखकर ग्राहकों का भरोसा 3 गुना बढ़ जाता है।
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ================= STEP 4 (Vendor) OR STEP 5 (Contractor): BANK SETTLEMENT ================= */}
            {((currentStep === 4 && partnerType === 'VENDOR') ||
              (currentStep === 5 && partnerType === 'CONTRACTOR')) && (
              <View>
                <Text style={styles.stepHeader}>
                  {partnerType === 'CONTRACTOR' ? 'चरण 5' : 'चरण 4'}: बैंक खाता & UPI (वैकल्पिक — बाद में भी जोड़ सकते हैं)
                </Text>
                <Text style={styles.stepHint}>
                  यह विवरण अभी वैकल्पिक है। आप इसे खाली छोड़कर भी सबमिट कर सकते हैं और बाद में अपनी प्रोफाइल से जोड़/एडिट कर सकते हैं।
                </Text>

                <Text style={styles.label}>खाताधारक का नाम (वैकल्पिक):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="खाताधारक का पूरा नाम"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                />

                <Text style={styles.label}>बैंक खाता संख्या (वैकल्पिक):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="11-16 अंकों का खाता संख्या"
                  keyboardType="numeric"
                  value={bankAccountNumber}
                  onChangeText={setBankAccountNumber}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>IFSC कोड (वैकल्पिक):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="SBIN0001234"
                      autoCapitalize="characters"
                      value={ifscCode}
                      onChangeText={setIfscCode}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.label}>UPI ID (वैकल्पिक):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="name@okaxis"
                      value={upiId}
                      onChangeText={setUpiId}
                    />
                  </View>
                </View>

                <View style={styles.escrowPayoutNote}>
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                  <Text style={styles.escrowPayoutText}>
                    SETU भुगतान गारंटी: काम पूरा होते ही ग्राहक के सत्यापन के बाद तुरंत ट्रांसफर!
                  </Text>
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Bottom Navigation Buttons */}
          <View style={styles.bottomBar}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.prevBtn}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.prevBtnText}>← पिछला</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.nextBtnText}>
                  {currentStep === totalSteps ? 'आवेदन सबमिट करें ✓' : 'अगला चरण ➔'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  typeToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#E2E8F0',
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.secondary,
  },
  body: {
    padding: 16,
    flex: 1,
  },
  stepHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  prefix: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  tradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tradePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tradePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tradePillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tradePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  declarationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
    gap: 10,
  },
  declarationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  kycSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 14,
    gap: 8,
  },
  kycSecurityText: {
    fontSize: 11,
    color: '#15803D',
    flex: 1,
    lineHeight: 15,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  rateCardInputBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 14,
  },
  rateBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  rateRow: {
    flexDirection: 'row',
  },
  rateFieldLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 38,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  thekaRow: {
    flexDirection: 'row',
  },
  photoTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginTop: 14,
  },
  photoTipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4338CA',
  },
  photoTipSub: {
    fontSize: 10,
    color: '#4338CA',
    marginTop: 2,
  },
  escrowPayoutNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 14,
    gap: 8,
  },
  escrowPayoutText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  prevBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  prevBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  reqStar: {
    color: '#DC2626',
    fontWeight: '900',
  },
  researchTipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  researchTipText: {
    flex: 1,
    fontSize: 10.5,
    color: '#78350F',
    lineHeight: 15,
    fontWeight: '600',
  },
  modeChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  modeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  modeChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  modeChipTextActive: {
    color: '#FFFFFF',
  },
  modeFairHintBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
    marginBottom: 10,
  },
  modeFairRangeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  modeResearchSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  dynamicRateFieldWrap: {
    marginTop: 10,
  },
  rateUnitPill: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rateFieldSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginBottom: 4,
  },
  rateInputMandatoryHighlight: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFBFB',
  },
});
