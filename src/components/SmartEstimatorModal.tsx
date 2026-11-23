import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Contractor } from '../data/mockData';
import {
  calculateCustomerEstimate,
  CustomerEstimateResult,
} from '../services/constructionAI';

interface SmartEstimatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectContractorCategory: (category: string) => void;
  contractors?: Contractor[];
}

type WorkType = 'plumbing' | 'carpentry' | 'painting' | 'tiling' | 'electrical';
type CalcMode = 'day' | 'unit';

export const SmartEstimatorModal: React.FC<SmartEstimatorModalProps> = ({
  visible,
  onClose,
  onSelectContractorCategory,
  contractors = [],
}) => {
  const [selectedWork, setSelectedWork] = useState<WorkType>('plumbing');
  const [calcMode, setCalcMode] = useState<CalcMode>('day');
  const [quantityInput, setQuantityInput] = useState<string>('2'); // default 2 days
  const [includeMaterials, setIncludeMaterials] = useState<boolean>(true);

  // Contractor Selection State
  // Mode 1: Standard Rate Demo Contractor (₹900/day)
  // Mode 2: Quote Requested Contractor (null rate - भाव पूछें)
  const [selectedContractorType, setSelectedContractorType] = useState<'standard_900' | 'quote_null' | 'custom'>('standard_900');
  const [customRateInput, setCustomRateInput] = useState<string>('900');

  const quantity = Math.max(1, parseFloat(quantityInput) || 1);

  // Map Category to Contractor Category String
  const getCategoryKey = (w: WorkType) => {
    switch (w) {
      case 'plumbing':
        return 'plumber';
      case 'carpentry':
        return 'carpenter';
      case 'painting':
        return 'painter';
      case 'tiling':
        return 'mason';
      case 'electrical':
        return 'electrician';
    }
  };

  const defaultUnitRates: Record<WorkType, number> = {
    painting: 16,
    tiling: 24,
    carpentry: 380,
    plumbing: 180,
    electrical: 150,
  };

  // Determine effective contractor daily or unit rate
  let effectiveDailyRate: number | null = null;
  let contractorName = 'सत्यापित कारीगर';

  if (selectedContractorType === 'standard_900') {
    effectiveDailyRate = calcMode === 'day' ? 900 : defaultUnitRates[selectedWork];
    contractorName =
      calcMode === 'day'
        ? 'सत्यापित कारीगर (मानक दर: ₹900/दिन)'
        : `सत्यापित कारीगर (ठेका दर: ₹${defaultUnitRates[selectedWork]}/Sq.Ft)`;
  } else if (selectedContractorType === 'quote_null') {
    effectiveDailyRate = null; // Test requirement: null/empty rate -> "Contractor से quote लें (भाव पूछें)"
    contractorName = 'स्वतंत्र ठेकेदार (भाव पूछें)';
  } else {
    effectiveDailyRate = customRateInput.trim() ? parseFloat(customRateInput) || null : null;
    contractorName = 'कस्टम कारीगर दर';
  }

  // Pre-configured Verified Material Catalogs for Demo
  const MATERIAL_CATALOGS: Record<WorkType, { name: string; quantity: number; unitRate: number; unit: string }[]> = {
    plumbing: [
      { name: '1/2 इंच ब्रास सेरामिक स्पिंडल', quantity: 1, unitRate: 85, unit: 'पीस' },
      { name: 'टेफ्लॉन थ्रेड सील टेप (12mm)', quantity: 1, unitRate: 20, unit: 'रोल' },
      { name: 'हैवी रबर वाशर सेट', quantity: 1, unitRate: 15, unit: 'सेट' },
    ],
    carpentry: [
      { name: '19mm BWP 710 मरीन प्लाई (8x4)', quantity: 1, unitRate: 2400, unit: 'शीट' },
      { name: '1mm डेकोरेटिव माइका', quantity: 1, unitRate: 1600, unit: 'शीट' },
      { name: 'सॉफ्ट-क्लोज हाइड्रॉलिक हिंज', quantity: 2, unitRate: 450, unit: 'सेट' },
    ],
    painting: [
      { name: 'एशियन पेंट्स प्रीमियम इमल्शन (10L)', quantity: 1, unitRate: 1900, unit: 'बाल्टी' },
      { name: 'बिरला वाइट वॉल पुट्टी (40kg x 2 बैग)', quantity: 2, unitRate: 850, unit: 'बैग' },
      { name: 'रेगमाल, मास्किंग टेप & रोलर किट', quantity: 1, unitRate: 350, unit: 'किट' },
    ],
    tiling: [
      { name: 'Roff T02 टाइल एडहेसिव (20kg)', quantity: 2, unitRate: 380, unit: 'बैग' },
      { name: '2mm क्रॉस स्पेसर व एपॉक्सी ग्राउट', quantity: 1, unitRate: 250, unit: 'किट' },
    ],
    electrical: [
      { name: 'फिनोलेक्स 2.5mm FR-LSH कॉपर वायर', quantity: 1, unitRate: 1200, unit: 'बंडल' },
      { name: 'मॉड्यूलर स्विच & 16A सॉकेट', quantity: 2, unitRate: 180, unit: 'सेट' },
    ],
  };

  const workTitles: Record<WorkType, string> = {
    plumbing: 'नल रिपेयर & प्लंबिंग कार्य',
    carpentry: 'अलमारी, दरवाजा & फर्नीचर कार्य',
    painting: 'दीवार पुट्टी & पेंटिंग कार्य',
    tiling: 'टाइल फिटिंग & फ्लोर रिपेयर',
    electrical: 'स्विचबोर्ड & हाउस वायरिंग',
  };

  // Run Calculation using SETU Core Engine
  const estimate: CustomerEstimateResult = calculateCustomerEstimate({
    workTitle: workTitles[selectedWork],
    quantity,
    unitType: calcMode === 'day' ? 'day' : 'sqft',
    contractorDailyRate: effectiveDailyRate,
    materialItemsCatalog: includeMaterials ? MATERIAL_CATALOGS[selectedWork] : [],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.aiBadge}>
                <Ionicons name="calculator" size={14} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>SETU स्मार्ट बजट</Text>
              </View>
              <Text style={styles.titleText}>लागत & लेबर एस्टिमेटर</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. Work Type Selection */}
            <Text style={styles.sectionLabel}>1. काम का प्रकार चुनें:</Text>
            <View style={styles.workTypeGrid}>
              <TouchableOpacity
                style={[styles.workTypeCard, selectedWork === 'plumbing' && styles.workTypeCardActive]}
                onPress={() => setSelectedWork('plumbing')}
              >
                <Ionicons
                  name="water"
                  size={16}
                  color={selectedWork === 'plumbing' ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.workTypeText, selectedWork === 'plumbing' && styles.workTypeTextActive]}>
                  प्लंबिंग / नल
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.workTypeCard, selectedWork === 'carpentry' && styles.workTypeCardActive]}
                onPress={() => setSelectedWork('carpentry')}
              >
                <FontAwesome5
                  name="hammer"
                  size={15}
                  color={selectedWork === 'carpentry' ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.workTypeText, selectedWork === 'carpentry' && styles.workTypeTextActive]}>
                  बढ़ई / फर्नीचर
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.workTypeCard, selectedWork === 'painting' && styles.workTypeCardActive]}
                onPress={() => setSelectedWork('painting')}
              >
                <FontAwesome5
                  name="paint-roller"
                  size={15}
                  color={selectedWork === 'painting' ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.workTypeText, selectedWork === 'painting' && styles.workTypeTextActive]}>
                  पुट्टी & पेंटिंग
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.workTypeCard, selectedWork === 'tiling' && styles.workTypeCardActive]}
                onPress={() => setSelectedWork('tiling')}
              >
                <MaterialIcons
                  name="grid-on"
                  size={16}
                  color={selectedWork === 'tiling' ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.workTypeText, selectedWork === 'tiling' && styles.workTypeTextActive]}>
                  टाइल / राजमिस्त्री
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.workTypeCard, selectedWork === 'electrical' && styles.workTypeCardActive]}
                onPress={() => setSelectedWork('electrical')}
              >
                <Ionicons
                  name="flash-outline"
                  size={16}
                  color={selectedWork === 'electrical' ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.workTypeText, selectedWork === 'electrical' && styles.workTypeTextActive]}>
                  विद्युत / वायरिंग
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Calculation Mode & Quantity */}
            <View style={styles.inputCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.inputLabel}>2. आधार व अवधि चुनें:</Text>
                <View style={styles.modeToggleRow}>
                  <TouchableOpacity
                    style={[styles.modeToggleBtn, calcMode === 'day' && styles.modeToggleBtnActive]}
                    onPress={() => {
                      setCalcMode('day');
                      if (quantityInput === '350') setQuantityInput('2');
                    }}
                  >
                    <Text style={[styles.modeToggleText, calcMode === 'day' && styles.modeToggleTextActive]}>
                      दिहाड़ी (दिन)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeToggleBtn, calcMode === 'unit' && styles.modeToggleBtnActive]}
                    onPress={() => {
                      setCalcMode('unit');
                      if (quantityInput === '2') setQuantityInput('350');
                    }}
                  >
                    <Text style={[styles.modeToggleText, calcMode === 'unit' && styles.modeToggleTextActive]}>
                      ठेका (Sq.Ft)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={quantityInput}
                  onChangeText={setQuantityInput}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.unitTag}>{calcMode === 'day' ? 'दिन (Days)' : 'वर्ग फुट (Sq.Ft)'}</Text>
              </View>
            </View>

            {/* 3. Contractor Rate Selection (SETU Fair Marketplace Rule) */}
            <View style={styles.contractorSection}>
              <Text style={styles.sectionLabel}>3. कारीगर की दर (Contractor Rate):</Text>
              <Text style={styles.sectionHelp}>
                * SETU नियम: कारीगर अपनी दर खुद तय करता है। खाली दर का मतलब 'भाव पूछें' है।
              </Text>

              <View style={styles.contractorOptionsRow}>
                {/* Option 1: Standard Rate ₹900/day */}
                <TouchableOpacity
                  style={[
                    styles.contractorOptionCard,
                    selectedContractorType === 'standard_900' && styles.contractorOptionCardActive,
                  ]}
                  onPress={() => setSelectedContractorType('standard_900')}
                >
                  <Ionicons
                    name="pricetag"
                    size={16}
                    color={selectedContractorType === 'standard_900' ? '#2563EB' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.contractorOptionTitle,
                      selectedContractorType === 'standard_900' && styles.contractorOptionTitleActive,
                    ]}
                  >
                    मानक दर: ₹900/दिन
                  </Text>
                  <Text style={styles.contractorOptionSub}>सत्यापित डेमो कारीगर</Text>
                </TouchableOpacity>

                {/* Option 2: Empty Rate (भाव पूछें) */}
                <TouchableOpacity
                  style={[
                    styles.contractorOptionCard,
                    selectedContractorType === 'quote_null' && styles.contractorOptionCardActive,
                  ]}
                  onPress={() => setSelectedContractorType('quote_null')}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={16}
                    color={selectedContractorType === 'quote_null' ? '#D97706' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.contractorOptionTitle,
                      selectedContractorType === 'quote_null' && styles.contractorOptionTitleActive,
                    ]}
                  >
                    दर खाली (भाव पूछें)
                  </Text>
                  <Text style={styles.contractorOptionSub}>कोटेशन अनुरोध</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Calculation Results Display */}
            <View style={styles.resultsCard}>
              <View style={styles.resultsHeaderRow}>
                <Text style={styles.resultsHeader}>📊 AI प्राथमिक बजट अनुमान (Tentative Estimate)</Text>
              </View>

              {/* Labor Cost Row */}
              <View style={styles.costBreakdownItem}>
                <View style={styles.costItemLeft}>
                  <Text style={styles.costItemLabel}>👷 कारीगर मजदूरी (Labor Charge):</Text>
                  <Text style={styles.costItemDetail}>{estimate.laborDetails}</Text>
                </View>
                <View style={styles.costItemRight}>
                  <Text
                    style={[
                      styles.costItemValue,
                      estimate.laborCost === null && styles.costItemValueMuted,
                    ]}
                  >
                    {estimate.laborCostText}
                  </Text>
                </View>
              </View>

              {/* Materials Cost Row */}
              <View style={styles.costBreakdownItem}>
                <View style={styles.costItemLeft}>
                  <Text style={styles.costItemLabel}>🧱 आवश्यक सामग्री (Materials):</Text>
                  <Text style={styles.costItemDetail}>{estimate.materialDetails}</Text>
                  {estimate.materialItems.map((item, idx) => (
                    <Text key={idx} style={styles.materialSubItem}>
                      • {item.name}: {item.quantity} × ₹{item.unitRate} = ₹{item.total}
                    </Text>
                  ))}
                </View>
                <View style={styles.costItemRight}>
                  <Text style={styles.costItemValue}>
                    {estimate.materialCost > 0 ? `₹${estimate.materialCost.toLocaleString('en-IN')}` : 'साइट पर तय'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Grand Total */}
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>कुल अनुमानित राशि:</Text>
                <Text style={styles.grandTotalValue}>{estimate.totalCostText}</Text>
              </View>

              {/* Tentative Disclaimer Note */}
              <View style={styles.disclaimerBox}>
                <Ionicons name="information-circle" size={16} color="#B45309" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.disclaimerText, { fontWeight: '800', marginBottom: 2 }]}>
                    📌 यह "अनुमानित बजट" है:
                  </Text>
                  <Text style={styles.disclaimerText}>
                    ठेकेदार साइट का मुआयना करके "Final quotation" देगा। ग्राहक के स्वीकार करने पर ही दाम लॉक होगा।
                  </Text>
                </View>
              </View>
            </View>

            {/* Action CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onSelectContractorCategory(getCategoryKey(selectedWork));
              }}
            >
              <Text style={styles.ctaButtonText}>
                इस श्रेणी के उपलब्ध कारीगर देखें ➔
              </Text>
            </TouchableOpacity>

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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  sectionHelp: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  workTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  workTypeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  workTypeCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  workTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  workTypeTextActive: {
    color: '#3730A3',
    fontWeight: '800',
  },
  inputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  modeToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  unitTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  contractorSection: {
    marginBottom: 14,
  },
  contractorOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contractorOptionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  contractorOptionCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  contractorOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  contractorOptionTitleActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  contractorOptionSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  resultsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  resultsHeaderRow: {
    marginBottom: 10,
  },
  resultsHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  costBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costItemLeft: {
    flex: 1,
    paddingRight: 8,
  },
  costItemLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  costItemDetail: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  materialSubItem: {
    fontSize: 10.5,
    color: '#374151',
    marginTop: 1,
  },
  costItemRight: {
    alignItems: 'flex-end',
  },
  costItemValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#15803D',
  },
  costItemValueMuted: {
    color: '#D97706',
    fontSize: 11.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#DCFCE7',
    marginVertical: 10,
  },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  grandTotalLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#14532D',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803D',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10.5,
    color: '#92400E',
    lineHeight: 15,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
