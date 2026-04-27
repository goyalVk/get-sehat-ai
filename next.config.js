/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose', 'pdf-parse'],
  
  compress: true,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig