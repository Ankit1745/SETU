import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SUPPLIER_SHOWROOM,
  ShowroomGroup,
  ShowroomProduct,
  ShowroomProjectType,
  PriceTier,
  normalizeProjectType,
  PROJECT_TYPE_LABELS,
  buildLiveSupplierShowroomGroup,
} from '../data/supplierShowroom';
import { MaterialItem } from '../data/mockData';

interface VisualMaterialPickerProps {
  projectType: ShowroomProjectType | string;
  customGroups?: ShowroomGroup[] | null;
  livePlatformMaterials?: MaterialItem[];
  tradeCategory?: string;
  locality?: string;
  initialSelected?: ShowroomProduct[];
  popularMaterialIds?: string[];
  budget?: number | null;
  language?: string;
  onGenerateWithSelection: (selected: ShowroomProduct[]) => void;
  onRequestFinalQuote?: (selected: ShowroomProduct[]) => void;
  onSelectionChange?: (selected: ShowroomProduct[]) => void;
}

const TIER_META: Record<PriceTier, { hi: string; en: string; bg: string; border: string; text: string }> = {
  budget: { hi: 'किफ़ायती', en: 'Budget', bg: '#065F46', border: '#10B981', text: '#6EE7B7' },
  standard: { hi: 'पॉपुलर', en: 'Popular', bg: '#1E3A8A', border: '#3B82F6', text: '#93C5FD' },
  luxury: { hi: 'लक्ज़री', en: 'Luxury', bg: '#78350F', border: '#F59E0B', text: '#FDE68A' },
};

