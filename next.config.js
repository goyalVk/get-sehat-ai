/** @type {import('next').NextConfig} */

// Domains allowed in connect-src (Firebase, Google, Razorpay)
const CONNECT_DOMAINS = [
  'https://www.sehat24.com',
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://stats.g.doubleclick.net',
  'https://www.googletagmanager.com',
  'https://googleads.g.doubleclick.net',
  'https://www.googleadservices.com',
  'https://firebaseinstallations.googleapis.com',
  'https://fcm.googleapis.com',
  'https://identitytoolkit.googleapis.com',
  'https://securetoken.googleapis.com',
  'https://firebase.googleapis.com',
  'https://*.firebaseio.com',
  'wss://*.firebaseio.com',
].join(' ')

// CSP value — permissive enough for Instagram IAB, GTM, and Firebase
// unsafe-inline: required for Next.js inline scripts/styles and Instagram's injected tracker JS
// unsafe-eval:   required for Firebase Auth and some GTM templates
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://apis.google.com https://www.gstatic.com https://connect.facebook.net`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `connect-src 'self' ${CONNECT_DOMAINS}`,
  `media-src 'self' blob: data:`,
  `worker-src 'self' blob:`,
  `child-src 'self' blob:`,
  `frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://checkout.razorpay.com`,
  // frame-ancestors: SAMEORIGIN keeps framing safe; Instagram IAB opens pages directly (not in iframes)
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self' https://rzp.io`,
].join('; ')

const nextConfig = {
  serverExternalPackages: ['mongoose', 'pdf-parse'],

  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // SAMEORIGIN (not DENY) — lets Instagram WebView load the page correctly
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Don't restrict camera/mic — users need file-upload access inside Instagram IAB
          { key: 'Permissions-Policy', value: 'geolocation=(), interest-cohort=()' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ]
  },
}

module.exports = nextConfig