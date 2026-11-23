import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialItem } from '../data/mockData';
import { COLORS } from '../theme/colors';

interface MaterialCardProps {
  item: MaterialItem;
  onAddToCart: (item: MaterialItem) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ item, onAddToCart }) => {
  const discountPercent = Math.round(((item.mrp - item.sellingPrice) / item.mrp) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountPercent}% छूट</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.nameText} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.sellingPrice}>₹{item.sellingPrice}</Text>
          <Text style={styles.mrpText}>₹{item.mrp}</Text>
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>

        {item.bulkOffer ? (
          <View style={styles.bulkOfferPill}>
            <MaterialCommunityIcons name="tag-outline" size={12} color="#C2410C" />
            <Text style={styles.bulkOfferText} numberOfLines={1}>
              {item.bulkOffer}
            </Text>
          </View>
        ) : null}

        <View style={styles.storeInfoRow}>
          <MaterialCommunityIcons name="storefront" size={13} color={COLORS.textSecondary} />
          <Text style={styles.storeName} numberOfLines={1}>
            {item.storeName} • {item.storeDistance}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => onAddToCart(item)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cart-plus" size={15} color="#FFFFFF" />
          <Text style={styles.orderButtonText}>मटेरियल ऑर्डर करें</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  sellingPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  mrpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  unitText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bulkOfferPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginTop: 4,
  },
  bulkOfferText: {
    fontSize: 10,
    color: '#C2410C',
    fontWeight: '700',
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  storeName: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
    marginTop: 6,
  },
  orderButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
