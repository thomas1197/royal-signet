/**
 * Family Relationship Type Definitions
 * Royal Signet Church App
 */

import { Timestamp } from 'firebase/firestore';

// Marital Status
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Single',
  married: 'Married',
  widowed: 'Widowed',
  divorced: 'Divorced/Separated',
};

// Family Role within the household
export type FamilyRole = 'head' | 'spouse' | 'child' | 'other';

export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  head: 'Head of Household',
  spouse: 'Spouse',
  child: 'Child',
  other: 'Other Family Member',
};

// Family Unit - groups related users together
export interface Family {
  id: string;
  name: string; // e.g., "The Johnson Family"
  headId: string; // User ID of family head
  memberIds: string[]; // All user IDs in family
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Spouse suggestion when auto-matching
export interface SpouseSuggestion {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  matchReason: 'same_last_name' | 'same_address' | 'manual_search';
}

// Quick child entry during onboarding
export interface OnboardingChild {
  name: string;
  age: number;
  registerForSundaySchool: boolean;
}

// Onboarding state tracking
export interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  completedAt?: Timestamp;
  skippedAt?: Timestamp;
  reminderCount: number;
  lastReminderAt?: Timestamp;
}

// Family profile additions to UserProfile
export interface FamilyProfileFields {
  // Family linking
  familyId?: string;
  familyRole?: FamilyRole;
  // Marital info
  maritalStatus?: MaritalStatus;
  spouseId?: string; // Link to spouse's userId (if on app)
  spouseName?: string; // If spouse not on app
  // Children
  hasChildren?: boolean;
  numberOfChildren?: number;
  childrenIds?: string[]; // Links to sundaySchoolChildren
  // Onboarding
  onboardingComplete?: boolean;
  onboardingSkipped?: boolean;
  onboardingSkippedAt?: Timestamp;
  appOpenCount?: number; // For reminder timing
}

// Onboarding questionnaire data
export interface FamilyOnboardingData {
  maritalStatus: MaritalStatus | null;
  spouseId: string | null;
  spouseName: string | null;
  hasChildren: boolean;
  children: OnboardingChild[];
}

// Default onboarding state
export const DEFAULT_ONBOARDING_DATA: FamilyOnboardingData = {
  maritalStatus: null,
  spouseId: null,
  spouseName: null,
  hasChildren: false,
  children: [],
};
