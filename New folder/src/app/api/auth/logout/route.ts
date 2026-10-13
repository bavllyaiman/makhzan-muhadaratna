import { cookies } from 'next/headers';
import { CSRF_COOKIE, SESSION_COOKIE, env } from '@/lib/server/env';
import { fail, ok } from '@/lib/server/http';
import { sessionRepository } from '@/lib/server/repositories';
import { getSession } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (session) sessionRepository.revoke(session.sid);

  const jar = await cookies();
  const expire = {
    path: '/',
    httpOnly: true,
    secure: env.SECURE_COOKIES,
    sameSite: 'strict' as const,
    maxAge: 0,
  };

  jar.set(SESSION_COOKIE, '', expire);
  jar.set(CSRF_COOKIE, '', { ...expire, httpOnly: false });

  return ok({ loggedOut: true });
}

export async function GET() {
  return fail(405, 'method_not_allowed', 'استخدم POST لتسجيل الخروج');
}