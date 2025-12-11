/**
 * Attendance Tracking Type Definitions
 * Royal Signet Church App
 */

import { Timestamp } from 'firebase/firestore';

// Types of attendance that can be tracked
export type AttendanceType =
  | 'sunday_service'
  | 'sunday_school'
  | 'event'
  | 'life_group';

export const ATTENDANCE_TYPE_LABELS: Record<AttendanceType, string> = {
  sunday_service: 'Sunday Service',
  sunday_school: 'Sunday School',
  event: 'Event',
  life_group: 'Life Group',
};

// Attendance Session - represents a single instance (e.g., "Sunday Service Dec 10, 2025")
export interface AttendanceSession {
  id: string;
  type: AttendanceType;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  notes?: string;
  createdBy: string;
  createdByName: string;
  isOpen: boolean; // Can still record attendance
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Type-specific references
  eventId?: string;
  eventName?: string;
  lifeGroupId?: string;
  lifeGroupName?: string;
  classId?: string;
  className?: string;
}

// Create session input
export type AttendanceSessionInput = Omit<AttendanceSession, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>;

// Individual Attendance Record - one person checked into one session
export interface AttendanceRecord {
  id: string;
  sessionId: string;
  type: AttendanceType; // Denormalized for easier querying
  date: string; // Denormalized for easier querying
  // Person attending
  personId: string; // userId for adults, childId for kids
  personType: 'adult' | 'child';
  personName: string;
  personPhotoUrl?: string;
  // Check-in details
  checkedInAt: Timestamp;
  checkedInBy: string;
  checkedInByName: string;
  // Check-out (optional, mainly for Sunday School)
  checkedOutAt?: Timestamp;
  checkedOutBy?: string;
  checkedOutByName?: string;
  // Additional info
  notes?: string;
  // Context (denormalized for display)
  classId?: string;
  className?: string;
  eventId?: string;
  eventName?: string;
  lifeGroupId?: string;
  lifeGroupName?: string;
}

// Attendance Summary - aggregated stats for a session
export interface AttendanceSummary {
  sessionId: string;
  type: AttendanceType;
  date: string;
  title: string;
  totalCount: number;
  adultsCount: number;
  childrenCount: number;
  classCounts?: Record<string, number>; // classId -> count (for Sunday School)
}

// Date range for reports
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Attendance stats for dashboard
export interface AttendanceStats {
  type: AttendanceType;
  totalSessions: number;
  averageAttendance: number;
  highestAttendance: number;
  lowestAttendance: number;
  lastSessionDate?: string;
  lastSessionCount?: number;
}

// Person attendance history item
export interface PersonAttendanceHistoryItem {
  sessionId: string;
  date: string;
  title: string;
  type: AttendanceType;
  checkedInAt: Timestamp;
}
