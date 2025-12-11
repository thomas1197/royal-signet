/**
 * Rate limiting utilities to prevent brute force attacks
 * Uses AsyncStorage to track attempts across app restarts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lastAttemptTime: number;
  blockedUntil?: number;
}

const RATE_LIMIT_PREFIX = '@rate_limit:';

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  maxAttempts: number; // Maximum attempts allowed
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after max attempts
}

/**
 * Default configurations for different operations
 */
export const RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  forgotPassword: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  otpVerification: {
    maxAttempts: 5,
    windowMs: 30 * 60 * 1000, // 30 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
};

/**
 * Get rate limit record from storage
 */
async function getRateLimitRecord(key: string): Promise<RateLimitRecord | null> {
  try {
    const data = await AsyncStorage.getItem(`${RATE_LIMIT_PREFIX}${key}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rate limit record:', error);
    return null;
  }
}

/**
 * Save rate limit record to storage
 */
async function saveRateLimitRecord(key: string, record: RateLimitRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${RATE_LIMIT_PREFIX}${key}`,
      JSON.stringify(record)
    );
  } catch (error) {
    console.error('Error saving rate limit record:', error);
  }
}

/**
 * Clear rate limit record from storage
 */
async function clearRateLimitRecord(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
  } catch (error) {
    console.error('Error clearing rate limit record:', error);
  }
}

/**
 * Check if action is rate limited
 * Returns { allowed: true } if action is allowed
 * Returns { allowed: false, retryAfter: timestamp } if rate limited
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter?: number; remainingAttempts?: number }> {
  const now = Date.now();
  const record = await getRateLimitRecord(key);

  // No previous attempts
  if (!record) {
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
    };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfter: record.blockedUntil,
    };
  }

  // Check if window has expired (reset attempts)
  if (now - record.firstAttemptTime > config.windowMs) {
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
    };
  }

  // Check if max attempts reached
  if (record.attempts >= config.maxAttempts) {
    const blockedUntil = now + config.blockDurationMs;
    await saveRateLimitRecord(key, {
      ...record,
      blockedUntil,
    });

    return {
      allowed: false,
      retryAfter: blockedUntil,
    };
  }

  // Allowed, but increment attempts
  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - record.attempts - 1,
  };
}

/**
 * Record an attempt (successful or failed)
 */
export async function recordAttempt(key: string): Promise<void> {
  const now = Date.now();
  const record = await getRateLimitRecord(key);

  if (!record) {
    // First attempt
    await saveRateLimitRecord(key, {
      attempts: 1,
      firstAttemptTime: now,
      lastAttemptTime: now,
    });
  } else {
    // Increment attempts
    await saveRateLimitRecord(key, {
      ...record,
      attempts: record.attempts + 1,
      lastAttemptTime: now,
    });
  }
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export async function resetRateLimit(key: string): Promise<void> {
  await clearRateLimitRecord(key);
}

/**
 * Format retry after time for user display
 */
export function formatRetryAfter(retryAfter: number): string {
  const now = Date.now();
  const remainingMs = retryAfter - now;

  if (remainingMs <= 0) return 'now';

  const minutes = Math.ceil(remainingMs / 60000);

  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.ceil(minutes / 60);
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

/**
 * Rate limiter class for easier usage
 */
export class RateLimiter {
  constructor(
    private key: string,
    private config: RateLimitConfig
  ) {}

  /**
   * Check if action is allowed
   */
  async check(): Promise<{ allowed: boolean; message?: string; remainingAttempts?: number }> {
    const result = await checkRateLimit(this.key, this.config);

    if (!result.allowed) {
      const retryTime = result.retryAfter ? formatRetryAfter(result.retryAfter) : 'later';
      return {
        allowed: false,
        message: `Too many attempts. Please try again in ${retryTime}.`,
      };
    }

    return {
      allowed: true,
      remainingAttempts: result.remainingAttempts,
    };
  }

  /**
   * Record an attempt
   */
  async record(): Promise<void> {
    await recordAttempt(this.key);
  }

  /**
   * Reset the rate limiter
   */
  async reset(): Promise<void> {
    await resetRateLimit(this.key);
  }

  /**
   * Check and record in one call
   */
  async checkAndRecord(): Promise<{ allowed: boolean; message?: string; remainingAttempts?: number }> {
    const result = await this.check();

    if (result.allowed) {
      await this.record();
    }

    return result;
  }
}

/**
 * Create a rate limiter for login attempts
 */
export function createLoginRateLimiter(email: string): RateLimiter {
  // Use email as key to limit per account
  const key = `login:${email.toLowerCase()}`;
  return new RateLimiter(key, RATE_LIMIT_CONFIGS.login);
}

/**
 * Create a rate limiter for signup attempts
 */
export function createSignupRateLimiter(email: string): RateLimiter {
  const key = `signup:${email.toLowerCase()}`;
  return new RateLimiter(key, RATE_LIMIT_CONFIGS.signup);
}

/**
 * Create a rate limiter for password reset attempts
 */
export function createForgotPasswordRateLimiter(email: string): RateLimiter {
  const key = `forgot-password:${email.toLowerCase()}`;
  return new RateLimiter(key, RATE_LIMIT_CONFIGS.forgotPassword);
}

/**
 * Create a rate limiter for OTP verification
 */
export function createOtpRateLimiter(phone: string): RateLimiter {
  const key = `otp:${phone}`;
  return new RateLimiter(key, RATE_LIMIT_CONFIGS.otpVerification);
}

/**
 * Clean up old rate limit records (call periodically)
 */
export async function cleanupOldRecords(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const rateLimitKeys = keys.filter((key) => key.startsWith(RATE_LIMIT_PREFIX));
    const now = Date.now();

    for (const key of rateLimitKeys) {
      const record = await getRateLimitRecord(key.replace(RATE_LIMIT_PREFIX, ''));

      if (record) {
        // Remove records older than 24 hours
        if (now - record.lastAttemptTime > 24 * 60 * 60 * 1000) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up rate limit records:', error);
  }
}
