import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI configuration.
 *
 * Why this file exists: `next dev` / `next start` read `.env.local`, but the
 * Prisma CLI (`prisma db push`, `prisma migrate`) reads `.env` only. Without
 * this bridge the app would find DATABASE_URL while `npm run db:push` reported
 * "Environment variable not found" — an easy way to run migrations against the
 * wrong (or no) database.
 *
 * `.env.local` is loaded FIRST so a developer's local value wins.
 */

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, override: file === '.env.local' });
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});