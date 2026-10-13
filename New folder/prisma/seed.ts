/**
 * Database seed — creates patrols, lectures and demo members.
 *
 * Usage:  npm run db:seed
 *
 * Safety:
 *  - Idempotent: uses `upsert`, so re-running never duplicates rows.
 *  - NEVER overwrites an existing passwordHash. A real member's credentials
 *    cannot be destroyed by re-seeding.
 *  - Passwords are Argon2id-hashed with the same parameters the app verifies
 *    against, and the value is never logged for accounts that already exist.
 *
 * Outside development a random password is generated per run and printed once.
 * There is deliberately no way to obtain a known password on a real database.
 */

import { PrismaClient, type LectureStatus, type Role } from '@prisma/client';
import { hash, type Algorithm, type Version } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Same bridge as `prisma.config.ts`: Next reads `.env.local`, the Prisma CLI
// reads `.env`. Load both so the seed targets exactly the app's database.
for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, override: file === '.env.local' });
  }
}

const prisma = new PrismaClient();

// See `lib/server/password.ts` — these are ambient const enums in
// @node-rs/argon2 and cannot be read under `isolatedModules`.
const ARGON2ID = 2 as Algorithm;
const VERSION_0X13 = 1 as Version;

const OPTIONS = {
  algorithm: ARGON2ID,
  version: VERSION_0X13,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

const DEV_PASSWORD = 'Scout#2026pass';
const isProd = process.env.NODE_ENV === 'production' || process.env.SEED_DEMO_ACCOUNTS !== 'true';

const PATROLS: ReadonlyArray<readonly [string, string, string]> = [
  ['patrol-1', 'طلائع النخبة', 'العلم يرفع الصقور'],
  ['patrol-2', 'طلائع الأمل', 'الإقدام طريق النجاح'],
  ['patrol-3', 'طلائع السلام', 'السلام أساس البناء'],
  ['patrol-4', 'طلائع المعرفة', 'المعرفة قوة'],
  ['patrol-5', 'طلائع الأمل II', 'خطوة أبعد'],
];

const PATROL_COLORS = ['#2F6E4D', '#7C7A4E', '#458C66', '#4E4D2C', '#1C4632'];

const NAMES = [
  'أحمد بن سالم', 'خالد العتيبي', 'يوسف الحربي', 'عبدالله القحطاني',
  'ماجد الدوسري', 'سلمان الشمري', 'فهد المطيري', 'ناصر الزهراني',
  'طارق الغامدي', 'بندر السبيعي', 'ريان البقمي', 'سلطان الرشيد',
];

const RANK_LADDER = ['مبتدئ', 'مستكشف', 'مغامر', 'مقدام', 'قائد'] as const;

const LECTURES: ReadonlyArray<readonly [number, string, string, LectureStatus, number, string, string]> = [
  [1, 'محاضرة النيران', 'أساسيات إشعال النار الآمنة وإدارة الحرائق في المخيمات.', 'OPEN', 20, 'أ. عبدالله القحطاني', 'المخيم الرئيسي'],
  [2, 'محاضرة العقدة وحبال المخيم', 'أهم العقد المستخدمة في التخييم والنزهات — دورة عملية كاملة.', 'OPEN', 35, 'أ. خالد العتيبي', 'قاعة المحاضرات'],
  [3, 'محاضرة الإسعافات الأولية', 'التعامل مع الجروض والالتواءات وحالات الطوارئ.', 'UPCOMING', 50, 'د. سارة العنزي', 'قاعة المحاضرات'],
  [4, 'محاضرة التوجيه الجغرافي', 'قراءة البوصلة والخرائط والتنقل في البرية.', 'UPCOMING', 25, 'أ. ماجد الدوسري', 'الميدان'],
  [5, 'محاضرة تواصل الفرق', 'مهارات التواصل والقيادة داخل الطليعة.', 'CLOSED', 30, 'أ. فهد المطيري', 'قاعة المحاضرات'],
  [6, 'محاضرة النظافة والوقاية', 'النظافة الشخصية ومكافحة الأمراض في المخيم.', 'CLOSED', 20, 'د. سارة العنزي', 'قاعة المحاضرات'],
  [7, 'محاضرة التسلق الآمن', 'أساسيات التسلق وتثبيت الحبال والسلامة.', 'ARCHIVED', 45, 'أ. ناصر الزهراني', 'الميدان'],
  [8, 'محاضرة الغابات والحياة البرية', 'التعرف على الحيوانات والنباتات واحترام البيئة.', 'ARCHIVED', 25, 'أ. سلطان الرشيد', 'قاعة المحاضرات'],
];

const LEDGER: ReadonlyArray<readonly [string, number, string]> = [
  ['حضور محاضرة النيران', 20, 'LECTURE'],
  ['التأخر عن التجمع الصباحي', -5, 'PENALTY'],
  ['قيادة تمرين صفي', 15, 'DUTY'],
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  }

  const password = isProd ? randomBytes(24).toString('base64url') : DEV_PASSWORD;
  const digest = await hash(password, OPTIONS);
  const day = 86_400_000;
  const now = Date.now();

  for (const [i, [id, name, motto]] of PATROLS.entries()) {
    await prisma.patrol.upsert({
      where: { id },
      update: { name, motto },
      create: { id, name, motto, color: PATROL_COLORS[i] ?? '#2F6E4D', previousRank: i + 1 },
    });
  }

  for (const [order, title, summary, status, pointsReward, speaker, location] of LECTURES) {
    await prisma.lecture.upsert({
      where: { order },
      update: { title, summary, status, speaker, location, pointsReward },
      create: {
        order,
        title,
        summary,
        status,
        requestedAt: new Date(now - (LECTURES.length - order) * day * 2),
        scheduledAt: new Date(now + (order - 4) * day * 1.5),
        pointsReward,
        attendanceCount: Math.floor(10 + order * 3.4),
        capacity: 30,
        speaker,
        location,
      },
    });
  }

  let created = 0;
  for (const [i, fullName] of NAMES.entries()) {
    const nationalId = String(10_100_001 + i * 137);
    const earned = 120 + ((i * 37) % 480);
    const deducted = (i * 11) % 60;
    const role: Role =
      i === 0 ? 'ADMIN' : i < 3 ? 'LEADER' : i < 5 ? 'PATROL_LEADER' : 'SCOUT';

    const existing = await prisma.user.findUnique({ where: { nationalId } });
    if (existing) continue; // never touch a real account

    const user = await prisma.user.create({
      data: {
        nationalId,
        fullName,
        passwordHash: digest,
        role,
        rank: RANK_LADDER[Math.min(RANK_LADDER.length - 1, Math.floor(i / 2))] ?? 'مبتدئ',
        patrolId: PATROLS[i % PATROLS.length]?.[0],
        pointsBalance: earned - deducted,
        pointsEarned: earned,
        pointsDeducted: deducted,
        avatarSeed: nationalId.slice(-4),
        phone: `9${String(40_000_000 + i * 7_919).slice(0, 8)}`,
        createdAt: new Date(now - i * day * 3),
      },
    });
    created += 1;

    for (const [label, delta, reason] of LEDGER) {
      await prisma.pointsLedger.create({
        data: {
          userId: user.id,
          label,
          delta,
          reason,
          createdAt: new Date(now - (Math.abs(delta) % 9) * day),
        },
      });
    }
  }

  console.log(`✓ Seed complete — ${created} member(s) created.`);
  console.log(
    isProd
      ? `  Demo password (one-time, for national ID 10100001): ${password}`
      : `  Demo password: ${DEV_PASSWORD}  (national ID 10100001)`,
  );
}

main()
  .catch((error) => {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });