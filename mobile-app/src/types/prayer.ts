import { Timestamp } from 'firebase/firestore';

/**
 * Prayer Request Status
 * - active: Currently requesting prayer
 * - answered: Prayer has been answered
 * - deleted: Soft deleted (hidden from public view)
 */
export type PrayerStatus = 'active' | 'answered' | 'deleted';

/**
 * Prayer Request Interface (from Firestore)
 */
export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  request: string;
  status: PrayerStatus;
  prayerCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  answeredAt: Timestamp | null;
}

/**
 * Prayer Interaction (when users pray for a request)
 */
export interface PrayerInteraction {
  id: string;
  prayerId: string;
  userId: string;
  action: 'prayed';
  createdAt: Timestamp;
}

/**
 * Prayer Request for UI display (with formatted dates)
 */
export interface PrayerRequestDisplay extends Omit<PrayerRequest, 'createdAt' | 'updatedAt' | 'answeredAt'> {
  createdAt: Date;
  updatedAt: Date;
  answeredAt: Date | null;
  hasPrayed: boolean; // Whether current user has prayed
  timeAgo: string; // Formatted relative time
}

/**
 * Create Prayer Request Input
 */
export interface CreatePrayerRequestInput {
  request: string;
}

/**
 * Update Prayer Request Input
 */
export interface UpdatePrayerRequestInput {
  request?: string;
  status?: PrayerStatus;
}
