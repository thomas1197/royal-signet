# Royal Signet Church App - Production Deployment Checklist

## 📋 Overview

This document outlines everything needed to deploy the Royal Signet Church app to production.

**Current Status:**
- ✅ Phase 1A: Security Hardening - COMPLETE
- ✅ Phase 1B: Stripe Donations & Email Notifications - COMPLETE
- ⚠️ Phase 1C: Admin Dashboard - NOT STARTED
- ⚠️ Production Deployment - NOT STARTED

---

## ✅ Completed Work

### Security (Phase 1A)
- ✅ Environment variable management
- ✅ Input validation (Zod schemas)
- ✅ Input sanitization (XSS protection)
- ✅ Error handling (user-friendly messages)
- ✅ Rate limiting (brute force protection)
- ✅ Firebase App Check (API abuse prevention)
- ✅ Strong password requirements
- ✅ Google OAuth integration

### Donations & Email (Phase 1B)
- ✅ Stripe payment integration
- ✅ Donation screens (3 screens)
- ✅ Cloud Functions for payments
- ✅ Welcome email automation
- ✅ Donation receipt emails
- ✅ Firestore security rules

### Existing Features
- ✅ User authentication
- ✅ Home screen
- ✅ Sermons screen
- ✅ Events screen
- ✅ Prayer Wall
- ✅ Life Groups
- ✅ Updates/News
- ✅ Profile screen

---

## 🚧 Remaining Work for Production

### CRITICAL - Must Complete Before Launch

#### 1. Test Phase 1B Implementation ⏱️ 2-3 hours
**Status:** Ready for testing
**Priority:** 🔴 CRITICAL

Tasks:
- [ ] Deploy Cloud Functions to Firebase
- [ ] Set up Stripe test account
- [ ] Set up SendGrid account
- [ ] Configure Stripe webhook
- [ ] Test donation flow with test cards
- [ ] Verify emails are sent
- [ ] Test error scenarios (declined cards, network errors)
- [ ] Verify Firestore data is correct

**Blockers:** Need Stripe and SendGrid accounts

---

#### 2. App Store Configuration ⏱️ 3-4 hours
**Status:** Not started
**Priority:** 🔴 CRITICAL

**App Identity:**
- [ ] Update `app.json` with correct app name
  ```json
  "name": "Royal Signet Church",
  "slug": "royal-signet-church",
  ```
- [ ] Set proper bundle identifier
  - iOS: `com.royalsignet.church`
  - Android: `com.royalsignet.church`
- [ ] Set version number: `1.0.0`
- [ ] Set build number: `1`

**App Icons & Branding:**
- [ ] Create app icon (1024x1024 PNG)
- [ ] Create adaptive icon for Android (foreground + background)
- [ ] Create splash screen image
- [ ] Update icon files in `/assets/`
  - `icon.png` (1024x1024)
  - `adaptive-icon.png` (Android)
  - `splash-icon.png`
  - `favicon.png` (web)

**App Metadata:**
- [ ] Write app description (short & long)
- [ ] Take app screenshots (5-8 per platform)
- [ ] Create promotional images
- [ ] Select app category: "Lifestyle"
- [ ] Set age rating: 4+ (or appropriate)
- [ ] Add keywords: church, worship, sermons, etc.

---

#### 3. Legal & Compliance ⏱️ 4-6 hours
**Status:** Not started
**Priority:** 🔴 CRITICAL

**Required Documents:**
- [ ] Create Privacy Policy
  - Data collection practices
  - How user data is used
  - Third-party services (Firebase, Stripe, SendGrid)
  - User rights (GDPR, CCPA)
  - Contact information
- [ ] Create Terms of Service
  - Acceptable use policy
  - User responsibilities
  - Intellectual property
  - Disclaimers
  - Governing law
- [ ] Create Donation Terms
  - Refund policy
  - Tax-deductible disclaimer
  - Payment processing terms

**Host Documents:**
- [ ] Create static website or pages
  - `https://royalsignet.church/privacy`
  - `https://royalsignet.church/terms`
  - `https://royalsignet.church/donation-terms`
- [ ] Add links to app (Settings screen)
- [ ] Add links to app stores

**Tax Compliance:**
- [ ] Add EIN (Tax ID) to donation receipts
- [ ] Update email template with correct Tax ID
- [ ] Verify 501(c)(3) status wording

---

