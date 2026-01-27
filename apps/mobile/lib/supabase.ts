/**
 * Mobile Supabase Client with Secure Storage
 *
 * In React Native, we need to use expo-secure-store for session persistence.
 * The default localStorage doesn't exist in React Native, so without this,
 * sessions are lost when the app restarts.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import type { Database } from '@propertycheck/database';

// Get config from expo-constants extra
const expoExtra = Constants.expoConfig?.extra || {};

const supabaseUrl = expoExtra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = expoExtra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Custom storage adapter using expo-secure-store
 * This ensures auth tokens persist securely across app restarts
 */
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('[SecureStore] Error getting item:', key, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('[SecureStore] Error setting item:', key, error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('[SecureStore] Error removing item:', key, error);
    }
  },
};

// Typed client type
export type TypedSupabaseClient = SupabaseClient<Database>;

// Singleton client instance
let mobileClient: TypedSupabaseClient | null = null;

/**
 * Get the mobile Supabase client with secure storage
 *
 * This client:
 * - Uses expo-secure-store for session persistence
 * - Sessions survive app restarts
 * - Tokens are stored securely in the device keychain
 */
export function getMobileSupabaseClient(): TypedSupabaseClient {
  if (mobileClient) return mobileClient;

  console.log('[Supabase] Creating mobile client with secure storage');

  mobileClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: SecureStoreAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Not needed in React Native
    },
  });

  return mobileClient;
}

// Default export for convenience
export const supabase = getMobileSupabaseClient;
