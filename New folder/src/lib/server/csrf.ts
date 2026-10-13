import { randomBytes } from 'node:crypto';

/**
 * Double-submit CSRF token.
 *
 * Layered with `SameSite=Strict` on the session cookie: even if a token leaks,
 * a cross-origin attacker cannot read the cookie value to build a matching
 * header, and Strict cookies are not attached to cross-site sub-requests at all.
 */

export function createCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}