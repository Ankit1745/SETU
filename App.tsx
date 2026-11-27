import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { showAppAlert } from './src/utils/appAlert';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from './src/components/Header';
import { CustomerHome } from './src/screens/CustomerHome';
import { ContractorDashboard } from './src/screens/ContractorDashboard';
import { VendorDashboard } from './src/screens/VendorDashboard';
import { AdminDashboard } from './src/screens/AdminDashboard';
import { LocationPickerModal } from './src/components/LocationPickerModal';
import { WorkWithUsModal } from './src/components/WorkWithUsModal';
import { CustomerProfileModal } from './src/components/CustomerProfileModal';
import { PartnerRegistrationModal } from './src/components/PartnerRegistrationModal';
import { AdminSecurityModal } from './src/components/AdminSecurityModal';
import { BottomNavBar } from './src/components/BottomNavBar';
import { AuthLandingScreen } from './src/components/AuthLandingScreen';
import { ApiService } from './src/services/api';
import { Language, TRANSLATIONS } from './src/i18n/translations';
import {
  INITIAL_CONTRACTORS,
  INITIAL_MATERIALS,
  INITIAL_JOB_REQUESTS,
  Contractor,
  MaterialItem,
  JobRequest,
} from './src/data/mockData';
import { COLORS } from './src/theme/colors';
import { useResponsive } from './src/hooks/useResponsive';

export type UserRole = 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN';

function safeWebGet(key: string): string | null {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage access errors (Safari Private mode / SSR)
  }
  return null;
}

function safeWebSet(key: string, val: string): void {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch {
    // Ignore quota errors
  }
}

function safeWebRemove(key: string): void {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}

function safeSessionSet(key: string, val: string): void {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, val);
    }
  } catch {
    // Ignore
  }
}

function safeSessionRemove(key: string): void {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}

