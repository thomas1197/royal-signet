# Life Groups Firebase Data Structure

This document outlines the Firebase Firestore structure for the Life Groups feature, including Friday Prayer RSVPs and Life Group Materials.

## Collections Structure

### 1. `fridayPrayers` Collection

Stores information about weekly Friday Prayer events.

```javascript
fridayPrayers/{prayerId}
{
  date: "2024-12-20",              // ISO date string
  time: "7:00 PM - 9:00 PM",       // Time range
  location: "Clement's House",      // Location name
  address: "123 Faith Street...",   // Full address
  host: "Clement",                  // Host name
  hostAvatar: "url",                // Host avatar URL
  hostId: "userId123",              // Firebase auth user ID of host
  isActive: true,                   // Current week's prayer
  createdAt: Timestamp,             // Document creation time
  updatedAt: Timestamp              // Last update time
}
```

### 2. `fridayPrayerRSVPs` Collection

Stores RSVP responses for Friday Prayers.

```javascript
fridayPrayerRSVPs/{rsvpId}
{
  prayerId: "prayer123",            // Reference to fridayPrayers doc
  userId: "user123",                // Firebase auth user ID
  userName: "John Doe",             // User display name
  userAvatar: "url",                // User avatar URL
  userEmail: "john@example.com",    // User email
  numberOfPeople: 2,                // Total attendees including user
  notes: "",                        // Optional notes (e.g., "Bringing food")
  status: "confirmed",              // confirmed | cancelled
  createdAt: Timestamp,             // When RSVP was created
  updatedAt: Timestamp              // Last update time
}
```

