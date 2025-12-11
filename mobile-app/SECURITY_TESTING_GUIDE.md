# Security Testing Guide - Royal Signet App

## 🧪 Comprehensive Security Testing Checklist

**Purpose:** Verify all security features are working correctly before production deployment.

**Estimated Time:** 1-2 hours

---

## 📋 Pre-Testing Setup

### 1. Environment Check

```bash
# Navigate to project
cd /Users/thomasv/royal-signet/mobile-app

# Verify .env file exists
ls -la | grep .env

# Check Node modules
npm list zod react-native-dotenv @firebase/app-check
```

**Expected:**
- `.env` file exists (not committed to git)
- `zod`, `react-native-dotenv`, `@firebase/app-check` installed

---

## 🚀 Test 1: App Compilation & Startup

### Objective
Verify the app compiles and starts without errors.

### Steps

1. **Clear cache and restart:**
   ```bash
   npm start -- --clear
   ```

2. **Check for compilation errors**
   - Look for TypeScript errors
   - Look for import errors
   - Look for environment variable errors

3. **Expected Console Output:**
   ```
   ✅ Firebase initialized
   ✅ Firebase App Check initialized successfully
   🔍 App Check: Running in DEBUG mode
   📝 Check console for App Check debug token on first run
   ```

4. **Check for App Check Debug Token:**
   ```
   Firebase App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```
   - Copy this token - you'll need it later

### ✅ Pass Criteria
- [ ] App compiles without errors
- [ ] App starts successfully
- [ ] No red error screens
- [ ] Console shows App Check initialized
- [ ] Debug token appears in console

### ❌ Common Issues

**Issue:** "Cannot find module '@env'"
**Fix:**
```bash
# Restart Metro bundler
npm start -- --reset-cache
```

**Issue:** "Firebase App Check initialization failed"
**Fix:** Check that firebase.ts is properly initialized first

**Issue:** Environment variables undefined
**Fix:** Verify .env file exists and babel.config.js is correct

---

## 🔐 Test 2: Environment Variables Loading

### Objective
Verify all secrets load correctly from .env file.

### Steps

1. **Add temporary logging to firebase.ts:**
   ```typescript
   // In src/services/firebase.ts, temporarily add:
   console.log('🔑 Firebase config check:', {
     hasApiKey: !!FIREBASE_API_KEY,
     hasProjectId: !!FIREBASE_PROJECT_ID,
     apiKeyLength: FIREBASE_API_KEY?.length || 0,
   });
   ```

2. **Restart app and check console**

3. **Expected Output:**
   ```
   🔑 Firebase config check: {
     hasApiKey: true,
     hasProjectId: true,
     apiKeyLength: 39
   }
   ```

4. **Remove temporary logging after verification**

### ✅ Pass Criteria
- [ ] All Firebase config variables defined
- [ ] Google OAuth client IDs defined
- [ ] No undefined or empty values
- [ ] API keys have correct length (~39 chars)

### ❌ Common Issues

**Issue:** Variables showing as undefined
**Fix:**
```bash
# 1. Check .env file exists
cat .env | grep FIREBASE_API_KEY

# 2. Restart with cache clear
npm start -- --reset-cache

# 3. Verify babel.config.js has dotenv plugin
```

---

## ✏️ Test 3: Input Validation - Sign Up Form

### Objective
Test comprehensive validation on the Sign Up screen.

### Test Cases

#### Test 3.1: Empty Form Submission
**Steps:**
1. Navigate to Sign Up screen
2. Leave all fields empty
3. Tap "Sign Up" button

**Expected:**
- ❌ Error under "Full Name" field: "Name is required" or "Name must be at least 2 characters"
- ❌ Error under "Email" field: "Email is required"
- ❌ Error under "Password" field: "Password is required"
- ✅ No form submission
- ✅ No network request

**Pass:** [ ]

---

#### Test 3.2: Invalid Email Format
**Steps:**
1. Enter name: "John Doe"
2. Enter email: "notanemail"
3. Enter password: "Password123!"
4. Enter confirm password: "Password123!"
5. Tap "Sign Up"

**Expected:**
- ❌ Error under "Email" field: "Please enter a valid email address"
- ✅ Other fields have no errors
- ✅ No form submission

**Pass:** [ ]

---

#### Test 3.3: Weak Password
**Steps:**
1. Enter name: "John Doe"
2. Enter email: "john@example.com"
3. Enter password: "weak" (only 4 chars)
4. Enter confirm password: "weak"
5. Tap "Sign Up"

**Expected:**
- ❌ Error: "Password must be at least 8 characters"

