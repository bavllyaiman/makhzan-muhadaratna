import 'server-only';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { env } from '../env';
import type {
  DataSource,
  LedgerEntry,
  LectureRecord,
  PatrolRecord,
  UserRecord,
  UserSettingsPatch,
} from './types';
import type { LectureStatus, Role } from '@/lib/shared/schemas';

/**
 * Postgres adapter. Every method goes through Prisma's query builder, so all
 * values are sent as bound parameters — SQL injection is structurally
 * impossible here, there is no string-concatenated query anywhere in this file.
 *
 * Neon note: use the POOLED connection string (`-pooler` host) in DATABASE_URL.
 * The direct endpoint is a long-lived TCP socket and serverless runtimes will
 * exhaust the connection limit within minutes.
 */

const globalRef = globalThis as unknown as { __prisma?: PrismaClient };

function prisma(): PrismaClient {
  if (!globalRef.__prisma) {
    globalRef.__prisma = new PrismaClient({
      log: env.isProd ? ['error', 'warn'] : ['error', 'warn'],
    });
  }
  return globalRef.__prisma;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

type UserRow = {
  id: string;
  nationalId: string;
  fullName: string;
  email: string | null;
  passwordHash: string;
  role: Role;
  rank: string;
  patrolId: string | null;
  pointsBalance: number;
  pointsEarned: number;
  pointsDeducted: number;
  avatarSeed: string;
  phone: string;
  notifications: boolean;
  reduceMotion: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
};

function toUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    nationalId: row.nationalId,
    fullName: row.fullName,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    rank: row.rank,
    patrolId: row.patrolId,
    pointsBalance: row.pointsBalance,
    pointsEarned: row.pointsEarned,
    pointsDeducted: row.pointsDeducted,
    avatarSeed: row.avatarSeed,
    phone: row.phone,
    notifications: row.notifications,
    reduceMotion: row.reduceMotion,
    failedAttempts: row.failedAttempts,
    lockedUntil: row.lockedUntil ? row.lockedUntil.getTime() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function createPostgresDataSource(): DataSource {
  const db = () => prisma();

  return {
    kind: 'postgres',

    async findUserByNationalId(nationalId) {
      const row = await db().user.findUnique({ where: { nationalId } });
      return row ? toUser(row as UserRow) : null;
    },

    async findUserById(id) {
      const row = await db().user.findUnique({ where: { id } });
      return row ? toUser(row as UserRow) : null;
    },

    async listUsers() {
      const rows = await db().user.findMany({ orderBy: { createdAt: 'asc' } });
      return rows.map((r) => toUser(r as UserRow));
    },

    async listUsersByPatrol(patrolId) {
      const rows = await db().user.findMany({
        where: { patrolId },
        orderBy: { createdAt: 'asc' },
      });
      return rows.map((r) => toUser(r as UserRow));
    },

    countUsers() {
      return db().user.count();
    },

    /**
     * Read-modify-write inside a transaction so two simultaneous failed logins
     * for the same account cannot both read the same counter and skip the
     * threshold.
     */
    async registerFailedLogin(userId, windowMs, threshold) {
      await db().$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { failedAttempts: true },
        });
        if (!user) return;

        const attempts = user.failedAttempts + 1;
        await tx.user.update({
          where: { id: userId },
          data:
            attempts >= threshold
              ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + windowMs) }
              : { failedAttempts: attempts },
        });
      });
    },

    async clearFailedLogin(userId) {
      await db().user.update({
        where: { id: userId },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    },

    async updateUserSettings(userId, patch: UserSettingsPatch) {
      const data: Record<string, unknown> = {};
      if (patch.phone !== undefined) data.phone = patch.phone;
      if (patch.notifications !== undefined) data.notifications = patch.notifications;
      if (patch.reduceMotion !== undefined) data.reduceMotion = patch.reduceMotion;
      if (patch.displayName !== undefined) data.fullName = patch.displayName;
      if (Object.keys(data).length === 0) return this.findUserById(userId);

      const row = await db().user.update({ where: { id: userId }, data });
      return toUser(row as UserRow);
    },

    async setPasswordHash(userId, passwordHash) {
      await db().user.update({ where: { id: userId }, data: { passwordHash } });
    },

    async listPatrols() {
      const patrols = await db().patrol.findMany({ orderBy: { id: 'asc' } });
      const members = await db().user.groupBy({
        by: ['patrolId'],
        where: { patrolId: { not: null } },
        _sum: { pointsBalance: true },
        _count: { _all: true },
      });

      const totals = new Map<string, { points: number; count: number }>();
      for (const m of members) {
        if (!m.patrolId) continue;
        totals.set(m.patrolId, {
          points: m._sum.pointsBalance ?? 0,
          count: m._count._all,
        });
      }

      return patrols.map<PatrolRecord>((p) => {
        const agg = totals.get(p.id);
        return {
          id: p.id,
          name: p.name,
          motto: p.motto,
          color: p.color,
          memberCount: agg?.count ?? 0,
          totalPoints: agg?.points ?? 0,
          previousRank: p.previousRank,
        };
      });
    },

    async findPatrolById(id) {
      const all = await this.listPatrols();
      return all.find((p) => p.id === id) ?? null;
    },

    countPatrols() {
      return db().patrol.count();
    },

    async listLectures() {
      const rows = await db().lecture.findMany({ orderBy: { order: 'asc' } });
      return rows.map<LectureRecord>((r) => ({
        id: r.id,
        order: r.order,
        title: r.title,
        summary: r.summary,
        status: r.status,
        requestedAt: r.requestedAt.toISOString(),
        scheduledAt: r.scheduledAt.toISOString(),
        pointsReward: r.pointsReward,
        attendanceCount: r.attendanceCount,
        capacity: r.capacity,
        speaker: r.speaker,
        location: r.location,
      }));
    },

    async findLectureById(id) {
      const row = await db().lecture.findUnique({ where: { id } });
      if (!row) return null;
      return {
        id: row.id,
        order: row.order,
        title: row.title,
        summary: row.summary,
        status: row.status,
        requestedAt: row.requestedAt.toISOString(),
        scheduledAt: row.scheduledAt.toISOString(),
        pointsReward: row.pointsReward,
        attendanceCount: row.attendanceCount,
        capacity: row.capacity,
        speaker: row.speaker,
        location: row.location,
      } satisfies LectureRecord;
    },

    async setLectureStatus(id, status: LectureStatus) {
      try {
        const row = await db().lecture.update({ where: { id }, data: { status } });
        return this.findLectureById(row.id);
      } catch {
        return null;
      }
    },

    countLectures() {
      return db().lecture.count();
    },

    async createSession(sid, userId, expiresAt) {
      await db().session.create({ data: { sid, userId, expiresAt } });
    },

    async isSessionActive(sid, userId) {
      const session = await db().session.findUnique({ where: { sid } });
      if (!session || session.revoked || session.userId !== userId) return false;
      if (session.expiresAt.getTime() < Date.now()) {
        await db().session.delete({ where: { sid } });
        return false;
      }
      return true;
    },

    async revokeSession(sid) {
      await db().session.deleteMany({ where: { sid } });
    },

    async revokeAllSessionsForUser(userId) {
      await db().session.deleteMany({ where: { userId } });
    },

    async purgeExpiredSessions() {
      await db().session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    },

    async listLedger(userId, limit) {
      const rows = await db().pointsLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return rows.map<LedgerEntry>((r) => ({
        id: r.id,
        label: r.label,
        delta: r.delta,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
      }));
    },
  };
}

/** Used by the seed script, which may run outside the Next.js process. */
export function createStandalonePrisma(): PrismaClient {
  return new PrismaClient({ log: ['error', 'warn'] });
}

export const newSessionId = (): string => randomUUID();