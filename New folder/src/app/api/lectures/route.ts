import { ok, toErrorResponse } from '@/lib/server/http';
import { assertCsrf, requireSession } from '@/lib/server/auth';
import { clientIp, consume } from '@/lib/server/rate-limit';
import { env } from '@/lib/server/env';
import { lectureRepository } from '@/lib/server/repositories';
import { lectureQuerySchema, lectureSchema } from '@/lib/shared/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const limited = await consume(
      { scope: 'api:lectures', limit: env.RATE_LIMIT_API_PER_IP, windowSeconds: 60 },
      clientIp(request.headers),
    );
    if (!limited.ok) {
      return ok(null, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } });
    }

    await requireSession();

    // Whitelist-only query parsing: unknown params are dropped by Zod, so they
    // can never reach the data layer.
    const url = new URL(request.url);
    const query = lectureQuerySchema.parse({
      status: url.searchParams.get('status') ?? undefined,
      sort: url.searchParams.get('sort') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
    });

    const term = query.q?.toLowerCase() ?? '';
    const all = (await lectureRepository.listAll())
      .map((l) => lectureSchema.parse(l))
      .filter((l) => (query.status ? l.status === query.status : true))
      .filter((l) => (term ? l.title.toLowerCase().includes(term) : true));

    const sorted = all.sort((a, b) => {
      if (query.sort === 'recent') return b.requestedAt.localeCompare(a.requestedAt);
      if (query.sort === 'oldest') return a.requestedAt.localeCompare(b.requestedAt);
      return a.order - b.order;
    });

    const start = (query.page - 1) * query.pageSize;
    return ok({
      items: sorted.slice(start, start + query.pageSize),
      total: sorted.length,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Example of a state-changing, authenticated + CSRF-protected endpoint.
 * Leaders and admins may pin/unpin a lecture; every request is authorised and
 * rate limited server-side, never via a client-supplied role.
 */
export async function PATCH(request: Request) {
  try {
    const limited = await consume(
      { scope: 'api:lectures:write', limit: 30, windowSeconds: 60 },
      clientIp(request.headers),
    );
    if (!limited.ok) {
      return ok(null, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } });
    }

    await assertCsrf(request);
    const session = await requireSession();
    if (!['LEADER', 'ADMIN'].includes(session.user.role)) {
      return ok(null, { status: 403 });
    }

    const body = (await request.json()) as { lectureId?: string; status?: string };
    const status = lectureSchema.shape.status.safeParse(body.status);
    if (!body.lectureId || !status.success) {
      return ok(null, { status: 404 });
    }

    const lecture = await lectureRepository.setStatus(body.lectureId, status.data);
    if (!lecture) return ok(null, { status: 404 });

    return ok(lectureSchema.parse(lecture));
  } catch (error) {
    return toErrorResponse(error);
  }
}