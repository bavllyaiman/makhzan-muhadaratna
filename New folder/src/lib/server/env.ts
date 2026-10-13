import { z } from 'zod';

/**
 * Fail-fast environment contract. The app refuses to boot with weak or missing
 * secrets rather than silently degrading to an insecure default.
 */

const booleanish = z
  .enum(['true', 'false'])
  .default('false')
  .transform((v) => v === 'true');

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** >= 32 chars, high entropy. Rotating this invalidates every session. */
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('dev-only-insecure-secret-change-me-0123456789'),
  SESSION_TTL_SECONDS: z.coerce.number().int().min(300).max(86400).default(1800),
  CSRF_SECRET: z.string().min(32).default('dev-only-insecure-csrf-secret-abcdefgh'),

  /** Argon2id cost parameters (OWASP baseline: m=19456, t=2, p=1). */
  ARGON2_MEMORY_COST: z.coerce.number().int().min(19456).max(1048576).default(19456),
  ARGON2_TIME_COST: z.coerce.number().int().min(2).max(16).default(2),
  ARGON2_PARALLELISM: z.coerce.number().int().min(1).max(16).default(1),

  RATE_LIMIT_ENABLED: booleanish,
  RATE_LIMIT_LOGIN_PER_IP: z.coerce.number().int().min(1).default(5),
  RATE_LIMIT_LOGIN_WINDOW_SECONDS: z.coerce.number().int().min(60).default(900),
  RATE_LIMIT_API_PER_IP: z.coerce.number().int().min(10).default(300),

  SECURE_COOKIES: booleanish,
  TRUST_PROXY: booleanish,
  AUDIT_LOG_ENABLED: booleanish,

  /**
   * Creates the demo accounts. Outside development the password is generated
   * randomly at boot and printed once to stdout, so a well-known default
   * credential can never exist in a deployed environment.
   */
  SEED_DEMO_ACCOUNTS: booleanish,
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('دوري الكشافة'),
});

const server = serverSchema.safeParse(process.env);

if (!server.success) {
  const issues = server.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid server environment configuration:\n${issues}`);
}

if (server.data.NODE_ENV === 'production' && server.data.JWT_SECRET.startsWith('dev-only-insecure')) {
  throw new Error(
    'FATAL: JWT_SECRET still holds the development default while NODE_ENV=production.',
  );
}

const client = clientSchema.safeParse(process.env);
if (!client.success) {
  throw new Error('Invalid public environment configuration.');
}

export const env = {
  ...server.data,
  APP_NAME: client.data.NEXT_PUBLIC_APP_NAME,
  isProd: server.data.NODE_ENV === 'production',
  isDev: server.data.NODE_ENV === 'development',
} as const;

/**
 * `__Host-` cookies are rejected by browsers unless they are Secure, path=/ and
 * carry no Domain attribute — they therefore cannot be shadowed by a subdomain.
 *
 * The prefix is gated on `SECURE_COOKIES` (not NODE_ENV) because a browser
 * silently drops any `__Host-` cookie that arrives without `Secure`. Gating on
 * NODE_ENV alone would break non-TLS deployments outright.
 */
const useHostPrefix = server.data.SECURE_COOKIES;

export const SESSION_COOKIE = useHostPrefix ? '__Host-scout_session' : 'scout_session';
export const CSRF_COOKIE = useHostPrefix ? '__Host-scout_csrf' : 'scout_csrf';