/**
 * PropertyCheck Splash Screen
 *
 * Clean white background with animated text logo entry.
 * Simple, professional design.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { BRAND } from './Logo';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const fadeOut = useRef(new Animated.Value(1)).current;

  // Store callback ref
  const onCompleteRef = useRef(onAnimationComplete);
  onCompleteRef.current = onAnimationComplete;

  useEffect(() => {
    console.log('[SplashScreen] Starting animations');

    // Main animation sequence
    const mainAnimation = Animated.sequence([
      // Small delay before starting
      Animated.delay(200),

      // Phase 1: Logo text enters with scale and fade (500ms)
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // Small pause
      Animated.delay(200),

      // Phase 2: Tagline fades in (300ms)
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Hold for a moment
      Animated.delay(800),

      // Phase 3: Everything fades out (300ms)
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    mainAnimation.start(({ finished }) => {
      console.log('[SplashScreen] Animation finished:', finished);
      if (onCompleteRef.current) {
        console.log('[SplashScreen] Calling onAnimationComplete');
        onCompleteRef.current();
      }
    });

    return () => {
      console.log('[SplashScreen] Cleanup');
      mainAnimation.stop();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Main content */}
      <View style={styles.content}>
        {/* Logo text */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.logoText}>
            Property<Text style={styles.logoAccent}>Check</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Protect Your Deposit
        </Animated.Text>
      </View>

      {/* Bottom branding */}
      <Animated.View style={[styles.bottomBranding, { opacity: taglineOpacity }]}>
        <Text style={styles.bottomText}>Secure • Simple • Smart</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Main content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },

  logoContainer: {
    marginBottom: 16,
  },

  // Logo text styles
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: BRAND.dark,
    letterSpacing: -1,
  },
  logoAccent: {
    fontWeight: '800',
    color: BRAND.primary,
  },
  tagline: {
    fontSize: 16,
    color: BRAND.gray,
    fontWeight: '500',
  },

  // Bottom branding
  bottomBranding: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: BRAND.lightGray,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
