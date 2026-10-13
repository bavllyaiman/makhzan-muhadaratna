import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp, createNonce } from '@/lib/server/security-headers';

/**
 * Edge middleware. Two jobs:
 *  1. Attach a per-request nonce-based CSP (nonce is forwarded to the RSC tree
 *     via the `x-nonce` request header so server components can read it).
 *  2. Cheap pre-flight gate on protected pages — presence of a session cookie.
 *     NOTE: this is an optimisation only. Cookie *presence* proves nothing, so
 *     every route handler / server component independently verifies the signed
 *     token in `lib/server/auth.ts`. Never rely on middleware for authorisation.
 */

const PUBLIC_ROUTES = new Set(['/', '/login', '/support']);
const PUBLIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$/i;

/** Must stay in sync with `SESSION_COOKIE` in lib/server/env.ts. */
const SESSION_COOKIE = process.env.SECURE_COOKIES === 'true'
  ? '__Host-scout_session'
  : 'scout_session';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const nonce = createNonce();
  const isDev = process.env.NODE_ENV === 'development';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const isProtected =
    !PUBLIC_ROUTES.has(pathname) &&
    !PUBLIC_FILE.test(pathname) &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api');

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);

  if (isProtected && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    applySecurityHeaders(redirect.headers, nonce, isDev);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  applySecurityHeaders(response.headers, nonce, isDev);
  return response;
}

function applySecurityHeaders(headers: Headers, nonce: string, dev: boolean) {
  headers.set('Content-Security-Policy', buildCsp({ nonce, dev }));
  headers.set('x-nonce', nonce);
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static files. Kept intentionally
     * broad so the CSP is never missing from a document response.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};