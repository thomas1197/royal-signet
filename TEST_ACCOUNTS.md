# Royal Signet Test Accounts

Use these accounts to test different roles and features in the app.

## Test Credentials

### 1. Pastor (Full Access)
```
Email:    pastor@royalsignet.test
Password: TestPastor123!
Name:     Pastor David Johnson
```
**Access:** Full access to all features including:
- Member Directory (with contact details)
- Role Management
- All attendance tracking
- Sunday School management
- All admin features

---

### 2. Sunday School Head
```
Email:    sshead@royalsignet.test
Password: TestSSHead123!
Name:     Mary Johnson
```
**Access:**
- Sunday School Dashboard
- Manage classes
- Take kids attendance
- Register children
- View kids attendance reports

---

### 3. Admin/Secretary
```
Email:    admin@royalsignet.test
Password: TestAdmin123!
Name:     Sarah Williams
```
**Access:**
- Member management
- Event management
- Content management
- Take Sunday service attendance
- Take event attendance
- View attendance reports

---

### 4. Member (Married with Kids)
```
Email:    member1@royalsignet.test
Password: TestMember123!
Name:     John Smith
```
**Access:**
- Standard member features
- Register own children
- Test family onboarding with spouse

---

### 5. Member (Spouse)
```
Email:    member2@royalsignet.test
Password: TestMember123!
Name:     Jane Smith
```
**Access:**
- Standard member features
- Should appear as spouse suggestion for John Smith

---

### 6. Member (Single)
```
Email:    single@royalsignet.test
Password: TestSingle123!
Name:     Michael Brown
```
**Access:**
- Standard member features
- Test single member onboarding flow

---

## Setup Instructions

### Option 1: Firebase Console (Recommended for Production Testing)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** > **Users**
4. Click **Add User** for each test account above
5. Go to **Firestore Database** > **users** collection
6. For each user, create a document with their UID containing:
   ```json
   {
     "uid": "<user-uid>",
     "email": "<email>",
     "displayName": "<name>",
     "role": "<role>",
     "membershipStatus": "active",
     "onboardingComplete": false
   }
   ```

### Option 2: Firebase Emulator (Local Development)

1. Start the Firebase emulator:
   ```bash
   cd firebase
   firebase emulators:start
   ```
2. The emulator will create a local auth system
3. Sign up with the test credentials directly in the app

### Updating Roles in Firestore

To change a user's role, update their document in Firestore:

```javascript
// In Firebase Console or via script
db.collection('users').doc('<user-uid>').update({
  role: 'pastor' // or 'sundaySchoolHead', 'admin', 'member', 'volunteer'
});
```

---

## Testing Scenarios

### Test Family Onboarding
1. Login with `member1@royalsignet.test`
2. Should see family onboarding flow
3. Select "Married" status
4. `Jane Smith` should appear as spouse suggestion
5. Add children and complete onboarding

### Test Sunday School Attendance
1. Login with `sshead@royalsignet.test`
2. Go to Profile > Sunday School Management
3. Take attendance for registered children

### Test Member Directory (Pastor Only)
1. Login with `pastor@royalsignet.test`
2. Go to Profile > Administration > Member Directory
3. Should see full member list with contacts

### Test Role-Based Access
1. Login with different accounts
2. Check that menu items appear/hide based on role
3. Verify security rules block unauthorized access
