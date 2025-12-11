import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  PrayerRequest,
  PrayerInteraction,
  PrayerStatus,
  CreatePrayerRequestInput,
  UpdatePrayerRequestInput,
} from '../types/prayer';

const PRAYER_REQUESTS_COLLECTION = 'prayerRequests';
const PRAYER_INTERACTIONS_COLLECTION = 'prayerInteractions';

/**
 * Get prayer requests by status
 */
export const getPrayerRequests = async (
  status: PrayerStatus = 'active',
  limitCount: number = 50
): Promise<PrayerRequest[]> => {
  try {
    const q = query(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const prayers: PrayerRequest[] = [];

    querySnapshot.forEach((doc) => {
      prayers.push({
        id: doc.id,
        ...doc.data(),
      } as PrayerRequest);
    });

    return prayers;
  } catch (error) {
    console.error('Error getting prayer requests:', error);
    throw error;
  }
};

/**
 * Subscribe to prayer requests with real-time updates
 */
export const subscribeToPrayerRequests = (
  status: PrayerStatus,
  callback: (prayers: PrayerRequest[]) => void,
  limitCount: number = 50
): (() => void) => {
  const q = query(
    collection(db, PRAYER_REQUESTS_COLLECTION),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const prayers: PrayerRequest[] = [];
      querySnapshot.forEach((doc) => {
        prayers.push({
          id: doc.id,
          ...doc.data(),
        } as PrayerRequest);
      });
      callback(prayers);
    },
    (error) => {
      console.error('Error subscribing to prayer requests:', error);
    }
  );

  return unsubscribe;
};

/**
 * Create a new prayer request
 */
export const createPrayerRequest = async (
  input: CreatePrayerRequestInput
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create prayer request');
    }

    const prayerData = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userAvatar: user.photoURL || '',
      request: input.request,
      status: 'active' as PrayerStatus,
      prayerCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEdited: false,
      answeredAt: null,
    };

    const docRef = await addDoc(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      prayerData
    );

    return docRef.id;
  } catch (error) {
    console.error('Error creating prayer request:', error);
    throw error;
  }
};

/**
 * Update a prayer request
 */
export const updatePrayerRequest = async (
  prayerId: string,
  updates: UpdatePrayerRequestInput
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update prayer request');
    }

    // Verify ownership
    const prayerRef = doc(db, PRAYER_REQUESTS_COLLECTION, prayerId);
    const prayerDoc = await getDoc(prayerRef);

    if (!prayerDoc.exists()) {
      throw new Error('Prayer request not found');
    }

    if (prayerDoc.data().userId !== user.uid) {
      throw new Error('You can only update your own prayer requests');
    }

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // If request text is being updated, mark as edited
    if (updates.request) {
      updateData.isEdited = true;
    }

    await updateDoc(prayerRef, updateData);
  } catch (error) {
    console.error('Error updating prayer request:', error);
    throw error;
  }
};

/**
 * Mark prayer as answered
 */
