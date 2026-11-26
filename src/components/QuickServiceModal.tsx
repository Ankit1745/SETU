import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { QUICK_SERVICES, QuickServiceItem } from '../data/mockData';
import { COLORS } from '../theme/colors';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface QuickServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onDispatchConfirmed: (service: QuickServiceItem, problem: string) => void;
}

export const QuickServiceModal: React.FC<QuickServiceModalProps> = ({
  visible,
  onClose,
  onDispatchConfirmed,
}) => {
  const [selectedService, setSelectedService] = useState<QuickServiceItem>(QUICK_SERVICES[0]);
  const [selectedProblem, setSelectedProblem] = useState<string>(QUICK_SERVICES[0].commonProblems[0]);
  const [isMatching, setIsMatching] = useState(false);
  const dispatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dispatchTimerRef.current) clearTimeout(dispatchTimerRef.current);
    };
  }, []);

  const handleStartDispatch = () => {
    if (isMatching) return;
    setIsMatching(true);
    dispatchTimerRef.current = setTimeout(() => {
      dispatchTimerRef.current = null;
      setIsMatching(false);
      onClose();
      onDispatchConfirmed(selectedService, selectedProblem);
      showAppAlert(
        '⚡ अनुरोध भेजा गया',
        `${selectedService.title} के लिए निकटतम उपलब्ध सत्यापित कारीगरों को सूचना भेज दी गई है। कारीगर द्वारा स्वीकार करते ही आपको लाइव स्टेटस दिखाई देगा।`
      );
    }, 1200);
  };

  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({ maxWidth: 660 });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.boltIcon}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>SETU Quick (क्विक रिपेयर मोड)</Text>
                <Text style={styles.subtitle}>Uber / Rapido की तरह 15-30 मिनट में पास का कारीगर</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Service selector tabs */}
            <Text style={styles.sectionLabel}>समस्या की श्रेणी चुनें:</Text>
            <View style={styles.servicesGrid}>
              {QUICK_SERVICES.map((s) => {
                const isSelected = selectedService.id === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.serviceCard, isSelected && styles.serviceCardActive]}
                    onPress={() => {
                      setSelectedService(s);
                      setSelectedProblem(s.commonProblems[0]);
                    }}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={s.icon as any}
                      size={24}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.serviceTitle, isSelected && styles.serviceTitleActive]}>
                      {s.title}
                    </Text>
                    <View style={styles.serviceMetaRow}>
                      <Text style={styles.etaText}>⚡ {s.estimatedTime}</Text>
                      <Text style={styles.priceText}>₹{s.startingPrice} से</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Problem Specific Chips */}
            <Text style={styles.sectionLabel}>मुख्य समस्या क्या है?</Text>
            <View style={styles.problemsRow}>
              {selectedService.commonProblems.map((prob, idx) => {
                const isProbSelected = selectedProblem === prob;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.problemChip, isProbSelected && styles.problemChipActive]}
                    onPress={() => setSelectedProblem(prob)}
                  >
                    <Text
                      style={[styles.problemChipText, isProbSelected && styles.problemChipTextActive]}
                    >
                      {prob}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Pro Nearby Status Card */}
            <View style={styles.proNearbyCard}>
              <View style={styles.proNearbyIcon}>
                <MaterialCommunityIcons name="map-marker-radius" size={26} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.proNearbyTitle}>2 निकटतम कारीगर अभी खाली हैं!</Text>
                <Text style={styles.proNearbySub}>
                  औसत पहुँच समय: {selectedService.estimatedTime} • मानक विजिट फीस: ₹{selectedService.startingPrice}
                </Text>
              </View>
            </View>

            {/* Escrow Guarantee */}
            <View style={styles.guaranteeRow}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.guaranteeText}>
                काम पूरा होने और संतुष्टि मिलने पर ही भुगतान करें।
              </Text>
            </View>

            {/* Dispatch Action Button */}
            <TouchableOpacity
              style={[styles.dispatchBtn, isMatching && styles.dispatchBtnMatching]}
              onPress={handleStartDispatch}
              disabled={isMatching}
              activeOpacity={0.85}
            >
              {isMatching ? (
                <Text style={styles.dispatchBtnText}>
                  🔄 पास का कारीगर कनेक्ट हो रहा है...
                </Text>
              ) : (
                <Text style={styles.dispatchBtnText}>
                  ⚡ तत्काल कारीगर बुलाएँ (₹{selectedService.startingPrice}) ➔
                </Text>
              )}
            </TouchableOpacity>

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  boltIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  serviceCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  serviceTitleActive: {
    color: COLORS.primaryDark,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  etaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  priceText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  problemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  problemChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  problemChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  problemChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  problemChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  proNearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  proNearbyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proNearbyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  proNearbySub: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  dispatchBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  dispatchBtnMatching: {
    backgroundColor: '#0F172A',
  },
  dispatchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
