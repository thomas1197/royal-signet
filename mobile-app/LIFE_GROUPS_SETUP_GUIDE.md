# Life Groups Feature - Setup Guide

This guide will help you set up the fully functional Life Groups feature with Firebase integration.

## 🎯 What's Included

- **Friday Prayer RSVP System** with real-time updates
- **Life Group Materials** with weekly study guides
- **Firebase Integration** for data persistence
- **Real-time Listeners** for instant updates
- **Complete CRUD Operations** for admins

---

## 📋 Prerequisites

1. Firebase project set up and configured
2. Firestore enabled in Firebase Console
3. Authentication enabled (already done)
4. Firebase SDK installed (already done)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Set Up Firestore Collections

Go to your Firebase Console → Firestore Database and ensure you have the following collections:

1. **fridayPrayers**
2. **fridayPrayerRSVPs**
3. **lifeGroupMaterials**

> **Note:** Collections will be created automatically when you add the first document

### Step 2: Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Friday Prayers - Read all, write authenticated users
    match /fridayPrayers/{prayerId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }

    // Friday Prayer RSVPs
    match /fridayPrayerRSVPs/{rsvpId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn()
        && resource.data.userId == request.auth.uid;
    }

    // Life Group Materials - Read all, write authenticated users
    match /lifeGroupMaterials/{materialId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}
```

### Step 3: Add Required Firestore Indexes

In Firebase Console → Firestore Database → Indexes, create these composite indexes:

1. **fridayPrayerRSVPs**
   - Fields: `prayerId` (Ascending), `status` (Ascending), `createdAt` (Descending)
   - Collection: `fridayPrayerRSVPs`

2. **lifeGroupMaterials**
   - Fields: `isPublished` (Ascending), `weekNumber` (Descending)
   - Collection: `lifeGroupMaterials`

> **Note:** If you get index errors when running the app, Firebase will show you a link to automatically create the required index.

### Step 4: Initialize Sample Data

You can add data in two ways:

#### Option A: Using Firebase Console (Recommended for First Time)

1. Go to Firestore Database → Start collection
2. Create a **fridayPrayers** document:

```json
{
  "date": "Friday, 20 December 2024",
  "time": "7:00 PM - 9:00 PM",
  "location": "Clement's House, Watford",
  "address": "WD25 9AP, Watford, Hertfordshire",
  "host": "Clement",
  "hostAvatar": "https://i.pravatar.cc/150?img=15",
  "hostId": "YOUR_USER_ID",
  "isActive": true,
  "createdAt": "2024-11-15T12:00:00Z",
  "updatedAt": "2024-11-15T12:00:00Z"
}
```

> **Note:** The app will **automatically create** a Friday Prayer event for the next Friday if none exists! Just open the Life Groups tab and it will be created automatically.

3. Create a **lifeGroupMaterials** document:

```json
{
  "week": "Week 12",
  "weekNumber": 12,
  "date": "2024-12-20",
  "year": 2024,
  "title": "Living in the Light",
  "topic": "Walking in Truth and Love",
  "bibleReading": "1 John 1:5-10",
  "keyVerse": "If we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus, his Son, purifies us from all sin.",
  "keyVerseReference": "1 John 1:7",
  "discussionQuestions": [
    "What does it mean to walk in the light?",
    "How can we have authentic fellowship with one another?",
    "What barriers prevent us from confessing our sins?",
    "How does walking in truth impact our relationships?"
  ],
  "prayerPoints": [
    "For courage to live transparently",
    "For deeper fellowship in our church community",
    "For healing and restoration in broken relationships",
    "For wisdom to walk in truth daily"
  ],
  "isCurrent": true,
  "isPublished": true,
  "author": "Pastor John",
  "authorId": "YOUR_USER_ID",
  "createdAt": "2024-11-15T12:00:00Z",
  "updatedAt": "2024-11-15T12:00:00Z"
}
```

#### Option B: Using the Initialization Script

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the initialization script
npx ts-node scripts/initializeLifeGroupData.ts
```

### Step 5: Test the Feature

1. Launch the app
2. Navigate to the **Life Groups** tab (👥 icon)
3. You should see:
   - Friday Prayer event details
   - RSVP button
   - Life Group materials list
4. Try RSVP'ing for the prayer
5. Open the material detail view

---

## 🎨 Features Included

### Friday Prayer RSVP

✅ **View Prayer Details**
- Date, time, location
- Host information
- Attendee count with avatars

✅ **RSVP Functionality**
- Indicate number of attendees
- Confirm or cancel RSVP
- Real-time updates when others RSVP

✅ **Real-time Listeners**
- See RSVPs update instantly
- No page refresh needed

### Life Group Materials

✅ **Materials List**
- Current week highlighted
- Historical materials available
- Week number and date

✅ **Material Details**
- Bible reading reference
- Key verse with full text
- Discussion questions
- Prayer points

