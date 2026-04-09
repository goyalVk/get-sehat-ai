import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #f1f5f9',
      padding: '32px 24px',
      background: 'white',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16, textAlign: 'center'
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <span style={{
            fontSize: 18, color: '#0d9488',
            fontFamily: "'DM Serif Display', serif"
          }}>
            Sehat24
          </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Built in India 🇮🇳
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {[
              { href: '/',        label: 'Home'    },
              { href: '/upload',  label: 'Upload'  },
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms',   label: 'Terms'   },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: 12, color: '#94a3b8',
                textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.15s'
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <p style={{
            fontSize: 11, color: '#cbd5e1',
            maxWidth: 480, lineHeight: 1.6
          }}>
            Sehat24 is for educational purposes only. It does not provide
            medical advice, diagnosis, or treatment. Always consult a
            qualified doctor before making health decisions.
          </p>

         <p>© {new Date().getFullYear()} Sehat24. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}