#### 4. Production Environment Setup ⏱️ 2-3 hours
**Status:** Not started
**Priority:** 🔴 CRITICAL

**Firebase Production Config:**
- [ ] Create production environment variables
- [ ] Rotate all API keys (current keys exposed in git)
  - Firebase API key
  - Google OAuth client IDs
- [ ] Set up production Firebase config
- [ ] Update `.env` with production keys
- [ ] Add `.env.production` file

**Stripe Production:**
- [ ] Complete Stripe business verification
- [ ] Switch to Live mode keys
- [ ] Update Stripe webhook for production URL
- [ ] Test live payment (small real donation)
- [ ] Enable 3D Secure (SCA) for compliance

**SendGrid Production:**
- [ ] Verify domain (`royalsignet.church`)
  - Add DNS records for domain authentication
  - Improves deliverability
- [ ] Increase sending limits if needed
- [ ] Set up email monitoring

**Firebase Production:**
- [ ] Set budget alerts ($25/month recommended)
- [ ] Enable Firebase Analytics
- [ ] Enable Crashlytics
- [ ] Set up Cloud Functions monitoring
- [ ] Configure backup for Firestore

---

#### 5. Security Hardening ⏱️ 1-2 hours
**Status:** Mostly complete, needs final review
**Priority:** 🔴 CRITICAL

**Final Security Checks:**
- [ ] Audit all Firestore security rules
- [ ] Test security rules with Firebase emulator
- [ ] Ensure no API keys in source code
- [ ] Verify `.env` in `.gitignore`
- [ ] Remove any console.log with sensitive data
- [ ] Enable Firebase App Check in production
- [ ] Configure reCAPTCHA for web

**App Check:**
- [ ] Get reCAPTCHA v3 site key
- [ ] Enable App Attest (iOS) in Firebase Console
- [ ] Enable Play Integrity (Android) in Firebase Console
- [ ] Test App Check enforcement

---

### HIGH PRIORITY - Should Complete Before Launch

#### 6. Build & Deploy Mobile Apps ⏱️ 4-6 hours
**Status:** Not started
**Priority:** 🟠 HIGH

**EAS Build Setup:**
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login to Expo: `eas login`
- [ ] Configure EAS Build: `eas build:configure`
- [ ] Create `eas.json` with build profiles

**iOS Build:**
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID in Apple Developer Console
- [ ] Create App Store Connect record
- [ ] Build iOS app: `eas build --platform ios`
- [ ] Submit to TestFlight for testing
- [ ] Submit to App Store for review

**Android Build:**
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Create app in Google Play Console
- [ ] Build Android app: `eas build --platform android`
- [ ] Upload to Internal Testing track
- [ ] Submit to Google Play for review

**Build Configuration:**
```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "APP_ENV": "production"
      },
      "ios": {
        "bundleIdentifier": "com.royalsignet.church"
      },
      "android": {
        "package": "com.royalsignet.church"
      }
    }
  }
}
```

---

#### 7. Testing & QA ⏱️ 8-12 hours
**Status:** Not started
**Priority:** 🟠 HIGH

**Functional Testing:**
- [ ] Test all auth flows (login, signup, password reset)
- [ ] Test Google Sign-In
- [ ] Test donation flow (multiple scenarios)
- [ ] Test all screen navigation
- [ ] Test prayer wall (create, view, pray)
- [ ] Test events (view, RSVP)
- [ ] Test sermons (view, play video)
- [ ] Test profile updates
- [ ] Test life groups

**Edge Cases:**
- [ ] Test offline mode
- [ ] Test poor network conditions
- [ ] Test with different screen sizes
- [ ] Test on iOS (multiple devices/versions)
- [ ] Test on Android (multiple devices/versions)
- [ ] Test error scenarios
- [ ] Test deep linking

**Payment Testing:**
- [ ] Test successful payment
- [ ] Test declined card
- [ ] Test expired card
- [ ] Test insufficient funds
- [ ] Test network error during payment
- [ ] Verify Firestore data is correct
- [ ] Verify Stripe dashboard shows payment
- [ ] Verify email receipt is sent

**Performance Testing:**
- [ ] Test app startup time
- [ ] Test image loading
- [ ] Test video playback
- [ ] Check for memory leaks
- [ ] Check battery usage

---

#### 8. Monitoring & Analytics ⏱️ 2-3 hours
**Status:** Not started
**Priority:** 🟠 HIGH

