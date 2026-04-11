'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser]           = useState(null)
  const [checked, setChecked]     = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
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

  const firstName = user?.firstName || user?.phone?.slice(-4) || ''
  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #f1f5f9',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 20,
          color: '#0d9488',
          fontFamily: "'DM Serif Display', serif",
          fontWeight: 400
        }}>
          Sehat24
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#0d9488',
          background: '#f0fdfa', border: '1px solid #99f6e4',
          padding: '2px 7px', borderRadius: 20, letterSpacing: '0.05em'
        }}>
          BETA
        </span>
      </Link>

      {/* Right side */}
      {!isAuthPage && checked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {user ? (
            <>
              {/* Logged in nav */}
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/upload',    label: 'Upload'    },
                { href: '/history',   label: 'History'   }
              ].map(link => (
                <Link key={link.href} href={link.href} style={{
                  color: pathname === link.href ? '#0d9488' : '#64748b',
                  fontSize: 13, fontWeight: pathname === link.href ? 600 : 500,
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: pathname === link.href ? '#f0fdfa' : 'transparent',
                  transition: 'all 0.15s'
                }}>
                  {link.label}
                </Link>
              ))}

              {/* Avatar dropdown */}
              <div style={{ position: 'relative', marginLeft: 4 }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 13, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                  {firstName.charAt(0).toUpperCase() || 'U'}
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 44,
                    background: 'white', borderRadius: 14,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    minWidth: 180, overflow: 'hidden', zIndex: 100
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'My Account'}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{user.phone}</p>
                    </div>
                    {[
                      { href: '/profile', label: '👤 Profile' },
                      { href: '/history', label: '📈 History' },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block', padding: '10px 16px',
                          fontSize: 13, color: '#334155',
                          textDecoration: 'none', fontWeight: 500,
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.target.style.background = '#f8fafc'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => { setMenuOpen(false); logout() }}
                      style={{
                        width: '100%', padding: '10px 16px',
                        fontSize: 13, color: '#ef4444',
                        background: 'transparent', border: 'none',
                        textAlign: 'left', cursor: 'pointer',
                        fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif",
                        borderTop: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={e => e.target.style.background = '#fef2f2'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Not logged in */}
              <Link href="/auth/login" style={{
                color: '#64748b', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', padding: '6px 12px', borderRadius: 8
              }}>
                Login
              </Link>
              <Link href="/upload" style={{
                background: '#0d9488', color: 'white',
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none', padding: '8px 16px',
                borderRadius: 10, transition: 'background 0.15s'
              }}>
                Try Free →
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}