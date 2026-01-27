/**
 * PropertyCheck Logo System
 *
 * Text-only branding - "PropertyCheck"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Brand colors
const BRAND = {
  primary: '#2563eb',      // Royal blue
  primaryLight: '#3b82f6', // Blue 500
  primaryDark: '#1d4ed8',  // Blue 700
  dark: '#0f172a',         // Slate 900
  gray: '#64748b',         // Slate 500
  lightGray: '#94a3b8',    // Slate 400
  white: '#ffffff',
};

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  variant?: 'default' | 'light' | 'dark';
}

const SIZES = {
  sm: { fontSize: 16, fontWeight: '700' as const },
  md: { fontSize: 24, fontWeight: '700' as const },
  lg: { fontSize: 32, fontWeight: '700' as const },
  xl: { fontSize: 48, fontWeight: '700' as const },
};

/**
 * Primary Logo - Text only
 */
export function Logo({ size = 'md', color, variant = 'default' }: LogoProps) {
  const sizeStyle = SIZES[size];
  const textColor = color || (variant === 'light' ? BRAND.white : BRAND.dark);

  return (
    <Text style={[styles.logo, { fontSize: sizeStyle.fontSize, color: textColor }]}>
      Property<Text style={styles.accent}>Check</Text>
    </Text>
  );
}

/**
 * Logo for Splash Screen - Large centered version
 */
export function LogoSplash({ size = 140 }: { size?: number }) {
  const fontSize = size * 0.3;

  return (
    <View style={styles.splashContainer}>
      <Text style={[styles.splashLogo, { fontSize }]}>
        Property<Text style={styles.splashAccent}>Check</Text>
      </Text>
    </View>
  );
}

/**
 * Logo with Tagline
 */
export function LogoWithTagline({
  size = 'md',
  color,
  variant = 'default',
}: LogoProps) {
  const sizeStyle = SIZES[size];
  const textColor = color || (variant === 'light' ? BRAND.white : BRAND.dark);
  const taglineColor = variant === 'light' ? 'rgba(255,255,255,0.7)' : BRAND.gray;

  return (
    <View style={styles.taglineContainer}>
      <Text style={[styles.logo, { fontSize: sizeStyle.fontSize, color: textColor }]}>
        Property<Text style={styles.accent}>Check</Text>
      </Text>
      <Text style={[styles.tagline, { color: taglineColor }]}>
        Protect Your Deposit
      </Text>
    </View>
  );
}

/**
 * Stacked Logo - Vertical layout with tagline
 */
export function LogoStacked({
  size = 'lg',
  textColor = BRAND.dark,
  showTagline = true,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  showTagline?: boolean;
}) {
  const sizeStyle = SIZES[size];

  return (
    <View style={styles.stackedContainer}>
      <Text style={[styles.logo, { fontSize: sizeStyle.fontSize, color: textColor }]}>
        Property<Text style={styles.accent}>Check</Text>
      </Text>
      {showTagline && (
        <Text style={[styles.stackedTagline, { color: BRAND.gray }]}>
          Protect Your Deposit
        </Text>
      )}
    </View>
  );
}

/**
 * Logo with Text - Alias for Logo (for backward compatibility)
 */
export function LogoWithText({
  size = 'md',
  textColor = BRAND.dark,
  showTagline = false,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  fontSize?: number;
  showTagline?: boolean;
}) {
  return showTagline ? (
    <LogoWithTagline size={size} color={textColor} />
  ) : (
    <Logo size={size} color={textColor} />
  );
}

// Backward compatibility exports
export const LogoIcon = Logo;
export const LogoMark = Logo;
export const LogoOutline = Logo;

const styles = StyleSheet.create({
  logo: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  accent: {
    fontWeight: '800',
    color: BRAND.primary,
  },
  taglineContainer: {
    alignItems: 'flex-start',
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  stackedContainer: {
    alignItems: 'center',
    gap: 8,
  },
  stackedTagline: {
    fontSize: 16,
    fontWeight: '500',
  },
  splashContainer: {
    alignItems: 'center',
  },
  splashLogo: {
    fontWeight: '700',
    color: BRAND.dark,
    letterSpacing: -1,
  },
  splashAccent: {
    fontWeight: '800',
    color: BRAND.primary,
  },
});

export { BRAND };
export default Logo;
