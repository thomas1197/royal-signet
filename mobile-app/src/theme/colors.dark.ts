/**
 * Royal Signet App - Dark Mode Colors
 * Milk Man style inspired
 */

export const darkColors = {
  // Primary Brand Colors
  primary: '#B3201D',
  primaryDark: '#8B0101',
  primaryLight: '#CF1513',
  primaryAccent: '#DE2020',

  // Brand Red Variants
  red: {
    50: '#1A1A1A',
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
    primary: '#000000', // Pure black
    secondary: '#1A1A1A', // Card background
    tertiary: '#2A2A2A', // Elevated elements
    white: '#FFFFFF',
    black: '#000000',
    dark: '#0A0A0A',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E5E5',
    tertiary: '#8E8E93',
    muted: 'rgba(255, 255, 255, 0.6)',
    light: 'rgba(255, 255, 255, 0.7)',
    placeholder: 'rgba(255, 255, 255, 0.5)',
  },

  // Neutral Colors
  gray: {
    50: '#2A2A2A',
    100: '#3A3A3A',
    200: '#4A4A4A',
    300: '#6A6A6A',
    400: '#8A8A8A',
    500: '#9A9A9A',
    600: '#AAAAAA',
    700: '#CCCCCC',
    800: '#E5E5E5',
    900: '#FFFFFF',
  },

  // UI Element Colors
  ui: {
    border: '#2A2A2A',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    filterTag: 'rgba(255, 255, 255, 0.15)',
    inputBackground: 'rgba(255, 255, 255, 0.05)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.6)',
    dark: 'rgba(0, 0, 0, 0.8)',
    heavy: 'rgba(0, 0, 0, 0.95)',
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
