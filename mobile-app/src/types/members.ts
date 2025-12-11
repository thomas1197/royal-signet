/**
 * Church Member Directory Type Definitions
 * Royal Signet Church App
 */

import { Timestamp } from 'firebase/firestore';

export type MemberStatus = 'active' | 'inactive' | 'visitor' | 'former';

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active Member',
  inactive: 'Inactive',
  visitor: 'Visitor',
  former: 'Former Member',
};

export type FamilyRole = 'head' | 'spouse' | 'child' | 'other';

// Church Member (full directory entry - Pastor only)
export interface ChurchMember {
  id: string;
  userId?: string; // Link to app user (optional - not all members have app accounts)
  // Basic Info
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  // Contact Details (Pastor only visibility)
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Church Info
  status: MemberStatus;
  memberSince?: Timestamp;
  baptismDate?: Timestamp;
  ministries?: string[];
  lifeGroupId?: string;
  lifeGroupName?: string;
  // Family Relations
  familyId?: string; // Link related members
  familyRole?: FamilyRole;
  childrenIds?: string[]; // Child IDs from sundaySchoolChildren
  // Notes (Pastor only)
  pastorNotes?: string;
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Create/Update member input
export type ChurchMemberInput = Omit<ChurchMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

// Member search/filter options
export interface MemberFilters {
  status?: MemberStatus;
  ministryId?: string;
  lifeGroupId?: string;
  searchTerm?: string;
}

// Member summary (for lists without sensitive data)
export interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  status: MemberStatus;
}

// Family group
export interface Family {
  id: string;
  name: string; // e.g., "The Smith Family"
  memberIds: string[];
  headId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
