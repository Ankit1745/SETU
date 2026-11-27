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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import { pickImageFromGallery } from '../utils/mediaPicker';
import { ApiService } from '../services/api';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';
import { detectLiveGpsLocation } from '../utils/liveLocation';

interface CustomerProfileModalProps {
  visible: boolean;
  user: any;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  onLogout: () => void;
  onOpenWorkWithUs: () => void;
  currentLocation?: string;
  onLocationUpdate?: (location: string) => void;
  language?: Language;
}

const LOCALITY_PRESETS = [
  { name: 'एमपी नगर (ज़ोन 1 & 2), भोपाल', pincode: '462011', prosCount: 38 },
  { name: 'कोलार रोड & मंदाकिनी, भोपाल', pincode: '462042', prosCount: 42 },
  { name: 'अरेरा कॉलोनी (E-1 से E-7), भोपाल', pincode: '462016', prosCount: 29 },
  { name: 'होशंगाबाद रोड & मिसरोद, भोपाल', pincode: '462026', prosCount: 31 },
  { name: 'इंद्रपुरी & भेल (BHEL), भोपाल', pincode: '462022', prosCount: 35 },
  { name: 'अयोध्या बाईपास & मिनाल, भोपाल', pincode: '462041', prosCount: 26 },
  { name: 'बैरागढ़ / संत हिरदाराम नगर, भोपाल', pincode: '462030', prosCount: 21 },
  { name: 'चूना भट्टी & शाहपुरा, भोपाल', pincode: '462016', prosCount: 25 },
];

