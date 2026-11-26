import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { useResponsive } from '../hooks/useResponsive';

interface BottomNavBarProps {
  language: Language;
  activeTab: 'home' | 'quick' | 'estimator' | 'partner' | 'profile';
  onTabPress: (tab: 'home' | 'quick' | 'estimator' | 'partner' | 'profile') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  language,
  activeTab,
  onTabPress,
}) => {
  const t = TRANSLATIONS[language];
  const { isDesktop, isTabletOrDesktop } = useResponsive();

  // Desktop (>= 1024px) displays navigation directly in the top Header bar
  if (isDesktop) {
    return null;
  }

  return (
    <View style={[styles.outerWrap, isTabletOrDesktop && styles.outerWrapTablet]}>
      <View style={[styles.container, isTabletOrDesktop && styles.containerTablet]}>
      {/* 1. Explore / Home */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('home')}
      >
        <View style={[styles.iconWrap, activeTab === 'home' && styles.iconWrapActive]}>
          <Ionicons
            name={activeTab === 'home' ? 'compass' : 'compass-outline'}
            size={20}
            color={activeTab === 'home' ? '#FFFFFF' : '#94A3B8'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'home' && styles.tabLabelActive,
          ]}
        >
          {t.navExplore}
        </Text>
      </TouchableOpacity>

      {/* 2. Quick SOS */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('quick')}
      >
        <View style={styles.quickIconWrapper}>
          <Ionicons name="flash" size={16} color="#FFFFFF" />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'quick' ? { color: '#EF4444', fontWeight: '900' } : { color: '#F87171' },
          ]}
        >
          {t.navQuick}
        </Text>
      </TouchableOpacity>

      {/* 3. SETU AI Master Artisan */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('estimator')}
      >
        <View style={[styles.iconWrap, activeTab === 'estimator' && styles.iconWrapActive]}>
          <Ionicons
            name={activeTab === 'estimator' ? 'sparkles' : 'sparkles-outline'}
            size={20}
            color={activeTab === 'estimator' ? '#FFFFFF' : '#F59E0B'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'estimator' && styles.tabLabelActive,
          ]}
        >
          {t.navEstimator}
        </Text>
      </TouchableOpacity>

      {/* 4. Partner Hub */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('partner')}
      >
        <View style={[styles.iconWrap, activeTab === 'partner' && styles.iconWrapPartnerActive]}>
          <MaterialIcons
            name="business-center"
            size={20}
            color={activeTab === 'partner' ? '#FFFFFF' : '#94A3B8'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'partner' && { color: '#FB923C', fontWeight: '900' },
          ]}
        >
          {t.navPartner}
        </Text>
      </TouchableOpacity>

      {/* 5. Account / Profile */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('profile')}
      >
        <View style={[styles.iconWrap, activeTab === 'profile' && styles.iconWrapActive]}>
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={20}
            color={activeTab === 'profile' ? '#FFFFFF' : '#94A3B8'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'profile' && styles.tabLabelActive,
          ]}
        >
          {t.navProfile || (language === 'en' ? 'Account' : language === 'hinglish' ? 'Khata' : 'खाता')}
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    width: '100%',
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        bottom: 0,
        zIndex: 100,
      },
    }),
  },
  outerWrapTablet: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'web' ? 8 : 4,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
      },
    }),
  },
  containerTablet: {
    maxWidth: 560,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrap: {
    padding: 3,
    borderRadius: 8,
  },
  iconWrapActive: {
    backgroundColor: '#2563EB',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.5)',
      },
    }),
  },
  iconWrapPartnerActive: {
    backgroundColor: '#EA580C',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.5)',
      },
    }),
  },
  tabLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#60A5FA',
    fontWeight: '900',
  },
  quickIconWrapper: {
    backgroundColor: '#DC2626',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
});

