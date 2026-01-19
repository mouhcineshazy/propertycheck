# Authentication

## Overview

PropertyCheck uses Supabase Auth for authentication, supporting email/password and OAuth providers. Authentication is handled differently for web (cookie-based) and mobile (secure storage-based).

## Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Authentication Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌───────────┐     ┌───────────┐              │
│  │  Client  │────▶│  Supabase │────▶│ PostgreSQL│              │
│  │  (Web)   │     │   Auth    │     │  (users)  │              │
│  └────┬─────┘     └─────┬─────┘     └───────────┘              │
│       │                 │                                        │
│       │  Cookie         │  JWT                                   │
│       ▼                 ▼                                        │
│  ┌──────────┐     ┌───────────┐                                 │
│  │Middleware│◀────│  Session  │                                 │
│  │(Next.js) │     │  Refresh  │                                 │
│  └──────────┘     └───────────┘                                 │
│                                                                  │
│  ┌──────────┐     ┌───────────┐     ┌───────────┐              │
│  │  Client  │────▶│  Supabase │────▶│  Secure   │              │
│  │ (Mobile) │     │   Auth    │     │  Store    │              │
│  └──────────┘     └───────────┘     └───────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Web Authentication

### Supabase Client Setup

```typescript
// lib/supabase/client.ts - Browser client
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@propertycheck/database/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts - Server client
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@propertycheck/database/types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - can't set cookies
          }
        },
      },
    }
  );
}
```

### Middleware Configuration

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

```typescript
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/dashboard', '/checkout'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}
```

### Email/Password Authentication

```typescript
// Sign Up
async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Sign In
async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign Out
async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### OAuth Authentication

```typescript
// Google Sign In
async function signInWithGoogle(plan?: string) {
  const supabase = createClient();

  const redirectTo = plan
    ? `${window.location.origin}/auth/callback?plan=${plan}`
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}
```

### Auth Callback Handler

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const plan = searchParams.get('plan');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to checkout if plan specified
      if (plan) {
        return NextResponse.redirect(`${origin}/checkout?plan=${plan}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error - redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

### Password Reset

```typescript
// Request reset
async function requestPasswordReset(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

// Update password (on reset page)
async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}
```

## Mobile Authentication

### Secure Storage Adapter

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@propertycheck/database/types';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Important for mobile
    },
  }
);
```

### Mobile Auth Hook

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        // Handle auth events
        if (event === 'SIGNED_OUT') {
          router.replace('/(auth)/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Protect routes
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    signUp: async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };
}
```

## Session Management

### Web Session Lifecycle

```
1. User signs in
   └─▶ Supabase Auth creates session
   └─▶ Session stored in cookies (httpOnly, Secure)

2. Request to protected route
   └─▶ Middleware checks session
   └─▶ Refreshes token if needed
   └─▶ Updates cookies

3. User signs out
   └─▶ Session cleared from Supabase
   └─▶ Cookies deleted
```

### Mobile Session Lifecycle

```
1. User signs in
   └─▶ Supabase Auth creates session
   └─▶ Session stored in SecureStore

2. App opens
   └─▶ Check SecureStore for session
   └─▶ Validate/refresh with Supabase
   └─▶ Navigate based on auth state

3. User signs out
   └─▶ Session cleared from Supabase
   └─▶ SecureStore cleared
```

## Security Best Practices

### Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

### Cookie Security

Supabase SSR sets secure cookie options:
- `httpOnly`: Prevents XSS access
- `secure`: HTTPS only
- `sameSite: lax`: CSRF protection
- `path: /`: Available to all routes

### RLS Integration

Authentication integrates with Row Level Security:

```sql
-- Example RLS policy using auth.uid()
CREATE POLICY "Users can view own data" ON properties
  FOR SELECT USING (auth.uid() = user_id);

-- auth.uid() returns the authenticated user's ID from the JWT
```

### Service Role Usage

The service role key bypasses RLS and should only be used:
- In server-side API routes (webhooks)
- Never exposed to the client
- For admin operations

```typescript
// Only in server-side code (API routes)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Validation Schemas

```typescript
// packages/shared/src/schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(1, 'Name is required').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

## Error Handling

```typescript
// Common auth errors
const authErrors: Record<string, string> = {
  'Invalid login credentials': 'Email or password is incorrect',
  'Email not confirmed': 'Please check your email to confirm your account',
  'User already registered': 'An account with this email already exists',
  'Password should be at least 6 characters': 'Password is too short',
  'Email rate limit exceeded': 'Too many attempts. Please try again later.',
};

function getAuthErrorMessage(error: Error): string {
  return authErrors[error.message] || error.message || 'An error occurred';
}
```

## Testing Authentication

```typescript
// Mock Supabase for tests
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  }),
}));
```

---

*See [PAYMENTS.md](./PAYMENTS.md) for subscription-related authentication.*
