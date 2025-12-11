# Royal Signet Church App - Production Testing Checklist

**Version:** 1.0.0
**Last Updated:** November 17, 2025
**Tester:** _____________
**Test Date:** _____________
**Build:** iOS _____ | Android _____

---

## 📱 Test Devices

Record all devices used for testing:

| Device | OS | Version | Screen Size | Result |
|--------|--------|---------|-------------|---------|
| iPhone 15 Pro | iOS | 17.x | 6.1" | ✅ ❌ |
| iPhone 13 | iOS | 17.x | 6.1" | ✅ ❌ |
| iPad Air | iOS | 17.x | 10.9" | ✅ ❌ |
| Samsung Galaxy S23 | Android | 14 | 6.1" | ✅ ❌ |
| Google Pixel 7 | Android | 14 | 6.3" | ✅ ❌ |

---

## 🔐 CRITICAL: Authentication Tests

### 1.1 Email/Password Registration
- [ ] Create new account with valid email
- [ ] Password meets requirements (8+ chars, uppercase, lowercase, number, special char)
- [ ] Confirm password validation works
- [ ] Email validation prevents invalid formats
- [ ] Error shown for existing email
- [ ] Welcome email received within 2 minutes
- [ ] Welcome email displays correctly
- [ ] Welcome email links work

**Test Credentials:** test+[timestamp]@royalsignet.church

### 1.2 Google Sign-In
- [ ] "Sign in with Google" button visible
- [ ] Tap opens Google OAuth flow
- [ ] Can select Google account
- [ ] Returns to app after authorization
- [ ] User profile created in Firebase
- [ ] Welcome email received
- [ ] Profile photo synced from Google

**Notes:** _______________________________________________

### 1.3 Login
- [ ] Login with email/password works
- [ ] Login with Google works
- [ ] "Remember me" persists across app restarts
- [ ] Error shown for invalid credentials
- [ ] Error shown for non-existent account
- [ ] Rate limiting works after 5 failed attempts (wait 15 min or test with new email)

### 1.4 Password Reset
- [ ] "Forgot Password" link visible
- [ ] Enter email sends reset link
- [ ] Reset email received within 2 minutes
- [ ] Reset link opens and works
- [ ] Can set new password
- [ ] Can login with new password

### 1.5 Logout
- [ ] Logout button in Profile screen
- [ ] Confirm logout prompt appears
- [ ] After logout, redirected to login screen
- [ ] Cannot access protected screens
- [ ] Must re-login to access app

---

## 💰 CRITICAL: Donation Flow Tests

### 2.1 Navigate to Donations
- [ ] Find donation screen (Give tab, menu, or home)
- [ ] Donation screen loads without errors
- [ ] All UI elements display correctly

### 2.2 Select Donation Amount
- [ ] Preset amounts displayed ($10, $25, $50, $100, $250, $500)
- [ ] Can tap preset amount
- [ ] Selected amount highlighted
- [ ] Can enter custom amount
- [ ] Custom amount accepts decimals
- [ ] Custom amount validation: minimum $1
- [ ] Custom amount validation: maximum $10,000
- [ ] Error shown for invalid amounts

**Test Amounts:**
- [ ] $0.50 (should fail - minimum $1)
- [ ] $1.00 (should pass)
- [ ] $25.99 (should pass)
- [ ] $10,000 (should pass)
- [ ] $10,000.01 (should fail - maximum $10,000)

### 2.3 Select Donation Type
- [ ] Three types shown: Tithe, Offering, Special
- [ ] Can select each type
- [ ] Selected type highlighted
- [ ] Description visible for each type

### 2.4 Add Optional Note
- [ ] Note field visible
- [ ] Can type text
- [ ] Character counter shows (0/500)
- [ ] Cannot exceed 500 characters
- [ ] XSS protection: script tags rejected

**Test Notes:**
- [ ] Normal text: "Blessings to the church"
- [ ] Special chars: "For Jane's ministry & mission work"
- [ ] Long text: 500 character message
- [ ] XSS attempt: `<script>alert('test')</script>` (should be sanitized)

### 2.5 Payment Processing
- [ ] Tap "Proceed to Payment" navigates to payment screen
- [ ] Donation summary displayed correctly
- [ ] Amount shown correctly
- [ ] Type shown correctly
- [ ] Note shown (if added)
- [ ] Tax-deductible notice visible

