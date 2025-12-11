import { db as firestore } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Get the next Friday's date
 */
const getNextFriday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Calculate days until next Friday (0 = Sunday, 5 = Friday)
  let daysUntilFriday = 5 - dayOfWeek;

  // If today is Friday, get next Friday (7 days)
  if (daysUntilFriday === 0) {
    daysUntilFriday = 7;
  }

  // If we're past Friday, get next week's Friday
  if (daysUntilFriday < 0) {
    daysUntilFriday += 7;
  }

  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  nextFriday.setHours(0, 0, 0, 0); // Reset time to midnight

  return nextFriday;
};

/**
 * Format date for display (e.g., "Friday, 20 December 2024")
 */
const formatFridayDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Check if there's already an active Friday Prayer for the upcoming Friday
 */
const hasActiveFridayPrayer = async (): Promise<boolean> => {
  try {
    const q = query(
      collection(firestore, 'fridayPrayers'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    // Check if the active prayer is for this coming Friday
    const nextFriday = getNextFriday();
    const nextFridayString = formatFridayDate(nextFriday);

    return snapshot.docs.some(doc => {
      const data = doc.data();
      return data.date === nextFridayString;
    });
  } catch (error) {
    console.error('Error checking for active Friday Prayer:', error);
    return false;
  }
};

/**
 * Create a new Friday Prayer event for the upcoming Friday
 * This should be called weekly (ideally on Saturday after Friday Prayer)
 */
export const createNextFridayPrayer = async (
  hostId?: string,
  hostName: string = 'Clement',
  hostAvatar?: string
): Promise<string | null> => {
  try {
    // Check if we already have a prayer for next Friday
    const hasActive = await hasActiveFridayPrayer();
    if (hasActive) {
      console.log('Active Friday Prayer already exists for next week');
      return null;
    }

    const nextFriday = getNextFriday();
    const dateString = formatFridayDate(nextFriday);

    // Deactivate all existing prayers first
    const existingQuery = query(
      collection(firestore, 'fridayPrayers'),
      where('isActive', '==', true)
    );
    const existingSnapshot = await getDocs(existingQuery);

    const deactivatePromises = existingSnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isActive: false, updatedAt: serverTimestamp() })
    );
    await Promise.all(deactivatePromises);

    // Create new Friday Prayer
    const fridayPrayerData = {
      date: dateString,
      time: '7:00 PM - 9:00 PM',
      location: "Clement's House, Watford",
      address: 'WD25 9AP, Watford, Hertfordshire',
      host: hostName,
      hostAvatar: hostAvatar || 'https://i.pravatar.cc/150?img=15',
      hostId: hostId || 'admin',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(firestore, 'fridayPrayers'),
      fridayPrayerData
    );

    console.log('✅ Created Friday Prayer for', dateString, 'with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating next Friday Prayer:', error);
    throw error;
  }
};

/**
 * Auto-create Friday Prayer if needed
 * Call this function regularly (e.g., on app startup or via scheduled job)
 */
export const ensureFridayPrayerExists = async (): Promise<void> => {
  try {
    const hasActive = await hasActiveFridayPrayer();

    if (!hasActive) {
      console.log('No active Friday Prayer found. Creating one...');
      await createNextFridayPrayer();
    } else {
      console.log('Active Friday Prayer already exists');
    }
  } catch (error) {
    console.error('Error ensuring Friday Prayer exists:', error);
  }
};

/**
 * Get details about the next Friday
 */
export const getNextFridayDetails = () => {
  const nextFriday = getNextFriday();
  return {
    date: nextFriday,
    dateString: formatFridayDate(nextFriday),
    location: "Clement's House, Watford",
    address: 'WD25 9AP, Watford, Hertfordshire',
    postcode: 'WD25 9AP',
    host: 'Clement',
    time: '7:00 PM - 9:00 PM',
  };
};
