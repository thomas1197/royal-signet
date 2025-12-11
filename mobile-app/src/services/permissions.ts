/**
 * Permissions Service
 * Handles role-based access control (IAM) for the Royal Signet Church App
 */

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/roles';

// Cache user role to avoid repeated Firestore reads
let cachedRole: UserRole | null = null;
let cachedUid: string | null = null;

/**
 * Clear the permission cache (call on logout or user change)
 */
export const clearPermissionCache = (): void => {
  cachedRole = null;
  cachedUid = null;
};

/**
 * Get current user's role from Firestore
 */
export const getUserRole = async (): Promise<UserRole> => {
  const user = auth.currentUser;
  if (!user) {
    return 'member'; // Default for unauthenticated
  }

  // Return cached if same user
  if (cachedUid === user.uid && cachedRole) {
    return cachedRole;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      return 'member';
    }

    const role = (userDoc.data()?.role as UserRole) || 'member';
    cachedRole = role;
    cachedUid = user.uid;
    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'member';
  }
};

/**
 * Check if current user has a specific permission
 */
export const hasPermission = async (permission: Permission): Promise<boolean> => {
  const role = await getUserRole();
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes('full_access') || permissions.includes(permission);
};

/**
 * Check if current user has any of the specified permissions
 */
export const hasAnyPermission = async (permissions: Permission[]): Promise<boolean> => {
  const role = await getUserRole();
  const userPermissions = ROLE_PERMISSIONS[role];
  if (userPermissions.includes('full_access')) return true;
  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Check if current user has all of the specified permissions
 */
export const hasAllPermissions = async (permissions: Permission[]): Promise<boolean> => {
  const role = await getUserRole();
  const userPermissions = ROLE_PERMISSIONS[role];
  if (userPermissions.includes('full_access')) return true;
  return permissions.every((p) => userPermissions.includes(p));
};

/**
 * Get all permissions for current user
 */
export const getCurrentUserPermissions = async (): Promise<Permission[]> => {
  const role = await getUserRole();
  return ROLE_PERMISSIONS[role];
};

// ============================================
// Role-specific convenience functions
// ============================================

export const isPastor = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'pastor';
};

export const isSundaySchoolHead = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'sundaySchoolHead';
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'admin';
};

export const isPastorOrAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'pastor' || role === 'admin';
};

// ============================================
// Permission-specific convenience functions
// ============================================

export const canViewMemberDirectory = async (): Promise<boolean> => {
  return hasPermission('view_member_directory');
};

export const canViewMemberContacts = async (): Promise<boolean> => {
  return hasPermission('view_member_contacts');
};

export const canManageSundaySchool = async (): Promise<boolean> => {
  return hasPermission('manage_sunday_school_classes');
};

export const canTakeKidsAttendance = async (): Promise<boolean> => {
  return hasPermission('take_kids_attendance');
};

export const canTakeSundayServiceAttendance = async (): Promise<boolean> => {
  return hasPermission('take_sunday_service_attendance');
};

export const canTakeEventAttendance = async (): Promise<boolean> => {
  return hasPermission('take_event_attendance');
};

export const canTakeLifeGroupAttendance = async (): Promise<boolean> => {
  return hasPermission('take_life_group_attendance');
};

export const canManageRoles = async (): Promise<boolean> => {
  return hasPermission('manage_roles');
};

export const canManageContent = async (): Promise<boolean> => {
  return hasPermission('manage_content');
};

export const canRegisterChildren = async (): Promise<boolean> => {
  return hasPermission('register_children');
};
