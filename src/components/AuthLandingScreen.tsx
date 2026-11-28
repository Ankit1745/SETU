import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { ApiService } from '../services/api';
import { getSetuLogo } from '../constants/logos';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';
import {
  signInWithFirebaseGoogle,
  consumeFirebaseRedirectResult,
  signInOrRegisterWithFirebaseEmail,
  checkCurrentFirebaseEmailVerified,
  resendCurrentFirebaseVerificationEmail,
  sendFirebasePhoneOtp,
  confirmFirebasePhoneOtp,
  mapFirebaseErrorMessage,
  FirebaseSignInOutput,
} from '../services/firebaseAuth';

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
  const [authChannel, setAuthChannel] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'COMPLETE_PHONE' | 'VERIFY_EMAIL'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailSignup, setIsEmailSignup] = useState(false);
  const [name, setName] = useState('');
  const [tradeOrShop, setTradeOrShop] = useState('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isFirebaseBusy, setIsFirebaseBusy] = useState<boolean>(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpProvider, setOtpProvider] = useState<'BACKEND' | 'FIREBASE'>('BACKEND');
  const [fbConfirmation, setFbConfirmation] = useState<any>(null);
  const [pendingFirebaseAuth, setPendingFirebaseAuth] = useState<FirebaseSignInOutput | null>(null);

  const switchRole = (role: 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR') => {
    setAuthRole(role);
    setTradeOrShop('');
    setOtp('');
    setVerificationToken(null);
    setFbConfirmation(null);
    setPendingFirebaseAuth(null);
    setSmsNotification(null);
    setStep('PHONE');
  };

  const persistWebUserAndNotify = (userObj: any) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('setu_current_user', JSON.stringify(userObj));
        window.sessionStorage?.setItem('setu_session_active', 'true');
      } catch {
        // Ignore private mode quota error
      }
    }
    onLoginSuccess(userObj);
  };

  const completeBackendFirebaseExchange = async (fbAuth: FirebaseSignInOutput, phoneOverride?: string) => {
    const safeRole: 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' = authRole === 'ADMIN' ? 'CUSTOMER' : authRole;
    const cleanPhone = (phoneOverride || fbAuth.phone || '').replace(/\D/g, '').slice(-10);
    const data = await ApiService.firebaseAuth({
      idToken: fbAuth.idToken,
      phone: cleanPhone.length === 10 ? cleanPhone : undefined,
      fullName: (name || fbAuth.name || '').trim() || undefined,
      role: safeRole,
      tradeOrShop: tradeOrShop.trim() || undefined,
      avatarUrl: fbAuth.avatarUrl || undefined,
    });

    if (data && data.success && data.needsPhone) {
      setPendingFirebaseAuth(fbAuth);
      if (fbAuth.name && !name) setName(fbAuth.name);
      setStep('COMPLETE_PHONE');
      return;
    }

    if (data && data.success && data.user) {
      if (data.token) ApiService.setAuthToken(data.token);
      persistWebUserAndNotify(data.user);
      return;
    }
    throw new Error(data?.error || (language === 'en' ? 'Server verification failed.' : 'सर्वर सत्यापन विफल रहा।'));
  };

  useEffect(() => {
    let mounted = true;
    consumeFirebaseRedirectResult()
      .then(async (fbOut) => {
        if (!mounted || !fbOut) return;
        setIsFirebaseBusy(true);
        try {
          await completeBackendFirebaseExchange(fbOut);
        } catch (err: any) {
          showAppAlert(language === 'en' ? 'Sign-In Issue' : 'लॉगिन त्रुटि', err.message || 'Authentication failed');
        } finally {
          if (mounted) setIsFirebaseBusy(false);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSignIn = async () => {
    setIsFirebaseBusy(true);
    setSmsNotification(null);
    try {
      const fbOut = await signInWithFirebaseGoogle();
      if (!fbOut) return;
      await completeBackendFirebaseExchange(fbOut);
    } catch (err: any) {
      showAppAlert(
        language === 'en' ? 'Google Sign-In Issue' : '⚠️ Google लॉगिन त्रुटि',
        mapFirebaseErrorMessage(err, language)
      );
    } finally {
      setIsFirebaseBusy(false);
    }
  };

  const handleEmailAuth = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail.includes('@') || password.length < 6) {
      showAppAlert(
        language === 'en' ? 'Invalid Email / Password' : 'अमान्य ईमेल या पासवर्ड',
        language === 'en'
          ? 'Please enter a valid email address and a password of at least 6 characters.'
          : 'कृपया वैध ईमेल और कम से कम 6 अक्षरों का पासवर्ड दर्ज करें।'
      );
      return;
    }
    setIsFirebaseBusy(true);
    setSmsNotification(null);
    try {
      const fbOut = await signInOrRegisterWithFirebaseEmail(cleanEmail, password, isEmailSignup, name);
      if (fbOut.needsEmailVerification) {
        setSmsNotification(
          language === 'en'
            ? `📩 Verification link sent to ${cleanEmail}. Verify via email link before login.`
            : `📩 ${cleanEmail} पर वेरिफिकेशन लिंक भेजा गया है! लिंक से ईमेल सत्यापित किए बिना लॉगिन नहीं होगा।`
        );
        setStep('VERIFY_EMAIL');
        return;
      }
      await completeBackendFirebaseExchange(fbOut, phone);
    } catch (err: any) {
      showAppAlert(
        language === 'en' ? 'Email Auth Error' : 'ईमेल लॉगिन विफल',
        mapFirebaseErrorMessage(err, language)
      );
    } finally {
      setIsFirebaseBusy(false);
    }
  };

  const handleConfirmEmailVerified = async () => {
    setIsFirebaseBusy(true);
    try {
      const verified = await checkCurrentFirebaseEmailVerified();
      if (!verified) {
        showAppAlert(
          language === 'en' ? 'Email Not Verified Yet' : '⏳ अभी ईमेल सत्यापित नहीं है',
          language === 'en'
            ? 'Please open your Gmail/Inbox (and check Spam) and click the verification link first.'
            : 'कृपया अपने ईमेल इनबॉक्स (या Spam) में भेजे गए सत्यापन लिंक पर क्लिक करें, फिर यहाँ क्लिक करें।'
        );
        return;
      }
      setSmsNotification(null);
      await completeBackendFirebaseExchange(verified, phone);
    } catch (err: any) {
      showAppAlert(
        language === 'en' ? 'Verification Error' : 'सत्यापन त्रुटि',
        mapFirebaseErrorMessage(err, language)
      );
    } finally {
      setIsFirebaseBusy(false);
    }
  };

  const handleResendEmailVerification = async () => {
    setIsFirebaseBusy(true);
    try {
      await resendCurrentFirebaseVerificationEmail();
      showAppAlert(
        language === 'en' ? 'Verification Email Sent' : '✅ लिंक दोबारा भेजा गया',
        language === 'en'
          ? `Please check ${email.trim()} inbox/spam folder.`
          : `कृपया ${email.trim()} का इनबॉक्स या Spam फ़ोल्डर देखें।`
      );
    } catch (err: any) {
      showAppAlert(
        language === 'en' ? 'Resend Failed' : 'त्रुटि',
        mapFirebaseErrorMessage(err, language)
      );
    } finally {
      setIsFirebaseBusy(false);
    }
  };

  const handleCompleteGooglePhone = async () => {
    if (!pendingFirebaseAuth) return;
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showAppAlert(
        language === 'en' ? 'Mobile Number Required' : 'मोबाइल नंबर आवश्यक',
        language === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
      );
      return;
    }
    setIsFirebaseBusy(true);
    try {
      await completeBackendFirebaseExchange(pendingFirebaseAuth, cleanPhone);
    } catch (err: any) {
      showAppAlert(language === 'en' ? 'Save Failed' : 'त्रुटि', err.message || 'अकाउंट पूरा करने में त्रुटि');
    } finally {
      setIsFirebaseBusy(false);
    }
  };

  // Send OTP (tries Firebase Phone OTP on Web first when enabled, falls back to Fast2SMS backend OTP)
  const handleSendOtp = async (overridePhone?: string) => {
    const cleanPhone = (overridePhone ?? phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showAppAlert(
        language === 'en' ? 'Invalid Number' : 'अमान्य मोबाइल नंबर',
        language === 'en'
          ? 'Please enter a valid 10-digit Indian mobile number.'
          : 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।'
      );
      return;
    }

    setIsSendingOtp(true);
    setSmsNotification(null);
    try {
      if (Platform.OS === 'web') {
        try {
          const confirmation = await sendFirebasePhoneOtp(cleanPhone, 'setu-landing-recaptcha');
          setFbConfirmation(confirmation);
          setOtpProvider('FIREBASE');
          setOtp('');
          setSmsNotification(
            language === 'en'
              ? `📩 Firebase SMS: 6-digit OTP sent to +91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)}`
              : `📩 Firebase SMS: +91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)} पर 6-अंकीय OTP भेजा गया है।`
          );
          setStep('OTP');
          return;
        } catch (fbErr: any) {
          const code = String(fbErr?.code || '');
          if (
            code !== 'auth/billing-not-enabled' &&
            code !== 'auth/operation-not-allowed' &&
            code !== 'auth/unauthorized-domain'
          ) {
            throw new Error(mapFirebaseErrorMessage(fbErr, language));
          }
        }
      }

      const data = await ApiService.sendOtp(cleanPhone);
      if (!data || !data.success) {
        throw new Error(data?.error || 'OTP भेजने में विफल');
      }

      if (data.verificationToken) {
        setVerificationToken(data.verificationToken);
      }
      setOtpProvider('BACKEND');

      if (data.demoOtp) {
        setOtp(data.demoOtp);
        setSmsNotification(
          language === 'en'
            ? `📩 Verification code issued: ${data.demoOtp}`
            : `📩 सत्यापन कोड जारी हुआ: ${data.demoOtp}`
        );
      } else if (data.smsDispatched === false) {
        const failMsg =
          (data.message || 'SMS गेटवे अभी OTP नहीं भेज सका।') +
          (language === 'en'
            ? ' You can log in immediately using Google or Email above (100% Free).'
            : ' आप ऊपर दिए "Google से लॉगिन" या "ईमेल से लॉगिन" (100% फ्री) से तुरंत जुड़ सकते हैं!');
        setSmsNotification(`⚠️ ${failMsg}`);
        showAppAlert(language === 'en' ? 'SMS Delivery Issue' : '⚠️ SMS नहीं जा सका', failMsg);
        return;
      } else {
        setSmsNotification(
          language === 'en'
            ? `📩 SMS: 4-digit verification code sent to +91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)}`
            : `📩 SMS: +91 ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)} पर 4-अंकीय सत्यापन कोड भेजा गया है।`
        );
      }
      setStep('OTP');
    } catch (err: any) {
      showAppAlert(
        language === 'en' ? 'OTP Send Failed' : 'OTP विफलता',
        err.message || (language === 'en' ? 'Unable to send OTP. Please check your connection.' : 'OTP भेजने में असमर्थ। कृपया नेटवर्क जाँचें।')
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP (Firebase 6-digit OR Backend 4-digit; never sends ADMIN role!)
  const handleVerifyOtp = async () => {
    const minLen = otpProvider === 'FIREBASE' ? 6 : 4;
    if (!otp || otp.trim().length < minLen) {
      showAppAlert(
        language === 'en' ? 'Enter OTP' : 'OTP दर्ज करें',
        language === 'en' ? `Please enter the ${minLen}-digit code.` : `कृपया ${minLen}-अंकीय OTP कोड डालें।`
      );
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (otpProvider === 'FIREBASE' && fbConfirmation) {
        const fbOut = await confirmFirebasePhoneOtp(fbConfirmation, otp);
        await completeBackendFirebaseExchange(fbOut, cleanPhone);
        return;
      }

      const safeRole: 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' = authRole === 'ADMIN' ? 'CUSTOMER' : authRole;

      const data = await ApiService.verifyOtp({
        phone: cleanPhone,
        otp: otp.trim(),
        verificationToken,
        fullName: name.trim() || undefined,
        role: safeRole,
        tradeOrShop: tradeOrShop.trim() || undefined,
      });

      if (data && data.success && data.user) {
        if (data.token) {
          ApiService.setAuthToken(data.token);
        }
        persistWebUserAndNotify(data.user);
      } else {
        throw new Error(data?.error || 'सत्यापन विफल रहा।');
      }
    } catch (err: any) {
      showAppAlert(
        language === 'en' ? 'Verification Failed' : 'सत्यापन विफल',
        err?.code ? mapFirebaseErrorMessage(err, language) : err.message || (language === 'en' ? 'Invalid OTP or server rejection.' : 'अमान्य OTP कोड या सर्वर द्वारा अस्वीकार।')
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const logoSource = getSetuLogo(language);
  const { isCompactPhone, isSplitDesktop, isTabletOrDesktop } = useResponsive();

  return (
    <View style={styles.root}>
      {/* Top Bar with Language Selector */}
      <View style={styles.topBar}>
        <View style={[styles.topBarInner, isTabletOrDesktop && styles.topBarInnerDesktop]}>
          <View style={styles.brandRow}>
            <View style={styles.topLogoBadgeContainer}>
              <Image source={logoSource} style={styles.topLogoImage} resizeMode="cover" />
            </View>
            <Text style={[styles.brandTitle, isCompactPhone && { fontSize: 16 }]}>
              {language === 'hi' ? 'सेतु' : 'SETU'}
            </Text>
          </View>

          {/* Tri-Lingual Language Selector */}
          <View style={styles.langPill}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
              onPress={() => onToggleLanguage('hi')}
            >
              <Text style={[styles.langBtnText, language === 'hi' && styles.langBtnTextActive]}>
                {isCompactPhone ? 'हिं' : 'हिन्दी'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.langDivider}>|</Text>
            <TouchableOpacity
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => onToggleLanguage('en')}
            >
              <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                {isCompactPhone ? 'EN' : 'English'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.langDivider}>|</Text>
            <TouchableOpacity
              style={[styles.langBtn, language === 'hinglish' && styles.langBtnActive]}
              onPress={() => onToggleLanguage('hinglish')}
            >
              <Text style={[styles.langBtnText, language === 'hinglish' && styles.langBtnTextActive]}>
                {isCompactPhone ? 'Hing' : 'Hinglish'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isSplitDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.authGrid, isSplitDesktop && styles.authGridDesktop]}>
          {/* Left Column: 3D Hero Welcome Card with Official Logo */}
          <View
            style={[
              styles.welcomeCard,
              isCompactPhone && { paddingVertical: 8, marginBottom: 8 },
              isSplitDesktop && styles.welcomeCardDesktop,
            ]}
          >
            <View
              style={[
                styles.welcomeLogo3DContainer,
                isCompactPhone && { width: 64, height: 64, borderRadius: 16, marginBottom: 8 },
                isSplitDesktop && { width: 96, height: 96, borderRadius: 24, marginBottom: 18 },
              ]}
            >
              <Image source={logoSource} style={styles.welcomeLogo3DImage} resizeMode="cover" />
            </View>
            <Text
              style={[
                styles.welcomeTitle,
                isSplitDesktop && { fontSize: 30, textAlign: 'left', marginBottom: 8 },
              ]}
            >
              {t.welcomeTitle}
            </Text>
            <Text
              style={[
                styles.welcomeTagline,
                isSplitDesktop && { fontSize: 16, textAlign: 'left', marginBottom: 10 },
              ]}
            >
              {t.welcomeSub}
            </Text>
            <Text
              style={[
                styles.welcomeDesc,
                isSplitDesktop && { fontSize: 13.5, textAlign: 'left', lineHeight: 21, maxWidth: 440 },
              ]}
            >
              {t.welcomeDesc}
            </Text>

            {/* 3 Trust Pillars */}
            <View
              style={[
                styles.trustPillarsRow,
                isSplitDesktop && { justifyContent: 'flex-start', marginTop: 20, gap: 10 },
              ]}
            >
              <View style={[styles.trustPillar, isSplitDesktop && styles.trustPillarDesktop]}>
                <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
                <Text style={styles.trustPillarText}>
                  {language === 'hi' ? '100% वेरिफाइड' : '100% Verified'}
                </Text>
              </View>
              <View style={[styles.trustPillar, isSplitDesktop && styles.trustPillarDesktop]}>
                <Ionicons name="lock-closed" size={13} color="#0284C7" />
                <Text style={styles.trustPillarText}>
                  {language === 'hi' ? 'एस्क्रो सुरक्षित' : 'Escrow Safe'}
                </Text>
              </View>
              <View style={[styles.trustPillar, isSplitDesktop && styles.trustPillarDesktop]}>
                <Ionicons name="flash" size={13} color="#EA580C" />
                <Text style={styles.trustPillarText}>
                  {language === 'hi' ? '15m आगमन' : '15m Arrival'}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column: SMS Notice + Role Selector + Auth Form Card */}
          <View style={[styles.authRightCol, isSplitDesktop && styles.authRightColDesktop]}>
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

            {/* Role Selector Tabs */}
            <View style={styles.roleTabsWrap}>
              <Text style={styles.roleTabsLabel}>
                {language === 'en' ? 'Select your role:' : language === 'hinglish' ? 'Apna role chunein:' : 'अपनी भूमिका चुनें:'}
              </Text>
              <View style={[styles.roleTabs, isCompactPhone && { flexWrap: 'wrap' }]}>
                <TouchableOpacity
                  style={[styles.roleTab, isCompactPhone && { minWidth: '47%' }, authRole === 'CUSTOMER' && styles.roleTabActive]}
                  onPress={() => switchRole('CUSTOMER')}
                >
                  <Ionicons name="person" size={14} color={authRole === 'CUSTOMER' ? '#FFFFFF' : '#CBD5E1'} />
                  <Text style={[styles.roleTabText, authRole === 'CUSTOMER' && styles.roleTabTextActive]}>
                    {language === 'en' ? 'Customer' : language === 'hinglish' ? 'Grahak' : 'ग्राहक'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleTab, isCompactPhone && { minWidth: '47%' }, authRole === 'CONTRACTOR' && styles.roleTabActive]}
                  onPress={() => switchRole('CONTRACTOR')}
                >
                  <FontAwesome5 name="hammer" size={12} color={authRole === 'CONTRACTOR' ? '#FFFFFF' : '#CBD5E1'} />
                  <Text style={[styles.roleTabText, authRole === 'CONTRACTOR' && styles.roleTabTextActive]}>
                    {language === 'en' ? 'Contractor' : language === 'hinglish' ? 'Karigar' : 'कारीगर'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleTab, isCompactPhone && { minWidth: '31%' }, authRole === 'VENDOR' && styles.roleTabActive]}
                  onPress={() => switchRole('VENDOR')}
                >
                  <MaterialIcons name="store" size={14} color={authRole === 'VENDOR' ? '#FFFFFF' : '#CBD5E1'} />
                  <Text style={[styles.roleTabText, authRole === 'VENDOR' && styles.roleTabTextActive]}>
                    {language === 'en' ? 'Store' : language === 'hinglish' ? 'Dukandar' : 'दुकानदार'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

        {/* Auth Input Card */}
        <View style={styles.formCard}>
          {step === 'PHONE' ? (
            <View>
              {Platform.OS === 'web' && (
                <>
                  <TouchableOpacity
                    style={styles.googleBtn}
                    onPress={handleGoogleSignIn}
                    disabled={isFirebaseBusy || isSendingOtp}
                    activeOpacity={0.85}
                  >
                    {isFirebaseBusy ? (
                      <ActivityIndicator color="#0F172A" size="small" />
                    ) : (
                      <>
                        <FontAwesome5 name="google" size={14} color="#EA4335" />
                        <Text style={styles.googleBtnText}>
                          {language === 'en'
                            ? 'Continue with Google (Instant & Free)'
                            : 'Google से तुरंत लॉगिन करें (100% फ्री)'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.orDividerRow}>
                    <View style={styles.orDividerLine} />
                    <Text style={styles.orDividerText}>
                      {language === 'en' ? 'OR USE PHONE / EMAIL' : 'या फ़ोन / ईमेल से जुड़ें'}
                    </Text>
                    <View style={styles.orDividerLine} />
                  </View>
                </>
              )}

              {/* Auth Channel Switcher: Phone OTP vs Free Email/Password */}
              <View style={styles.channelToggleRow}>
                <TouchableOpacity
                  style={[styles.channelPill, authChannel === 'PHONE' && styles.channelPillActive]}
                  onPress={() => setAuthChannel('PHONE')}
                >
                  <Ionicons
                    name="call-outline"
                    size={13}
                    color={authChannel === 'PHONE' ? '#FFFFFF' : '#94A3B8'}
                  />
                  <Text style={[styles.channelPillText, authChannel === 'PHONE' && styles.channelPillTextActive]}>
                    {language === 'en' ? 'Mobile OTP' : 'मोबाइल OTP'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.channelPill, authChannel === 'EMAIL' && styles.channelPillActive]}
                  onPress={() => setAuthChannel('EMAIL')}
                >
                  <Ionicons
                    name="mail-outline"
                    size={13}
                    color={authChannel === 'EMAIL' ? '#FFFFFF' : '#94A3B8'}
                  />
                  <Text style={[styles.channelPillText, authChannel === 'EMAIL' && styles.channelPillTextActive]}>
                    {language === 'en' ? 'Email Login (Free)' : 'ईमेल लॉगिन (फ्री)'}
                  </Text>
                </TouchableOpacity>
              </View>

              {authChannel === 'PHONE' ? (
                <>
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
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => handleSendOtp()}
                    disabled={isSendingOtp || isFirebaseBusy}
                    activeOpacity={0.85}
                  >
                    {isSendingOtp ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>{t.getOtp}</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={[styles.channelToggleRow, { marginBottom: 10 }]}>
                    <TouchableOpacity
                      style={[styles.channelPill, !isEmailSignup && styles.channelPillActive]}
                      onPress={() => setIsEmailSignup(false)}
                    >
                      <Text style={[styles.channelPillText, !isEmailSignup && styles.channelPillTextActive]}>
                        {language === 'en' ? 'Sign In' : 'लॉगिन करें'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.channelPill, isEmailSignup && styles.channelPillActive]}
                      onPress={() => setIsEmailSignup(true)}
                    >
                      <Text style={[styles.channelPillText, isEmailSignup && styles.channelPillTextActive]}>
                        {language === 'en' ? 'Create Account' : 'नया खाता बनाएं'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>
                    {language === 'en' ? 'Email Address' : 'ईमेल पता (Email ID)'}
                  </Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <Text style={styles.inputLabel}>
                    {language === 'en' ? 'Password (min 6 chars)' : 'पासवर्ड (कम से कम 6 अक्षर)'}
                  </Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />

                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleEmailAuth}
                    disabled={isFirebaseBusy}
                    activeOpacity={0.85}
                  >
                    {isFirebaseBusy ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>
                        {isEmailSignup
                          ? language === 'en'
                            ? 'Create Account with Email'
                            : 'ईमेल से नया खाता बनाएं'
                          : language === 'en'
                          ? 'Sign In with Email'
                          : 'ईमेल से लॉगिन करें'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.emailModeSwitchBtn}
                    onPress={() => setIsEmailSignup(!isEmailSignup)}
                  >
                    <Text style={styles.emailModeSwitchText}>
                      {isEmailSignup
                        ? language === 'en'
                          ? 'Already have an account? Sign In'
                          : 'पहले से खाता है? लॉगिन करें'
                        : language === 'en'
                        ? 'New here? Create Email Account'
                        : 'नए यूज़र हैं? ईमेल से नया खाता बनाएं'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : step === 'VERIFY_EMAIL' ? (
            <View>
              <Text style={styles.inputLabel}>
                {language === 'en'
                  ? `📩 Verification link sent to ${email.trim()}! Click the link in your Inbox/Spam before logging in.`
                  : `📩 ${email.trim()} पर सत्यापन लिंक भेजा गया है! पहले अपने Gmail / Inbox (या Spam) में जाकर लिंक पर क्लिक करें — बिना सत्यापन के लॉगिन नहीं होगा।`}
              </Text>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#16A34A', marginTop: 8 }]}
                onPress={handleConfirmEmailVerified}
                disabled={isFirebaseBusy}
                activeOpacity={0.85}
              >
                {isFirebaseBusy ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {language === 'en' ? '✅ I Verified My Email — Continue ➔' : '✅ मैंने ईमेल सत्यापित कर लिया — आगे बढ़ें ➔'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailModeSwitchBtn}
                onPress={handleResendEmailVerification}
                disabled={isFirebaseBusy}
              >
                <Text style={styles.emailModeSwitchText}>
                  {language === 'en' ? '🔄 Resend Verification Email' : '🔄 वेरिफिकेशन लिंक दोबारा भेजें'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailModeSwitchBtn}
                onPress={() => setStep('PHONE')}
              >
                <Text style={styles.emailModeSwitchText}>
                  {language === 'en' ? '← Change Login Method' : '← ईमेल या विकल्प बदलें'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : step === 'COMPLETE_PHONE' ? (
            <View>
              <Text style={styles.inputLabel}>
                {language === 'en'
                  ? '✅ Verified via Firebase! Enter your 10-digit mobile number to continue:'
                  : '✅ अकाउंट सत्यापित! संपर्क व ऑर्डर अलर्ट के लिए अपना 10-अंकीय नंबर डालें:'}
              </Text>
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
                onPress={handleCompleteGooglePhone}
                disabled={isFirebaseBusy}
                activeOpacity={0.85}
              >
                {isFirebaseBusy ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {language === 'en' ? 'Save & Enter SETU ➔' : 'नंबर सेव करें और आगे बढ़ें ➔'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.otpHeaderRow}>
                <Text style={styles.inputLabel}>
                  {language === 'en'
                    ? `Enter ${otpProvider === 'FIREBASE' ? 6 : 4}-Digit OTP sent to +91 ${phone}:`
                    : `+91 ${phone} पर आया ${otpProvider === 'FIREBASE' ? 6 : 4}-अंकीय OTP दर्ज करें:`}
                </Text>
                <TouchableOpacity onPress={() => setStep('PHONE')}>
                  <Text style={styles.changePhoneText}>
                    {language === 'en' ? 'Change' : 'बदलें'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.otpInput}
                placeholder={otpProvider === 'FIREBASE' ? '• • • • • •' : '• • • •'}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={otpProvider === 'FIREBASE' ? 6 : 4}
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

          {/* Subtle restricted staff/admin entry shown only on login screen */}
          <TouchableOpacity
            style={{ marginTop: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 10 }}
            onPress={onRequestAdmin}
            activeOpacity={0.7}
          >
            <MaterialIcons name="lock-outline" size={12} color="#64748B" />
            <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
              {language === 'en' ? 'Restricted Admin Sign-In' : 'प्रशासनिक नियंत्रण प्रवेश'}
            </Text>
          </TouchableOpacity>
        </View>
          </View>
        </View>
        {Platform.OS === 'web' && (
          <View
            nativeID="setu-landing-recaptcha"
            style={{ position: 'absolute', left: -9999, top: -9999, width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
          />
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  topBarInnerDesktop: {
    maxWidth: 1120,
    alignSelf: 'center',
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
    paddingBottom: 36,
    alignItems: 'center',
    flexGrow: 1,
  },
  scrollContentDesktop: {
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 28,
  },
  authGrid: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
  },
  authGridDesktop: {
    maxWidth: 1060,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
  },
  authRightCol: {
    width: '100%',
    alignItems: 'center',
  },
  authRightColDesktop: {
    flex: 1,
    maxWidth: 460,
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
  welcomeCardDesktop: {
    flex: 1,
    maxWidth: 520,
    alignItems: 'flex-start',
    paddingVertical: 24,
    marginBottom: 0,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  trustPillarDesktop: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
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
    color: '#CBD5E1',
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  orDividerText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  channelToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  channelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 7,
  },
  channelPillActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  channelPillText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  channelPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emailModeSwitchBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  emailModeSwitchText: {
    color: '#60A5FA',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