✅ **Real-time Updates**
- New materials appear automatically
- Changes sync instantly

---

## 📱 Using the Features

### For Church Members:

1. **RSVP for Friday Prayer:**
   - Open Life Groups tab
   - Tap "RSVP for Friday Prayer"
   - Enter number of people
   - Tap "Confirm RSVP"

2. **Cancel RSVP:**
   - Tap "Cancel RSVP" button
   - Confirm cancellation

3. **View Life Group Materials:**
   - Scroll to materials section
   - Tap any material card
   - View full study guide
   - Screenshot or share with group

### For Admins:

You can create new prayers and materials programmatically:

```typescript
import { createFridayPrayer } from './src/services/fridayPrayer';
import { createMaterial } from './src/services/lifeGroupMaterials';

// Create new Friday Prayer
await createFridayPrayer({
  date: 'Friday, December 27, 2024',
  time: '7:00 PM - 9:00 PM',
  location: "Clement's House",
  address: '123 Faith Street...',
  host: 'Clement',
  hostId: 'user123',
  hostAvatar: 'https://...',
  isActive: true,
});

// Create new material
await createMaterial(
  {
    week: 'Week 13',
    weekNumber: 13,
    date: '2024-12-27',
    year: 2024,
    title: 'New Study Title',
    topic: 'Study Topic',
    bibleReading: 'Reference',
    keyVerse: 'Verse text',
    keyVerseReference: 'Reference',
    discussionQuestions: [...],
    prayerPoints: [...],
  },
  'Pastor John',
  'userId123'
);
```

---

## 🔧 API Functions Available

### Friday Prayer Service (`src/services/fridayPrayer.ts`)

- `getCurrentFridayPrayer()` - Get active prayer
- `getFridayPrayerRSVPs(prayerId)` - Get all RSVPs
- `subscribeFridayPrayerRSVPs(prayerId, callback)` - Real-time listener
- `getUserRSVP(prayerId, userId)` - Check user's RSVP
- `createRSVP(data)` - Create new RSVP
- `updateRSVP(rsvpId, numberOfPeople, notes)` - Update RSVP
- `cancelRSVP(rsvpId)` - Cancel RSVP
- `getTotalAttendees(prayerId)` - Get total count
- `createFridayPrayer(data)` - Admin: Create prayer

### Life Group Materials Service (`src/services/lifeGroupMaterials.ts`)

- `getCurrentMaterial()` - Get current week's material
- `getAllMaterials(limit)` - Get all materials
- `subscribeMaterials(callback, limit)` - Real-time listener
- `getMaterialsByYear(year)` - Filter by year
- `getMaterialById(id)` - Get specific material
- `createMaterial(data, author, authorId)` - Admin: Create material
- `updateMaterial(id, updates)` - Admin: Update material
- `setCurrentMaterial(id)` - Admin: Set as current
- `toggleMaterialPublished(id, isPublished)` - Admin: Publish/unpublish

---

## 🐛 Troubleshooting

### Issue: "No Friday Prayer Scheduled" message

**Solution:** Make sure you have a document in `fridayPrayers` collection with `isActive: true`

### Issue: "No Materials Available" message

**Solution:** Verify documents exist in `lifeGroupMaterials` collection with `isPublished: true`

### Issue: RSVP not saving

**Solution:**
1. Check Firebase Console logs
2. Verify security rules allow writes
3. Make sure user is authenticated

### Issue: "Missing index" error

**Solution:**
1. Check the error message for the index creation link
2. Click the link to auto-create the index
3. Wait 1-2 minutes for index to build

### Issue: Real-time updates not working

**Solution:**
1. Check internet connection
2. Verify Firestore is not offline
3. Check browser console for errors

---

## 📊 Data Structure Reference

See `LIFE_GROUPS_FIREBASE_STRUCTURE.md` for complete documentation on:
- Collection schemas
- Field types
- Relationships
- Query patterns
- Security rules

---

## 🚀 Next Steps

1. **Admin Panel** - Build a web interface to:
   - Create weekly materials
   - Manage Friday Prayers
   - View RSVP analytics
   - Export attendee lists

2. **Notifications** - Add push notifications for:
   - New materials published
   - Friday Prayer reminders
   - RSVP confirmations

3. **PDF Support** - Allow uploading PDF study guides

4. **Video Integration** - Link to sermon videos

---

## ✅ Checklist

- [ ] Firestore collections created
- [ ] Security rules configured
- [ ] Indexes created
- [ ] Sample data added
- [ ] Tested RSVP functionality
- [ ] Tested materials viewing
- [ ] Verified real-time updates
- [ ] Tested on iOS/Android

---

## 🎉 You're All Set!

The Life Groups feature is now fully functional with:
- ✅ Real-time RSVP system
- ✅ Weekly materials
- ✅ Firebase integration
- ✅ Instant updates
- ✅ Complete functionality

Your church community can now connect and grow together! 🙏
