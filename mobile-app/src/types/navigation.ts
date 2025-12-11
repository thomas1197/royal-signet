/**
 * Navigation type definitions for Royal Signet App
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  CreateNewPassword: { email: string; otp: string };
};

export type MainTabParamList = {
  Home: undefined;
  Updates: undefined;
  Sermons: undefined;
  'Prayer Wall': undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  EventDetail: { eventId: string };
  SermonDetail: { sermonId: string };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  EventConfirmation: { eventId: string };
};

export type SermonsStackParamList = {
  SermonsList: undefined;
  SermonDetail: { sermonId: string };
  SermonPlayer: { sermonId: string };
};

export type ProfileStackParamList = {
  ProfileMenu: undefined;
  ViewProfile: undefined;
  EditProfile: undefined;
  AppPreferences: undefined;
  SavedContent: undefined;
  NotificationSettings: undefined;
  SundaySchool: undefined;
  Volunteer: undefined;
  Donate: undefined;
  AboutChurch: undefined;
  Contact: undefined;
  // Admin screens
  MemberDirectory: undefined;
  MemberDetail: { memberId: string };
  RoleManagement: undefined;
  // Sunday School screens
  SundaySchoolDashboard: undefined;
  ClassList: undefined;
  ClassDetail: { classId: string };
  ChildRegistration: { classId?: string };
  ChildDetail: { childId: string };
  KidsCheckIn: { classId?: string; sessionId?: string };
  // Attendance screens
  AttendanceDashboard: undefined;
  SundayServiceAttendance: { sessionId?: string };
  EventAttendance: { eventId: string; sessionId?: string };
  LifeGroupAttendance: { lifeGroupId: string; sessionId?: string };
  AttendanceHistory: { type?: string };
  AttendanceReport: { sessionId: string };
};

export type DrawerParamList = {
  MainTabs: undefined;
  Profile: undefined;
  SundaySchool: undefined;
  Volunteer: undefined;
  Donate: undefined;
  AboutChurch: undefined;
  Contact: undefined;
};

// Sunday School Stack
export type SundaySchoolStackParamList = {
  SundaySchoolDashboard: undefined;
  ClassList: undefined;
  ClassDetail: { classId: string };
  ChildRegistration: { classId?: string };
  ChildDetail: { childId: string };
  KidsCheckIn: { classId?: string; sessionId?: string };
};

// Admin Stack
export type AdminStackParamList = {
  MemberDirectory: undefined;
  MemberDetail: { memberId: string };
  RoleManagement: undefined;
};

// Attendance Stack
export type AttendanceStackParamList = {
  AttendanceDashboard: undefined;
  SundayServiceAttendance: { sessionId?: string };
  EventAttendance: { eventId: string; sessionId?: string };
  LifeGroupAttendance: { lifeGroupId: string; sessionId?: string };
  AttendanceHistory: { type?: string };
  AttendanceReport: { sessionId: string };
};