**Test with:** "password" (no uppercase)
**Expected:**
- ❌ Error: "Password must contain at least one uppercase letter"

**Test with:** "PASSWORD" (no lowercase)
**Expected:**
- ❌ Error: "Password must contain at least one lowercase letter"

**Test with:** "Password" (no number)
**Expected:**
- ❌ Error: "Password must contain at least one number"

**Test with:** "Password123" (no special char)
**Expected:**
- ❌ Error: "Password must contain at least one special character"

**Pass:** [ ]

---

#### Test 3.4: Password Mismatch
**Steps:**
1. Enter name: "John Doe"
2. Enter email: "john@example.com"
3. Enter password: "Password123!"
4. Enter confirm password: "Password123?" (different)
5. Tap "Sign Up"

**Expected:**
- ❌ Error under "Confirm Password": "Passwords don't match"
- ✅ No form submission

**Pass:** [ ]

---

#### Test 3.5: Invalid Name Characters
**Steps:**
1. Enter name: "John123" (numbers)
2. Enter email: "john@example.com"
3. Enter password: "Password123!"
4. Enter confirm password: "Password123!"
5. Tap "Sign Up"

**Expected:**
- ❌ Error under "Full Name": "Name can only contain letters, spaces, hyphens, and apostrophes"

**Test with:** "John<script>" (XSS attempt)
**Expected:**
- ❌ Similar validation error or sanitized to "Johnscript"

**Pass:** [ ]

---

#### Test 3.6: Real-time Error Clearing
**Steps:**
1. Tap "Sign Up" with empty fields (trigger errors)
2. Start typing in "Full Name" field

**Expected:**
- ✅ Error message under "Full Name" disappears immediately when typing starts
- ✅ Other field errors remain until those fields are edited

**Pass:** [ ]

---

#### Test 3.7: Valid Form Submission
**Steps:**
1. Enter name: "John Doe"
2. Enter email: "test@example.com"
3. Enter password: "Password123!"
4. Enter confirm password: "Password123!"
5. Tap "Sign Up"

**Expected:**
- ✅ No validation errors
- ✅ Form submits (shows loading state)
- ✅ Firebase API called
- ⚠️ May fail with "Email already in use" or succeed
- ✅ User-friendly error message if fails

**Pass:** [ ]

---

## 🔐 Test 4: Input Validation - Login Form

### Test Cases

#### Test 4.1: Empty Form
**Steps:**
1. Navigate to Login screen
2. Leave fields empty
3. Tap "Log In"

**Expected:**
- ❌ Error under "Email": "Email is required"
- ❌ Error under "Password": "Password is required"

**Pass:** [ ]

---

#### Test 4.2: Invalid Email
**Steps:**
1. Enter email: "bademail"
2. Enter password: "anything"
3. Tap "Log In"

**Expected:**
- ❌ Error: "Please enter a valid email address"

**Pass:** [ ]

---

#### Test 4.3: Valid Format (Wrong Credentials)
**Steps:**
1. Enter email: "wrong@example.com"
2. Enter password: "WrongPassword123!"
3. Tap "Log In"

**Expected:**
- ✅ No validation errors
- ✅ Form submits
- ❌ Alert: "No account found with this email. Please check your email or sign up."
  OR "Incorrect password. Please try again."
- ✅ User-friendly message (not raw Firebase error)

**Pass:** [ ]

---

## 🚫 Test 5: Rate Limiting

### Objective
Verify rate limiting prevents brute force attacks.

### Test 5.1: Login Rate Limiting

**Steps:**
1. Navigate to Login screen
2. Enter email: "test@example.com"
3. Enter password: "WrongPassword1!"
4. Tap "Log In" - **1st attempt**
5. Wait for error, tap "Log In" again - **2nd attempt**
6. Repeat - **3rd, 4th, 5th attempts**
7. Tap "Log In" - **6th attempt**

**Expected After 5th Attempt:**
- ✅ Attempts 1-5: Normal error messages
- ❌ 6th attempt: Alert "Too Many Attempts - Too many failed attempts. Please try again in 15 minutes."
- ✅ Login button should still work but show rate limit message

**Verify Rate Limit Storage:**
```bash
# Check AsyncStorage (in React Native Debugger or console)
# Should see: @rate_limit:login:test@example.com
```

**Pass:** [ ]

---

### Test 5.2: Rate Limit Reset on Success

**Steps:**
1. Trigger rate limit (5 failed login attempts)
2. Wait 15 minutes OR clear app data OR use different email
3. Log in with correct credentials
4. Try logging out and logging in again

