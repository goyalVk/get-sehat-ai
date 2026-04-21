'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser]         = useState(null)
  const [checked, setChecked]   = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.id) setUser(data) })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const firstName  = user?.firstName || user?.phone?.slice(-4) || ''
  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <>
      <style>{`
        .nav-wrap {
          background: white;
          border-bottom: 1px solid #f1f5f9;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nav-link.active {
          color: #0d9488;
          background: #f0fdfa;
          font-weight: 600;
        }
        .nav-link:hover { background: #f8fafc; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .nav-wrap { padding: 0 14px; height: 52px; }
          .nav-link { padding: 6px 7px; font-size: 12px; }
          .nav-link-label { display: none; }
          .nav-link-icon  { display: inline; }
          .nav-logo-text  { font-size: 17px !important; }
          .nav-beta-badge { display: none; }
        }
        @media (min-width: 641px) {
          .nav-link-icon { display: none; }
        }
      `}</style>

      <nav className="nav-wrap">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span className="nav-logo-text" style={{ fontSize: 20, color: '#0d9488', fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
            Sehat24
          </span>
          <span className="nav-beta-badge" style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '2px 7px', borderRadius: 20 }}>
            BETA
          </span>
        </Link>

        {/* Right side */}
        {!isAuthPage && checked && (
          <div className="nav-links">
            {user ? (
              <>
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
                  { href: '/upload',    label: 'Upload',    icon: '📋' },
                  { href: '/chat',      label: 'Medicine',  icon: '💊' },
                  { href: '/history',   label: 'History',   icon: '📈' },
                ].map(link => (
                  <Link key={link.href} href={link.href}
                    className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                    <span className="nav-link-icon">{link.icon}</span>
                    <span className="nav-link-label">{link.label}</span>
                  </Link>
                ))}

                {/* Avatar */}
                <div style={{ position: 'relative', marginLeft: 4 }}>
                  <button onClick={() => setMenuOpen(!menuOpen)} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 13, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    flexShrink: 0
                  }}>
                    {firstName.charAt(0).toUpperCase() || 'U'}
                  </button>

                  {menuOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: 42,
                      background: 'white', borderRadius: 14,
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      minWidth: 180, overflow: 'hidden', zIndex: 100
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                          {user.firstName ? `${user.firstName}` : 'My Account'}
                        </p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{user.phone}</p>
                      </div>
                      {[
                        { href: '/profile', label: '👤 Profile' },
                        { href: '/history', label: '📈 History' },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setMenuOpen(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#334155', textDecoration: 'none', fontWeight: 500 }}
                          onMouseEnter={e => e.target.style.background = '#f8fafc'}
                          onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { setMenuOpen(false); logout() }} style={{
                        width: '100%', padding: '10px 16px',
                        fontSize: 13, color: '#ef4444',
                        background: 'transparent', border: 'none',
                        textAlign: 'left', cursor: 'pointer',
                        fontWeight: 500,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/chat" className={`nav-link ${pathname === '/chat' ? 'active' : ''}`}>
                  <span className="nav-link-icon">💊</span>
                  <span className="nav-link-label">Medicine</span>
                </Link>
                <Link href="/auth/login" className="nav-link">
                  <span className="nav-link-icon">👤</span>
                  <span className="nav-link-label">Login</span>
                </Link>
                <Link href="/upload" style={{
                  background: '#0d9488', color: 'white',
                  fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', padding: '7px 14px',
                  borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  <span className="nav-link-icon">📋</span>
                  <span className="nav-link-label">Try Free →</span>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}