/**
 * Sunday School Type Definitions
 * Royal Signet Church App
 */

import { Timestamp } from 'firebase/firestore';

// Age Group Definitions
export type AgeGroup = 'toddlers' | 'kids_5_8' | 'tweens_9_12' | 'teens_13_17';

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  toddlers: 'Toddlers (0-4)',
  kids_5_8: 'Kids (5-8)',
  tweens_9_12: 'Tweens (9-12)',
  teens_13_17: 'Teens (13-17)',
};

export const AGE_GROUP_RANGES: Record<AgeGroup, { min: number; max: number }> = {
  toddlers: { min: 0, max: 4 },
  kids_5_8: { min: 5, max: 8 },
  tweens_9_12: { min: 9, max: 12 },
  teens_13_17: { min: 13, max: 17 },
};

// Sunday School Class
export interface SundaySchoolClass {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  description?: string;
  room?: string;
  teacherIds: string[];
  teacherNames: string[];
  maxCapacity?: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create/Update class input (without auto-generated fields)
export type SundaySchoolClassInput = Omit<SundaySchoolClass, 'id' | 'createdAt' | 'updatedAt'>;

// Child (registered for Sunday School)
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  ageGroup: AgeGroup;
  classId?: string;
  className?: string;
  parentIds: string[];
  parentNames: string[];
  parentPhones: string[];
  allergies?: string;
  medicalNotes?: string;
  specialNeeds?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  photoUrl?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create/Update child input
export type ChildInput = Omit<Child, 'id' | 'createdAt' | 'updatedAt'>;

// Helper function to determine age group from date of birth
export const getAgeGroupFromDOB = (dateOfBirth: string): AgeGroup => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age <= 4) return 'toddlers';
  if (age <= 8) return 'kids_5_8';
  if (age <= 12) return 'tweens_9_12';
  return 'teens_13_17';
};

// Helper to calculate age from DOB
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
