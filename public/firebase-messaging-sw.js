// ── Cache version — v4 paid model launch ──
// Bump this string on every major deploy to force all PWA clients to update
const CACHE_VERSION = 'v4-paid-20260626'

// Force new SW to activate immediately — don't wait for old tabs to close
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Take control of all clients + clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting old cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      console.log('[SW] v4-paid activated — all old caches cleared')
      return self.clients.claim()
    })
  )
})

// ── Firebase imports ──
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            "AIzaSyAhpMbTWqYzPonIuIdmXTDNFH5xdQj7-w8",
  authDomain:        "getsehat-a4a2c.firebaseapp.com",
  projectId:         "getsehat-a4a2c",
  messagingSenderId: "1006214069674",
  appId:             "1:1006214069674:web:f7da9dc4d008c921d3bfd3",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'Sehat24'
  const body  = payload.data?.body  || ''
  const link  = payload.data?.url   || 'https://sehat24.com'
  const icon  = payload.data?.icon  || '/icon-192x192.png'

  self.registration.showNotification(title, {
    body,
    icon:  '/android-chrome-192x192.png',
    badge: '/icon-192x192.png',
    data:  { url: link }
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || 'https://sehat24.com'
  event.waitUntil(clients.openWindow(url))
})