import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Logo } from './Logo';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  theme: any;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  theme,
}) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.header}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Logo variant="red" width={32} height={32} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
  },
  logoContainer: {
    marginRight: theme.spacing[3],
  },
  textContainer: {
    flex: 1,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[0.5],
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});
