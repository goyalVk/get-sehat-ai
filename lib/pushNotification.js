'use client'
import { getMessaging, getToken, onMessage }
  from 'firebase/messaging'
import { getAnonId } from '@/utils/anonId'

export async function requestPushPermission() {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null
  if (!('serviceWorker' in navigator)) return null

  try {
    // Step 1 — Register service worker
    const registration = await navigator
      .serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      )

    await navigator.serviceWorker.ready
    console.log('✅ SW registered:',
      registration.scope)

    // Step 2 — Request permission
    const permission = await
      Notification.requestPermission()
    console.log('🔔 Permission:', permission)
    if (permission !== 'granted') return null

    // Step 3 — Get Firebase app
    const { app } = await import('./firebase')
    const messaging = getMessaging(app)

    // Step 4 — Get FCM token
    const token = await getToken(messaging, {
      vapidKey: process.env
        .NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    })

    console.log('🎫 Token:',
      token ? token.substring(0, 20) + '...'
            : 'null')

    if (!token) return null

    // Step 5 — Save token
    const anonId = getAnonId()
    const res = await fetch(
      '/api/push/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, anonId })
    })
    const data = await res.json()
    console.log('💾 Token saved:', data)

    localStorage.setItem('s24_push_token', token)
    return token

  } catch (err) {
    console.error('❌ Push error:', err)
    return null
  }
}

export async function onForegroundMessage(callback) {
  if (typeof window === 'undefined') return
  const { app } = await import('./firebase')
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
