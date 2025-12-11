/**
 * Role-Based Access Control (IAM) Type Definitions
 * Royal Signet Church App
 */

// Available user roles
export type UserRole = 'member' | 'admin' | 'pastor' | 'sundaySchoolHead' | 'volunteer';

// All possible permissions in the system
export type Permission =
  // Member Directory
  | 'view_member_directory'
  | 'view_member_contacts'
  | 'manage_members'
  // Sunday School
  | 'manage_sunday_school_classes'
  | 'take_kids_attendance'
  | 'view_kids_attendance_reports'
  | 'register_children'
  // Attendance
  | 'take_sunday_service_attendance'
  | 'take_event_attendance'
  | 'take_life_group_attendance'
  | 'view_all_attendance_reports'
  // Content Management
  | 'manage_events'
  | 'manage_sermons'
  | 'manage_updates'
  | 'manage_content'
  // Administrative
  | 'manage_roles'
  | 'pastoral_functions'
  | 'full_access';

// Role-Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  pastor: [
    'full_access',
    'view_member_directory',
    'view_member_contacts',
    'manage_members',
    'manage_sunday_school_classes',
    'take_kids_attendance',
    'view_kids_attendance_reports',
    'register_children',
    'take_sunday_service_attendance',
    'take_event_attendance',
    'take_life_group_attendance',
    'view_all_attendance_reports',
    'manage_events',
    'manage_sermons',
    'manage_updates',
    'manage_content',
    'manage_roles',
    'pastoral_functions',
  ],
  sundaySchoolHead: [
    'manage_sunday_school_classes',
    'take_kids_attendance',
    'view_kids_attendance_reports',
    'register_children',
  ],
  admin: [
    'view_member_directory',
    'manage_members',
    'take_sunday_service_attendance',
    'take_event_attendance',
    'view_all_attendance_reports',
    'manage_events',
    'manage_sermons',
    'manage_updates',
    'manage_content',
    'register_children',
  ],
  volunteer: [],
  member: [],
};

// Human-readable role labels
export const ROLE_LABELS: Record<UserRole, string> = {
  pastor: 'Pastor',
  sundaySchoolHead: 'Sunday School Head',
  admin: 'Admin/Secretary',
  volunteer: 'Volunteer',
  member: 'Member',
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  pastor: 'Full access to all features including member directory and role management',
  sundaySchoolHead: 'Manage Sunday School classes and take kids attendance',
  admin: 'Manage members, events, content and take attendance',
  volunteer: 'Basic access with volunteer-specific features',
  member: 'Standard church member access',
};
