# Royal Signet Church App - Build & Deployment Guide

**Version:** 1.0.0
**Last Updated:** November 17, 2025
**Target Launch:** [TBD after testing]

---

## 📋 Overview

This guide walks you through building and deploying the Royal Signet Church mobile app to production (Apple App Store and Google Play Store).

**Estimated Time:** 6-8 hours (first time), 2-3 hours (subsequent builds)

---

## ✅ Prerequisites Checklist

Before starting, ensure you have completed:

### Phase 1B Testing
- [ ] Tested donation flow with Stripe test cards
- [ ] Verified Firebase Cloud Functions are deployed
- [ ] Verified emails are sending (welcome + donation receipts)
- [ ] All Phase 1B features working correctly

### Legal Documents
- [ ] Privacy Policy created and hosted
- [ ] Terms of Service created and hosted
- [ ] Donation Terms created and hosted
- [ ] URLs:
  - https://royalsignet.church/privacy
  - https://royalsignet.church/terms
  - https://royalsignet.church/donation-terms

### Accounts & Services
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Stripe account (live mode enabled)
- [ ] SendGrid account (domain verified)
- [ ] Firebase (Blaze plan, production configured)
- [ ] Expo/EAS account

### App Assets
- [ ] App icon (1024×1024 PNG)
- [ ] Splash screen created
- [ ] Screenshots taken (5-8 per platform)
- [ ] App description written

---

## 🎨 Step 1: Create App Icons & Branding (2 hours)

### 1.1 Design App Icon

Your app icon should:
- Be 1024×1024 pixels (PNG)
- Feature church branding (maroon #8B0101 + gold #FFD700)
- Include church name or logo
- Be recognizable at small sizes
- Follow platform guidelines

**Recommended Tools:**
- Figma (free): https://figma.com
- Canva (free): https://canva.com
- Adobe Illustrator (paid)

**Icon Guidelines:**
- **iOS:** No transparency, square with rounded corners applied by system
- **Android:** Can have transparency, adaptive icon (foreground + background)

### 1.2 Create Icon Files

Save your 1024×1024 icon as:
```
/Users/thomasv/royal-signet/mobile-app/assets/icon.png
```

### 1.3 Create Adaptive Icon (Android)

Android requires separate foreground and background layers:

**Foreground** (icon.png without background):
```
/Users/thomasv/royal-signet/mobile-app/assets/adaptive-icon.png
```

**Background color:** Set in `app.json`:
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#8B0101"
  }
}
```

### 1.4 Create Splash Screen

Design a splash screen (1242×2688 pixels) that shows:
- Church name: "Royal Signet Church"
- Tagline: "Come as You Are"
- Church logo/icon
- Background color: #8B0101 (maroon)

Save as:
```
/Users/thomasv/royal-signet/mobile-app/assets/splash-icon.png
```

### 1.5 Create Favicon

For web version, create a 48×48 pixel favicon:
```
/Users/thomasv/royal-signet/mobile-app/assets/favicon.png
```

---

## 🔧 Step 2: Configure Production Environment (1 hour)

### 2.1 Create Production Environment File

Copy the template:
```bash
cd /Users/thomasv/royal-signet/mobile-app
cp .env.production.template .env.production
```

### 2.2 Set Production Variables

Edit `.env.production` and fill in ALL values:

**⚠️ CRITICAL: Use PRODUCTION keys, not test keys!**

```env
# Firebase (get new production keys from Firebase Console)
FIREBASE_API_KEY=your_new_production_key
FIREBASE_APP_ID=your_production_app_id
# ... etc

# Google OAuth (create new production OAuth clients)
GOOGLE_WEB_CLIENT_ID=your_production_client_id
GOOGLE_IOS_CLIENT_ID=your_ios_production_client_id
GOOGLE_ANDROID_CLIENT_ID=your_android_production_client_id

# Stripe (switch to LIVE mode)
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here

# App Check
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your_production_recaptcha_key

# Environment
APP_ENV=production
```

### 2.3 Rotate Firebase Keys

**Why?** Current Firebase keys are exposed in git history.

1. Go to [Firebase Console](https://console.firebase.google.com/project/royal-signet/settings/general)
2. Scroll to "Your apps" → Select your app
3. Click "Show config"
4. **Create NEW API key** (if available) or regenerate
5. Update `.env.production` with new keys
6. Delete old keys after successful deployment

### 2.4 Configure Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **NEW** OAuth 2.0 Client IDs for production:

**Web Client:**
```
Application type: Web application
Name: Royal Signet Church (Production)
Authorized JavaScript origins:
  - https://royalsignet.church
