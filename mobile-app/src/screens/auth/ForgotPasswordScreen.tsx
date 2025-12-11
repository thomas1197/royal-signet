import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Button, TextInput } from '../../components';
import { theme } from '../../theme';
import { forgotPasswordFormSchema } from '../../utils/validation';
import { sanitizeEmail } from '../../utils/sanitization';
import { getUserFriendlyErrorMessage, logError } from '../../utils/errorHandling';
import { createForgotPasswordRateLimiter } from '../../utils/rateLimiting';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  const handleResetPassword = async () => {
    // Clear previous errors
    setEmailError('');

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    // Validate form data
    const validation = forgotPasswordFormSchema.safeParse({
      email: sanitizedEmail,
    });

    if (!validation.success) {
      const error = validation.error.errors[0];
      setEmailError(error.message);
      return;
    }

    // Check rate limiting
    const rateLimiter = createForgotPasswordRateLimiter(sanitizedEmail);
    const rateLimitCheck = await rateLimiter.check();

    if (!rateLimitCheck.allowed) {
      Alert.alert('Too Many Attempts', rateLimitCheck.message || 'Please try again later.');
      return;
    }

    setLoading(true);
    try {
      // Record attempt
      await rateLimiter.record();

      await sendPasswordResetEmail(auth, sanitizedEmail);

      // Reset rate limiter on success
      await rateLimiter.reset();

      Alert.alert(
        'Email Sent',
        'Password reset link has been sent to your email. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    } catch (error: any) {
      logError(error, 'ForgotPasswordScreen.handleResetPassword');
      const errorMessage = getUserFriendlyErrorMessage(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries, we'll send you reset instructions
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email"
          placeholder="Enter your email address"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
        />

        <Button
          title="Send Reset Link"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.resetButton}
        />
      </View>

      <View style={styles.backToLoginContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.backToLogin}>← Back to Log In</Text>
        </TouchableOpacity>
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
  backButton: {
    width: theme.layout.backButton,
    height: theme.layout.backButton,
    borderRadius: theme.layout.backButton / 2,
    backgroundColor: theme.colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[6],
    ...theme.shadows.soft,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  header: {
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
    marginBottom: theme.spacing[8],
  },
  resetButton: {
    width: '100%',
    marginTop: theme.spacing[4],
  },
  backToLoginContainer: {
    alignItems: 'center',
  },
  backToLogin: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
});
