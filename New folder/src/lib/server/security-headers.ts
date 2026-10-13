/**
 * Security headers. Static ones live in `next.config.mjs`; the Content-Security-
 * Policy needs a fresh per-request nonce so it cannot be bypassed, so it is
 * assembled here and attached by `middleware.ts`.
 *
 * Uses the Web Crypto global (not `node:crypto`) so this module stays loadable
 * from the Edge middleware runtime.
 */

export interface CspOptions {
  nonce: string;
  dev: boolean;
}

export function buildCsp({ nonce, dev }: CspOptions): string {
  // `strict-dynamic` lets the nonce-bearing Next.js bootstrap load the rest of
  // the bundle without opening up host allowlists. In dev, Vite/HMR + eval need
  // extra escapes, so the policy is relaxed ONLY when NODE_ENV=development.
  const scriptSrc = [
    `'self'`,
    `'nonce-${nonce}'`,
    `'strict-dynamic'`,
    dev ? `'unsafe-eval'` : '',
    dev ? `'unsafe-inline'` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const connectSrc = dev
    ? `'self' ws: wss: http://localhost:* http://127.0.0.1:*`
    : `'self'`;

  return [
    `default-src 'self'`,
    // `strict-dynamic` makes the browser trust scripts loaded by the nonce-bearing
    // Next.js bootstrap and ignore the 'self' host allowlist, which is what lets
    // us keep `script-src` tight without listing chunk hashes.
    `script-src ${scriptSrc}`,
    // Next.js injects <style> tags; Tailwind lives in the compiled stylesheet.
    `style-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-inline'" : ''}`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
    `media-src 'self'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    dev ? `` : `upgrade-insecure-requests`,
    dev ? `` : `block-all-mixed-content`,
  ]
    .filter(Boolean)
    .join('; ');
}

/** Cryptographically random 128-bit CSP nonce, encoded base64. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary);
}