import 'server-only';
import { env } from './env';

/**
 * Fixed-window rate limiter keyed by a caller-supplied fingerprint (normally
 * IP + route scope). In-process and dependency-free.
 *
 * PRODUCTION NOTE: an in-memory Map is per-process, so with multiple instances
 * or a serverless runtime the effective limit multiplies by the instance count
 * and state resets on cold start. Swap `MemoryWindowStore` for a Redis-backed
 * store (INCR + EXPIRE, or a Lua script for atomicity) in a horizontally scaled
 * deployment. The interface below is deliberately narrow to make that a
 * one-file change.
 */

export interface RateLimitStore {
  hit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfter: number;
    resetAt: number;
  }>;
}

class MemoryWindowStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  private lastSweep = Date.now();

  private sweep(now: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }

  async hit(key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    this.sweep(now);

    const existing = this.buckets.get(key);
    const bucket = existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowSeconds * 1000 };

    bucket.count += 1;
    this.buckets.set(key, bucket);

    return {
      allowed: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      resetAt: bucket.resetAt,
    };
  }
}

const globalRef = globalThis as unknown as { __rateLimitStore?: RateLimitStore };
const store: RateLimitStore = (globalRef.__rateLimitStore ??= new MemoryWindowStore());

export interface RateLimitRule {
  /** Logical scope, e.g. `login`, `api`. */
  scope: string;
  limit: number;
  windowSeconds: number;
  message?: string;
}

export interface RateLimitVerdict {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfter: number;
}

export async function consume(rule: RateLimitRule, fingerprint: string): Promise<RateLimitVerdict> {
  if (!env.RATE_LIMIT_ENABLED && !env.isProd) {
    return { ok: true, remaining: rule.limit, limit: rule.limit, retryAfter: 0 };
  }

  const result = await store.hit(
    `${rule.scope}:${fingerprint}`,
    rule.limit,
    rule.windowSeconds,
  );

  return {
    ok: result.allowed,
    remaining: result.remaining,
    limit: rule.limit,
    retryAfter: result.retryAfter,
  };
}

/**
 * Client IP resolution. `x-forwarded-for` is client-controllable, so only the
 * trusted edge proxy's value is honoured when TRUST_PROXY is set; otherwise we
 * fall back to a constant bucket to avoid header-spoofing the limiter.
 */
export function clientIp(headers: Headers): string {
  if (env.TRUST_PROXY) {
    const fwd = headers.get('x-forwarded-for');
    if (fwd) {
      const first = fwd.split(',')[0]?.trim();
      if (first) return first;
    }
    const real = headers.get('x-real-ip')?.trim();
    if (real) return real;
  }
  return headers.get('x-vercel-forwarded-for') ?? 'unknown';
}