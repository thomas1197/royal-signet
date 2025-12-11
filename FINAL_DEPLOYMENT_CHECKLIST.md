# Royal Signet Church App - Final Deployment Checklist

## Pre-Deployment Security Audit Completed

The following security measures are in place:

### Input Validation & Sanitization
- [x] Zod schema validation for all forms (login, signup, donations, prayers)
- [x] XSS prevention (script tag removal, event handler removal)
- [x] SQL/NoSQL injection prevention (input sanitization)
- [x] HTML entity escaping
- [x] URL protocol validation (only http/https allowed)
- [x] Email, phone, name sanitization functions

### Rate Limiting
- [x] Login attempts: 5 per 15 minutes
- [x] Signup attempts: 3 per hour
- [x] Password reset: 3 per hour
- [x] OTP verification: 5 per 30 minutes

### Firebase Security Rules (PRODUCTION HARDENED)
- [x] Donations: Only Cloud Functions can write (users cannot manipulate)
- [x] User profiles: Users can only edit their own (except role changes)
- [x] Sermons/Events/Updates: Only pastor/admin can write
- [x] Prayer requests: Users can only edit/delete their own
- [x] Church members directory: Pastor-only access
- [x] Sunday School data: Role-based access control

### Payment Security
- [x] Stripe handles all card data (PCI-DSS compliant)
- [x] No card numbers stored in Firebase
- [x] Webhook signature verification
- [x] Amount validation ($1-$10,000 limits)
- [x] User authentication required for donations

### PII Protection
- [x] User data only accessible by owner or authorized roles
- [x] Donation history only visible to donor
- [x] Church member contacts restricted to pastor
- [x] Family data restricted to family members

---

## Step-by-Step Deployment Guide

### Phase 1: Developer Accounts (Do This First)

#### Apple Developer Account
- [ ] Go to: https://developer.apple.com/programs/
- [ ] Sign up for Apple Developer Program ($99/year)
- [ ] Complete identity verification (may take 24-48 hours)
- [ ] Note your **Team ID** (found in Membership details)

#### Google Play Developer Account
- [ ] Go to: https://play.google.com/console/signup
- [ ] Pay one-time fee ($25)
- [ ] Complete account setup
- [ ] Create a new app listing for "Royal Signet Church"

---

### Phase 2: Rotate API Keys (Security Critical)

Since development keys were exposed, create NEW production keys:

