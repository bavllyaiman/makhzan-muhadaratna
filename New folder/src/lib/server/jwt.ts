import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { z } from 'zod';
import { env } from './env';
import { roleSchema, type Role } from '@/lib/shared/schemas';

/**
 * Stateless, signed session token.
 *
 * Design notes
 *  - HS256 over a >= 256-bit secret from the environment (never hardcoded in prod).
 *  - The token carries only an opaque `sid` + role; no PII, so a leaked token
 *    cannot be used for phishing or to enumerate users.
 *  - Server-side revocation is consulted on every request via the session store,
 *    so logout / password change / "log out everywhere" are immediately effective.
 *  - `typ` claim prevents cross-protocol confusion (token replay as another type).
 */

const encoder = new TextEncoder();
const secret = encoder.encode(env.JWT_SECRET);

if (secret.byteLength < 32 && env.isProd) {
  throw new Error('FATAL: JWT_SECRET must be >= 256 bits.');
}

const ISSUER = 'scout-league';
const AUDIENCE = 'scout-league:app';

export const tokenClaimsSchema = z.object({
  sub: z.string().uuid(),
  sid: z.string().uuid(),
  role: roleSchema,
  typ: z.literal('access'),
});
export type TokenClaims = z.infer<typeof tokenClaimsSchema>;

export async function signAccessToken(
  claims: Omit<TokenClaims, 'typ'>,
): Promise<string> {
  return new SignJWT({ ...claims, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.SESSION_TTL_SECONDS}s`)
    .setJti(crypto.randomUUID())
    .sign(secret);
}

export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export async function verifyAccessToken(token: string): Promise<TokenClaims> {
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'], // pinned — prevents alg-confusion / "none" attacks
      clockTolerance: 5,
    }));
  } catch {
    throw new TokenError('Invalid or expired session token.');
  }

  const parsed = tokenClaimsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new TokenError('Malformed session claims.');
  }
  return parsed.data;
}

export function hasRole(actual: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(actual);
}