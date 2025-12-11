/**
 * Royal Signet App - Light Mode Colors
 * Milk Man style inspired
 */

export const lightColors = {
  // Primary Brand Colors
  primary: '#8B0101',
  primaryDark: '#A20404',
  primaryLight: '#99201E',
  primaryAccent: '#B3201D',

  // Brand Red Variants
  red: {
    50: '#FFF9E9',
    100: '#DE2020',
    200: '#D0251E',
    300: '#CF1513',
    400: '#BF0B07',
    500: '#BA0702',
    600: '#A60D04',
    700: '#A20404',
    800: '#98201E',
    900: '#8B0101',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF', // Pure white background like Milk Man
    secondary: '#F8F8F8', // Card background
    tertiary: '#F0F0F0', // Elevated elements
    white: '#FFFFFF',
    black: '#000000',
    dark: '#020202',
  },

  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#1A1A1A',
    tertiary: '#8E8E93',
    muted: 'rgba(0, 0, 0, 0.6)',
    light: 'rgba(0, 0, 0, 0.4)',
    placeholder: 'rgba(0, 0, 0, 0.5)',
  },

  // Neutral Colors
  gray: {
    50: '#F3F3F5',
    100: '#E6EAF2',
    200: '#DDE5DD',
    300: '#9F9F95',
    400: '#84847B',
    500: '#838179',
    600: '#6D6D6D',
    700: '#3D3D3D',
    800: '#1E1E1E',
    900: '#161616',
  },

  // UI Element Colors
  ui: {
    border: '#A20404',
    borderLight: 'rgba(139, 1, 1, 0.03)',
    filterTag: 'rgba(211, 211, 211, 0.31)',
    inputBackground: 'rgba(139, 1, 1, 0.03)',
    disabled: 'rgba(0, 0, 0, 0.5)',
  },

  // Overlay Colors (for image gradients)
  overlay: {
    light: 'rgba(0, 0, 0, 0.28)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.77)',
    heavy: 'rgba(0, 0, 0, 0.91)',
  },

  // Status Colors
  status: {
    success: '#4BB543',
    error: '#D0251E',
    warning: '#FFA500',
    info: '#2196F3',
  },

  // Success and Error (for backwards compatibility)
  success: '#4BB543',
  error: '#D0251E',
} as const;

// Export light colors as default
export const colors = lightColors;
export type Colors = typeof lightColors;
