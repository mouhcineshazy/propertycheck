import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from '@/i18n/config';

// Create the next-intl middleware with browser language detection
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Automatically detect user's preferred language from browser Accept-Language header
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip i18n for API routes and auth callback
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/')
  ) {
    return await updateSession(request);
  }

  // Run next-intl middleware first for locale handling
  const intlResponse = intlMiddleware(request);

  // If next-intl returns a redirect (e.g., adding locale prefix), return it
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // Otherwise, run Supabase session handling
  const supabaseResponse = await updateSession(request);

  // Merge cookies from intl response to supabase response if needed
  if (supabaseResponse) {
    // Copy any locale-related cookies/headers
    intlResponse.headers.forEach((value, key) => {
      supabaseResponse.headers.set(key, value);
    });
    return supabaseResponse;
  }

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