**Expected:**
- ✅ After successful login, rate limit resets
- ✅ Can immediately log in again without rate limit

**Pass:** [ ]

---

### Test 5.3: Signup Rate Limiting

**Steps:**
1. Navigate to Sign Up screen
2. Enter valid but fake email: "fake1@example.com"
3. Fill in all fields correctly
4. Tap "Sign Up" - **1st attempt**
5. Repeat with "fake2@example.com" - **2nd attempt**
6. Repeat with "fake3@example.com" - **3rd attempt**
7. Try **4th attempt**

**Expected After 3rd Attempt:**
- ❌ 4th attempt: "Too Many Attempts - ... try again in 1 hour"
- ✅ Signup blocked for 1 hour

**Pass:** [ ]

---

### Test 5.4: Forgot Password Rate Limiting

**Steps:**
1. Navigate to Forgot Password screen
2. Enter email: "test@example.com"
3. Tap "Send Reset Link" - **1st attempt**
4. Go back, repeat - **2nd, 3rd attempts**
5. Try **4th attempt**

**Expected After 3rd Attempt:**
- ❌ 4th attempt: Rate limit message
- ✅ Can't send more password reset emails for 1 hour

**Pass:** [ ]

---

## 🧹 Test 6: Input Sanitization

### Objective
Verify malicious input is cleaned/blocked.

### Test 6.1: XSS Attempt in Name Field

**Steps:**
1. Navigate to Sign Up screen
2. Enter name: `<script>alert('XSS')</script>`
3. Enter valid email and password
4. Tap "Sign Up"

**Expected:**
- ✅ Script tags removed or sanitized
- ✅ Name becomes "scriptalertXSSscript" or similar
- OR ❌ Validation error: "Name can only contain letters..."
- ✅ No JavaScript execution
- ✅ No alert popup

**Pass:** [ ]

---

### Test 6.2: Email Sanitization

**Steps:**
1. Enter email: `TEST@EXAMPLE.COM` (uppercase)
2. Submit form

**Expected:**
- ✅ Email automatically converted to lowercase: `test@example.com`
- ✅ Whitespace trimmed

**Pass:** [ ]

---

### Test 6.3: Special Characters in Email

**Steps:**
1. Enter email: `test+tag@example.com` (valid)
2. Submit

**Expected:**
- ✅ Allowed (valid email format)

**Steps:**
1. Enter email: `test@ex ample.com` (space in domain)
2. Submit

**Expected:**
- ❌ Validation error OR sanitized to `test@example.com`

**Pass:** [ ]

---

## 📢 Test 7: Error Handling

### Objective
Verify user-friendly error messages don't expose sensitive data.

### Test 7.1: Wrong Password

**Steps:**
1. Login with correct email but wrong password
2. Check error message

**Expected:**
- ✅ User-friendly message: "Incorrect password. Please try again."
- ❌ NOT: Raw Firebase error like "auth/wrong-password"
- ❌ NOT: Stack traces or technical details

**Pass:** [ ]

---

### Test 7.2: User Not Found

**Steps:**
1. Login with email that doesn't exist
2. Check error message

**Expected:**
- ✅ Message: "No account found with this email. Please check your email or sign up."
- ❌ NOT: "auth/user-not-found"

**Pass:** [ ]

---

### Test 7.3: Network Error

**Steps:**
1. Turn off WiFi/mobile data
2. Try to log in
3. Check error message

**Expected:**
- ✅ Message: "Network error. Please check your internet connection and try again."
- ❌ NOT: "Network request failed" or raw error

**Pass:** [ ]

---

### Test 7.4: Email Already in Use

**Steps:**
1. Try to sign up with an existing email
2. Check error message

**Expected:**
- ✅ Message: "This email is already registered. Please sign in instead."
- ❌ NOT: "auth/email-already-in-use"

**Pass:** [ ]

---

## 🛡️ Test 8: Firebase App Check

### Objective
Verify App Check is initialized and generating tokens.

### Test 8.1: App Check Initialization

**Steps:**
1. Start app
2. Check console immediately on startup

**Expected Console Output:**
```
✅ Firebase App Check initialized successfully
🔍 App Check: Running in DEBUG mode
📝 Check console for App Check debug token on first run
```

