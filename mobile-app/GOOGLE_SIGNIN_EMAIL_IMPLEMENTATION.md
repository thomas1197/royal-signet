# Google Sign-In & Welcome Email Implementation Plan

## ✅ Current Status

### Google Sign-In - Already Implemented!

**Files:**
- `src/services/googleAuth.ts` - Google authentication service
- `src/screens/auth/LoginScreen.tsx` - Login with Google button
- `src/screens/auth/SignUpScreen.tsx` - Sign up with Google button

**Features Already Working:**
✅ Google OAuth 2.0 configured
✅ Sign in with Google button on Login screen
✅ Sign up with Google button on Sign Up screen
✅ User profile automatically created in Firestore
✅ User data synced (email, name, photo)
✅ Role assignment (defaults to 'member')
✅ Membership status tracking

**What Happens When User Signs in with Google:**
1. User taps "Google" button
2. Google OAuth popup/redirect
3. User authorizes the app
4. Firebase creates/signs in user
5. User profile created in Firestore with:
   - Email
   - Display name
   - Profile photo
   - Role: 'member'
   - Status: 'visitor'
   - Created timestamp

---

## 🎯 What We Need to Add

### Email Notifications - Not Implemented Yet

We need to add:
1. Firebase Cloud Functions
2. Email service (SendGrid or Trigger Email Extension)
3. Welcome email template
4. Automatic trigger when user signs up

---

## 📋 Implementation Plan

### Option A: Firebase Trigger Email Extension (Recommended - Easier)

**Pros:**
- ✅ No code required
- ✅ Free tier: 200 emails/day
- ✅ Easy setup via Firebase Console
- ✅ Templates in Firestore
- ✅ Automatic retry on failure

**Cons:**
- ⚠️ Requires Blaze plan (pay-as-you-go)
- ⚠️ Limited customization

**Cost:** Free for <200 emails/day, then $0.001 per email

---

### Option B: Firebase Functions + SendGrid (More Control)

**Pros:**
- ✅ Full control over emails
- ✅ Rich HTML templates
- ✅ Advanced features (attachments, etc.)
- ✅ SendGrid free tier: 100 emails/day

**Cons:**
- ⚠️ Requires code
- ⚠️ Requires Blaze plan
- ⚠️ More setup

**Cost:** Free for <100 emails/day

---

### Option C: Firebase Functions + Nodemailer (Full Control)

**Pros:**
- ✅ Complete control
- ✅ Use any SMTP service
- ✅ No third-party dependencies

**Cons:**
- ⚠️ Most complex setup
- ⚠️ SMTP configuration required
- ⚠️ Requires Blaze plan

---

## 🚀 Recommended Approach: Trigger Email Extension

### Step 1: Upgrade to Blaze Plan

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Upgrade** → **Select Blaze Plan**
4. Set billing alerts (recommended: $10/month limit)

**Cost Estimate for Church App:**
- 0-200 signups/day: **FREE**
- Each additional email: **$0.001**
- Expected monthly cost: **$0-5**

---

### Step 2: Install Trigger Email Extension

1. In Firebase Console → **Extensions**
2. Click **Install Extension**
3. Search for **"Trigger Email"**
4. Click **Install**
5. Configure:
   - **SMTP Connection URI:** Use SendGrid or Gmail
   - **Default FROM address:** `noreply@royalsignet.church`
   - **Default REPLY-TO address:** `info@royalsignet.church`
   - **Users collection:** `users`
   - **Templates collection:** `mail_templates`

---

### Step 3: Create Welcome Email Template

I'll create this for you in the next step.

---

### Step 4: Create Firestore Trigger

I'll create a Cloud Function that triggers when a new user signs up.

---

## 📧 Email Templates

### Welcome Email for Google Sign-In Users

**Subject:** Welcome to Royal Signet Church! 🙏

**Content:**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B0101; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #FFF9E9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #8B0101; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Royal Signet Church!</h1>
            <p>A New Beginning in His Presence Begins Here</p>
        </div>
        <div class="content">
            <h2>Hello {{displayName}}! 👋</h2>

            <p>Thank you for joining our Royal Signet Church family! We're excited to have you with us.</p>

            <p><strong>Your account is now set up with:</strong></p>
            <ul>
                <li>✅ Email: {{email}}</li>
                <li>✅ Access to sermons and teachings</li>
                <li>✅ Event notifications</li>
                <li>✅ Prayer wall community</li>
                <li>✅ Life group materials</li>
            </ul>

            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Complete your profile (add phone, address)</li>
                <li>Browse our latest sermons</li>
                <li>Join a Life Group</li>
                <li>Submit prayer requests</li>
                <li>RSVP for upcoming events</li>
            </ol>

            <center>
                <a href="royalsignet://home" class="button">Open the App</a>
            </center>

            <p><strong>Need Help?</strong></p>
            <p>Contact us at: <a href="mailto:info@royalsignet.church">info@royalsignet.church</a></p>

            <p>We look forward to seeing you at church!</p>

            <p>Blessings,<br>
            <strong>Royal Signet Church Team</strong></p>
        </div>
        <div class="footer">
            <p>Royal Signet Church<br>
            Come as You Are</p>
            <p>You received this email because you created an account on our app.</p>
        </div>
    </div>
