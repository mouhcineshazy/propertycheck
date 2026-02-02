import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { locales } from '@/i18n/config';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Strips locale prefix from pathname for route matching
 * e.g., '/en/dashboard' -> '/dashboard', '/fr/login' -> '/login'
 */
function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (segments[1] && locales.includes(segments[1] as any)) {
    return '/' + segments.slice(2).join('/') || '/';
  }
  return pathname;
}

/**
 * Gets the current locale from pathname
 * e.g., '/en/dashboard' -> 'en', '/fr/login' -> 'fr'
 */
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  if (segments[1] && locales.includes(segments[1] as any)) {
    return segments[1];
  }
  return 'en'; // default
}

/**
 * Middleware to handle Supabase session management and route protection
 *
 * This middleware:
 * 1. Refreshes expired sessions automatically
 * 2. Protects routes that require authentication
 * 3. Redirects authenticated users away from auth pages
 * 4. Preserves the intended destination URL for post-login redirect
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client with cookie handling for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          // Update request cookies for downstream handlers
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Create new response with updated cookies
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies on response for client
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - critical for Server Components
  // This must run before any protected route checks
  // getUser() validates the JWT with Supabase servers (secure but slower)
  // We use this to ensure the session is valid
  let user = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      user = data.user;
    }
  } catch {
    // If getUser fails (network issue, etc.), check session from cookies as fallback
    // This is less secure but allows the app to work offline
    const { data: sessionData } = await supabase.auth.getSession();
    user = sessionData.session?.user ?? null;
  }

  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  // ─────────────────────────────────────────────────────────────────────────
  // PROTECTED ROUTES
  // Routes that require authentication - redirect to login if not logged in
  // ─────────────────────────────────────────────────────────────────────────
  const protectedPaths = [
    '/dashboard',
    '/properties',
    '/inspections',
    '/settings',
    '/checkout', // Checkout requires auth to link subscription to user
  ];

  const isProtectedRoute = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;

    // Preserve the full URL including query params for redirect after login
    // This ensures ?plan=premium is preserved when redirecting from checkout
    const fullRedirectPath = pathname + request.nextUrl.search;
    url.searchParams.set('redirect', fullRedirectPath);

    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH ROUTES
  // Routes that should redirect to dashboard if already logged in
  // ─────────────────────────────────────────────────────────────────────────
  const authPaths = ['/login', '/signup', '/forgot-password'];

  const isAuthRoute = authPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  if (isAuthRoute && user) {
    // Check if there's a redirect URL in the query params
    const redirectTo = request.nextUrl.searchParams.get('redirect');

    const url = request.nextUrl.clone();

    if (redirectTo && redirectTo.startsWith('/')) {
      // Redirect to the intended destination (validated to start with /)
      url.pathname = redirectTo.split('?')[0]; // Extract path without query
      // Preserve query params from redirect URL
      const redirectUrl = new URL(redirectTo, request.url);
      redirectUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
    } else {
      // Default to dashboard with current locale
      url.pathname = `/${locale}/dashboard`;
    }

    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API ROUTES
  // Skip certain API routes from session refresh to avoid issues
  // ─────────────────────────────────────────────────────────────────────────
  const skipSessionRefresh = [
    '/api/stripe/webhook', // Webhooks need raw body, can't modify cookies
  ];

  if (skipSessionRefresh.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  return supabaseResponse;
}
