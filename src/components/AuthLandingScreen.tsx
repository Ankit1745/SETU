import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { ApiService } from '../services/api';

interface AuthLandingScreenProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onLoginSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
  onRequestAdmin: () => void;
}

export const AuthLandingScreen: React.FC<AuthLandingScreenProps> = ({
  language,
  onToggleLanguage,
  onLoginSuccess,
  onContinueAsGuest,
  onRequestAdmin,
}) => {
  const t = TRANSLATIONS[language];
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN'>('CUSTOMER');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [tradeOrShop, setTradeOrShop] = useState('');
  const [realOtpReceived, setRealOtpReceived] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  // Send OTP
  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      Alert.alert(
        language === 'en' ? 'Invalid Number' : 'अमान्य मोबाइल नंबर',
        language === 'en'
          ? 'Please enter a valid 10-digit Indian mobile number.'
          : 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।'
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      const origin =
        Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'https://setu-1-nine.vercel.app';

      const res = await fetch(`${origin}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'OTP भेजने में विफल');
      }

      if (data.verificationToken) {
        setVerificationToken(data.verificationToken);
      }

      if (data.demoOtp) {
        setOtp(data.demoOtp);
        setRealOtpReceived(data.demoOtp);
        setSmsNotification(
          language === 'en'
            ? `📩 SMS Sent: Use verification OTP ${data.demoOtp} (auto-filled)`
            : `📩 SMS भेजा गया: सत्यापन OTP ${data.demoOtp} (स्वतः भरा गया)`
        );
      } else {
        setSmsNotification(
          language === 'en'
            ? `📩 SMS: 4-digit verification code sent to +91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)}`
            : `📩 SMS: +91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)} पर 4-अंकीय सत्यापन कोड भेजा गया है।`
        );
      }
      setStep('OTP');
    } catch (err: any) {
      Alert.alert(
        language === 'en' ? 'OTP Send Failed' : 'OTP विफलता',
        err.message || (language === 'en' ? 'Unable to send OTP. Please check your connection.' : 'OTP भेजने में असमर्थ। कृपया नेटवर्क जाँचें।')
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert(
        language === 'en' ? 'Enter OTP' : 'OTP दर्ज करें',
        language === 'en' ? 'Please enter the 4-digit code.' : 'कृपया 4-अंकीय OTP कोड डालें।'
      );
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const origin =
        Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'https://setu-1-nine.vercel.app';

      const res = await fetch(`${origin}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: otp.trim(),
          verificationToken,
          fullName: name.trim() || (authRole === 'CUSTOMER' ? 'अमित कुमार सिंह' : authRole === 'CONTRACTOR' ? 'रमेश शर्मा' : 'गुप्ता जी'),
          role: authRole,
          tradeOrShop: tradeOrShop.trim() || (authRole === 'CONTRACTOR' ? 'मास्टर बढ़ई (Modular Kitchen)' : authRole === 'VENDOR' ? 'गुप्ता हार्डवेयर स्टोर' : ''),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) {
          ApiService.setAuthToken(data.token);
        }
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('setu_current_user', JSON.stringify(data.user));
          window.sessionStorage?.setItem('setu_session_active', 'true');
        }
        onLoginSuccess(data.user);
      } else {
        throw new Error(data.error || 'सत्यापन विफल रहा।');
      }
    } catch (err: any) {
      Alert.alert(
        language === 'en' ? 'Verification Failed' : 'सत्यापन विफल',
        err.message || (language === 'en' ? 'Invalid OTP or server rejection.' : 'अमान्य OTP कोड या सर्वर द्वारा अस्वीकार।')
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Fast Test Profiles
  const handleFastDemoLogin = (role: 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN') => {
    if (role === 'ADMIN') {
      onRequestAdmin();
      return;
    }

    const testUsers = {
      CUSTOMER: {
        id: 'u1',
        phone: '9876543210',
        name: 'अमित कुमार सिंह',
        role: 'CUSTOMER',
        setuId: 'SETU-CUS-1029',
        rewardPoints: 250,
        locality: 'एमपी नगर (ज़ोन-1), भोपाल',
      },
      CONTRACTOR: {
        id: 'u2',
        phone: '9812345678',
        name: 'रमेश शर्मा (मास्टर बढ़ई)',
        role: 'CONTRACTOR',
        setuId: 'SETU-PRO-4481',
        trade: 'बढ़ई (Carpenter)',
        walletBalance: 850,
      },
      VENDOR: {
        id: 'u3',
        phone: '9898989898',
        name: 'गुप्ता जी',
        role: 'VENDOR',
        setuId: 'SETU-VEN-8820',
        shopName: 'गुप्ता हार्डवेयर & सेनेटरी',
      },
    };

    const selected = testUsers[role];
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('setu_current_user', JSON.stringify(selected));
    }
    onLoginSuccess(selected);
  };

  const logoSource =
    language === 'hi'
      ? require('../../assets/setu-logo-hi.jpg')
      : require('../../assets/setu-logo-en.jpg');

  return (
    <View style={styles.root}>
      {/* Top Bar with Language Selector */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.topLogoBadgeContainer}>
            <Image source={logoSource} style={styles.topLogoImage} resizeMode="cover" />
          </View>
          <Text style={styles.brandTitle}>{language === 'hi' ? 'सेतु' : 'SETU'}</Text>
        </View>

        {/* Tri-Lingual Language Selector */}
        <View style={styles.langPill}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
            onPress={() => onToggleLanguage('hi')}
          >
            <Text style={[styles.langBtnText, language === 'hi' && styles.langBtnTextActive]}>
              हिन्दी
            </Text>
          </TouchableOpacity>
          <Text style={styles.langDivider}>|</Text>
          <TouchableOpacity
            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
            onPress={() => onToggleLanguage('en')}
          >
            <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <Text style={styles.langDivider}>|</Text>
          <TouchableOpacity
            style={[styles.langBtn, language === 'hinglish' && styles.langBtnActive]}
            onPress={() => onToggleLanguage('hinglish')}
          >
            <Text style={[styles.langBtnText, language === 'hinglish' && styles.langBtnTextActive]}>
              Hinglish
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Real Incoming SMS Notification Banner */}
        {smsNotification && (
          <View style={styles.smsBanner}>
            <View style={styles.smsIcon}>
              <MaterialIcons name="sms" size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.smsTitle}>
                {language === 'en' ? 'SMS Gateway Notification:' : 'आधिकारिक SMS गेटवे सूचना:'}
              </Text>
              <Text style={styles.smsBody}>{smsNotification}</Text>
            </View>
          </View>
        )}

        {/* 3D Hero Welcome Card with Official Logo */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLogo3DContainer}>
            <Image source={logoSource} style={styles.welcomeLogo3DImage} resizeMode="cover" />
          </View>
          <Text style={styles.welcomeTitle}>{t.welcomeTitle}</Text>
          <Text style={styles.welcomeTagline}>{t.welcomeSub}</Text>
          <Text style={styles.welcomeDesc}>{t.welcomeDesc}</Text>

          {/* 3 Trust Pillars */}
          <View style={styles.trustPillarsRow}>
            <View style={styles.trustPillar}>
              <Ionicons name="shield-checkmark" size={13} color="#22C55E" />
              <Text style={styles.trustPillarText}>
                {language === 'hi' ? '100% वेरिफाइड' : '100% Verified'}
              </Text>
            </View>
            <View style={styles.trustPillar}>
              <Ionicons name="lock-closed" size={12} color="#0284C7" />
              <Text style={styles.trustPillarText}>
                {language === 'hi' ? 'एस्क्रो सुरक्षित' : 'Escrow Safe'}
              </Text>
            </View>
            <View style={styles.trustPillar}>
              <Ionicons name="flash" size={12} color="#EA580C" />
              <Text style={styles.trustPillarText}>
                {language === 'hi' ? '15m आगमन' : '15m Arrival'}
              </Text>
            </View>
          </View>
        </View>

        {/* Role Selector Tabs */}
        <View style={styles.roleTabsWrap}>
          <Text style={styles.roleTabsLabel}>
            {language === 'en' ? 'Select your role:' : language === 'hinglish' ? 'Apna role chunein:' : 'अपनी भूमिका चुनें:'}
          </Text>
          <View style={styles.roleTabs}>
            <TouchableOpacity
              style={[styles.roleTab, authRole === 'CUSTOMER' && styles.roleTabActive]}
              onPress={() => setAuthRole('CUSTOMER')}
            >
              <Ionicons name="person" size={14} color={authRole === 'CUSTOMER' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.roleTabText, authRole === 'CUSTOMER' && styles.roleTabTextActive]}>
                {language === 'en' ? 'Customer' : 'ग्राहक'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, authRole === 'CONTRACTOR' && styles.roleTabActive]}
              onPress={() => setAuthRole('CONTRACTOR')}
            >
              <FontAwesome5 name="hammer" size={12} color={authRole === 'CONTRACTOR' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.roleTabText, authRole === 'CONTRACTOR' && styles.roleTabTextActive]}>
                {language === 'en' ? 'Contractor' : 'कारीगर'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, authRole === 'VENDOR' && styles.roleTabActive]}
              onPress={() => setAuthRole('VENDOR')}
            >
              <MaterialIcons name="store" size={14} color={authRole === 'VENDOR' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.roleTabText, authRole === 'VENDOR' && styles.roleTabTextActive]}>
                {language === 'en' ? 'Store' : 'दुकानदार'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, authRole === 'ADMIN' && styles.roleTabActiveAdmin]}
              onPress={() => {
                setAuthRole('ADMIN');
                onRequestAdmin();
              }}
            >
              <MaterialIcons name="security" size={14} color={authRole === 'ADMIN' ? '#FFFFFF' : '#DC2626'} />
              <Text style={[styles.roleTabText, authRole === 'ADMIN' && styles.roleTabTextActive]}>
                {language === 'en' ? 'Admin' : 'एडमिन'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth Input Card */}
        <View style={styles.formCard}>
          {step === 'PHONE' ? (
            <View>
              <Text style={styles.inputLabel}>{t.enterMobile}</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.flagBox}>
                  <Text style={styles.flagText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                activeOpacity={0.85}
              >
                {isSendingOtp ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t.getOtp}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.otpHeaderRow}>
                <Text style={styles.inputLabel}>
                  {language === 'en'
                    ? `Enter 4-Digit OTP sent to +91 ${phone}:`
                    : `+91 ${phone} पर आया 4-अंकीय OTP दर्ज करें:`}
                </Text>
                <TouchableOpacity onPress={() => setStep('PHONE')}>
                  <Text style={styles.changePhoneText}>
                    {language === 'en' ? 'Change' : 'बदलें'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.otpInput}
                placeholder="• • • •"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />

              <TextInput
                style={styles.nameInput}
                placeholder={
                  language === 'en'
                    ? 'Your Full Name (e.g. Amit Singh)'
                    : 'आपका पूरा नाम (जैसे: अमित सिंह)'
                }
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />

              {authRole === 'CONTRACTOR' && (
                <TextInput
                  style={styles.nameInput}
                  placeholder={
                    language === 'en'
                      ? 'Trade / Skill (e.g. Carpenter, Plumber, Mason)'
                      : 'कारीगरी विधा (जैसे: बढ़ई, प्लंबर, राजमिस्त्री)'
                  }
                  placeholderTextColor="#94A3B8"
                  value={tradeOrShop}
                  onChangeText={setTradeOrShop}
                />
              )}

              {authRole === 'VENDOR' && (
                <TextInput
                  style={styles.nameInput}
                  placeholder={
                    language === 'en'
                      ? 'Shop / Business Name (e.g. Gupta Hardware)'
                      : 'दुकान या व्यापार का नाम (जैसे: गुप्ता हार्डवेयर)'
                  }
                  placeholderTextColor="#94A3B8"
                  value={tradeOrShop}
                  onChangeText={setTradeOrShop}
                />
              )}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp}
                activeOpacity={0.85}
              >
                {isVerifyingOtp ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t.verifyOtp}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Guest / Skip Option */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={onContinueAsGuest}
            activeOpacity={0.85}
          >
            <Text style={styles.guestBtnText}>{t.browseAsGuest}</Text>
          </TouchableOpacity>
        </View>

        {/* ⚡ 1-Click Fast Test Profiles */}
        <View style={styles.fastTestBox}>
          <Text style={styles.fastTestTitle}>{t.fastDemoLogin}</Text>
          <View style={styles.fastTestButtons}>
            <TouchableOpacity
              style={styles.fastTestPill}
              onPress={() => handleFastDemoLogin('CUSTOMER')}
            >
              <Text style={styles.fastTestPillText}>👤 अमित (ग्राहक)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fastTestPill}
              onPress={() => handleFastDemoLogin('CONTRACTOR')}
            >
              <Text style={styles.fastTestPillText}>👷 रमेश (बढ़ई)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fastTestPill}
              onPress={() => handleFastDemoLogin('VENDOR')}
            >
              <Text style={styles.fastTestPillText}>🏪 गुप्ता जी (दुकान)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fastTestPill, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={() => handleFastDemoLogin('ADMIN')}
            >
              <Text style={[styles.fastTestPillText, { color: '#DC2626' }]}>🛡️ एडमिन</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'web' ? 14 : 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topLogoBadgeContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 122, 0, 0.5)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(255, 122, 0, 0.4)',
      },
    }),
  },
  topLogoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  langBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langBtnActive: {
    backgroundColor: '#2563EB',
  },
  langBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  langBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  langDivider: {
    color: '#475569',
    fontSize: 10,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  smsBanner: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0C4A6E',
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  smsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0369A1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsTitle: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '800',
  },
  smsBody: {
    color: '#F0F9FF',
    fontSize: 12,
    fontWeight: '700',
  },
  smsAutoFillBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  smsAutoFillBtnText: {
    color: '#0C4A6E',
    fontSize: 10.5,
    fontWeight: '900',
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 14,
  },
  welcomeLogo3DContainer: {
    width: 84,
    height: 84,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: 'rgba(255, 122, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 30px rgba(255, 122, 0, 0.35), 0 0 20px rgba(37, 99, 235, 0.35)',
      },
      default: {
        shadowColor: '#FF7A00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 10,
      },
    }),
  },
  welcomeLogo3DImage: {
    width: '100%',
    height: '100%',
  },
  trustPillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  trustPillar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  trustPillarText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
  },
  roleTabsWrap: {
    width: '100%',
    maxWidth: 440,
    marginBottom: 14,
  },
  roleTabsLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 7,
    gap: 4,
  },
  roleTabActive: {
    backgroundColor: '#2563EB',
  },
  roleTabActiveAdmin: {
    backgroundColor: '#DC2626',
  },
  roleTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    overflow: 'hidden',
  },
  flagBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    backgroundColor: '#1E293B',
  },
  flagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changePhoneText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  otpInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  guestBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: 'transparent',
  },
  guestBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  fastTestBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fastTestTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  fastTestButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fastTestPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fastTestPillText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
});
