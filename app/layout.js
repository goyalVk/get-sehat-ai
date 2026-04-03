import './globals.css'

export const metadata = {
  title: 'GetSehat AI — Understand Your Health Reports',
  description: 'Upload any lab report. Get clear explanation in Hindi and English. Free to try.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-stone-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}