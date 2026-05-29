/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose', 'pdf-parse'],

  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.producthunt.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 h minimum for Next.js optimized-image cache
  },

  async headers() {
    return [
      // ── Fingerprinted JS/CSS chunks — content-hashed, cache 1 year ──
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // ── Next.js image optimisation endpoint ──
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },

      // ── Public folder: images & icons ──
      {
        source: '/:path(.*\\.(?:ico|png|jpg|jpeg|webp|avif|svg|gif))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },

      // ── Public folder: fonts — immutable, served with hash in practice ──
      {
        source: '/:path(.*\\.(?:woff|woff2|ttf|otf|eot))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // ── Web manifest ──
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },

      // ── Purely static content pages ──
      {
        source: '/privacy',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/terms',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },

      // ── Blog listing + posts — CDN-cached, stale-while-revalidate ──
      {
        source: '/blog',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=1800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },

      // ── Home page — short CDN TTL (has dynamic social proof / counters) ──
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },

      // ── User-specific pages — never serve from CDN/shared cache ──
      {
        source: '/dashboard',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/profile',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/history',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/results/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/upload',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/chat',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },

      // ── All API routes — no caching at any layer ──
      // Covers auth, analyze, push, payment/webhook, chat, reports
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma',        value: 'no-cache' },
        ],
      },
    ]
  },
}

module.exports = nextConfig