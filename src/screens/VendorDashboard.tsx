import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { MaterialItem } from '../data/mockData';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface VendorDashboardProps {
  materials: MaterialItem[];
  onUpdateMaterial: (updated: MaterialItem) => void;
  onAddNewMaterial: (newItem: MaterialItem) => void;
  vendorId?: string;
  vendorName?: string;
  language?: Language;
}

function createMaterialId(): string {
  return `m_${Date.now()}`;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({
  materials,
  onUpdateMaterial,
  onAddNewMaterial,
  vendorId = 'v1',
  vendorName,
  language: _language = 'hi',
}) => {
  const currentVendorId = vendorId || 'v1';
  // Vendor Isolation: show vendor's own inventory (fallback to all unowned items for default v1)
  const storeMaterials = materials.filter(
    (m) => (m.vendorId || 'v1') === currentVendorId
  );

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editBulkOffer, setEditBulkOffer] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<'mason' | 'carpenter' | 'plumber' | 'electrician' | 'painter' | 'general'>('general');
  const [newMrp, setNewMrp] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newUnit, setNewUnit] = useState('प्रति बोरी/शीट');
  const [newBulk, setNewBulk] = useState('');

  const handleStartEdit = (item: MaterialItem) => {
    setEditingItemId(item.id);
    setEditPrice(item.sellingPrice.toString());
    setEditBulkOffer(item.bulkOffer || '');
  };

  const handleSaveEdit = (item: MaterialItem) => {
    const parsed = Number(editPrice.trim());
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showAppAlert('अमान्य कीमत', 'कृपया वैध धनात्मक विक्रय मूल्य (> 0) दर्ज करें।');
      return;
    }
    const updatedPrice = Math.round(parsed);
    const updatedMrp = item.mrp < updatedPrice ? updatedPrice : item.mrp;
    onUpdateMaterial({
      ...item,
      mrp: updatedMrp,
      sellingPrice: updatedPrice,
      bulkOffer: editBulkOffer.trim(),
    });
    setEditingItemId(null);
    showAppAlert('✅ प्रोडक्ट कीमत अपडेट हुई', `"${item.name}" का नया रेट ग्राहकों को दिखने लगा है।`);
  };

  const handleToggleStock = (item: MaterialItem) => {
    onUpdateMaterial({
      ...item,
      inStock: !item.inStock,
    });
  };

  const handleCreateNewProduct = () => {
    const selling = Number(newSellingPrice.trim());
    const parsedMrp = newMrp.trim() ? Number(newMrp.trim()) : Math.round(selling * 1.15);

    if (!newName.trim() || !Number.isFinite(selling) || selling <= 0) {
      showAppAlert('अधूरी / अमान्य जानकारी', 'कृपया प्रोडक्ट का नाम और वैध धनात्मक सेलिंग प्राइस (> 0) दर्ज करें।');
      return;
    }
    if (!Number.isFinite(parsedMrp) || parsedMrp <= 0) {
      showAppAlert('अमान्य MRP', 'कृपया वैध MRP मूल्य दर्ज करें।');
      return;
    }

    const displayStoreName = vendorName || storeMaterials[0]?.storeName || 'मेरी हार्डवेयर & मटेरियल दुकान';
    const newItem: MaterialItem = {
      id: createMaterialId(),
      vendorId: currentVendorId,
      name: newName.trim(),
      brand: newBrand.trim() || 'Generic',
      category: newCategory,
      mrp: Math.max(Math.round(selling), Math.round(parsedMrp)),
      sellingPrice: Math.round(selling),
      unit: newUnit.trim() || 'प्रति नग',
      bulkOffer: newBulk.trim(),
      storeName: displayStoreName,
      storeDistance: '0.5 km दूर',
      inStock: true,
      image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150',
    };

    onAddNewMaterial(newItem);
    setShowAddForm(false);
    setNewName('');
    setNewBrand('');
    setNewMrp('');
    setNewSellingPrice('');
    setNewBulk('');
    showAppAlert('🎉 नया सामान लिस्ट हुआ!', `"${newItem.name}" अब ग्राहकों और ठेकेदारों को लाइव दिखेगा।`);
  };

  const inStockCount = storeMaterials.filter((m) => m.inStock).length;
  const shopDisplayTitle = vendorName || storeMaterials[0]?.storeName || 'SETU वेरिफाइड हार्डवेयर स्टोर';
  const { isTabletOrDesktop, isDesktop, horizontalPadding, shellStyle, getGridItemWidth } = useResponsive();
  const itemColWidth = getGridItemWidth(isDesktop ? 2 : 2, 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: horizontalPadding, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={shellStyle}>
      {/* Shop Profile Banner */}
      <View style={styles.shopCard}>
        <View style={styles.shopTopRow}>
          <View style={styles.shopIcon}>
            <MaterialCommunityIcons name="storefront" size={26} color={COLORS.secondary} />
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{shopDisplayTitle}</Text>
            <Text style={styles.shopLocation}>📍 विक्रेता ID: {currentVendorId} • भोपाल मंडी रेट्स</Text>
            <View style={styles.shopStatsRow}>
              <Text style={styles.statPill}>📦 {storeMaterials.length} सूचीबद्ध आइटम</Text>
              <Text style={styles.statPill}>✅ {inStockCount} स्टॉक में उपलब्ध</Text>
            </View>
          </View>
        </View>

        {/* Live inventory summary */}
        <View style={styles.revenueRow}>
          <View style={styles.revCol}>
            <Text style={styles.revLabel}>स्टॉक में उपलब्ध</Text>
            <Text style={styles.revVal}>{inStockCount} / {storeMaterials.length}</Text>
          </View>
          <View style={styles.revDivider} />
          <View style={styles.revCol}>
            <Text style={styles.revLabel}>औसत लिस्टिंग मूल्य</Text>
            <Text style={[styles.revVal, { color: COLORS.accent }]}>
              ₹{storeMaterials.length > 0 ? Math.round(storeMaterials.reduce((s, m) => s + (m.sellingPrice || 0), 0) / storeMaterials.length).toLocaleString('en-IN') : 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Add new item button */}
      <TouchableOpacity
        style={styles.addNewBtn}
        onPress={() => setShowAddForm(!showAddForm)}
        activeOpacity={0.8}
      >
        <Ionicons name={showAddForm ? 'close' : 'add-circle'} size={18} color="#FFFFFF" />
        <Text style={styles.addNewBtnText}>
          {showAddForm ? 'फॉर्म बंद करें' : '+ नया सामान (Product) कैटलॉग में जोड़ें'}
        </Text>
      </TouchableOpacity>

      {/* Add New Product Form */}
      {showAddForm && (
        <View style={styles.addFormCard}>
          <Text style={styles.formTitle}>नया सामान जोड़ें (Seller Listing)</Text>

          <Text style={styles.inputLabel}>श्रेणी चुनें (Category):</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {(['general', 'mason', 'carpenter', 'plumber', 'electrician', 'painter'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setNewCategory(cat)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                  backgroundColor: newCategory === cat ? COLORS.secondary : '#E2E8F0',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: newCategory === cat ? '#FFF' : '#334155' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>सामान का नाम:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="उदा. अल्ट्राटेक सुपर सीमेंट (50kg)"
            value={newName}
            onChangeText={setNewName}
          />

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>ब्रांड (Company):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="उदा. UltraTech"
                value={newBrand}
                onChangeText={setNewBrand}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>इकाई (Unit):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="प्रति बोरी/शीट"
                value={newUnit}
                onChangeText={setNewUnit}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>MRP (अंकित मूल्य):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="₹ 420"
                keyboardType="numeric"
                value={newMrp}
                onChangeText={setNewMrp}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>SETU सेलिंग प्राइस (₹):</Text>
              <TextInput
                style={[styles.textInput, { borderColor: COLORS.accent, borderWidth: 1.5 }]}
                placeholder="₹ 385"
                keyboardType="numeric"
                value={newSellingPrice}
                onChangeText={setNewSellingPrice}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>बल्क डिस्काउंट ऑफर (Optional):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="उदा. 50 बोरी लेने पर ₹10 प्रति बोरी की छूट"
            value={newBulk}
            onChangeText={setNewBulk}
          />

          <TouchableOpacity style={styles.saveNewBtn} onPress={handleCreateNewProduct}>
            <Text style={styles.saveNewBtnText}>लाइव स्टोर पर पब्लिश करें ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Inventory & Pricing List */}
      <View style={styles.inventorySection}>
        <Text style={styles.inventoryTitle}>
          🏪 आपकी दुकान का इन्वेंट्री & रेट-कार्ड ({storeMaterials.length} आइटम्स)
        </Text>
        <Text style={styles.inventorySub}>
          दुकानदार अपना सेलिंग प्राइस और डिस्काउंट खुद सेट कर सकता है:
        </Text>

        {storeMaterials.length === 0 ? (
          <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569' }}>
              अभी आपकी दुकान ({currentVendorId}) में कोई आइटम सूचीबद्ध नहीं है। ऊपर दिए बटन से पहला प्रोडक्ट जोड़ें!
            </Text>
          </View>
        ) : (
        <View style={isTabletOrDesktop ? styles.inventoryGridDesktop : undefined}>
          {storeMaterials.map((item) => {
            const isEditing = editingItemId === item.id;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  isTabletOrDesktop && { width: itemColWidth, marginBottom: 0 },
                ]}
              >
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>

                {/* In Stock toggle */}
                <View style={styles.stockCol}>
                  <Text style={[styles.stockStatusText, { color: item.inStock ? COLORS.accent : COLORS.danger }]}>
                    {item.inStock ? 'स्टॉक में है' : 'खत्म (Out)'}
                  </Text>
                  <Switch
                    value={item.inStock}
                    onValueChange={() => handleToggleStock(item)}
                    trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                    thumbColor={item.inStock ? COLORS.accent : '#94A3B8'}
                  />
                </View>
              </View>

              {/* Price section */}
              {isEditing ? (
                <View style={styles.editPriceBox}>
                  <View style={styles.editPriceRow}>
                    <Text style={styles.editPriceLabel}>SETU सेलिंग प्राइस (₹):</Text>
                    <TextInput
                      style={styles.editPriceInput}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.editPriceRow}>
                    <Text style={styles.editPriceLabel}>ऑफर टैग:</Text>
                    <TextInput
                      style={styles.editOfferInput}
                      value={editBulkOffer}
                      onChangeText={setEditBulkOffer}
                      placeholder="उदा. 10 लेने पर 5% छूट"
                    />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelEditBtn}
                      onPress={() => setEditingItemId(null)}
                    >
                      <Text style={styles.cancelEditText}>रद्द करें</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveEditBtn}
                      onPress={() => handleSaveEdit(item)}
                    >
                      <Text style={styles.saveEditText}>सेव करें ✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.itemFooter}>
                  <View>
                    <View style={styles.priceDisplayRow}>
                      <Text style={styles.itemSellingPrice}>₹{item.sellingPrice}</Text>
                      <Text style={styles.itemMrp}>MRP ₹{item.mrp}</Text>
                      <Text style={styles.itemUnit}>({item.unit})</Text>
                    </View>
                    {item.bulkOffer ? (
                      <Text style={styles.itemOfferBadge}>🏷️ {item.bulkOffer}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.editPriceBtn}
                    onPress={() => handleStartEdit(item)}
                  >
                    <Text style={styles.editPriceBtnText}>रेट बदलें ✎</Text>
                  </TouchableOpacity>
                </View>
              )}
              </View>
            );
          })}
        </View>
        )}
      </View>

      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inventoryGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shopCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  shopTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  shopLocation: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  shopStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statPill: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  revenueRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  revCol: {
    flex: 1,
  },
  revLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  revVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  revDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    marginBottom: 14,
  },
  addNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  addFormCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  formRow: {
    flexDirection: 'row',
  },
  saveNewBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  inventorySection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  inventorySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  stockCol: {
    alignItems: 'flex-end',
  },
  stockStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  itemSellingPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  itemMrp: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  itemUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  itemOfferBadge: {
    fontSize: 10,
    color: '#C2410C',
    fontWeight: '700',
    marginTop: 2,
  },
  editPriceBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editPriceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  editPriceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  editPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editPriceInput: {
    width: 90,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  editOfferInput: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 11,
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelEditBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cancelEditText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  saveEditBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  saveEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
