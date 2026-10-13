import { ok, toErrorResponse } from '@/lib/server/http';
import { requireSession } from '@/lib/server/auth';
import {
  ledgerRepository,
  patrolRepository,
  toSessionUser,
  userRepository,
} from '@/lib/server/repositories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Points ledger + rank progression for the signed-in scout. */
export async function GET() {
  try {
    const session = await requireSession();

    // Re-read the record so the figures are always the freshest ones.
    const record = await userRepository.findById(session.user.id);
    if (!record) return ok(null, { status: 404 });

    const [patrol, ledger] = await Promise.all([
      record.patrolId ? patrolRepository.findById(record.patrolId) : null,
      ledgerRepository.listForUser(record.id, 20),
    ]);

    return ok({
      profile: toSessionUser(record),
      patrol: patrol
        ? { id: patrol.id, name: patrol.name, totalPoints: patrol.totalPoints }
        : null,
      ledger,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}