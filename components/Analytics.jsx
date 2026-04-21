'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ── Helper to fire GA4 events ──
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  if (!window.gtag) return
  window.gtag('event', eventName, {
    ...params,
    timestamp: new Date().toISOString(),
  })
}

// ── Page view tracker ──
export function Analytics() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const GA_ID        = process.env.NEXT_PUBLIC_GA_ID

  useEffect(() => {
    if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return
    if (!window.gtag) return
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    window.gtag('config', GA_ID, { page_path: url })
  }, [pathname, searchParams, GA_ID])

  return null
}

// ── Pre-built event helpers ──
export const events = {
  // Report upload
  reportUpload: (fileType) =>
    trackEvent('report_upload', { file_type: fileType, category: 'engagement' }),

  reportAnalyzed: (reportType) =>
    trackEvent('report_analyzed', { report_type: reportType, category: 'conversion' }),

  // PDF
  pdfDownload: (type) =>
    trackEvent('pdf_download', { pdf_type: type, category: 'engagement' }),

  // Auth
  signupStarted: () =>
    trackEvent('signup_started', { category: 'auth' }),

  signupCompleted: () =>
    trackEvent('signup_completed', { category: 'auth', value: 1 }),

  loginCompleted: () =>
    trackEvent('login_completed', { category: 'auth' }),

  // Chat
  chatMessageSent: () =>
    trackEvent('chat_message_sent', { category: 'engagement' }),

  chatImageUploaded: () =>
    trackEvent('chat_image_uploaded', { category: 'engagement' }),

  // CTA clicks
  ctaClicked: (location, label) =>
    trackEvent('cta_click', { location, label, category: 'engagement' }),

  // Navigation
  satviKhavanClick: () =>
    trackEvent('satvikhavan_click', { category: 'referral' }),

  whatsappClick: (source) =>
    trackEvent('whatsapp_click', { source, category: 'engagement' }),
}