# Royal Signet Church App

A production-ready church mobile application built with React Native, Expo, and Firebase. Designed to help churches connect with their community, share content, and engage members through modern mobile technology.

## 📱 Features

### ✅ Completed Features

- **Authentication System**
  - Email/password authentication
  - Social login UI (Google, Apple, Facebook)
  - Password reset flow with OTP verification
  - Persistent authentication state
  - Beautiful onboarding screens

- **Home Dashboard**
  - Daily Bible verse
  - Announcement banners
  - Upcoming sermons grid
  - Future events carousel
  - Personalized welcome message

- **Sermons**
  - Search functionality
  - Category filtering (Hope, Bible, Life, Faith)
  - Sermon cards with gradient overlays
  - Speaker information

- **Events**
  - Event detail pages with hero images
  - Date, time, and location information
  - Attendee count with avatars
  - "Book your spot" functionality
  - Share and favorite buttons

- **Prayer Wall**
  - Community prayer request feed
  - Submit prayer requests
  - "Pray for others" functionality
  - Prayer count tracking
  - Beautiful modal interface

- **Updates/News Feed**
  - Multi-category updates (Announcements, Events, News, Testimonies)
  - Rich content with images
  - Author information
  - Pull-to-refresh

- **Profile & Menu**
  - User profile display
  - Menu sections: My Profile, Sunday School, Volunteer, Donate, About, Contact
  - Logout functionality
  - Settings placeholders

### 🚧 In Development

- Stripe payment integration for donations
- Video sermon playback
- Push notifications
- Calendar integration
- Web admin panel

## 🎨 Design System

The app follows a comprehensive design system extracted from Figma:

- **Primary Color**: #8B0101 (Deep Red)
- **Background**: #FFF9E9 (Warm Cream)
- **Fonts**:
  - Lora (Serif) for headings
  - Satoshi (Sans-serif) for body text
- **Components**: Fully styled with shadows, gradients, and animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   cd royal-signet/mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password, Google, Apple, Facebook)
   - Enable Firestore Database
   - Enable Storage
   - Download your Firebase config
   - Update `src/services/firebase.ts` with your credentials:

   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - For iOS: Press `i` or scan the QR code with your iOS device
   - For Android: Press `a` or scan the QR code with the Expo Go app
   - For Web: Press `w`

## 📁 Project Structure

```
royal-signet/
├── mobile-app/              # React Native app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Button, Input, Avatar, etc.
│   │   │   └── cards/       # EventCard, SermonCard
│   │   ├── screens/         # App screens
│   │   │   ├── auth/        # Authentication screens
│   │   │   ├── home/        # Home dashboard
│   │   │   ├── events/      # Events feature
│   │   │   ├── sermons/     # Sermons feature
│   │   │   ├── prayers/     # Prayer Wall
│   │   │   ├── updates/     # News feed
│   │   │   └── profile/     # Profile & menu
│   │   ├── navigation/      # React Navigation setup
│   │   ├── services/        # Firebase services
│   │   ├── theme/           # Design system (colors, typography, spacing)
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── App.tsx              # Root component
│   └── package.json
│
├── admin-panel/             # Web admin dashboard (coming soon)
├── firebase/                # Firebase config and functions
└── shared/                  # Shared types and constants
```

## 🔥 Firebase Setup

### 1. Authentication

Enable the following sign-in methods in Firebase Console > Authentication > Sign-in method:

- Email/Password
- Google
- Apple (for iOS)
- Facebook

### 2. Firestore Database

Create the following collections:

```
users/
  - {userId}/
    - displayName
    - email
    - photoURL
    - createdAt

sermons/
  - {sermonId}/
    - title
    - speaker
    - category
    - imageUrl
    - videoUrl
    - createdAt

events/
  - {eventId}/
    - title
    - date
    - time
    - location
    - about
    - imageUrl
    - attendees (array)

prayers/
  - {prayerId}/
    - userId
    - request
    - prayerCount
    - createdAt

updates/
  - {updateId}/
    - title
    - content
    - imageUrl
    - author
    - category
    - createdAt
```

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Sermons (read-only for users)
    match /sermons/{sermonId} {
      allow read: if true;
      allow write: if false; // Only admins via admin panel
    }

    // Events (read-only for users)
    match /events/{eventId} {
      allow read: if true;
      allow write: if false; // Only admins via admin panel
    }

    // Prayers (authenticated users)
    match /prayers/{prayerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }

    // Updates (read-only for users)
    match /updates/{updateId} {
      allow read: if true;
      allow write: if false; // Only admins via admin panel
    }
  }
}
```

### 4. Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sermons/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only admins
    }

    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only admins
    }

    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production

#### iOS
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

## 📦 Dependencies

### Core
- React Native + Expo
- TypeScript
- Firebase (Auth, Firestore, Storage)

### Navigation
- @react-navigation/native
- @react-navigation/bottom-tabs
- @react-navigation/drawer
- @react-navigation/stack

### UI & Styling
- expo-linear-gradient
- react-native-safe-area-context
- react-native-gesture-handler
- react-native-reanimated

### Integrations
- @stripe/stripe-react-native (Donations)
- react-native-video (Sermon playback)
- expo-av (Audio/Video)
- expo-notifications (Push notifications)
- expo-calendar (Calendar sync)

## 🎯 Roadmap

- [ ] **Phase 1: Core Features** (95% Complete)
  - [x] Authentication
  - [x] Home Dashboard
  - [x] Sermons with Search
  - [x] Events with Booking
  - [x] Prayer Wall
  - [x] Updates Feed
  - [x] Profile Menu
  - [ ] Donations (Stripe)
  - [ ] Video Playback

- [ ] **Phase 2: Advanced Features**
  - [ ] Push Notifications
  - [ ] Calendar Integration
  - [ ] Offline Mode
  - [ ] Social Sharing
  - [ ] Content Download

- [ ] **Phase 3: Admin Panel**
  - [ ] Web Dashboard
  - [ ] Content Management
  - [ ] User Management
  - [ ] Analytics
  - [ ] Donation Reports

- [ ] **Phase 4: Deployment**
  - [ ] iOS App Store
  - [ ] Google Play Store
  - [ ] Beta Testing
  - [ ] Documentation

## 📄 License

This project is created for Royal Signet Church.

## 🤝 Support

For questions or support, please contact the development team.

---

**Built with ❤️ using React Native, Expo, and Firebase**
