import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #f1f5f9',
      padding: '48px 24px 32px',
      background: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Top Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>

          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20, color: '#2dd4bf', fontFamily: "'DM Serif Display', serif" }}>Sehat24</span>
              <span style={{ fontSize: 10, color: '#2dd4bf', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', padding: '2px 7px', borderRadius: 20 }}>BETA</span>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>
              India ka AI health companion. Medical reports Hindi mein — free, fast, accurate.
            </p>
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { href: 'https://instagram.com/sehat24ai', icon: '📸', label: 'Instagram' },
                { href: 'https://x.com/sehat24ai',        icon: '𝕏',  label: 'X' },
                { href: 'mailto:teamsehat24@gmail.com',    icon: '✉️', label: 'Email' },
                { href: 'https://wa.me/918076170877?text=Namaste%20Sehat24!%20Mujhe%20help%20chahiye.', icon: '💬', label: 'WhatsApp' },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  target={s.href.startsWith('mailto') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Product
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/upload',  label: '📋 Report Analyze' },
                { href: '/chat',    label: '💊 Medicine Chat' },
                { href: '/history', label: '📈 Report History' },
                { href: '/dashboard', label: '🏠 Dashboard' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{
                  fontSize: 13, color: '#94a3b8', textDecoration: 'none',
                  transition: 'color 0.15s'
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Column */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Company
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/',        label: 'Home' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms',   label: 'Terms of Service' },
                { href: 'https://satvikhavan.com', label: '🌿 Satvik Havan', external: true },
              ].map(link => (
                link.external
                  ? <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>
                      {link.label}
                    </a>
                  : <Link key={link.href} href={link.href}
                      style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>
                      {link.label}
                    </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

        {/* Bottom Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 11, color: '#334155' }}>
            © {new Date().getFullYear()} Sehat24. Built in India 🇮🇳
          </p>
          <p style={{ fontSize: 11, color: '#334155', maxWidth: 400, textAlign: 'right', lineHeight: 1.5 }}>
            Educational purposes only. Not medical advice. Consult your doctor.
          </p>
        </div>

      </div>
    </footer>
  )
}