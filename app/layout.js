import { Plus_Jakarta_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/chatWidget'
import Script from 'next/script'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta'
})

// ── Replace with your actual GA4 ID ──
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

export const metadata = {
  metadataBase: new URL('https://www.sehat24.com'),

  title: {
    default:  'Sehat24 — Medical Report Hindi Mein Samjho | Free AI Health',
    template: '%s | Sehat24'
  },

  description: 'Blood test, MRI, X-Ray — koi bhi medical report upload karo. 30 seconds mein Hindi mein sab explain ho jaata hai. Ayurvedic herbs, medicine info, report history — bilkul free. India ka #1 AI health report analyzer.',

  keywords: [
    'blood test hindi mein',
    'medical report explain',
    'lab report samjhna',
    'sehat24',
    'health report analyzer india',
    'CBC report hindi',
    'MRI report explain hindi',
    'medicine side effects hindi',
    'ayurvedic herbs india',
    'free health ai india',
    'report ka matlab hindi mein',
  ],

  authors:  [{ name: 'Sehat24', url: 'https://www.sehat24.com' }],
  creator:  'Sehat24',
  publisher:'Sehat24',

  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  openGraph: {
    type:        'website',
    locale:      'hi_IN',
    url:         'https://www.sehat24.com',
    siteName:    'Sehat24',
    title:       'Sehat24 — Medical Report Hindi Mein Samjho | Free',
    description: 'Blood test, MRI, X-Ray — koi bhi report upload karo. 30 seconds mein Hindi mein sab explain. Ayurvedic herbs + Medicine AI Chat. Bilkul free.',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    'Sehat24 — India ka AI Health Companion',
    }],
  },

  twitter: {
    card:        'summary_large_image',
    site:        '@sehat24ai',
    creator:     '@sehat24ai',
    title:       'Sehat24 — Medical Report Hindi Mein Samjho',
    description: 'Blood test, MRI, X-Ray — 30 seconds mein Hindi mein explain. Free. India ka AI health companion.',
    images:      ['/og-image.png'],
  },

  alternates: {
    canonical: 'https://www.sehat24.com',
  },

  verification: {
    // Google Search Console verification — replace with your code
    google: 'REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_CODE',
  },

  icons: {
    icon:      [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple:     '/apple-touch-icon.png',
    shortcut:  '/favicon.ico',
  },

  manifest: '/site.webmanifest',

  category: 'health',
}

// ── Structured Data ──
const organizationSchema = {
  '@context':   'https://schema.org',
  '@type':      'Organization',
  name:         'Sehat24',
  url:          'https://www.sehat24.com',
  logo:         'https://www.sehat24.com/logo.png',
  description:  'India ka AI health companion — medical reports Hindi mein explain karta hai.',
  foundingDate: '2024',
  contactPoint: {
    '@type':            'ContactPoint',
    telephone:          '+91-8076170877',
    contactType:        'customer support',
    availableLanguage:  ['Hindi', 'English'],
  },
  sameAs: [
    'https://instagram.com/sehat24ai',
    'https://x.com/sehat24ai',
  ],
  address: {
    '@type':           'PostalAddress',
    addressCountry:    'IN',
    addressLocality:   'Delhi NCR',
  }
}

const websiteSchema = {
  '@context':        'https://schema.org',
  '@type':           'WebSite',
  name:              'Sehat24',
  url:               'https://www.sehat24.com',
  description:       'Free AI medical report analyzer for India — Hindi mein explanation.',
  inLanguage:        ['hi', 'en'],
  potentialAction: {
    '@type':       'SearchAction',
    target:        'https://www.sehat24.com/chat?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const softwareAppSchema = {
  '@context':          'https://schema.org',
  '@type':             'SoftwareApplication',
  name:                'Sehat24',
  applicationCategory:'HealthApplication',
  operatingSystem:     'Web, iOS, Android',
  offers: {
    '@type':    'Offer',
    price:      '0',
    priceCurrency: 'INR',
  },
  description: 'AI-powered medical report analyzer for Indian patients. Explains blood tests, MRI, X-Ray reports in Hindi.',
  url:         'https://www.sehat24.com',
  aggregateRating: {
    '@type':       'AggregateRating',
    ratingValue:   '4.8',
    ratingCount:   '127',
    bestRating:    '5',
    worstRating:   '1',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className={jakarta.variable}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
      </head>

      <body>
        {/* ── Google Analytics 4 ── */}
        {GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `}
            </Script>
          </>
        )}

        <Navbar />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}