import { ok, toErrorResponse } from '@/lib/server/http';
import { patrolRepository } from '@/lib/server/repositories';
import { requireRole } from '@/lib/server/auth';
import { clientIp, consume } from '@/lib/server/rate-limit';
import { env } from '@/lib/server/env';
import { leaderboardEntrySchema } from '@/lib/shared/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** League standings — visible to any authenticated member of the organisation. */
export async function GET(request: Request) {
  try {
    await consume(
      { scope: 'api:leaderboard', limit: env.RATE_LIMIT_API_PER_IP, windowSeconds: 60 },
      clientIp(request.headers),
    );
    await requireRole('SCOUT', 'PATROL_LEADER', 'LEADER', 'ADMIN');

    const ranked = await patrolRepository.ranking();
    const entries = ranked.map((patrol) =>
      leaderboardEntrySchema.parse({
        rank: patrol.rank,
        patrolId: patrol.id,
        patrolName: patrol.name,
        totalPoints: patrol.totalPoints,
        memberCount: patrol.memberCount,
        trend: patrol.trend,
      }),
    );

    return ok(entries);
  } catch (error) {
    return toErrorResponse(error);
  }
}