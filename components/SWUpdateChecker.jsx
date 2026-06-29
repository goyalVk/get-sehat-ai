'use client'
import { useEffect } from 'react'

const CURRENT_VERSION = 'v4-paid-20260627'

export default function SWUpdateChecker() {
  useEffect(() => {
    const checkVersionAndUpdate = async () => {
      try {
        // Step 1 — Check server version
        const res = await fetch('/api/version?t=' + Date.now())
        const { version } = await res.json()

        // Step 2 — Compare with stored version
        const storedVersion = localStorage.getItem('s24_version')

        if (storedVersion !== version) {
          // New version available!
          localStorage.setItem('s24_version', version)
          localStorage.removeItem('s24_user')
          localStorage.removeItem('s24_uid')

          // Step 3 — Clear all SW caches
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const reg of registrations) {
              await reg.update()
            }
            const cacheKeys = await caches.keys()
            await Promise.all(cacheKeys.map(key => caches.delete(key)))
          }

          // Step 4 — Hard reload — but not during auth flow
          if (!window.location.pathname.includes('/auth/')) {
            window.location.reload(true)
          }
        }
      } catch (e) {
        // Silent fail
      }
    }

    // Check on every page load
    checkVersionAndUpdate()

    // Also check SW updates every 60s
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!window.location.pathname.includes('/auth/')) {
          window.location.reload()
        }
      })
    }
  }, [])

  return null
}
