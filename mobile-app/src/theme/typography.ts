/**
 * Royal Signet App - Typography System
 * Based on Figma CSS export
 * Font families: Lora (serif), Satoshi (sans-serif), Inter, Schoolbell (handwritten)
 */

export const typography = {
  // Font Families
  fonts: {
    lora: 'Lora', // Primary heading font (serif)
    satoshi: 'Satoshi', // Main body font (sans-serif)
    inter: 'Inter', // Secondary UI font
    schoolbell: 'Schoolbell', // Decorative/accent font
  },

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Font Sizes
  sizes: {
    xs: 10, // Tiny text (timestamps, verse numbers)
    sm: 12, // Captions, metadata
    base: 14, // Small labels
    md: 16, // Body text, buttons, form inputs
    lg: 18, // Card titles, H4/H5
    xl: 20, // Large body text
    '2xl': 24, // H2/H3 headers
    '3xl': 28, // Large numbers/OTP digits
    '4xl': 32, // H1 headers
    '5xl': 48, // Extra large (hero text)
  },

  // Line Heights (as multipliers)
  lineHeights: {
    tight: 1.08, // Condensed text
    heading: 1.25, // Headings
    normal: 1.5, // Body text
    relaxed: 1.6, // Comfortable reading
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.04, // Large headings
    tight: -0.03, // Standard headings
    normal: -0.02, // Subtle tightening
    wide: 0.05, // Slightly expanded
  },

  // Text Styles (predefined combinations)
  styles: {
    // Headings
    h1: {
      fontFamily: 'Lora',
      fontSize: 32,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      letterSpacing: -0.04,
    },
    h2: {
      fontFamily: 'Lora',
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      letterSpacing: -0.03,
    },
    h3: {
      fontFamily: 'Lora',
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      letterSpacing: -0.02,
    },
    h4: {
      fontFamily: 'Lora',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },

    // Body Text
    bodyLarge: {
      fontFamily: 'Satoshi',
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    body: {
      fontFamily: 'Satoshi',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontFamily: 'Satoshi',
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },

    // UI Elements
    button: {
      fontFamily: 'Satoshi',
      fontSize: 16,
      fontWeight: '700' as const,
      lineHeight: 1.5,
    },
    label: {
      fontFamily: 'Satoshi',
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: 'Satoshi',
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },

    // Special
    otp: {
      fontFamily: 'Satoshi',
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    verseNumber: {
      fontFamily: 'Satoshi',
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
  },
} as const;

export type Typography = typeof typography;
