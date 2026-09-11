/**
 * PropertyCheck — "Trust Ink" theme (mobile).
 *
 * Single source of truth for colors, spacing, radius, typography, and shadows.
 * Kept in sync with the web Tailwind config (apps/web/tailwind.config.ts).
 * Never hardcode a hex value in a screen — reference these tokens.
 */

export const colors = {
  // Ink — cool navy-tinted neutral ramp
  ink: {
    50: '#F2F4F8',
    100: '#E6E9EF',
    200: '#D3DAE4',
    300: '#AEB9C9',
    400: '#8695AB',
    500: '#63748D',
    600: '#45566E',
    700: '#2C3B52',
    800: '#1C2A3E',
    900: '#0F1B2D',
    950: '#0B1524',
  },
  // Primary — brand blue (trust, security)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Verified — "documented / protected" success signal
  verified: {
    50: '#E9F7F1',
    100: '#C9EFDF',
    500: '#15966E',
    600: '#0F7757',
    700: '#0C5F46',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Semantic aliases — use these in screens. If a dark theme is added later,
 * only this object needs to switch.
 */
export const semantic = {
  canvas: '#F2F4F8', // page background
  card: '#FFFFFF', // card surface
  cardMuted: '#F7F8FA', // recessed surface
  fg: colors.ink[950], // primary text
  fgMuted: colors.ink[600], // secondary text
  fgSubtle: colors.ink[400], // tertiary text / placeholder
  line: colors.ink[100], // hairline border
  lineStrong: colors.ink[200], // stronger border
  primary: colors.primary[600],
  primaryContrast: '#FFFFFF',
  verified: colors.verified[500],
  danger: colors.red[600],
  warning: colors.amber[500],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 36 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 28 },
  heading: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  overline: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;

/**
 * Cross-platform elevation. Spread into a style object.
 * iOS reads shadow*, Android reads elevation.
 */
export const shadows = {
  xs: {
    shadowColor: colors.ink[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.ink[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: colors.ink[950],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  primary: {
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export const theme = { colors, semantic, spacing, radius, typography, shadows } as const;

export type Theme = typeof theme;
