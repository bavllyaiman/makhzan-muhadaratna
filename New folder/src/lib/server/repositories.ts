import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { env } from './env';
import { hashPassword } from './password';
import { getDataSource } from './data-source';
import type { LeaderboardEntry, SessionUser } from '@/lib/shared/schemas';
import type { DataSource, LectureRecord, UserRecord } from './data-source/types';

/**
 * Repository facade.
 *
 * This is the only module routes and server components import for data access.
 * It exposes domain-shaped, async operations and delegates to whichever
 * adapter is active, so the storage backend is invisible to the application
 * layer.
 */

export const DEMO_PASSWORD = 'Scout#2026pass';

export function db(): DataSource {
  return getDataSource();
}

/* --------------------------------- demo seed -------------------------------- */

/**
 * Development-only credential provisioning for the in-memory adapter.
 *
 * On Postgres credentials are provisioned once via `npm run db:seed` and are
 * NEVER touched at runtime — that is what keeps real members' passwords safe
 * from an accidental redeploy.
 *
 * Outside development the password is 24 random bytes generated per boot and
 * printed once, so a known default credential can never exist on a deployed
 * instance.
 */
let bootstrapped = false;

export async function bootstrapSeedPasswords(): Promise<void> {
  if (bootstrapped || !env.SEED_DEMO_ACCOUNTS) return;
  bootstrapped = true;

  if (db().kind === 'postgres') {
    // Already seeded once; do nothing at boot.
    return;
  }

  const password = env.isProd ? randomBytes(24).toString('base64url') : DEMO_PASSWORD;
  const digest = await hashPassword(password);

  const users = await db().listUsers();
  for (const user of users) {
    if (user.passwordHash) continue; // never overwrite an existing credential
    await db().setPasswordHash(user.id, digest);
  }

  console.warn(
    env.isProd
      ? `[SEED] ${users.length} demo account(s) created with a one-time password: ${password}`
      : `[SEED] ${users.length} demo account(s) created (password: ${DEMO_PASSWORD})`,
  );
}

/* -------------------------------- projection -------------------------------- */

export function toSessionUser(user: UserRecord): SessionUser {
  return {
    id: user.id,
    nationalId: user.nationalId,
    fullName: user.fullName,
    role: user.role,
    rank: user.rank,
    patrolId: user.patrolId,
    pointsBalance: user.pointsBalance,
    pointsEarned: user.pointsEarned,
    pointsDeducted: user.pointsDeducted,
  };
}

/* --------------------------------- queries --------------------------------- */

export const userRepository = {
  findByNationalId: (nationalId: string) => db().findUserByNationalId(nationalId),
  findById: (id: string) => db().findUserById(id),
  listAll: () => db().listUsers(),
  listByPatrol: (patrolId: string) => db().listUsersByPatrol(patrolId),
  count: () => db().countUsers(),

  registerFailedAttempt: (userId: string, windowMs: number, threshold: number) =>
    db().registerFailedLogin(userId, windowMs, threshold),

  resetFailedAttempts: (userId: string) => db().clearFailedLogin(userId),

  updateSettings: (userId: string, patch: Parameters<DataSource['updateUserSettings']>[1]) =>
    db().updateUserSettings(userId, patch),
};

export const patrolRepository = {
  listAll: () => db().listPatrols(),
  findById: (id: string) => db().findPatrolById(id),
  count: () => db().countPatrols(),

  /**
   * League standings. Points are always summed from live member balances rather
   * than a denormalised counter, so a rank can never drift from reality.
   */
  async ranking(): Promise<(Awaited<ReturnType<DataSource['listPatrols']>>[number] & {
    rank: number;
    trend: 'up' | 'down' | 'same';
  })[]> {
    const patrols = await db().listPatrols();

    const sorted = [...patrols].sort(
      (a, b) => b.totalPoints - a.totalPoints || a.id.localeCompare(b.id),
    );

    return sorted.map((patrol, index) => {
      const currentRank = index + 1;
      const trend: 'up' | 'down' | 'same' =
        patrol.previousRank > currentRank
          ? 'up'
          : patrol.previousRank < currentRank
            ? 'down'
            : 'same';
      return { ...patrol, rank: currentRank, trend };
    });
  },
};

export const lectureRepository = {
  listAll: () => db().listLectures(),
  findById: (id: string) => db().findLectureById(id),
  count: () => db().countLectures(),
  setStatus: (id: string, status: LectureRecord['status']) => db().setLectureStatus(id, status),
};

export const ledgerRepository = {
  listForUser: (userId: string, limit = 20) => db().listLedger(userId, limit),
};

export const sessionRepository = {
  /** Session id is generated here so both adapters share the same format. */
  async create(userId: string, ttlSeconds: number): Promise<string> {
    const sid = randomUUID();
    await db().createSession(sid, userId, new Date(Date.now() + ttlSeconds * 1000));
    return sid;
  },
  isActive: (sid: string, userId: string) => db().isSessionActive(sid, userId),
  revoke: (sid: string) => db().revokeSession(sid),
  /** Used on password change / "log out everywhere". */
  revokeAllForUser: (userId: string) => db().revokeAllSessionsForUser(userId),
  purgeExpired: () => db().purgeExpiredSessions(),
};

/** Convenience for pages that only need aggregate counts. */
export async function platformStats() {
  const [users, patrols, lectures] = await Promise.all([
    db().countUsers(),
    db().countPatrols(),
    db().countLectures(),
  ]);
  return { users, patrols, lectures };
}

export type { LeaderboardEntry };