### 2.6 Enter Card Details (Stripe)
- [ ] Card field displayed
- [ ] Can enter card number
- [ ] Card type detected (Visa, Mastercard, etc.)
- [ ] Can enter expiration date
- [ ] Can enter CVC
- [ ] Can enter ZIP code
- [ ] Field validation works
- [ ] Incomplete card shows error

**Test Cards (Stripe Test Mode):**

| Card Number | Expected Result | Tested |
|-------------|-----------------|--------|
| 4242 4242 4242 4242 | ✅ Success | [ ] |
| 4000 0000 0000 0002 | ❌ Card Declined | [ ] |
| 4000 0000 0000 9995 | ❌ Insufficient Funds | [ ] |
| 4000 0000 0000 0069 | ❌ Expired Card | [ ] |
| 4000 0000 0000 0127 | ❌ Incorrect CVC | [ ] |

- **Expiry:** Any future date (e.g., 12/28)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### 2.7 Complete Donation
- [ ] Tap "Donate $X.XX" button
- [ ] Loading indicator shows
- [ ] Success message appears
- [ ] Success message shows correct amount
- [ ] Success message mentions email receipt
- [ ] Can tap "View Receipt" to see history
- [ ] Can tap "Done" to return to home

### 2.8 Verify Donation Backend
- [ ] Check Firebase Console → Firestore → donations collection
  - [ ] Donation record exists
  - [ ] Correct amount (in cents)
  - [ ] Correct user ID
  - [ ] Correct donation type
  - [ ] Note saved
  - [ ] Status: "completed"
  - [ ] Payment Intent ID present
  - [ ] Timestamp correct
- [ ] Check Stripe Dashboard → Payments
  - [ ] Payment appears
  - [ ] Correct amount
  - [ ] Status: "Succeeded"
  - [ ] Metadata includes user info
- [ ] Check email inbox
  - [ ] Receipt email received within 2 minutes
  - [ ] Correct amount shown
  - [ ] Correct donation type
  - [ ] Date correct
  - [ ] Tax ID shown
  - [ ] Email formatted correctly
  - [ ] Links work (if any)

### 2.9 Donation History
- [ ] Navigate to Donation History screen
- [ ] Past donation(s) displayed
- [ ] Correct amounts shown
- [ ] Correct dates shown
- [ ] Correct donation types shown
- [ ] Total giving statistic correct
- [ ] Donation count correct
- [ ] Tap donation to see details
- [ ] Details modal shows all info
- [ ] Transaction ID visible
- [ ] Can pull to refresh
- [ ] Empty state shown if no donations

---

## 📱 Feature Testing

### 3.1 Home Screen
- [ ] Home screen loads
- [ ] Welcome message shows user name
- [ ] Recent updates displayed (if any)
- [ ] Quick action buttons work
- [ ] Navigation to other screens works

### 3.2 Sermons
- [ ] Sermons list loads
- [ ] Sermon cards display correctly (title, date, speaker, thumbnail)
- [ ] Can tap sermon to view details
- [ ] Sermon detail shows description
- [ ] Video player works (if available)
- [ ] Can play/pause video
- [ ] Can seek video
- [ ] Full screen mode works
- [ ] Audio continues in background (if supported)
- [ ] Can go back to list

### 3.3 Events
- [ ] Events list loads
- [ ] Event cards display (title, date, location, image)
- [ ] Past vs upcoming events separated
- [ ] Can tap event to view details
- [ ] Event details show all info
- [ ] "RSVP" button works
- [ ] RSVP confirmation shown
- [ ] RSVP saved to Firebase
- [ ] Can cancel RSVP
- [ ] Add to calendar works (if implemented)

### 3.4 Prayer Wall
- [ ] Prayer Wall loads
- [ ] Prayer requests displayed
- [ ] Can scroll through requests
- [ ] Can tap "Pray" button
- [ ] Prayer count increments
- [ ] Can add new prayer request
- [ ] Prayer request form validates (min 10 chars)
- [ ] Prayer request submitted successfully
- [ ] New prayer appears in list
- [ ] Can view own prayer requests
- [ ] Can delete own prayer requests

### 3.5 Life Groups
- [ ] Life Groups screen loads
- [ ] Groups displayed (if any)
- [ ] Can view group details
- [ ] Can join group (if implemented)
- [ ] Group info displayed correctly

### 3.6 Updates/News
- [ ] Updates list loads
- [ ] Update cards show title, date, snippet
- [ ] Can tap to view full update
- [ ] Update detail shows full content
- [ ] Images load correctly
- [ ] Can go back to list

