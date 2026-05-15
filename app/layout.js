import { Plus_Jakarta_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ClientChatWidget from '@/components/ClientChatWidget'
import Script from 'next/script'
import NotificationBanner from '@/components/NotificationBanner'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta'
})

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

export const metadata = {
  metadataBase: new URL('https://www.sehat24.com'),
  title: {
    default:  'Sehat24 — Medical Report Hindi Mein Samjho | Free AI Health',
    template: '%s | Sehat24'
  },
  description: 'Blood test, MRI, X-Ray — koi bhi medical report upload karo. 30 seconds mein Hindi mein sab explain ho jaata hai. Ayurvedic herbs, medicine info, report history — bilkul free. India ka #1 AI health report analyzer.',
  keywords: [
    'blood test hindi mein', 'medical report explain',
    'lab report samjhna', 'sehat24',
    'health report analyzer india', 'CBC report hindi',
    'MRI report explain hindi', 'medicine side effects hindi',
    'ayurvedic herbs india', 'free health ai india',
  ],
  authors:   [{ name: 'Sehat24', url: 'https://www.sehat24.com' }],
  creator:   'Sehat24',
  publisher: 'Sehat24',
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website', locale: 'hi_IN',
    url: 'https://www.sehat24.com',
    siteName: 'Sehat24',
    title: 'Sehat24 — Medical Report Hindi Mein Samjho | Free',
    description: 'Blood test, MRI, X-Ray — koi bhi report upload karo. 30 seconds mein Hindi mein sab explain. Bilkul free.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sehat24 — India ka AI Health Companion' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sehat24ai', creator: '@sehat24ai',
    title: 'Sehat24 — Medical Report Hindi Mein Samjho',
    description: 'Blood test, MRI, X-Ray — 30 seconds mein Hindi mein explain. Free.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://www.sehat24.com' },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || 'REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_CODE',
  },
  icons: {
    icon: [
      { url: '/favicon.ico',        sizes: 'any' },
      { url: '/favicon-16x16.png',  sizes: '16x16',  type: 'image/png' },
      { url: '/favicon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable':      'yes',
    'apple-mobile-web-app-capable':'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title':  'Sehat24',
    'application-name':            'Sehat24',
    'msapplication-TileColor':     '#0d9488',
    'msapplication-config':        '/browserconfig.xml',
    'theme-color':                 '#0d9488',
  },
  category: 'health',
}

const organizationSchema = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: 'Sehat24', url: 'https://www.sehat24.com',
  logo: 'https://www.sehat24.com/android-chrome-512x512.png',
  description: 'India ka AI health companion — medical reports Hindi mein explain karta hai.',
  foundingDate: '2024',
  contactPoint: { '@type': 'ContactPoint', telephone: '+91-8076170877', contactType: 'customer support', availableLanguage: ['Hindi', 'English'] },
  sameAs: ['https://instagram.com/sehat24ai', 'https://x.com/sehat24ai'],
  address: { '@type': 'PostalAddress', addressCountry: 'IN', addressLocality: 'Delhi NCR' }
}

const websiteSchema = {
  '@context': 'https://schema.org', '@type': 'WebSite',
  name: 'Sehat24', url: 'https://www.sehat24.com',
  description: 'Free AI medical report analyzer for India — Hindi mein explanation.',
  inLanguage: ['hi', 'en'],
  potentialAction: { '@type': 'SearchAction', target: 'https://www.sehat24.com/chat?q={search_term_string}', 'query-input': 'required name=search_term_string' }
}

const softwareAppSchema = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'Sehat24', applicationCategory: 'HealthApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'AI-powered medical report analyzer for Indian patients.',
  url: 'https://www.sehat24.com',
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className={jakarta.variable}>
      <head>
        <meta name="google-site-verification" content="icgoUH3FL2SrNBCaDiK53gVVorJK67TZIzOLvq8LNR0"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d9488" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sehat24" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; padding: 0; background: #f8fafc; }
          * { box-sizing: border-box; }
        `}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      </head>

      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
        {GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        )}
        <Navbar />
        {children}
        <Footer />
        <div style={{
        position: 'fixed',
        bottom: 0, right: 0,
        zIndex: 9999,
        pointerEvents: 'none'  // ← Layout affect nahi karega
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ClientChatWidget />
        </div>
      </div>
        <ClientChatWidget />
        <NotificationBanner />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}