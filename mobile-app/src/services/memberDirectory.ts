/**
 * Member Directory Service
 * Handles church member directory operations (Pastor only access)
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
  ChurchMember,
  ChurchMemberInput,
  MemberStatus,
  MemberFilters,
  MemberSummary,
} from '../types/members';
import { isPastor, isPastorOrAdmin } from './permissions';

// ============================================
// MEMBER CRUD OPERATIONS
// ============================================

/**
 * Get all church members (Pastor only)
 */
export const getAllMembers = async (): Promise<ChurchMember[]> => {
  // Permission check at service level (Firestore rules also enforce)
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can access the member directory');
  }

  const q = query(
    collection(db, 'churchMembers'),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ChurchMember)
  );
};

/**
 * Get a single member by ID
 */
export const getMemberById = async (
  memberId: string
): Promise<ChurchMember | null> => {
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can access member details');
  }

  const docRef = doc(db, 'churchMembers', memberId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as ChurchMember;
};

/**
 * Get members by status
 */
export const getMembersByStatus = async (
  status: MemberStatus
): Promise<ChurchMember[]> => {
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can access the member directory');
  }

  const q = query(
    collection(db, 'churchMembers'),
    where('status', '==', status),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ChurchMember)
  );
};

/**
 * Get members by life group
 */
export const getMembersByLifeGroup = async (
  lifeGroupId: string
): Promise<ChurchMember[]> => {
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can access the member directory');
  }

  const q = query(
    collection(db, 'churchMembers'),
    where('lifeGroupId', '==', lifeGroupId),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ChurchMember)
  );
};

/**
 * Search members by name (client-side filtering)
 * Note: For production with many members, consider Algolia or similar
 */
export const searchMembers = async (
  searchTerm: string
): Promise<ChurchMember[]> => {
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can access the member directory');
  }

  const members = await getAllMembers();
  const term = searchTerm.toLowerCase().trim();

  return members.filter(
    (m) =>
      m.firstName.toLowerCase().includes(term) ||
      m.lastName.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.phone?.includes(term)
  );
};

/**
 * Filter members by multiple criteria
 */
export const filterMembers = async (
  filters: MemberFilters
): Promise<ChurchMember[]> => {
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can access the member directory');
  }

  let members = await getAllMembers();

  if (filters.status) {
    members = members.filter((m) => m.status === filters.status);
  }

  if (filters.lifeGroupId) {
    members = members.filter((m) => m.lifeGroupId === filters.lifeGroupId);
  }

  if (filters.ministryId) {
    members = members.filter(
      (m) => m.ministries?.includes(filters.ministryId!)
    );
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase().trim();
    members = members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(term) ||
        m.lastName.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term)
    );
  }

  return members;
};

/**
 * Subscribe to members (real-time updates)
 */
export const subscribeToMembers = (
  onUpdate: (members: ChurchMember[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'churchMembers'),
    orderBy('lastName', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ChurchMember)
      );
      onUpdate(members);
    },
    onError
  );
};

/**
 * Create a new church member
 */
export const createMember = async (
  data: ChurchMemberInput
): Promise<string> => {
  const canAccess = await isPastorOrAdmin();
  if (!canAccess) {
    throw new Error('Only Pastor or Admin can create members');
  }

  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const docRef = await addDoc(collection(db, 'churchMembers'), {
    ...data,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update a church member
 */
export const updateMember = async (
  memberId: string,
  updates: Partial<ChurchMemberInput>
): Promise<void> => {
  const canAccess = await isPastorOrAdmin();
  if (!canAccess) {
    throw new Error('Only Pastor or Admin can update members');
  }

  await updateDoc(doc(db, 'churchMembers', memberId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a church member (Pastor only)
 */
export const deleteMember = async (memberId: string): Promise<void> => {
  const canAccess = await isPastor();
  if (!canAccess) {
    throw new Error('Only the Pastor can delete members');
  }

  await deleteDoc(doc(db, 'churchMembers', memberId));
};

/**
 * Update member status
 */
export const updateMemberStatus = async (
  memberId: string,
  status: MemberStatus
): Promise<void> => {
  await updateMember(memberId, { status });
};

/**
 * Link a church member to an app user
 */
export const linkMemberToUser = async (
  memberId: string,
  userId: string
): Promise<void> => {
  await updateMember(memberId, { userId });
};

/**
 * Unlink a church member from an app user
 */
export const unlinkMemberFromUser = async (memberId: string): Promise<void> => {
  await updateDoc(doc(db, 'churchMembers', memberId), {
    userId: null,
    updatedAt: serverTimestamp(),
  });
};

// ============================================
// STATISTICS
// ============================================

/**
 * Get member counts by status
 */
export const getMemberCountsByStatus = async (): Promise<
  Record<MemberStatus, number>
> => {
  const members = await getAllMembers();
  const counts: Record<MemberStatus, number> = {
    active: 0,
    inactive: 0,
    visitor: 0,
    former: 0,
  };

  members.forEach((m) => {
    if (m.status) {
      counts[m.status]++;
    }
  });

  return counts;
};

/**
 * Get total member count
 */
export const getTotalMemberCount = async (): Promise<number> => {
  const members = await getAllMembers();
  return members.length;
};

/**
 * Get active member count
 */
export const getActiveMemberCount = async (): Promise<number> => {
  const members = await getMembersByStatus('active');
  return members.length;
};

// ============================================
// MEMBER SUMMARIES (less sensitive data)
// ============================================

/**
 * Get member summaries (for lists without sensitive contact info)
 * Note: Still requires Pastor role due to Firestore rules
 */
export const getMemberSummaries = async (): Promise<MemberSummary[]> => {
  const members = await getAllMembers();
  return members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    photoUrl: m.photoUrl,
    status: m.status,
  }));
};
