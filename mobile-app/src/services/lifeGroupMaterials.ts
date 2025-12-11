import { db as firestore } from './firebase';
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
} from 'firebase/firestore';

export interface LifeGroupMaterial {
  id: string;
  week: string;
  weekNumber: number;
  date: string;
  year: number;
  title: string;
  topic: string;
  bibleReading: string;
  keyVerse: string;
  keyVerseReference: string;
  discussionQuestions: string[];
  prayerPoints: string[];
  pdfUrl?: string;
  videoUrl?: string;
  isCurrent: boolean;
  isPublished: boolean;
  author?: string;
  authorId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CreateMaterialData {
  week: string;
  weekNumber: number;
  date: string;
  year: number;
  title: string;
  topic: string;
  bibleReading: string;
  keyVerse: string;
  keyVerseReference: string;
  discussionQuestions: string[];
  prayerPoints: string[];
  pdfUrl?: string;
  videoUrl?: string;
}

/**
 * Get the current week's life group material
 */
export const getCurrentMaterial = async (): Promise<LifeGroupMaterial | null> => {
  try {
    const q = query(
      collection(firestore, 'lifeGroupMaterials'),
      where('isCurrent', '==', true),
      where('isPublished', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No current material found');
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as LifeGroupMaterial;
  } catch (error) {
    console.error('Error getting current material:', error);
    throw error;
  }
};

/**
 * Get all published life group materials (ordered by week, newest first)
 */
export const getAllMaterials = async (limitCount: number = 20): Promise<LifeGroupMaterial[]> => {
  try {
    const q = query(
      collection(firestore, 'lifeGroupMaterials'),
      where('isPublished', '==', true)
    );

    const snapshot = await getDocs(q);

    // Sort manually in memory
    const materials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LifeGroupMaterial[];

    return materials.sort((a, b) => {
      // Sort by weekNumber descending (newest first)
      return b.weekNumber - a.weekNumber;
    }).slice(0, limitCount);
  } catch (error) {
    console.error('Error getting all materials:', error);
    throw error;
  }
};

/**
 * Listen to materials changes in real-time
 */
export const subscribeMaterials = (
  onUpdate: (materials: LifeGroupMaterial[]) => void,
  onError?: (error: Error) => void,
  limitCount: number = 20
) => {
  const q = query(
    collection(firestore, 'lifeGroupMaterials'),
    where('isPublished', '==', true)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const materials = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LifeGroupMaterial[];

      // Sort manually in memory
      const sortedMaterials = materials.sort((a, b) => {
        // Sort by weekNumber descending (newest first)
        return b.weekNumber - a.weekNumber;
      }).slice(0, limitCount);

      onUpdate(sortedMaterials);
    },
    (error) => {
      console.error('Error listening to materials:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Get materials by year
 */
export const getMaterialsByYear = async (year: number): Promise<LifeGroupMaterial[]> => {
  try {
    const q = query(
      collection(firestore, 'lifeGroupMaterials'),
      where('year', '==', year),
      where('isPublished', '==', true)
    );

    const snapshot = await getDocs(q);

    // Sort manually in memory
    const materials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LifeGroupMaterial[];

    return materials.sort((a, b) => {
      // Sort by weekNumber descending (newest first)
      return b.weekNumber - a.weekNumber;
    });
  } catch (error) {
    console.error('Error getting materials by year:', error);
    throw error;
  }
};

/**
 * Get a specific material by ID
 */
export const getMaterialById = async (materialId: string): Promise<LifeGroupMaterial | null> => {
  try {
    const docRef = doc(firestore, 'lifeGroupMaterials', materialId);
    const docSnap = await getDocs(query(collection(firestore, 'lifeGroupMaterials'), where('__name__', '==', materialId)));

    if (docSnap.empty) {
      return null;
    }

    const document = docSnap.docs[0];
    return {
      id: document.id,
      ...document.data(),
    } as LifeGroupMaterial;
  } catch (error) {
    console.error('Error getting material by ID:', error);
    throw error;
  }
};

/**
 * Create a new life group material (admin function)
 */
export const createMaterial = async (
  data: CreateMaterialData,
  authorName?: string,
  authorId?: string
): Promise<string> => {
  try {
    // If this is set as current, deactivate all other current materials
    const currentQ = query(
      collection(firestore, 'lifeGroupMaterials'),
      where('isCurrent', '==', true)
    );
    const currentSnapshot = await getDocs(currentQ);

    const updatePromises = currentSnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isCurrent: false, updatedAt: serverTimestamp() })
    );
    await Promise.all(updatePromises);

    const materialData = {
      ...data,
      isCurrent: true,
      isPublished: true,
      author: authorName,
      authorId: authorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, 'lifeGroupMaterials'), materialData);
    console.log('Material created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

/**
 * Update an existing material (admin function)
 */
export const updateMaterial = async (
  materialId: string,
  updates: Partial<CreateMaterialData>
): Promise<void> => {
  try {
    const materialRef = doc(firestore, 'lifeGroupMaterials', materialId);
    await updateDoc(materialRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('Material updated:', materialId);
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

/**
 * Set a material as current (admin function)
 */
export const setCurrentMaterial = async (materialId: string): Promise<void> => {
  try {
    // Deactivate all current materials
    const currentQ = query(
      collection(firestore, 'lifeGroupMaterials'),
      where('isCurrent', '==', true)
    );
    const currentSnapshot = await getDocs(currentQ);

    const updatePromises = currentSnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isCurrent: false, updatedAt: serverTimestamp() })
    );
    await Promise.all(updatePromises);

    // Set the specified material as current
    const materialRef = doc(firestore, 'lifeGroupMaterials', materialId);
    await updateDoc(materialRef, {
      isCurrent: true,
      updatedAt: serverTimestamp(),
    });

    console.log('Material set as current:', materialId);
  } catch (error) {
    console.error('Error setting current material:', error);
    throw error;
  }
};

/**
 * Publish or unpublish a material (admin function)
 */
export const toggleMaterialPublished = async (
  materialId: string,
  isPublished: boolean
): Promise<void> => {
  try {
    const materialRef = doc(firestore, 'lifeGroupMaterials', materialId);
    await updateDoc(materialRef, {
      isPublished,
      updatedAt: serverTimestamp(),
    });
    console.log(`Material ${isPublished ? 'published' : 'unpublished'}:`, materialId);
  } catch (error) {
    console.error('Error toggling material published status:', error);
    throw error;
  }
};
