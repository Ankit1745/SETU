import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
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

export type UserRole = 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('CUSTOMER');
  const [currentLocation, setCurrentLocation] = useState<string>('एमपी नगर (ज़ोन-1), भोपाल • 462011');
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showQuickModalDirectly, setShowQuickModalDirectly] = useState<boolean>(false);
  const [showEstimatorDirectly, setShowEstimatorDirectly] = useState<boolean>(false);
  const [showWorkWithUsModal, setShowWorkWithUsModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPartnerRegistrationModal, setShowPartnerRegistrationModal] = useState<boolean>(false);
  const [partnerRegistrationType, setPartnerRegistrationType] = useState<'CONTRACTOR' | 'VENDOR'>('CONTRACTOR');
  const [activeContractorId, setActiveContractorId] = useState<string>('c1');
  const [language, setLanguage] = useState<Language>('hi');
  const [bottomTab, setBottomTab] = useState<'home' | 'quick' | 'estimator' | 'partner' | 'profile'>('home');

  // Security & Role-Based Access Control State
  const [showAdminSecurityModal, setShowAdminSecurityModal] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Single Logged in User (Guest initially allows browsing marketplace without phone OTP)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState<boolean>(true);

  // Check saved session
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const sessionActive = window.sessionStorage?.getItem('setu_session_active');
        if (!sessionActive) {
          // Fresh visit: show OTP login & registration screen first
          window.localStorage?.removeItem('setu_current_user');
          setCurrentUser(null);
          setIsGuestBrowsing(false);
        } else {
          const saved = window.localStorage?.getItem('setu_current_user');
          if (saved) {
            const user = JSON.parse(saved);
            setCurrentUser(user);
            if (user.role === 'CONTRACTOR') setCurrentRole('CONTRACTOR');
            else if (user.role === 'VENDOR') setCurrentRole('VENDOR');
            else if (user.role === 'ADMIN') {
              setIsAdminAuthenticated(true);
              setCurrentRole('ADMIN');
            }
            if (user.location) setCurrentLocation(user.location);
          }
        }
      } catch (e) {
        console.error('[SETU] Session init error:', e);
      }
    }
  }, []);

  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(INITIAL_JOB_REQUESTS);

  // Contractor updates
  const handleUpdateContractorProfile = (updatedFields: Partial<Contractor>) => {
    setContractors((prev) =>
      prev.map((c) => (c.id === activeContractorId ? { ...c, ...updatedFields } : c))
    );
  };

  // Vendor updates
  const handleUpdateMaterial = (updatedItem: MaterialItem) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === updatedItem.id ? updatedItem : m))
    );
  };

  const handleAddNewMaterial = (newItem: MaterialItem) => {
    setMaterials((prev) => [newItem, ...prev]);
  };

  // Partner Registration Handler (Urban Company / Amazon Seller Onboarding)
  const handlePartnerRegistrationComplete = (partnerData: any) => {
    const helperCategory = (trade: string) => {
      if (trade.includes('Carpenter') || trade.includes('बढ़ई')) return 'carpenter';
      if (trade.includes('Mason') || trade.includes('मिस्त्री') || trade.includes('टाइल्स')) return 'mason';
      if (trade.includes('Plumber') || trade.includes('प्लंबर')) return 'plumber';
      if (trade.includes('Electrician') || trade.includes('इलेक्ट्रीशियन')) return 'electrician';
      if (trade.includes('Painter') || trade.includes('पेंटर')) return 'painter';
      if (trade.includes('AC') || trade.includes('एसी')) return 'electrician';
      if (trade.includes('टेंट') || trade.includes('कैटरर')) return 'wedding_tent';
      if (trade.includes('मेकअप')) return 'wedding_makeup';
      if (trade.includes('DJ') || trade.includes('डीजे')) return 'event_dj';
      if (trade.includes('फोटो') || trade.includes('कैमरा')) return 'wedding_photo';
      return 'carpenter';
    };

    const calculatedCategory = helperCategory(partnerData.tradeOrShop || '');

    // Notify backend REST API with correct category
    ApiService.registerPartner({
      ...partnerData,
      category: calculatedCategory,
    }).then((res) => {
      if (res && res.token) {
        ApiService.setAuthToken(res.token);
      }
      if (res && res.user) {
        setCurrentUser(res.user);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage?.setItem('setu_current_user', JSON.stringify(res.user));
          window.sessionStorage?.setItem('setu_session_active', 'true');
        }
      }
    }).catch((err) => {
      console.log('[App] registerPartner error:', err);
    });

    if (partnerData.role === 'CONTRACTOR') {
      const newContractor: Contractor = {
        id: 'c_' + Date.now(),
        name: `${partnerData.name} (${(partnerData.tradeOrShop || '').split(' ')[0]})`,
        category: calculatedCategory,
        specialtyHindi: partnerData.tradeOrShop,
        bio: `${partnerData.name} - SETU पंजीकृत कारीगर (${partnerData.experienceYears || 0} वर्ष का अनुभव)`,
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
        rating: 0, // Starts with 0 rating
        reviewsCount: 0, // Starts with 0 reviews
        experienceYears: partnerData.experienceYears || 0,
        jobsCompleted: 0,
        verified: false, // Pending KYC approval from Admin
        distance: '',
        etaMinutes: null as any,
        isQuickAvailable: true,
        primaryRateType: partnerData.unitLabel || 'दिहाड़ी',
        dailyWageRate: partnerData.dailyWageRate !== undefined ? partnerData.dailyWageRate : null,
        helperRate: partnerData.helperRate !== undefined ? partnerData.helperRate : null,
        contractUnitRate: partnerData.contractUnitRate !== undefined ? partnerData.contractUnitRate : null,
        unitLabel: partnerData.unitLabel || 'प्रति काम',
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
      setActiveContractorId(newContractor.id);
      setCurrentRole('CONTRACTOR');
    } else {
      // Vendor
      setCurrentRole('VENDOR');
    }
  };

  // Booking from Customer
  const handleNewBookingCreated = (bookingDetails: any) => {
    const newJob: JobRequest = {
      id: 'jr_' + Date.now(),
      customerName: currentUser ? currentUser.name : 'अमित कुमार सिंह',
      workType: `${bookingDetails.bookingMode} पर कार्य (${bookingDetails.contractorName})`,
      location: bookingDetails.workAddress || currentLocation,
      date: bookingDetails.date || new Date().toLocaleDateString('hi-IN'),
      hiringType: bookingDetails.bookingMode,
      budgetOffer: bookingDetails.totalLaborAmount,
      description: bookingDetails.description || 'साइट पर काम का अनुरोध।',
      status: 'PENDING',
    };
    setJobRequests((prev) => [newJob, ...prev]);

    // Persist booking to backend REST API
    ApiService.createBooking({
      customerName: newJob.customerName,
      contractorName: bookingDetails.contractorName,
      contractorId: bookingDetails.contractorId,
      workType: newJob.workType,
      workAddress: newJob.location,
      bookingMode: bookingDetails.bookingMode,
      paymentMethod: bookingDetails.paymentMethod,
      totalLaborAmount: bookingDetails.totalLaborAmount,
      escrowAdvanceToken: bookingDetails.escrowAdvanceToken,
      description: newJob.description,
    });
  };

  const handleUpdateJobRequestStatus = (jobId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setJobRequests((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    Alert.alert(
      newStatus === 'ACCEPTED' ? '✅ कार्य स्वीकृत हुआ' : 'कार्य अस्वीकृत',
      newStatus === 'ACCEPTED'
        ? 'ग्राहक को सूचना भेज दी गई है। एस्क्रो टोकन कन्फर्म हो गया है।'
        : 'अनुरोध रद्द कर दिया गया है।'
    );
  };

  // Role-Based Access Control (RBAC): "जिसकी जो ID है, उसी से खुले"
  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);

    // Persist login session on Web
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('setu_current_user', JSON.stringify(user));
    }

    if (user.role === 'CONTRACTOR') {
      setCurrentRole('CONTRACTOR');
      Alert.alert(
        '👷 कारीगर पोर्टल खुला',
        `नमस्ते ${user.name}!\nआपकी कारीगर ID: ${user.setuId} सक्रिय है। सीधे आपका कारीगर डैशबोर्ड खुल गया है।`
      );
    } else if (user.role === 'VENDOR') {
      setCurrentRole('VENDOR');
      Alert.alert(
        '🏪 दुकानदार पोर्टल खुला',
        `नमस्ते ${user.name}!\nआपकी सप्लायर ID: ${user.setuId} सक्रिय है। सीधे आपका सप्लायर डैशबोर्ड खुल गया है।`
      );
    } else if (user.role === 'ADMIN') {
      setIsAdminAuthenticated(true);
      setCurrentRole('ADMIN');
      Alert.alert(
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

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.sessionStorage?.removeItem('setu_session_active');
      window.localStorage?.removeItem('setu_current_user');
      window.localStorage?.removeItem('setu_session_token');
    }
    Alert.alert('लॉगआउट', 'आप सफलतापूर्वक लॉगआउट हो गए हैं।');
  };

  const handleRoleSwitch = (role: UserRole) => {
    if (role === 'ADMIN') {
      if (isAdminAuthenticated) {
        setCurrentRole('ADMIN');
      } else {
        setShowAdminSecurityModal(true);
      }
      return;
    }

    if (role === 'CONTRACTOR') {
      if (
        currentUser &&
        (currentUser.role === 'CONTRACTOR' ||
          currentUser.setuId?.includes('PRO') ||
          currentUser.setuId?.includes('ADM'))
      ) {
        setCurrentRole('CONTRACTOR');
      } else {
        Alert.alert(
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
      if (
        currentUser &&
        (currentUser.role === 'VENDOR' ||
          currentUser.setuId?.includes('VEN') ||
          currentUser.setuId?.includes('ADM'))
      ) {
        setCurrentRole('VENDOR');
      } else {
        Alert.alert(
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
          onToggleLanguage={(lang) => setLanguage(lang)}
          onLoginSuccess={(user) => {
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.sessionStorage?.setItem('setu_session_active', 'true');
              window.localStorage?.setItem('setu_current_user', JSON.stringify(user));
            }
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
            setIsAdminAuthenticated(true);
            ApiService.setAdminToken(token);
            setCurrentRole('ADMIN');
            setCurrentUser({ id: 'admin1', name: 'मुख्य व्यवस्थापक (Super Admin)', role: 'ADMIN' });
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
          <TouchableOpacity
            style={styles.backToCustomerBtn}
            onPress={() => setCurrentRole('CUSTOMER')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={styles.backToCustomerText}>
              {language === 'hi'
                ? '← वापस ग्राहक ऐप पर जाएँ (Customer Home)'
                : '← Switch to Customer Shopping App'}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                  setIsAdminAuthenticated(false);
                  setCurrentRole('CUSTOMER');
                  Alert.alert('🔒 एडमिन सत्र समाप्त', 'केंद्रीय नियंत्रण कक्ष को सुरक्षित लॉक कर दिया गया है।');
                }}
              >
                <MaterialIcons name="lock" size={12} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>लॉक करें</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        /* STANDARD CUSTOMER E-COMMERCE HEADER (Like Flipkart / Urban Company) */
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
          onToggleLanguage={() => setLanguage((prev) => (prev === 'hi' ? 'en' : prev === 'en' ? 'hinglish' : 'hi'))}
        />
      )}

      {/* Main Dynamic View */}
      <View style={styles.screenContainer}>
        {/* 1. DEFAULT: CUSTOMER SHOPPING & BOOKING EXPERIENCE */}
        {currentRole === 'CUSTOMER' && (
          <CustomerHome
            contractors={contractors}
            currentLocation={currentLocation}
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
        {currentRole === 'CONTRACTOR' && (
          <ContractorDashboard
            contractor={contractors.find((c) => c.id === activeContractorId) || contractors[0]}
            onUpdateContractorProfile={handleUpdateContractorProfile}
            jobRequests={jobRequests}
            onUpdateJobRequestStatus={handleUpdateJobRequestStatus}
          />
        )}

        {/* 3. MATERIAL VENDOR / SHOPKEEPER DASHBOARD */}
        {currentRole === 'VENDOR' && (
          <VendorDashboard
            materials={materials}
            onUpdateMaterial={handleUpdateMaterial}
            onAddNewMaterial={handleAddNewMaterial}
          />
        )}

        {/* 4. SUPER ADMIN CONTROL DASHBOARD */}
        {currentRole === 'ADMIN' && (
          <AdminDashboard />
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

      {/* Work With Us (Become a Partner) Modal with Strict Role Checks */}
      <WorkWithUsModal
        visible={showWorkWithUsModal}
        currentUser={currentUser}
        onClose={() => setShowWorkWithUsModal(false)}
        onOpenPartnerRegistration={(type) => {
          setPartnerRegistrationType(type);
          setShowWorkWithUsModal(false);
          setShowPartnerRegistrationModal(true);
        }}
        onSelectPartnerRole={handleRoleSwitch}
        onRequestAdminAuth={() => setShowAdminSecurityModal(true)}
      />

      {/* Urban Company / Amazon Seller Multi-Step Partner Registration Modal */}
      <PartnerRegistrationModal
        visible={showPartnerRegistrationModal}
        initialType={partnerRegistrationType}
        onClose={() => setShowPartnerRegistrationModal(false)}
        onRegistrationComplete={handlePartnerRegistrationComplete}
      />

      {/* Customer Profile & Rewards (Points) Modal */}
      <CustomerProfileModal
        visible={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenWorkWithUs={() => setShowWorkWithUsModal(true)}
        currentLocation={currentLocation}
        onLocationUpdate={(loc) => setCurrentLocation(loc)}
        language={language}
      />

      {/* Super Admin Master Security Gate Modal */}
      <AdminSecurityModal
        visible={showAdminSecurityModal}
        onClose={() => setShowAdminSecurityModal(false)}
        onSuccess={(token) => {
          setIsAdminAuthenticated(true);
          ApiService.setAdminToken(token);
          setCurrentRole('ADMIN');
        }}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        currentLocation={currentLocation}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          Alert.alert('📍 लोकेशन अपडेट हुई', `अब आपको ${loc} के पास के कारीगर और दुकानें दिखेंगी।`);
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
