import { ok, toErrorResponse, readJson } from '@/lib/server/http';
import { assertCsrf, requireSession } from '@/lib/server/auth';
import { settingsSchema } from '@/lib/shared/schemas';
import { userRepository } from '@/lib/server/repositories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    await assertCsrf(request);
    const session = await requireSession();

    const input = settingsSchema.parse(await readJson(request));

    const record = await userRepository.updateSettings(session.user.id, {
      phone: input.phone,
      notifications: input.notifications,
      reduceMotion: input.reduceMotion,
    });
    if (!record) return ok(null, { status: 404 });

    return ok({
      phone: record.phone,
      notifications: record.notifications,
      reduceMotion: record.reduceMotion,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}