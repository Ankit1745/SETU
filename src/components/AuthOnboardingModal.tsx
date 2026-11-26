import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { ApiService } from '../services/api';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface AuthOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onUserRegistered: (user: any) => void;
}

type OnboardingRole = 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR';

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  visible,
  onClose,
  onUserRegistered,
}) => {
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'ROLE_SELECT' | 'DETAILS' | 'SUCCESS'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>('CUSTOMER');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Profile Details
  const [fullName, setFullName] = useState('');
  const [tradeOrShop, setTradeOrShop] = useState('');
  const [aadhaarOrGst, setAadhaarOrGst] = useState('');
  const [generatedSetuId, setGeneratedSetuId] = useState('');

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      showAppAlert('अमान्य फोन नंबर', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    setIsBusy(true);
    const res = await ApiService.sendOtp(cleanPhone);
    setIsBusy(false);
    if (!res || !res.success) {
      showAppAlert('OTP विफल', res?.error || 'OTP भेजने में समस्या आई।');
      return;
    }
    setVerificationToken(res.verificationToken || null);
    if (res.demoOtp) {
      setOtp(res.demoOtp);
    }
    setStep('OTP');
    showAppAlert('OTP भेजा गया', res.message || `आपके मोबाइल नंबर +91 ${cleanPhone} पर 4 अंकों का OTP भेजा गया है।`);
  };

  const handleVerifyOtp = () => {
    const cleanOtp = otp.trim();
    if (!/^\d{4}$/.test(cleanOtp)) {
      showAppAlert('OTP आवश्यक', 'कृपया 4 अंकों का सही OTP दर्ज करें।');
      return;
    }
    setStep('ROLE_SELECT');
  };

  const handleFinishDetails = async () => {
    if (!fullName.trim()) {
      showAppAlert('अधूरी जानकारी', 'कृपया अपना पूरा नाम अवश्य भरें।');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    setIsBusy(true);
    const res = await ApiService.verifyOtp({
      phone: cleanPhone,
      otp: otp.trim(),
      verificationToken,
      fullName: fullName.trim(),
      role: selectedRole,
      tradeOrShop: tradeOrShop.trim(),
    });
    setIsBusy(false);

    if (!res || !res.success || !res.user) {
      showAppAlert('सत्यापन विफल', res?.error || 'गलत या समाप्त OTP कोड। कृपया पुनः OTP मंगाएं।');
      return;
    }
    if (res.token) {
      ApiService.setAuthToken(res.token);
    }
    setGeneratedSetuId(res.user.setuId);
    setRegisteredUser(res.user);
    setStep('SUCCESS');
    onUserRegistered(res.user);
  };

  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({ maxWidth: 560 });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>सेतु</Text>
              </View>
              <Text style={styles.headerTitle}>SETU डिजिटल पहचान पंजीकरण</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* STEP 1: PHONE NUMBER */}
            {step === 'PHONE' && (
              <View>
                <Text style={styles.stepTitle}>अपना मोबाइल नंबर दर्ज करें</Text>
                <Text style={styles.stepSub}>
                  सुरक्षित लॉगिन और आपकी डिजिटल SETU ID बनाने के लिए OTP भेजा जाएगा।
                </Text>

                <View style={styles.phoneInputRow}>
                  <Text style={styles.countryCode}>🇮🇳 +91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} activeOpacity={0.8} disabled={isBusy}>
                  {isBusy ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.primaryBtnText}>OTP प्राप्त करें ➔</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 'OTP' && (
              <View>
                <Text style={styles.stepTitle}>OTP सत्यापन (Verification)</Text>
                <Text style={styles.stepSub}>
                  +91 {phone} पर भेजा गया 4 अंकों का OTP कोड दर्ज करें:
                </Text>

                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • •"
                  keyboardType="numeric"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} activeOpacity={0.8}>
                  <Text style={styles.primaryBtnText}>सत्यापित करें & आगे बढ़ें ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: ROLE SELECTION */}
            {step === 'ROLE_SELECT' && (
              <View>
                <Text style={styles.stepTitle}>आप SETU पर किस रूप में जुड़ना चाहते हैं?</Text>
                <Text style={styles.stepSub}>अपनी सही भूमिका चुनें ताकि आपको सही डैशबोर्ड मिले:</Text>

                <View style={styles.rolesList}>
                  {/* Option 1: Customer */}
                  <TouchableOpacity
                    style={[styles.roleOptionCard, selectedRole === 'CUSTOMER' && styles.roleOptionActive]}
                    onPress={() => setSelectedRole('CUSTOMER')}
                  >
                    <Ionicons name="person" size={24} color={selectedRole === 'CUSTOMER' ? COLORS.primary : COLORS.textSecondary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.roleTitle}>1. ग्राहक (Customer)</Text>
                      <Text style={styles.roleDesc}>मुझे घर/इवेंट के लिए कुशल कारीगर और सामान चाहिए।</Text>
                    </View>
                    {selectedRole === 'CUSTOMER' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>

                  {/* Option 2: Contractor/Worker */}
                  <TouchableOpacity
                    style={[styles.roleOptionCard, selectedRole === 'CONTRACTOR' && styles.roleOptionActive]}
                    onPress={() => setSelectedRole('CONTRACTOR')}
                  >
                    <FontAwesome5 name="hammer" size={22} color={selectedRole === 'CONTRACTOR' ? COLORS.primary : COLORS.textSecondary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.roleTitle}>2. कारीगर / ठेकेदार (Contractor)</Text>
                      <Text style={styles.roleDesc}>मैं काम करता हूँ (मिस्त्री, कारपेंटर, प्लंबर, टेंट, आदि)। मुझे रोज काम चाहिए।</Text>
                    </View>
                    {selectedRole === 'CONTRACTOR' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>

                  {/* Option 3: Vendor */}
                  <TouchableOpacity
                    style={[styles.roleOptionCard, selectedRole === 'VENDOR' && styles.roleOptionActive]}
                    onPress={() => setSelectedRole('VENDOR')}
                  >
                    <MaterialIcons name="storefront" size={26} color={selectedRole === 'VENDOR' ? COLORS.primary : COLORS.textSecondary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.roleTitle}>3. मटेरियल सप्लायर / दुकानदार (Shop Owner)</Text>
                      <Text style={styles.roleDesc}>मेरी हार्डवेयर/पेंट/सीमेंट/सप्लाई की दुकान है। मुझे सामान बेचना है।</Text>
                    </View>
                    {selectedRole === 'VENDOR' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('DETAILS')} activeOpacity={0.8}>
                  <Text style={styles.primaryBtnText}>प्रोफ़ाइल विवरण भरें ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 4: DETAILS & KYC */}
            {step === 'DETAILS' && (
              <View>
                <Text style={styles.stepTitle}>
                  {selectedRole === 'CUSTOMER' ? 'व्यक्तिगत जानकारी' : selectedRole === 'CONTRACTOR' ? 'कारीगर प्रोफ़ाइल & आधार KYC' : 'दुकान का विवरण & GST'}
                </Text>
                <Text style={styles.stepSub}>यह जानकारी आपके डिजिटल पहचान पत्र (SETU ID Card) पर अंकित होगी:</Text>

                <Text style={styles.inputLabel}>पूरा नाम (Full Name):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="उदा. रमेश कुमार शर्मा"
                  value={fullName}
                  onChangeText={setFullName}
                />

                {selectedRole === 'CONTRACTOR' && (
                  <>
                    <Text style={styles.inputLabel}>आपकी मुख्य कारीगरी (Trade):</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="उदा. बढ़ई (Carpenter) / प्लंबर / पेंटर"
                      value={tradeOrShop}
                      onChangeText={setTradeOrShop}
                    />

                    <Text style={styles.inputLabel}>आधार नंबर (Aadhaar Number):</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="XXXX-XXXX-XXXX (सत्यापन हेतु)"
                      value={aadhaarOrGst}
                      onChangeText={setAadhaarOrGst}
                    />
                  </>
                )}

                {selectedRole === 'VENDOR' && (
                  <>
                    <Text style={styles.inputLabel}>दुकान का पूरा नाम (Shop Name):</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="उदा. गुप्ता हार्डवेयर & बिल्डिंग मैटेरियल"
                      value={tradeOrShop}
                      onChangeText={setTradeOrShop}
                    />

                    <Text style={styles.inputLabel}>GSTIN / उद्यम रजिस्ट्रेशन नं:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="09AAACG1234F1Z5 (वैकल्पिक)"
                      value={aadhaarOrGst}
                      onChangeText={setAadhaarOrGst}
                    />
                  </>
                )}

                <TouchableOpacity style={styles.primaryBtn} onPress={handleFinishDetails} activeOpacity={0.8} disabled={isBusy}>
                  {isBusy ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.primaryBtnText}>SETU ID कार्ड जारी करें ➔</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 5: SUCCESS BADGE & SETU ID CARD */}
            {step === 'SUCCESS' && (
              <View style={styles.successContainer}>
                <View style={styles.idCard}>
                  <View style={styles.idCardHeader}>
                    <View style={styles.idCardBrand}>
                      <Text style={styles.idCardLogo}>सेतु</Text>
                      <Text style={styles.idCardTitle}>SETU DIGITAL ID</Text>
                    </View>
                    <View style={styles.idCardBadge}>
                      <Text style={styles.idCardBadgeText}>
                        {registeredUser?.kycVerified ? 'सत्यापित (VERIFIED)' : 'सक्रिय (KYC विचाराधीन)'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.idCardBody}>
                    <View style={styles.idAvatar}>
                      <Text style={styles.idAvatarText}>{(fullName.trim().charAt(0) || 'S').toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.idName}>{fullName}</Text>
                      <Text style={styles.idRole}>
                        भूमिका: {selectedRole === 'CUSTOMER' ? 'प्रीमियम ग्राहक' : selectedRole === 'CONTRACTOR' ? `कारीगर (${tradeOrShop || 'कुशल कारीगर'})` : `सप्लायर (${tradeOrShop || 'हार्डवेयर स्टोर'})`}
                      </Text>
                      <Text style={styles.idPhone}>📞 +91 {phone}</Text>
                    </View>
                  </View>

                  <View style={styles.idCardFooter}>
                    <Text style={styles.setuIdNumber}>{generatedSetuId}</Text>
                    <Text style={styles.idIssueText}>जारी दिनांक: {new Date().toLocaleDateString('hi-IN')}</Text>
                  </View>
                </View>

                <Text style={styles.congratsText}>🎉 बधाई हो! आपका खाता सफलतापूर्वक सक्रिय हो गया है।</Text>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    onClose();
                    setStep('PHONE');
                  }}
                >
                  <Text style={styles.primaryBtnText}>ऐप में प्रवेश करें ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
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
    padding: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingVertical: 6,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  otpInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  rolesList: {
    gap: 10,
    marginBottom: 16,
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  roleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  roleDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  idCard: {
    width: '100%',
    backgroundColor: '#1E3A8A', // Official Navy ID Badge
    borderRadius: 14,
    padding: 14,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 14,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F6',
    paddingBottom: 8,
    marginBottom: 10,
  },
  idCardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  idCardLogo: {
    backgroundColor: '#FFFFFF',
    color: '#1E3A8A',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  idCardBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  idName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  idRole: {
    color: '#93C5FD',
    fontSize: 11,
    marginTop: 2,
  },
  idPhone: {
    color: '#BFDBFE',
    fontSize: 10,
    marginTop: 2,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3B82F6',
  },
  setuIdNumber: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  idIssueText: {
    color: '#BFDBFE',
    fontSize: 9,
  },
  congratsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginVertical: 10,
  },
});