**Firebase Analytics:**
- [ ] Enable Firebase Analytics
- [ ] Add analytics tracking to key events:
  - User signup
  - Donation made
  - Sermon viewed
  - Event RSVP
  - Prayer submitted
- [ ] Set up conversion tracking

**Firebase Crashlytics:**
- [ ] Enable Crashlytics
- [ ] Test crash reporting
- [ ] Set up alerts for critical errors

**Performance Monitoring:**
- [ ] Enable Firebase Performance Monitoring
- [ ] Track app startup time
- [ ] Track network requests
- [ ] Track screen rendering

**Custom Dashboards:**
- [ ] Create Firebase dashboard for key metrics
- [ ] Set up Stripe dashboard monitoring
- [ ] Set up SendGrid email analytics

---

### MEDIUM PRIORITY - Can Launch Without (But Recommended)

#### 9. Admin Dashboard (Phase 1C) ⏱️ 16-24 hours
**Status:** Not started
**Priority:** 🟡 MEDIUM

**Why it's important:**
Currently, admins must use Firebase Console to view donations and manage data. An admin dashboard provides:
- Easier management for non-technical staff
- Better user experience
- Custom reports and analytics

**Features to Build:**
- [ ] Admin authentication (role-based)
- [ ] Dashboard homepage with stats
- [ ] Donations management
  - View all donations
  - Search and filter
  - Export to CSV
  - Generate reports
- [ ] User management
  - View all users
  - Edit user roles
  - Disable accounts
- [ ] Content management
  - Add/edit sermons
  - Add/edit events
  - Add/edit updates
  - Manage prayer requests
- [ ] Analytics and reports
  - Donation trends
  - User growth
  - Engagement metrics

**Technical Approach:**
- Build as web app (React)
- Use Firebase Admin SDK
- Host on Firebase Hosting
- Protect with admin-only access

**Can be built post-launch** and deployed as updates.

---

#### 10. Push Notifications ⏱️ 4-6 hours
**Status:** Partially implemented (Notifee installed)
**Priority:** 🟡 MEDIUM

**Setup Required:**
- [ ] Configure Firebase Cloud Messaging (FCM)
- [ ] Request notification permissions in app
- [ ] Set up notification handlers
- [ ] Create Cloud Function to send notifications
- [ ] Test notification delivery

**Use Cases:**
- New sermon uploaded
- New event created
- Event reminder (day before)
- Prayer request responses
- Donation receipt confirmation
- Admin announcements

**Can launch without** and add in v1.1 update.

---

#### 11. Enhanced Features ⏱️ 20-40 hours
**Status:** Not started
**Priority:** 🟢 LOW (Post-Launch)

These can be added after initial launch:

**Recurring Donations:**
- [ ] Set up Stripe subscriptions
- [ ] Build recurring donation screens
- [ ] Manage subscription UI

**Apple Pay / Google Pay:**
- [ ] Integrate Apple Pay
- [ ] Integrate Google Pay
- [ ] One-tap checkout

**Social Features:**
- [ ] Share sermons to social media
- [ ] Share events to social media
- [ ] Invite friends feature

**Advanced Admin:**
- [ ] Bulk email to users
- [ ] SMS notifications (Twilio)
- [ ] Export annual tax statements
- [ ] Donor recognition wall

**Content Enhancements:**
- [ ] Sermon notes (PDF downloads)
- [ ] Sermon search
- [ ] Sermon playlists
- [ ] Bible study materials

---

## 📅 Recommended Timeline

### Week 1: Critical Items
- **Day 1-2:** Test Phase 1B (donations & emails)
- **Day 3:** App Store configuration & branding
- **Day 4-5:** Legal documents (Privacy Policy, Terms)
- **Day 6-7:** Production environment setup

### Week 2: Build & Deploy
- **Day 1-2:** Security final review & hardening
- **Day 3-4:** Build iOS & Android apps
- **Day 5-7:** Testing & QA

### Week 3: Launch
- **Day 1:** Submit to App Store review
- **Day 2:** Submit to Google Play review
- **Day 3-5:** Wait for approval (usually 1-3 days)
- **Day 6-7:** Monitor launch, fix critical bugs

### Week 4+: Post-Launch
- Monitor analytics
- Respond to user feedback
- Plan v1.1 features (Admin Dashboard, Push Notifications)

---

