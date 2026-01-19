import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  color?: string;
}

/**
 * PropertyCheck Logo - Professional Design
 *
 * Shield shape containing a house silhouette with a checkmark
 * Represents property protection and verification
 */
export function Logo({ size = 32, color = '#1a1a1a' }: LogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* Shield shape */}
      <Path
        d="M24 2L6 10V22C6 33.1 13.8 43.3 24 46C34.2 43.3 42 33.1 42 22V10L24 2Z"
        fill={color}
      />

      {/* House cutout (negative space) */}
      <Path
        d="M24 12L14 19V34H20V26H28V34H34V19L24 12Z"
        fill="white"
      />

      {/* Checkmark */}
      <Path
        d="M19 24L22.5 27.5L29 21"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Outline variant for dark backgrounds
 */
export function LogoOutline({ size = 32, color = '#ffffff' }: LogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* Shield outline */}
      <Path
        d="M24 4L8 11V21C8 31.2 14.9 40.4 24 43C33.1 40.4 40 31.2 40 21V11L24 4Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* House roof */}
      <Path
        d="M15 22L24 15L33 22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* House body */}
      <Path
        d="M17 21V32H31V21"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Door */}
      <Path
        d="M22 32V26H26V32"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * App icon variant with rounded square background
 */
export function LogoMark({ size = 48, color = '#1a1a1a' }: LogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* Background */}
      <Rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        fill={color}
      />

      {/* House */}
      <Path
        d="M24 14L13 22V35H19V28H29V35H35V22L24 14Z"
        fill="white"
      />

      {/* Check badge */}
      <Circle cx="35" cy="13" r="7" fill="#22c55e" />
      <Path
        d="M32 13L34 15L38 11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface LogoWithTextProps extends LogoProps {
  textColor?: string;
  fontSize?: number;
}

export function LogoWithText({
  size = 32,
  color = '#1a1a1a',
  textColor,
  fontSize = 20
}: LogoWithTextProps) {
  return (
    <View style={styles.container}>
      <Logo size={size} color={color} />
      <Text style={[styles.text, { color: textColor || color, fontSize }]}>
        PropertyCheck
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});

export default Logo;
