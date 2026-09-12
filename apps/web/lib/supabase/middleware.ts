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

  // Web auth is disabled (presentation-only site), so no session validation
  // is needed here — the Supabase client above is retained only for cookie
  // plumbing on API routes that still pass through this middleware.
  void supabase;

  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  // ─────────────────────────────────────────────────────────────────────────
  // WEB IS PRESENTATION-ONLY
  // The product lives in the mobile app. The web is a marketing site that
  // introduces PropertyCheck and prompts users to download the app.
  // Sign-in / sign-up / dashboard / the web upgrade page are disabled — any
  // request to them is redirected to the marketing home.
  //
  // Explicitly still reachable (NOT redirected):
  //  - /checkout/success, /checkout/report-success, /checkout/bundle-success
  //    (Stripe return URLs used by the mobile app's checkout flow)
  //  - /share/[token], /compare/[propertyId] (public acquisition surfaces)
  //  - /api/* and /auth/* (handled before this function)
  // ─────────────────────────────────────────────────────────────────────────
  const disabledExact = ['/login', '/signup', '/forgot-password', '/reset-password', '/checkout'];
  const disabledPrefixes = ['/dashboard'];

  const isDisabled =
    disabledExact.includes(pathWithoutLocale) ||
    disabledPrefixes.some(
      (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
    );

  if (isDisabled) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    url.search = '';
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
