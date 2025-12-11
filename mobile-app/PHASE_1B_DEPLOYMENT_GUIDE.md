# Phase 1B: Stripe Donations & Email Notifications - Deployment Guide

## 🎯 Overview

Phase 1B adds two major features to Royal Signet Church app:
1. **Stripe Payment Integration** - Accept tithes, offerings, and special donations
2. **Email Notifications** - Automated welcome emails and donation receipts

---

## ✅ What Was Implemented

### Mobile App Screens
- ✅ **DonationScreen** - Select amount and donation type
- ✅ **PaymentMethodScreen** - Secure payment processing with Stripe
- ✅ **DonationHistoryScreen** - View past donations and receipts

### Cloud Functions
- ✅ **createPaymentIntent** - Creates Stripe payment intents
- ✅ **stripeWebhook** - Handles Stripe webhook events
- ✅ **sendWelcomeEmail** - Sends welcome email on user signup
- ✅ **sendDonationThankYouEmail** - Sends receipt after donation

### Security & Validation
- ✅ **Donation amount validation** - $1 minimum, $10,000 maximum
- ✅ **Input sanitization** - Prevents XSS attacks
- ✅ **Firestore security rules** - Users can only read their own donations
- ✅ **Stripe PCI compliance** - Card data never touches your servers

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **Firebase project** (already set up)
- ✅ **Firebase Blaze plan** (pay-as-you-go) - Required for Cloud Functions
- ✅ **Node.js 18+** installed
- ✅ **Firebase CLI** installed: `npm install -g firebase-tools`
- ⚠️ **Stripe account** (to be created)
- ⚠️ **SendGrid account** (to be created)

---

## 🚀 Step-by-Step Deployment

### Step 1: Upgrade Firebase to Blaze Plan

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **Royal Signet** project
3. Click **Upgrade** in the left sidebar
4. Select **Blaze Plan** (pay-as-you-go)
5. Set **Budget Alerts** (recommended: $10/month)

**Why?** Cloud Functions require the Blaze plan.

**Cost Estimate:**
- First 2M function invocations/month: **FREE**
- First 125K function GB-seconds/month: **FREE**
- Expected monthly cost: **$0-5** for a small church

---

### Step 2: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account (business name: "Royal Signet Church")
3. Complete business verification
4. Navigate to **Developers → API Keys**
5. Copy your **Test Mode** keys:
   - Publishable key (starts with `pk_test_...`)
   - Secret key (starts with `sk_test_...`)

**Important Notes:**
- Use **Test Mode** for development
- Never commit secret keys to git
- Switch to **Live Mode** keys when ready for production

#### Add Stripe Keys to Mobile App

Edit `/Users/thomasv/royal-signet/mobile-app/.env`:

```env
# Replace with your actual Stripe publishable key
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

---

### Step 3: Create SendGrid Account

1. Go to [SendGrid Signup](https://signup.sendgrid.com/)
2. Create free account (100 emails/day free)
3. Complete sender verification:
   - Go to **Settings → Sender Authentication**
   - Verify email: `noreply@royalsignet.church`
4. Create API Key:
   - Go to **Settings → API Keys**
   - Create key with "Full Access"
   - Copy the API key (starts with `SG.`)

**Free Tier:** 100 emails/day forever free

---

### Step 4: Deploy Cloud Functions

#### 4.1 Install Firebase CLI & Login

```bash
npm install -g firebase-tools
firebase login
```

#### 4.2 Initialize Firebase in Project

```bash
cd /Users/thomasv/royal-signet
firebase init
```

Select:
- ✅ Functions
- ✅ Firestore
- Choose existing project: **royal-signet**
- Language: **TypeScript**
- Use existing functions code: **Yes**

#### 4.3 Install Dependencies

```bash
cd /Users/thomasv/royal-signet/firebase/functions
npm install
```

#### 4.4 Configure Stripe & SendGrid Keys in Firebase

```bash
# Set Stripe secret key
firebase functions:config:set stripe.secret_key="sk_test_YOUR_SECRET_KEY_HERE"

# Set Stripe webhook secret (get this in Step 5)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"

# Set SendGrid API key
firebase functions:config:set sendgrid.key="SG.YOUR_API_KEY_HERE"
```

#### 4.5 Build and Deploy Functions

```bash
# Build TypeScript
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

**Expected output:**
```
✔ functions: Finished running predeploy script.
✔ functions[createPaymentIntent(us-central1)]: Successful create operation.
✔ functions[stripeWebhook(us-central1)]: Successful create operation.
✔ functions[sendWelcomeEmail(us-central1)]: Successful create operation.
```

---

