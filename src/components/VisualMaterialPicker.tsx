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
  ShowroomProduct,
  ShowroomProjectType,
} from '../data/supplierShowroom';

interface VisualMaterialPickerProps {
  projectType: ShowroomProjectType;
  language?: string;
  onGenerateWithSelection: (selected: ShowroomProduct[]) => void;
}

const TIER_META = {
  budget: { hi: 'किफ़ायती', en: 'Budget', bg: '#065F46', border: '#10B981', text: '#6EE7B7' },
  standard: { hi: 'पॉपुलर', en: 'Popular', bg: '#1E3A8A', border: '#3B82F6', text: '#93C5FD' },
  luxury: { hi: 'प्रीमियम', en: 'Luxury', bg: '#78350F', border: '#F59E0B', text: '#FDE68A' },
};

export const VisualMaterialPicker: React.FC<VisualMaterialPickerProps> = ({
  projectType,
  language = 'hi',
  onGenerateWithSelection,
}) => {
  const isEn = language === 'en';
  const groups = SUPPLIER_SHOWROOM[projectType] || SUPPLIER_SHOWROOM.kitchen;

  // Initialize with middle/popular default item per group
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, ShowroomProduct>>(() => {
    const init: Record<string, ShowroomProduct> = {};
    groups.forEach((g) => {
      const std = g.items.find((i) => i.tier === 'standard') || g.items[0];
      if (std) init[g.groupId] = std;
    });
    return init;
  });

  const selectedList = useMemo(() => Object.values(selectedByGroup), [selectedByGroup]);

  const approxMaterialEstimate = useMemo(() => {
    return selectedList.reduce((acc, item) => {
      return acc + item.price * (item.approxQtyMultiplier || 1);
    }, 0);
  }, [selectedList]);

  const handleSelectItem = (groupId: string, product: ShowroomProduct) => {
    setSelectedByGroup((prev) => ({ ...prev, [groupId]: product }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="storefront-outline" size={16} color="#F59E0B" />
        <Text style={styles.headerTitle}>
          {isEn
            ? 'Pick Your Favorite Finish, Hardware & Range'
            : 'अपनी पसंद का माइका, फिटिंग व रेंज चुनें (असली फोटो + रेट)'}
        </Text>
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
                  const tier = TIER_META[item.tier];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.productCard, isSelected && styles.productCardActive]}
                      onPress={() => handleSelectItem(group.groupId, item)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.thumbWrap}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.productThumb}
                          resizeMode="cover"
                        />
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
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ₹{item.price.toLocaleString('en-IN')}{' '}
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

      {/* Live Selected Budget + Generate Realistic Photo Button */}
      <View style={styles.footerBar}>
        <View style={styles.estimateSummaryRow}>
          <Text style={styles.estimateLabel}>
            {isEn ? 'Selected Materials Est.:' : 'चुने हुए सामान का अनुमान:'}
          </Text>
          <Text style={styles.estimateAmount}>
            ~₹{approxMaterialEstimate.toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.generateRealBtn}
          onPress={() => onGenerateWithSelection(selectedList)}
          activeOpacity={0.88}
        >
          <Ionicons name="sparkles" size={17} color="#0F172A" />
          <Text style={styles.generateRealText}>
            {isEn
              ? 'Generate Real Photo Design With Selected Items'
              : 'इन चुने हुए आइटम्स से असली फोटो डिज़ाइन बनाओ'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 11,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
    flex: 1,
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
    width: 150,
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
    height: 82,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  productThumb: {
    width: '100%',
    height: '100%',
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
    lineHeight: 15,
    minHeight: 30,
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
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
});