function normalizeProfileUser(
  verifiedUser: any,
  authRole: 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR',
  nameInput: string,
  phoneInput: string,
  finalLocation: string,
  avatarUrl: string,
  idProofUrl: string,
  isHindi: boolean
) {
  const finalRole = verifiedUser?.role || authRole || 'CUSTOMER';
  const rolePrefix =
    finalRole === 'CONTRACTOR'
      ? 'PRO'
      : finalRole === 'VENDOR'
      ? 'VEN'
      : finalRole === 'ADMIN'
      ? 'ADM'
      : 'CUS';

  return {
    ...(verifiedUser || {}),
    id: verifiedUser?.id || `u_${Date.now()}`,
    name: verifiedUser?.name || nameInput.trim() || (isHindi ? 'SETU उपयोगकर्ता' : 'SETU User'),
    phone: verifiedUser?.phone || phoneInput.replace(/\D/g, '').slice(-10) || '',
    role: finalRole,
    location: finalLocation,
    avatarUrl: avatarUrl || verifiedUser?.avatarUrl || '',
    idProofUrl: idProofUrl || verifiedUser?.idProofUrl || '',
    rewardPoints: verifiedUser?.rewardPoints ?? 250,
    setuId: verifiedUser?.setuId || `SETU-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
  };
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  visible,
  user,
  onClose,
  onLoginSuccess,
  onLogout,
  onOpenWorkWithUs,
  currentLocation = 'एमपी नगर, भोपाल • 462011',
  onLocationUpdate,
  language = 'hi',
}) => {
  const isHindi = language !== 'en';

  // Login steps: 'PHONE' -> 'OTP' -> 'LOCATION_PERMISSION'
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'CONTRACTOR' | 'VENDOR'>('CUSTOMER');
  const [loginStep, setLoginStep] = useState<'PHONE' | 'OTP' | 'LOCATION_PERMISSION'>('PHONE');
  const [phone, setPhone] = useState('');

  // Account Edit State (Logged-in users can update name, photo, and location anytime)
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editAccountName, setEditAccountName] = useState(user?.name || '');
  const [editAccountLoc, setEditAccountLoc] = useState(user?.location || currentLocation || '');
  const [editAccountAvatar, setEditAccountAvatar] = useState(user?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');

  // Real Features State
  const [realOtpReceived, setRealOtpReceived] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);

  // Real Upload State
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [idProofUrl, setIdProofUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'PRIVACY' | 'TERMS' | 'REFUND' | null>(null);

  const handleDeleteAccount = () => {
    showAppAlert(
      isHindi ? '⚠️ खाता स्थायी रूप से हटाएं?' : '⚠️ Delete Account Permanently?',
      isHindi
        ? 'क्या आप वाकई अपना SETU खाता हटाना चाहते हैं? आपकी सभी बुकिंग, रिवॉर्ड कॉइन्स और व्यक्तिगत डेटा स्थायी रूप से मिटा दिया जाएगा।'
        : 'Are you sure you want to delete your SETU account? All your bookings, reward points, and personal data will be permanently wiped.',
      [
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: isHindi ? 'हाँ, खाता हटाएं' : 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            if (ApiService.getAuthToken()) {
              const res = await ApiService.deleteAccount();
              if (res && !res.success) {
                showAppAlert('त्रुटि', res.error || 'खाता हटाने में समस्या आई।');
                return;
              }
            }
            onLogout();
            showAppAlert(
              isHindi ? '✓ खाता हटा दिया गया' : '✓ Account Deleted',
              isHindi
                ? 'आपका खाता और व्यक्तिगत डेटा सफलतापूर्वक मिटा दिया गया है।'
                : 'Your account and personal data have been completely deleted.'
            );
          },
        },
      ]
    );
  };

  // Real Image Picker & Uploader
  const handlePickImage = async (type: 'avatar' | 'id') => {
    setIsUploadingPhoto(true);
    try {
      const picked = await pickImageFromGallery();
      if (!picked || !picked.base64) {
        setIsUploadingPhoto(false);
        return;
      }

      const isKyc = type === 'id';
      const uploadRes = await ApiService.uploadFile(
        picked.base64,
        picked.name || (isKyc ? 'id_proof.jpg' : 'avatar.jpg'),
        isKyc ? 'kyc' : 'avatar',
        isKyc
      );

      setIsUploadingPhoto(false);
      if (uploadRes && uploadRes.success) {
        const fileRef = isKyc ? (uploadRes.privateRef || uploadRes.filename) : (uploadRes.fullUrl || uploadRes.url);
        if (type === 'avatar') {
          setAvatarUrl(fileRef);
        } else {
          setIdProofUrl(fileRef);
        }
        showAppAlert('✅ सफलता', type === 'avatar' ? 'प्रोफाइल फोटो अपलोड हो गई!' : 'पहचान पत्र सुरक्षित प्राइवेट स्टोरेज में अपलोड हो गया!');
      } else {
        showAppAlert('अपलोड विफल', uploadRes?.error || 'फोटो अपलोड नहीं हो सकी।');
      }
    } catch (err: any) {
      setIsUploadingPhoto(false);
      showAppAlert('त्रुटि', 'अपलोड प्रक्रिया में समस्या: ' + err.message);
    }
  };

  // 1. Send Real OTP via centralized ApiService
  const handleSendOtp = async () => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      showAppAlert(
        isHindi ? 'अमान्य फोन नंबर' : 'Invalid Phone Number',
        isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      const data = await ApiService.sendOtp(clean);
      if (data && data.success) {
        if (data.verificationToken) {
          setVerificationToken(data.verificationToken);
        }
        if (data.demoOtp) {
          setRealOtpReceived(data.demoOtp);
          setOtp(data.demoOtp);
          setSmsNotification(data.demoOtp);
          setLoginStep('OTP');
        } else if (data.smsDispatched === false) {
          setRealOtpReceived('');
          setOtp('');
          const failMsg = data.message || 'SMS गेटवे अभी OTP नहीं भेज सका। कृपया Fast2SMS वेरिफिकेशन जांचें।';
          setSmsNotification(failMsg);
          showAppAlert('⚠️ SMS नहीं जा सका', failMsg);
        } else {
          setRealOtpReceived('');
          setOtp('');
          setSmsNotification(null);
          setLoginStep('OTP');
        }
      } else {
        showAppAlert('त्रुटि', data?.error || 'OTP भेजने में विफल');
      }
    } catch {
      showAppAlert('नेटवर्क त्रुटि', 'OTP सेवा से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify Real OTP (Strictly server-verified; NO offline bypass)
  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      showAppAlert(
        isHindi ? 'OTP आवश्यक' : 'OTP Required',
        isHindi ? 'कृपया SMS में आया 4 अंकों का कोड दर्ज करें।' : 'Please enter 4-digit code.'
      );
      return;
    }

    setIsVerifyingOtp(true);
    const clean = phone.replace(/\D/g, '').slice(-10);

    try {
      const data = await ApiService.verifyOtp({
        phone: clean,
        otp: otp.trim(),
        verificationToken,
        fullName: name.trim() || undefined,
        role: authRole,
        avatarUrl: avatarUrl || undefined,
        idProofUrl: idProofUrl || undefined,
      });

      if (data && data.success && data.user) {
        if (data.token) {
          ApiService.setAuthToken(data.token);
        }
        setVerifiedUser(data.user);
        setLoginStep('LOCATION_PERMISSION');
      } else {
        showAppAlert('सत्यापन विफल', data?.error || 'अमान्य या समाप्त OTP कोड।');
      }
    } catch {
      showAppAlert('सत्यापन त्रुटि', 'सर्वर से सत्यापन नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3. Live GPS Location Detection (Works globally across devices via Geolocation + backend reverse proxy)
  const handleGrantGpsLocation = async () => {
    setIsDetectingGps(true);
    const res = await detectLiveGpsLocation();
    setIsDetectingGps(false);
    if (res.ok && res.formattedLocation) {
      completeLogin(res.formattedLocation);
    } else {
      showAppAlert(
        '📍 लाइव GPS लोकेशन',
        res.error || 'कृपया नीचे दी गई सूची से अपना इलाका चुनें।'
      );
    }
  };

  const handleUploadLoggedAvatar = async () => {
    setIsUploadingPhoto(true);
    try {
      const picked = await pickImageFromGallery();
      if (!picked || !picked.base64) {
        setIsUploadingPhoto(false);
        return;
      }
      const res = await ApiService.uploadFile(picked.base64, picked.name || 'avatar.jpg', 'avatar', false);
      setIsUploadingPhoto(false);
      if (res && res.success) {
        const finalUrl = res.fullUrl || res.url;
        setEditAccountAvatar(finalUrl);
        showAppAlert('✅ फोटो अपलोड हुई', 'सेव करते ही आपकी नई प्रोफाइल फोटो दिखेगी।');
      } else {
        showAppAlert('त्रुटि', res?.error || 'फोटो अपलोड विफल रही।');
      }
    } catch (e: any) {
      setIsUploadingPhoto(false);
      showAppAlert('त्रुटि', e.message || 'फोटो अपलोड त्रुटि');
    }
  };

  const handleDetectEditAccountGps = async () => {
    setIsDetectingGps(true);
    const res = await detectLiveGpsLocation();
    setIsDetectingGps(false);
    if (res.ok && res.formattedLocation) {
      setEditAccountLoc(res.formattedLocation);
    } else {
      showAppAlert('GPS लोकेशन', res.error || 'लोकेशन प्राप्त नहीं हो सकी।');
    }
  };

  const handleSaveAccountEdits = async () => {
    const cleanName = editAccountName.trim();
    if (cleanName.length < 2) {
      showAppAlert('अनिवार्य जानकारी', 'कृपया अपना पूरा नाम (कम से कम 2 अक्षर) दर्ज करें।');
      return;
    }
    setIsSavingProfile(true);
    try {
      let updatedUser = {
        ...(user || {}),
        name: cleanName,
        location: editAccountLoc.trim() || currentLocation,
        avatarUrl: editAccountAvatar.trim(),
      };
      if (ApiService.getAuthToken()) {
        const res = await ApiService.updateUserProfile({
          name: cleanName,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
        });
        if (res && res.success === false) {
          showAppAlert('अपडेट विफल', res.error || 'प्रोफाइल सेव नहीं हो सकी।');
          return;
        }
        if (res && res.user) {
          updatedUser = { ...updatedUser, ...res.user };
        }
      }
      if (onLocationUpdate && updatedUser.location) {
        onLocationUpdate(updatedUser.location);
      }
      onLoginSuccess(updatedUser);
      setIsEditingAccount(false);
      showAppAlert('✅ प्रोफाइल अपडेट हुई', 'आपकी फोटो, नाम व लोकेशन सफलतापूर्वक सेव हो गए हैं।');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSelectPresetLocation = (locName: string, pincode: string) => {
    const formattedLoc = `${locName} • ${pincode}`;
    completeLogin(formattedLoc);
  };

  const completeLogin = (finalLocation: string) => {
    if (onLocationUpdate) {
      onLocationUpdate(finalLocation);
    }

    const newUser = normalizeProfileUser(
      verifiedUser,
      authRole,
      name,
      phone,
      finalLocation,
      avatarUrl,
      idProofUrl,
      isHindi
    );

    onLoginSuccess(newUser);
    setLoginStep('PHONE');
    setPhone('');
    setOtp('');
    setName('');
    setSmsNotification(null);
    setVerifiedUser(null);
    onClose();

    showAppAlert(
      isHindi ? '🎉 लॉगिन सफल!' : '🎉 Login Successful!',
      isHindi
        ? `स्वागत है ${newUser.name}!\nआपकी ID: ${newUser.setuId} (${newUser.role === 'CONTRACTOR' ? '👷 कारीगर' : newUser.role === 'VENDOR' ? '🏪 दुकानदार' : newUser.role === 'ADMIN' ? '🛡️ सुपर एडमिन' : '👤 ग्राहक'})\n📍 लोकेशन: ${finalLocation}`
        : `Welcome ${newUser.name}!\nID: ${newUser.setuId}\n📍 ${finalLocation}`
    );
  };

  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({ maxWidth: 660 });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {legalModalType !== null ? (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {legalModalType === 'PRIVACY'
                    ? (isHindi ? '🔒 गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy')
                    : legalModalType === 'TERMS'
                    ? (isHindi ? '📜 नियम एवं शर्तें (Terms & Conditions)' : 'Terms & Conditions')
                    : (isHindi ? '🛡️ 100% रिफंड व रद्दीकरण नीति' : 'Refund & Cancellation Policy')}
                </Text>
                <TouchableOpacity onPress={() => setLegalModalType(null)}>
                  <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingVertical: 14 }}>
                {legalModalType === 'PRIVACY' && (
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      1. सूचना संग्रहण व सुरक्षा
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      SETU केवल आवश्यक जानकारी (जैसे मोबाइल नंबर, स्थान और मरम्मत समस्या की फोटो) एकत्रित करता है ताकि आपको निकटतम कारीगर व हार्डवेयर स्टोर से जोड़ा जा सके। आपका डेटा किसी भी तृतीय पक्ष को विज्ञापनों हेतु नहीं बेचा जाता।
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      2. कैमरा व लोकेशन उपयोग
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      कैमरे का उपयोग केवल AI उस्ताद द्वारा समस्या (नल, सीलन आदि) के सटीक विश्लेषण और कारीगर को कार्य स्थल दिखाने हेतु किया जाता है। लोकेशन केवल 15 मिनट डिलीवरी हेतु पास के कारीगर ढूंढने में उपयोग होती है।
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      3. खाता विलोपन अधिकार (Right to Erasure)
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      ग्राहक किसी भी समय प्रोफाइल सेक्शन में &ldquo;खाता हटाएं&rdquo; बटन दबाकर अपना पूरा खाता और व्यक्तिगत डेटा स्थायी रूप से मिटा सकते हैं।
                    </Text>
                  </View>
                )}

                {legalModalType === 'TERMS' && (
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      1. मध्यस्थता व एस्क्रो गारंटी
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      SETU ग्राहक और स्वतंत्र सत्यापित कारीगरों के बीच एक पारदर्शी सेतु है। सभी बुकिंग्स में एस्क्रो सुरक्षा शामिल है, जिससे काम पूरा होने और ग्राहक द्वारा OTP जारी करने तक पैसा सुरक्षित रहता है।
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      2. पारदर्शी मानक दरें
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      प्लेटफॉर्म पर प्रदर्शित सभी दरें (दिहाड़ी या नाप दर) भोपाल मार्केट के आधिकारिक सर्वे पर आधारित हैं। कारीगर ग्राहक से इन दरों से अधिक नहीं मांग सकते।
                    </Text>
                  </View>
                )}

                {legalModalType === 'REFUND' && (
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      1. 100% रिफंड गारंटी (100% Escrow Money-Back)
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      यदि बुक किया गया कारीगर तय समय पर नहीं पहुंचता या काम शुरू करने से पहले रद्द होता है, तो आपका 100% अग्रिम एस्क्रो टोकन तुरंत मूल भुगतान स्रोत में वापस कर दिया जाता है।
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>
                      2. शून्य रद्दीकरण शुल्क (Zero Cancellation Fee)
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                      कारीगर के आपके घर पहुंचने से पहले कभी भी बुकिंग रद्द करने पर कोई रद्दीकरण पेनल्टी (₹0) नहीं ली जाती।
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submitBtn, { marginTop: 20 }]}
                  onPress={() => setLegalModalType(null)}
                >
                  <Text style={styles.submitBtnText}>
                    {isHindi ? 'समझ गया (वापस जाएं)' : 'Back to Account'}
                  </Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </>
          ) : (
            <>
              {/* Real Incoming SMS Notification Banner */}
          {smsNotification && loginStep === 'OTP' && (
            <TouchableOpacity
              style={styles.realSmsNotification}
              onPress={() => setOtp(smsNotification)}
              activeOpacity={0.9}
            >
              <View style={styles.smsIcon}>
                <Ionicons name="chatbox-ellipses" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.smsSender}>📩 नया SMS • SETU सुरक्षा गेटवे</Text>
                <Text style={styles.smsBody}>
                  आपका SETU लॉगिन OTP है: <Text style={styles.smsCode}>{smsNotification}</Text> (5 मिनट मान्य)
                </Text>
              </View>
              <View style={styles.smsAutoFillBtn}>
                <Text style={styles.smsAutoFillBtnText}>भरें ➔</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>सेतु</Text>
              </View>
              <Text style={styles.headerTitle}>
                {user
                  ? (isHindi ? 'मेरा SETU खाता (My Account)' : 'My SETU Account')
                  : (isHindi ? 'ग्राहक लॉगिन / साइन-अप (Sign In)' : 'Customer Login / Sign Up')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {user ? (
              // LOGGED IN VIEW: Customer Profile & SuperCoins
              <View>
                {/* Profile Card */}
                <View style={styles.userCard}>
                  {user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarLetter}>{(user.name || 'S').trim().charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userPhone}>📞 +91 {user.phone}</Text>
                    <Text style={styles.userSetuId}>ID: {user.setuId}</Text>
                    <Text style={styles.userLocationBadge}>📍 {user.location || currentLocation}</Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#EEF2FF',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                    onPress={() => {
                      setEditAccountName(user.name || '');
                      setEditAccountLoc(user.location || currentLocation || '');
                      setEditAccountAvatar(user.avatarUrl || '');
                      setIsEditingAccount(!isEditingAccount);
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#4338CA' }}>
                      {isEditingAccount ? 'बंद करें' : 'एडिट ✎'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isEditingAccount && (
                  <View style={[styles.inputBox, { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }]}>
                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#1E40AF', marginBottom: 8 }}>
                      ✏️ अपनी प्रोफाइल जानकारी, फोटो व लोकेशन अपडेट करें
                    </Text>

                    <View style={styles.uploadRow}>
                      <TouchableOpacity
                        style={styles.photoUploadBtn}
                        onPress={handleUploadLoggedAvatar}
                        disabled={isUploadingPhoto}
                      >
                        <Ionicons name="camera" size={16} color="#4F46E5" />
                        <Text style={styles.photoUploadBtnText}>
                          {editAccountAvatar ? '✓ फोटो बदलें' : '📷 प्रोफाइल फोटो चुनें'}
                        </Text>
                      </TouchableOpacity>
                      {isUploadingPhoto ? (
                        <ActivityIndicator size="small" color="#4F46E5" />
                      ) : editAccountAvatar ? (
                        <Image source={{ uri: editAccountAvatar }} style={styles.thumbnailPreview} />
                      ) : null}
                    </View>

                    <Text style={styles.inputLabel}>पूरा नाम:</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editAccountName}
                      onChangeText={setEditAccountName}
                      placeholder="आपका पूरा नाम"
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Text style={styles.inputLabel}>पता / शहर लोकेशन:</Text>
                      <TouchableOpacity onPress={handleDetectEditAccountGps} disabled={isDetectingGps}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.primary }}>
                          {isDetectingGps ? 'GPS जांच...' : '📍 लाइव GPS से भरें'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={editAccountLoc}
                      onChangeText={setEditAccountLoc}
                      placeholder="शहर, इलाका व पिनकोड"
                    />

                    <TouchableOpacity
                      style={[styles.submitBtn, { marginTop: 12 }]}
                      onPress={handleSaveAccountEdits}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitBtnText}>प्रोफाइल सेव करें ✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* THE CUSTOMER POINTS CARD (SETU Rewards) */}
                <View style={styles.pointsCard}>
                  <View style={styles.pointsTopRow}>
                    <View style={styles.coinBadge}>
                      <FontAwesome5 name="coins" size={18} color="#D97706" />
                      <Text style={styles.coinCount}>{user.rewardPoints ?? 250} कॉइन्स</Text>
                    </View>
                    <Text style={styles.coinWorth}>मूल्य: ₹{user.rewardPoints ?? 250} की छूट</Text>
                  </View>
                  <Text style={styles.pointsDesc}>
                    {isHindi
                      ? 'यह आपके SETU रिवॉर्ड कॉइन्स हैं। अगली बार किसी भी कारीगर या सामान की बुकिंग पर सीधे छूट पाएं!'
                      : 'Your SETU Reward Coins! Redeem them for instant cash discounts on labor and material bookings.'}
                  </Text>
                </View>

                {/* My Orders / Bookings Summary */}
                <View style={styles.menuBox}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onClose();
                      showAppAlert(
                        isHindi ? 'मेरी बुकिंग्स' : 'My Bookings',
                        isHindi
                          ? 'आपकी सक्रिय बुकिंग्स और एस्क्रो स्टेटस होम स्क्रीन पर नीचे दिख रहे हैं।'
                          : 'Your active bookings and escrow status are displayed on the home screen.'
                      );
                    }}
                  >
                    <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.menuItemText}>
                        {isHindi ? 'मेरी बुकिंग्स & ऑर्डर हिस्ट्री' : 'My Bookings & Orders'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onClose();
                      showAppAlert(
                        isHindi ? 'सुरक्षित एस्क्रो' : 'Secure Escrow',
                        isHindi
                          ? 'SETU सुरक्षा गारंटी: आपके सभी पेमेंट्स काम पूरा होने तक सुरक्षित रखे जाते हैं।'
                          : 'SETU Escrow Guarantee: All payments are held safely until work completion.'
                      );
                    }}
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.menuItemText}>
                        {isHindi ? 'SETU सुरक्षा गारंटी (एस्क्रो प्रोटेक्शन)' : 'SETU Safety Guarantee (Escrow)'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onClose();
                      onOpenWorkWithUs();
                    }}
                  >
                    <MaterialIcons name="work-outline" size={20} color={COLORS.secondary} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.menuItemTextBold}>
                        {isHindi ? 'हमारे साथ काम करें (पार्टनर बनें)' : 'Work With Us (Become a Partner)'}
                      </Text>
                      <Text style={styles.menuItemSub}>
                        {isHindi ? 'कारीगर या सप्लायर पोर्टल पर जाएं' : 'Switch to Contractor / Vendor portal'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>

                  {/* Legal & Compliance Links */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setLegalModalType('PRIVACY')}
                  >
                    <MaterialIcons name="privacy-tip" size={20} color="#4F46E5" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.menuItemTextBold}>
                        {isHindi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
                      </Text>
                      <Text style={styles.menuItemSub}>
                        {isHindi ? 'डेटा सुरक्षा और उपयोग शर्तें' : 'Data protection & usage'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setLegalModalType('TERMS')}
                  >
                    <MaterialIcons name="description" size={20} color="#0D9488" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.menuItemTextBold}>
                        {isHindi ? 'नियम एवं शर्तें (Terms & Conditions)' : 'Terms & Conditions'}
                      </Text>
                      <Text style={styles.menuItemSub}>
                        {isHindi ? 'सेवा नियम व एस्क्रो गारंटी' : 'Service terms & escrow'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setLegalModalType('REFUND')}
                  >
                    <MaterialIcons name="replay" size={20} color="#D97706" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.menuItemTextBold}>
                        {isHindi ? 'रिफंड व रद्दीकरण नीति (Refund Policy)' : 'Refund & Cancellation Policy'}
                      </Text>
                      <Text style={styles.menuItemSub}>
                        {isHindi ? '100% एस्क्रो मनी-बैक गारंटी' : '100% money-back guarantee'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>

                  {/* Account Deletion (GDPR & Store Compliance) */}
                  <TouchableOpacity
                    style={[styles.menuItem, { borderBottomWidth: 0 }]}
                    onPress={handleDeleteAccount}
                  >
                    <MaterialIcons name="delete-forever" size={20} color="#DC2626" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.menuItemTextBold, { color: '#DC2626' }]}>
                        {isHindi ? 'खाता स्थायी रूप से हटाएं (Delete Account)' : 'Delete Account Permanently'}
                      </Text>
                      <Text style={styles.menuItemSub}>
                        {isHindi ? 'व्यक्तिगत डेटा व बुकिंग मिटाएं' : 'Erase all personal data'}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                  <Text style={styles.logoutBtnText}>
                    {isHindi ? 'लॉगआउट करें' : 'Log Out'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // NOT LOGGED IN: 3-Step Flow (Phone -> OTP -> Location Permission)
              <View>
                {/* ROLE SELECTION TABS (Customer vs Partner) */}
                <View style={styles.authRoleTabs}>
                  <TouchableOpacity
                    style={[styles.authRoleTab, authRole === 'CUSTOMER' && styles.authRoleTabActive]}
                    onPress={() => setAuthRole('CUSTOMER')}
                  >
                    <Ionicons
                      name="person"
                      size={14}
                      color={authRole === 'CUSTOMER' ? '#FFFFFF' : '#475569'}
                    />
                    <Text
                      style={[
                        styles.authRoleTabText,
                        authRole === 'CUSTOMER' && styles.authRoleTabTextActive,
                      ]}
                    >
                      {isHindi ? '👤 ग्राहक (Customer)' : '👤 Customer'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.authRoleTab}
                    onPress={() => {
                      onClose();
                      onOpenWorkWithUs();
                    }}
                  >
                    <MaterialIcons name="handyman" size={14} color="#EA580C" />
                    <Text style={[styles.authRoleTabText, { color: '#EA580C' }]}>
                      {isHindi ? '👷 कारीगर / पार्टनर ➔' : '👷 Partner Onboarding ➔'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* STEP 1: PHONE NUMBER & REAL PHOTO UPLOAD */}
                {loginStep === 'PHONE' && (
                  <View>
                    <Text style={styles.loginTitle}>
                      {isHindi ? 'मोबाइल नंबर से 10 सेकंड में लॉगिन करें' : 'Sign In in 10 Seconds'}
                    </Text>
                    <Text style={styles.loginSub}>
                      {isHindi
                        ? 'लॉगिन करते ही आपको 250 SETU कॉइन्स मिलेंगे, जिनका इस्तेमाल काम पर छूट के लिए कर सकते हैं।'
                        : 'Instant login gets you 250 SETU coins for discounts on all services.'}
                    </Text>

                    <View style={styles.inputBox}>
                      <Text style={styles.inputLabel}>{isHindi ? 'पूरा नाम:' : 'Full Name:'}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={isHindi ? 'अपना पूरा नाम लिखें' : 'Enter your full name'}
                        value={name}
                        onChangeText={setName}
                      />

                      <Text style={styles.inputLabel}>{isHindi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</Text>
                      <View style={styles.phoneRow}>
                        <Text style={styles.countryCode}>🇮🇳 +91</Text>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder={isHindi ? '10 अंकों का फोन नंबर' : '10-digit mobile number'}
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={phone}
                          onChangeText={setPhone}
                        />
                      </View>

                      {/* REAL PHOTO UPLOAD SECTION */}
                      <View style={styles.uploadSectionBox}>
                        <Text style={styles.uploadSectionTitle}>📷 अपनी असली फोटो लगाएं (Camera / Gallery):</Text>
                        <View style={styles.uploadRow}>
                          <TouchableOpacity
                            style={styles.photoUploadBtn}
                            onPress={() => handlePickImage('avatar')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="camera" size={16} color="#4F46E5" />
                            <Text style={styles.photoUploadBtnText}>
                              {avatarUrl ? '✓ फोटो बदलें' : 'फोटो चुनें'}
                            </Text>
                          </TouchableOpacity>

                          {isUploadingPhoto ? (
                            <ActivityIndicator size="small" color="#4F46E5" />
                          ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.thumbnailPreview} />
                          ) : (
                            <Text style={styles.uploadPlaceholderText}>कोई फोटो नहीं चुनी गई</Text>
                          )}
                        </View>
                      </View>

                      {/* REAL ID PROOF UPLOAD (Aadhaar / Voter ID) */}
                      <View style={[styles.uploadSectionBox, { marginTop: 6 }]}>
                        <Text style={styles.uploadSectionTitle}>📄 असली पहचान पत्र (आधार कार्ड - ऐच्छिक):</Text>
                        <View style={styles.uploadRow}>
                          <TouchableOpacity
                            style={[styles.photoUploadBtn, { borderColor: '#10B981' }]}
                            onPress={() => handlePickImage('id')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="id-card" size={16} color="#059669" />
                            <Text style={[styles.photoUploadBtnText, { color: '#059669' }]}>
                              {idProofUrl ? '✓ आधार बदलें' : 'आधार अपलोड'}
                            </Text>
                          </TouchableOpacity>

                          {idProofUrl ? (
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }} numberOfLines={1}>
                              🔒 सुरक्षित दस्तावेज़ जुड़ा: {idProofUrl}
                            </Text>
                          ) : (
                            <Text style={styles.uploadPlaceholderText}>वेरिफिकेशन बैच हेतु</Text>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSendOtp}
                        activeOpacity={0.8}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {isHindi ? 'OTP भेजें ➔' : 'Send OTP ➔'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 2: OTP VERIFICATION */}
                {loginStep === 'OTP' && (
                  <View>
                    <Text style={styles.loginTitle}>
                      {isHindi ? 'OTP सत्यापन (Verification)' : 'Enter 4-Digit OTP'}
                    </Text>
                    <Text style={styles.loginSub}>
                      {isHindi
                        ? `+91 ${phone} पर 4 अंकों का कोड भेजा गया है:`
                        : `Enter the 4-digit verification code sent to +91 ${phone}:`}
                    </Text>

                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="• • • •"
                        keyboardType="numeric"
                        maxLength={4}
                        value={otp}
                        onChangeText={setOtp}
                      />

                      {/* 1-Click Auto-fill using Real OTP */}
                      {realOtpReceived ? (
                        <TouchableOpacity
                          style={styles.demoFillPill}
                          onPress={() => setOtp(realOtpReceived)}
                        >
                          <Ionicons name="checkmark-done" size={14} color="#16A34A" />
                          <Text style={[styles.demoFillPillText, { color: '#16A34A' }]}>
                            {isHindi
                              ? `⚡ SMS कोड ऑटो-भरें (${realOtpReceived})`
                              : `⚡ Auto-Fill SMS Code (${realOtpReceived})`}
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleVerifyOtp}
                        activeOpacity={0.8}
                        disabled={isVerifyingOtp}
                      >
                        {isVerifyingOtp ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {isHindi ? 'सत्यापित करें & लोकेशन अनुमति ➔' : 'Verify & Set Location ➔'}
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resendBtn}
                        onPress={() => setLoginStep('PHONE')}
                      >
                        <Text style={styles.resendText}>
                          {isHindi ? '← मोबाइल नंबर बदलें' : '← Change Phone Number'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 3: LOCATION PERMISSION PROMPT WITH REAL SATELLITE GPS */}
                {loginStep === 'LOCATION_PERMISSION' && (
                  <View>
                    <View style={styles.locationHeaderRow}>
                      <View style={styles.gpsIconCircle}>
                        <Ionicons name="location" size={24} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locationTitle}>
                          {isHindi ? 'असली GPS लोकेशन अनुमति' : 'Real GPS Location Permission'}
                        </Text>
                        <Text style={styles.locationSub}>
                          {isHindi
                            ? 'आपके आसपास (1-5 किमी) के सबसे नजदीकी कारीगर व दुकानें दिखाने के लिए:'
                            : 'Required to match you with nearby pros & hardware stores within 1-5 km:'}
                        </Text>
                      </View>
                    </View>

                    {/* Auto-detect REAL GPS button */}
                    <TouchableOpacity
                      style={styles.gpsActionCard}
                      onPress={handleGrantGpsLocation}
                      activeOpacity={0.85}
                      disabled={isDetectingGps}
                    >
                      {isDetectingGps ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.gpsActionTitle}>
                          {isDetectingGps
                            ? (isHindi ? '📍 सैटेलाइट GPS जांची जा रही है...' : '📍 Acquiring Satellite GPS...')
                            : (isHindi ? '📍 वर्तमान GPS लोकेशन की अनुमति दें' : '📍 Allow Device GPS Location')}
                        </Text>
                        <Text style={styles.gpsActionSub}>
                          {isHindi
                            ? '15 मिनट में त्वरित आगमन हेतु सटीक पिनपॉइंट'
                            : 'Instant 15-min arrival with exact pinpoint'}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.orDividerText}>
                      {isHindi ? '— अथवा अपना शहर / मोहल्ला चुनें —' : '— OR SELECT YOUR NEIGHBORHOOD —'}
                    </Text>

                    {/* Neighborhood list */}
                    <View style={styles.neighborhoodGrid}>
                      {LOCALITY_PRESETS.slice(0, 6).map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.neighborhoodChip}
                          onPress={() => handleSelectPresetLocation(item.name, item.pincode)}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.neighborhoodName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={styles.neighborhoodPros}>
                              {item.prosCount} {isHindi ? 'कारीगर सक्रिय' : 'pros available'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Work with us link */}
                <TouchableOpacity
                  style={styles.workLinkBox}
                  onPress={() => {
                    onClose();
                    onOpenWorkWithUs();
                  }}
                >
                  <Text style={styles.workLinkText}>
                    {isHindi
                      ? 'क्या आप कारीगर या दुकानदार हैं? '
                      : 'Are you a contractor or store owner? '}
                    <Text style={{ color: COLORS.secondary, fontWeight: '800' }}>
                      {isHindi ? 'पार्टनर बनें ➔' : 'Become a Partner ➔'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 25 }} />
          </ScrollView>
            </>
          )}
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
    padding: 16,
    maxHeight: '88%',
  },
  realSmsNotification: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  smsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsSender: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '800',
  },
  smsBody: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  smsCode: {
    color: '#FDE047',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  smsAutoFillBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  smsAutoFillBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
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
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingTop: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userSetuId: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  userLocationBadge: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  pointsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  pointsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinCount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
  },
  coinWorth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  pointsDesc: {
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuItemTextBold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  menuItemSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  authRoleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  authRoleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  authRoleTabActive: {
    backgroundColor: COLORS.primary,
  },
  authRoleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  authRoleTabTextActive: {
    color: '#FFFFFF',
  },
  loginTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  loginSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  uploadSectionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  uploadSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  photoUploadBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  thumbnailPreview: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  uploadPlaceholderText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  demoFillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  demoFillPillText: {
    fontSize: 10.5,
    color: '#4F46E5',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 8,
    color: COLORS.primary,
    marginBottom: 10,
  },
  resendBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  locationSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  gpsActionCard: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gpsActionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  gpsActionSub: {
    color: '#D1FAE5',
    fontSize: 10.5,
    marginTop: 1,
  },
  orDividerText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 10,
  },
  neighborhoodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  neighborhoodChip: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  neighborhoodName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  neighborhoodPros: {
    fontSize: 9.5,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 1,
  },
  workLinkBox: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 6,
  },
  workLinkText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
});
