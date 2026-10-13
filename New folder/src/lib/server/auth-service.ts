import 'server-only';
import { env } from './env';
import { fakeVerify, verifyPassword } from './password';
import { userRepository } from './repositories';
import type { UserRecord } from './data-source/types';
import type { LoginInput } from '@/lib/shared/schemas';

/**
 * Authentication service.
 *
 * Security properties:
 *  - One generic failure message for every failure mode (unknown ID, wrong
 *    password, locked account) -> no user enumeration through response bodies.
 *  - Unknown IDs still trigger a dummy Argon2id verification -> no timing oracle.
 *  - Progressive account lockout on repeated failures.
 *  - Generic errors are returned as a discriminated union so the route layer
 *    never has to branch on message text.
 */

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export const GENERIC_LOGIN_ERROR = 'بيانات الدخول غير صحيحة';

export type LoginResult =
  | { ok: true; user: UserRecord }
  | { ok: false; reason: 'invalid' | 'locked' };

export async function authenticate(input: LoginInput): Promise<LoginResult> {
  const user = await userRepository.findByNationalId(input.nationalId);

  // Constant work for both branches.
  if (!user) {
    await fakeVerify(input.password);
    return { ok: false, reason: 'invalid' };
  }

  if (user.lockedUntil && user.lockedUntil > Date.now()) {
    await fakeVerify(input.password);
    return { ok: false, reason: 'locked' };
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    await userRepository.registerFailedAttempt(user.id, LOCKOUT_MS, LOCKOUT_THRESHOLD);
    return { ok: false, reason: 'invalid' };
  }

  await userRepository.resetFailedAttempts(user.id);
  return { ok: true, user };
}

/** Placeholder for full audit logging (SIEM sink) — never logs credentials. */
export function auditLogin(params: {
  nationalIdSuffix: string;
  success: boolean;
  ip: string;
  userAgent: string | null;
}) {
  if (!env.AUDIT_LOG_ENABLED) return;
  console.log(
    JSON.stringify({
      event: 'auth.login',
      idSuffix: params.nationalIdSuffix,
      success: params.success,
      ip: params.ip,
      ua: params.userAgent,
      at: new Date().toISOString(),
    }),
  );
}