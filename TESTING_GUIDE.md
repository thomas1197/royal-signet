# 📱 Royal Signet App - Testing Guide

## 🎉 Setup Complete!

Your Royal Signet Church app is now fully configured and ready to test!

---

## ✅ What's Been Configured

### Firebase Services:
- ✅ **Authentication** - Email/Password enabled
- ✅ **Firestore Database** - Created with sample data
- ✅ **Cloud Storage** - Set up for images/files
- ✅ **Security Rules** - Published and active

### Sample Data Added:
- 🎥 **4 Sermons** (Walking in Faith, Hope in Difficult Times, The Power of Prayer, Understanding Grace)
- 📅 **4 Events** (Sunday Worship, Youth Group, Community Outreach, Bible Study)
- 🙏 **3 Prayer Requests** (with user avatars and prayer counts)
- 📰 **3 Updates/News** (Christmas schedule, Youth mission trip, New Bible study)
- ⚙️  **App Settings** (Daily verse, announcement banner, contact info)

### App Features Built:
- 🔐 Complete authentication system (6 screens)
- 🏠 Home dashboard with verse and cards
- 🎧 Sermons with search and filters
- 📅 Events with detail pages
- 🙏 Prayer Wall with submissions
- 📰 Updates feed
- 👤 Profile and menu system

---

## 📱 How to Test the App

### Option 1: Test on Your Phone (Recommended)

#### Step 1: Install Expo Go
- **iPhone**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

#### Step 2: Find Your QR Code
The Metro Bundler should be showing a QR code in your terminal. If not, you can:
```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

#### Step 3: Scan the QR Code
- **iPhone**: Open Camera app and scan
- **Android**: Open Expo Go app and scan

#### Step 4: App Loads!
You should see:
1. **Splash Screen** (2 seconds) - Royal Signet logo
2. **Login Screen** - Email/password form with social buttons

---

### Option 2: Test on iOS Simulator (Mac only)

In the terminal where Metro Bundler is running, press **`i`**

Or run:
```bash
cd /Users/thomasv/royal-signet/mobile-app
npm run ios
```

---

## 🧪 Testing Checklist

### 1. Authentication Flow
- [ ] **Sign Up** with new email and password
  - Try: `test@royalsignet.com` / `password123`
  - Should create account and log you in

- [ ] **Log Out** from the hamburger menu

- [ ] **Log In** with the account you just created
  - Should remember you and keep you logged in

- [ ] **Forgot Password** - Enter email and check flow

### 2. Home Screen
- [ ] **Daily Bible Verse** should display "John 3:16"
- [ ] **Announcement Banner** should show in red
- [ ] **4 Sermon Cards** should appear in 2x2 grid
- [ ] **Event Carousel** should scroll horizontally
- [ ] **Pull to Refresh** should work

### 3. Sermons Tab
- [ ] Should see **4 sample sermons**
- [ ] **Search bar** should filter results
- [ ] **Category filters** (All, Hope, Bible, Life, Faith) should work
- [ ] Tap a sermon to view details (placeholder for now)

### 4. Updates Tab
- [ ] Should see **3 updates** with different colored badges
- [ ] Categories: Announcement (red), Event (green), News (blue)
- [ ] Should show author avatars and timestamps

### 5. Prayer Wall Tab
- [ ] Should see **3 prayer requests**
- [ ] Tap **"+"** button to open submit modal
- [ ] Type a prayer request and submit
- [ ] Tap **"Pray"** button - should toggle to "Praying" and increment count

### 6. Profile/Menu
- [ ] Tap **avatar** in top right (on Home screen)
- [ ] Should see drawer menu with:
  - My Profile
  - Sunday School
  - Volunteer
  - Donate
  - About Church
  - Contact & Support
  - **Log Out**

---

## 🔍 What to Look For

### Things That Should Work:
✅ App loads without errors
✅ Authentication creates accounts in Firebase
✅ Data displays from Firestore
✅ Navigation between tabs works smoothly
✅ Pulling to refresh works
✅ User stays logged in after app restart

### Known Placeholder Features:
⚠️ **Social login buttons** (Google, Apple, Facebook) - UI only, not functional yet
⚠️ **Video player** in sermon details - not implemented yet
⚠️ **Event booking** - button exists but doesn't save to database yet
⚠️ **Donations** - UI exists but Stripe not fully integrated
⚠️ **Sunday School, Volunteer, About sections** - menu items exist but detail pages not built

---

## 🐛 Troubleshooting

### "Can't connect to Metro Bundler"
```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start -- --clear
```
Make sure phone and computer are on the **same WiFi network**.

### "Firebase error" or authentication fails
- Check that Email/Password is enabled in Firebase Console
- Verify credentials in `src/services/firebase.ts`

### App shows blank screen
```bash
# Clear cache and restart
cd /Users/thomasv/royal-signet/mobile-app
rm -rf node_modules/.cache
npm start -- --clear
```

### Can't see sample data
- Check Firestore Console to verify data was added
- Check browser console for permission errors
- Verify security rules were published

---

## 📊 Check Your Data in Firebase Console

### View Sample Data:
1. Go to: https://console.firebase.google.com/project/royal-signet/firestore
2. You should see collections:
   - **sermons** (4 documents)
   - **events** (4 documents)
   - **prayers** (3 documents)
   - **updates** (3 documents)
   - **settings** (1 document)

### View Authenticated Users:
1. Go to: https://console.firebase.google.com/project/royal-signet/authentication/users
2. After signing up, you should see your test user here

---

## 🚀 Next Steps After Testing

Once the app works:

1. **Add More Sample Data** - Run `node firebase-setup.js` again or add via Firebase Console
2. **Implement Video Player** - Add react-native-video integration for sermon playback
3. **Complete Stripe Integration** - Set up donation flows
4. **Build Remaining Screens** - Sunday School, Volunteer, About details
5. **Add Push Notifications** - Event reminders and prayer updates
6. **Build Admin Panel** - Web dashboard for managing content
7. **Production Deploy** - Build for App Store and Google Play

---

## 📞 Need Help?

If you encounter any issues:

1. Check the Metro Bundler logs in your terminal
2. Check the Expo Go app for error messages
3. Review the Firebase Console for data/auth issues
4. Check `FIREBASE_SETUP.md` for detailed Firebase configuration

---

## 🎯 Current Status

**App Completion: ~75%**

✅ **Complete:**
- Full authentication system
- Home dashboard with real data
- Sermons, Events, Updates, Prayer Wall
- Profile and navigation
- Firebase integration
- Design system matching Figma

⏳ **In Progress/Pending:**
- Video streaming for sermons
- Stripe donation integration
- Push notifications
- Admin panel
- Additional detail screens
- Production deployment

---

**Happy Testing! 🎉**

If the app loads and you can sign up/log in successfully, you're ready to start using and customizing your Royal Signet Church app!
