/**
 * Royal Signet App - Design System
 * Centralized theme configuration matching Figma CSS export
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows, layout } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
} as const;

export type Theme = typeof theme;

// Export individual modules for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows, layout } from './spacing';

// Default export
export default theme;
