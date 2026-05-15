'use client'
import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      const dismissed = localStorage.getItem('s24_pwa_dismissed')
      if (!dismissed) {
        setTimeout(() => setShow(true), 10000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      localStorage.setItem('s24_pwa_installed', 'true')
    }
    setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('s24_pwa_dismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 16,
      right: 16,
      zIndex: 1000,
      animation: 'slideUp 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/icon-192x192.png"
            alt="Sehat24"
            style={{ width: 52, height: 52, borderRadius: 12 }}
          />
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
              Sehat24 Install Karo 📲
            </p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Home screen pe add karo — app jaisa experience
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['⚡ Fast', '🔔 Notifications', '📱 App jaisa', '🆓 Free'].map((f, i) => (
            <span key={i} style={{
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: 100,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#0d9488'
            }}>{f}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleInstall}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg,#0d9488,#0891b2)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '12px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📲 Install Karo
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Baad mein
          </button>
        </div>
      </div>
    </div>
  )
}
