/**
 * Error handling utilities for secure error management
 * These functions mask sensitive errors and provide user-friendly messages
 */

import { FirebaseError } from 'firebase/app';

/**
 * Map of Firebase auth error codes to user-friendly messages
 */
const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/cancelled-popup-request': 'Sign-in cancelled. Please try again.',
  'auth/requires-recent-login': 'For security, please sign in again to complete this action.',
  'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
  'auth/invalid-verification-id': 'Verification failed. Please request a new code.',
  'auth/code-expired': 'Verification code expired. Please request a new one.',
  'auth/missing-verification-code': 'Please enter the verification code.',
  'auth/missing-verification-id': 'Verification failed. Please try again.',
  'auth/quota-exceeded': 'Too many requests. Please try again later.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email but with a different sign-in method.',
  'auth/credential-already-in-use': 'This credential is already associated with a different account.',
};

/**
 * Map of Firebase Firestore error codes to user-friendly messages
 */
const FIREBASE_FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'You don\'t have permission to perform this action.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This resource already exists.',
  'resource-exhausted': 'Too many requests. Please try again later.',
  'failed-precondition': 'Operation cannot be completed. Please try again.',
  'aborted': 'Operation was aborted. Please try again.',
  'out-of-range': 'Invalid input value.',
  'unimplemented': 'This feature is not yet available.',
  'internal': 'An internal error occurred. Please try again.',
  'unavailable': 'Service temporarily unavailable. Please try again later.',
  'data-loss': 'Data loss error. Please contact support.',
  'unauthenticated': 'Please sign in to continue.',
  'invalid-argument': 'Invalid input. Please check your information.',
  'deadline-exceeded': 'Request timed out. Please try again.',
  'cancelled': 'Operation cancelled. Please try again.',
};

/**
 * Generic error messages for different error types
 */
const GENERIC_ERROR_MESSAGES = {
  network: 'Network error. Please check your internet connection and try again.',
  unknown: 'Something went wrong. Please try again later.',
  validation: 'Please check your input and try again.',
  timeout: 'Request timed out. Please try again.',
  server: 'Server error. Please try again later.',
};

/**
 * Check if error is a Firebase error
 */
function isFirebaseError(error: any): error is FirebaseError {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string';
}

/**
 * Get user-friendly error message from Firebase error
 */
function getFirebaseErrorMessage(error: FirebaseError): string {
  // Check auth errors
  if (FIREBASE_AUTH_ERROR_MESSAGES[error.code]) {
    return FIREBASE_AUTH_ERROR_MESSAGES[error.code];
  }

  // Check Firestore errors
  if (FIREBASE_FIRESTORE_ERROR_MESSAGES[error.code]) {
    return FIREBASE_FIRESTORE_ERROR_MESSAGES[error.code];
  }

  // Return generic message for unknown Firebase errors
  console.error('Unhandled Firebase error:', error.code, error.message);
  return GENERIC_ERROR_MESSAGES.unknown;
}

/**
 * Get user-friendly error message from any error
 * This function masks sensitive error details while providing helpful feedback
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return GENERIC_ERROR_MESSAGES.unknown;
  }

  // Handle Firebase errors
  if (isFirebaseError(error)) {
    return getFirebaseErrorMessage(error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.toLowerCase().includes('network')) {
      return GENERIC_ERROR_MESSAGES.network;
    }

    // Check for timeout errors
    if (error.message.toLowerCase().includes('timeout')) {
      return GENERIC_ERROR_MESSAGES.timeout;
    }

    // For development, you might want to show the actual message
    // For production, this should return a generic message
    if (__DEV__) {
      return error.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default fallback
  return GENERIC_ERROR_MESSAGES.unknown;
}

/**
 * Log error securely without exposing sensitive information
 */
export function logError(error: unknown, context?: string): void {
  if (__DEV__) {
    // In development, log full error details
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  } else {
    // In production, log minimal information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = isFirebaseError(error) ? error.code : 'unknown';

    console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      code: errorCode,
      message: errorMessage.substring(0, 100), // Limit message length
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to error tracking service (e.g., Sentry) in production
  }
}

/**
 * Handle async errors with user-friendly messages
 * Usage: const [data, error] = await handleAsync(someAsyncFunction())
 */
export async function handleAsync<T>(
  promise: Promise<T>
): Promise<[T | null, string | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    logError(error);
    return [null, errorMessage];
  }
}

/**
 * Retry function with exponential backoff
 * Useful for network requests that might fail temporarily
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (isFirebaseError(error)) {
        const nonRetryableErrors = [
          'auth/invalid-email',
          'auth/wrong-password',
          'auth/user-not-found',
          'permission-denied',
          'not-found',
          'invalid-argument',
        ];

        if (nonRetryableErrors.some((code) => error.code.includes(code))) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Error boundary helper for React components
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Create a standardized error object
 */
export function createError(
  message: string,
  code?: string,
  originalError?: unknown
): AppError {
  const error = new AppError(message, code, originalError);
  logError(error);
  return error;
}

/**
 * Validation error helper
 */
export function createValidationError(message: string): AppError {
  return new AppError(message, 'validation-error');
}

/**
 * Check if error is a specific type
 */
export function isAuthError(error: unknown): boolean {
  return isFirebaseError(error) && error.code.startsWith('auth/');
}

export function isNetworkError(error: unknown): boolean {
  if (isFirebaseError(error) && error.code === 'auth/network-request-failed') {
    return true;
  }
  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    return true;
  }
  return false;
}

export function isPermissionError(error: unknown): boolean {
  return isFirebaseError(error) && error.code === 'permission-denied';
}
