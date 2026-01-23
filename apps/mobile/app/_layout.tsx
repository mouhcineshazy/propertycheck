/**
 * Root Layout - React 19 Pattern
 *
 * Uses useSyncExternalStore via useAuth hook for optimal auth state management.
 * Features animated splash screen during initialization.
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks';
import { SplashScreen } from '../components/SplashScreen';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading || showSplash) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router, showSplash]);

  // Show animated splash screen during initial load
  if (showSplash || isLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <SplashScreen
          onAnimationComplete={() => {
            // Only hide splash when auth is also done loading
            if (!isLoading) {
              setShowSplash(false);
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
