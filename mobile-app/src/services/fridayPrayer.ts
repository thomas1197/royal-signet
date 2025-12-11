import { db as firestore, auth } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

export interface FridayPrayer {
  id: string;
  date: string;
  time: string;
  location: string;
  address: string;
  host: string;
  hostAvatar?: string;
  hostId: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface RSVP {
  id: string;
  prayerId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  numberOfPeople: number;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}

export interface CreateRSVPData {
  prayerId: string;
  numberOfPeople: number;
  notes?: string;
}

/**
 * Get the current active Friday Prayer event
 */
export const getCurrentFridayPrayer = async (): Promise<FridayPrayer | null> => {
  try {
    const q = query(
      collection(firestore, 'fridayPrayers'),
      where('isActive', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No active Friday Prayer found');
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FridayPrayer;
  } catch (error) {
    console.error('Error getting current Friday Prayer:', error);
    throw error;
  }
};

/**
 * Get all confirmed RSVPs for a specific prayer
 */
export const getFridayPrayerRSVPs = async (prayerId: string): Promise<RSVP[]> => {
  try {
    const q = query(
      collection(firestore, 'fridayPrayerRSVPs'),
      where('prayerId', '==', prayerId),
      where('status', '==', 'confirmed')
    );

    const snapshot = await getDocs(q);

    // Sort manually in memory
    const rsvps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RSVP[];

    return rsvps.sort((a, b) => {
      // Sort by createdAt if available
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      return 0;
    });
  } catch (error) {
    console.error('Error getting Friday Prayer RSVPs:', error);
    throw error;
  }
};

/**
 * Listen to RSVP changes in real-time
 */
export const subscribeFridayPrayerRSVPs = (
  prayerId: string,
  onUpdate: (rsvps: RSVP[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(firestore, 'fridayPrayerRSVPs'),
    where('prayerId', '==', prayerId),
    where('status', '==', 'confirmed')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const rsvps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RSVP[];

      // Sort manually in memory
      const sortedRsvps = rsvps.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      });

      onUpdate(sortedRsvps);
    },
    (error) => {
      console.error('Error listening to RSVPs:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Check if the current user has an active RSVP for a prayer
 */
export const getUserRSVP = async (
  prayerId: string,
  userId: string
): Promise<RSVP | null> => {
  try {
    const q = query(
      collection(firestore, 'fridayPrayerRSVPs'),
      where('prayerId', '==', prayerId),
      where('userId', '==', userId),
      where('status', '==', 'confirmed'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as RSVP;
  } catch (error) {
    console.error('Error getting user RSVP:', error);
    throw error;
  }
};

/**
 * Create a new RSVP for Friday Prayer
 */
export const createRSVP = async (data: CreateRSVPData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to RSVP');
    }

    // Check if user already has an RSVP
    const existingRSVP = await getUserRSVP(data.prayerId, user.uid);
    if (existingRSVP) {
      throw new Error('You have already RSVP\'d for this prayer');
    }

    // Build RSVP data object, only including defined fields
    const rsvpData: any = {
      prayerId: data.prayerId,
      userId: user.uid,
      userName: user.displayName || 'Guest',
      numberOfPeople: data.numberOfPeople,
      notes: data.notes || '',
      status: 'confirmed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (user.photoURL) {
      rsvpData.userAvatar = user.photoURL;
    }
    if (user.email) {
      rsvpData.userEmail = user.email;
    }

    const docRef = await addDoc(collection(firestore, 'fridayPrayerRSVPs'), rsvpData);
    console.log('RSVP created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating RSVP:', error);
    throw error;
  }
};

/**
 * Update an existing RSVP
 */
export const updateRSVP = async (
  rsvpId: string,
  numberOfPeople: number,
  notes?: string
): Promise<void> => {
  try {
    const rsvpRef = doc(firestore, 'fridayPrayerRSVPs', rsvpId);
    await updateDoc(rsvpRef, {
      numberOfPeople,
      notes: notes || '',
      updatedAt: serverTimestamp(),
    });
    console.log('RSVP updated:', rsvpId);
  } catch (error) {
    console.error('Error updating RSVP:', error);
    throw error;
  }
};

/**
 * Cancel an RSVP (soft delete by changing status)
 */
export const cancelRSVP = async (rsvpId: string): Promise<void> => {
  try {
    const rsvpRef = doc(firestore, 'fridayPrayerRSVPs', rsvpId);
    await updateDoc(rsvpRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    console.log('RSVP cancelled:', rsvpId);
  } catch (error) {
    console.error('Error cancelling RSVP:', error);
    throw error;
  }
};

/**
 * Get the total number of attendees for a prayer
 */
export const getTotalAttendees = async (prayerId: string): Promise<number> => {
  try {
    const rsvps = await getFridayPrayerRSVPs(prayerId);
    return rsvps.reduce((sum, rsvp) => sum + rsvp.numberOfPeople, 0);
  } catch (error) {
    console.error('Error getting total attendees:', error);
    return 0;
  }
};

/**
 * Create a new Friday Prayer event (admin function)
 */
export const createFridayPrayer = async (data: Omit<FridayPrayer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Deactivate all existing prayers first
    const q = query(
      collection(firestore, 'fridayPrayers'),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isActive: false, updatedAt: serverTimestamp() })
    );
    await Promise.all(updatePromises);

    // Create new prayer
    const prayerData = {
      ...data,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, 'fridayPrayers'), prayerData);
    console.log('Friday Prayer created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating Friday Prayer:', error);
    throw error;
  }
};