function decodeJwtPayload(token: string | null): any | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.replace(/^Bearer\s+/i, '').split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
    const jsonStr =
      typeof atob === 'function'
        ? atob(b64 + pad)
        : typeof Buffer !== 'undefined'
        ? Buffer.from(b64 + pad, 'base64').toString('utf-8')
        : '';
    if (!jsonStr) return null;
    const payload = JSON.parse(jsonStr);
    if (payload?.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export default function App() {
  const { isCompactPhone, isTabletOrDesktop, shellStyle } = useResponsive();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const savedToken = safeWebGet('setu_session_token');
      const tokenPayload = decodeJwtPayload(savedToken);
      const saved = safeWebGet('setu_current_user');
      if (saved && tokenPayload) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const savedToken = safeWebGet('setu_session_token');
    const payload = decodeJwtPayload(savedToken);
    return Boolean(payload && payload.role === 'ADMIN');
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedToken = safeWebGet('setu_session_token');
    const payload = decodeJwtPayload(savedToken);
    if (!payload) return 'CUSTOMER';
    const savedRole = safeWebGet('setu_current_role') as UserRole | null;
    if (savedRole === 'ADMIN' && payload.role === 'ADMIN') return 'ADMIN';
    if (savedRole === 'CONTRACTOR' && (payload.role === 'CONTRACTOR' || payload.role === 'ADMIN')) return 'CONTRACTOR';
    if (savedRole === 'VENDOR' && (payload.role === 'VENDOR' || payload.role === 'ADMIN')) return 'VENDOR';
    return 'CUSTOMER';
  });
  const [currentLocation, setCurrentLocation] = useState<string>(() => {
    return safeWebGet('setu_current_location') || 'एमपी नगर (ज़ोन-1), भोपाल • 462011';
  });
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showQuickModalDirectly, setShowQuickModalDirectly] = useState<boolean>(false);
  const [showEstimatorDirectly, setShowEstimatorDirectly] = useState<boolean>(false);
  const [showWorkWithUsModal, setShowWorkWithUsModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPartnerRegistrationModal, setShowPartnerRegistrationModal] = useState<boolean>(false);
  const [partnerRegistrationType, setPartnerRegistrationType] = useState<'CONTRACTOR' | 'VENDOR'>('CONTRACTOR');
  const [activeContractorId, setActiveContractorId] = useState<string>(() => {
    try {
      const saved = safeWebGet('setu_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.contractorId) return u.contractorId;
      }
    } catch {}
    return '';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = safeWebGet('setu_lang') as Language | null;
    if (savedLang && ['hi', 'en', 'hinglish'].includes(savedLang)) return savedLang;
    return 'hi';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    safeWebSet('setu_lang', lang);
  };
  const [bottomTab, setBottomTab] = useState<'home' | 'quick' | 'estimator' | 'partner' | 'profile'>('home');

  // Security & Role-Based Access Control State (also supports #admin or ?admin=1 login gate)
  const [showAdminSecurityModal, setShowAdminSecurityModal] = useState<boolean>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location?.hash || '';
      const search = window.location?.search || '';
      return hash.includes('admin') || search.includes('admin=1');
    }
    return false;
  });
  const [isGuestBrowsing, setIsGuestBrowsing] = useState<boolean>(true);

  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(INITIAL_JOB_REQUESTS);

  // Sync auth header and hydrate live backend catalog on mount (non-blocking)
  React.useEffect(() => {
    let cancelled = false;
    const savedToken = safeWebGet('setu_session_token');
    if (savedToken && decodeJwtPayload(savedToken)) {
      ApiService.setAuthToken(savedToken);
    } else if (savedToken) {
      // Clear stale/expired token cleanly
      ApiService.clearAuthToken();
      safeWebRemove('setu_current_user');
      safeWebSet('setu_current_role', 'CUSTOMER');
    }

    (async () => {
      const [liveContractors, liveMaterials] = await Promise.all([
        ApiService.getContractors(),
        ApiService.getMaterials(),
      ]);
      if (cancelled) return;
      if (Array.isArray(liveContractors) && liveContractors.length > 0) {
        setContractors((prev) => {
          const seen = new Set(liveContractors.map((c: any) => c.customId || c.id));
          const normalized = liveContractors.map((c: any) => ({ ...c, id: c.id || c.customId }));
          return [...normalized, ...prev.filter((p) => !seen.has(p.id))];
        });
      }
      if (Array.isArray(liveMaterials) && liveMaterials.length > 0) {
        setMaterials((prev) => {
          const seen = new Set(liveMaterials.map((m: any) => m.customId || m.id));
          const normalized = liveMaterials.map((m: any) => ({ ...m, id: m.id || m.customId }));
          return [...normalized, ...prev.filter((p) => !seen.has(p.id))];
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Contractor updates (updates contractor card + syncs logged-in user identity)
  const handleUpdateContractorProfile = (updatedFields: Partial<Contractor>) => {
    setContractors((prev) =>
      prev.map((c) => (c.id === activeContractorId || (c as any).customId === activeContractorId ? { ...c, ...updatedFields } : c))
    );
    if (currentUser) {
      const nextUser = {
        ...currentUser,
        ...(updatedFields.name ? { name: updatedFields.name } : {}),
        ...(updatedFields.avatar ? { avatarUrl: updatedFields.avatar } : {}),
        ...(updatedFields.specialtyHindi ? { tradeOrShop: updatedFields.specialtyHindi } : {}),
      };
      setCurrentUser(nextUser);
      safeWebSet('setu_current_user', JSON.stringify(nextUser));
    }
  };

  // Vendor updates (optimistic + persistent backend sync)
  const handleUpdateMaterial = async (updatedItem: MaterialItem) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === updatedItem.id ? updatedItem : m))
    );
    if (ApiService.getAuthToken()) {
      await ApiService.updateMaterial(updatedItem.id, {
        mrp: updatedItem.mrp,
        sellingPrice: updatedItem.sellingPrice,
        inStock: updatedItem.inStock,
        bulkOffer: updatedItem.bulkOffer,
        name: updatedItem.name,
      });
    }
  };

  const handleAddNewMaterial = async (newItem: MaterialItem) => {
    setMaterials((prev) => [newItem, ...prev]);
    if (ApiService.getAuthToken()) {
      const res = await ApiService.createMaterial(newItem);
      if (res?.success && res.material) {
        setMaterials((prev) => [
          { ...res.material, id: res.material.id || res.material.customId },
          ...prev.filter((m) => m.id !== newItem.id),
        ]);
      }
    }
  };

  // Partner Registration Handler
  const handlePartnerRegistrationComplete = async (partnerData: any) => {
    const helperCategory = (trade: string) => {
      const tLow = String(trade || '').toLowerCase();
      if (tLow.includes('carpenter') || tLow.includes('बढ़ई')) return 'carpenter';
      if (tLow.includes('टाइल्स') || tLow.includes('tile')) return 'tiling';
      if (tLow.includes('mason') || tLow.includes('मिस्त्री')) return 'mason';
      if (tLow.includes('plumber') || tLow.includes('प्लंबर')) return 'plumber';
      if (tLow.includes('ac') || tLow.includes('एसी')) return 'ac_repair';
      if (tLow.includes('electrician') || tLow.includes('इलेक्ट्रीशियन')) return 'electrician';
      if (tLow.includes('painter') || tLow.includes('पेंटर')) return 'painter';
      if (tLow.includes('टेंट') || tLow.includes('डेकोर')) return 'wedding_tent';
      if (tLow.includes('कैटरर') || tLow.includes('हलवाई')) return 'caterer';
      if (tLow.includes('मेकअप')) return 'wedding_makeup';
      if (tLow.includes('dj') || tLow.includes('डीजे')) return 'event_dj';
      if (tLow.includes('फोटो') || tLow.includes('कैमरा')) return 'wedding_photo';
      return 'general';
    };

    const calculatedCategory = partnerData.category || helperCategory(partnerData.tradeOrShop || '');

    const res = await ApiService.registerPartner({
      ...partnerData,
      category: calculatedCategory,
    });

    if (!res || !res.success) {
      showAppAlert('पंजीकरण त्रुटि', res?.error || 'पार्टनर पंजीकरण सर्वर पर सुरक्षित नहीं हो सका।');
      return false;
    }

    if (res.token) {
      ApiService.setAuthToken(res.token);
    }
    if (res.user) {
      setCurrentUser(res.user);
      safeWebSet('setu_current_user', JSON.stringify(res.user));
      safeSessionSet('setu_session_active', 'true');
    }

    if (partnerData.role === 'CONTRACTOR') {
      const createdId = res.contractor?.customId || res.contractor?.id || `c_${Date.now()}`;
      const newContractor: Contractor = {
        id: createdId,
        name: res.contractor?.name || `${partnerData.name} (${(partnerData.tradeOrShop || '').split(' ')[0]})`,
        category: res.contractor?.category || calculatedCategory,
        specialtyHindi: partnerData.tradeOrShop,
        bio: `${partnerData.name} - SETU पंजीकृत कारीगर (${partnerData.experienceYears || 0} वर्ष का अनुभव)`,
        avatar: partnerData.avatarUrl || '',
        city: partnerData.city || '',
        locality: partnerData.locality || '',
        primaryRateType: partnerData.primaryRateType || partnerData.unitLabel || 'दिहाड़ी',
        dailyWageRate: partnerData.dailyWageRate !== undefined ? partnerData.dailyWageRate : null,
        helperRate: partnerData.helperRate !== undefined ? partnerData.helperRate : null,
        contractUnitRate: partnerData.contractUnitRate !== undefined ? partnerData.contractUnitRate : null,
        unitLabel: partnerData.unitLabel || 'प्रति काम',
        additionalRateCards: partnerData.additionalRateCards || [],
        tradeRateSpec: partnerData.tradeRateSpec || {},
        rating: 0,
        reviewsCount: 0,
        experienceYears: partnerData.experienceYears || 0,
        jobsCompleted: 0,
        verified: false,
        distance: '1.0 km दूर',
        etaMinutes: 20,
        isQuickAvailable: true,
        available: true,
        phoneMasked: partnerData.phone
          ? `+91 ${partnerData.phone.slice(0, 2)}XXX-XX${partnerData.phone.slice(-3)}`
          : '+91 98XXX-XX000',
        skills: [partnerData.tradeOrShop, 'SETU पंजीकृत पार्टनर'],
        portfolioPhotos: partnerData.workPhotoUrl
          ? [
              {
                id: 'p_' + Date.now(),
                title: partnerData.workPhotoTitle || 'हालिया कार्य',
                imageUrl: partnerData.workPhotoUrl,
                date: 'हाल ही में',
                description: 'पार्टनर द्वारा ऑनबोर्डिंग में अपलोड किया गया कार्य।',
              },
            ]
          : [],
        reviews: [],
        recommendedMaterials: contractors[0]?.recommendedMaterials || [],
      };

      setContractors((prev) => [newContractor, ...prev]);
      setActiveContractorId(createdId);
      setCurrentRole('CONTRACTOR');
      safeWebSet('setu_current_role', 'CONTRACTOR');
    } else {
      if (res.material) {
        setMaterials((prev) => [{ ...res.material, id: res.material.id || res.material.customId }, ...prev]);
      }
      setCurrentRole('VENDOR');
      safeWebSet('setu_current_role', 'VENDOR');
    }
    return true;
  };

  // Booking from Customer
  const handleNewBookingCreated = async (bookingDetails: any) => {
    const modeLabel = bookingDetails.bookingMode || bookingDetails.hiringType || 'दिहाड़ी';
    const targetName = bookingDetails.contractorName || bookingDetails.workType || 'ओपन कार्य';
    const workTitle = bookingDetails.workType || `${modeLabel} पर कार्य (${targetName})`;
    const addressText = bookingDetails.workAddress || bookingDetails.location || currentLocation;
    const laborAmount = Math.max(0, Number(bookingDetails.totalLaborAmount ?? bookingDetails.budgetOffer) || 0);

    const newJob: JobRequest = {
      id: bookingDetails.id || 'jr_' + Date.now(),
      customerName: currentUser ? currentUser.name : bookingDetails.customerName || 'ग्राहक',
      workType: workTitle,
      location: addressText,
      date: bookingDetails.date || new Date().toLocaleDateString('hi-IN'),
      hiringType: modeLabel,
      budgetOffer: laborAmount,
      description: bookingDetails.description || 'साइट पर काम का अनुरोध।',
      status: 'PENDING',
    };
    setJobRequests((prev) => [newJob, ...prev]);

    if (!ApiService.getAuthToken()) {
      showAppAlert(
        'अतिथि पूर्वावलोकन (Login Required)',
        'स्थानीय अनुरोध जोड़ा गया है। लाइव डेटाबेस बुकिंग व OTP सुरक्षा के लिए कृपया मोबाइल नंबर से लॉगिन करें।'
      );
      return;
    }

    const res = await ApiService.createBooking({
      customerName: newJob.customerName,
      contractorName: targetName,
      contractorId: bookingDetails.contractorId || 'c1',
      category: bookingDetails.category || '',
      workType: workTitle,
      workAddress: addressText,
      bookingMode: ['दिहाड़ी', 'ठेका', 'क्विक रिपेयर', 'भाव_पूछें'].includes(modeLabel) ? modeLabel : 'दिहाड़ी',
      paymentMethod: bookingDetails.paymentMethod || 'CASH',
      totalLaborAmount: laborAmount,
      finalMaterialAmount: Math.max(0, Number(bookingDetails.finalMaterialAmount) || 0),
      escrowAdvanceToken: bookingDetails.escrowAdvanceToken || 0,
      description: newJob.description,
      strictValidation: Boolean(bookingDetails.strictValidation),
      workMeasurementSpec: bookingDetails.workMeasurementSpec || null,
    });
    if (res && !res.success && res.status === 401) {
      showAppAlert('लॉगिन आवश्यक', 'कृपया लाइव बुकिंग सेव करने के लिए पुनः लॉगिन करें।');
    }
  };

  const handleUpdateJobRequestStatus = (jobId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setJobRequests((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    showAppAlert(
      newStatus === 'ACCEPTED' ? '✅ कार्य स्वीकृत हुआ' : 'कार्य अस्वीकृत',
      newStatus === 'ACCEPTED'
        ? 'ग्राहक को सूचना भेज दी गई है। एस्क्रो टोकन कन्फर्म हो गया है।'
        : 'अनुरोध रद्द कर दिया गया है।'
    );
  };

  // Role-Based Access Control (RBAC): "जिसकी जो ID है, उसी से खुले"
  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    if (user?.contractorId) setActiveContractorId(user.contractorId);
    if (user?.location) {
      setCurrentLocation(user.location);
      safeWebSet('setu_current_location', user.location);
    }

    // Persist login session on Web
    safeWebSet('setu_current_user', JSON.stringify(user));
    safeWebSet('setu_current_role', user.role || 'CUSTOMER');
    safeSessionSet('setu_session_active', 'true');

    if (user.role === 'CONTRACTOR') {
      setCurrentRole('CONTRACTOR');
      showAppAlert(
        '👷 कारीगर पोर्टल खुला',
        `नमस्ते ${user.name}!\nआपकी कारीगर ID: ${user.setuId} सक्रिय है। सीधे आपका कारीगर डैशबोर्ड खुल गया है।`
      );
    } else if (user.role === 'VENDOR') {
      setCurrentRole('VENDOR');
      showAppAlert(
        '🏪 दुकानदार पोर्टल खुला',
        `नमस्ते ${user.name}!\nआपकी सप्लायर ID: ${user.setuId} सक्रिय है। सीधे आपका सप्लायर डैशबोर्ड खुल गया है।`
      );
    } else if (user.role === 'ADMIN') {
      setIsAdminAuthenticated(true);
      setCurrentRole('ADMIN');
      showAppAlert(
        '🛡️ सुपर एडमिन नियंत्रण कक्ष',
        `नमस्ते ${user.name}!\nएडमिन ID: ${user.setuId} से केंद्रीय नियंत्रण कक्ष खुल गया है।`
      );
    } else {
      setCurrentRole('CUSTOMER');
    }
  };

  const handleLogout = () => {
    ApiService.clearAuthToken();
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    setCurrentRole('CUSTOMER');
    setIsGuestBrowsing(false);
    setShowProfileModal(false);
    setShowWorkWithUsModal(false);
    setShowPartnerRegistrationModal(false);
    setShowAdminSecurityModal(false);
    setBottomTab('home');

    safeSessionRemove('setu_session_active');
    safeWebRemove('setu_current_user');
    safeWebRemove('setu_session_token');
    safeWebSet('setu_current_role', 'CUSTOMER');
    safeWebRemove('setu_active_contractor_detail');
    safeWebRemove('setu_active_contractor_booking');
    showAppAlert('लॉगआउट', 'आप सफलतापूर्वक लॉगआउट हो गए हैं।');
  };

  const handleRoleSwitch = (role: UserRole) => {
    if (role === 'ADMIN') {
      const tokenPayload = decodeJwtPayload(ApiService.getAuthToken());
      if (isAdminAuthenticated && tokenPayload?.role === 'ADMIN') {
        setCurrentRole('ADMIN');
        safeWebSet('setu_current_role', 'ADMIN');
      } else {
        setShowAdminSecurityModal(true);
      }
      return;
    }

    if (role === 'CONTRACTOR') {
      if (currentUser && (currentUser.role === 'CONTRACTOR' || currentUser.role === 'ADMIN')) {
        setCurrentRole('CONTRACTOR');
        safeWebSet('setu_current_role', 'CONTRACTOR');
      } else {
        showAppAlert(
          '🔒 कारीगर ID आवश्यक',
          `यह पोर्टल केवल अधिकृत कारीगरों के लिए है। आपका वर्तमान खाता '${currentUser ? currentUser.name : 'अतिथि'}' है।\n\nकृपया कारीगर ID से लॉगिन करें अथवा ऑनबोर्डिंग फॉर्म भरें।`,
          [
            {
              text: 'कारीगर ऑनबोर्डिंग भरें',
              onPress: () => {
                setPartnerRegistrationType('CONTRACTOR');
                setShowWorkWithUsModal(false);
                setShowPartnerRegistrationModal(true);
              },
            },
            { text: 'रद्द करें', style: 'cancel' },
          ]
        );
      }
      return;
    }

    if (role === 'VENDOR') {
      if (currentUser && (currentUser.role === 'VENDOR' || currentUser.role === 'ADMIN')) {
        setCurrentRole('VENDOR');
        safeWebSet('setu_current_role', 'VENDOR');
      } else {
        showAppAlert(
          '🔒 दुकानदार ID आवश्यक',
          `यह पोर्टल केवल अधिकृत सामग्री सप्लायर्स के लिए है।\n\nकृपया सेलर ID से लॉगिन करें अथवा सप्लायर ऑनबोर्डिंग फॉर्म भरें।`,
          [
            {
              text: 'सप्लायर ऑनबोर्डिंग भरें',
              onPress: () => {
                setPartnerRegistrationType('VENDOR');
                setShowWorkWithUsModal(false);
                setShowPartnerRegistrationModal(true);
              },
            },
            { text: 'रद्द करें', style: 'cancel' },
          ]
        );
      }
      return;
    }

    setCurrentRole('CUSTOMER');
    safeWebSet('setu_current_role', 'CUSTOMER');
  };

  const handleBottomTabPress = (tab: 'home' | 'quick' | 'estimator' | 'partner' | 'profile') => {
    setBottomTab(tab);
    if (tab === 'quick') {
      setShowQuickModalDirectly(true);
    } else if (tab === 'estimator') {
      setShowEstimatorDirectly(true);
    } else if (tab === 'partner') {
      setShowWorkWithUsModal(true);
    } else if (tab === 'profile') {
      setShowProfileModal(true);
    }
  };

  // 🚪 0. APP OPENS WITH LOGIN SCREEN FIRST (If not logged in & not guest)
  if (!currentUser && !isGuestBrowsing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A', paddingTop: Platform.OS === 'web' ? 14 : 0 }}>
        <StatusBar barStyle="light-content" />
        <AuthLandingScreen
          language={language}
          onToggleLanguage={handleSetLanguage}
          onLoginSuccess={(user) => {
            safeSessionSet('setu_session_active', 'true');
            safeWebSet('setu_current_user', JSON.stringify(user));
            setCurrentUser(user);
            if (user.role === 'CONTRACTOR') setCurrentRole('CONTRACTOR');
            else if (user.role === 'VENDOR') setCurrentRole('VENDOR');
            else if (user.role === 'ADMIN') {
              setIsAdminAuthenticated(true);
              setCurrentRole('ADMIN');
            } else setCurrentRole('CUSTOMER');
          }}
          onContinueAsGuest={() => setIsGuestBrowsing(true)}
          onRequestAdmin={() => setShowAdminSecurityModal(true)}
        />
        <AdminSecurityModal
          visible={showAdminSecurityModal}
          onClose={() => setShowAdminSecurityModal(false)}
          onSuccess={(token) => {
            const adminUser = { id: 'admin1', name: 'मुख्य व्यवस्थापक (Super Admin)', role: 'ADMIN', setuId: 'SETU-ADMIN-MASTER' };
            setIsAdminAuthenticated(true);
            ApiService.setAdminToken(token);
            setCurrentRole('ADMIN');
            setCurrentUser(adminUser);
            safeWebSet('setu_current_user', JSON.stringify(adminUser));
            safeWebSet('setu_current_role', 'ADMIN');
            safeWebSet('setu_session_token', token);
            safeSessionSet('setu_session_active', 'true');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* When in Partner Portals (Contractor, Vendor, Admin), show an easy Back to Customer Home banner */}
      {currentRole !== 'CUSTOMER' ? (
        <View style={styles.partnerTopBanner}>
          <View style={[styles.partnerTopBannerInner, shellStyle]}>
            <TouchableOpacity
              style={styles.backToCustomerBtn}
              onPress={() => {
                setCurrentRole('CUSTOMER');
                safeWebSet('setu_current_role', 'CUSTOMER');
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={[styles.backToCustomerText, isCompactPhone && { fontSize: 11 }]}>
                {isCompactPhone
                  ? (language === 'hi' ? 'ग्राहक होम' : 'Customer Home')
                  : (language === 'hi'
                    ? 'ग्राहक ऐप पर वापस जाएँ (Customer Home)'
                    : 'Switch to Customer Shopping App')}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <View style={[styles.partnerRoleTag, currentRole === 'ADMIN' && { backgroundColor: '#DC2626' }]}>
                <Text style={styles.partnerRoleTagText}>
                  {currentRole === 'CONTRACTOR'
                    ? (language === 'hi' ? '👷 कारीगर पोर्टल' : 'Contractor Portal')
                    : currentRole === 'VENDOR'
                    ? (language === 'hi' ? '🏪 दुकानदार पोर्टल' : 'Vendor Portal')
                    : (language === 'hi' ? '🛡️ एडमिन हब' : 'Admin Hub')}
                </Text>
              </View>
              {currentRole === 'ADMIN' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#7F1D1D',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onPress={() => {
                    ApiService.clearAuthToken();
                    setIsAdminAuthenticated(false);
                    if (currentUser?.role === 'ADMIN') {
                      setCurrentUser(null);
                      safeWebRemove('setu_current_user');
                    }
                    safeWebRemove('setu_session_token');
                    setCurrentRole('CUSTOMER');
                    safeWebSet('setu_current_role', 'CUSTOMER');
                    showAppAlert('🔒 एडमिन सत्र समाप्त', 'केंद्रीय नियंत्रण कक्ष को सुरक्षित लॉक कर दिया गया है।');
                  }}
                >
                  <MaterialIcons name="lock" size={12} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>लॉक करें</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        /* STANDARD CUSTOMER HEADER */
        <Header
          currentLocation={currentLocation}
          onLocationPress={() => setShowLocationPicker(true)}
          onQuickModePress={() => setShowQuickModalDirectly(true)}
          onOpenWorkWithUs={() => setShowWorkWithUsModal(true)}
          onOpenProfile={() => {
            if (!currentUser) {
              setIsGuestBrowsing(false);
            } else {
              setShowProfileModal(true);
            }
          }}
          onLogout={handleLogout}
          user={currentUser}
          language={language}
          onToggleLanguage={() => handleSetLanguage(language === 'hi' ? 'en' : language === 'en' ? 'hinglish' : 'hi')}
          onSelectLanguage={handleSetLanguage}
          activeTab={bottomTab}
          onTabPress={handleBottomTabPress}
        />
      )}

      {/* Main Dynamic View */}
      <View
        style={[
          styles.screenContainer,
          isTabletOrDesktop && { backgroundColor: '#EFF3F8' },
        ]}
      >
        {/* 1. DEFAULT: CUSTOMER SHOPPING & BOOKING EXPERIENCE */}
        {currentRole === 'CUSTOMER' && (
          <CustomerHome
            contractors={contractors}
            materials={materials}
            currentLocation={currentLocation}
            isLocationPickerOpen={showLocationPicker}
            onOpenLocationPicker={() => setShowLocationPicker(true)}
            onNewBookingCreated={handleNewBookingCreated}
            showQuickModalDirectly={showQuickModalDirectly}
            onCloseQuickModalDirectly={() => setShowQuickModalDirectly(false)}
            showEstimatorDirectly={showEstimatorDirectly}
            onCloseEstimatorDirectly={() => setShowEstimatorDirectly(false)}
            language={language}
          />
        )}

        {/* 2. CONTRACTOR / WORKER DASHBOARD */}
        {currentRole === 'CONTRACTOR' && (() => {
          const matchedPro = contractors.find(
            (c) =>
              (activeContractorId && (c.id === activeContractorId || (c as any).customId === activeContractorId)) ||
              (currentUser?.contractorId && (c.id === currentUser.contractorId || (c as any).customId === currentUser.contractorId)) ||
              (c.phone && currentUser?.phone && c.phone === currentUser.phone)
          );
          if (!matchedPro) {
            return (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>
                  आपकी कारीगर प्रोफाइल अभी तैयार नहीं हुई है
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 14 }}>
                  अपनी असली प्रोफाइल, फोटो व रेट कार्ड जोड़ने के लिए ऑनबोर्डिंग पूरा करें।
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
                  onPress={() => {
                    setPartnerRegistrationType('CONTRACTOR');
                    setShowPartnerRegistrationModal(true);
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                    👷 अपनी कारीगर ID बनाएं ➔
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <ContractorDashboard
              contractor={matchedPro}
              onUpdateContractorProfile={handleUpdateContractorProfile}
              jobRequests={jobRequests}
              onUpdateJobRequestStatus={handleUpdateJobRequestStatus}
              language={language}
            />
          );
        })()}

        {/* 3. MATERIAL VENDOR / SHOPKEEPER DASHBOARD */}
        {currentRole === 'VENDOR' && (
          <VendorDashboard
            materials={materials}
            vendorId={currentUser?.vendorId || currentUser?.setuId || 'v1'}
            vendorName={currentUser?.tradeOrShop || currentUser?.name}
            language={language}
            onUpdateMaterial={handleUpdateMaterial}
            onAddNewMaterial={handleAddNewMaterial}
          />
        )}

        {/* 4. SUPER ADMIN CONTROL DASHBOARD */}
        {currentRole === 'ADMIN' && isAdminAuthenticated && (
          <AdminDashboard language={language} />
        )}
      </View>

      {/* 5. Sleek Mobile Bottom Navigation Bar for Customer */}
      {currentRole === 'CUSTOMER' && (
        <BottomNavBar
          language={language}
          activeTab={bottomTab}
          onTabPress={handleBottomTabPress}
        />
      )}

      {/* Work With Us (Become a Partner) Modal */}
      <WorkWithUsModal
        visible={showWorkWithUsModal}
        currentUser={currentUser}
        language={language}
        onClose={() => {
          setShowWorkWithUsModal(false);
          setBottomTab('home');
        }}
        onOpenPartnerRegistration={(type) => {
          setPartnerRegistrationType(type);
          setShowWorkWithUsModal(false);
          setShowPartnerRegistrationModal(true);
        }}
        onSelectPartnerRole={handleRoleSwitch}
      />

      {/* SETU Multi-Step Partner Onboarding Modal */}
      <PartnerRegistrationModal
        key={`${partnerRegistrationType}-${showPartnerRegistrationModal ? 'open' : 'closed'}`}
        visible={showPartnerRegistrationModal}
        initialType={partnerRegistrationType}
        language={language}
        onClose={() => setShowPartnerRegistrationModal(false)}
        onRegistrationComplete={handlePartnerRegistrationComplete}
      />

      {/* Customer Profile & Rewards (Points) Modal */}
      <CustomerProfileModal
        visible={showProfileModal}
        user={currentUser}
        onClose={() => {
          setShowProfileModal(false);
          setBottomTab('home');
        }}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenWorkWithUs={() => setShowWorkWithUsModal(true)}
        currentLocation={currentLocation}
        onLocationUpdate={(loc) => {
          setCurrentLocation(loc);
          safeWebSet('setu_current_location', loc);
        }}
        language={language}
      />

      {/* Super Admin Master Security Gate Modal */}
      <AdminSecurityModal
        visible={showAdminSecurityModal}
        onClose={() => setShowAdminSecurityModal(false)}
        onSuccess={(token) => {
          const adminUser = { id: 'admin1', name: 'मुख्य व्यवस्थापक (Super Admin)', role: 'ADMIN', setuId: 'SETU-ADMIN-MASTER' };
          setIsAdminAuthenticated(true);
          ApiService.setAdminToken(token);
          setCurrentRole('ADMIN');
          setCurrentUser(adminUser);
          safeWebSet('setu_current_user', JSON.stringify(adminUser));
          safeWebSet('setu_current_role', 'ADMIN');
          safeWebSet('setu_session_token', token);
          safeSessionSet('setu_session_active', 'true');
        }}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        currentLocation={currentLocation}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          safeWebSet('setu_current_location', loc);
          showAppAlert('📍 लोकेशन अपडेट हुई', `अब आपको ${loc} के पास के कारीगर और दुकानें दिखेंगी।`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : (Platform.OS === 'web' ? 12 : 0),
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  partnerTopBanner: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  partnerTopBannerInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backToCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToCustomerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  partnerRoleTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  partnerRoleTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