Authorized redirect URIs:
  - https://auth.expo.io/@royal-signet-church/royal-signet-church
```

**iOS Client:**
```
Application type: iOS
Name: Royal Signet Church iOS (Production)
Bundle ID: com.royalsignet.church
```

**Android Client:**
```
Application type: Android
Name: Royal Signet Church Android (Production)
Package name: com.royalsignet.church
SHA-1 certificate fingerprint: [Get from EAS Build in next step]
```

3. Copy client IDs to `.env.production`

### 2.5 Configure Stripe Production

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Switch from Test Mode to Live Mode** (toggle in top right)
3. Complete business verification if not done
4. Go to Developers → API Keys
5. Copy **Publishable key** (pk_live_...) to `.env.production`
6. Copy **Secret key** (sk_live_...) - DON'T commit to git!

**Configure Firebase Functions:**
```bash
firebase functions:config:set stripe.secret_key="sk_live_YOUR_SECRET_KEY"
```

### 2.6 Configure Stripe Webhook for Production

After deploying functions (Step 3), get your production webhook URL and configure:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint
3. URL: `https://us-central1-royal-signet.cloudfunctions.net/stripeWebhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Add endpoint
6. Copy signing secret (whsec_...)

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_PRODUCTION_SECRET"
```

### 2.7 Verify SendGrid Configuration

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Settings → Sender Authentication
3. Verify your **domain** (not just email): royalsignet.church
4. Add DNS records to your domain registrar
5. Wait for verification (can take 24-48 hours)

**Configure Firebase Functions:**
```bash
firebase functions:config:get sendgrid.key
# If not set or needs update:
firebase functions:config:set sendgrid.key="SG.YOUR_API_KEY"
```

---

## ☁️ Step 3: Deploy Firebase (30 minutes)

### 3.1 Deploy Cloud Functions

```bash
cd /Users/thomasv/royal-signet/firebase/functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to production
firebase deploy --only functions

# Expected output:
# ✔ functions[createPaymentIntent(us-central1)]: Successful update operation
# ✔ functions[stripeWebhook(us-central1)]: Successful update operation
# ✔ functions[sendWelcomeEmail(us-central1)]: Successful update operation
```

**Note the function URLs** - you'll need the stripeWebhook URL for Stripe configuration.

### 3.2 Deploy Firestore Security Rules

```bash
cd /Users/thomasv/royal-signet
firebase deploy --only firestore:rules

# Expected output:
# ✔ firestore: rules updated
```

### 3.3 Enable Firebase App Check

1. Go to [Firebase Console](https://console.firebase.google.com/project/royal-signet/appcheck)
2. Click "Register app" for each platform:

**Web:**
- Provider: reCAPTCHA v3
- Site key: (from `.env.production`)
- Enable enforcement

**iOS:**
- Provider: App Attest
- Enable enforcement

**Android:**
- Provider: Play Integrity
- Enable enforcement

### 3.4 Set Budget Alerts

1. Firebase Console → Usage and Billing → Details & Settings
2. Set monthly budget: $25 (recommended for small church)
3. Set alert at 50%, 90%, 100%
4. Add email: admin@royalsignet.church

---

## 📱 Step 4: Build Mobile Apps (2-3 hours)

### 4.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 4.2 Configure EAS for Your Project

```bash
cd /Users/thomasv/royal-signet/mobile-app

# Initialize EAS (if not done)
eas build:configure
```

### 4.3 Update EAS Configuration

Edit `eas.json` (already created) and update:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

### 4.4 Set Environment Variables for Build

Create build secrets in EAS:

```bash
# For each variable in .env.production:
eas secret:create --scope project --name FIREBASE_API_KEY --value "your_value"
eas secret:create --scope project --name STRIPE_PUBLISHABLE_KEY --value "pk_live_..."
# Repeat for all environment variables
```

**Or** use `.env.production` file (ensure it's not in .gitignore for builds):

### 4.5 Build iOS App

```bash
# Preview build (internal testing)
eas build --profile preview --platform ios

# Production build (App Store)
eas build --profile production --platform ios
```

**Build time:** 15-30 minutes

**Output:**
- Download IPA file
- Or install directly on device for testing

### 4.6 Build Android App

```bash
# Preview build (APK for testing)
eas build --profile preview --platform android

# Production build (App Bundle for Google Play)
eas build --profile production --platform android
```

**Build time:** 15-30 minutes

**Output:**
- APK (preview) or AAB (production)
- Download for testing

### 4.7 Get Android SHA-1 Certificate

After first Android build:

```bash
eas credentials