export const markPrayerAsAnswered = async (prayerId: string): Promise<void> => {
  try {
    await updatePrayerRequest(prayerId, {
      status: 'answered',
    });

    // Add answered timestamp
    const prayerRef = doc(db, PRAYER_REQUESTS_COLLECTION, prayerId);
    await updateDoc(prayerRef, {
      answeredAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking prayer as answered:', error);
    throw error;
  }
};

/**
 * Delete prayer request (soft delete)
 */
export const deletePrayerRequest = async (prayerId: string): Promise<void> => {
  try {
    await updatePrayerRequest(prayerId, {
      status: 'deleted',
    });
  } catch (error) {
    console.error('Error deleting prayer request:', error);
    throw error;
  }
};

/**
 * Hard delete prayer request (permanent - use with caution)
 */
export const permanentlyDeletePrayerRequest = async (
  prayerId: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Verify ownership
    const prayerRef = doc(db, PRAYER_REQUESTS_COLLECTION, prayerId);
    const prayerDoc = await getDoc(prayerRef);

    if (!prayerDoc.exists()) {
      throw new Error('Prayer request not found');
    }

    if (prayerDoc.data().userId !== user.uid) {
      throw new Error('You can only delete your own prayer requests');
    }

    await deleteDoc(prayerRef);
  } catch (error) {
    console.error('Error permanently deleting prayer request:', error);
    throw error;
  }
};

/**
 * Toggle prayer interaction (pray/unpray)
 */
export const togglePrayed = async (
  prayerId: string
): Promise<{ hasPrayed: boolean; newCount: number }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to pray');
    }

    // Check if user has already prayed
    const interaction = await getUserPrayerInteraction(prayerId, user.uid);

    if (interaction) {
      // Remove prayer
      await deleteDoc(doc(db, PRAYER_INTERACTIONS_COLLECTION, interaction.id));

      // Decrement prayer count
      const prayerRef = doc(db, PRAYER_REQUESTS_COLLECTION, prayerId);
      const prayerDoc = await getDoc(prayerRef);
      const currentCount = prayerDoc.data()?.prayerCount || 0;
      const newCount = Math.max(0, currentCount - 1);

      await updateDoc(prayerRef, {
        prayerCount: newCount,
      });

      return { hasPrayed: false, newCount };
    } else {
      // Add prayer
      await addDoc(collection(db, PRAYER_INTERACTIONS_COLLECTION), {
        prayerId,
        userId: user.uid,
        action: 'prayed',
        createdAt: serverTimestamp(),
      });

      // Increment prayer count
      const prayerRef = doc(db, PRAYER_REQUESTS_COLLECTION, prayerId);
      const prayerDoc = await getDoc(prayerRef);
      const currentCount = prayerDoc.data()?.prayerCount || 0;
      const newCount = currentCount + 1;

      await updateDoc(prayerRef, {
        prayerCount: newCount,
      });

      return { hasPrayed: true, newCount };
    }
  } catch (error) {
    console.error('Error toggling prayer:', error);
    throw error;
  }
};

/**
 * Get user's prayer interaction for a specific prayer
 */
export const getUserPrayerInteraction = async (
  prayerId: string,
  userId: string
): Promise<PrayerInteraction | null> => {
  try {
    const q = query(
      collection(db, PRAYER_INTERACTIONS_COLLECTION),
      where('prayerId', '==', prayerId),
      where('userId', '==', userId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as PrayerInteraction;
  } catch (error) {
    console.error('Error getting user prayer interaction:', error);
    return null;
  }
};

/**
 * Get all prayer interactions for a prayer request
 */
export const getPrayerInteractions = async (
  prayerId: string
): Promise<PrayerInteraction[]> => {
  try {
    const q = query(
      collection(db, PRAYER_INTERACTIONS_COLLECTION),
      where('prayerId', '==', prayerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const interactions: PrayerInteraction[] = [];

    querySnapshot.forEach((doc) => {
      interactions.push({
        id: doc.id,
        ...doc.data(),
      } as PrayerInteraction);
    });

    return interactions;
  } catch (error) {
    console.error('Error getting prayer interactions:', error);
    throw error;
  }
};

/**
 * Check if current user has prayed for multiple prayers (batch check)
 */
export const checkUserPrayedStatus = async (
  prayerIds: string[]
): Promise<Map<string, boolean>> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return new Map();
    }

    const statusMap = new Map<string, boolean>();

    // Firestore 'in' queries are limited to 10 items, so we need to batch
    const batchSize = 10;
    for (let i = 0; i < prayerIds.length; i += batchSize) {
      const batch = prayerIds.slice(i, i + batchSize);

      const q = query(
        collection(db, PRAYER_INTERACTIONS_COLLECTION),
        where('prayerId', 'in', batch),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const interaction = doc.data() as PrayerInteraction;
        statusMap.set(interaction.prayerId, true);
      });
    }

    // Set false for prayers not in the results
    prayerIds.forEach((id) => {
      if (!statusMap.has(id)) {
        statusMap.set(id, false);
      }
    });

    return statusMap;
  } catch (error) {
    console.error('Error checking user prayed status:', error);
    return new Map();
  }
};
