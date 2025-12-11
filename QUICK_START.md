# 🚀 Royal Signet Church App - Quick Start Guide

## ✅ All Syntax Errors Fixed!

The app is now ready to run.

---

## 📱 **EASIEST WAY: Run on Your Phone**

### Step 1: Install Expo Go

- **iPhone**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Start the App

Open Terminal and run:

```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

### Step 3: Scan QR Code

When you see the QR code in the terminal:

- **iPhone**: Open Camera app and scan
- **Android**: Open Expo Go app and scan

### Step 4: App Loads on Your Phone! 🎉

---

## ⚠️ **REQUIRED: Configure Firebase (5 Minutes)**

**The app WILL CRASH on login without this!**

### Quick Firebase Setup:

1. **Go to**: https://console.firebase.google.com/

2. **Create project**: Name it "royal-signet"

3. **Add Web App**:
   - Click the **</>** icon
   - Register app as "Royal Signet"
   - **Copy the firebaseConfig code**

4. **Update the app**:
   ```bash
   # Open this file in your code editor:
   /Users/thomasv/royal-signet/mobile-app/src/services/firebase.ts

   # Replace lines 10-16 with your actual Firebase config
   ```

5. **Enable Email Authentication**:
   - In Firebase Console → **Authentication**
   - Click **Sign-in method** tab
   - Enable **Email/Password**
   - Click **Save**

6. **Reload the app** - it will work now!

---

## 🎨 **What You'll See**

### 1. Splash Screen (2 seconds)
- Royal Signet logo (RS in red circle)
- Tagline: "A New Beginning in His Presence Begins Here"
- "Come as You Are" footer

### 2. Login Screen
- Email/Password fields
- Social login buttons (Google, Apple, Facebook)
- "Sign Up" link

### 3. Home Dashboard (After Login)
- Welcome message with your name
- Daily Bible verse card
- Red announcement banner
- 4 upcoming sermon cards in a grid
- Event carousel (horizontal scroll)
- "See ya at Church" callout

### 4. Bottom Navigation (4 Tabs)
- **🏠 Home** - Main dashboard
- **📰 Updates** - News feed with announcements, events, testimonies
- **🎧 Sermons** - Search & browse with category filters
- **🙏 Prayer Wall** - Community prayer requests

### 5. Hamburger Menu (Tap Avatar)
- My Profile (View/Edit, Preferences, Saved Content, Notifications)
- Sunday School (Details, Schedules, Registration)
- Volunteer (Events, Charity)
- Donate (Tithes/Offerings)
- About Church (Mission, Vision, History)
- Contact & Support
- **Log Out**

---

## 🔧 **Troubleshooting**

### "Can't connect to Metro Bundler"
```bash
# Restart the server:
cd /Users/thomasv/royal-signet/mobile-app
npm start -- --clear
```

### "Firebase error" or app crashes on login
- Make sure you configured Firebase (see above)
- Enable Email/Password authentication in Firebase Console
- Check that firebaseConfig values are correct

### App shows blank screen
```bash
# Clear cache and restart:
cd /Users/thomasv/royal-signet/mobile-app
rm -rf node_modules/.cache
npm start -- --clear
```

---

## ⌨️ **Keyboard Shortcuts**

While `npm start` is running, press:

- **`r`** - Reload app
- **`i`** - Open iOS Simulator (Mac only)
- **`a`** - Open Android Emulator
- **`j`** - Open debugger
- **`c`** - Clear cache
- **`?`** - Show all commands

---

## 📖 **More Documentation**

- **Firebase Setup**: `/Users/thomasv/royal-signet/FIREBASE_SETUP.md` (detailed)
- **Full README**: `/Users/thomasv/royal-signet/README.md`
- **App Structure**: See project folders in `/Users/thomasv/royal-signet/mobile-app/src/`

---

## 🎯 **Features Built (70% Complete)**

✅ Complete Authentication System (6 screens)
✅ Home Dashboard with daily verse
✅ Sermons with search & category filters
✅ Events with booking system
✅ Prayer Wall community feature
✅ Updates/News feed
✅ Profile & Menu (all sections)
✅ Beautiful design matching Figma CSS

---

## 🚀 **Ready to Test!**

Just run:

```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

Then scan the QR code with your phone!

**Questions?** Check the full README or FIREBASE_SETUP.md files.

---

**Built with ❤️ - Royal Signet Church App**
