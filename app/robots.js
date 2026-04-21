export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/api/',
          '/dashboard',
          '/history',
          '/profile',
          '/results/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow:     '/',
        disallow:  ['/api/'],
      },
    ],
    sitemap: 'https://www.sehat24.com/sitemap.xml',
    host:    'https://www.sehat24.com',
  }
}