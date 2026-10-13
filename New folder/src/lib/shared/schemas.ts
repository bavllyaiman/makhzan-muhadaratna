import { z } from 'zod';

/**
 * Shared domain schemas. These are the single source of truth and are executed
 * on BOTH the client (instant feedback) and the server (authoritative check).
 * Nothing reaches a repository without passing one of these parsers.
 */

/** Strict 8-digit national / civil ID. Letters, spaces, signs and decimals are rejected. */
export const NATIONAL_ID_PATTERN = /^[0-9]{8}$/;

export const nationalIdSchema = z
  .string({ required_error: 'رقم الهوية الوطنية مطلوب' })
  .trim()
  .regex(NATIONAL_ID_PATTERN, 'رقم الهوية الوطنية يجب أن يتكون من 8 أرقام فقط')
  .refine((v) => !/[\u0660-\u0669\u06F0-\u06F9]/.test(v), 'أرقام لاتينية فقط مسموحة');

export const loginSchema = z.object({
  nationalId: nationalIdSchema,
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(128, 'كلمة المرور طويلة جداً')
    .refine((v) => !/^\s|\s$/.test(v), 'كلمة المرور لا تبدأ أو تنتهي بمسافة'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const ROLES = ['SCOUT', 'PATROL_LEADER', 'LEADER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const roleSchema = z.enum(ROLES);

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  nationalId: z.string().regex(NATIONAL_ID_PATTERN),
  fullName: z.string().min(2).max(120),
  role: roleSchema,
  rank: z.string().min(1).max(60),
  patrolId: z.string().nullable(),
  pointsBalance: z.number().int().min(0),
  pointsEarned: z.number().int().min(0),
  pointsDeducted: z.number().int().min(0),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/* ---------------------------------- Lectures --------------------------------- */

export const LECTURE_STATUSES = ['UPCOMING', 'OPEN', 'CLOSED', 'ARCHIVED'] as const;
export type LectureStatus = (typeof LECTURE_STATUSES)[number];

export const lectureSchema = z.object({
  id: z.string().uuid(),
  order: z.number().int().min(0),
  title: z.string().min(2).max(140),
  summary: z.string().max(400),
  status: z.enum(LECTURE_STATUSES),
  requestedAt: z.string().datetime(),
  scheduledAt: z.string().datetime(),
  pointsReward: z.number().int().min(0).max(1000),
  attendanceCount: z.number().int().min(0),
  capacity: z.number().int().min(1),
  speaker: z.string().min(1).max(80),
  location: z.string().min(1).max(80),
});
export type Lecture = z.infer<typeof lectureSchema>;

/** Whitelist-driven: unknown query keys are stripped by Zod, never forwarded. */
export const lectureQuerySchema = z.object({
  status: z.enum(LECTURE_STATUSES).optional(),
  sort: z.enum(['order', 'recent', 'oldest']).default('order'),
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});
export type LectureQuery = z.infer<typeof lectureQuerySchema>;

/* ------------------------------- Leaderboard -------------------------------- */

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().min(1),
  patrolId: z.string(),
  patrolName: z.string(),
  totalPoints: z.number().int(),
  memberCount: z.number().int(),
  trend: z.enum(['up', 'down', 'same']),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

/* --------------------------------- Settings --------------------------------- */

export const settingsSchema = z.object({
  displayName: z.string().trim().min(2, 'الاسم قصير جداً').max(60),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,20}$/, 'رقم هاتف غير صالح'),
  notifications: z.boolean().default(true),
  reduceMotion: z.boolean().default(false),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z
      .string()
      .min(12, 'كلمة المرور الجديدة يجب أن تكون 12 حرفاً على الأقل')
      .max(128)
      .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
      .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص'),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
    path: ['newPassword'],
  });