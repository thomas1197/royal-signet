/**
 * Sunday School Service
 * Handles CRUD operations for Sunday School classes and children
 */

import { db, auth } from './firebase';
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
  onSnapshot,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import {
  SundaySchoolClass,
  SundaySchoolClassInput,
  Child,
  ChildInput,
  AgeGroup,
} from '../types/sundaySchool';

// ============================================
// SUNDAY SCHOOL CLASSES
// ============================================

/**
 * Get all active Sunday School classes
 */
export const getAllClasses = async (): Promise<SundaySchoolClass[]> => {
  const q = query(
    collection(db, 'sundaySchoolClasses'),
    where('isActive', '==', true),
    orderBy('ageGroup', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SundaySchoolClass)
  );
};

/**
 * Get classes by age group
 */
export const getClassesByAgeGroup = async (
  ageGroup: AgeGroup
): Promise<SundaySchoolClass[]> => {
  const q = query(
    collection(db, 'sundaySchoolClasses'),
    where('isActive', '==', true),
    where('ageGroup', '==', ageGroup)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SundaySchoolClass)
  );
};

/**
 * Get a single class by ID
 */
export const getClassById = async (
  classId: string
): Promise<SundaySchoolClass | null> => {
  const docRef = doc(db, 'sundaySchoolClasses', classId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as SundaySchoolClass;
};

/**
 * Subscribe to all classes (real-time updates)
 */
export const subscribeToClasses = (
  onUpdate: (classes: SundaySchoolClass[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'sundaySchoolClasses'),
    where('isActive', '==', true),
    orderBy('ageGroup', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const classes = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as SundaySchoolClass)
      );
      onUpdate(classes);
    },
    onError
  );
};

/**
 * Create a new class
 */
export const createClass = async (
  data: SundaySchoolClassInput
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'sundaySchoolClasses'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update a class
 */
export const updateClass = async (
  classId: string,
  updates: Partial<SundaySchoolClassInput>
): Promise<void> => {
  await updateDoc(doc(db, 'sundaySchoolClasses', classId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Soft delete a class (set isActive to false)
 */
export const deleteClass = async (classId: string): Promise<void> => {
  await updateDoc(doc(db, 'sundaySchoolClasses', classId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

// ============================================
// CHILDREN
// ============================================

/**
 * Get all active children
 */
export const getAllChildren = async (): Promise<Child[]> => {
  const q = query(
    collection(db, 'sundaySchoolChildren'),
    where('isActive', '==', true),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Child));
};

/**
 * Get children by class
 */
export const getChildrenByClass = async (classId: string): Promise<Child[]> => {
  const q = query(
    collection(db, 'sundaySchoolChildren'),
    where('classId', '==', classId),
    where('isActive', '==', true),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Child));
};

/**
 * Get children by parent (current user's children)
 */
export const getChildrenByParent = async (
  parentId?: string
): Promise<Child[]> => {
  const uid = parentId || auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'sundaySchoolChildren'),
    where('parentIds', 'array-contains', uid),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Child));
};

/**
 * Get children by age group
 */
export const getChildrenByAgeGroup = async (
  ageGroup: AgeGroup
): Promise<Child[]> => {
  const q = query(
    collection(db, 'sundaySchoolChildren'),
    where('ageGroup', '==', ageGroup),
    where('isActive', '==', true),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Child));
};

/**
 * Get a single child by ID
 */
export const getChildById = async (childId: string): Promise<Child | null> => {
  const docRef = doc(db, 'sundaySchoolChildren', childId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Child;
};

/**
 * Subscribe to children in a class (real-time updates)
 */
export const subscribeToChildrenByClass = (
  classId: string,
  onUpdate: (children: Child[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'sundaySchoolChildren'),
    where('classId', '==', classId),
    where('isActive', '==', true)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const children = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Child)
      );
      onUpdate(children);
    },
    onError
  );
};

/**
 * Register a new child
 */
export const registerChild = async (data: ChildInput): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const docRef = await addDoc(collection(db, 'sundaySchoolChildren'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update a child's information
 */
export const updateChild = async (
  childId: string,
  updates: Partial<ChildInput>
): Promise<void> => {
  await updateDoc(doc(db, 'sundaySchoolChildren', childId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Assign a child to a class
 */
export const assignChildToClass = async (
  childId: string,
  classId: string,
  className: string
): Promise<void> => {
  await updateDoc(doc(db, 'sundaySchoolChildren', childId), {
    classId,
    className,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Remove a child from a class
 */
export const removeChildFromClass = async (childId: string): Promise<void> => {
  await updateDoc(doc(db, 'sundaySchoolChildren', childId), {
    classId: null,
    className: null,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Soft delete a child (set isActive to false)
 */
export const deleteChild = async (childId: string): Promise<void> => {
  await updateDoc(doc(db, 'sundaySchoolChildren', childId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

// ============================================
// STATISTICS
// ============================================

/**
 * Get count of children per class
 */
export const getChildrenCountByClass = async (): Promise<
  Record<string, number>
> => {
  const children = await getAllChildren();
  const counts: Record<string, number> = {};
  children.forEach((child) => {
    if (child.classId) {
      counts[child.classId] = (counts[child.classId] || 0) + 1;
    }
  });
  return counts;
};

/**
 * Get count of children per age group
 */
export const getChildrenCountByAgeGroup = async (): Promise<
  Record<AgeGroup, number>
> => {
  const children = await getAllChildren();
  const counts: Record<AgeGroup, number> = {
    toddlers: 0,
    kids_5_8: 0,
    tweens_9_12: 0,
    teens_13_17: 0,
  };
  children.forEach((child) => {
    if (child.ageGroup) {
      counts[child.ageGroup]++;
    }
  });
  return counts;
};