**If first run, also expect:**
```
Firebase App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**Pass:** [ ]

---

### Test 8.2: Debug Token Generation

**Steps:**
1. If you don't see a debug token yet:
   ```bash
   # Clear app data
   npm start -- --reset-cache
   ```

2. Restart app
3. Look for debug token in console

**Expected:**
- ✅ Debug token appears
- ✅ Token format: UUID (XXXXXXXX-XXXX-...)
- ✅ Same token on subsequent app starts

**Save this token:** _______________________________

**Pass:** [ ]

---

### Test 8.3: Add Debug Token to Firebase

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `royal-signet` project
3. Click **App Check** in left sidebar
4. If prompted, click **Get started**
5. Click on your web app (or register if needed)
6. Go to **Debug tokens** tab
7. Click **Add debug token**
8. Paste the token from Test 8.2
9. Name it: "Development Token"
10. Click **Save**

**Expected:**
- ✅ Token saved successfully
- ✅ Shows in debug tokens list

**Pass:** [ ]

---

### Test 8.4: Verify App Check Token

**Steps:**
1. After adding debug token to Firebase
2. Restart app
3. Check console

**Expected:**
- ✅ No error messages about App Check
- ✅ App Check initialized successfully
- ✅ App functions normally

**Optional - Manual Verification:**
Add this temporarily to a component:
```typescript
import { verifyAppCheckSetup } from './src/services/appCheck';

useEffect(() => {
  verifyAppCheckSetup().then((valid) => {
    console.log('✅ App Check working:', valid);
  });
}, []);
```

**Expected:**
```
✅ App Check working: true
```

**Pass:** [ ]

---

## 🔄 Test 9: Full Authentication Flow

### Test 9.1: Complete Sign Up → Login Flow

**Steps:**
1. Sign up with new credentials:
   - Name: "Test User"
   - Email: "newuser@test.com"
   - Password: "SecurePass123!"
   - Confirm: "SecurePass123!"

2. **Expected:** Account created successfully

3. App automatically navigates to main screen

4. Log out

5. Try to log in with same credentials

6. **Expected:** Login successful

**Pass:** [ ]

---

### Test 9.2: Password Reset Flow

**Steps:**
1. Navigate to Forgot Password screen
2. Enter email: "newuser@test.com"
3. Tap "Send Reset Link"

**Expected:**
- ✅ Alert: "Email Sent - Password reset link has been sent to your email. Please check your inbox."
- ✅ Redirects to Login screen
- ✅ Check actual email inbox for reset link

**Pass:** [ ]

---

## 🎨 Test 10: User Experience

### Test 10.1: Loading States

**Steps:**
1. Tap Login/Signup button
2. Observe button during submission

**Expected:**
- ✅ Button shows loading spinner
- ✅ Button disabled during loading
- ✅ Can't double-submit
- ✅ Loading state clears after response

**Pass:** [ ]

---

### Test 10.2: Error Message Visibility

**Steps:**
1. Trigger a validation error
2. Check error text visibility

**Expected:**
- ✅ Error text is red
- ✅ Error text is clearly visible
- ✅ Error text doesn't overlap input
- ✅ Input border turns red
- ✅ Error disappears when typing

**Pass:** [ ]

---

## 📊 Test Results Summary

### Overall Results

**Date Tested:** ________________

**Tester:** ________________

**Environment:** Development

---

### Test Categories

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| App Startup | 1 | ☐ | ☐ | |
| Env Variables | 1 | ☐ | ☐ | |
| Sign Up Validation | 7 | ☐ | ☐ | |
| Login Validation | 3 | ☐ | ☐ | |
| Rate Limiting | 4 | ☐ | ☐ | |
| Sanitization | 3 | ☐ | ☐ | |
| Error Handling | 4 | ☐ | ☐ | |
| App Check | 4 | ☐ | ☐ | |
| Auth Flow | 2 | ☐ | ☐ | |
| UX | 2 | ☐ | ☐ | |
| **TOTAL** | **31** | **☐** | **☐** | |

---

### Critical Issues Found

1. ____________________________________________
2. ____________________________________________
3. ____________________________________________

### Minor Issues Found

1. ____________________________________________
2. ____________________________________________
3. ____________________________________________

### Recommendations

1. ____________________________________________
2. ____________________________________________
3. ____________________________________________

---

## ✅ Sign-off

- [ ] All critical features tested
- [ ] All validation working
- [ ] All rate limiting working
- [ ] All errors user-friendly
- [ ] App Check initialized
- [ ] No security vulnerabilities found
- [ ] Ready for next phase

**Tester Signature:** ________________

**Date:** ________________

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Document any issues found
2. ✅ Fix any bugs discovered
3. ✅ Proceed to Phase 1B (Stripe Integration)

If tests fail:
1. ❌ Document all failures
2. 🔧 Fix critical issues first
3. 🔁 Re-run failed tests
4. ✅ When all pass, proceed to next phase

