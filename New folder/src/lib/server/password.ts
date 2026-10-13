import { hash, verify, type Algorithm, type Version } from '@node-rs/argon2';
import { env } from './env';

/**
 * Argon2id password hashing.
 *
 * - `argon2id` (hybrid, recommended) rather than argon2i/argon2d.
 * - Parameters follow the OWASP Password Storage Cheat Sheet baseline:
 *   m = 19456 KiB (19 MiB), t = 2 passes, p = 1 lane, 19 byte salt, 32 byte tag.
 * - Verification is constant-time inside libsodium (`argon2_verify`).
 * - Self-describing PHC string encodes the parameters, so cost can be raised
 *   later without invalidating existing hashes.
 */

// `@node-rs/argon2` declares these as ambient const enums, which cannot be
// referenced under `isolatedModules`. These are the library's stable numeric
// identifiers (Argon2id = 2, PHC v19 = index 1), asserted back to the enum types.
const ARGON2ID = 2 as Algorithm;
const VERSION_0X13 = 1 as Version;

const OPTIONS = {
  algorithm: ARGON2ID,
  version: VERSION_0X13,
  memoryCost: env.ARGON2_MEMORY_COST,
  timeCost: env.ARGON2_TIME_COST,
  parallelism: env.ARGON2_PARALLELISM,
  outputLen: 32,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export async function verifyPassword(digest: string, plain: string): Promise<boolean> {
  try {
    return await verify(digest, plain, OPTIONS);
  } catch {
    // Malformed / unknown-algorithm hash: treat as a failed verification.
    return false;
  }
}

/**
 * Burn roughly the same CPU as a real verification when the account does not
 * exist, so response timing cannot be used for user enumeration.
 * Produced with the parameters above from a throw-away random string; it can
 * never match any real password.
 */
const DUMMY_DIGEST =
  '$argon2id$v=19$m=19456,t=2,p=1$xtP0OYeGdmpjJVmukNXwCw$GBbC1tLDNigWj48+AbXO38/IGk215RAYp9lM14lTWaw';

export async function fakeVerify(plain: string): Promise<void> {
  await verifyPassword(DUMMY_DIGEST, plain);
}