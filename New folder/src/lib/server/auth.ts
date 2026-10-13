import { cookies } from 'next/headers';
import { env, SESSION_COOKIE, CSRF_COOKIE } from './env';
import { TokenError, verifyAccessToken } from './jwt';
import { sessionRepository, toSessionUser, userRepository } from './repositories';
import { timingSafeEqualStr } from './csrf';
import type { Role, SessionUser } from '@/lib/shared/schemas';

/**
 * Server-side authorisation gate. Every protected route handler calls one of
 * these; nothing trusts a role value coming from the client.
 */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'error',
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const unauthorized = () => new HttpError(401, 'يجب تسجيل الدخول أولاً', 'unauthorized');
export const forbidden = () => new HttpError(403, 'لا تملك صلاحية للوصول إلى هذا المورد', 'forbidden');

export interface Session {
  user: SessionUser;
  sid: string;
}

export async function readSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function readCsrfCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CSRF_COOKIE)?.value ?? null;
}

/** Verify signature, expiry, session revocation and that the user still exists. */
export async function getSession(): Promise<Session | null> {
  const token = await readSessionToken();
  if (!token) return null;

  try {
    const claims = await verifyAccessToken(token);
    if (!(await sessionRepository.isActive(claims.sid, claims.sub))) return null;

    const record = await userRepository.findById(claims.sub);
    if (!record) return null;

    // Fresh read from the database: a demoted user loses access immediately.
    return { user: toSessionUser(record), sid: claims.sid };
  } catch (error) {
    if (error instanceof TokenError) return null;
    throw error;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw unauthorized();
  return session;
}

/**
 * RBAC. Callers must list the roles explicitly — there is no "any authenticated
 * user" shortcut, so new routes are secure by default.
 */
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) throw forbidden();
  return session;
}

/**
 * CSRF defence-in-depth for state-changing requests: double-submit cookie must
 * match the `x-csrf-token` header (compared in constant time).
 */
export async function assertCsrf(request: Request): Promise<void> {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;

  const headerToken = request.headers.get('x-csrf-token');
  const cookieToken = await readCsrfCookie();

  if (!headerToken || !cookieToken || !timingSafeEqualStr(headerToken, cookieToken)) {
    throw new HttpError(403, 'فشل التحقق من CSRF — أعد تحميل الصفحة', 'csrf_failed');
  }
}

/** Secure cookie attributes. Centralised so every path uses the same policy. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: env.SECURE_COOKIES,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: maxAgeSeconds,
    // no `domain` -> enables the __Host- prefix protection in production
  };
}

export function csrfCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: false, // must be readable by the client to echo it back
    secure: env.SECURE_COOKIES,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}