</body>
</html>
```

---

### Setup Completion Email (After Profile Update)

**Subject:** Your Royal Signet Profile is Complete! ✨

**Content:**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B0101; color: white; padding: 30px; text-align: center; }
        .content { background: #FFF9E9; padding: 30px; }
        .button { display: inline-block; background: #8B0101; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Profile Complete! 🎉</h1>
        </div>
        <div class="content">
            <h2>Great job, {{displayName}}!</h2>

            <p>Your profile is now complete. Here's what you can do now:</p>

            <ul>
                <li>📅 Get notifications for upcoming events</li>
                <li>🙏 Join prayer groups</li>
                <li>📚 Access exclusive member content</li>
                <li>💝 Set up recurring donations (optional)</li>
            </ul>

            <center>
                <a href="royalsignet://profile" class="button">View Your Profile</a>
            </center>

            <p>See you at church!</p>
        </div>
    </div>
</body>
</html>
```

---

## 💻 Implementation Code

### Create Firebase Functions Directory

```bash
cd /Users/thomasv/royal-signet
mkdir -p firebase/functions
cd firebase/functions
npm init -y
npm install firebase-admin firebase-functions @sendgrid/mail
```

### Firebase Function: Send Welcome Email

**File:** `firebase/functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

admin.initializeApp();

// Set SendGrid API key
sgMail.setApiKey(functions.config().sendgrid.key);

// Trigger when new user is created
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || 'Friend';

  if (!email) return;

  const msg = {
    to: email,
    from: 'noreply@royalsignet.church', // Must be verified in SendGrid
    subject: 'Welcome to Royal Signet Church! 🙏',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #8B0101; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #FFF9E9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #8B0101; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Royal Signet Church!</h1>
                  <p>A New Beginning in His Presence Begins Here</p>
              </div>
              <div class="content">
                  <h2>Hello ${displayName}! 👋</h2>

                  <p>Thank you for joining our Royal Signet Church family! We're excited to have you with us.</p>

                  <p><strong>Your account is now set up with:</strong></p>
                  <ul>
                      <li>✅ Email: ${email}</li>
                      <li>✅ Access to sermons and teachings</li>
                      <li>✅ Event notifications</li>
                      <li>✅ Prayer wall community</li>
                      <li>✅ Life group materials</li>
                  </ul>

                  <p><strong>Next Steps:</strong></p>
                  <ol>
                      <li>Complete your profile</li>
                      <li>Browse our latest sermons</li>
                      <li>Join a Life Group</li>
                      <li>Submit prayer requests</li>
                  </ol>

                  <p>We look forward to seeing you at church!</p>

                  <p>Blessings,<br>
                  <strong>Royal Signet Church Team</strong></p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
});

// Trigger when user profile is completed
export const sendSetupCompleteEmail = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if profile was just completed
    const wasIncomplete = !before.phoneNumber || !before.address;
    const isNowComplete = after.phoneNumber && after.address;

    if (wasIncomplete && isNowComplete) {
      const msg = {
        to: after.email,
        from: 'noreply@royalsignet.church',
        subject: 'Your Royal Signet Profile is Complete! ✨',
        html: `
          <h1>Profile Complete, ${after.displayName}!</h1>
          <p>Your profile is now complete. You're all set to access all features!</p>
        `,
      };

      try {
        await sgMail.send(msg);
        console.log(`Setup complete email sent to ${after.email}`);
      } catch (error) {
        console.error('Error sending setup email:', error);
      }
    }
  });
```

---

## 🔧 Setup Instructions

### Quick Setup (Recommended)

I can set this up for you with Firebase Functions + SendGrid. Here's what we need:

1. **Firebase Blaze Plan** - Upgrade in console
2. **SendGrid Account** - Free (100 emails/day)
3. **Verify sender email** - In SendGrid
4. **Deploy functions** - I'll create the code

**Time to implement:** 30-45 minutes

---

### Alternative: Manual Setup Checklist

- [ ] Upgrade Firebase to Blaze plan
- [ ] Create SendGrid account
- [ ] Verify sender email in SendGrid
- [ ] Get SendGrid API key
- [ ] Create Firebase Functions directory
- [ ] Install dependencies
- [ ] Create welcome email function
- [ ] Deploy to Firebase
- [ ] Test with new signup

---

## 🧪 Testing

### Test Welcome Email

1. Create new account with Google Sign-In
2. Check email inbox
3. Verify email received
4. Check email formatting
5. Test links in email

### Test Setup Complete Email

1. Log in to existing account
2. Update profile (add phone + address)
3. Check email inbox
4. Verify setup email received

---

## 💰 Cost Breakdown

### SendGrid Free Tier
- 100 emails/day: **FREE**
- Additional emails: **$0.0005 each**

### Firebase Blaze Plan
- Functions: 2M invocations/month **FREE**
- Additional: **$0.40 per million**

### Expected Monthly Cost
- <100 signups/day: **$0**
- 100-500 signups/day: **$0-15**
- Typical church app: **$0-5/month**

---

## ✅ Implementation Checklist

- [x] Google Sign-In already implemented
- [ ] Upgrade to Firebase Blaze plan
- [ ] Set up SendGrid account
- [ ] Create Firebase Functions
- [ ] Create welcome email template
- [ ] Create setup complete email template
- [ ] Deploy functions
- [ ] Test email delivery
- [ ] Configure sender domain (optional)
- [ ] Set up email analytics (optional)

---

## 🎯 Next Steps

**Option 1: I Set It Up For You (Recommended)**
- I'll create all the Firebase Functions code
- Provide step-by-step deployment guide
- Create email templates
- **Time:** 30-45 minutes

**Option 2: You Want to Learn**
- I'll guide you through each step
- Explain what each part does
- Help troubleshoot issues
- **Time:** 1-2 hours

**Option 3: Simplified Version First**
- Just welcome email for now
- Add setup complete email later
- **Time:** 20-30 minutes

**Which option would you prefer?**

