# Firebase Setup Guide for Royal Signet Church App

This guide will walk you through setting up Firebase for the Royal Signet Church app.

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: `royal-signet` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Register Your App

### For iOS:
1. Click the iOS icon in the Firebase console
2. Enter iOS bundle ID (e.g., `com.royalsignet.church`)
3. Download `GoogleService-Info.plist`
4. Place it in your Expo project

### For Android:
1. Click the Android icon in the Firebase console
2. Enter Android package name (e.g., `com.royalsignet.church`)
3. Download `google-services.json`
4. Place it in your Expo project

### For Web (Admin Panel):
1. Click the Web icon
2. Register the app
3. Copy the Firebase config object

## Step 3: Get Your Firebase Config

In the Firebase Console > Project Settings > General, scroll down to "Your apps" and find your web app config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "royal-signet.firebaseapp.com",
  projectId: "royal-signet",
  storageBucket: "royal-signet.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

Copy these values and update `mobile-app/src/services/firebase.ts`

## Step 4: Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable the following providers:

### Email/Password
- Click "Email/Password"
- Enable it
- Save

### Google Sign-In
- Click "Google"
- Enable it
- Enter support email
- Save

### Apple Sign-In (for iOS)
- Click "Apple"
- Enable it
- Enter Service ID and Team ID from Apple Developer Account
- Save

### Facebook Sign-In
- Click "Facebook"
- Enable it
- Enter App ID and App Secret from Facebook Developers
- Save

## Step 5: Set Up Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in production mode" (we'll add rules later)
4. Select location (choose closest to your users)
5. Click "Enable"

### Create Collections

Create these collections manually or let the app create them:

```
users
sermons
events
prayers
updates
donations
```

### Set Security Rules

Go to Firestore Database > Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // Sermons (public read, admin write)
    match /sermons/{sermonId} {
      allow read: if true;
      allow write: if false; // Admin only via admin panel
    }

    // Events (public read, admin write)
    match /events/{eventId} {
      allow read: if true;
      allow write: if false; // Admin only via admin panel

      // Event bookings
      match /bookings/{bookingId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn();
        allow update, delete: if isSignedIn() &&
          resource.data.userId == request.auth.uid;
      }
    }

    // Prayers (authenticated users)
    match /prayers/{prayerId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() &&
        request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn(); // For prayer counts
      allow delete: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
    }

    // Updates (public read, admin write)
    match /updates/{updateId} {
      allow read: if true;
      allow write: if false; // Admin only via admin panel
    }

    // Donations (secure)
    match /donations/{donationId} {
      allow read: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() &&
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Immutable
    }
  }
}
```

## Step 6: Set Up Storage

1. Go to Storage
2. Click "Get started"
3. Start in production mode
4. Choose location (same as Firestore)

### Set Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Sermon media (public read)
    match /sermons/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Admin only
    }

    // Event images (public read)
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Admin only
    }

    // Update images (public read)
    match /updates/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Admin only
    }

    // User uploads (private)
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Profile pictures
    match /profile_pictures/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Step 7: Add Sample Data (Optional)

You can manually add sample data to test the app:

### Sample Sermon

Go to Firestore > sermons collection > Add document:

```json
{
  "title": "Walking in Faith",
  "speaker": "Pastor John Doe",
  "category": "Faith",
  "imageUrl": "https://picsum.photos/400/300",
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "description": "A powerful message about faith",
  "createdAt": "2024-12-01T10:00:00Z",
  "duration": 2400
}
```

### Sample Event

```json
{
  "title": "The Upperroom",
  "date": "2024-12-24",
  "time": "18:00",
  "location": "Main Sanctuary",
  "about": "Join us for an evening of worship...",
  "imageUrl": "https://picsum.photos/800/600",
  "attendeeCount": 127,
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### Sample Update

```json
{
  "title": "Christmas Service Schedule",
  "content": "Join us for our special Christmas services...",
  "imageUrl": "https://picsum.photos/800/400",
  "author": "Pastor John",
  "authorId": "user123",
  "authorAvatar": "https://i.pravatar.cc/150",
  "category": "announcement",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

## Step 8: Enable Cloud Functions (Optional)

For advanced features like sending emails, scheduled tasks, etc.:

1. Upgrade to Blaze (pay-as-you-go) plan
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Initialize functions: `firebase init functions`
4. Deploy: `firebase deploy --only functions`

## Step 9: Set Up Analytics (Optional)

1. Go to Analytics
2. Enable Google Analytics
3. View user engagement metrics

## Step 10: Configure Environment Variables

Create a `.env` file in your mobile-app folder:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Important**: Add `.env` to your `.gitignore` file!

## Troubleshooting

### "Permission denied" errors
- Check your Firestore security rules
- Ensure user is authenticated
- Verify the collection path is correct

### Authentication not working
- Verify Firebase config is correct
- Check that the auth method is enabled in Firebase Console
- For social login, verify OAuth credentials

### Data not syncing
- Check internet connection
- Verify Firestore rules allow read/write
- Check browser console for errors

## Next Steps

1. ✅ Configure Firebase as described above
2. ✅ Update `src/services/firebase.ts` with your config
3. ✅ Test authentication flow
4. ✅ Add sample data
5. ✅ Test all features
6. 🔄 Set up Stripe for donations
7. 🔄 Build admin panel
8. 🔄 Deploy to production

## Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

Need help? Contact the development team.
