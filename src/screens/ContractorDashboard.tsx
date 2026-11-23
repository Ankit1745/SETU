import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Contractor, JobRequest, PortfolioPhoto } from '../data/mockData';
import { COLORS } from '../theme/colors';
import { ApiService } from '../services/api';

interface ContractorDashboardProps {
  contractor: Contractor;
  onUpdateContractorProfile: (updated: Partial<Contractor>) => void;
  jobRequests: JobRequest[];
  onUpdateJobRequestStatus: (jobId: string, newStatus: 'ACCEPTED' | 'REJECTED') => void;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({
  contractor,
  onUpdateContractorProfile,
  jobRequests,
  onUpdateJobRequestStatus,
}) => {
  const [dailyRate, setDailyRate] = useState(
    contractor.dailyWageRate !== null && contractor.dailyWageRate !== undefined
      ? contractor.dailyWageRate.toString()
      : ''
  );
  const [helperRate, setHelperRate] = useState(
    contractor.helperRate !== null && contractor.helperRate !== undefined
      ? contractor.helperRate.toString()
      : ''
  );
  const [thekaRate, setThekaRate] = useState(
    contractor.contractUnitRate !== null && contractor.contractUnitRate !== undefined
      ? contractor.contractUnitRate.toString()
      : ''
  );
  const [primaryRateType, setPrimaryRateType] = useState(contractor.primaryRateType);
  const [isAvailable, setIsAvailable] = useState(contractor.available);
  const [isEditingRate, setIsEditingRate] = useState(false);

  // New Photo Upload Form state
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleSaveRates = async () => {
    const parsedDaily = dailyRate.trim() === '' ? null : (parseFloat(dailyRate) || null);
    const parsedHelper = helperRate.trim() === '' ? null : (parseFloat(helperRate) || null);
    const parsedTheka = thekaRate.trim() === '' ? null : (parseFloat(thekaRate) || null);

    const updates = {
      dailyWageRate: parsedDaily,
      helperRate: parsedHelper,
      contractUnitRate: parsedTheka,
      primaryRateType: primaryRateType,
      available: isAvailable,
    };

    onUpdateContractorProfile(updates);
    setIsEditingRate(false);

    // Sync to backend REST API
    await ApiService.updateContractorProfile(contractor.id, updates);

    Alert.alert(
      '✅ रेट-कार्ड अपडेट हुआ',
      parsedDaily === null && parsedTheka === null
        ? 'आपके द्वारा रेट खाली छोड़े गए हैं। ग्राहकों को "भाव पूछें" दिखाई देगा।'
        : 'ग्राहकों को अब आपकी प्रोफाइल पर ये नए रेट्स दिखाई देंगे।'
    );
  };

  const handleToggleAvailability = (val: boolean) => {
    setIsAvailable(val);
    const updates = { available: val };
    onUpdateContractorProfile(updates);
    ApiService.updateContractorProfile(contractor.id, updates);
  };

  const handleAddWorkPhoto = () => {
    if (!newPhotoTitle.trim()) {
      Alert.alert('अधूरी जानकारी', 'कृपया फोटो का शीर्षक (Title) अवश्य लिखें।');
      return;
    }

    const newPhoto: PortfolioPhoto = {
      id: 'photo_' + Date.now(),
      title: newPhotoTitle,
      imageUrl:
        newPhotoUrl.trim() ||
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
      date: 'आज ही अपलोड किया',
      description: newPhotoDesc || 'साइट पर किया गया कार्य।',
    };

    const updatedList = [newPhoto, ...(contractor.portfolioPhotos || [])];
    onUpdateContractorProfile({ portfolioPhotos: updatedList });

    setShowAddPhotoModal(false);
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setNewPhotoUrl('');

    Alert.alert(
      '🎉 फोटो लाइव हो गई!',
      'यह फोटो अब ग्राहकों को आपकी प्रोफाइल और सर्च में तुरंत दिखेगी।'
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Contractor Profile Summary Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitials}>{contractor.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.nameText}>{contractor.name}</Text>
              <MaterialIcons name="verified" size={16} color="#0284C7" />
            </View>
            <Text style={styles.specialtyText}>{contractor.specialtyHindi}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.proBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#FFFFFF" />
                <Text style={styles.proBadgeText}>SETU प्रो कारीगर</Text>
              </View>
              <Text style={styles.ratingText}>
                ⭐ {contractor.rating} ({contractor.jobsCompleted} काम पूरे)
              </Text>
            </View>
          </View>
        </View>

        {/* Availability Switch */}
        <View style={styles.availabilityRow}>
          <View>
            <Text style={styles.availabilityTitle}>
              {isAvailable ? '🟢 अभी काम के लिए उपलब्ध हैं' : '🔴 अभी व्यस्त / छुट्टी पर हैं'}
            </Text>
            <Text style={styles.availabilitySub}>
              {isAvailable ? 'ग्राहक आपको सर्च में सीधे देख सकते हैं' : 'नये कॉल्स नहीं आएंगे'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
            thumbColor={isAvailable ? COLORS.accent : '#94A3B8'}
          />
        </View>
      </View>

      {/* Wallet / Earnings Summary */}
      <View style={styles.walletGrid}>
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>सुरक्षित एस्क्रो बैलेंस</Text>
          <Text style={styles.walletValue}>₹14,500</Text>
          <Text style={styles.walletHint}>काम पूरा होने पर ट्रांसफर होगा</Text>
        </View>
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>इस महीने की कुल कमाई</Text>
          <Text style={[styles.walletValue, { color: COLORS.accent }]}>₹42,800</Text>
          <Text style={styles.walletHint}>6 प्रोजेक्ट्स पूरे किए</Text>
        </View>
      </View>

      {/* NEW FEATURE: WORK PORTFOLIO PHOTO UPLOADER */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="images" size={18} color="#4338CA" />
            <Text style={styles.sectionTitle}>
              मेरे काम की तस्वीरें ({contractor.portfolioPhotos?.length || 0})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addPhotoBtn}
            onPress={() => setShowAddPhotoModal(!showAddPhotoModal)}
            activeOpacity={0.8}
          >
            <Text style={styles.addPhotoBtnText}>
              {showAddPhotoModal ? 'बंद करें' : '+ नई फोटो जोड़ें'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>
          जितनी अच्छी तस्वीरें होंगी, ग्राहक उतने ही ज्यादा आर्डर और बड़े ठेके देंगे।
        </Text>

        {/* Add photo form */}
        {showAddPhotoModal && (
          <View style={styles.addPhotoFormBox}>
            <Text style={styles.formHeader}>📸 नए काम की फोटो अपलोड करें</Text>

            <Text style={styles.inputLabel}>प्रोजेक्ट का नाम (शीर्षक):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="उदा. लक्ज़री मॉड्यूलर किचन - सिविल लाइन्स"
              value={newPhotoTitle}
              onChangeText={setNewPhotoTitle}
            />

            <Text style={styles.inputLabel}>काम का विवरण (छोटा नोट):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="उदा. 10x8 ft का किचन, 5 दिन में पूरा किया।"
              value={newPhotoDesc}
              onChangeText={setNewPhotoDesc}
            />

            <Text style={styles.inputLabel}>फोटो लिंक (URL या डिफ़ॉल्ट):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://... (खाली छोड़ने पर डिफ़ॉल्ट हाई-रेज़ फोटो लगेगी)"
              value={newPhotoUrl}
              onChangeText={setNewPhotoUrl}
            />

            <TouchableOpacity style={styles.publishPhotoBtn} onPress={handleAddWorkPhoto}>
              <Text style={styles.publishPhotoBtnText}>प्रोफ़ाइल पर पब्लिश करें ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Horizontal photo preview list */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {contractor.portfolioPhotos?.map((p) => (
            <View key={p.id} style={styles.photoThumbCard}>
              <Image source={{ uri: p.imageUrl }} style={styles.photoThumbImg} />
              <View style={styles.photoThumbInfo}>
                <Text style={styles.photoThumbTitle} numberOfLines={1}>
                  {p.title}
                </Text>
                <Text style={styles.photoThumbDate}>{p.date}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Live Self-Priced Rate Card Editor */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FontAwesome5 name="id-card" size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>मेरा ट्रेड-विशिष्ट रेट-कार्ड</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              if (isEditingRate) {
                handleSaveRates();
              } else {
                setIsEditingRate(true);
              }
            }}
          >
            <Text style={styles.editBtnText}>{isEditingRate ? 'सेव करें ✓' : 'एडिट करें ✎'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>
          आप अपनी दिहाड़ी और अपनी फील्ड के अनुसार ठेका दरें खुद तय कर सकते हैं:
        </Text>

        <View style={styles.ratesBox}>
          {/* Rate Type Selector */}
          {isEditingRate && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.fieldLabel}>अपनी फील्ड का प्राइमरी रेट टाइप चुनें:</Text>
              <View style={styles.rateTypeChipsRow}>
                {['शीट/रनिंग फुट', 'स्क्वायर फुट', 'प्रति पॉइंट', 'पैकेज ठेका', 'दिहाड़ी'].map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.rateTypeChip,
                        primaryRateType === type && styles.rateTypeChipActive,
                      ]}
                      onPress={() => setPrimaryRateType(type as any)}
                    >
                      <Text
                        style={[
                          styles.rateTypeChipText,
                          primaryRateType === type && styles.rateTypeChipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          )}

          {/* Daily Wage */}
          <View style={styles.rateFieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>आपकी 1 दिन की दिहाड़ी (8 घंटे):</Text>
              <Text style={styles.fieldSub}>मास्टर कारीगर शिफ्ट चार्ज</Text>
            </View>
            <View style={styles.fieldInputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.rateInput, !isEditingRate && styles.rateInputDisabled]}
                value={dailyRate}
                onChangeText={setDailyRate}
                keyboardType="numeric"
                editable={isEditingRate}
              />
              <Text style={styles.inputUnit}>/दिन</Text>
            </View>
          </View>

          {/* Helper Daily Wage */}
          <View style={styles.rateFieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>सहायक / हेल्पर की दिहाड़ी:</Text>
              <Text style={styles.fieldSub}>साथ आने वाले मजदूर का रेट</Text>
            </View>
            <View style={styles.fieldInputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.rateInput, !isEditingRate && styles.rateInputDisabled]}
                value={helperRate}
                onChangeText={setHelperRate}
                keyboardType="numeric"
                editable={isEditingRate}
              />
              <Text style={styles.inputUnit}>/दिन</Text>
            </View>
          </View>

          {/* Theka / Unit Rate */}
          <View style={styles.rateFieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>ठेका यूनिट दर ({primaryRateType}):</Text>
              <Text style={styles.fieldSub}>{contractor.unitLabel}</Text>
            </View>
            <View style={styles.fieldInputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.rateInput, !isEditingRate && styles.rateInputDisabled]}
                value={thekaRate}
                onChangeText={setThekaRate}
                keyboardType="numeric"
                editable={isEditingRate}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Customer Job Requests */}
      <View style={styles.sectionContainer}>
        {(() => {
          // Strict Dispatch Isolation:
          // 1. Direct Bookings sent specifically to this contractor
          // 2. Open market jobs matching this contractor's specific category
          const directJobs = jobRequests.filter((j) => j.contractorId === contractor.id);
          const openJobs = jobRequests.filter(
            (j) => !j.contractorId && (!j.category || j.category === contractor.category)
          );
          const relevantJobs = [...directJobs, ...openJobs];

          return (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  🔔 आपके लिए कार्य अनुरोध ({relevantJobs.length})
                </Text>
              </View>

              {relevantJobs.length === 0 ? (
                <View style={styles.emptyJobsCard}>
                  <Text style={styles.emptyJobsText}>
                    फिलहाल आपकी ट्रेड ({contractor.specialtyHindi}) के लिए कोई नया अनुरोध नहीं है।
                  </Text>
                </View>
              ) : (
                relevantJobs.map((job) => {
                  const isDirect = job.contractorId === contractor.id;
                  return (
                    <View key={job.id} style={styles.jobItemCard}>
                      <View style={styles.jobItemTop}>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.jobCustomerName}>{job.customerName}</Text>
                            {isDirect && (
                              <View style={styles.directBookingBadge}>
                                <Text style={styles.directBookingBadgeText}>🎯 डायरेक्ट बुकिंग</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.jobLocation}>📍 {job.location}</Text>
                        </View>
                        <View style={styles.jobTypeBadge}>
                          <Text style={styles.jobTypeBadgeText}>{job.hiringType}</Text>
                        </View>
                      </View>

                      <Text style={styles.jobWorkTitle}>{job.workType}</Text>
                      <Text style={styles.jobDesc}>{job.description}</Text>

                      <View style={styles.jobBudgetRow}>
                        <Text style={styles.jobBudgetLabel}>ग्राहक का बजट ऑफर:</Text>
                        <Text style={styles.jobBudgetValue}>₹{job.budgetOffer.toLocaleString('en-IN')}</Text>
                      </View>

                      {job.status === 'PENDING' ? (
                        <View style={styles.jobActionsRow}>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => onUpdateJobRequestStatus(job.id, 'REJECTED')}
                          >
                            <Text style={styles.rejectBtnText}>अस्वीकार</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => onUpdateJobRequestStatus(job.id, 'ACCEPTED')}
                          >
                            <Text style={styles.acceptBtnText}>स्वीकार करें (Accept) ✓</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor:
                                job.status === 'ACCEPTED' ? COLORS.accentLight : COLORS.dangerLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: job.status === 'ACCEPTED' ? '#065F46' : '#991B1B' },
                            ]}
                          >
                            {job.status === 'ACCEPTED' ? '✓ स्वीकृत (ग्राहक से संपर्क करें)' : '✗ अस्वीकृत'}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </>
          );
        })()}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  specialtyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  availabilityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  availabilitySub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  walletGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  walletCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  walletLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  walletValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  walletHint: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  addPhotoBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  addPhotoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  addPhotoFormBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 12,
  },
  formHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4338CA',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
    fontSize: 12,
  },
  publishPhotoBtn: {
    backgroundColor: '#4338CA',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  publishPhotoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  photosScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  photoThumbCard: {
    width: 140,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  photoThumbImg: {
    width: '100%',
    height: 90,
    backgroundColor: '#E2E8F0',
  },
  photoThumbInfo: {
    padding: 6,
  },
  photoThumbTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  photoThumbDate: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  ratesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  rateTypeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  rateTypeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rateTypeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rateTypeChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rateTypeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rateFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fieldSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  fieldInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  rateInput: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 45,
    textAlign: 'center',
  },
  rateInputDisabled: {
    color: COLORS.textPrimary,
  },
  inputUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  emptyJobsCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyJobsText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  jobItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  jobItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobCustomerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  jobLocation: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  jobTypeBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  jobTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  jobWorkTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 6,
  },
  jobDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  jobBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  jobBudgetLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  jobBudgetValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.accent,
  },
  jobActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  rejectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPill: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  directBookingBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  directBookingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
  },
});
