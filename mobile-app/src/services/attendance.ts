/**
 * Attendance Service
 * Handles attendance sessions and records for all attendance types
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
  doc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import {
  AttendanceSession,
  AttendanceSessionInput,
  AttendanceRecord,
  AttendanceType,
  AttendanceSummary,
  AttendanceStats,
  DateRange,
} from '../types/attendance';

// ============================================
// ATTENDANCE SESSIONS
// ============================================

/**
 * Create a new attendance session
 */
export const createAttendanceSession = async (
  type: AttendanceType,
  title: string,
  options?: {
    eventId?: string;
    eventName?: string;
    lifeGroupId?: string;
    lifeGroupName?: string;
    classId?: string;
    className?: string;
    notes?: string;
  }
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const today = new Date().toISOString().split('T')[0];

  const docRef = await addDoc(collection(db, 'attendanceSessions'), {
    type,
    date: today,
    title,
    isOpen: true,
    createdBy: user.uid,
    createdByName: user.displayName || 'Unknown',
    ...options,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get all open sessions
 */
export const getOpenSessions = async (
  type?: AttendanceType
): Promise<AttendanceSession[]> => {
  let q;
  if (type) {
    q = query(
      collection(db, 'attendanceSessions'),
      where('isOpen', '==', true),
      where('type', '==', type)
    );
  } else {
    q = query(
      collection(db, 'attendanceSessions'),
      where('isOpen', '==', true)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AttendanceSession)
  );
};

/**
 * Get session by ID
 */
export const getSessionById = async (
  sessionId: string
): Promise<AttendanceSession | null> => {
  const docRef = doc(db, 'attendanceSessions', sessionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as AttendanceSession;
};

/**
 * Get sessions by date range
 */
export const getSessionsByDateRange = async (
  type: AttendanceType,
  startDate: string,
  endDate: string
): Promise<AttendanceSession[]> => {
  const q = query(
    collection(db, 'attendanceSessions'),
    where('type', '==', type),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AttendanceSession)
  );
};

/**
 * Get recent sessions by type
 */
export const getRecentSessions = async (
  type: AttendanceType,
  limitCount: number = 10
): Promise<AttendanceSession[]> => {
  const q = query(
    collection(db, 'attendanceSessions'),
    where('type', '==', type),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AttendanceSession)
  );
};

/**
 * Get today's session for a type (if exists)
 */
export const getTodaysSession = async (
  type: AttendanceType
): Promise<AttendanceSession | null> => {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'attendanceSessions'),
    where('type', '==', type),
    where('date', '==', today)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AttendanceSession;
};

/**
 * Close an attendance session
 */
export const closeSession = async (sessionId: string): Promise<void> => {
  await updateDoc(doc(db, 'attendanceSessions', sessionId), {
    isOpen: false,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Reopen an attendance session
 */
export const reopenSession = async (sessionId: string): Promise<void> => {
  await updateDoc(doc(db, 'attendanceSessions', sessionId), {
    isOpen: true,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Update session notes
 */
export const updateSessionNotes = async (
  sessionId: string,
  notes: string
): Promise<void> => {
  await updateDoc(doc(db, 'attendanceSessions', sessionId), {
    notes,
    updatedAt: serverTimestamp(),
  });
};

// ============================================
// ATTENDANCE RECORDS
// ============================================

/**
 * Check in a person to a session
 */
export const checkInPerson = async (
  sessionId: string,
  personId: string,
  personType: 'adult' | 'child',
  personName: string,
  options?: {
    personPhotoUrl?: string;
    classId?: string;
    className?: string;
    eventId?: string;
    eventName?: string;
    lifeGroupId?: string;
    lifeGroupName?: string;
    notes?: string;
  }
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  // Get session to get type and date
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');
  if (!session.isOpen) throw new Error('Session is closed');

  // Check if already checked in
  const existing = await getPersonSessionRecord(sessionId, personId);
  if (existing) {
    throw new Error('Person already checked in');
  }

  const docRef = await addDoc(collection(db, 'attendanceRecords'), {
    sessionId,
    type: session.type,
    date: session.date,
    personId,
    personType,
    personName,
    checkedInAt: serverTimestamp(),
    checkedInBy: user.uid,
    checkedInByName: user.displayName || 'Unknown',
    ...options,
  });
  return docRef.id;
};

/**
 * Check out a person (for Sunday School)
 */
export const checkOutPerson = async (recordId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  await updateDoc(doc(db, 'attendanceRecords', recordId), {
    checkedOutAt: serverTimestamp(),
    checkedOutBy: user.uid,
    checkedOutByName: user.displayName || 'Unknown',
  });
};

/**
 * Remove a check-in record
 */
export const removeCheckIn = async (recordId: string): Promise<void> => {
  const docRef = doc(db, 'attendanceRecords', recordId);
  await updateDoc(docRef, {
    // We don't hard delete, just mark as removed
    removed: true,
    removedAt: serverTimestamp(),
  });
};

/**
 * Get all attendance records for a session
 */
export const getSessionAttendance = async (
  sessionId: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, 'attendanceRecords'),
    where('sessionId', '==', sessionId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AttendanceRecord)
  );
};

/**
 * Subscribe to session attendance (real-time updates)
 */
export const subscribeToSessionAttendance = (
  sessionId: string,
  onUpdate: (records: AttendanceRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'attendanceRecords'),
    where('sessionId', '==', sessionId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as AttendanceRecord)
      );
      onUpdate(records);
    },
    onError
  );
};

/**
 * Check if a person is already checked in to a session
 */
export const getPersonSessionRecord = async (
  sessionId: string,
  personId: string
): Promise<AttendanceRecord | null> => {
  const q = query(
    collection(db, 'attendanceRecords'),
    where('sessionId', '==', sessionId),
    where('personId', '==', personId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AttendanceRecord;
};

/**
 * Get attendance history for a person
 */
export const getPersonAttendanceHistory = async (
  personId: string,
  type?: AttendanceType,
  limitCount: number = 50
): Promise<AttendanceRecord[]> => {
  let q;
  if (type) {
    q = query(
      collection(db, 'attendanceRecords'),
      where('personId', '==', personId),
      where('type', '==', type),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, 'attendanceRecords'),
      where('personId', '==', personId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AttendanceRecord)
  );
};

// ============================================
// SUMMARIES & STATISTICS
// ============================================

/**
 * Get attendance summary for a session
 */
export const getAttendanceSummary = async (
  sessionId: string
): Promise<AttendanceSummary> => {
  const [session, records] = await Promise.all([
    getSessionById(sessionId),
    getSessionAttendance(sessionId),
  ]);

  if (!session) throw new Error('Session not found');

  const adults = records.filter((r) => r.personType === 'adult').length;
  const children = records.filter((r) => r.personType === 'child').length;

  // Count by class (for Sunday School)
  const classCounts: Record<string, number> = {};
  records
    .filter((r) => r.classId)
    .forEach((r) => {
      classCounts[r.classId!] = (classCounts[r.classId!] || 0) + 1;
    });

  return {
    sessionId,
    type: session.type,
    date: session.date,
    title: session.title,
    totalCount: records.length,
    adultsCount: adults,
    childrenCount: children,
    classCounts: Object.keys(classCounts).length > 0 ? classCounts : undefined,
  };
};

/**
 * Get attendance statistics for a type over date range
 */
export const getAttendanceStats = async (
  type: AttendanceType,
  dateRange?: DateRange
): Promise<AttendanceStats> => {
  const endDate = dateRange?.endDate || new Date().toISOString().split('T')[0];
  const startDate =
    dateRange?.startDate ||
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default 90 days

  const sessions = await getSessionsByDateRange(type, startDate, endDate);

  if (sessions.length === 0) {
    return {
      type,
      totalSessions: 0,
      averageAttendance: 0,
      highestAttendance: 0,
      lowestAttendance: 0,
    };
  }

  // Get summaries for all sessions
  const summaries = await Promise.all(
    sessions.map((s) => getAttendanceSummary(s.id))
  );

  const counts = summaries.map((s) => s.totalCount);
  const total = counts.reduce((a, b) => a + b, 0);

  return {
    type,
    totalSessions: sessions.length,
    averageAttendance: Math.round(total / sessions.length),
    highestAttendance: Math.max(...counts),
    lowestAttendance: Math.min(...counts),
    lastSessionDate: sessions[0]?.date,
    lastSessionCount: summaries[0]?.totalCount,
  };
};

// ============================================
// QUICK ACTIONS
// ============================================

/**
 * Start a new Sunday Service attendance session
 */
export const startSundayServiceSession = async (): Promise<string> => {
  const today = new Date();
  const title = `Sunday Service - ${today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
  return createAttendanceSession('sunday_service', title);
};

/**
 * Start a new Sunday School attendance session
 */
export const startSundaySchoolSession = async (
  classId?: string,
  className?: string
): Promise<string> => {
  const today = new Date();
  const title = className
    ? `${className} - ${today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    : `Sunday School - ${today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
  return createAttendanceSession('sunday_school', title, { classId, className });
};

/**
 * Start a new Event attendance session
 */
export const startEventSession = async (
  eventId: string,
  eventName: string
): Promise<string> => {
  return createAttendanceSession('event', eventName, { eventId, eventName });
};

/**
 * Start a new Life Group attendance session
 */
export const startLifeGroupSession = async (
  lifeGroupId: string,
  lifeGroupName: string
): Promise<string> => {
  return createAttendanceSession('life_group', lifeGroupName, {
    lifeGroupId,
    lifeGroupName,
  });
};
