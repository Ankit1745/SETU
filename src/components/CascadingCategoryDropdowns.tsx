import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import {
  SERVICE_CATEGORIES,
  MainServiceCategory,
  ServiceSubcategoryItem,
  getMainCategoryById,
} from '../data/serviceCatalog';
import { useResponsive } from '../hooks/useResponsive';

interface CascadingCategoryDropdownsProps {
  selectedMainId: string;
  selectedSubId: string;
  customWorkText?: string;
  onChangeMain: (main: MainServiceCategory, defaultSub: ServiceSubcategoryItem) => void;
  onChangeSub: (sub: ServiceSubcategoryItem) => void;
  onChangeCustomWork?: (txt: string) => void;
  language?: string;
}

export const CascadingCategoryDropdowns: React.FC<CascadingCategoryDropdownsProps> = ({
  selectedMainId,
  selectedSubId,
  customWorkText = '',
  onChangeMain,
  onChangeSub,
  onChangeCustomWork,
  language = 'hi',
}) => {
  const isEn = language === 'en';
  const [openDropdown, setOpenDropdown] = useState<'MAIN' | 'SUB' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { getModalStyles } = useResponsive();
  const modalResp = getModalStyles({ maxWidth: 560, fixedHeight: true, mobileHeight: '82%', desktopHeight: '78%' });

  const activeMain = useMemo(() => getMainCategoryById(selectedMainId), [selectedMainId]);
  const activeSub = useMemo(
    () => activeMain.subcategories.find((s) => s.id === selectedSubId) || activeMain.subcategories[0],
    [activeMain, selectedSubId]
  );

  const filteredMains = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return SERVICE_CATEGORIES;
    return SERVICE_CATEGORIES.filter(
      (m) =>
        m.nameEn.toLowerCase().includes(q) ||
        m.nameHi.toLowerCase().includes(q) ||
        m.subcategories.some((s) => s.nameEn.toLowerCase().includes(q) || s.nameHi.toLowerCase().includes(q))
    );
  }, [searchTerm]);

  const filteredSubs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return activeMain.subcategories;
    return activeMain.subcategories.filter(
      (s) => s.nameEn.toLowerCase().includes(q) || s.nameHi.toLowerCase().includes(q)
    );
  }, [activeMain, searchTerm]);

  const showCustomInput = Boolean(activeSub?.isCustom || selectedMainId === 'other_custom');

  return (
    <View style={styles.container}>
      {/* DROPDOWN 1: MAIN CATEGORY */}
      <Text style={styles.fieldLabel}>
        {isEn ? '1. Main Category' : '1. मुख्य श्रेणी (Main Category)'}
        <Text style={styles.reqStar}> *</Text>
      </Text>
      <TouchableOpacity
        style={styles.dropdownBox}
        activeOpacity={0.85}
        onPress={() => {
          setSearchTerm('');
          setOpenDropdown('MAIN');
        }}
      >
        <View style={[styles.catBadge, { backgroundColor: `${activeMain.color}18` }]}>
          <MaterialCommunityIcons name={activeMain.icon as any} size={18} color={activeMain.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownValuePrimary} numberOfLines={1}>
            {activeMain.number}. {isEn ? activeMain.nameEn : activeMain.nameHi}
          </Text>
          <Text style={styles.dropdownValueSecondary} numberOfLines={1}>
            {isEn ? activeMain.nameHi : activeMain.nameEn}
          </Text>
        </View>
        <Ionicons name="chevron-down-circle" size={20} color="#64748B" />
      </TouchableOpacity>

      {/* DROPDOWN 2: SUBCATEGORY */}
      <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
        {isEn ? '2. Specific Subcategory' : '2. उप-श्रेणी (Subcategory)'}
        <Text style={styles.reqStar}> *</Text>
      </Text>
      <TouchableOpacity
        style={styles.dropdownBox}
        activeOpacity={0.85}
        onPress={() => {
          setSearchTerm('');
          setOpenDropdown('SUB');
        }}
      >
        <View style={[styles.subDot, { backgroundColor: activeMain.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownValuePrimary} numberOfLines={1}>
            {isEn ? activeSub.nameEn : activeSub.nameHi}
          </Text>
          <Text style={styles.dropdownValueSecondary} numberOfLines={1}>
            {isEn ? activeSub.nameHi : activeSub.nameEn}
          </Text>
        </View>
        <Ionicons name="chevron-down-circle" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      {/* OPTIONAL / MANDATORY CUSTOM SKILL INPUT */}
      {showCustomInput && onChangeCustomWork && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.fieldLabel}>
            {isEn ? 'Specify Exact Work / Skill' : 'अपना सटीक काम / कौशल लिखें'}
            <Text style={styles.reqStar}> *</Text>
          </Text>
          <TextInput
            style={styles.customInput}
            placeholder={isEn ? 'e.g. Solar Inverter Setup / Tailor / Freelancer' : 'उदा. सोलर पैनल फिटिंग / टेलर / अन्य विशेष कार्य'}
            placeholderTextColor="#94A3B8"
            value={customWorkText}
            onChangeText={onChangeCustomWork}
          />
        </View>
      )}

      {/* SEARCHABLE DROPDOWN MODAL */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}
      >
        <View style={modalResp.overlayStyle}>
          <View style={[styles.modalCard, modalResp.containerStyle]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {openDropdown === 'MAIN'
                    ? isEn
                      ? 'Select Main Category (1–12)'
                      : 'मुख्य श्रेणी चुनें (सभी 12 श्रेणियाँ)'
                    : `${activeMain.number}. ${isEn ? activeMain.nameEn : activeMain.nameHi}`}
                </Text>
                <Text style={styles.modalSub}>
                  {openDropdown === 'MAIN'
                    ? isEn
                      ? 'Choose broad industry domain'
                      : 'पहले अपना मुख्य क्षेत्र चुनें, फिर सटीक काम चुनें'
                    : isEn
                    ? 'Select exact specialty in this category'
                    : 'इस श्रेणी के अंतर्गत अपनी उप-श्रेणी चुनें'}
                </Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setOpenDropdown(null)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Quick Filter */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder={isEn ? 'Search skill or category...' : 'श्रेणी या काम खोजें (जैसे: Plumber, Developer, Chef)...'}
                placeholderTextColor="#94A3B8"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {openDropdown === 'MAIN'
                ? filteredMains.map((main) => {
                    const isSelected = main.id === activeMain.id;
                    return (
                      <TouchableOpacity
                        key={main.id}
                        style={[styles.optionRow, isSelected && styles.optionRowActive]}
                        onPress={() => {
                          onChangeMain(main, main.subcategories[0]);
                          setSearchTerm('');
                          setOpenDropdown('SUB');
                        }}
                      >
                        <View style={[styles.catBadge, { backgroundColor: `${main.color}18` }]}>
                          <MaterialCommunityIcons name={main.icon as any} size={18} color={main.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                            {main.number}. {main.nameEn}
                          </Text>
                          <Text style={styles.optionSub}>{main.nameHi} • {main.subcategories.length} विकल्प</Text>
                        </View>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                        ) : (
                          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    );
                  })
                : filteredSubs.map((sub) => {
                    const isSelected = sub.id === activeSub.id;
                    return (
                      <TouchableOpacity
                        key={sub.id}
                        style={[styles.optionRow, isSelected && styles.optionRowActive]}
                        onPress={() => {
                          onChangeSub(sub);
                          setOpenDropdown(null);
                        }}
                      >
                        <View style={[styles.subDot, { backgroundColor: isSelected ? COLORS.primary : activeMain.color }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                            {sub.nameEn}
                          </Text>
                          <Text style={styles.optionSub}>{sub.nameHi}</Text>
                        </View>
                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                      </TouchableOpacity>
                    );
                  })}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },
  reqStar: {
    color: '#DC2626',
    fontWeight: '900',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  catBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  dropdownValuePrimary: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownValueSecondary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  customInput: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 22px 44px rgba(15, 23, 42, 0.35)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  optionRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  optionTitleActive: {
    color: '#1D4ED8',
  },
  optionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
