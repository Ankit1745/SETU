import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export type UserRole = 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenLoginModal: () => void;
  userName?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  onOpenLoginModal,
  userName,
}) => {
  const roles: { id: UserRole; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { id: 'CUSTOMER', label: 'ग्राहक', icon: 'account-search-outline' },
    { id: 'CONTRACTOR', label: 'ठेकेदार', icon: 'hammer-wrench' },
    { id: 'VENDOR', label: 'दुकानदार', icon: 'storefront-outline' },
    { id: 'ADMIN', label: 'एडमिन', icon: 'shield-account' },
  ];

  return (
    <View style={styles.container}>
      {/* 4 Persona Roles Tabs */}
      <View style={styles.tabTrack}>
        {roles.map((r) => {
          const isActive = currentRole === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => onRoleChange(r.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={r.icon}
                size={14}
                color={isActive ? '#FFFFFF' : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Registration / SETU ID Button */}
      <TouchableOpacity style={styles.idRegisterBtn} onPress={onOpenLoginModal} activeOpacity={0.8}>
        <MaterialCommunityIcons name="card-account-details-outline" size={15} color={COLORS.primary} />
        <Text style={styles.idRegisterText}>
          {userName ? `ID: ${userName}` : 'डिजिटल ID / लॉगिन ➔'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabTrack: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    gap: 2,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
    elevation: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  idRegisterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  idRegisterText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
