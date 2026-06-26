'use client'
import { useEffect } from 'react'

export default function SWUpdateChecker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Check for SW update every 60 seconds
    const checkUpdate = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          await reg.update()
        }
      } catch (e) {
        // Silent fail
      }
    }

    // Check on page load
    checkUpdate()

    // Check every 60 seconds
    const interval = setInterval(checkUpdate, 60_000)

    // Listen for new SW waiting
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New SW took control — reload page silently
      window.location.reload()
    })

    return () => clearInterval(interval)
  }, [])

  return null
}
