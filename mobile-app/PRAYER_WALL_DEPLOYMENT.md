# Prayer Wall Feature - Deployment & Testing Guide

## Overview

The Prayer Wall has been upgraded with comprehensive prayer request management features:

- ✅ **Swipe Actions** - Edit, mark as answered, or delete prayers with intuitive swipe gestures
- ✅ **Separate Tabs** - "Active Prayers" and "Answered Prayers" sections
- ✅ **Full Edit Capability** - Edit prayer text with "edited" indicator
- ✅ **Soft Delete** - Recoverable deletion (status change, not permanent)
- ✅ **Real-time Updates** - Firebase Firestore subscriptions
- ✅ **User Ownership** - Users can only manage their own prayers

## New Files Created

### 1. Type Definitions
**`src/types/prayer.ts`**
- `PrayerRequest` - Firestore prayer request interface
- `PrayerInteraction` - Prayer interaction (who prayed) interface
- `PrayerRequestDisplay` - UI display format with formatted dates
- `PrayerStatus` - Type: 'active' | 'answered' | 'deleted'

### 2. Prayer Service
**`src/services/prayerWall.ts`**

Core Functions:
- `getPrayerRequests(status)` - Get prayers by status
- `subscribeToPrayerRequests(status, callback)` - Real-time updates
- `createPrayerRequest(input)` - Add new prayer
- `updatePrayerRequest(id, updates)` - Edit prayer
- `markPrayerAsAnswered(id)` - Move to answered section
- `deletePrayerRequest(id)` - Soft delete
- `togglePrayed(prayerId)` - Mark as prayed/unprayed
- `checkUserPrayedStatus(prayerIds)` - Batch check prayer status

### 3. Swipeable Prayer Card Component
**`src/screens/prayers/components/PrayerCard.tsx`**

Features:
- Swipe-left reveals action buttons: Edit (blue), Answered (green), Delete (red)
- Shows "edited" badge if prayer was modified
- Displays relative time ("2 hours ago")
- Prayer button with count
- Only shows swipe actions to prayer owner

### 4. Updated Prayer Wall Screen
**`src/screens/prayers/PrayerWallScreen.tsx`**

New Features:
- Tab navigation between Active and Answered prayers
- Firebase real-time subscriptions
- Edit modal for updating prayers
- Confirmation dialogs for delete and mark-answered
- Loading and empty states
- Pull-to-refresh
- Optimistic updates for better UX

### 5. Firebase Security Rules
**`firestore.rules`**

Added rules for:
- `prayerRequests` collection
- `prayerInteractions` collection

Security:
- Users can only edit/delete their own prayers
- Soft delete enforced (no hard deletes)
- Proper authentication checks

## Firestore Collections

### Collection: `prayerRequests`

```javascript
{
  id: "auto-generated",
  userId: "user123",                    // Firebase auth UID
  userName: "John Doe",                 // Display name
  userAvatar: "https://...",            // Avatar URL
  request: "Please pray for...",        // Prayer text
  status: "active",                     // "active" | "answered" | "deleted"
  prayerCount: 5,                       // Number of people praying
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isEdited: false,                      // True if edited after creation
  answeredAt: Timestamp | null          // When marked as answered
}
```

### Collection: `prayerInteractions`

```javascript
{
  id: "auto-generated",
  prayerId: "prayer123",                // Reference to prayer request
  userId: "user456",                    // User who prayed
  action: "prayed",                     // Action type
  createdAt: Timestamp
}
```

## Deployment Steps

### 1. Deploy Firebase Rules

```bash
cd "/Users/thomasv/Documents/Side Projects/royal-signet"
firebase deploy --only firestore:rules
```

Verify rules are deployed:
- Go to Firebase Console → Firestore Database → Rules
- Confirm `prayerRequests` and `prayerInteractions` rules are present

### 2. Create Firestore Indexes (if needed)

The app uses these queries that may require composite indexes:

```bash
# prayerRequests collection
status (asc) + createdAt (desc)

# prayerInteractions collection
prayerId (asc) + userId (asc)
userId (asc) + createdAt (desc)
```

**To create indexes:**
1. Run the app and trigger the queries
2. Firebase will show index creation links in the console
3. Click the links to auto-generate required indexes

OR manually create via Firebase Console:
- Firestore Database → Indexes → Create Index

### 3. Test on Device/Simulator

