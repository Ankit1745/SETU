import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language, TRANSLATIONS } from '../i18n/translations';

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

  return (
    <View style={styles.container}>
      {/* 1. Explore / Home */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('home')}
      >
        <Ionicons
          name={activeTab === 'home' ? 'compass' : 'compass-outline'}
          size={22}
          color={activeTab === 'home' ? COLORS.primary : COLORS.textMuted}
        />
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
            activeTab === 'quick' && { color: '#DC2626', fontWeight: '800' },
          ]}
        >
          {t.navQuick}
        </Text>
      </TouchableOpacity>

      {/* 3. AI Estimator */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onTabPress('estimator')}
      >
        <Ionicons
          name={activeTab === 'estimator' ? 'calculator' : 'calculator-outline'}
          size={22}
          color={activeTab === 'estimator' ? COLORS.primary : COLORS.textMuted}
        />
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
        <MaterialIcons
          name="business-center"
          size={22}
          color={activeTab === 'partner' ? COLORS.secondary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'partner' && { color: COLORS.secondary, fontWeight: '800' },
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
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profile' ? COLORS.primary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'profile' && styles.tabLabelActive,
          ]}
        >
          {language === 'hi' ? 'खाता' : 'Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  quickIconWrapper: {
    backgroundColor: '#DC2626',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
