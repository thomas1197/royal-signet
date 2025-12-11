import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Logo } from '../../components';

export const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Navigate to Login after 2 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Login' as never);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Logo variant="red" width={200} style={styles.logo} />

        <Text style={styles.title}>Royal Signet</Text>
        <Text style={styles.tagline}>
          A New Beginning in His{'\n'}Presence Begins Here
        </Text>
      </View>

      <Text style={styles.footer}>Come as You Are</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: theme.spacing[8],
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing[4],
    textAlign: 'center',
  },
  tagline: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    fontFamily: theme.typography.fonts.schoolbell,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[8],
  },
});
