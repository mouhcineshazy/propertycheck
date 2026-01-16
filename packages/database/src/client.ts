/**
 * Supabase Client Configuration
 *
 * Creates typed Supabase clients for different contexts:
 * - Browser client: Uses anon key, respects RLS policies
 * - Server client: Uses service role key, bypasses RLS (use carefully!)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Try to load expo-constants if available (for React Native)
let expoExtra: { supabaseUrl?: string; supabaseAnonKey?: string } = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Constants = require('expo-constants').default;
  expoExtra = Constants.expoConfig?.extra || {};
} catch {
  // Not in Expo environment, ignore
}

// Environment variable getters with validation
function getSupabaseUrl(): string {
  // Support Next.js env vars, Expo env vars, and expo-constants extra
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    expoExtra.supabaseUrl;

  if (!url) {
    throw new Error(
      'Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL in your .env file'
    );
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    expoExtra.supabaseAnonKey;

  if (!key) {
    throw new Error(
      'Missing Supabase Anon Key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file'
    );
  }
  return key;
}

function getSupabaseServiceRoleKey(): string | undefined {
  // Service role key is optional (only needed server-side)
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Typed client type for export
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Browser/Client Supabase Client
 *
 * Use this for all client-side operations.
 * - Respects Row Level Security (RLS) policies
 * - Uses the anon key
 * - Persists auth session
 */
let browserClient: TypedSupabaseClient | null = null;

export function getSupabaseBrowserClient(): TypedSupabaseClient {
  if (browserClient) return browserClient;

  browserClient = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

/**
 * Server/Admin Supabase Client
 *
 * Use this ONLY in server-side code (API routes, webhooks).
 * - Bypasses RLS policies (has full database access)
 * - Uses the service role key
 * - Does NOT persist sessions
 *
 * WARNING: Never expose this client to the browser!
 */
export function getSupabaseServerClient(): TypedSupabaseClient {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Server client can only be used server-side.'
    );
  }

  // Create a new client each time to avoid auth state issues
  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * For backwards compatibility and simple use cases
 * Alias for getSupabaseBrowserClient
 */
export const supabase = getSupabaseBrowserClient;

/**
 * Helper to get public URL for a storage file
 */
export function getStoragePublicUrl(
  client: TypedSupabaseClient,
  bucket: string,
  path: string
): string {
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Storage bucket name constant
 */
export const INSPECTION_PHOTOS_BUCKET = 'inspection-photos';