### Step 5: Configure Stripe Webhook

After deploying functions, you need to set up webhooks so Stripe can notify your app about payment status.

#### 5.1 Get Your Webhook URL

After deployment, Firebase will show your function URLs:
```
https://us-central1-royal-signet.cloudfunctions.net/stripeWebhook
```

#### 5.2 Add Webhook in Stripe Dashboard

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Enter endpoint URL from above
4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

#### 5.3 Update Firebase Config with Webhook Secret

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET_HERE"
firebase deploy --only functions
```

---

### Step 6: Deploy Firestore Security Rules

```bash
cd /Users/thomasv/royal-signet
firebase deploy --only firestore:rules
```

**What this does:**
- Prevents users from directly writing to donations
- Users can only read their own donations
- Cloud Functions can write to donations (they bypass security rules)

---

### Step 7: Test the Payment Flow

#### 7.1 Start the Mobile App

```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

Press `i` for iOS or `a` for Android.

#### 7.2 Test Donation Flow

1. **Sign up / Log in** to the app
2. Navigate to **Give** or **Donation** screen
3. Select donation amount (e.g., $25)
4. Choose donation type (Tithe, Offering, or Special)
5. Add optional note
6. Click **Proceed to Payment**
7. Enter test card details:

**Stripe Test Cards:**

| Card Number          | Description              | Result        |
|---------------------|--------------------------|---------------|
| 4242 4242 4242 4242 | Visa                     | Success ✅     |
| 4000 0000 0000 0002 | Visa                     | Declined ❌    |
| 4000 0000 0000 9995 | Visa                     | Insufficient funds ❌ |

- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

8. Click **Donate $25.00**
9. Wait for confirmation
10. Check email for donation receipt

#### 7.3 Verify in Firebase Console

