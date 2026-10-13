import { cookies } from 'next/headers';
import { env, SESSION_COOKIE, CSRF_COOKIE } from '@/lib/server/env';
import { createCsrfToken } from '@/lib/server/csrf';
import { fail, ok, readJson, toErrorResponse } from '@/lib/server/http';
import { authenticate, auditLogin, GENERIC_LOGIN_ERROR } from '@/lib/server/auth-service';
import { sessionRepository, bootstrapSeedPasswords } from '@/lib/server/repositories';
import { signAccessToken } from '@/lib/server/jwt';
import { clientIp, consume } from '@/lib/server/rate-limit';
import { csrfCookieOptions, sessionCookieOptions } from '@/lib/server/auth';
import { loginSchema } from '@/lib/shared/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  // Two independent limiters: per-IP (stops spraying) and per-identity
  // (stops distributed credential stuffing against a single account).
  const perIp = await consume(
    {
      scope: 'login:ip',
      limit: env.RATE_LIMIT_LOGIN_PER_IP,
      windowSeconds: env.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
    },
    ip,
  );

  if (!perIp.ok) {
    return fail(429, 'too_many_requests', 'محاولات كثيرة جداً. يرجى المحاولة لاحقاً.');
  }

  try {
    await bootstrapSeedPasswords();

    const body = loginSchema.parse(await readJson(request));
    const minPrefix = body.nationalId.slice(0, 4);

    const perIdentity = await consume(
      {
        scope: 'login:id',
        limit: env.RATE_LIMIT_LOGIN_PER_IP * 2,
        windowSeconds: env.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
      },
      minPrefix,
    );
    if (!perIdentity.ok) {
      return fail(429, 'too_many_requests', 'محاولات كثيرة جداً. يرجى المحاولة لاحقاً.');
    }

    const result = await authenticate(body);

    auditLogin({
      nationalIdSuffix: body.nationalId.slice(-4),
      success: result.ok,
      ip,
      userAgent: request.headers.get('user-agent'),
    });

    if (!result.ok) {
      return fail(401, 'invalid_credentials', GENERIC_LOGIN_ERROR);
    }

    const sid = await sessionRepository.create(result.user.id, env.SESSION_TTL_SECONDS);
    const token = await signAccessToken({ sub: result.user.id, sid, role: result.user.role });
    const csrf = createCsrfToken();
    const jar = await cookies();

    jar.set(SESSION_COOKIE, token, sessionCookieOptions(env.SESSION_TTL_SECONDS));
    jar.set(CSRF_COOKIE, csrf, csrfCookieOptions(env.SESSION_TTL_SECONDS));

    return ok({
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        role: result.user.role,
        rank: result.user.rank,
        nationalId: result.user.nationalId,
        pointsBalance: result.user.pointsBalance,
      },
      csrfToken: csrf,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}