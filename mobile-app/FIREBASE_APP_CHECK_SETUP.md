# Firebase App Check Setup Guide

## 🔒 What is Firebase App Check?

Firebase App Check helps protect your backend resources (Firestore, Storage, Cloud Functions) from abuse by preventing unauthorized clients from accessing your Firebase services. It ensures requests come from authentic instances of your app.

**Benefits:**
- ✅ Prevents API abuse and quota theft
- ✅ Protects against automated attacks
- ✅ Reduces fraudulent traffic
- ✅ Blocks bots and scrapers
- ✅ Verifies requests come from your legitimate app

---

## 📱 Implementation Status

✅ **App Check Configured in App**
- Service created: `src/services/appCheck.ts`
- Initialized in: `App.tsx`
- Debug mode enabled for development
- reCAPTCHA v3 provider configured
- Auto-refresh enabled for tokens

---

## 🚀 Setup Instructions

### Step 1: Enable App Check in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `royal-signet` project
3. Click **App Check** in the left sidebar
4. Click **Get started**

---

### Step 2: Register Your Apps

#### For Web/Expo (Development & Testing)

**Option A: Debug Token (Recommended for Development)**

1. Run your app in development mode:
   ```bash
   cd /Users/thomasv/royal-signet/mobile-app
   npm start
   ```

2. Open the app and check the console logs
3. Look for a message like:
   ```
   Firebase App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

4. Copy the debug token

5. In Firebase Console:
   - Go to **App Check**
   - Click on your app
   - Go to **Debug tokens** tab
   - Click **Add debug token**
   - Paste the token and give it a name (e.g., "Development Token")
   - Click **Save**

6. Restart your app - it should now work with App Check!

**Option B: reCAPTCHA v3 (For Web Production)**

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **Create** (+) button
3. Configure:
   - **Label:** Royal Signet App
   - **reCAPTCHA type:** reCAPTCHA v3
   - **Domains:** Add your domains:
     - `localhost` (for testing)
     - Your production domain (e.g., `royalsignet.church`)
   - Accept the terms
   - Click **Submit**

4. Copy the **Site Key**

5. Add to your `.env` file:
   ```env
   EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key_here
   ```

6. In Firebase Console:
   - Go to **App Check** > **Apps**
   - Select your web app (or register a new one)
   - Click **Register**
   - Provider: **reCAPTCHA v3**
   - Enter your reCAPTCHA site key
   - Click **Save**

#### For iOS Production

1. In Firebase Console > **App Check** > **Apps**
2. Select your iOS app (or register a new one)
3. Click **Register**
4. Provider: **App Attest** (for iOS 14+)
5. For iOS 13 and below, also enable **DeviceCheck** as fallback
6. Click **Save**

**Note:** App Attest works automatically once enabled - no additional code needed!

#### For Android Production

1. In Firebase Console > **App Check** > **Apps**
2. Select your Android app (or register a new one)
3. Click **Register**
4. Provider: **Play Integrity API**
5. Click **Save**

**Requirements:**
- Your app must be published on Google Play (or in internal testing)
- SHA-256 certificate fingerprint must be registered in Firebase

---

### Step 3: Enable App Check for Firebase Services

**IMPORTANT:** You must enable App Check for each Firebase service you use.

1. In Firebase Console > **App Check** > **APIs** tab

2. Enable App Check for:
   - ✅ **Cloud Firestore** - Protects database
   - ✅ **Cloud Storage** - Protects file storage
   - ✅ **Cloud Functions** - Protects serverless functions
   - ✅ **Firebase Authentication** - Additional auth security (optional but recommended)

3. **Choose Enforcement Mode:**

   **Option A: Metrics Only (Recommended First)**
   - Monitors requests without blocking
   - Collects data on legitimate vs. suspicious requests
   - Safe way to test before enforcing
   - **Use this first for 1-2 weeks**

   **Option B: Enforced**
   - Blocks requests without valid App Check tokens
   - Use after testing in Metrics mode
   - **Production setting after verification**

4. Click **Enforce** or **Monitor** for each service

---

### Step 4: Update Firestore Security Rules (When Enforcing)

When you switch to **Enforced** mode, update your Firestore security rules to require App Check:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check App Check
    function hasValidAppCheck() {
      return request.auth != null && request.app.appCheckToken != null;
    }

    // Example: Require App Check for all requests
    match /{document=**} {
      allow read, write: if hasValidAppCheck();
    }

    // Or combine with existing rules
    match /users/{userId} {
      allow read: if request.auth != null && request.app.appCheckToken != null;
      allow write: if request.auth.uid == userId && request.app.appCheckToken != null;
    }
  }
}
```

