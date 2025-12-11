import { z } from 'zod';

/**
 * Email validation schema
 * Validates proper email format
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Simple password schema for login (no complexity requirements)
 */
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required');

/**
 * Name validation schema
 * Allows letters, spaces, hyphens, and apostrophes
 * Prevents XSS and SQL injection attempts
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * Phone number validation schema
 * Supports various formats: (123) 456-7890, 123-456-7890, 1234567890
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    'Please enter a valid phone number'
  );

/**
 * Optional phone number (can be empty)
 */
export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(val),
    'Please enter a valid phone number'
  );

/**
 * Prayer request validation schema
 * Allows reasonable text length, prevents malicious content
 */
export const prayerRequestSchema = z
  .string()
  .trim()
  .min(10, 'Prayer request must be at least 10 characters')
  .max(1000, 'Prayer request must not exceed 1000 characters')
  .refine(
    (val) => !/<script|javascript:|onerror=/i.test(val),
    'Invalid content detected'
  );

/**
 * Donation amount validation schema
 * Must be positive number between $1 and $10,000
 */
export const donationAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .min(1, 'Minimum donation is $1')
  .max(10000, 'Maximum donation is $10,000')
  .finite('Invalid amount');

/**
 * Donation note/comment validation
 */
export const donationNoteSchema = z
  .string()
  .max(500, 'Note must not exceed 500 characters')
  .optional()
  .refine(
    (val) => !val || !/<script|javascript:|onerror=/i.test(val),
    'Invalid content detected'
  );

/**
 * General text input validation
 * For comments, descriptions, etc.
 */
export const textInputSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(5000, 'Text is too long')
  .refine(
    (val) => !/<script|javascript:|onerror=/i.test(val),
    'Invalid content detected'
  );

/**
 * Optional text input
 */
export const optionalTextSchema = z
  .string()
  .max(5000, 'Text is too long')
  .optional()
  .refine(
    (val) => !val || !/<script|javascript:|onerror=/i.test(val),
    'Invalid content detected'
  );

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    (val) => val.startsWith('http://') || val.startsWith('https://'),
    'URL must start with http:// or https://'
  );

/**
 * Optional URL validation
 */
export const optionalUrlSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || (val.startsWith('http://') || val.startsWith('https://')),
    'URL must start with http:// or https://'
  );

/**
 * Login form validation
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

/**
 * Sign up form validation
 */
export const signUpFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Forgot password form validation
 */
export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password form validation
 */
export const resetPasswordFormSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * OTP validation (6-digit code)
 */
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

/**
 * Helper function to validate data against a schema
 * Returns validation result with type safety
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): {
  success: boolean;
  data?: z.infer<T>;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Convert Zod errors to a simple object
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}

/**
 * Helper function to get first error message
 */
export function getFirstError(errors?: Record<string, string>): string | null {
  if (!errors) return null;
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
}

/**
 * Validate individual field
 */
export function validateField<T extends z.ZodType>(
  schema: T,
  value: unknown
): { valid: boolean; error?: string } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { valid: true };
  }

  return {
    valid: false,
    error: result.error.errors[0]?.message || 'Invalid input',
  };
}
