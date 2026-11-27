import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface WorkWithUsModalProps {
  visible: boolean;
  currentUser?: any;
  language?: Language;
  onClose: () => void;
  onOpenPartnerRegistration: (type: 'CONTRACTOR' | 'VENDOR') => void;
  onSelectPartnerRole: (role: 'CONTRACTOR' | 'VENDOR' | 'ADMIN') => void;
}

export const WorkWithUsModal: React.FC<WorkWithUsModalProps> = ({
  visible,
  currentUser,
  language = 'hi',
  onClose,
  onOpenPartnerRegistration,
  onSelectPartnerRole,
}) => {
  const isEn = language === 'en';
  const handleOpenContractorDashboard = () => {
    if (currentUser && (currentUser.role === 'CONTRACTOR' || currentUser.role === 'ADMIN')) {
      onClose();
      onSelectPartnerRole('CONTRACTOR');
    } else {
      showAppAlert(
        isEn ? '🔒 Contractor ID Required' : '🔒 कारीगर ID आवश्यक',
        isEn
          ? 'Only authorized contractors can open this portal. Please complete Contractor Onboarding first.'
          : `आप वर्तमान में ${currentUser ? `ग्राहक (${currentUser.name})` : 'अतिथि (Guest)'} के रूप में हैं।\n\nठेकेदार डैशबोर्ड में केवल अधिकृत कारीगर ही प्रवेश कर सकते हैं। कृपया पहले 'कारीगर ऑनबोर्डिंग' फॉर्म भरें।`,
        [
          {
            text: isEn ? 'Open Onboarding' : 'कारीगर ऑनबोर्डिंग भरें',
            onPress: () => {
              onClose();
              onOpenPartnerRegistration('CONTRACTOR');
            },
          },
          { text: isEn ? 'Cancel' : 'रद्द करें', style: 'cancel' },
        ]
      );
    }
  };

  const handleOpenVendorDashboard = () => {
    if (currentUser && (currentUser.role === 'VENDOR' || currentUser.role === 'ADMIN')) {
      onClose();
      onSelectPartnerRole('VENDOR');
    } else {
      showAppAlert(
        isEn ? '🔒 Vendor ID Required' : '🔒 सप्लायर ID आवश्यक',
        isEn
          ? 'Only authorized material suppliers can open this portal. Please complete Supplier Onboarding first.'
          : `आप वर्तमान में ${currentUser ? `ग्राहक (${currentUser.name})` : 'अतिथि (Guest)'} के रूप में हैं।\n\nदुकानदार डैशबोर्ड में प्रवेश के लिए अधिकृत सेलर ID आवश्यक है। कृपया पहले सप्लायर ऑनबोर्डिंग फॉर्म भरें।`,
        [
          {
            text: isEn ? 'Open Onboarding' : 'सप्लायर ऑनबोर्डिंग भरें',
            onPress: () => {
              onClose();
              onOpenPartnerRegistration('VENDOR');
            },
          },
          { text: isEn ? 'Cancel' : 'रद्द करें', style: 'cancel' },
        ]
      );
    }
  };
  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({ maxWidth: 660 });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.headerTitle}>
                {isEn ? 'SETU Partner Network (Work with Us)' : 'SETU पार्टनर नेटवर्क (Work with Us)'}
              </Text>
              <Text style={styles.headerSub}>
                {isEn
                  ? 'Register your craft or material store directly on SETU'
                  : 'अपने हुनर या निर्माण सामग्री स्टोर को सीधे SETU से जोड़ें'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Promo Banner */}
            <View style={styles.promoCard}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>ऑफर: पहले 30 दिन शून्य ऑनबोर्डिंग शुल्क</Text>
              </View>
              <Text style={styles.promoTitle}>अपने हुनर और दुकान को दें डिजिटल उड़ान</Text>
              <Text style={styles.promoDesc}>
                भोपाल, इंदौर और पूरे मध्य प्रदेश में 50,000+ ग्राहक रोज़ाना सत्यापित कारीगर और निर्माण सामग्री खोज रहे हैं।
              </Text>
            </View>

            {/* Partner Option 1: Contractor / Worker Registration Wizard */}
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.88}
              onPress={() => {
                onClose();
                onOpenPartnerRegistration('CONTRACTOR');
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="hammer-wrench" size={28} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>1. कुशल कारीगर / ठेकेदार बनें</Text>
                  <Text style={styles.badgePro}>सत्यापित कारीगर पार्टनर</Text>
                </View>
                <Text style={styles.cardDesc}>
                  कारपेंटर, राजमिस्त्री, प्लंबर, इलेक्ट्रीशियन, पेंटर, AC रिपेयर, शादी टेंट व कैटरर।
                </Text>
                <View style={styles.perksRow}>
                  <Text style={styles.perkItem}>✓ 5-चरणीय प्रोफेशनल ऑनबोर्डिंग</Text>
                  <Text style={styles.perkItem}>✓ आधार KYC & डिजिटल SETU ID</Text>
                  <Text style={styles.perkItem}>✓ अपना रेट-कार्ड खुद तय करें</Text>
                </View>
                <View style={styles.actionRow}>
                  <Text style={styles.actionText}>कारीगर ऑनबोर्डिंग फॉर्म भरें (5 Min) ➔</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Partner Option 2: Material Supplier / Vendor Registration Wizard */}
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.88}
              onPress={() => {
                onClose();
                onOpenPartnerRegistration('VENDOR');
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                <MaterialCommunityIcons name="storefront-outline" size={28} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>2. मटेरियल सप्लायर बनें (दुकानदार)</Text>
                  <Text style={styles.badgeVendor}>सत्यापित स्टोर पार्टनर</Text>
                </View>
                <Text style={styles.cardDesc}>
                  सीमेंट, सरिया, प्लाईवुड, फेविकोल, हार्डवेयर, CPVC पाइप्स, पेंट्स, टेंट फैब्रिक।
                </Text>
                <View style={styles.perksRow}>
                  <Text style={styles.perkItem}>✓ GST / उद्यम सेलर रजिस्ट्रेशन</Text>
                  <Text style={styles.perkItem}>✓ लोकल साइट्स से सीधे बल्क ऑर्डर</Text>
                  <Text style={styles.perkItem}>✓ सेलिंग रेट & छूट खुद सेट करें</Text>
                </View>
                <View style={styles.actionRow}>
                  <Text style={[styles.actionText, { color: COLORS.secondary }]}>
                    सप्लायर रजिस्ट्रेशन फॉर्म भरें ➔
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Direct Switch to existing partner dashboards if already registered */}
            <View style={styles.directSwitchBox}>
              <Text style={styles.directSwitchTitle}>पार्टनर लॉगिन (केवल पंजीकृत ID के लिए):</Text>
              <View style={styles.directButtonsRow}>
                <TouchableOpacity
                  style={styles.directBtn}
                  onPress={handleOpenContractorDashboard}
                >
                  <Text style={styles.directBtnText}>👷 ठेकेदार डैशबोर्ड</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.directBtn}
                  onPress={handleOpenVendorDashboard}
                >
                  <Text style={styles.directBtnText}>🏪 दुकानदार डैशबोर्ड</Text>
                </TouchableOpacity>
              </View>
            </View>

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
    maxHeight: '90%',
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  promoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  promoBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  promoDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  badgePro: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeVendor: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C2410C',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 15,
  },
  perksRow: {
    marginTop: 6,
    gap: 2,
  },
  perkItem: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  directSwitchBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  directSwitchTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  directButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  directBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  directBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
  },
  adminTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  adminSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
