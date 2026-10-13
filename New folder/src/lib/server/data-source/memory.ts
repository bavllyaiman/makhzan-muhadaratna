import 'server-only';
import { randomUUID } from 'node:crypto';
import { NATIONAL_ID_PATTERN, type Role } from '@/lib/shared/schemas';
import type {
  DataSource,
  LedgerEntry,
  LectureRecord,
  PatrolRecord,
  UserRecord,
  UserSettingsPatch,
} from './types';

/**
 * In-memory adapter — development only.
 *
 * Data lives in the Node process and is lost on restart, which is exactly why
 * this must never be the production path. It stays as a zero-setup fallback so
 * `npm run dev` works before a database is provisioned, and so a misconfigured
 * deploy fails loudly in `env.ts` rather than silently wiping members' points.
 */

const SCOUT_NAMES = [
  'أحمد بن سالم',
  'خالد العتيبي',
  'يوسف الحربي',
  'عبدالله القحطاني',
  'ماجد الدوسري',
  'سلمان الشمري',
  'فهد المطيري',
  'ناصر الزهراني',
  'طارق الغامدي',
  'بندر السبيعي',
  'ريان البقمي',
  'سلطان الرشيد',
];

const PATROL_SEEDS: ReadonlyArray<readonly [string, string, string]> = [
  ['طلائع النخبة', 'العلم يرفع الصقور', '#2F6E4D'],
  ['طلائع الأمل', 'الإقدام طريق النجاح', '#7C7A4E'],
  ['طلائع السلام', 'السلام أساس البناء', '#458C66'],
  ['طلائع المعرفة', 'المعرفة قوة', '#4E4D2C'],
  ['طلائع الأمل II', 'خطوة أبعد', '#1C4632'],
];

const RANK_LADDER = ['مبتدئ', 'مستكشف', 'مغامر', 'مقدام', 'قائد'] as const;

const LECTURE_SEEDS: ReadonlyArray<
  readonly [string, string, LectureRecord['status'], number, number, string, string]
> = [
  ['محاضرة النيران', 'أساسيات إشعال النار الآمنة وإدارة الحرائق في المخيمات.', 'OPEN', 1, 20, 'أ. عبدالله القحطاني', 'المخيم الرئيسي'],
  ['محاضرة العقدة وحبال المخيم', 'أهم العقد المستخدمة في التخييم والنزهات — دورة عملية كاملة.', 'OPEN', 2, 35, 'أ. خالد العتيبي', 'قاعة المحاضرات'],
  ['محاضرة الإسعافات الأولية', 'التعامل مع الجروح والالتواءات وحالات الطوارئ.', 'UPCOMING', 3, 50, 'د. سارة العنزي', 'قاعة المحاضرات'],
  ['محاضرة التوجيه الجغرافي', 'قراءة البوصلة والخرائط والتنقل في البرية.', 'UPCOMING', 4, 25, 'أ. ماجد الدوسري', 'الميدان'],
  ['محاضرة تواصل الفرق', 'مهارات التواصل والقيادة داخل الطليعة.', 'CLOSED', 5, 30, 'أ. فهد المطيري', 'قاعة المحاضرات'],
  ['محاضرة النظافة والوقاية', 'النظافة الشخصية ومكافحة الأمراض في المخيم.', 'CLOSED', 6, 20, 'د. سارة العنزي', 'قاعة المحاضرات'],
  ['محاضرة التسلق الآمن', 'أساسيات التسلق وتثبيت الحبال والسلامة.', 'ARCHIVED', 7, 45, 'أ. ناصر الزهراني', 'الميدان'],
  ['محاضرة الغابات والحياة البرية', 'التعرف على الحيوانات والنباتات واحترام البيئة.', 'ARCHIVED', 8, 25, 'أ. سلطان الرشيد', 'قاعة المحاضرات'],
];

const LEDGER_SEEDS: ReadonlyArray<readonly [string, number, string, number]> = [
  ['حضور محاضرة النيران', 20, 'LECTURE', 2],
  ['التأخر عن التجمع الصباحي', -5, 'PENALTY', 5],
  ['قيادة تمرين صفي', 15, 'DUTY', 9],
];

interface MemoryDb {
  users: Map<string, UserRecord>;
  patrols: Map<string, Omit<PatrolRecord, 'memberCount' | 'totalPoints'>>;
  lectures: Map<string, LectureRecord>;
  sessions: Map<string, { userId: string; expiresAt: number; revoked: boolean }>;
  ledger: Map<string, LedgerEntry[]>;
}

