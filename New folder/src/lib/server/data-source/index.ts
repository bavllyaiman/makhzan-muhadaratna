import 'server-only';
import { env } from '../env';
import { createMemoryDataSource } from './memory';
import { createPostgresDataSource, isDatabaseConfigured } from './postgres';
import type { DataSource } from './types';

/**
 * Adapter selection.
 *
 * Production HARD-REQUIRES a database: booting without DATABASE_URL would mean
 * every member's points, ranks and lecture history live in a volatile process
 * memory and vanish on the next deploy. So we refuse to start rather than
 * silently running on the fallback.
 */

let cached: DataSource | null = null;

export function getDataSource(): DataSource {
  if (cached) return cached;

  if (isDatabaseConfigured()) {
    cached = createPostgresDataSource();
    return cached;
  }

  if (env.isProd) {
    throw new Error(
      'FATAL: DATABASE_URL is not set. Refusing to serve production traffic from ' +
        'in-memory storage — all member data would be lost on restart.',
    );
  }

  console.warn(
    '[db] DATABASE_URL not set — using in-memory store. Data is LOST on restart. ' +
      'Set DATABASE_URL and run `npm run db:push && npm run db:seed` to persist.',
  );
  cached = createMemoryDataSource();
  return cached;
}

export type { DataSource, LedgerEntry, LectureRecord, PatrolRecord, UserRecord } from './types';
export { isDatabaseConfigured };