# Select Android
# Select Production
# Select "Set up a new keystore"
# Copy SHA-1 fingerprint
```

**Update Google OAuth:**
1. Go back to Google Cloud Console
2. Edit Android OAuth client
3. Add SHA-1 fingerprint
4. Save

---

## ✅ Step 5: Test Production Builds (2-3 hours)

### 5.1 Install on Test Devices

**iOS:**
```bash
# Install preview build on physical device
eas build:run --profile preview --platform ios
```

**Android:**
```bash
# Download APK and install on device
# Or use: eas build:run --profile preview --platform android
```

### 5.2 Run Production Testing Checklist

Follow `PRODUCTION_TESTING_CHECKLIST.md` completely:

**CRITICAL Tests:**
- [ ] Authentication (email, Google Sign-In)
- [ ] **Make REAL $1 donation with REAL credit card**
- [ ] Verify donation in Stripe LIVE dashboard
- [ ] Verify donation in Firebase production database
- [ ] Verify receipt email sent
- [ ] Test all screens and features
- [ ] Test on multiple devices and OS versions

**⚠️ Important:** Test with SMALL real donations ($1-5) to verify the complete flow works with live Stripe.

### 5.3 Fix Critical Bugs

If you find critical bugs:
1. Fix in code
2. Rebuild: `eas build --profile production --platform [ios/android]`
3. Re-test
4. Repeat until all critical bugs resolved

---

## 🍎 Step 6: Submit to Apple App Store (1 hour)

### 6.1 Create App Store Connect Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform:** iOS
   - **Name:** Royal Signet Church
   - **Primary Language:** English
   - **Bundle ID:** com.royalsignet.church (should appear in dropdown)
   - **SKU:** royal-signet-church-ios
   - **User Access:** Full Access

### 6.2 Prepare App Store Metadata

**App Information:**
- **Name:** Royal Signet Church
- **Subtitle:** Connect, Grow, Give
- **Category:** Lifestyle (or Social Networking)
- **Age Rating:** 4+ (or appropriate)

**Description:**
```
Connect with Royal Signet Church wherever you are! Our app brings the church community to your mobile device with:

• WATCH SERMONS - Access our latest messages and teachings
• STAY UPDATED - Get church news, events, and announcements
• GIVE SECURELY - Support our mission with easy, secure donations
• PRAYER WALL - Share and respond to prayer requests
• LIFE GROUPS - Find and connect with small groups
• EVENTS - RSVP and get reminders for upcoming events

Royal Signet Church is a welcoming community where people encounter God, grow in faith, and serve others with love.

"Come as You Are" - Everyone is welcome!

Features:
✓ Live and recorded sermons
✓ Secure online giving (powered by Stripe)
✓ Interactive prayer wall
✓ Event calendar and RSVP
✓ Life group information
✓ Push notifications for updates
✓ Beautiful, easy-to-use interface

Download now and stay connected with our church family!
```

**Keywords:**
```
church, worship, sermons, prayer, donate, christian, faith, community, bible, tithe, offering
```

**Support URL:**
```
https://royalsignet.church/support
```

**Marketing URL:**
```
https://royalsignet.church
```

**Privacy Policy URL:**
```
https://royalsignet.church/privacy
```

### 6.3 Upload Screenshots

Required screenshot sizes for iPhone:
- 6.5" display (iPhone 14 Pro Max, 15 Pro Max): 1284 × 2778
- 5.5" display (iPhone 8 Plus): 1242 × 2208

**Tip:** Use Simulator or real device + Screenshot tool

Take 5-8 screenshots showing:
1. Home screen
2. Sermon list
3. Video player
4. Prayer wall
5. Donation screen
6. Event list
7. Profile/settings
8. (Optional) Feature highlight

### 6.4 Upload Build

**Option A: Using EAS Submit (Recommended)**
```bash
eas submit --platform ios --profile production
```

**Option B: Manual Upload**
1. Download IPA from EAS Build
2. Use Transporter app to upload to App Store Connect
3. Wait for processing (15-60 minutes)

### 6.5 Complete App Review Information

**Sign-in Required:** Yes
- **Demo Account:**
  - Username: review@royalsignet.church
  - Password: [Create a test account]
  - Instructions: [Any special instructions]

**Contact Information:**
- **First Name:** [Your Name]
- **Last Name:** [Your Name]
- **Phone:** [Church Phone]
- **Email:** appstore@royalsignet.church

**Notes for Review:**
```
This is the official mobile app for Royal Signet Church. The app includes donation functionality using Stripe for secure payment processing. All donations go to our 501(c)(3) nonprofit organization (Tax ID: [EIN]).