function build(): MemoryDb {
  const db: MemoryDb = {
    users: new Map(),
    patrols: new Map(),
    lectures: new Map(),
    sessions: new Map(),
    ledger: new Map(),
  };

  const now = Date.now();
  const day = 86_400_000;

  PATROL_SEEDS.forEach(([name, motto, color], i) => {
    const id = `patrol-${i + 1}`;
    db.patrols.set(id, { id, name, motto, color, previousRank: i + 1 });
  });

  SCOUT_NAMES.forEach((fullName, i) => {
    const nationalId = String(10_100_001 + i * 137);
    if (!NATIONAL_ID_PATTERN.test(nationalId)) return;

    // UUID to match Postgres `@db.Uuid` — the Zod schemas enforce this shape.
    const id = randomUUID();
    const earned = 120 + ((i * 37) % 480);
    const deducted = (i * 11) % 60;
    const role: Role = i === 0 ? 'ADMIN' : i < 3 ? 'LEADER' : i < 5 ? 'PATROL_LEADER' : 'SCOUT';

    db.users.set(id, {
      id,
      nationalId,
      fullName,
      email: null,
      passwordHash: '',
      role,
      rank: RANK_LADDER[Math.min(RANK_LADDER.length - 1, Math.floor(i / 2))] ?? 'مبتدئ',
      patrolId: `patrol-${(i % PATROL_SEEDS.length) + 1}`,
      pointsBalance: earned - deducted,
      pointsEarned: earned,
      pointsDeducted: deducted,
      avatarSeed: nationalId.slice(-4),
      phone: `9${String(40_000_000 + i * 7_919).slice(0, 8)}`,
      notifications: true,
      reduceMotion: false,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(now - i * day * 3).toISOString(),
    });

    db.ledger.set(
      id,
      LEDGER_SEEDS.map(([label, delta, reason, daysAgo], li) => ({
        id: randomUUID(),
        label,
        delta,
        reason,
        createdAt: new Date(now - daysAgo * day).toISOString(),
      })),
    );
  });

  LECTURE_SEEDS.forEach(([title, summary, status, order, pointsReward, speaker, location], i) => {
// UUID to match Postgres `@db.Uuid` — the Zod schemas enforce this shape.
  const id = randomUUID();
  db.lectures.set(id, {
    id,
      order,
      title,
      summary,
      status,
      requestedAt: new Date(now - (LECTURE_SEEDS.length - order) * day * 2).toISOString(),
      scheduledAt: new Date(now + (i - 2) * day * 1.5).toISOString(),
      pointsReward,
      attendanceCount: Math.floor(10 + i * 3.4),
      capacity: 30,
      speaker,
      location,
    });
  });

  return db;
}

const globalRef = globalThis as unknown as { __scoutMemoryDb?: MemoryDb };

function memory(): MemoryDb {
  globalRef.__scoutMemoryDb ??= build();
  return globalRef.__scoutMemoryDb;
}

export function createMemoryDataSource(): DataSource {
  return {
    kind: 'memory',

    async findUserByNationalId(nationalId) {
      for (const user of memory().users.values()) {
        if (user.nationalId === nationalId) return user;
      }
      return null;
    },

    async findUserById(id) {
      return memory().users.get(id) ?? null;
    },

    async listUsers() {
      return [...memory().users.values()];
    },

    async listUsersByPatrol(patrolId) {
      return [...memory().users.values()].filter((u) => u.patrolId === patrolId);
    },

    async countUsers() {
      return memory().users.size;
    },

    async registerFailedLogin(userId, windowMs, threshold) {
      const user = memory().users.get(userId);
      if (!user) return;
      user.failedAttempts += 1;
      if (user.failedAttempts >= threshold) {
        user.failedAttempts = 0;
        user.lockedUntil = Date.now() + windowMs;
      }
    },

    async clearFailedLogin(userId) {
      const user = memory().users.get(userId);
      if (!user) return;
      user.failedAttempts = 0;
      user.lockedUntil = null;
    },

    async updateUserSettings(userId, patch: UserSettingsPatch) {
      const user = memory().users.get(userId);
      if (!user) return null;
      if (patch.phone !== undefined) user.phone = patch.phone;
      if (patch.notifications !== undefined) user.notifications = patch.notifications;
      if (patch.reduceMotion !== undefined) user.reduceMotion = patch.reduceMotion;
      if (patch.displayName !== undefined) user.fullName = patch.displayName;
      return user;
    },

    async setPasswordHash(userId, passwordHash) {
      const user = memory().users.get(userId);
      if (user) user.passwordHash = passwordHash;
    },

    async listPatrols() {
      const db = memory();
      return [...db.patrols.values()].map<PatrolRecord>((p) => {
        const members = [...db.users.values()].filter((u) => u.patrolId === p.id);
        return {
          ...p,
          memberCount: members.length,
          totalPoints: members.reduce((sum, m) => sum + m.pointsBalance, 0),
        };
      });
    },

    async findPatrolById(id) {
      return (await this.listPatrols()).find((p) => p.id === id) ?? null;
    },

    async countPatrols() {
      return memory().patrols.size;
    },

    async listLectures() {
      return [...memory().lectures.values()].sort((a, b) => a.order - b.order);
    },

    async findLectureById(id) {
      return memory().lectures.get(id) ?? null;
    },

    async setLectureStatus(id, status) {
      const lecture = memory().lectures.get(id);
      if (!lecture) return null;
      lecture.status = status;
      return lecture;
    },

    async countLectures() {
      return memory().lectures.size;
    },

    async createSession(sid, userId, expiresAt) {
      memory().sessions.set(sid, { userId, expiresAt: expiresAt.getTime(), revoked: false });
    },

    async isSessionActive(sid, userId) {
      const session = memory().sessions.get(sid);
      if (!session || session.revoked || session.userId !== userId) return false;
      if (session.expiresAt < Date.now()) {
        memory().sessions.delete(sid);
        return false;
      }
      return true;
    },

    async revokeSession(sid) {
      memory().sessions.delete(sid);
    },

    async revokeAllSessionsForUser(userId) {
      for (const [sid, session] of memory().sessions) {
        if (session.userId === userId) memory().sessions.delete(sid);
      }
    },

    async purgeExpiredSessions() {
      const now = Date.now();
      for (const [sid, session] of memory().sessions) {
        if (session.expiresAt < now) memory().sessions.delete(sid);
      }
    },

    async listLedger(userId, limit) {
      return (memory().ledger.get(userId) ?? []).slice(0, limit);
    },
  };
}