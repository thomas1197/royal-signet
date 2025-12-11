import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, TextInput } from '../../components';
import { theme } from '../../theme';

export const CreateNewPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = (route.params as any) || { email: '' };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password reset logic
      // For now, show success and navigate to login
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Success',
          'Your password has been reset successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login' as never),
            },
          ]
        );
      }, 1000);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your new password must be different from previously used passwords
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoCapitalize="none"
        />

        <TextInput
          label="Confirm Password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          autoCapitalize="none"
        />

        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Password must contain:</Text>
          <Text style={styles.requirement}>• At least 6 characters</Text>
          <Text style={styles.requirement}>• A mix of letters and numbers</Text>
          <Text style={styles.requirement}>• At least one special character</Text>
        </View>

        <Button
          title="Reset Password"
          onPress={handleCreatePassword}
          loading={loading}
          style={styles.resetButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    padding: theme.spacing[6],
  },
  header: {
    marginTop: theme.spacing[12],
    marginBottom: theme.spacing[8],
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.tertiary,
    lineHeight: 24,
  },
  form: {
    marginBottom: theme.spacing[6],
  },
  requirements: {
    backgroundColor: theme.colors.background.white,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[6],
  },
  requirementsTitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  requirement: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  resetButton: {
    width: '100%',
  },
});
