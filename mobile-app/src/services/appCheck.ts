/**
 * Firebase App Check Configuration
 *
 * App Check helps protect your backend resources from abuse by preventing
 * unauthorized clients from accessing your backend resources.
 *
 * Providers:
 * - ReCAPTCHA V3: For web and development
 * - Debug Token: For development/testing on physical devices
 * - App Attest (iOS): For production iOS apps
 * - Play Integrity (Android): For production Android apps
 */

import { initializeAppCheck, ReCaptchaV3Provider, getToken, AppCheck } from 'firebase/app-check';
import { FirebaseApp } from 'firebase/app';
import firebaseApp from './firebase';
import { APP_ENV } from '@env';

/**
 * App Check debug token for development
 * Set this in Firebase Console > App Check > Apps > Debug tokens
 */
declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

/**
 * Initialize Firebase App Check
 *
 * IMPORTANT: Before using this in production:
 * 1. Register your app in Firebase Console > App Check
 * 2. Enable App Check for:
 *    - Firestore
 *    - Storage
 *    - Cloud Functions
 *    - Authentication (optional but recommended)
 * 3. Configure the appropriate provider:
 *    - For web: Get reCAPTCHA v3 site key
 *    - For iOS: Enable App Attest
 *    - For Android: Enable Play Integrity
 */
export function initializeFirebaseAppCheck() {
  try {
    // Check if we're in a web environment
    // App Check with ReCAPTCHA only works in web browsers
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

    if (!isWeb) {
      console.log('ℹ️  App Check: Skipping initialization (React Native environment)');
      console.log('📱 App Check for mobile requires native builds with:');
      console.log('   - iOS: App Attest (requires EAS Build)');
      console.log('   - Android: Play Integrity (requires EAS Build)');
      console.log('✅ For development in Expo Go, this is expected and safe');
      console.log('⚠️  Will need to configure App Check for production native builds');
      return null;
    }

    // Enable debug mode in development
    // This allows testing without configuring production attestation
    if (__DEV__ || APP_ENV === 'development') {
      // Enable debug token for development
      // Firebase will log a debug token to console on first run
      // Add this token to Firebase Console > App Check > Debug tokens
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

      console.log('🔍 App Check: Running in DEBUG mode (Web)');
      console.log('📝 Check console for App Check debug token on first run');
      console.log('➡️  Add the debug token in Firebase Console > App Check > Apps > Debug tokens');
    }

    // Initialize App Check (Web only)
    const appCheck: AppCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(
        // ReCAPTCHA v3 site key from Firebase Console
        // For development, you can use a test key or debug mode
        // For production, MUST set real reCAPTCHA v3 site key
        getRecaptchaSiteKey()
      ),
      isTokenAutoRefreshEnabled: true, // Automatically refresh tokens
    });

    console.log('✅ Firebase App Check initialized successfully (Web)');
    return appCheck;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase App Check:', error);
    console.error('⚠️  App may not be protected against abuse in web environment');

    // Don't throw - allow app to continue without App Check
    // This prevents app crashes but logs the issue
    return null;
  }
}

/**
 * Get reCAPTCHA site key based on environment
 */
function getRecaptchaSiteKey(): string {
  // In development, return placeholder
  // App Check debug mode will be used instead
  if (__DEV__ || APP_ENV === 'development') {
    // Placeholder - debug mode will be used
    return '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Google's test key
  }

  // In production, use environment variable
  // MUST be set before production deployment
  const siteKey = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error('❌ EXPO_PUBLIC_RECAPTCHA_SITE_KEY not set!');
    console.error('⚠️  Set this in .env for production builds');
    return '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Fallback to test key
  }

  return siteKey;
}

/**
 * Manually get App Check token
 * Useful for debugging or manual verification
 */
export async function getAppCheckToken(forceRefresh: boolean = false): Promise<string | null> {
  try {
    const appCheckInstance = initializeFirebaseAppCheck();
    if (!appCheckInstance) {
      console.error('App Check not initialized');
      return null;
    }

    const token = await getToken(appCheckInstance, forceRefresh);

    if (__DEV__) {
      console.log('🔑 App Check token obtained:', {
        tokenLength: token.token.length,
      });
    }

    return token.token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    return null;
  }
}

/**
 * Check if App Check is properly configured
 * Use this for debugging
 */
export async function verifyAppCheckSetup(): Promise<boolean> {
  try {
    const token = await getAppCheckToken();

    if (token) {
      console.log('✅ App Check is working correctly');
      return true;
    } else {
      console.error('❌ App Check is not working');
      return false;
    }
  } catch (error) {
    console.error('❌ App Check verification failed:', error);
    return false;
  }
}

/**
 * App Check Setup Instructions
 *
 * DEVELOPMENT SETUP:
 * 1. Run the app in development mode
 * 2. Check console for App Check debug token
 * 3. Copy the token
 * 4. Go to Firebase Console > App Check > Apps
 * 5. Select your app
 * 6. Click "Debug tokens" tab
 * 7. Add the debug token
 * 8. Restart the app
 *
 * PRODUCTION SETUP (WEB):
 * 1. Go to https://www.google.com/recaptcha/admin
 * 2. Register a new reCAPTCHA v3 site
 * 3. Add your domain
 * 4. Copy the site key
 * 5. Add to .env: EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
 * 6. Enable App Check in Firebase Console for all services
 *
 * PRODUCTION SETUP (iOS):
 * 1. Go to Firebase Console > App Check
 * 2. Select your iOS app
 * 3. Enable App Attest
 * 4. App Attest will be used automatically on iOS 14+
 * 5. For iOS 13 and below, configure DeviceCheck as fallback
 *
 * PRODUCTION SETUP (Android):
 * 1. Go to Firebase Console > App Check
 * 2. Select your Android app
 * 3. Enable Play Integrity API
 * 4. Ensure your app is published on Google Play (or use internal testing)
 *
 * ENABLE APP CHECK FOR SERVICES:
 * 1. Go to Firebase Console > App Check
 * 2. Click "APIs" tab
 * 3. Enable App Check for:
 *    - Cloud Firestore
 *    - Cloud Storage
 *    - Cloud Functions
 *    - Firebase Authentication (recommended)
 * 4. Set enforcement mode:
 *    - "Metrics only" - Monitor without blocking (recommended first)
 *    - "Enforced" - Block unauthenticated requests (production)
 */
