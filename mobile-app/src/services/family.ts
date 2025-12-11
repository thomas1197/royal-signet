/**
 * Family Service
 * Handles family relationships, spouse auto-suggest, and onboarding
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
  setDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  Family,
  SpouseSuggestion,
  FamilyOnboardingData,
  MaritalStatus,
} from '../types/family';
import { UserProfile } from './googleAuth';
import { registerChild } from './sundaySchool';
import { getAgeGroupFromDOB } from '../types/sundaySchool';

// ============================================
// SPOUSE AUTO-SUGGEST
// ============================================

/**
 * Find potential spouse matches based on last name
 */
export const findPotentialSpouses = async (): Promise<SpouseSuggestion[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  // Get current user's profile
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return [];

  const userData = userDoc.data() as UserProfile;
  const displayName = userData.displayName || user.displayName || '';
  const nameParts = displayName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  if (!lastName || lastName.length < 2) return [];

  const suggestions: SpouseSuggestion[] = [];

  // Query users with same last name
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  snapshot.docs.forEach((docSnap) => {
    if (docSnap.id === user.uid) return; // Skip self

    const otherUser = docSnap.data() as UserProfile;
    const otherName = otherUser.displayName || '';
    const otherNameParts = otherName.trim().split(' ');
    const otherLastName = otherNameParts.length > 1 ? otherNameParts[otherNameParts.length - 1] : '';

    // Check for same last name
    if (otherLastName.toLowerCase() === lastName.toLowerCase()) {
      // Don't suggest if already has a spouse
      if (!otherUser.spouseId) {
        suggestions.push({
          userId: docSnap.id,
          displayName: otherUser.displayName,
          email: otherUser.email,
          photoURL: otherUser.photoURL,
          matchReason: 'same_last_name',
        });
      }
    }

    // Check for same address (if both have addresses)
    if (userData.address && otherUser.address) {
      if (
        userData.address.toLowerCase() === otherUser.address.toLowerCase() &&
        userData.city?.toLowerCase() === otherUser.city?.toLowerCase()
      ) {
        // Avoid duplicates
        if (!suggestions.find((s) => s.userId === docSnap.id)) {
          suggestions.push({
            userId: docSnap.id,
            displayName: otherUser.displayName,
            email: otherUser.email,
            photoURL: otherUser.photoURL,
            matchReason: 'same_address',
          });
        }
      }
    }
  });

  return suggestions;
};

/**
 * Search for a user by name or email (for manual spouse linking)
 */
export const searchUsers = async (searchTerm: string): Promise<SpouseSuggestion[]> => {
  const user = auth.currentUser;
  if (!user || searchTerm.length < 2) return [];

  const term = searchTerm.toLowerCase();
  const suggestions: SpouseSuggestion[] = [];

  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  snapshot.docs.forEach((docSnap) => {
    if (docSnap.id === user.uid) return; // Skip self

    const userData = docSnap.data() as UserProfile;
    const name = (userData.displayName || '').toLowerCase();
    const email = (userData.email || '').toLowerCase();

    if (name.includes(term) || email.includes(term)) {
      suggestions.push({
        userId: docSnap.id,
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
        matchReason: 'manual_search',
      });
    }
  });

  return suggestions.slice(0, 10); // Limit results
};

// ============================================
// FAMILY CREATION & LINKING
// ============================================

/**
 * Create a new family unit
 */
