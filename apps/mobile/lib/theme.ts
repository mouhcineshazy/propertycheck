/**
 * PropertyCheck — "Trust Ink" theme (mobile).
 *
 * Single source of truth for colors, spacing, radius, typography, shadows, and
 * the light/dark semantic palettes. Dark mode follows the system appearance by
 * default via `useColorScheme()` (see ThemeProvider / useTheme in theme.tsx).
 *
 * Never hardcode a hex value in a screen — reference the theme from
 * `useTheme()` / `useThemedStyles()` so it adapts to light and dark.
 */

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const colors = {
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

export type Semantic = {
  canvas: string;
  card: string;
  cardMuted: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  line: string;
  lineStrong: string;
  primary: string;
  primaryContrast: string;
  primarySoft: string; // tinted primary surface (chips, icon backgrounds)
  verified: string;
  verifiedSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  overlay: string; // modal scrim
};

export const lightSemantic: Semantic = {
  canvas: '#F2F4F8',
  card: '#FFFFFF',
  cardMuted: '#F7F8FA',
  fg: colors.ink[950],
  fgMuted: colors.ink[600],
  fgSubtle: colors.ink[400],
  line: colors.ink[100],
  lineStrong: colors.ink[200],
  primary: colors.primary[600],
  primaryContrast: '#FFFFFF',
  primarySoft: colors.primary[50],
  verified: colors.verified[500],
  verifiedSoft: colors.verified[50],
  danger: colors.red[600],
  dangerSoft: colors.red[50],
  warning: colors.amber[500],
  warningSoft: colors.amber[50],
  overlay: 'rgba(11, 21, 36, 0.5)',
};

export const darkSemantic: Semantic = {
  canvas: colors.ink[950],
  card: colors.ink[900],
  cardMuted: colors.ink[800],
  fg: '#F2F4F8',
  fgMuted: colors.ink[300],
  fgSubtle: colors.ink[500],
  line: '#1E2B3E',
  lineStrong: colors.ink[700],
  primary: colors.primary[500],
  primaryContrast: '#FFFFFF',
  primarySoft: 'rgba(59, 130, 246, 0.15)',
  verified: '#2FB981',
  verifiedSoft: 'rgba(47, 185, 129, 0.15)',
  danger: colors.red[500],
  dangerSoft: 'rgba(239, 68, 68, 0.15)',
  warning: colors.amber[500],
  warningSoft: 'rgba(245, 158, 11, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/** Back-compat default (light) — prefer useTheme()/useThemedStyles in screens. */
export const semantic = lightSemantic;

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

const makeShadows = (shadowColor: string) =>
  ({
    xs: { shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    sm: { shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
    md: { shadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 },
    primary: {
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 14,
      elevation: 8,
    },
  }) as const;

export const lightShadows = makeShadows(colors.ink[950]);
export const darkShadows = makeShadows('#000000');

/** Back-compat default (light). */
export const shadows = lightShadows;

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: typeof colors;
  semantic: Semantic;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof lightShadows;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors,
  semantic: lightSemantic,
  spacing,
  radius,
  typography,
  shadows: lightShadows,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors,
  semantic: darkSemantic,
  spacing,
  radius,
  typography,
  shadows: darkShadows,
};

export const theme = lightTheme;

// ─────────────────────────────────────────────────────────────────────────────
// Theme context — system-driven light/dark with a manual override option.
// (No JSX so this stays a .ts module; screens import tokens + hooks from here.)
// ─────────────────────────────────────────────────────────────────────────────

/** User appearance preference. 'system' follows the OS. */
export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = AppTheme & {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  ...lightTheme,
  preference: 'system',
  setPreference: () => {},
});

const THEME_PREF_KEY = 'theme_preference';

/**
 * Provides the active theme. Follows the OS appearance by default; the user can
 * override it to Light/Dark via `useThemePreference()` (persisted in SecureStore).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync(THEME_PREF_KEY)
      .then((v) => {
        if (active && (v === 'light' || v === 'dark' || v === 'system')) {
          setPreferenceState(v);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    SecureStore.setItemAsync(THEME_PREF_KEY, p).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const mode: ThemeMode = preference === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : preference;
    const base = mode === 'dark' ? darkTheme : lightTheme;
    return { ...base, preference, setPreference };
  }, [scheme, preference, setPreference]);

  return createElement(ThemeContext.Provider, { value }, children);
}

/** Access the active theme (mode, semantic palette, tokens). */
export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}

/** Read/set the appearance preference (System / Light / Dark). */
export function useThemePreference() {
  const { preference, setPreference, mode } = useContext(ThemeContext);
  return { preference, setPreference, mode };
}

/**
 * Build a StyleSheet from the active theme, memoized per theme.
 *
 *   const makeStyles = (t: AppTheme) => StyleSheet.create({ ... t.semantic.fg ... });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T>(factory: (t: AppTheme) => T): T {
  const t = useTheme();
  return useMemo(() => factory(t), [t, factory]);
}