### 3.7 Profile
- [ ] Profile screen loads
- [ ] Profile photo displayed (or default)
- [ ] Name displayed
- [ ] Email displayed
- [ ] Can edit profile
- [ ] Changes save successfully
- [ ] Can update profile photo
- [ ] Camera permission requested (if needed)
- [ ] Photo upload works
- [ ] Settings accessible
- [ ] Can toggle preferences
- [ ] Logout button works

---

## 🌐 Network & Performance Tests

### 4.1 Network Conditions
- [ ] App works on WiFi
- [ ] App works on cellular (4G/5G)
- [ ] App handles poor connection gracefully
- [ ] Loading indicators show during network requests
- [ ] Error messages shown for network failures
- [ ] Can retry failed requests
- [ ] Offline mode shows appropriate message

### 4.2 Performance
- [ ] App starts quickly (<3 seconds)
- [ ] Screens load without lag
- [ ] Scrolling is smooth
- [ ] Images load progressively
- [ ] No visible memory leaks
- [ ] No crashes during normal use
- [ ] Battery drain is reasonable

### 4.3 Background/Foreground
- [ ] App suspends properly when backgrounded
- [ ] App resumes properly when foregrounded
- [ ] Authentication persists across background
- [ ] No data loss when backgrounded

---

## 🔒 Security Tests

### 5.1 Input Validation
- [ ] Email validation rejects invalid formats
- [ ] Password validation enforces requirements
- [ ] Donation amount validation works
- [ ] XSS attempts sanitized in text inputs
- [ ] SQL injection attempts blocked (N/A for Firebase)

### 5.2 Authentication Security
- [ ] Cannot access protected screens without login
- [ ] Session expires appropriately
- [ ] Cannot view other users' data
- [ ] Cannot edit other users' data
- [ ] Cannot delete other users' data

### 5.3 Payment Security
- [ ] Card details not stored on device
- [ ] Card details not visible in logs
- [ ] Cannot manipulate donation amounts
- [ ] Cannot bypass payment flow
- [ ] Stripe SDK handles all sensitive data

### 5.4 Rate Limiting
- [ ] Login rate limiting works (5 attempts)
- [ ] Signup rate limiting works (3 attempts per hour)
- [ ] Appropriate error messages shown

---

## 🐛 Error Handling Tests

### 6.1 Authentication Errors
- [ ] Wrong password shows clear error
- [ ] Non-existent account shows clear error
- [ ] Weak password shows requirements
- [ ] Network error handled gracefully

### 6.2 Payment Errors
- [ ] Declined card shows clear message
- [ ] Expired card shows clear message
- [ ] Insufficient funds shows clear message
- [ ] Network error during payment handled
- [ ] Incomplete card info shows validation error

### 6.3 General Errors
- [ ] 404 errors handled
- [ ] Server errors (500) handled
- [ ] Permission errors handled
- [ ] All errors show user-friendly messages
- [ ] No technical jargon in error messages
- [ ] No stack traces shown to users

---

## 📐 UI/UX Tests