## 💰 Estimated Costs

### One-Time Costs
| Item | Cost |
|------|------|
| Apple Developer Program | $99/year |
| Google Play Developer | $25 one-time |
| Domain (royalsignet.church) | $12/year |
| **Total One-Time** | **$136** |

### Monthly Costs (Small Church <500 members)
| Service | Usage | Cost |
|---------|-------|------|
| Firebase (Blaze Plan) | Functions, Firestore, Auth | $5-10 |
| Stripe | 2.9% + $0.30 per transaction | Variable |
| SendGrid | <100 emails/day | $0 |
| Firebase Hosting | Static files | $0 |
| **Total Monthly** | | **$5-15 + Stripe fees** |

### Stripe Fee Example
- 100 donations × $50 = $5,000 collected
- Stripe fees: 100 × ($50 × 0.029 + $0.30) = **$175**
- Net received: **$4,825**

---

## 🚀 Minimum Viable Launch Checklist

To launch with minimum features:

### Must Have (Cannot Launch Without)
- [x] User authentication
- [x] Security hardening
- [ ] Test donation flow (Phase 1B)
- [ ] Privacy Policy & Terms of Service
- [ ] Production environment setup
- [ ] App Store configuration
- [ ] iOS & Android builds
- [ ] Basic testing completed

### Should Have (Strongly Recommended)
- [ ] Push notifications
- [ ] Analytics & monitoring
- [ ] Complete QA testing

### Nice to Have (Can Add Later)
- [ ] Admin dashboard
- [ ] Recurring donations
- [ ] Apple Pay / Google Pay

---

## 📱 App Store Requirements

### iOS App Store
**Required:**
- [ ] App icon (1024x1024)
- [ ] Screenshots (5.5", 6.5" displays)
- [ ] App description
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Age rating
- [ ] Category selection

**Review Time:** 1-3 days typically

### Google Play Store
**Required:**
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + tablet)
- [ ] App description (short & full)
- [ ] Privacy Policy URL
- [ ] Content rating questionnaire
- [ ] Category selection

**Review Time:** 1-7 days typically

---

## 🔐 Security Pre-Launch Checklist

- [ ] All API keys rotated (not in git history)
- [ ] `.env` file in `.gitignore`
- [ ] Firestore security rules tested
- [ ] Firebase App Check enabled
- [ ] Stripe webhook signature verified
- [ ] HTTPS enforced for all endpoints
- [ ] Rate limiting active
- [ ] Input validation on all forms
- [ ] No sensitive data in logs
- [ ] 3D Secure enabled for payments

---

## 📊 Success Metrics to Track

### Day 1 Metrics
- App downloads
- User signups
- Crash rate
- App store rating

### Week 1 Metrics
- Active users
- Donation count
- Donation total
- Email open rates
- Feature usage

### Month 1 Metrics
- User retention (Day 7, Day 30)
- Donation trends
- Popular features
- Support requests
- App store reviews

---

## 🆘 Support Plan

### User Support
- [ ] Create support email: `support@royalsignet.church`
- [ ] Set up support response system
- [ ] Create FAQ document
- [ ] Add in-app support contact

### Technical Support
- [ ] Set up error monitoring alerts
- [ ] Create incident response plan
- [ ] Document common issues
- [ ] Prepare rollback procedure

---

## 🎯 Next Immediate Steps

1. **Today:** Test Phase 1B donation flow
   - Set up Stripe test account
   - Set up SendGrid account
   - Deploy Cloud Functions
   - Run through complete donation test

2. **This Week:** App Store prep
   - Design app icon
   - Take screenshots
   - Write app descriptions
   - Create Privacy Policy

3. **Next Week:** Build & deploy
   - Set up EAS Build
   - Build iOS & Android
   - Submit to app stores

4. **Week After:** Monitor & iterate
   - Respond to reviews
   - Fix critical bugs
   - Plan v1.1 features

---

## ✅ Definition of Done

The app is ready for production when:

✅ All critical items completed
✅ Legal documents published
✅ Production environment configured
✅ Apps submitted to stores
✅ Payment flow tested with real transaction
✅ All screens tested on real devices
✅ Monitoring and analytics active
✅ Support channels ready
✅ Zero critical bugs

---

**Last Updated:** November 17, 2025
**Phase:** Ready for Phase 1B Testing → Production Deployment
**Target Launch Date:** [To be determined after testing]
