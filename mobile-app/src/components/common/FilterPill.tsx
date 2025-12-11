import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: theme.layout.filterPill,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.ui.filterTag,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  activeContainer: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  activeText: {
    color: theme.colors.background.white,
  },
});