**For gradual rollout:**
```javascript
// Allow requests with OR without App Check (transition period)
function hasValidAppCheckOrAuth() {
  return request.auth != null &&
         (request.app.appCheckToken != null || true);
}
```

---

### Step 5: Update Cloud Storage Rules (When Enforcing)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function
    function hasValidAppCheck() {
      return request.auth != null && request.app.appCheckToken != null;
    }

    match /sermons/{allPaths=**} {
      allow read: if hasValidAppCheck();
      allow write: if false; // Admin only
    }

    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId &&
                            request.app.appCheckToken != null;
    }
  }
}
```

---

### Step 6: Update Cloud Functions (When Enforcing)

For Cloud Functions (when you implement them in Phase 1B):

```typescript
import { HttpsError } from 'firebase-functions/v2/https';
import { AppCheckToken } from 'firebase-admin/app-check';

export const myFunction = onCall(
  {
    // Require App Check
    consumeAppCheckToken: true,
  },
  async (request) => {
    // App Check token automatically validated
    // If invalid, function won't execute

    // Optional: Get App Check info
    const appCheckToken = request.app as AppCheckToken | undefined;

    if (!appCheckToken) {
      throw new HttpsError(
        'failed-precondition',
        'App Check token is required'
      );
    }

    // Your function logic
  }
);
```

---

## 🧪 Testing App Check

### Test in Development

1. Start your app:
   ```bash
   npm start
   ```

2. Check console for App Check initialization:
   ```
   ✅ Firebase App Check initialized successfully
   🔍 App Check: Running in DEBUG mode
   📝 Check console for App Check debug token on first run
   ```

3. If you see a debug token, add it to Firebase Console (Step 2)

4. Restart the app

5. You should see:
   ```
   ✅ Firebase App Check initialized successfully
   ```

### Verify Token Generation

You can manually verify App Check tokens in your code:

```typescript
import { verifyAppCheckSetup, getAppCheckToken } from './src/services/appCheck';