#### Firebase
- [ ] Go to: https://console.firebase.google.com → Project Settings
- [ ] Go to Google Cloud Console → APIs & Credentials
- [ ] Create NEW API key (restrict to your app's bundle IDs)
- [ ] Delete or restrict the old development API key

#### Google OAuth
- [ ] Go to: https://console.cloud.google.com → APIs & Credentials
- [ ] Create NEW OAuth 2.0 Client IDs:
  - [ ] **iOS Client**: Bundle ID = `com.royalsignet.church`
  - [ ] **Android Client**: Package = `com.royalsignet.church` + SHA-1 fingerprint
  - [ ] **Web Client**: For Expo authentication

#### Stripe
- [ ] Go to: https://dashboard.stripe.com
- [ ] Complete business verification (required for live mode)
- [ ] Switch to **Live Mode**
- [ ] Copy your LIVE publishable key (`pk_live_...`)
- [ ] Copy your LIVE secret key (`sk_live_...`) - for Firebase Functions only

#### reCAPTCHA (for Firebase App Check)
- [ ] Go to: https://www.google.com/recaptcha/admin
- [ ] Create NEW reCAPTCHA v3 site key for production

---

### Phase 3: Create Production Environment

#### Create .env.production file
```bash
cd /Users/thomasv/Documents/Side_Projects/royal-signet/mobile-app
cp .env.production.template .env.production
# Edit .env.production with your NEW production keys
```

Required values in `.env.production`:
- [ ] `FIREBASE_API_KEY` - NEW production key
- [ ] `GOOGLE_WEB_CLIENT_ID` - NEW production OAuth client
- [ ] `GOOGLE_IOS_CLIENT_ID` - NEW production OAuth client
- [ ] `GOOGLE_ANDROID_CLIENT_ID` - NEW production OAuth client
- [ ] `STRIPE_PUBLISHABLE_KEY` - Live key (`pk_live_...`)
- [ ] `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` - Production reCAPTCHA

---

### Phase 4: Configure Firebase Functions

```bash
cd /Users/thomasv/Documents/Side_Projects/royal-signet/firebase/functions

# Set Stripe LIVE secret key
firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_SECRET_KEY"

# Set Stripe webhook secret (get from Stripe Dashboard after creating webhook)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"

# Set SendGrid API key (if using email)
firebase functions:config:set sendgrid.key="SG.YOUR_SENDGRID_KEY"

# Deploy functions
firebase deploy --only functions
```

---

### Phase 5: Deploy Firebase Security Rules

```bash
cd /Users/thomasv/Documents/Side_Projects/royal-signet

# Deploy production security rules
firebase deploy --only firestore:rules

# Verify rules are deployed
firebase firestore:rules --project royal-signet
```

---

### Phase 6: Set Up EAS (Expo Application Services)

```bash
cd /Users/thomasv/Documents/Side_Projects/royal-signet/mobile-app

# Install EAS CLI if not already
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS project (this creates/links project ID)
eas build:configure

# Update app.json with the project ID from above step
```

Update these files with your actual values:
- [ ] `app.json` → `extra.eas.projectId`
- [ ] `eas.json` → `submit.production.ios.appleId`
- [ ] `eas.json` → `submit.production.ios.ascAppId`
- [ ] `eas.json` → `submit.production.ios.appleTeamId`

---

### Phase 7: Build Apps

```bash
cd /Users/thomasv/Documents/Side_Projects/royal-signet/mobile-app

# Build for iOS (App Store)
eas build --profile production --platform ios

# Build for Android (Play Store)
eas build --profile production --platform android
```

**Note:** First build will prompt you to:
- [ ] Create/manage iOS certificates (let EAS handle this)
- [ ] Create Android keystore (let EAS handle this - SAVE THE CREDENTIALS!)

---

### Phase 8: Test Builds

Before submitting to stores:

- [ ] Download iOS build from EAS dashboard
- [ ] Install on physical iPhone via TestFlight or ad-hoc
- [ ] Download Android APK from EAS dashboard
- [ ] Install on physical Android device

#### Test Checklist
- [ ] Login with email/password works
- [ ] Google Sign-In works
- [ ] All screens load properly
- [ ] Donation flow works (test with small amount like $1)
- [ ] Prayer wall loads and allows posting
- [ ] Events display correctly
- [ ] Sermons play correctly
- [ ] Push notifications work (if implemented)

---

### Phase 9: App Store Submission

#### iOS App Store

1. **Create App Store Connect Listing**
   - [ ] Go to: https://appstoreconnect.apple.com
   - [ ] Create new app
   - [ ] Bundle ID: `com.royalsignet.church`
   - [ ] Fill in app information

2. **Required Assets**
   - [ ] App icon (1024x1024)
   - [ ] Screenshots for iPhone (6.5" and 5.5")
   - [ ] Screenshots for iPad (if supporting)
   - [ ] App description
   - [ ] Keywords
   - [ ] Privacy Policy URL: `https://thomas1197.github.io/royal-signet/privacy`
   - [ ] Support URL

3. **Submit**
   ```bash
   eas submit --platform ios
   ```

4. **App Review**
   - Review typically takes 1-7 days
   - May require test account for reviewer

#### Google Play Store

1. **Create Play Console Listing**
   - [ ] Go to: https://play.google.com/console
   - [ ] Create app → "Royal Signet Church"
   - [ ] Fill in store listing

2. **Required Assets**
   - [ ] App icon (512x512)
   - [ ] Feature graphic (1024x500)
   - [ ] Screenshots (phone and tablet)
   - [ ] Short description (80 chars)
   - [ ] Full description
   - [ ] Privacy Policy URL: `https://thomas1197.github.io/royal-signet/privacy`

3. **Create Service Account for EAS**
   - [ ] Go to Google Cloud Console → Service Accounts
   - [ ] Create service account with Play Console access
   - [ ] Download JSON key file
   - [ ] Save as `google-play-service-account.json` in mobile-app folder
   - [ ] Add to `.gitignore` (already done)

4. **Submit**
   ```bash
   eas submit --platform android
   ```

5. **Release Track**
   - Start with **Internal Testing** (immediate, no review)
   - Then promote to **Closed Testing**
   - Finally **Production** (review: 1-3 days)

---

### Phase 10: Post-Deployment

- [ ] Set up Firebase budget alerts ($25/month recommended)
- [ ] Monitor Stripe dashboard for donations
- [ ] Set up crash reporting (Sentry or Firebase Crashlytics)
- [ ] Create support email: support@royalsignet.church
- [ ] Update legal documents with actual church address and EIN

---

## Quick Reference: Key URLs

| Service | URL |
|---------|-----|
| Firebase Console | https://console.firebase.google.com |
| Google Cloud Console | https://console.cloud.google.com |
| Stripe Dashboard | https://dashboard.stripe.com |
| Apple Developer | https://developer.apple.com |
| App Store Connect | https://appstoreconnect.apple.com |
| Google Play Console | https://play.google.com/console |
| EAS Dashboard | https://expo.dev |
| GitHub Repo | https://github.com/thomas1197/royal-signet |
| Privacy Policy | https://thomas1197.github.io/royal-signet/privacy |
| Terms of Service | https://thomas1197.github.io/royal-signet/terms |

---

## Estimated Timeline

| Task | Duration |
|------|----------|
| Developer accounts setup | 1-2 days (Apple verification) |
| API key rotation | 1-2 hours |
| Production environment | 1-2 hours |
| Firebase deployment | 30 minutes |
| EAS build (both platforms) | 30-60 minutes |
| Testing on devices | 2-3 hours |
| Store listing creation | 2-3 hours |
| App Store review | 1-7 days |
| Play Store review | 1-3 days |
| **Total** | **~1-2 weeks** |

---

## Support

If you encounter issues:
- EAS Build issues: https://docs.expo.dev/build/troubleshooting/
- Firebase issues: https://firebase.google.com/support
- Stripe issues: https://support.stripe.com
- App Store rejection: Review the rejection reason and fix accordingly

---

*Document created: December 11, 2025*
*App Version: 1.0.0*
