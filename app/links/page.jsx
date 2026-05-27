import Link from 'next/link'

export const metadata = {
  title: 'Sehat24™ — India ka Hindi Health AI',
  description: 'Medical reports Hindi mein samjho. Free AI health analyzer.',
}

const links = [
  {
    href: '/upload',
    label: '🩺 Apni Report Check Karo — Free',
    primary: true,
  },
  {
    href: '/upgrade',
    label: '⭐ Pro Plan — ₹199/month',
    primary: false,
  },
  {
    href: '/history',
    label: '📋 Apni Report History Dekho',
    primary: false,
  },
  {
    href: 'https://instagram.com/sehat24ai',
    label: '📸 Instagram pe Follow Karo',
    primary: false,
    external: true,
  },
]

export default function LinksPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .link-btn { transition: transform 0.15s ease, opacity 0.15s ease; }
        .link-btn:hover { transform: translateY(-2px); opacity: 0.93; }
        .link-btn:active { transform: scale(0.97); }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo + brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🩺</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 6px',
            letterSpacing: -0.5,
          }}>
            Sehat24<sup style={{ fontSize: '0.55em', verticalAlign: 'super', fontWeight: 700 }}>™</sup>
          </h1>
          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.85)',
            margin: 0,
            fontWeight: 500,
          }}>
            India ka Hindi Health AI 🇮🇳
          </p>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            margin: '6px 0 0',
          }}>
            Medical reports — 30 sec mein samjho
          </p>
        </div>

        {/* Link buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {links.map((link, i) => {
            const shared = {
              className: 'link-btn',
              style: {
                display: 'block',
                width: '100%',
                padding: '16px 20px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
                cursor: 'pointer',
                ...(link.primary
                  ? {
                      background: '#ffffff',
                      color: '#0d9488',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      border: '1.5px solid rgba(255,255,255,0.45)',
                      backdropFilter: 'blur(6px)',
                    }),
              },
            }

            return link.external ? (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                {...shared}
              >
                {link.label}
              </a>
            ) : (
              <Link key={i} href={link.href} {...shared}>
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Trust badge */}
        <div style={{
          textAlign: 'center',
          marginTop: 28,
          padding: '12px 18px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
            2,300+ families trust Sehat24 • Bilkul Free
          </p>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.45)',
          marginTop: 32,
          lineHeight: 1.6,
        }}>
          © 2026 Sehat24™ | Trademark No. 14321776<br />
          Class 44 — Medical Services 🇮🇳
        </p>
      </div>
    </main>
  )
}
