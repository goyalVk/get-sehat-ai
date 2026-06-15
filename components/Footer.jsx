export default function Footer() {
  return (
    <footer style={{
      background: '#0f172a',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 24px',
      textAlign: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        {/* Logo + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Sehat24</span>
            <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>
              Medical reports — Hindi mein
            </span>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Upload', href: '/upload' },
            { label: 'Chat', href: '/chat' },
            { label: 'History', href: '/history' },
            { label: 'Blog', href: '/blog' },
            { label: 'Upgrade', href: '/upgrade' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: 12,
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ fontSize: 11, color: '#334155' }}>
          © 2026 Sehat24 · Made with ❤️ in India 🇮🇳
        </div>
      </div>
    </footer>
  )
}