// In a component or test
useEffect(() => {
  verifyAppCheckSetup().then((valid) => {
    console.log('App Check valid:', valid);
  });
}, []);
```

### Monitor in Firebase Console

1. Go to Firebase Console > **App Check** > **Metrics**
2. View:
   - Total requests
   - Requests with valid tokens
   - Requests without tokens
   - Error rates

---

## 🔧 Troubleshooting

### Issue: "App Check debug token not appearing"

**Solution:**
1. Make sure you're running in development mode (`__DEV__` is true)
2. Check that `APP_ENV=development` in your `.env`
3. Clear app cache: `expo start --clear`
4. Check Metro bundler logs

### Issue: "App Check initialization failed"

**Solution:**
1. Verify Firebase is initialized before App Check
2. Check console for specific error messages
3. Ensure internet connection is available
4. Verify Firebase project ID is correct

### Issue: "Requests blocked after enabling enforcement"

**Solution:**
1. Switch back to "Metrics only" mode
2. Check Firebase Console > App Check > Metrics
3. Verify your app is generating valid tokens
4. Ensure debug token is added (for development)
5. Check Firestore/Storage rules aren't blocking requests

### Issue: "reCAPTCHA site key not working"

**Solution:**
1. Verify the site key is correct
2. Check that your domain is added to reCAPTCHA allowed domains
3. Make sure it's a reCAPTCHA **v3** key (not v2)
4. Clear browser cache
5. Try the debug token instead for testing

### Issue: "App Check token expired"

**Solution:**
- Tokens auto-refresh, but you can force refresh:
```typescript
import { getAppCheckToken } from './src/services/appCheck';
await getAppCheckToken(true); // Force refresh
```

---

## 📊 App Check Status Checklist

### Development Setup
- [ ] App Check service created
- [ ] Initialized in App.tsx
- [ ] Debug mode enabled
- [ ] Debug token generated
- [ ] Debug token added to Firebase Console
- [ ] App running without errors

### Production Web Setup
- [ ] reCAPTCHA v3 site registered
- [ ] Site key added to .env
- [ ] Domain added to reCAPTCHA allowed list
- [ ] reCAPTCHA provider configured in Firebase
- [ ] Tested in production build

### Production iOS Setup
- [ ] iOS app registered in Firebase
- [ ] App Attest enabled
- [ ] DeviceCheck enabled (fallback)
- [ ] Tested on physical iOS device
- [ ] Tested on iOS 14+ and iOS 13

### Production Android Setup
- [ ] Android app registered in Firebase
- [ ] Play Integrity API enabled
- [ ] SHA-256 fingerprint registered
- [ ] App published to Play Store (or internal testing)
- [ ] Tested on physical Android device

### Firebase Services Protection
- [ ] App Check enabled for Firestore
- [ ] App Check enabled for Storage
- [ ] App Check enabled for Cloud Functions (when implemented)
- [ ] Started in "Metrics only" mode
- [ ] Monitored for 1-2 weeks
- [ ] Switched to "Enforced" mode
- [ ] Security rules updated to require App Check

---

## 🎯 Recommended Rollout Strategy

### Week 1-2: Monitor Mode
1. Enable App Check in "Metrics only" mode
2. Monitor the Metrics dashboard
3. Identify legitimate vs. suspicious traffic
4. Fix any issues with token generation

### Week 3: Gradual Enforcement
1. Enable enforcement for Cloud Storage first (less critical)
2. Monitor for issues
3. If no problems, enable for Firestore
4. Continue monitoring

### Week 4+: Full Enforcement
1. Enable enforcement for all services
2. Update security rules to require App Check
3. Monitor error rates
4. Set up alerts for high rejection rates

---

## 📱 Platform-Specific Notes

### Expo/React Native
- ✅ Uses web Firebase SDK
- ✅ reCAPTCHA v3 for web platform
- ✅ Debug tokens for development
- ⚠️  Need native builds (not Expo Go) for iOS/Android attestation

### iOS (App Attest)
- **Requires:** iOS 14+
- **Fallback:** DeviceCheck for iOS 13
- **Note:** Works automatically once enabled
- **Testing:** Must test on physical device

### Android (Play Integrity)
- **Requires:** App published on Play Store
- **Alternative:** Internal testing track works
- **Testing:** Must test on physical device with Play Services

---

## 🔐 Security Best Practices

1. **Start with Debug Tokens**
   - Use debug tokens for all development
   - Don't use production keys in development

2. **Gradual Rollout**
   - Start with "Metrics only"
   - Monitor for 1-2 weeks
   - Slowly enable enforcement

3. **Multiple Environments**
   - Use debug tokens for dev
   - Use test reCAPTCHA keys for staging
   - Use production keys for production

4. **Monitor Regularly**
   - Check metrics weekly
   - Set up alerts for anomalies
   - Review rejected requests

5. **Combine with Other Security**
   - App Check + Authentication
   - App Check + Security Rules
   - App Check + Rate Limiting
   - Defense in depth

---

## 📚 Additional Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [App Attest Documentation](https://developer.apple.com/documentation/devicecheck/app_attest_service)
- [Play Integrity API Documentation](https://developer.android.com/google/play/integrity)

---

## ⚠️ Important Notes

1. **Debug Tokens are Permanent**
   - Once added, debug tokens don't expire
   - Only use for development devices
   - Delete unused tokens regularly

2. **Production Requires Native Builds**
   - Expo Go doesn't support App Attest/Play Integrity
   - Must create standalone builds with EAS Build
   - Test thoroughly before production

3. **Token Refresh is Automatic**
   - Tokens refresh every hour
   - No manual intervention needed
   - Monitor token refresh failures

4. **Enforcement Blocks All Unverified Requests**
   - Test thoroughly in Metrics mode first
   - Have rollback plan ready
   - Monitor error rates closely

---

**Last Updated:** November 17, 2025
**Status:** ✅ Implemented - Ready for Testing
**Next Step:** Generate debug token and test in development

