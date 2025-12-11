/**
 * Sanitization utilities to prevent XSS and injection attacks
 * These functions clean and escape user input before processing or storage
 */

/**
 * Remove HTML tags from a string
 * Prevents HTML/JavaScript injection
 */
export function stripHtmlTags(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 * Prevents XSS attacks by converting special chars to HTML entities
 */
export function escapeHtml(input: string): string {
  if (!input) return '';

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitize text input by removing dangerous patterns
 * Prevents JavaScript injection and other malicious code
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // Remove potential JavaScript event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize email address
 * Removes dangerous characters while preserving valid email format
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Convert to lowercase and trim
  let sanitized = email.toLowerCase().trim();

  // Remove any characters that aren't valid in email addresses
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');

  return sanitized;
}

/**
 * Sanitize phone number
 * Removes all non-numeric characters except + - ( ) and spaces
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';

  // Keep only numbers and common phone formatting characters
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
}

/**
 * Sanitize name input
 * Allows only letters, spaces, hyphens, and apostrophes
 */
export function sanitizeName(name: string): string {
  if (!name) return '';

  let sanitized = name.trim();

  // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z\s'-]/g, '');

  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Capitalize first letter of each word
  sanitized = sanitized.replace(/\b\w/g, (char) => char.toUpperCase());

  return sanitized;
}

/**
 * Sanitize URL
 * Ensures URL uses safe protocols (http/https)
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Only allow http and https protocols
  if (!trimmed.match(/^https?:\/\//i)) {
    // If no protocol, assume https
    return `https://${trimmed}`;
  }

  // Check for dangerous protocols
  if (trimmed.match(/^(javascript|data|vbscript|file):/i)) {
    return '';
  }

  return trimmed;
}

/**
 * Sanitize numeric input
 * Returns only the numeric part of a string
 */
export function sanitizeNumber(input: string): string {
  if (!input) return '';

  // Keep only digits and decimal point
  const sanitized = input.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  return sanitized;
}

/**
 * Sanitize donation amount
 * Ensures amount is a valid positive number
 */
export function sanitizeDonationAmount(amount: string): number {
  const sanitized = sanitizeNumber(amount);
  const parsed = parseFloat(sanitized);

  // Return 0 for invalid numbers
  if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
    return 0;
  }

  // Round to 2 decimal places for currency
  return Math.round(parsed * 100) / 100;
}

/**
 * Sanitize general text input (comments, descriptions, etc.)
 * More permissive than sanitizeText, but still safe
 */
export function sanitizeTextInput(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Trim and normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Sanitize prayer request
 * Allows most text but prevents malicious code
 */
export function sanitizePrayerRequest(request: string): string {
  if (!request) return '';

  let sanitized = sanitizeTextInput(request);

  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
}

/**
 * Clean whitespace from text
 * Removes extra spaces, newlines, tabs, etc.
 */
export function cleanWhitespace(text: string): string {
  if (!text) return '';

  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Remove null bytes that could be used in attacks
 */
export function removeNullBytes(input: string): string {
  if (!input) return '';
  return input.replace(/\0/g, '');
}

/**
 * Comprehensive sanitizer for user input
 * Applies multiple sanitization techniques
 */
export function sanitizeUserInput(input: string, type: 'text' | 'name' | 'email' | 'phone' | 'url' = 'text'): string {
  if (!input) return '';

  // Remove null bytes
  let sanitized = removeNullBytes(input);

  // Apply type-specific sanitization
  switch (type) {
    case 'name':
      sanitized = sanitizeName(sanitized);
      break;
    case 'email':
      sanitized = sanitizeEmail(sanitized);
      break;
    case 'phone':
      sanitized = sanitizePhoneNumber(sanitized);
      break;
    case 'url':
      sanitized = sanitizeUrl(sanitized);
      break;
    case 'text':
    default:
      sanitized = sanitizeTextInput(sanitized);
      break;
  }

  return sanitized;
}

/**
 * Sanitize object properties recursively
 * Useful for sanitizing form data before submission
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  typeMap?: Partial<Record<keyof T, 'text' | 'name' | 'email' | 'phone' | 'url'>>
): T {
  const sanitized: any = { ...obj };

  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key];

    if (typeof value === 'string') {
      const type = (typeMap?.[key as keyof T] as 'text' | 'name' | 'email' | 'phone' | 'url') || 'text';
      sanitized[key] = sanitizeUserInput(value, type);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    }
  });

  return sanitized as T;
}

/**
 * Sanitize amount input for donations
 * Removes any characters except numbers and decimal point
 * Ensures proper decimal format
 */
export function sanitizeAmount(amount: string): string {
  if (!amount) return '0';

  // Remove all non-numeric characters except decimal point
  let sanitized = amount.replace(/[^0-9.]/g, '');

  // Remove multiple decimal points (keep only first)
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    sanitized = parts[0] + '.' + parts[1].substring(0, 2);
  }

  // Remove leading zeros except if followed by decimal
  sanitized = sanitized.replace(/^0+(?=\d)/, '');

  // If empty or just decimal, return '0'
  if (!sanitized || sanitized === '.') {
    return '0';
  }

  return sanitized;
}
