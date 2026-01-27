/**
 * Root Layout - React 19 Pattern
 *
 * Uses useSyncExternalStore via useAuth hook for optimal auth state management.
 * Features animated splash screen during initialization.
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks';
import { SplashScreen } from '../components/SplashScreen';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [showSplash, setShowSplash] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Hide splash when both animation is complete AND auth is loaded
  useEffect(() => {
    if (animationComplete && !isLoading) {
      setShowSplash(false);
    }
  }, [animationComplete, isLoading]);

  // Handle navigation based on auth state
  useEffect(() => {
    // Wait for navigation to be ready, auth to load, and splash to finish
    if (!navigationState?.key || isLoading || showSplash) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    // Check if user is in a protected route (tabs or other authenticated routes like property)
    const inProtectedRoute = segments[0] === '(tabs)' || segments[0] === 'property' || segments[0] === 'inspection';
    // Check if on initial/undefined route (app just opened)
    const onInitialRoute = !segments[0] || segments[0] === undefined;

    console.log('[RootLayout] Navigation check:', { isAuthenticated, inAuthGroup, inProtectedRoute, onInitialRoute, segments: segments[0] });

    if (!isAuthenticated) {
      // Not authenticated - go to login (unless already there)
      if (!inAuthGroup) {
        console.log('[RootLayout] Redirecting to login');
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated - redirect to tabs if in auth group (just logged in) or on initial route (app reopened)
      // Don't redirect if already in a protected route
      if (inAuthGroup || onInitialRoute) {
        console.log('[RootLayout] Redirecting to tabs');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, segments, isLoading, showSplash, navigationState?.key]);

  // Show animated splash screen during initial load
  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen
          onAnimationComplete={() => {
            setAnimationComplete(true);
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
        <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="property/new" options={{ headerShown: false }} />
        <Stack.Screen name="inspection/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
