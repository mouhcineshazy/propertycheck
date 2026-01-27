/**
 * useAuth Hook - React 19 Pattern
 *
 * Manages authentication state using useSyncExternalStore for optimal performance.
 * This pattern avoids the useEffect + useState anti-pattern for external subscriptions.
 *
 * Uses the mobile-specific Supabase client with expo-secure-store for
 * proper session persistence across app restarts.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { getMobileSupabaseClient } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
};

// Module-level state (external store)
let authState: AuthState = { session: null, isLoading: true };
let listeners: Set<() => void> = new Set();

// Notify all subscribers when state changes
function emitChange() {
  listeners.forEach((listener) => listener());
}

// Initialize auth listener (runs once)
let initialized = false;
let authInitPromise: Promise<void> | null = null;

function initializeAuth() {
  if (initialized) return;
  initialized = true;

  const supabase = getMobileSupabaseClient();

  // Get initial session - this restores the persisted session
  authInitPromise = supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('[useAuth] Session restored:', session ? 'authenticated' : 'not authenticated');
    authState = { session, isLoading: false };
    emitChange();
  }).catch((error) => {
    console.error('[useAuth] Failed to restore session:', error);
    authState = { session: null, isLoading: false };
    emitChange();
  });

  // Listen for auth changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[useAuth] Auth state changed:', event, session ? 'authenticated' : 'not authenticated');
    authState = { session, isLoading: false };
    emitChange();
  });
}

// Initialize immediately when module loads (not lazily on first subscribe)
// This ensures session restoration starts as early as possible
initializeAuth();

// Subscribe function for useSyncExternalStore
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Snapshot function for useSyncExternalStore
function getSnapshot(): AuthState {
  return authState;
}

// Server snapshot (for SSR - not used in React Native but required)
function getServerSnapshot(): AuthState {
  return { session: null, isLoading: true };
}

/**
 * useAuth - Hook for authentication state
 *
 * Uses useSyncExternalStore (React 18+) for optimal subscription handling.
 * This is the recommended pattern over useEffect + useState for external stores.
 */
export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signOut = useCallback(async () => {
    const supabase = getMobileSupabaseClient();
    await supabase.auth.signOut();
  }, []);

  return {
    session: state.session,
    user: state.session?.user ?? null,
    isLoading: state.isLoading,
    isAuthenticated: !!state.session,
    signOut,
  };
}
