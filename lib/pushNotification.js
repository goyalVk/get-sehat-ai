'use client'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getAnonId } from '@/utils/anonId'

export async function requestPushPermission() {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null

  // Ensure anonId is set before saving token
  const anonId = getAnonId()

  try {
    const { app } = await import('./firebase')
    const messaging = getMessaging(app)

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    if (token) {
      const res = await fetch('/api/push/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, anonId }),
      })
      const data = await res.json()
      console.log('Push token saved:', data)
      localStorage.setItem('s24_push_token', token)
      return token
    }
    return null
  } catch (err) {
    console.error('Push permission error:', err)
    return null
  }
}

export async function onForegroundMessage(callback) {
  if (typeof window === 'undefined') return
  const { app } = await import('./firebase')
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
