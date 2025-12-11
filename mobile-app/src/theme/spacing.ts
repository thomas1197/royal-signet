/**
 * Royal Signet App - Spacing System
 * Consistent spacing scale for margins, padding, gaps
 */

export const spacing = {
  // Base spacing unit: 4px
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,

  // Common spacing values from CSS
  container: 24, // Left/right padding for main container
  cardGap: 8, // Gap between cards in grid
  sectionGap: 16, // Gap between sections
  screenPadding: 24, // Padding for screens
} as const;

/**
 * Border Radius values
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 20,
  '2xl': 32,
  '3xl': 39,
  '4xl': 48,
  pill: 65, // Fully rounded buttons
  circle: 9999, // Perfect circles

  // Specific component radius
  button: 65,
  card: 8,
  modal: 32,
  navigationBar: 39,
  input: 8,
  avatar: {
    small: 20,
    medium: 28,
    large: 40,
  },
} as const;

/**
 * Shadow values - Apple-style subtle shadows
 */
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Subtle shadow for cards (iOS-style)
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  // Medium shadow for elevated cards
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Floating elements (modals, dropdowns)
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  // Bottom navigation/tab bar
  navigation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  text: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
} as const;

/**
 * Layout dimensions
 */
export const layout = {
  // Mobile viewport
  mobileWidth: 393,
  contentWidth: 345, // 393 - (24 * 2)

  // Component heights
  input: 54,
  button: 54,
  navigationBar: 85,
  backButton: 38,
  filterPill: 32,
  searchBar: 49,

  // Card sizes
  eventCard: {
    width: 124,
    height: 174,
  },
  sermonCard: {
    width: 165,
    height: 112,
  },
  announcementCard: {
    width: 345,
    height: 114,
  },
  galleryImage: {
    width: 168,
    height: 168,
  },

  // Avatar sizes
  avatar: {
    small: 26,
    medium: 40,
    large: 45,
  },

  // OTP input
  otpBox: {
    width: 52,
    height: 50,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Layout = typeof layout;
