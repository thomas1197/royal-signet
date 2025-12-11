declare module '@env' {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;

  export const GOOGLE_EXPO_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_ANDROID_CLIENT_ID: string;
  export const GOOGLE_WEB_CLIENT_ID: string;

  export const STRIPE_PUBLISHABLE_KEY: string;

  export const EXPO_PUBLIC_RECAPTCHA_SITE_KEY: string;

  export const APP_ENV: 'development' | 'staging' | 'production';
}