**Indexes Required:**
- `prayerId` (for querying all RSVPs for a prayer)
- `userId` (for checking if user has RSVP'd)
- Composite: `prayerId + status` (for active RSVPs count)

### 3. `lifeGroupMaterials` Collection

Stores weekly Life Group study materials.

```javascript
lifeGroupMaterials/{materialId}
{
  week: "Week 12",                  // Week identifier
  weekNumber: 12,                   // For sorting
  date: "2024-12-20",              // ISO date string
  year: 2024,                       // Year for filtering
  title: "Living in the Light",    // Study title
  topic: "Walking in Truth...",     // Brief topic description
  bibleReading: "1 John 1:5-10",   // Scripture reference
  keyVerse: "If we walk...",        // Full key verse text
  keyVerseReference: "1 John 1:7", // Key verse citation

  // Discussion Questions Array
  discussionQuestions: [
    "What does it mean to walk in the light?",
    "How can we have authentic fellowship?",
    // ... more questions
  ],

  // Prayer Points Array
  prayerPoints: [
    "For courage to live transparently",
    "For deeper fellowship...",
    // ... more points
  ],

  // Optional Materials
  pdfUrl: "https://...",            // PDF download link
  videoUrl: "https://...",          // Study video link

  // Metadata
  isCurrent: true,                  // This week's material
  isPublished: true,                // Visible to users
  author: "Pastor John",            // Who created it
  authorId: "user123",              // Creator's user ID
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes Required:**
- `isCurrent` (for quick access to current material)
- `isPublished + weekNumber` (for ordered list)
- `year + weekNumber` (for filtering by year)

### 4. `lifeGroupSettings` Collection (Single Document)

Stores app-wide Life Group settings.

```javascript
lifeGroupSettings/settings
{
  currentPrayerId: "prayer123",     // Active Friday Prayer ID
  currentMaterialId: "material123", // Current week's material ID
  fridayPrayerDay: 5,              // 0-6, where 5 = Friday
  fridayPrayerTime: "19:00",       // 24-hour format
  notificationsEnabled: true,       // Send reminders
  reminderDaysBefore: 1,           // Send reminder 1 day before
  updatedAt: Timestamp
}
```

## Security Rules

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

    // Friday Prayers - Read all, write admin only
    match /fridayPrayers/{prayerId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn(); // TODO: Restrict to admin role
    }

    // Friday Prayer RSVPs
    match /fridayPrayerRSVPs/{rsvpId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn()
        && resource.data.userId == request.auth.uid;
    }

    // Life Group Materials - Read all, write admin only
    match /lifeGroupMaterials/{materialId} {
      allow read: if isSignedIn() && resource.data.isPublished == true;
      allow write: if isSignedIn(); // TODO: Restrict to admin role
    }

    // Life Group Settings - Read all, write admin only
    match /lifeGroupSettings/{document=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn(); // TODO: Restrict to admin role
    }
  }
}
```

## API/Service Functions to Implement

### Friday Prayer RSVP Functions

```typescript
// src/services/fridayPrayer.ts

/**
 * Get current Friday Prayer event
 */
export const getCurrentFridayPrayer = async (): Promise<FridayPrayer> => {
  const snapshot = await firestore()
    .collection('fridayPrayers')
    .where('isActive', '==', true)
    .limit(1)
    .get();

  return snapshot.docs[0]?.data();
};

/**
 * Get all RSVPs for a prayer
 */
export const getFridayPrayerRSVPs = async (prayerId: string): Promise<RSVP[]> => {
  const snapshot = await firestore()
    .collection('fridayPrayerRSVPs')
    .where('prayerId', '==', prayerId)
    .where('status', '==', 'confirmed')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Check if user has RSVP'd
 */
export const getUserRSVP = async (prayerId: string, userId: string): Promise<RSVP | null> => {
  const snapshot = await firestore()
    .collection('fridayPrayerRSVPs')
    .where('prayerId', '==', prayerId)
    .where('userId', '==', userId)
    .where('status', '==', 'confirmed')
    .limit(1)
    .get();

  return snapshot.docs[0]?.data() || null;
};

/**
 * Create RSVP
 */
export const createRSVP = async (data: CreateRSVPData): Promise<void> => {
  await firestore()
    .collection('fridayPrayerRSVPs')
    .add({
      ...data,
      status: 'confirmed',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Cancel RSVP
 */
export const cancelRSVP = async (rsvpId: string): Promise<void> => {
  await firestore()
    .collection('fridayPrayerRSVPs')
    .doc(rsvpId)
    .update({
      status: 'cancelled',
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Get total attendee count
 */
export const getTotalAttendees = async (prayerId: string): Promise<number> => {
  const rsvps = await getFridayPrayerRSVPs(prayerId);
  return rsvps.reduce((sum, rsvp) => sum + rsvp.numberOfPeople, 0);
};
```

### Life Group Materials Functions

```typescript
// src/services/lifeGroupMaterials.ts

/**
 * Get current week's material
 */
export const getCurrentMaterial = async (): Promise<LifeGroupMaterial> => {
  const snapshot = await firestore()
    .collection('lifeGroupMaterials')
    .where('isCurrent', '==', true)
    .where('isPublished', '==', true)
    .limit(1)
    .get();

  return snapshot.docs[0]?.data();
};

/**
 * Get all published materials (ordered by week)
 */
export const getAllMaterials = async (): Promise<LifeGroupMaterial[]> => {
  const snapshot = await firestore()
    .collection('lifeGroupMaterials')
    .where('isPublished', '==', true)
    .orderBy('weekNumber', 'desc')
    .limit(20)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get materials by year
 */
export const getMaterialsByYear = async (year: number): Promise<LifeGroupMaterial[]> => {
  const snapshot = await firestore()
    .collection('lifeGroupMaterials')
    .where('year', '==', year)
    .where('isPublished', '==', true)
    .orderBy('weekNumber', 'desc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Usage in Components

### LifeGroupsScreen Integration

Replace the sample data arrays with Firebase queries:

```typescript
// In LifeGroupsScreen.tsx

useEffect(() => {
  loadFridayPrayer();
  loadMaterials();
}, []);

const loadFridayPrayer = async () => {
  const prayer = await getCurrentFridayPrayer();
  setFridayPrayer(prayer);

  const rsvps = await getFridayPrayerRSVPs(prayer.id);
  setRsvps(rsvps);
};

const loadMaterials = async () => {
  const materials = await getAllMaterials();
  setLifeGroupMaterials(materials);
};
```

## Admin Panel Requirements

To manage this data, you'll need an admin panel with:

1. **Friday Prayer Management**
   - Create new Friday Prayer events
   - Set active prayer for the week
   - View RSVP list and total count
   - Export attendee list

2. **Life Group Materials Management**
   - Create/edit weekly materials
   - Upload PDF documents
   - Set current week's material
   - Archive old materials
   - Preview before publishing

3. **Notifications** (Future)
   - Send reminders about Friday Prayer
   - Notify when new materials are available
   - Alert about RSVP confirmations

## Migration Script

Sample script to populate initial data:

```typescript
// scripts/populateSampleLifeGroupData.ts

const samplePrayer = {
  date: "2024-12-20",
  time: "7:00 PM - 9:00 PM",
  location: "Clement's House",
  address: "123 Faith Street, Royal Signet, CA 90210",
  host: "Clement",
  hostId: "clementUserId",
  isActive: true,
  createdAt: firestore.FieldValue.serverTimestamp(),
  updatedAt: firestore.FieldValue.serverTimestamp(),
};

const sampleMaterial = {
  week: "Week 12",
  weekNumber: 12,
  date: "2024-12-20",
  year: 2024,
  title: "Living in the Light",
  topic: "Walking in Truth and Love",
  bibleReading: "1 John 1:5-10",
  keyVerse: "If we walk in the light...",
  keyVerseReference: "1 John 1:7",
  discussionQuestions: [...],
  prayerPoints: [...],
  isCurrent: true,
  isPublished: true,
  createdAt: firestore.FieldValue.serverTimestamp(),
  updatedAt: firestore.FieldValue.serverTimestamp(),
};

// Run migration
await firestore().collection('fridayPrayers').add(samplePrayer);
await firestore().collection('lifeGroupMaterials').add(sampleMaterial);
```