Test Account Credentials:
Email: review@royalsignet.church
Password: [Password]

For donation testing, you may use Stripe test card: 4242 4242 4242 4242

Please contact us if you have any questions: [Phone]
```

**Age Rating:**
- Complete questionnaire (likely 4+)

### 6.6 Submit for Review

1. Select build version
2. Review all information
3. Check "Manual release" (recommended for first release)
4. Click "Add for Review"
5. Click "Submit for Review"

**Review Time:** Typically 1-3 days

**You'll receive emails about:**
- App received
- In review
- Approved or Rejected

---

## 🤖 Step 7: Submit to Google Play Store (1 hour)

### 7.1 Create Google Play Console Listing

1. Go to [Google Play Console](https://play.google.com/console/)
2. Click "Create app"
3. Fill in:
   - **App name:** Royal Signet Church
   - **Default language:** English (US)
   - **App or game:** App
   - **Free or paid:** Free
   - **Declarations:** Check all applicable boxes

### 7.2 Set Up App

**Main Store Listing:**
- **App name:** Royal Signet Church
- **Short description (80 chars):**
  ```
  Connect with Royal Signet Church - Sermons, events, prayer wall, and giving
  ```
- **Full description (4000 chars):**
  ```
  [Use similar description from App Store, expand if needed]
  ```

**App icon:**
- Upload 512 × 512 PNG (32-bit) with transparency

**Feature graphic:**
- Upload 1024 × 500 PNG or JPEG
- Design with church name and key feature highlights

**Phone screenshots:**
- Minimum 2, maximum 8
- JPEG or 24-bit PNG (no alpha)
- Size: 16:9 or 9:16 ratio
- Minimum dimension: 320px
- Maximum dimension: 3840px

**7" Tablet screenshots:** (Optional but recommended)
- Same requirements as phone
- Different aspect ratio

**App category:**
- Category: Lifestyle
- Tags: church, worship, christian

**Contact details:**
- **Email:** support@royalsignet.church
- **Phone:** [Church Phone]
- **Website:** https://royalsignet.church

**Privacy Policy:**
- URL: https://royalsignet.church/privacy

### 7.3 Set Up Store Settings

**App access:**
- [ ] All functionality is available without restrictions

**Or if restricted:**
- [ ] Requires sign-in
- Provide test credentials:
  - Email: review@royalsignet.church
  - Password: [Password]

**Ads:**
- [ ] No, app does not contain ads

**Content rating:**
- Complete questionnaire
- Likely rating: Everyone or Everyone 10+

**Target audience:**
- Select: 18+ (for donation features)

**News app:**
- [ ] No

**COVID-19 contact tracing:**
- [ ] No

**Data safety:**
- Complete detailed questionnaire about data collection
- Based on Privacy Policy:
  - [ ] Collects: Email, name, location (optional), payment info
  - [ ] Shares: With Firebase, Stripe, SendGrid
  - [ ] Encrypted in transit: Yes
  - [ ] Users can request deletion: Yes

### 7.4 Upload App Bundle

**Option A: Using EAS Submit (Recommended)**
```bash
eas submit --platform android --profile production
```

**Option B: Manual Upload**
1. Go to Production → Releases
2. Create new release
3. Upload AAB file from EAS Build
4. Fill in release notes:
   ```
   Initial release of Royal Signet Church mobile app.

   Features:
   - Access sermons and teachings
   - View events and RSVP
   - Prayer wall community
   - Secure online giving
   - Life group information
   - Church updates and news
   ```

### 7.5 Create Release

1. Select "Internal testing" track first (recommended)
2. Add testers' email addresses
3. Review and roll out
4. Test thoroughly
5. Then promote to "Production" when ready

### 7.6 Submit for Review

1. Complete all required sections
2. Review "Publishing overview"
3. Click "Send for review"

**Review Time:** 1-7 days (often faster than iOS)

---

## 📊 Step 8: Post-Launch Monitoring (Ongoing)

### 8.1 Monitor Launch Day

**First 24 Hours:**
- [ ] Check for crashes (Firebase Crashlytics)
- [ ] Monitor error rates (Firebase Console)
- [ ] Watch for failed donations (Stripe Dashboard)
- [ ] Monitor email delivery (SendGrid Dashboard)
- [ ] Check App Store reviews and ratings
- [ ] Respond to user feedback

### 8.2 Set Up Alerts

**Firebase:**
- Crashlytics: Email on new crash types
- Budget: Alert at 50%, 90%, 100% of budget

**Stripe:**
- Email on failed payments
- Email on disputes/chargebacks

**SendGrid:**
- Email on bounces
- Email on spam reports

### 8.3 Create Monitoring Dashboard

Track key metrics:
- **Downloads:** App Store + Google Play analytics
- **Active users:** Firebase Analytics
- **Donations:** Stripe Dashboard
- **Crashes:** Firebase Crashlytics
- **Ratings:** App Store Connect + Play Console

### 8.4 Plan First Update

Schedule v1.1 with:
- Bug fixes from user feedback
- Admin dashboard (if not included in v1.0)
- Push notifications
- Recurring donations
- Any requested features

---

## 🆘 Troubleshooting

### Build Fails

**Error: Unable to resolve module**
```bash
cd /Users/thomasv/royal-signet/mobile-app
npm install
npx expo start --clear
```

**Error: Environment variable not found**
- Check `.env.production` exists
- Verify all variables set
- Try: `eas secret:list` to see EAS secrets

**Error: Certificate/provisioning issues (iOS)**
```bash
eas credentials
# Let EAS manage credentials automatically
```

### App Rejected

**Common rejection reasons:**
1. **Demo account doesn't work** - Verify credentials
2. **Privacy Policy missing/incomplete** - Add all required sections
3. **IAP not using Apple payment** - Donations via web processor are allowed for 501(c)(3)
4. **Crashes during review** - Test thoroughly before submission
5. **Metadata issues** - Check screenshots, description accuracy

**If rejected:**
1. Read rejection reason carefully
2. Fix issues
3. Respond in Resolution Center (App Store) or reply to email (Google Play)
4. Resubmit

### Donations Not Working

**Check:**
1. Stripe in LIVE mode (not test mode)
2. Stripe webhook configured correctly
3. Firebase Functions deployed with production config
4. `.env.production` has `pk_live_...` key

**Test:**
```bash
# Check Firebase Functions config
firebase functions:config:get

