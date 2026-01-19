/**
 * useAuth Hook - React 19 Pattern
 *
 * Manages authentication state using useSyncExternalStore for optimal performance.
 * This pattern avoids the useEffect + useState anti-pattern for external subscriptions.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@propertycheck/database';

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
function initializeAuth() {
  if (initialized) return;
  initialized = true;

  const supabase = getSupabaseBrowserClient();

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    authState = { session, isLoading: false };
    emitChange();
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    authState = { session, isLoading: false };
    emitChange();
  });
}

// Subscribe function for useSyncExternalStore
function subscribe(callback: () => void) {
  initializeAuth();
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
    const supabase = getSupabaseBrowserClient();
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