export const createFamily = async (familyName?: string): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data() as UserProfile;

  const name = familyName || `The ${userData.displayName?.split(' ').pop() || 'Unknown'} Family`;

  const familyRef = await addDoc(collection(db, 'families'), {
    name,
    headId: user.uid,
    memberIds: [user.uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update user with family ID
  await updateDoc(doc(db, 'users', user.uid), {
    familyId: familyRef.id,
    familyRole: 'head',
    updatedAt: serverTimestamp(),
  });

  return familyRef.id;
};

/**
 * Link spouse accounts
 */
export const linkSpouse = async (spouseUserId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const batch = writeBatch(db);

  // Get both user profiles
  const [currentUserDoc, spouseDoc] = await Promise.all([
    getDoc(doc(db, 'users', user.uid)),
    getDoc(doc(db, 'users', spouseUserId)),
  ]);

  if (!spouseDoc.exists()) throw new Error('Spouse user not found');

  const currentUserData = currentUserDoc.data() as UserProfile;
  const spouseData = spouseDoc.data() as UserProfile;

  // Determine family ID (use existing or create new)
  let familyId = currentUserData.familyId || spouseData.familyId;

  if (!familyId) {
    // Create new family
    familyId = await createFamily();
  }

  // Update current user
  batch.update(doc(db, 'users', user.uid), {
    spouseId: spouseUserId,
    familyId,
    maritalStatus: 'married',
    updatedAt: serverTimestamp(),
  });

  // Update spouse
  batch.update(doc(db, 'users', spouseUserId), {
    spouseId: user.uid,
    familyId,
    familyRole: 'spouse',
    maritalStatus: 'married',
    updatedAt: serverTimestamp(),
  });

  // Update family members list
  const familyRef = doc(db, 'families', familyId);
  const familyDoc = await getDoc(familyRef);
  if (familyDoc.exists()) {
    const familyData = familyDoc.data() as Family;
    const memberIds = new Set(familyData.memberIds);
    memberIds.add(user.uid);
    memberIds.add(spouseUserId);
    batch.update(familyRef, {
      memberIds: Array.from(memberIds),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
};

// ============================================
// ONBOARDING COMPLETION
// ============================================

/**
 * Complete family onboarding
 */
export const completeFamilyOnboarding = async (
  data: FamilyOnboardingData
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const updates: Partial<UserProfile> = {
    onboardingComplete: true,
    onboardingSkipped: false,
    updatedAt: serverTimestamp() as any,
  };

  // Set marital status
  if (data.maritalStatus) {
    updates.maritalStatus = data.maritalStatus;
  }

  // Handle spouse linking
  if (data.spouseId) {
    await linkSpouse(data.spouseId);
  } else if (data.spouseName) {
    updates.spouseName = data.spouseName;
    updates.maritalStatus = 'married';
  }

  // Handle children
  if (data.hasChildren && data.children.length > 0) {
    updates.hasChildren = true;
    updates.numberOfChildren = data.children.length;

    // Register children for Sunday School
    const childIds: string[] = [];
    for (const child of data.children) {
      if (child.registerForSundaySchool) {
        // Calculate approximate DOB from age
        const today = new Date();
        const birthYear = today.getFullYear() - child.age;
        const approximateDOB = `${birthYear}-01-01`;
        const ageGroup = getAgeGroupFromDOB(approximateDOB);

        const childId = await registerChild({
          firstName: child.name.split(' ')[0] || child.name,
          lastName: child.name.split(' ').slice(1).join(' ') || user.displayName?.split(' ').pop() || '',
          dateOfBirth: approximateDOB,
          ageGroup,
          parentIds: [user.uid],
          parentNames: [user.displayName || 'Parent'],
          parentPhones: [],
          emergencyContact: {
            name: user.displayName || 'Parent',
            phone: '',
            relationship: 'Parent',
          },
          isActive: true,
        });
        childIds.push(childId);
      }
    }

    if (childIds.length > 0) {
      updates.childrenIds = childIds;
    }
  } else {
    updates.hasChildren = false;
    updates.numberOfChildren = 0;
  }

  // Use setDoc with merge to create document if it doesn't exist
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    ...updates,
  }, { merge: true });
};

/**
 * Skip onboarding
 */
export const skipOnboarding = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  // Use setDoc with merge to create document if it doesn't exist
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    onboardingSkipped: true,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

/**
 * Check if user needs onboarding
 */
export const needsOnboarding = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return true;

  const userData = userDoc.data() as UserProfile;

  // Already completed
  if (userData.onboardingComplete) return false;

  // Skipped but should remind (after 3 app opens)
  if (userData.onboardingSkipped) {
    const appOpenCount = userData.appOpenCount || 0;
    // Remind every 5 opens after initial skip
    return appOpenCount > 0 && appOpenCount % 5 === 0;
  }

  // New user - show onboarding
  return true;
};

/**
 * Get current user's family members
 */
export const getFamilyMembers = async (): Promise<UserProfile[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return [];

  const userData = userDoc.data() as UserProfile;
  if (!userData.familyId) return [];

  const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
  if (!familyDoc.exists()) return [];

  const familyData = familyDoc.data() as Family;
  const members: UserProfile[] = [];

  for (const memberId of familyData.memberIds) {
    if (memberId !== user.uid) {
      const memberDoc = await getDoc(doc(db, 'users', memberId));
      if (memberDoc.exists()) {
        members.push({ ...memberDoc.data(), uid: memberDoc.id } as UserProfile);
      }
    }
  }

  return members;
};
