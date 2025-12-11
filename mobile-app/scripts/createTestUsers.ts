/**
 * Script to create test users in Firebase
 *
 * Run this script with: npx ts-node scripts/createTestUsers.ts
 *
 * NOTE: This script requires Firebase Admin SDK to be set up.
 * For development, you can manually create these users in Firebase Console
 * or use the Firebase Auth Emulator.
 */

// Test User Credentials
export const TEST_USERS = {
  // Pastor - Full access
  pastor: {
    email: 'pastor@royalsignet.test',
    password: 'TestPastor123!',
    displayName: 'Pastor David Johnson',
    role: 'pastor',
    description: 'Full access to all features',
  },

  // Sunday School Head
  sundaySchoolHead: {
    email: 'sshead@royalsignet.test',
    password: 'TestSSHead123!',
    displayName: 'Mary Johnson',
    role: 'sundaySchoolHead',
    description: 'Can manage Sunday School classes and take kids attendance',
  },

  // Admin/Secretary
  admin: {
    email: 'admin@royalsignet.test',
    password: 'TestAdmin123!',
    displayName: 'Sarah Williams',
    role: 'admin',
    description: 'Can manage members, events, and take attendance',
  },

  // Regular member (married with kids)
  memberFamily: {
    email: 'member1@royalsignet.test',
    password: 'TestMember123!',
    displayName: 'John Smith',
    role: 'member',
    description: 'Regular member - married with 2 kids',
  },

  // Regular member (spouse)
  memberSpouse: {
    email: 'member2@royalsignet.test',
    password: 'TestMember123!',
    displayName: 'Jane Smith',
    role: 'member',
    description: 'Regular member - spouse of John Smith',
  },

  // Regular member (single)
  memberSingle: {
    email: 'single@royalsignet.test',
    password: 'TestSingle123!',
    displayName: 'Michael Brown',
    role: 'member',
    description: 'Regular member - single, no children',
  },
};

console.log('='.repeat(60));
console.log('ROYAL SIGNET TEST USER CREDENTIALS');
console.log('='.repeat(60));
console.log('');
console.log('Use these credentials to test different roles:');
console.log('');

Object.entries(TEST_USERS).forEach(([key, user]) => {
  console.log(`--- ${key.toUpperCase()} ---`);
  console.log(`Email:    ${user.email}`);
  console.log(`Password: ${user.password}`);
  console.log(`Name:     ${user.displayName}`);
  console.log(`Role:     ${user.role}`);
  console.log(`Access:   ${user.description}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('');
console.log('SETUP INSTRUCTIONS:');
console.log('1. Go to Firebase Console > Authentication > Users');
console.log('2. Click "Add User" and create each test user with email/password');
console.log('3. Go to Firestore Database > users collection');
console.log('4. Create a document for each user with their UID and set the role field');
console.log('');
console.log('Or use the Firebase Auth Emulator for local testing.');
console.log('='.repeat(60));
