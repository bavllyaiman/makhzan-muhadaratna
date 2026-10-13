import 'server-only';
import type { LectureStatus, Role } from '@/lib/shared/schemas';

/**
 * Persistence port.
 *
 * Everything above this interface (routes, pages, components) is storage
 * agnostic. Two adapters implement it:
 *   - `postgres`  → Prisma + managed Postgres (durable, production)
 *   - `memory`    → process-local Maps (development / emergency fallback)
 *
 * Swapping adapters is a one-line change in `index.ts`.
 */

export interface UserRecord {
  id: string;
  nationalId: string;
  fullName: string;
  email: string | null;
  /** Never leaves the server. */
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
  /** Epoch milliseconds. */
  lockedUntil: number | null;
  createdAt: string;
}

export interface PatrolRecord {
  id: string;
  name: string;
  motto: string;
  color: string;
  memberCount: number;
  totalPoints: number;
  previousRank: number;
}

export interface LectureRecord {
  id: string;
  order: number;
  title: string;
  summary: string;
  status: LectureStatus;
  requestedAt: string;
  scheduledAt: string;
  pointsReward: number;
  attendanceCount: number;
  capacity: number;
  speaker: string;
  location: string;
}

export interface LedgerEntry {
  id: string;
  label: string;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface UserSettingsPatch {
  phone?: string;
  notifications?: boolean;
  reduceMotion?: boolean;
  displayName?: string;
}

export interface DataSource {
  readonly kind: 'postgres' | 'memory';

  /* ---- users ---- */
  findUserByNationalId(nationalId: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  listUsers(): Promise<UserRecord[]>;
  listUsersByPatrol(patrolId: string): Promise<UserRecord[]>;
  countUsers(): Promise<number>;

  /** Atomic increment used by the lockout counter (avoids read-modify-write races). */
  registerFailedLogin(
    userId: string,
    windowMs: number,
    threshold: number,
  ): Promise<void>;
  clearFailedLogin(userId: string): Promise<void>;
  updateUserSettings(userId: string, patch: UserSettingsPatch): Promise<UserRecord | null>;

  /**
   * Writes an already-computed Argon2id hash. Exists ONLY so the development
   * seed can provision credentials — the application itself never needs it.
   */
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;

  /* ---- patrols ---- */
  listPatrols(): Promise<PatrolRecord[]>;
  findPatrolById(id: string): Promise<PatrolRecord | null>;
  countPatrols(): Promise<number>;

  /* ---- lectures ---- */
  listLectures(): Promise<LectureRecord[]>;
  findLectureById(id: string): Promise<LectureRecord | null>;
  setLectureStatus(id: string, status: LectureStatus): Promise<LectureRecord | null>;
  countLectures(): Promise<number>;

  /* ---- sessions ---- */
  createSession(sid: string, userId: string, expiresAt: Date): Promise<void>;
  isSessionActive(sid: string, userId: string): Promise<boolean>;
  revokeSession(sid: string): Promise<void>;
  revokeAllSessionsForUser(userId: string): Promise<void>;
  purgeExpiredSessions(): Promise<void>;

  /* ---- ledger ---- */
  listLedger(userId: string, limit: number): Promise<LedgerEntry[]>;
}