### 7.1 Visual Design
- [ ] Church branding (maroon #8B0101) consistent
- [ ] Fonts consistent throughout app
- [ ] Buttons have consistent styling
- [ ] Colors meet accessibility standards
- [ ] Icons are clear and recognizable
- [ ] Images load and display correctly
- [ ] No layout issues on different screen sizes

### 7.2 Navigation
- [ ] Tab bar always accessible
- [ ] Back button works on all screens
- [ ] Navigation is intuitive
- [ ] No dead ends (always can go back)
- [ ] Deep linking works (if implemented)

### 7.3 Accessibility
- [ ] Text is readable (min 14pt)
- [ ] Sufficient color contrast
- [ ] Touch targets adequate size (44x44pt min)
- [ ] VoiceOver works (iOS)
- [ ] TalkBack works (Android)
- [ ] Dynamic type supported

### 7.4 Responsive Design
- [ ] Works on small phones (iPhone SE)
- [ ] Works on large phones (iPhone Pro Max)
- [ ] Works on tablets (iPad)
- [ ] No content cut off
- [ ] No overlapping elements
- [ ] Scrolling works where expected

---

## 📧 Email Tests

### 8.1 Welcome Email
- [ ] Received within 2 minutes of signup
- [ ] Correct recipient name
- [ ] Correct recipient email
- [ ] Subject line appropriate
- [ ] Email HTML renders correctly
- [ ] Church branding present
- [ ] Links work (if any)
- [ ] No broken images
- [ ] Mobile responsive

### 8.2 Donation Receipt Email
- [ ] Received within 2 minutes of donation
- [ ] Correct recipient name
- [ ] Correct donation amount
- [ ] Correct donation type
- [ ] Correct date
- [ ] Transaction ID present
- [ ] Tax ID (EIN) present
- [ ] Tax-deductible notice present
- [ ] Email renders correctly
- [ ] Church branding present
- [ ] Mobile responsive

---

## 🔄 Edge Cases & Stress Tests

### 9.1 Edge Cases
- [ ] Very long names (50+ characters)
- [ ] Special characters in name
- [ ] Emoji in name or notes
- [ ] Very long note (500 characters)
- [ ] Multiple rapid donations
- [ ] Donation while offline (should fail gracefully)
- [ ] Change screens during donation
- [ ] Background app during donation
- [ ] Lock device during donation

### 9.2 Boundary Testing
- [ ] Donation: $0.99 (should fail)
- [ ] Donation: $1.00 (should pass)
- [ ] Donation: $10,000.00 (should pass)
- [ ] Donation: $10,000.01 (should fail)
- [ ] Password: 7 chars (should fail)
- [ ] Password: 8 chars + requirements (should pass)
- [ ] Email: 320 characters (max valid length)

### 9.3 Data Integrity
- [ ] Donation amount in cents stored correctly
- [ ] Timestamps in correct timezone
- [ ] User IDs match across collections
- [ ] No duplicate donations for single payment
- [ ] No orphaned data after deletion

---

## 📊 Analytics & Monitoring

### 10.1 Firebase Analytics
- [ ] Events being logged (check Firebase Console)
- [ ] User properties set correctly
- [ ] Screen views tracked
- [ ] Donation events tracked

### 10.2 Crashlytics
- [ ] Crashlytics initialized
- [ ] Test crash logged
- [ ] Crashes appear in Firebase Console

### 10.3 Performance Monitoring
- [ ] App startup time tracked
- [ ] Network requests tracked
- [ ] Screen rendering tracked

---

## ✅ Pre-Launch Checklist

### Legal & Compliance
- [ ] Privacy Policy accessible in app
- [ ] Terms of Service accessible in app
- [ ] Donation Terms accessible in app
- [ ] All policies hosted at permanent URLs
- [ ] Contact information correct
- [ ] Tax ID (EIN) correct in all places

### Configuration
- [ ] Production environment variables set
- [ ] All API keys are PRODUCTION keys (not test)
- [ ] Stripe in LIVE mode
- [ ] SendGrid domain verified
- [ ] Firebase budget alerts set
- [ ] Firebase App Check enabled

### App Stores
- [ ] App name: "Royal Signet Church"
- [ ] Bundle ID: com.royalsignet.church
- [ ] Version: 1.0.0
- [ ] Build number: 1
- [ ] Icon matches branding
- [ ] Screenshots taken
- [ ] App description written
- [ ] Support URL set
- [ ] Privacy Policy URL set

### Final Tests
- [ ] Complete test donation with REAL credit card ($1)
- [ ] Verify donation in Stripe LIVE dashboard
- [ ] Verify donation in Firebase production database
- [ ] Verify receipt email sent from production
- [ ] Test on actual iOS device with production build
- [ ] Test on actual Android device with production build

---

## 🐛 Known Issues

Document any known issues found during testing:

| Issue # | Description | Severity | Status | Notes |
|---------|-------------|----------|--------|-------|
| 1 | | High/Med/Low | Open/Fixed | |
| 2 | | High/Med/Low | Open/Fixed | |
| 3 | | High/Med/Low | Open/Fixed | |

---

## 📝 Test Notes

Additional observations:
____________________________________________________________
____________________________________________________________
____________________________________________________________
____________________________________________________________

---

## ✍️ Sign-Off

**Tester Name:** ___________________________
**Signature:** ___________________________
**Date:** ___________________________

**Status:** [ ] PASS  [ ] PASS WITH ISSUES  [ ] FAIL

**Ready for Production:** [ ] YES  [ ] NO

**Comments:**
____________________________________________________________
____________________________________________________________
____________________________________________________________

---

**Royal Signet Church**
**Version:** 1.0.0
**Last Updated:** November 17, 2025
