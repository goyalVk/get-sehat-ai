'use client'
import { useState, useEffect } from 'react'
import { requestPushPermission } from '@/lib/pushNotification'

export default function NotificationBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const asked = localStorage.getItem('s24_notif_asked')
    const token = localStorage.getItem('s24_push_token')
    const permission = Notification?.permission

    if (!asked && !token && permission === 'default') {
      setTimeout(() => setShow(true), 5000)
    }
  }, [])

  if (!show) return null

  const handleEnable = async () => {
    localStorage.setItem('s24_notif_asked', 'true')
    setShow(false)
    await requestPushPermission()
  }

  const handleClose = () => {
    localStorage.setItem('s24_notif_asked', 'true')
    setShow(false)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 70,
      left: 0,
      right: 0,
      zIndex: 999,
      padding: '0 16px',
      animation: 'slideUp 0.3s ease'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg,#0d9488,#0891b2)',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 8px 32px rgba(13,148,136,0.3)'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>
            🔔 Notifications enable karo
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
            Report ready hone pe turant alert milega
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleEnable}
            style={{
              background: 'white',
              color: '#0d9488',
              border: 'none',
              borderRadius: 100,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Enable Karo
          </button>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: 100,
              padding: '8px 12px',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
