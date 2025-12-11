import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserRole } from '../types/roles';
import { MaritalStatus, FamilyRole } from '../types/family';

// Configure Google Sign-In - not needed for now
export const configureGoogleSignIn = () => {
  // Configuration happens in screen components
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole; // Uses centralized role types
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  // Additional church-specific fields
  membershipStatus?: 'active' | 'inactive' | 'visitor';
  joinDate?: any;
  birthday?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  ministries?: string[]; // Array of ministry IDs they're part of
  savedSermons?: string[]; // Array of sermon IDs
  prayerRequests?: string[]; // Array of prayer request IDs
  // Sunday School (for teachers/leaders)
  assignedClasses?: string[]; // Array of SundaySchoolClass IDs
  // Family information
  familyId?: string;
  familyRole?: FamilyRole;
  maritalStatus?: MaritalStatus;
  spouseId?: string;
  spouseName?: string;
  hasChildren?: boolean;
  numberOfChildren?: number;
  childrenIds?: string[];
  // Onboarding tracking
  onboardingComplete?: boolean;
  onboardingSkipped?: boolean;
  appOpenCount?: number;
}

// Create or update user profile in Firestore
export const createOrUpdateUserProfile = async (user: any, additionalData?: Partial<UserProfile>) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const userData: Partial<UserProfile> = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    phoneNumber: user.phoneNumber || '',
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    ...additionalData,
  };

  if (!userSnap.exists()) {
    // New user
    userData.createdAt = serverTimestamp();
    userData.role = 'member';
    userData.membershipStatus = 'visitor';
    userData.ministries = [];
    userData.savedSermons = [];
    userData.prayerRequests = [];
    // Onboarding defaults
    userData.onboardingComplete = false;
    userData.onboardingSkipped = false;
    userData.appOpenCount = 1;
  } else {
    // Existing user - increment app open count
    const currentCount = userSnap.data()?.appOpenCount || 0;
    userData.appOpenCount = currentCount + 1;
  }

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// Process Google Sign-In response
export const processGoogleSignIn = async (idToken: string) => {
  try {
    // Create Firebase credential
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, googleCredential);

    // Create/update user profile in Firestore
    await createOrUpdateUserProfile(userCredential.user);

    return userCredential.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
