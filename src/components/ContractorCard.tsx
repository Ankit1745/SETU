import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, ViewStyle } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { Contractor } from '../data/mockData';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface ContractorCardProps {
  contractor: Contractor;
  onViewProfilePress: (contractor: Contractor) => void;
  onBookPress: (contractor: Contractor) => void;
  onCallPress: (contractor: Contractor) => void;
  language?: Language;
  containerStyle?: ViewStyle;
}

export const ContractorCard: React.FC<ContractorCardProps> = ({
  contractor,
  onViewProfilePress,
  onBookPress,
  onCallPress,
  language = 'hi',
  containerStyle,
}) => {
  const heroImage = contractor.portfolioPhotos?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600';
  const { isCompactPhone, isTabletOrDesktop } = useResponsive();
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const showAvatarImage = Boolean(contractor.avatar && contractor.avatar.trim() && !avatarFailed);
  const initialChar = (contractor.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.cardContainer, containerStyle]}>
      <TouchableOpacity
        style={[styles.card, isTabletOrDesktop && { flex: 1, justifyContent: 'space-between' }]}
        activeOpacity={0.94}
        onPress={() => onViewProfilePress(contractor)}
      >
        {/* 1. TINDER-STYLE HERO SHOWCASE PHOTO BANNER */}
        <View style={[styles.heroBanner, isTabletOrDesktop && { height: 170 }]}>
          <Image source={{ uri: heroImage }} style={styles.heroImg} />
          <View style={styles.heroOverlay} />

          {/* Floating Glassmorphic Badges */}
          <View style={styles.heroTopRow}>
            <View style={styles.floatingRatingPill}>
              <FontAwesome name="star" size={11} color="#FBBF24" />
              <Text style={styles.floatingRatingText}>
                {(contractor.reviewsCount || 0) > 0
                  ? `${Number(contractor.rating || 0).toFixed(1)} (${contractor.reviewsCount}+)`
                  : language === 'en' ? 'New Pro' : 'नया कारीगर'}
              </Text>
            </View>

            <View style={styles.floatingEtaPill}>
              <Ionicons name="flash" size={11} color="#22C55E" />
              <Text style={styles.floatingEtaText}>
                {contractor.etaMinutes && contractor.distance
                  ? `~${contractor.etaMinutes}m आगमन • ${contractor.distance}`
                  : language === 'en' ? 'Available Nearby' : language === 'hinglish' ? 'Paas Me Uplabdh' : 'नजदीक में उपलब्ध'}
              </Text>
            </View>
          </View>

          {/* Bottom Title on Hero Banner */}
          <View style={styles.heroBottomRow}>
            <View style={styles.avatarStoryRing}>
              {showAvatarImage ? (
                <Image
                  source={{ uri: contractor.avatar }}
                  style={styles.avatarImg}
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <View style={[styles.avatarImg, styles.avatarFallbackCircle]}>
                  <Text style={styles.avatarFallbackText}>{initialChar}</Text>
                </View>
              )}
              {contractor.available && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.heroIdentityBox}>
              <View style={styles.nameRow}>
                <Text style={styles.heroName} numberOfLines={1}>{contractor.name}</Text>
                {contractor.verified && (
                  <MaterialIcons name="verified" size={16} color="#38BDF8" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.heroSpecialty} numberOfLines={1}>
                {contractor.specialtyHindi}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. CARD BODY & WORK DETAILS */}
        <View style={styles.cardBody}>
          {/* Quick Stats Badges */}
          <View style={styles.statsBadgesRow}>
            <View style={styles.statTag}>
              <Ionicons name="briefcase-outline" size={12} color={COLORS.primary} />
              <Text style={styles.statTagText}>
                {contractor.jobsCompleted}+ {language === 'hi' ? 'काम पूरे' : 'jobs done'}
              </Text>
            </View>

            <View style={styles.statTag}>
              <Ionicons name="ribbon-outline" size={12} color="#D97706" />
              <Text style={styles.statTagText}>
                {contractor.experienceYears} {language === 'hi' ? 'वर्ष अनुभव' : 'yrs exp'}
              </Text>
            </View>

            <View
              style={[
                styles.statTag,
                contractor.verified
                  ? { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }
                  : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
              ]}
            >
              <Text
                style={[
                  styles.statTagText,
                  { color: contractor.verified ? '#16A34A' : '#64748B', fontWeight: '800' },
                ]}
              >
                {contractor.verified
                  ? (language === 'hi' ? '✓ सत्यापित' : '✓ Verified')
                  : (language === 'hi' ? 'दस्तावेज विचाराधीन' : 'KYC Pending')}
              </Text>
            </View>
          </View>

          {/* 3. CONTRACTOR'S OWN RATE (Clear & Prominent) */}
          <View style={styles.ownRateContainer}>
            <View style={styles.ownRateHeader}>
              <Ionicons name="pricetag" size={14} color="#D97706" />
              <Text style={styles.ownRateTitle}>
                {language === 'hi' ? 'कारीगर की तय दर (Own Rate):' : "Contractor's Own Rate:"}
              </Text>
            </View>

            <View style={styles.ratePillsRow}>
              {contractor.dailyWageRate && contractor.dailyWageRate > 0 ? (
                <View style={styles.primaryRateBadge}>
                  <Text style={styles.primaryRateLabel}>दिहाड़ी:</Text>
                  <Text style={styles.primaryRateValue}>
                    ₹{contractor.dailyWageRate}/दिन
                  </Text>
                </View>
              ) : null}

              {contractor.contractUnitRate && contractor.contractUnitRate > 0 ? (
                <View style={styles.primaryRateBadge}>
                  <Text style={styles.primaryRateLabel}>ठेका:</Text>
                  <Text style={styles.primaryRateValue}>
                    ₹{contractor.contractUnitRate} {contractor.unitLabel}
                  </Text>
                </View>
              ) : null}

              {(!contractor.dailyWageRate || contractor.dailyWageRate <= 0) &&
              (!contractor.contractUnitRate || contractor.contractUnitRate <= 0) ? (
                <View style={styles.quoteRateBadge}>
                  <Text style={styles.quoteRateText}>
                    💬 {language === 'hi' ? 'दर: भाव पूछें (काम देखकर तय)' : 'Rate: Inquire on site'}
                  </Text>
                </View>
              ) : null}

              {contractor.helperRate && contractor.helperRate > 0 ? (
                <View style={styles.helperRateBadge}>
                  <Text style={styles.helperRateText}>
                    हेल्पर: +₹{contractor.helperRate}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 4. ACTION BUTTONS: PROFILES & BOOK */}
          <View style={[styles.actionButtonsRow, isCompactPhone && { flexWrap: 'wrap', gap: 6 }]}>
            <TouchableOpacity
              style={[styles.viewProfileBtn, isCompactPhone && { flex: 1, justifyContent: 'center', minWidth: '48%' }]}
              onPress={() => onViewProfilePress(contractor)}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={15} color="#1E40AF" />
              <Text style={styles.viewProfileBtnText} numberOfLines={1}>
                {language === 'hi' ? 'प्रोफाइल देखें' : 'View Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callActionButton}
              onPress={() => onCallPress(contractor)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={14} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappActionButton}
              onPress={() => {
                const targetPhone = contractor.phone || (contractor.phoneMasked && !contractor.phoneMasked.includes('XXX') ? contractor.phoneMasked : null);
                if (!targetPhone) {
                  showAppAlert(
                    language === 'en' ? 'Contact Unavailable' : 'संपर्क अनुपलब्ध',
                    language === 'en'
                      ? 'Direct number not available. Please send a booking or quotation request through the app.'
                      : 'सीधा फोन/व्हाट्सएप नंबर उपलब्ध नहीं है। कृपया ऐप के माध्यम से बुकिंग या कोटेशन अनुरोध भेजें।'
                  );
                  return;
                }
                const clean = targetPhone.replace(/\D/g, '').slice(-10);
                const msg = encodeURIComponent(
                  `नमस्ते ${contractor.name}! मैंने SETU ऐप पर आपकी प्रोफाइल (${contractor.specialtyHindi}) देखी है। मुझे काम के संबंध में बात करनी है।`
                );
                const url = `https://wa.me/91${clean}?text=${msg}`;
                if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.open === 'function') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.log('Cannot open WhatsApp', err));
                }
              }}
              activeOpacity={0.8}
            >
              <FontAwesome name="whatsapp" size={15} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bookActionButton, isCompactPhone && { minWidth: '100%' }]}
              onPress={() => onBookPress(contractor)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="event-available" size={16} color="#FFFFFF" />
              <Text style={styles.bookActionText} numberOfLines={1}>
                {language === 'hi' ? 'बुक करें ➔' : 'Book ➔'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  heroBanner: {
    height: 150,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingRatingText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  floatingEtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingEtaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroBottomRow: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarStoryRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    position: 'relative',
    padding: 1.5,
    backgroundColor: '#FFFFFF',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroIdentityBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSpecialty: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cardBody: {
    padding: 12,
  },
  statsBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  statTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  statTagText: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  photoCarouselWrapper: {
    marginBottom: 10,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  photoHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  photoHeaderCount: {
    fontSize: 9.5,
    color: COLORS.textMuted,
  },
  photoScrollStrip: {
    gap: 8,
  },
  photoThumbCard: {
    width: 85,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoThumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoThumbTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  photoThumbTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '700',
  },
  techniqueBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 10,
  },
  techniqueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  techniqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 5,
  },
  techniqueBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  fairRateTag: {
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  fairRateTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  techniqueMethodBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  techniqueMethodLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  techniqueMethodText: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
    lineHeight: 15,
  },
  standardRateCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  rateCardTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  standardFormulaText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
    marginBottom: 4,
  },
  rateSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
    paddingTop: 4,
  },
  rateDailyBaseline: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#78350F',
  },
  warrantyPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
  materialComboNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
    marginBottom: 10,
  },
  materialComboNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  callActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  whatsappActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  whatsappActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bookActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bookActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ownRateContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  ownRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  ownRateTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  ratePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  primaryRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  primaryRateLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  primaryRateValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  quoteRateBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quoteRateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  helperRateBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  helperRateText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  viewProfileBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  avatarFallbackCircle: {
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
