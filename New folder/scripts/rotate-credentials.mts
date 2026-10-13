/**
 * One-off credential rotation.
 *
 * Why: the demo accounts all shared the password `Scout#2026pass`, so anyone who
 * knew that string could log in as any of them. This gives every account its own
 * unique high-entropy password, so no single credential unlocks anything.
 *
 * It never prints passwords to stdout — they are written to a gitignored file
 * that only the operator reads.
 *
 * Run: npx tsx scripts/rotate-credentials.mts
 */

import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { hash, verify, type Algorithm, type Version } from '@node-rs/argon2';

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) config({ path, override: file === '.env.local' });
}

const prisma = new PrismaClient();
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

function generatePassword(): string {
  // 24 random bytes = 192 bits, far beyond any guessing attempt.
  return randomBytes(24).toString('base64url');
}

const SHARED_DEMO_PASSWORD = 'Scout#2026pass';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, nationalId: true, fullName: true, role: true, passwordHash: true },
    orderBy: { nationalId: 'asc' },
  });

  const lines: string[] = [
    '='.repeat(78),
    ' Scout League — LOCAL CREDENTIALS',
    ` Generated ${new Date().toISOString()}`,
    '',
    ' THIS FILE IS GIT-IGNORED AND MUST NOT BE SHARED OR COMMITTED.',
    ' Store it in a password manager, then delete it.',
    '='.repeat(78),
    '',
    ' National ID | Role      | Name                 | Password',
    '-'.repeat(78),
  ];

  let rotated = 0;
  let alreadyUnique = 0;

  for (const user of users) {
    // Skip accounts that already have their own unique credential.
    const isSharedDemo = await verify(user.passwordHash, SHARED_DEMO_PASSWORD, OPTIONS).catch(
      () => false,
    );

    if (!isSharedDemo) {
      alreadyUnique += 1;
      lines.push(
        `${user.nationalId.padEnd(13)}| ${user.role.padEnd(9)} | ${user.fullName.padEnd(20)} | (already unique — not rotated)`,
      );
      continue;
    }

    const password = generatePassword();
    const digest = await hash(password, OPTIONS);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: digest } });

    rotated += 1;
    lines.push(
      `${user.nationalId.padEnd(13)}| ${user.role.padEnd(9)} | ${user.fullName.padEnd(20)} | ${password}`,
    );
  }

  // Invalidate every existing session: old cookies must stop working immediately.
  const sessions = await prisma.session.deleteMany({});

  const outPath = resolve(process.cwd(), 'local-credentials.txt');
  writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(`Rotated ${rotated} shared-password account(s); ${alreadyUnique} already unique.`);
  console.log(`Revoked ${sessions.count} existing session(s).`);
  console.log(`Credentials written to: local-credentials.txt  (git-ignored)`);
}

main()
  .catch((error) => {
    console.error('Rotation failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });