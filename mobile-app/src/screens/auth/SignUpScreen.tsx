import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../../services/firebase';
import { processGoogleSignIn, createOrUpdateUserProfile } from '../../services/googleAuth';
import { Button, TextInput, Logo } from '../../components';
import { theme } from '../../theme';
import { signUpFormSchema } from '../../utils/validation';
import { sanitizeEmail, sanitizeName } from '../../utils/sanitization';
import { getUserFriendlyErrorMessage, logError } from '../../utils/errorHandling';
import { createSignupRateLimiter } from '../../utils/rateLimiting';
import {
  GOOGLE_EXPO_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '@env';

WebBrowser.maybeCompleteAuthSession();

export const SignUpScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Error states for each field
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  // Google Sign-In configuration using environment variables
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleResponse(id_token);
    }
  }, [response]);

  const handleSignUp = async () => {
    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Sanitize inputs
    const sanitizedName = sanitizeName(fullName);
    const sanitizedEmail = sanitizeEmail(email);

    // Validate form data
    const validation = signUpFormSchema.safeParse({
      name: sanitizedName,
      email: sanitizedEmail,
      password: password,
      confirmPassword: confirmPassword,
    });

    if (!validation.success) {
      // Show validation errors
      validation.error.errors.forEach((err) => {
        const field = err.path[0];
        if (field === 'name') {
          setNameError(err.message);
        } else if (field === 'email') {
          setEmailError(err.message);
        } else if (field === 'password') {
          setPasswordError(err.message);
        } else if (field === 'confirmPassword') {
          setConfirmPasswordError(err.message);
        }
      });
      return;
    }

    // Check rate limiting
    const rateLimiter = createSignupRateLimiter(sanitizedEmail);
    const rateLimitCheck = await rateLimiter.check();

    if (!rateLimitCheck.allowed) {
      Alert.alert('Too Many Attempts', rateLimitCheck.message || 'Please try again later.');
      return;
    }

    setLoading(true);
    try {
      // Record attempt
      await rateLimiter.record();

      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: sanitizedName,
      });

      // Create user profile in Firestore
      await createOrUpdateUserProfile(userCredential.user);

      // Reset rate limiter on successful signup
      await rateLimiter.reset();

      // Navigation will be handled automatically by auth state listener
    } catch (error: any) {
      logError(error, 'SignUpScreen.handleSignUp');
      const errorMessage = getUserFriendlyErrorMessage(error);
      Alert.alert('Sign Up Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (idToken: string) => {
    setLoading(true);
    try {
      await processGoogleSignIn(idToken);
      // Navigation will be handled automatically by auth state listener
    } catch (error: any) {
      logError(error, 'SignUpScreen.handleGoogleResponse');
      const errorMessage = getUserFriendlyErrorMessage(error);
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    if (provider === 'Google') {
      try {
        await promptAsync();
      } catch (error: any) {
        logError(error, 'SignUpScreen.handleSocialSignUp');
        const errorMessage = getUserFriendlyErrorMessage(error);
        Alert.alert('Google Sign-In Error', errorMessage);
      }
    } else {
      Alert.alert('Coming Soon', `${provider} sign up will be available soon`);
    }
  };

  // Real-time validation handlers
  const handleNameChange = (value: string) => {
    setFullName(value);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.header}>
        <Logo variant="red" width={120} style={styles.logo} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our community of believers</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={handleNameChange}
          autoCapitalize="words"
          autoComplete="name"
          error={nameError}
        />

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

        <TextInput
          label="Password"
          placeholder="Min. 8 chars, uppercase, lowercase, number, special char"
          value={password}
          onChangeText={handlePasswordChange}
          isPassword
          autoCapitalize="none"
          error={passwordError}
        />

        <TextInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          isPassword
          autoCapitalize="none"
          error={confirmPasswordError}
        />

        <Button
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          style={styles.signupButton}
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialSignUp('Google')}
        >
          <Text style={styles.socialIcon}>G</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialSignUp('Apple')}
        >
          <Text style={styles.socialIcon}></Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialSignUp('Facebook')}
        >
          <Text style={styles.socialIcon}>f</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
  },
  logo: {
    marginBottom: theme.spacing[6],
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
  },
  form: {
    marginBottom: theme.spacing[6],
  },
  signupButton: {
    width: '100%',
    marginTop: theme.spacing[4],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
  dividerText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    marginHorizontal: theme.spacing[4],
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  loginText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  loginLink: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  terms: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
