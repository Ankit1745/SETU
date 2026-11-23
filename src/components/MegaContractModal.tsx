import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MegaContract } from '../data/mockData';
import { COLORS } from '../theme/colors';

interface MegaContractModalProps {
  visible: boolean;
  contract: MegaContract | null;
  onClose: () => void;
  onRequestConsultation: (contract: MegaContract) => void;
}

export const MegaContractModal: React.FC<MegaContractModalProps> = ({
  visible,
  contract,
  onClose,
  onRequestConsultation,
}) => {
  if (!contract) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={[styles.tagBadge, { backgroundColor: contract.color }]}>
                <Text style={styles.tagBadgeText}>{contract.tag}</Text>
              </View>
              <Text style={styles.title}>{contract.title}</Text>
              <Text style={styles.subtitle}>{contract.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Budget & Duration Highlight Card */}
            <View style={styles.highlightCard}>
              <View style={styles.highlightRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.highlightLabel}>अनुमानित बजट रेंज:</Text>
                  <Text style={styles.highlightValue}>{contract.estimatedBudgetRange}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.highlightLabel}>अवधि (Timeframe):</Text>
                  <Text style={styles.durationValue}>⏳ {contract.durationEstimate}</Text>
                </View>
              </View>
              <Text style={styles.descText}>{contract.description}</Text>
            </View>

            {/* Included Labor & Contractors */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>👷 शामिल कुशल टीमें & कारीगर:</Text>
              {contract.includedServices.map((serv, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                  <Text style={styles.checkItemText}>{serv}</Text>
                </View>
              ))}
            </View>

            {/* Included Raw Materials */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🧱 शामिल ओरिजिनल रॉ-मटेरियल (सप्लायर स्टोर से):</Text>
              {contract.includedMaterials.map((mat, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="cube-outline" size={16} color={COLORS.secondary} />
                  <Text style={styles.checkItemText}>{mat}</Text>
                </View>
              ))}
            </View>

            {/* 6 Escrow Milestones */}
            <View style={styles.milestonesCard}>
              <View style={styles.milestonesHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#059669" />
                <Text style={styles.milestonesTitle}>सुरक्षित माइलस्टोन पेमेंट्स (SETU एस्क्रो)</Text>
              </View>
              <Text style={styles.milestonesSub}>
                पैसे एक साथ नहीं देने होते। काम के हर स्टेज के सत्यापन के बाद ही किश्त जारी होती है:
              </Text>

              {contract.milestones.map((m) => (
                <View key={m.step} style={styles.milestoneRow}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>{m.step}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.stepTopRow}>
                      <Text style={styles.stepTitle}>{m.title}</Text>
                      <Text style={styles.stepPercent}>{m.payoutPercent}% भुगतान</Text>
                    </View>
                    <Text style={styles.stepDesc}>{m.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => {
                onClose();
                onRequestConsultation(contract);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>
                फ्री साइट विजिट & विस्तृत कोटेशन बुक करें ➔
              </Text>
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
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
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
  highlightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  highlightValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  durationValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  descText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  checkItemText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  milestonesCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  milestonesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestonesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  milestonesSub: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stepPercent: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  stepDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