export const VisualMaterialPicker: React.FC<VisualMaterialPickerProps> = ({
  projectType,
  customGroups = null,
  livePlatformMaterials = [],
  tradeCategory,
  locality = '',
  initialSelected = [],
  popularMaterialIds = [],
  budget = null,
  language = 'hi',
  onGenerateWithSelection,
  onRequestFinalQuote,
  onSelectionChange,
}) => {
  const isEn = language === 'en';
  const normalizedType = useMemo(() => normalizeProjectType(projectType), [projectType]);

  const groups = useMemo<ShowroomGroup[]>(() => {
    const baseGroups =
      customGroups && customGroups.length > 0
        ? customGroups
        : SUPPLIER_SHOWROOM[normalizedType] || SUPPLIER_SHOWROOM.custom;
    if (Array.isArray(livePlatformMaterials) && livePlatformMaterials.length > 0) {
      const liveGroup = buildLiveSupplierShowroomGroup({
        materials: livePlatformMaterials,
        tradeCategory,
        projectType: normalizedType,
        locality,
      });
      if (liveGroup && liveGroup.items.length > 0) {
        return [liveGroup, ...baseGroups];
      }
    }
    return baseGroups;
  }, [customGroups, normalizedType, livePlatformMaterials, tradeCategory, locality]);

  // Sparse user selection overrides so switching categories/budgets never causes stale state or effect loops
  const [userOverrides, setUserOverrides] = useState<Record<string, ShowroomProduct>>({});
  const [failedThumbIds, setFailedThumbIds] = useState<Record<string, boolean>>({});

  const selectedByGroup = useMemo(() => {
    const preferredTier: PriceTier =
      budget && budget > 0
        ? budget < 20000
          ? 'budget'
          : budget > 60000
          ? 'luxury'
          : 'standard'
        : 'standard';

    const resolved: Record<string, ShowroomProduct> = {};
    groups.forEach((g) => {
      const override = userOverrides[g.groupId];
      if (override && g.items.some((i) => i.id === override.id)) {
        resolved[g.groupId] = override;
        return;
      }
      const persistedMatch = initialSelected.find((sel) => g.items.some((i) => i.id === sel.id));
      if (persistedMatch) {
        resolved[g.groupId] = g.items.find((i) => i.id === persistedMatch.id)!;
        return;
      }
      const bestMatch =
        g.items.find((i) => i.tier === preferredTier) ||
        g.items.find((i) => i.tier === 'standard') ||
        g.items[0];
      if (bestMatch) resolved[g.groupId] = bestMatch;
    });
    return resolved;
  }, [groups, userOverrides, initialSelected, budget]);

  const selectedList = useMemo(() => Object.values(selectedByGroup), [selectedByGroup]);

  const approxRawMaterialTotal = useMemo(() => {
    return selectedList.reduce((acc, item) => {
      return acc + item.price * (item.approxQtyMultiplier || 1);
    }, 0);
  }, [selectedList]);

  const projectBadgeLabel =
    PROJECT_TYPE_LABELS[normalizedType]?.[isEn ? 'en' : 'hi'] ||
    (isEn ? 'Raw Materials' : 'कच्चा माल चुनें');

  const isSafeThumbUrl = (url?: string) =>
    typeof url === 'string' && /^(https?:\/\/|data:image\/)/i.test(url.trim());

  const handleSelectItem = (groupId: string, product: ShowroomProduct) => {
    const nextOverrides = { ...userOverrides, [groupId]: product };
    setUserOverrides(nextOverrides);
    if (onSelectionChange) {
      const nextList = groups
        .map((g) => {
          const ov = nextOverrides[g.groupId];
          if (ov && g.items.some((i) => i.id === ov.id)) return ov;
          return selectedByGroup[g.groupId];
        })
        .filter(Boolean);
      onSelectionChange(nextList);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="layers-outline" size={16} color="#F59E0B" />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isEn
              ? `Raw Materials Showroom — ${projectBadgeLabel}`
              : `कच्चा माल प्रयोगशाला — ${projectBadgeLabel}`}
          </Text>
          <Text style={styles.headerSub}>
            {isEn
              ? 'Compare raw material quality & rates — tap any combination to see live design!'
              : 'सिर्फ इस काम का शुद्ध कच्चा माल (रेट & क्वालिटी सहित) — बदल-बदलकर नया मॉडल देखें:'}
          </Text>
        </View>
      </View>

      {groups.map((group) => {
        const activeId = selectedByGroup[group.groupId]?.id;
        return (
          <View key={group.groupId} style={styles.groupBlock}>
            <Text style={styles.groupTitle}>{group.groupTitle}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardsRow}>
                {group.items.map((item) => {
                  const isSelected = activeId === item.id;
                  const tier = TIER_META[item.tier] || TIER_META.standard;
                  const hasSafeThumb = isSafeThumbUrl(item.imageUrl);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.productCard, isSelected && styles.productCardActive]}
                      onPress={() => handleSelectItem(group.groupId, item)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.thumbWrap}>
                        {failedThumbIds[item.id] || !hasSafeThumb ? (
                          <View style={[styles.productThumb, styles.thumbFallback]}>
                            <Ionicons name="layers" size={24} color="#F59E0B" />
                          </View>
                        ) : (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.productThumb}
                            resizeMode="cover"
                            onError={() => setFailedThumbIds((prev) => ({ ...prev, [item.id]: true }))}
                          />
                        )}
                        <View
                          style={[
                            styles.tierBadge,
                            { backgroundColor: tier.bg, borderColor: tier.border },
                          ]}
                        >
                          <Text style={[styles.tierText, { color: tier.text }]}>
                            {isEn ? tier.en : tier.hi}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                          </View>
                        )}
                      </View>

                      <View style={styles.cardBody}>
                        {popularMaterialIds.includes(item.id) ? (
                          <View style={{ backgroundColor: '#78350F', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1.5, alignSelf: 'flex-start', marginBottom: 3 }}>
                            <Text style={{ color: '#FDE68A', fontSize: 8.5, fontWeight: '900' }}>
                              🔥 {isEn ? 'Top Pick' : 'सबसे लोकप्रिय'}
                            </Text>
                          </View>
                        ) : null}
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        {item.qualitySpec ? (
                          <Text style={styles.itemSpec} numberOfLines={1}>
                            {item.qualitySpec}
                          </Text>
                        ) : null}
                        <Text style={styles.itemPrice}>
                          ₹{Number(item.price || 0).toLocaleString('en-IN')}{' '}
                          <Text style={styles.itemUnit}>/ {item.unit}</Text>
                        </Text>
                        <Text style={styles.itemStore} numberOfLines={1}>
                          {item.brand} • {item.supplierName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );
      })}

      {/* Interactive Playground Footer */}
      <View style={styles.footerBar}>
        <View style={styles.estimateSummaryRow}>
          <Text style={styles.estimateLabel}>
            {isEn
              ? `Selected Raw Material (${selectedList.length} items):`
              : `चुने हुए कच्चे माल (${selectedList.length} आइटम):`}
          </Text>
          <Text style={styles.estimateAmount}>
            ~₹{approxRawMaterialTotal.toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.generateRealBtn}
          onPress={() => onGenerateWithSelection(selectedList)}
          activeOpacity={0.88}
        >
          <Ionicons name="sparkles" size={16} color="#0F172A" />
          <Text style={styles.generateRealText}>
            {isEn
              ? 'Rebuild Design Model From Selected Raw Materials'
              : 'इन चुने हुए कच्चे माल से नया मॉडल बनाकर दिखाओ'}
          </Text>
        </TouchableOpacity>

        {onRequestFinalQuote ? (
          <TouchableOpacity
            style={styles.quoteReadyBtn}
            onPress={() => onRequestFinalQuote(selectedList)}
            activeOpacity={0.88}
          >
            <Ionicons name="document-text-outline" size={15} color="#A7F3D0" />
            <Text style={styles.quoteReadyText}>
              {isEn
                ? 'Design Finalized? Get 3-Type Quotation Now'
                : 'डिज़ाइन पसंद है? अब 3-टाइप कोटेशन पाएं (लोकेशन & बजट अनुसार)'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 11,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FBBF24',
    fontSize: 12.5,
    fontWeight: '900',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 1,
    lineHeight: 14,
  },
  groupBlock: {
    marginBottom: 12,
  },
  groupTitle: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  productCard: {
    width: 158,
    backgroundColor: '#0F172A',
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  productCardActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#1E293B',
  },
  thumbWrap: {
    width: '100%',
    height: 80,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  productThumb: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  tierBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '900',
  },
  selectedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#020617',
    borderRadius: 10,
  },
  cardBody: {
    padding: 7,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14.5,
    minHeight: 29,
  },
  itemSpec: {
    color: '#93C5FD',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 1,
  },
  itemPrice: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
  itemUnit: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '600',
  },
  itemStore: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 2,
  },
  footerBar: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 9,
    gap: 7,
  },
  estimateSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimateLabel: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '700',
  },
  estimateAmount: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '900',
  },
  generateRealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  generateRealText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '900',
    textAlign: 'center',
  },
  quoteReadyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  quoteReadyText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
});
