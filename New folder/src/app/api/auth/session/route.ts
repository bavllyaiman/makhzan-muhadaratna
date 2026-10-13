import { cookies } from 'next/headers';
import { CSRF_COOKIE, env } from '@/lib/server/env';
import { createCsrfToken } from '@/lib/server/csrf';
import { getSession } from '@/lib/server/auth';
import { ok } from '@/lib/server/http';
import { bootstrapSeedPasswords } from '@/lib/server/repositories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Bootstraps the client session state. The CSRF token is issued here (and by
 * /login) so the client always holds a matching double-submit pair before it
 * attempts its first mutating request.
 */
export async function GET() {
  await bootstrapSeedPasswords();

  const session = await getSession();
  const jar = await cookies();

  let csrfToken = jar.get(CSRF_COOKIE)?.value;
  if (!csrfToken) {
    csrfToken = createCsrfToken();
    jar.set(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      secure: env.SECURE_COOKIES,
      sameSite: 'strict',
      path: '/',
      maxAge: env.SESSION_TTL_SECONDS,
    });
  }

  return ok({ user: session?.user ?? null, csrfToken });
}