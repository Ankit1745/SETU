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
  const [selectedTrade, setSelectedTrade] = useState('बढ़ई (Carpenter)');
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('भोपाल');
  const [locality, setLocality] = useState('एमपी नगर');

  // STEP 2: Identity & KYC Verification (Urban Company / Amazon style)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [noCriminalRecord, setNoCriminalRecord] = useState(true);
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // STEP 3: Experience, Tools & Rate Card (Contractor) / Delivery Radius (Vendor)
  const [experienceYears, setExperienceYears] = useState('0');
  const [isTeamThekedar, setIsTeamThekedar] = useState(false);
  const [teamSize, setTeamSize] = useState('1');
  const [hasOwnTools] = useState(true);
  const [dailyRate, setDailyRate] = useState('');
  const [helperRate, setHelperRate] = useState('');
  const [thekaRate, setThekaRate] = useState('');
  const [thekaUnitLabel, setThekaUnitLabel] = useState('प्रति यूनिट / काम');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('10');
  const [minFreeDeliveryAmount, setMinFreeDeliveryAmount] = useState('3000');

  // STEP 4: Bank Account & UPI Setup for Instant Escrow Payouts
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // STEP 5: Portfolio Photos
  const [workPhotoTitle, setWorkPhotoTitle] = useState('');
  const [workPhotoUrl, setWorkPhotoUrl] = useState('');

  const handlePickImage = async (type: 'aadhaar' | 'work') => {
    setIsUploading(true);
    try {
      const picked = await pickImageFromGallery();
      if (!picked || !picked.base64) {
        setIsUploading(false);
        return;
      }

      const isKyc = type === 'aadhaar';
      const uploadRes = await ApiService.uploadFile(
        picked.base64,
        picked.name || (isKyc ? 'kyc_document.jpg' : 'work_photo.jpg'),
        isKyc ? 'kyc' : 'portfolio',
        isKyc
      );

      setIsUploading(false);
      if (uploadRes && uploadRes.success) {
        const fileRef = isKyc ? (uploadRes.privateRef || uploadRes.filename) : (uploadRes.fullUrl || uploadRes.url);
        if (isKyc) {
          setAadhaarPhotoUrl(fileRef);
          showAppAlert('✅ केवाईसी दस्तावेज सुरक्षित', 'आपका पहचान पत्र सुरक्षित प्राइवेट स्टोरेज में अपलोड हो गया है। केवल अधिकृत एडमिन सत्यापन हेतु देख सकते हैं।');
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
      if (!fullName.trim() || cleanPhone.length < 10) {
        showAppAlert('अधूरी जानकारी', 'कृपया पूरा नाम और 10 अंकों का वैध मोबाइल नंबर अवश्य भरें।');
        return;
      }
    } else if (currentStep === 2) {
      if (partnerType === 'CONTRACTOR') {
        const aadhaarDigits = aadhaarNumber.replace(/\D/g, '');
        if (aadhaarDigits.length !== 12) {
          showAppAlert('KYC आवश्यक', 'सुरक्षा सत्यापन हेतु सही 12 अंकों का आधार नंबर दर्ज करें।');
          return;
        }
      }
    } else if (currentStep === 3 && partnerType === 'CONTRACTOR') {
      // SETU Rule: Blank rates stay null ("भाव पूछें"), only reject negative/invalid values!
      if (
        parseSafeOptionalRate(dailyRate) === 'INVALID' ||
        parseSafeOptionalRate(helperRate) === 'INVALID' ||
        parseSafeOptionalRate(thekaRate) === 'INVALID'
      ) {
        showAppAlert('अमान्य दर', 'दर केवल धनात्मक संख्या (> 0) होनी चाहिए या "भाव पूछें" हेतु खाली छोड़ें।');
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

    const helperCategory = (trade: string) => {
      const t = trade.toLowerCase();
      if (t.includes('carpenter') || t.includes('बढ़ई')) return 'carpenter';
      if (t.includes('टाइल्स') || t.includes('tile')) return 'tiling';
      if (t.includes('mason') || t.includes('मिस्त्री')) return 'mason';
      if (t.includes('plumber') || t.includes('प्लंबर')) return 'plumber';
      if (t.includes('ac') || t.includes('एसी')) return 'ac_repair';
      if (t.includes('electrician') || t.includes('इलेक्ट्रीशियन')) return 'electrician';
      if (t.includes('painter') || t.includes('पेंटर')) return 'painter';
      if (t.includes('टेंट') || t.includes('डेकोर')) return 'wedding_tent';
      if (t.includes('कैटरर') || t.includes('हलवाई')) return 'caterer';
      if (t.includes('मेकअप')) return 'wedding_makeup';
      if (t.includes('dj') || t.includes('डीजे')) return 'event_dj';
      if (t.includes('फोटो') || t.includes('कैमरा')) return 'wedding_photo';
      return 'general';
    };

    const newPartner = {
      name: fullName.trim(),
      phone: cleanPhone,
      role: partnerType,
      category: partnerType === 'VENDOR' ? 'general' : helperCategory(selectedTrade),
      tradeOrShop: partnerType === 'CONTRACTOR' ? selectedTrade : storeName.trim() || `${fullName.trim()} हार्डवेयर स्टोर`,
      city: city.trim() || 'भोपाल',
      locality: locality.trim() || 'एमपी नगर',
      dailyWageRate: parsedDaily === 'INVALID' ? null : parsedDaily,
      helperRate: parsedHelper === 'INVALID' ? null : parsedHelper,
      contractUnitRate: parsedTheka === 'INVALID' ? null : parsedTheka,
      unitLabel: thekaUnitLabel.trim() || 'प्रति काम',
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

                <Text style={styles.label}>आपका पूरा नाम (आधार के अनुसार):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="उदा. रमेश कुमार शर्मा"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.label}>मोबाइल नंबर (WhatsApp/OTP):</Text>
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

                {partnerType === 'CONTRACTOR' ? (
                  <>
                    <Text style={styles.label}>आपकी मुख्य कारीगरी (Primary Trade):</Text>
                    <View style={styles.tradeGrid}>
                      {[
                        'बढ़ई (Carpenter)',
                        'राजमिस्त्री (Mason)',
                        'पेंटर (Painter)',
                        'इलेक्ट्रीशियन',
                        'प्लंबर (Plumber)',
                        'AC रिपेयर & सर्विस',
                        'टाइल्स & मार्बल',
                        'वेडिंग टेंट & डेकोर',
                        'हलवाई & कैटरिंग',
                        'वेडिंग फोटोग्राफर',
                      ].map((trade) => (
                        <TouchableOpacity
                          key={trade}
                          style={[
                            styles.tradePill,
                            selectedTrade === trade && styles.tradePillActive,
                          ]}
                          onPress={() => setSelectedTrade(trade)}
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
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>दुकान का पूरा नाम (Shop/Firm Name):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="उदा. गुप्ता हार्डवेयर & बिल्डिंग मैटेरियल"
                      value={storeName}
                      onChangeText={setStoreName}
                    />
                  </>
                )}

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>शहर (City):</Text>
                    <TextInput style={styles.input} value={city} onChangeText={setCity} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.label}>कार्य क्षेत्र / इलाका:</Text>
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
                  सुरक्षित भुगतानों और ग्राहकों के भरोसे के लिए KYC अनिवार्य है।
                </Text>

                {partnerType === 'CONTRACTOR' ? (
                  <>
                    <Text style={styles.label}>12 अंकों का आधार नंबर (Aadhaar Number):</Text>
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
                        व्यवहार स्वच्छ है। (Self Declaration)
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>GSTIN नंबर (GST Number):</Text>
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
                      Urban Company की तरह आप अपनी दरें और काम का दायरा खुद तय करते हैं।
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

                    {/* Rates Inputs */}
                    <View style={styles.rateCardInputBox}>
                      <Text style={styles.rateBoxTitle}>💰 आपका डिजिटल रेट-कार्ड:</Text>

                      <View style={styles.rateRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rateFieldLabel}>1 दिन की दिहाड़ी (8 घंटे):</Text>
                          <TextInput
                            style={styles.rateInput}
                            placeholder="₹ 950"
                            keyboardType="numeric"
                            value={dailyRate}
                            onChangeText={setDailyRate}
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.rateFieldLabel}>हेल्पर मजदूरी (/दिन):</Text>
                          <TextInput
                            style={styles.rateInput}
                            placeholder="₹ 550"
                            keyboardType="numeric"
                            value={helperRate}
                            onChangeText={setHelperRate}
                          />
                        </View>
                      </View>

                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.rateFieldLabel}>मुख्य ठेका दर (Unit Rate):</Text>
                        <View style={styles.thekaRow}>
                          <TextInput
                            style={[styles.rateInput, { width: 100 }]}
                            placeholder="₹ 350"
                            keyboardType="numeric"
                            value={thekaRate}
                            onChangeText={setThekaRate}
                          />
                          <TextInput
                            style={[styles.rateInput, { flex: 1, marginLeft: 8 }]}
                            placeholder="यूनिट उदा. प्रति sq.ft या शीट"
                            value={thekaUnitLabel}
                            onChangeText={setThekaUnitLabel}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.stepHeader}>चरण 3: दुकान की डिलीवरी दायरा & शर्तें</Text>
                    <Text style={styles.stepHint}>
                      Flipkart Seller की तरह आप तय करें कि आप कितनी दूरी तक माल डिलीवर करेंगे।
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
                <Text style={styles.stepHeader}>चरण 4: पिछले काम की तस्वीरें (Portfolio)</Text>
                <Text style={styles.stepHint}>
                  Upwork / Urban Company की तरह ग्राहक आपके काम की तस्वीरें देखकर ही बड़ा ठेका देंगे।
                </Text>

                <Text style={styles.label}>हाल ही में किए गए प्रोजेक्ट का नाम:</Text>
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
                  {partnerType === 'CONTRACTOR' ? 'चरण 5' : 'चरण 4'}: बैंक खाता & डायरेक्ट UPI भुगतान
                </Text>
                <Text style={styles.stepHint}>
                  काम पूरा होते ही एस्क्रो से पैसा सीधे इस बैंक खाते या UPI पर ट्रांसफर होगा।
                </Text>

                <Text style={styles.label}>खाताधारक का नाम (Account Holder Name):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="उदा. रमेश कुमार शर्मा"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                />

                <Text style={styles.label}>बैंक खाता संख्या (Bank Account Number):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="11-16 अंकों का खाता संख्या"
                  keyboardType="numeric"
                  value={bankAccountNumber}
                  onChangeText={setBankAccountNumber}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>IFSC कोड:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="SBIN0001234"
                      autoCapitalize="characters"
                      value={ifscCode}
                      onChangeText={setIfscCode}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.label}>UPI ID (GPay / PhonePe):</Text>
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
});
