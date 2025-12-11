import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserRole, ROLE_LABELS } from '../../types/roles';
import { theme } from '../../theme';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
}

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  pastor: { bg: '#8B0000', text: '#FFFFFF' }, // Dark red
  sundaySchoolHead: { bg: '#2E7D32', text: '#FFFFFF' }, // Green
  admin: { bg: '#1565C0', text: '#FFFFFF' }, // Blue
  volunteer: { bg: '#F57C00', text: '#FFFFFF' }, // Orange
  member: { bg: '#757575', text: '#FFFFFF' }, // Gray
};

/**
 * RoleBadge - Displays a colored badge for user role
 *
 * Usage:
 * <RoleBadge role="pastor" />
 * <RoleBadge role={user.role} size="small" />
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'medium' }) => {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.member;
  const label = ROLE_LABELS[role] || 'Member';

  return (
    <View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor: colors.bg },
      ]}
    >
      <Text style={[styles.text, styles[`${size}Text`], { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  large: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  text: {
    fontFamily: theme.typography.fonts.satoshi,
    fontWeight: theme.typography.weights.semibold,
  },
  smallText: {
    fontSize: theme.typography.sizes.xs,
  },
  mediumText: {
    fontSize: theme.typography.sizes.sm,
  },
  largeText: {
    fontSize: theme.typography.sizes.md,
  },
});