# Check functions logs
firebase functions:log --only createPaymentIntent
```

---

## 📅 Timeline Summary

| Phase | Duration | When |
|-------|----------|------|
| **Icons & Branding** | 2 hours | Week 1, Day 1-2 |
| **Production Config** | 1 hour | Week 1, Day 2 |
| **Deploy Firebase** | 30 min | Week 1, Day 2 |
| **Build Apps** | 2-3 hours | Week 1, Day 3-4 |
| **Test Builds** | 2-3 hours | Week 1, Day 4-5 |
| **App Store Submit** | 1 hour | Week 1, Day 5 |
| **Play Store Submit** | 1 hour | Week 1, Day 5 |
| **Review Wait** | 1-7 days | Week 2 |
| **Launch** | Day 1 | Week 2+ |
| **Post-Launch** | Ongoing | Week 2+ |

**Total Active Time:** 8-12 hours
**Total Calendar Time:** 1-2 weeks (including review)

---

## ✅ Final Pre-Launch Checklist

Before submitting to stores:

### Technical
- [ ] All tests passing (see PRODUCTION_TESTING_CHECKLIST.md)
- [ ] Real $1 donation tested successfully
- [ ] Production environment configured
- [ ] Firebase deployed
- [ ] All API keys are PRODUCTION keys
- [ ] Stripe in LIVE mode
- [ ] SendGrid domain verified

### Legal
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Donation Terms published
- [ ] All policies linked in app
- [ ] Correct Tax ID (EIN) everywhere

### App Store
- [ ] Screenshots taken (5-8 per platform)
- [ ] Icon final and approved (1024×1024)
- [ ] App description written
- [ ] Keywords researched
- [ ] Support/marketing URLs set
- [ ] Demo account created
- [ ] All metadata complete

### Quality
- [ ] No crashes during testing
- [ ] All features work as expected
- [ ] UI/UX reviewed and approved
- [ ] Performance acceptable
- [ ] Tested on multiple devices
- [ ] Tested on multiple OS versions

---

## 🎉 Congratulations!

Once your app is approved and live:

1. **Announce the launch** to your congregation
2. **Promote** via social media, website, email
3. **Monitor** closely for first few days
4. **Respond** to reviews and feedback
5. **Plan** v1.1 improvements

**You did it!** 🚀

---

**Royal Signet Church**
**"Come as You Are"**

**Questions?** Contact: dev@royalsignet.church

**Last Updated:** November 17, 2025
**Version:** 1.0
