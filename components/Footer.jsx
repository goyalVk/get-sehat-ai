import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-root {
          border-top: 1px solid #1e2d2d;
          padding: 48px 24px 32px;
          background: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .footer-grid {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 36px;
        }
        .footer-col-title {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .footer-link {
          display: block;
          font-size: 13px;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .footer-link:hover { color: #2dd4bf; }
        .footer-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          max-width: 900px;
          margin: 0 auto 24px;
        }
        .footer-bottom {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .footer-social-row {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .footer-social-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .footer-social-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }
        .footer-promo {
          max-width: 900px;
          margin: 0 auto 28px;
          background: rgba(22,163,74,0.1);
          border: 1px solid rgba(134,239,172,0.2);
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .footer-root { padding: 40px 20px 28px; }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
          }
          .footer-promo {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }
        }
      `}</style>

      <footer className="footer-root">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Grid */}
          <div className="footer-grid">

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20, color: '#2dd4bf', fontFamily: "'DM Serif Display', serif" }}>Sehat24</span>
                <span style={{ fontSize: 10, color: '#2dd4bf', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', padding: '2px 7px', borderRadius: 20 }}>BETA</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 16 }}>
                India ka AI health companion.<br />
                Medical reports Hindi mein —<br />
                free, fast, accurate.
              </p>
              <div className="footer-social-row">
                {[
                  { href: 'https://instagram.com/sehat24ai',     icon: '📸', label: 'Instagram' },
                  { href: 'https://x.com/sehat24ai',             icon: '𝕏',  label: 'X' },
                  { href: 'mailto:teamsehat24@gmail.com',         icon: '✉️', label: 'Email' },
                  { href: 'https://wa.me/918076170877?text=Namaste%20Sehat24!', icon: '💬', label: 'WhatsApp' },
                ].map((s, i) => (
                  <a key={i} href={s.href}
                    target={s.href.startsWith('mailto') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    title={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="footer-col-title">Product</p>
              {[
                { href: '/upload',    label: '📋 Report Analyze' },
                { href: '/chat',      label: '💊 Medicine Chat' },
                { href: '/history',   label: '📈 Report History' },
                { href: '/dashboard', label: '🏠 Dashboard' },
                { href: '/blog', label: '📰 Blogs' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Company */}
            <div>
              <p className="footer-col-title">Company</p>
              {[
                { href: '/',        label: 'Home',             external: false },
                { href: '/privacy', label: 'Privacy Policy',   external: false },
                { href: '/terms',   label: 'Terms of Service', external: false },
                { href: 'https://satvikhavan.com', label: '🌿 Satvik Havan', external: true },
              ].map(link => (
                link.external
                  ? <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="footer-link">{link.label}</a>
                  : <Link key={link.href} href={link.href} className="footer-link">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Satvik Havan promo */}
          <div className="footer-promo">
            <span style={{ fontSize: 13, color: '#86efac' }}>🌿 Ayurvedic herbs chahiye?</span>
            <a href="https://satvikhavan.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
              satvikhavan.com →
            </a>
            <span style={{ fontSize: 12, color: '#475569' }}>WhatsApp: +91 8076170877</span>
          </div>

          {/* Product Hunt Badge */}
          {/* Product Hunt Badge */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '28px' 
          }}>
            <a 
              href="https://www.producthunt.com/products/sehat24?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-sehat24" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                alt="Sehat24 - Medical reports explained in simple Hindi. Free AI for India | Product Hunt" 
                width="250" 
                height="54" 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1130481&theme=light&t=1777200869551"
              />
            </a>
          </div>

          <div className="footer-divider" />

          {/* Bottom */}
          <div className="footer-bottom">
            <p style={{ fontSize: 11, color: '#334155', margin: 0 }}>
              © {new Date().getFullYear()} Sehat24. Built in India 🇮🇳
            </p>
            <p style={{ fontSize: 11, color: '#334155', margin: 0, textAlign: 'center' }}>
              Educational purposes only. Not medical advice.
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}