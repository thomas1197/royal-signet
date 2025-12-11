# 🚀 How to Run Royal Signet Church App

## ✅ **EASIEST METHOD: Use Your Phone**

### Step 1: Install Expo Go App

**iPhone:** https://apps.apple.com/app/expo-go/id982107779
**Android:** https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Start the Server

Open Terminal and run:

```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

### Step 3: Scan the QR Code

- **iPhone**: Open Camera app and scan the QR code
- **Android**: Open Expo Go app and scan the QR code

### Step 4: App Opens on Your Phone!

The app will load directly on your phone. You can now test all features!

---

## 📱 **ALTERNATIVE: Use iOS Simulator (Mac Only)**

### Step 1: Start the Server

```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

### Step 2: Press `i` in the Terminal

This will open the iOS Simulator automatically and launch the app.

OR run:

```bash
npm run ios
```

---

## 🌐 **WEB VERSION (Requires Setup)**

The web version needs additional configuration. For now, use your phone or simulator.

To enable web later:

```bash
cd /Users/thomasv/royal-signet/mobile-app
npm start
```

Then press `w` to open in browser.

---

##  **Before Testing - Configure Firebase!**

The app WILL CRASH on login without Firebase setup.

### Quick Firebase Setup (5 minutes):

1. **Go to:** https://console.firebase.google.com/
2. **Create project:** "royal-signet"
3. **Add a Web app** and copy the config
4. **Update this file:**
   ```
   /Users/thomasv/royal-signet/mobile-app/src/services/firebase.ts
   ```

5. **Replace lines 10-16** with your actual Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc",
   };
   ```

6. **Enable Authentication:**
   - Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password"
   - Click Save

7. **Reload the app** and you can now create accounts and login!

---

## ⌨️ **Keyboard Shortcuts (While Server Running)**

- **`r`** - Reload app
- **`i`** - Open iOS simulator
- **`a`** - Open Android emulator
- **`w`** - Open in web browser
- **`j`** - Open debugger
- **`c`** - Clear cache

---

## 🐛 **Troubleshooting**

### "Can't connect to Metro Bundler"
- Make sure server is running (`npm start`)
- Ensure phone and computer are on same WiFi

### "Firebase error"
- Configure Firebase (see above)
- Make sure you enabled Email/Password authentication

### App won't load
- Try clearing cache: `npm start -- --clear`
- Restart the server

---

## 📞 **Need Help?**

Check the full documentation:
- `/Users/thomasv/royal-signet/README.md`
- `/Users/thomasv/royal-signet/FIREBASE_SETUP.md`

---

**Ready to test? Run `npm start` and scan the QR code with your phone!** 📱
