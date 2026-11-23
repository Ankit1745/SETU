import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  currentLocation: string;
  onLocationPress: () => void;
  onQuickModePress: () => void;
  onOpenWorkWithUs: () => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
  user: any;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onLocationPress,
  onQuickModePress,
  onOpenWorkWithUs,
  onOpenProfile,
  onLogout,
  user,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <View style={styles.container}>
      {/* Top Brand & Actions Bar */}
      <View style={styles.topRow}>
        {/* Brand */}
        <TouchableOpacity style={styles.brandContainer} activeOpacity={0.8}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>सेतु</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>{t.appName}</Text>
            <Text style={styles.brandSubtitle}>{t.tagline}</Text>
          </View>
        </TouchableOpacity>

        {/* Right Action Icons (Language, Points, Work with Us, Profile) */}
        <View style={styles.actionsRight}>
          {/* Tri-lingual Language Switcher (हिं | EN | Hing) */}
          <TouchableOpacity
            style={styles.langPill}
            onPress={onToggleLanguage}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>
              हिं
            </Text>
            <Text style={styles.langDivider}>|</Text>
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              EN
            </Text>
            <Text style={styles.langDivider}>|</Text>
            <Text style={[styles.langText, language === 'hinglish' && styles.langTextActive]}>
              Hing
            </Text>
          </TouchableOpacity>

          {/* Login / Profile / Points */}
          {user ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TouchableOpacity
                style={styles.userProfilePill}
                onPress={onOpenProfile}
                activeOpacity={0.8}
              >
                <View style={styles.avatarMiniCircle}>
                  <Text style={styles.avatarMiniText}>
                    {user.name ? user.name.charAt(0) : 'U'}
                  </Text>
                </View>
                <Text style={styles.userMiniName} numberOfLines={1}>
                  {user.name?.split(' ')[0]}
                </Text>
                <View style={styles.pointsMiniBadge}>
                  <FontAwesome5 name="coins" size={10} color="#D97706" />
                  <Text style={styles.pointsMiniText}>{user.rewardPoints || 250}</Text>
                </View>
              </TouchableOpacity>
              {onLogout && (
                <TouchableOpacity
                  style={styles.logoutMiniBtn}
                  onPress={onLogout}
                  activeOpacity={0.7}
                  accessibilityLabel="Logout"
                >
                  <Ionicons name="exit-outline" size={13} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginPillBtn}
              onPress={onOpenProfile}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in" size={14} color="#FFFFFF" />
              <Text style={styles.loginPillText}>
                {language === 'hi' ? 'लॉगिन / रजिस्टर' : 'Login / Register'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Flipkart / Amazon Style "Work with Us" (Become a Partner) Button */}
          <TouchableOpacity
            style={styles.workWithUsBtn}
            onPress={onOpenWorkWithUs}
            activeOpacity={0.85}
          >
            <MaterialIcons name="business-center" size={13} color="#FFFFFF" />
            <Text style={styles.workWithUsText}>{t.workWithUs}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Bar & Quick Repair SOS Bar */}
      <View style={styles.bottomBar}>
        {/* Location selector */}
        <TouchableOpacity
          style={styles.locationSection}
          activeOpacity={0.8}
          onPress={onLocationPress}
        >
          <MaterialIcons name="my-location" size={13} color={COLORS.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {currentLocation}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={15} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* SETU Quick Instant SOS */}
        <TouchableOpacity
          style={styles.quickSosPill}
          activeOpacity={0.85}
          onPress={onQuickModePress}
        >
          <Ionicons name="flash" size={11} color="#FFFFFF" />
          <Text style={styles.quickSosText}>{t.quickSos}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    paddingTop: Platform.OS === 'web' ? 14 : 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 38,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 8.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 3,
  },
  langText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  langDivider: {
    fontSize: 9,
    color: '#CBD5E1',
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  userProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 5,
  },
  avatarMiniCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  userMiniName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E293B',
    maxWidth: 60,
  },
  pointsMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 8,
    gap: 2,
  },
  pointsMiniText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  loginPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  loginPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  workWithUsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 3,
  },
  workWithUsText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  logoutMiniBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtn: {
    padding: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 6,
  },
  locationSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 10.5,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  quickSosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 3,
  },
  quickSosText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
});