```bash
# Start the development server
cd mobile-app
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Testing Checklist

### ✅ Basic Functionality

- [ ] **Create Prayer**
  - Tap FAB (+) button
  - Enter prayer text
  - Submit and verify it appears in Active Prayers
  - Check real-time update on other devices

- [ ] **View Prayers**
  - Active Prayers tab shows active prayers
  - Answered Prayers tab shows answered prayers
  - Empty states show when no prayers exist

### ✅ Swipe Actions (Owner Only)

- [ ] **Swipe Left on Your Own Prayer**
  - Swipe reveals Edit (blue), Answered (green), Delete (red)
  - Actions only visible on prayers you created
  - Swipe on others' prayers shows no actions

- [ ] **Edit Prayer**
  - Swipe and tap Edit button
  - Modify prayer text
  - Submit and verify:
    - Text is updated
    - "• edited" badge appears
    - Other users see the update

- [ ] **Mark as Answered**
  - Swipe and tap Answered (checkmark)
  - Confirm dialog: "Yes, Answered!"
  - Verify:
    - Prayer moves from Active → Answered tab
    - Success message: "Praise God!"
    - Other users see the move

- [ ] **Delete Prayer**
  - Swipe and tap Delete (trash)
  - Confirm dialog: "Delete"
  - Verify:
    - Prayer disappears from feed
    - Still exists in Firestore with status: "deleted"
    - Other users no longer see it

### ✅ Prayer Interactions

- [ ] **Pray for Someone**
  - Tap "Pray" button on any prayer
  - Button turns active/filled
  - Text changes to "Praying"
  - Prayer count increments by 1
  - Other users see count update

- [ ] **Unpray**
  - Tap "Praying" button again
  - Button returns to inactive state
  - Text changes to "Pray"
  - Prayer count decrements by 1

### ✅ Real-time Updates

- [ ] **Multi-device Testing**
  - Open app on 2+ devices/simulators
  - Create prayer on Device A
  - Verify appears on Device B instantly
  - Delete prayer on Device A
  - Verify disappears on Device B

### ✅ Edge Cases

- [ ] Empty text validation (should show error)
- [ ] Very long prayer text (should wrap properly)
- [ ] No internet connection (should show error)
- [ ] User not authenticated (should redirect to login)
- [ ] Multiple rapid taps on buttons (should handle gracefully)
- [ ] Edit without changing text (should still work)

### ✅ Security

- [ ] **Ownership Verification**
  - User A creates prayer
  - User B logs in
  - User B cannot edit/delete User A's prayer
  - User B can only pray for User A's prayer

- [ ] **Firebase Rules**
  - Try to delete prayer via Firebase Console
  - Should fail (soft delete enforced)
  - Try to edit someone else's prayer
  - Should fail (ownership check)

## Troubleshooting

### Issue: "Permission denied" errors

**Solution:**
```bash
# Redeploy Firestore rules
firebase deploy --only firestore:rules

# Check Firebase Console for proper authentication
```

### Issue: Prayers not appearing

**Solution:**
1. Check Firebase Console → Firestore Database
2. Verify `prayerRequests` collection exists
3. Check network tab for API errors
4. Verify user is authenticated: `console.log(auth.currentUser)`

### Issue: Swipe actions not working

**Solution:**
1. Verify `react-native-gesture-handler` is properly linked
2. Check that `GestureHandlerRootView` wraps the screen
3. Rebuild app: `npm run ios` or `npm run android`

### Issue: "Missing index" errors

**Solution:**
1. Click the Firebase-provided link in console/logs
2. Or manually create indexes in Firebase Console
3. Wait 2-5 minutes for index creation to complete

### Issue: Real-time updates not working

**Solution:**
1. Check Firebase Console → Database → Data
2. Verify Network is enabled in Firebase settings
3. Check `onSnapshot` subscription in console logs
4. Try pull-to-refresh to force update

## Performance Optimization

### 1. Pagination (Future Enhancement)

Currently loads 50 prayers max. To add pagination:

```typescript
// In prayerWall.ts
export const getPrayerRequestsPaginated = async (
  status: PrayerStatus,
  lastDoc: DocumentSnapshot | null,
  limitCount: number = 20
) => {
  // Implement pagination with startAfter(lastDoc)
}
```

### 2. Caching

Add AsyncStorage caching for offline support:

```typescript
// Cache prayers locally
await AsyncStorage.setItem('activePrayers', JSON.stringify(prayers));

// Load from cache first
const cached = await AsyncStorage.getItem('activePrayers');
if (cached) setPrayers(JSON.parse(cached));
```

### 3. Image Optimization

User avatars are loaded from Firebase Storage. Consider:
- Thumbnail generation via Cloud Functions
- Image CDN (Firebase Hosting + Cloud Storage)
- Lazy loading for long lists

## Analytics (Optional)

Track prayer wall engagement:

```typescript
// In PrayerWallScreen.tsx
import { logEvent } from 'firebase/analytics';

// Log prayer created
logEvent(analytics, 'prayer_created', {
  prayer_id: prayerId,
  prayer_length: request.length,
});

// Log prayer answered
logEvent(analytics, 'prayer_answered', {
  prayer_id: prayerId,
  time_to_answer_days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
});
```

## Next Steps

### Recommended Enhancements

1. **Push Notifications**
   - Notify users when someone prays for their request
   - Notify when prayers are answered

2. **Prayer History**
   - User profile section showing their prayer history
   - Filter by active/answered/deleted

3. **Categories/Tags**
   - Add prayer categories (health, family, work, etc.)
   - Filter prayers by category

4. **Privacy Options**
   - Public vs. Private prayers
   - Anonymous prayer requests

5. **Prayer Reminders**
   - Daily/weekly prayer reminders
   - Specific prayer follow-up reminders

6. **Share Answered Prayers**
   - Testimony sharing for answered prayers
   - Social media integration

7. **Prayer Groups**
   - Create prayer groups (family, friends, life groups)
   - Group-specific prayer walls

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review React Native debugger
3. Check device logs: `npx react-native log-ios` or `npx react-native log-android`
4. Verify all dependencies are installed: `npm install`

## Rollback Plan

If issues occur in production:

1. **Disable Feature**
   ```typescript
   // In PrayerWallScreen.tsx
   const FEATURE_ENABLED = false;
   if (!FEATURE_ENABLED) {
     return <Text>Prayer Wall maintenance in progress</Text>;
   }
   ```

2. **Revert Firebase Rules**
   ```bash
   git checkout HEAD~1 firestore.rules
   firebase deploy --only firestore:rules
   ```

3. **Restore Previous Version**
   ```bash
   git revert <commit-hash>
   git push
   ```

---

**Feature Status:** ✅ Ready for Testing
**Last Updated:** November 20, 2024
**Version:** 1.0.0
