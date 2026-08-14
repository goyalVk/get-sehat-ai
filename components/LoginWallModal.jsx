'use client'
import { useEffect, useState } from 'react'

export default function LoginWallModal({ reportId }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('loginwall_shown')) return
    } catch {}

    const timer = setTimeout(() => {
      setShow(true)
      try { sessionStorage.setItem('loginwall_shown', '1') } catch {}
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  const loginUrl = `/auth/login?redirect=/results/${reportId}&source=loginwall`

  return (
    <>
      {/* Backdrop — click to dismiss, results still visible behind */}
      <div
        onClick={() => setShow(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.48)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Bottom sheet — mobile first */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="loginwall-title"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'white',
          borderRadius: '24px 24px 0 0',
          padding: '12px 24px 40px',
          maxWidth: 520,
          margin: '0 auto',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Drag handle */}
        <div style={{
          width: 40, height: 4,
          background: '#e2e8f0', borderRadius: 2,
          margin: '8px auto 28px',
        }} />

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 22,
            background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
            border: '2px solid #99f6e4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, margin: '0 auto',
          }}>
            🔓
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <p
            id="loginwall-title"
            style={{
              fontSize: 20, fontWeight: 700, color: '#0f172a',
              marginBottom: 10, lineHeight: 1.35,
            }}
          >
            Login karo, report analyze karo! 🔓
          </p>
          <p style={{
            fontSize: 14, color: '#64748b',
            lineHeight: 1.75, margin: 0,
          }}>
            Login karo — Hindi mein result milega 🇮🇳
          </p>
          <div style={{
            display: 'inline-block',
            marginTop: 10,
            padding: '4px 14px',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: '#0d9488',
          }}>
            Pro subscription se unlimited reports
          </div>
        </div>

        {/* Login button */}
        <a
          href={loginUrl}
          style={{
            display: 'block',
            padding: '16px',
            background: '#0d9488',
            color: 'white',
            borderRadius: 16,
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 12,
            boxShadow: '0 4px 20px rgba(13,148,136,0.32)',
          }}
        >
          🔓 Login Karo
        </a>

        {/* Skip */}
        <button
          onClick={() => setShow(false)}
          style={{
            display: 'block',
            width: '100%',
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '10px',
            fontFamily: 'inherit',
            textAlign: 'center',
          }}
        >
          Skip karo
        </button>
      </div>
    </>
  )
}