1. Go to [Firebase Console → Firestore](https://console.firebase.google.com/project/royal-signet/firestore)
2. Navigate to **donations** collection
3. Verify your donation is recorded with:
   - ✅ Correct amount
   - ✅ User ID
   - ✅ Payment Intent ID
   - ✅ Status: "completed"

#### 7.4 Check Stripe Dashboard

1. Go to [Stripe Payments](https://dashboard.stripe.com/test/payments)
2. Verify payment appears with:
   - ✅ Correct amount
   - ✅ User metadata
   - ✅ Status: "Succeeded"

---

## 📧 Test Email Notifications

### Test Welcome Email

1. Create a new account in the app
2. Check your email inbox
3. You should receive **"Welcome to Royal Signet Church!"** email
4. Verify:
   - ✅ Email arrives within 1-2 minutes
   - ✅ Correct name displayed
   - ✅ All links work
   - ✅ Formatting looks good

### Test Donation Receipt

1. Complete a test donation (see above)
2. Check your email inbox
3. You should receive **"Thank You for Your Generous Gift"** email
4. Verify:
   - ✅ Correct donation amount
   - ✅ Correct donation type
   - ✅ Date is correct
   - ✅ Tax receipt notice included

---

## 🔧 Troubleshooting

### Issue: "Failed to create payment intent: Stripe is not configured"

**Solution:**
```bash
firebase functions:config:get
```

Ensure `stripe.secret_key` is set. If not:
```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY"
firebase deploy --only functions
```

---

### Issue: "Welcome email not sent"

**Solution:**
1. Check Firebase Functions logs:
```bash
firebase functions:log
```

2. Look for errors like:
   - "SendGrid API key not configured"
   - "Sender email not verified"

3. Verify SendGrid configuration:
```bash
firebase functions:config:get sendgrid.key
```

4. Re-verify sender email in SendGrid dashboard

---

### Issue: "Payment succeeds but donation not saved"

**Solution:**
1. Check Firebase Functions logs:
```bash
firebase functions:log --only stripeWebhook
```

2. Verify webhook secret is correct:
```bash
firebase functions:config:get stripe.webhook_secret
```

3. Check Stripe webhook deliveries:
   - Go to Stripe Dashboard → Webhooks
   - Click on your endpoint
   - View recent deliveries for errors

---

### Issue: "Card declined" (real cards, not test cards)

**Common reasons:**
- Card has insufficient funds
- Card expired
- Bank declined the transaction
- Card requires 3D Secure authentication (not yet implemented)

**Solution for production:**
- Enable 3D Secure (SCA) in Stripe settings
- Update PaymentMethodScreen to handle card_action_required

---

### Issue: "Module not found: @env"

**Solution:**
1. Ensure `.env` file exists at `/Users/thomasv/royal-signet/mobile-app/.env`
2. Restart Metro bundler:
```bash
npx react-native start --reset-cache
```

---

### Issue: TypeScript errors in Cloud Functions

**Solution:**
```bash
cd /Users/thomasv/royal-signet/firebase/functions
npm install --save-dev @types/node
npm run build
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] **Rotate Firebase API keys** (old keys in git history)
- [ ] **Use Stripe Live mode keys** (replace test keys)
- [ ] **Verify sender domain** in SendGrid (not just email)
- [ ] **Enable Stripe 3D Secure** for EU compliance
- [ ] **Set Firebase budget alerts** ($10/month recommended)
- [ ] **Review Firestore security rules** (donations rules are correct ✅)
- [ ] **Enable Stripe webhooks signature validation** (already implemented ✅)
- [ ] **Test all error scenarios** (declined cards, network errors, etc.)
- [ ] **Add admin dashboard** to view donations (Phase 1C)

---

## 💰 Cost Breakdown

### Monthly Costs (Small Church: <500 members)

| Service        | Usage                  | Cost      |
|----------------|------------------------|-----------|
| Firebase       | 2M function calls/mo   | $0        |
| Firebase       | Additional calls       | $0-2      |
| Stripe         | 2.9% + $0.30 per txn   | Variable  |
| SendGrid       | <100 emails/day        | $0        |
| **Total**      |                        | **$0-5**  |

### Example Calculation

If church receives **$10,000** in monthly donations:
- **10 donations × $1,000 each**
  - Stripe fees: 10 × ($1000 × 0.029 + $0.30) = **$293**
  - Firebase: **$2** (function calls)
  - SendGrid: **$0** (20 emails)
  - **Net received: $9,705**

- **100 donations × $100 each**
  - Stripe fees: 100 × ($100 × 0.029 + $0.30) = **$320**
  - Firebase: **$3** (more function calls)
  - SendGrid: **$0** (200 emails)
  - **Net received: $9,677**

**Stripe is the main cost** - consider this when setting giving amounts.

---

## 📊 Monitoring & Analytics

### View Function Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only createPaymentIntent

# Real-time logs
firebase functions:log --follow
```

### Monitor in Firebase Console

1. Go to [Firebase Console → Functions](https://console.firebase.google.com/project/royal-signet/functions)
2. View metrics:
   - Invocations per day
   - Execution time
   - Error rate
   - Memory usage

### Monitor Donations in Firestore

1. Go to [Firestore](https://console.firebase.google.com/project/royal-signet/firestore)
2. Navigate to **donations** collection
3. View all donations with filters:
   - By user
   - By date range
   - By donation type
   - By status

---

## 🎯 Next Steps

After Phase 1B is tested and deployed:

### Phase 1C: Admin Dashboard (Next)
- View all donations
- Download donation reports
- Manage users
- View analytics

### Future Enhancements
- **Recurring donations** - Monthly automatic giving
- **Apple Pay / Google Pay** - One-tap donations
- **Donation campaigns** - Special fundraising campaigns
- **Donor recognition** - Thank you wall
- **Tax statements** - Annual giving statements

---

## 📞 Support

### Get Help

If you encounter issues:

1. **Check Firebase logs** first:
   ```bash
   firebase functions:log
   ```

2. **Check Stripe dashboard** for payment issues

3. **Review error handling** in Cloud Functions code

4. **Common issues documented** in Troubleshooting section above

### Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [React Native Stripe](https://stripe.dev/stripe-react-native/)

---

## ✅ Deployment Checklist

Before marking Phase 1B as complete:

- [ ] Firebase upgraded to Blaze plan
- [ ] Stripe account created and verified
- [ ] SendGrid account created and sender verified
- [ ] Firebase Functions deployed successfully
- [ ] Stripe webhook configured
- [ ] Firestore security rules deployed
- [ ] Mobile app `.env` updated with Stripe key
- [ ] Test donation completed successfully (test card)
- [ ] Donation appears in Firestore
- [ ] Donation appears in Stripe dashboard
- [ ] Welcome email received for new signup
- [ ] Donation receipt email received
- [ ] Error handling tested (declined card)
- [ ] Documentation reviewed

---

## 🎉 Success Criteria

Phase 1B is complete when:

✅ Users can make donations through the app
✅ Payments are processed securely via Stripe
✅ Donations are recorded in Firestore
✅ Users receive email confirmations
✅ New users receive welcome emails
✅ All security rules are enforced
✅ Error handling works correctly
✅ Admin can view donations in Firebase Console

---

**Last Updated:** November 17, 2025
**Status:** Phase 1B Implementation Complete - Ready for Testing
**Next Phase:** Phase 1C - Admin Dashboard & Analytics
