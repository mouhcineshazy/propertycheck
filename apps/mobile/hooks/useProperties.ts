/**
 * useProperties Hook - React 19 Pattern
 *
 * Custom hook for fetching and managing properties.
 * Uses useSyncExternalStore pattern for optimal performance.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getSupabaseBrowserClient, Property } from '@propertycheck/database';

type PropertiesState = {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
};

// Module-level state
let state: PropertiesState = {
  properties: [],
  isLoading: true,
  error: null,
};
let listeners: Set<() => void> = new Set();
let fetchPromise: Promise<void> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

async function fetchPropertiesInternal() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    state = {
      properties: data || [],
      isLoading: false,
      error: null,
    };
  } catch (err) {
    state = {
      properties: [],
      isLoading: false,
      error: 'Failed to load properties',
    };
    console.error('Error fetching properties:', err);
  }
  emitChange();
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  // Fetch on first subscriber
  if (listeners.size === 1 && !fetchPromise) {
    fetchPromise = fetchPropertiesInternal();
  }

  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): PropertiesState {
  return state;
}

function getServerSnapshot(): PropertiesState {
  return { properties: [], isLoading: true, error: null };
}

/**
 * useProperties - Hook for property data
 */
export function useProperties() {
  const currentState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const refetch = useCallback(async () => {
    state = { ...state, isLoading: true };
    emitChange();
    await fetchPropertiesInternal();
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    // Optimistic update
    const previousProperties = state.properties;
    state = {
      ...state,
      properties: state.properties.filter((p) => p.id !== id),
    };
    emitChange();

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('properties').delete().eq('id', id);

      if (error) {
        // Rollback on error
        state = { ...state, properties: previousProperties };
        emitChange();
        throw error;
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      throw err;
    }
  }, []);

  return {
    ...currentState,
    refetch,
    deleteProperty,
  };
}
