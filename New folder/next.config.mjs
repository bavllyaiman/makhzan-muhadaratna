/**
 * Next.js configuration — hardened baseline.
 * Dynamic (per-request nonce) security headers live in `src/middleware.ts`.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  eslint: { ignoreDuringBuilds: true },

  /**
   * Next's dependency tracer follows `require()` calls but regularly misses
   * files loaded from a path it cannot statically see. Two things in this app
   * depend on exactly that:
   *
   *  - `@node-rs/argon2` loads its prebuilt `.node` binary at runtime.
   *  - Prisma loads the query engine from `.prisma/client`.
   *
   * Without these entries the deployed function bundle starts and then dies on
   * the first login with a module-not-found error.
   */
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@node-rs/argon2/**/*', './node_modules/.prisma/**/*'],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Immutable build assets — long cache, no revalidation of the document.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
    ];
  },
  async redirects() {
    // Force HTTPS in production (complement to HSTS). Disabled in dev so the
    // local http://localhost loop is not redirected to itself.
    const httpsRedirects =
      process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/:path*',
              has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
              destination: 'https://:path*',
              permanent: true,
            },
          ]
        : [];

    return httpsRedirects;
  },
};

export default nextConfig;