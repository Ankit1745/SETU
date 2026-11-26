import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { INDIAN_RATES_SURVEY } from '../data/indianRatesSurvey';
import { COLORS } from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';

interface RateSurveyModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTradeId?: string;
}

export const RateSurveyModal: React.FC<RateSurveyModalProps> = ({
  visible,
  onClose,
  selectedTradeId = 'mason',
}) => {
  const [userPickedTrade, setUserPickedTrade] = useState<string | null>(null);
  const activeTrade = userPickedTrade || selectedTradeId || 'mason';

  const tradeData = INDIAN_RATES_SURVEY.find((t) => t.tradeId === activeTrade) || INDIAN_RATES_SURVEY[0];
  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({
    maxWidth: 780,
    fixedHeight: true,
    mobileHeight: '90%',
    desktopHeight: '88%',
  });

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 }}>
              <View style={styles.iconCircle}>
                <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>ऑल-इंडिया फेयर रेट सर्वे (Rate Index)</Text>
                <Text style={styles.headerSub} numberOfLines={1}>भारतीय राज्यों के अनुसार आधिकारिक ठेका व दिहाड़ी दरें</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Trade Selector Tabs */}
          <View style={styles.tradeTabsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tradeTabs}>
              {INDIAN_RATES_SURVEY.map((item) => (
                <TouchableOpacity
                  key={item.tradeId}
                  style={[
                    styles.tradeTab,
                    activeTrade === item.tradeId && styles.tradeTabActive,
                  ]}
                  onPress={() => setUserPickedTrade(item.tradeId)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tradeTabText,
                      activeTrade === item.tradeId && styles.tradeTabTextActive,
                    ]}
                  >
                    {item.tradeNameHindi.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Trade Title Card */}
            <View style={styles.tradeTitleCard}>
              <Text style={styles.tradeName}>{tradeData.tradeNameHindi}</Text>
              <Text style={styles.tradeSub}>{tradeData.tradeNameEng} • मानक माप इकाइयां:</Text>
              <View style={styles.unitsRow}>
                {tradeData.commonUnits.map((u, i) => (
                  <View key={i} style={styles.unitChip}>
                    <Text style={styles.unitChipText}>📐 {u}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Regional Rates Breakdown */}
            <Text style={styles.sectionHeader}>🇮🇳 राज्यवार दर विश्लेषण (Regional Benchmarks):</Text>
            {tradeData.benchmarksByRegion.map((region, idx) => (
              <View key={idx} style={styles.regionCard}>
                <View style={styles.regionHeader}>
                  <Text style={styles.regionTitle}>{region.region}</Text>
                </View>

                {/* Shift Rates */}
                <View style={styles.shiftRateRow}>
                  <View style={styles.shiftCol}>
                    <Text style={styles.shiftLabel}>मास्टर कारीगर दिहाड़ी (8 घंटे):</Text>
                    <Text style={styles.shiftVal}>{region.dailyWageMaster}</Text>
                  </View>
                  <View style={styles.shiftDivider} />
                  <View style={styles.shiftCol}>
                    <Text style={styles.shiftLabel}>सहायक / हेल्पर दिहाड़ी:</Text>
                    <Text style={styles.shiftVal}>{region.dailyWageHelper}</Text>
                  </View>
                </View>

                {/* Theka Unit Rates Table */}
                <View style={styles.unitTable}>
                  <Text style={styles.tableHead}>ठेका व यूनिट दरें:</Text>
                  {region.contractUnitRates.map((c, cIdx) => (
                    <View key={cIdx} style={styles.tableRow}>
                      <View style={{ flex: 1.2 }}>
                        <Text style={styles.tableUnitName}>{c.unit}</Text>
                        <Text style={styles.tableUnitNote}>{c.note}</Text>
                      </View>
                      <View style={styles.tableRatePill}>
                        <Text style={styles.tableRateText}>{c.range}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Fair Pricing & Quality Tips */}
            <View style={styles.tipsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Ionicons name="shield-checkmark" size={18} color="#059669" />
                <Text style={styles.tipsTitle}>SETU गुणवत्ता & सही मूल्य सलाह</Text>
              </View>
              {tradeData.fairPricingTips.map((tip, idx) => (
                <Text key={idx} style={styles.tipItem}>• {tip}</Text>
              ))}
            </View>

            <View style={{ height: 30 }} />
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
    backgroundColor: '#FFFFFF',
    height: '88%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  tradeTabsWrapper: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  tradeTabs: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tradeTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tradeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tradeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tradeTabTextActive: {
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
    padding: 14,
  },
  tradeTitleCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
  },
  tradeName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  tradeSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  unitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  unitChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  regionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  regionHeader: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  regionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  shiftRateRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  shiftCol: {
    flex: 1,
  },
  shiftLabel: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  shiftVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
  },
  shiftDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  unitTable: {
    padding: 10,
  },
  tableHead: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableUnitName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tableUnitNote: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  tableRatePill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tableRateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
  },
  tipsBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  tipItem: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
    marginTop: 3,
  },
});
