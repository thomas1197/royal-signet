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
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../../services/firebase';
import { processGoogleSignIn, createOrUpdateUserProfile } from '../../services/googleAuth';
import { Button, TextInput, Logo } from '../../components';
import { theme } from '../../theme';
import { loginFormSchema, validateField } from '../../utils/validation';
import { sanitizeEmail } from '../../utils/sanitization';
import { getUserFriendlyErrorMessage, logError } from '../../utils/errorHandling';
import { createLoginRateLimiter } from '../../utils/rateLimiting';
import {
  GOOGLE_EXPO_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '@env';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

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

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email);

    // Validate form data
    const validation = loginFormSchema.safeParse({
      email: sanitizedEmail,
      password: password,
    });

    if (!validation.success) {
      // Show validation errors
      validation.error.errors.forEach((err) => {
        const field = err.path[0];
        if (field === 'email') {
          setEmailError(err.message);
        } else if (field === 'password') {
          setPasswordError(err.message);
        }
      });
      return;
    }

    // Check rate limiting
    const rateLimiter = createLoginRateLimiter(sanitizedEmail);
    const rateLimitCheck = await rateLimiter.check();

    if (!rateLimitCheck.allowed) {
      Alert.alert('Too Many Attempts', rateLimitCheck.message || 'Please try again later.');
      return;
    }

    setLoading(true);
    try {
      // Record attempt before trying to sign in
      await rateLimiter.record();

      await signInWithEmailAndPassword(auth, sanitizedEmail, password);

      // Reset rate limiter on successful login
      await rateLimiter.reset();

      // Navigation will be handled automatically by auth state listener
    } catch (error: any) {
      logError(error, 'LoginScreen.handleLogin');
      const errorMessage = getUserFriendlyErrorMessage(error);
      Alert.alert('Login Error', errorMessage);
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
      logError(error, 'LoginScreen.handleGoogleResponse');
      const errorMessage = getUserFriendlyErrorMessage(error);
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      try {
        await promptAsync();
      } catch (error: any) {
        logError(error, 'LoginScreen.handleSocialLogin');
        const errorMessage = getUserFriendlyErrorMessage(error);
        Alert.alert('Google Sign-In Error', errorMessage);
      }
    } else {
      Alert.alert('Coming Soon', `${provider} login will be available soon`);
    }
  };

  // Real-time validation for email
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      // Clear error when user starts typing
      setEmailError('');
    }
  };

  // Real-time validation for password
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      // Clear error when user starts typing
      setPasswordError('');
    }
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
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

        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          isPassword
          autoCapitalize="none"
          error={passwordError}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword' as never)}
          style={styles.forgotButton}
          activeOpacity={0.6}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title="Log In"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
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
          onPress={() => handleSocialLogin('Google')}
          activeOpacity={0.7}
        >
          <Text style={styles.socialIcon}>G</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Apple')}
          activeOpacity={0.7}
        >
          <Text style={styles.socialIcon}></Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Facebook')}
          activeOpacity={0.7}
        >
          <Text style={styles.socialIcon}>f</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp' as never)}
          activeOpacity={0.6}
        >
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing[6],
  },
  forgotText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  loginButton: {
    width: '100%',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  signupLink: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
});
