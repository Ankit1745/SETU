import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
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
  onSelectLanguage?: (lang: Language) => void;
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
  onSelectLanguage,
}) => {
  const t = TRANSLATIONS[language];

  // Dynamic official 3D logo based on active language
  const logoSource =
    language === 'hi'
      ? require('../../assets/setu-logo-hi.jpg')
      : require('../../assets/setu-logo-en.jpg');

  return (
    <View style={styles.container}>
      {/* Top Brand & Actions Bar */}
      <View style={styles.topRow}>
        {/* 3D Official Brand Identity */}
        <TouchableOpacity style={styles.brandContainer} activeOpacity={0.88}>
          <View style={styles.logoBadgeContainer}>
            <Image source={logoSource} style={styles.logoImage} resizeMode="cover" />
          </View>
          <View style={styles.brandTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.brandTitle}>{language === 'hi' ? 'सेतु' : 'SETU'}</Text>
              <View style={styles.proOfficialTag}>
                <Text style={styles.proOfficialTagText}>3D</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>
              {language === 'hi'
                ? 'कारीगर • सामग्री • 15m'
                : 'Pros • Materials • 15m'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right Action Icons (Interactive Language Selector, Profile, Partner Hub) */}
        <View style={styles.actionsRight}>
          {/* Tri-lingual Interactive Language Switcher */}
          <View style={styles.langPillContainer}>
            <TouchableOpacity
              style={[styles.langChoiceBtn, language === 'hi' && styles.langChoiceBtnActive]}
              onPress={() => onSelectLanguage ? onSelectLanguage('hi') : onToggleLanguage()}
              activeOpacity={0.8}
            >
              <Text style={[styles.langChoiceText, language === 'hi' && styles.langChoiceTextActive]}>
                हिं
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langChoiceBtn, language === 'en' && styles.langChoiceBtnActive]}
              onPress={() => onSelectLanguage ? onSelectLanguage('en') : onToggleLanguage()}
              activeOpacity={0.8}
            >
              <Text style={[styles.langChoiceText, language === 'en' && styles.langChoiceTextActive]}>
                EN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langChoiceBtn, language === 'hinglish' && styles.langChoiceBtnActive]}
              onPress={() => onSelectLanguage ? onSelectLanguage('hinglish') : onToggleLanguage()}
              activeOpacity={0.8}
            >
              <Text style={[styles.langChoiceText, language === 'hinglish' && styles.langChoiceTextActive]}>
                Hing
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Profile or High-Contrast 3D Login Pill */}
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
                  <FontAwesome5 name="coins" size={9} color="#D97706" />
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
              <Ionicons name="log-in" size={13} color="#FFFFFF" />
              <Text style={styles.loginPillText}>
                {language === 'hi' ? 'लॉगिन' : 'Login'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 3D Partner Hub Button */}
          <TouchableOpacity
            style={styles.workWithUsBtn}
            onPress={onOpenWorkWithUs}
            activeOpacity={0.85}
          >
            <MaterialIcons name="business-center" size={12} color="#FFFFFF" />
            <Text style={styles.workWithUsText}>
              {language === 'hi' ? 'पार्टनर' : 'Partner'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Bar & Quick Repair SOS Bar */}
      <View style={styles.bottomBar}>
        {/* Location selector with 3D glass accent */}
        <TouchableOpacity
          style={styles.locationSection}
          activeOpacity={0.8}
          onPress={onLocationPress}
        >
          <View style={styles.locationIconWrap}>
            <Ionicons name="location" size={12} color="#EA580C" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {currentLocation}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={15} color="#64748B" />
        </TouchableOpacity>

        {/* SETU Quick Instant 15m SOS */}
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
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'web' ? 12 : 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 42,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadgeContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 122, 0, 0.5)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 14px rgba(255, 122, 0, 0.4), inset 0 0 8px rgba(2, 132, 199, 0.4)',
      },
      default: {
        shadowColor: '#FF7A00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
      },
    }),
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  proOfficialTag: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proOfficialTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  langPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  langChoiceBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langChoiceBtnActive: {
    backgroundColor: '#2563EB',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.5)',
      },
    }),
  },
  langChoiceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  langChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  userProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 4,
  },
  avatarMiniCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  userMiniName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
    maxWidth: 55,
  },
  pointsMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  pointsMiniText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FBBF24',
  },
  logoutMiniBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  loginPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#3B82F6',
    ...Platform.select({
      web: {
        boxShadow: '0 3px 10px rgba(37, 99, 235, 0.4)',
      },
    }),
  },
  loginPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  workWithUsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F97316',
    ...Platform.select({
      web: {
        boxShadow: '0 3px 10px rgba(234, 88, 12, 0.4)',
      },
    }),
  },
  workWithUsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  locationSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  locationIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  quickSosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#22C55E',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
      },
    }),
  },
  quickSosText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
