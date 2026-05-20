'use client'
import { useEffect } from 'react'

export default function ConversionTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18171290722/FHXjCOuXh7AcEOLI39hD'
      })
    }
  }, [])

  return null
}
