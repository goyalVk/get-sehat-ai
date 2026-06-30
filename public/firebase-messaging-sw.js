// ── Cache version — bump on every deploy ──
const CACHE_VERSION = 'v4-paid-20260701'

// IMPORTANT: This SW is for Firebase push notifications ONLY.
// It does NOT cache any HTML, JS, or page assets.
// scope: '/' is required by Firebase but this SW never intercepts fetch.

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Only delete caches that belong to THIS SW (prefixed with CACHE_VERSION).
  // Do NOT delete all caches — that destroys Next.js internal caches and
  // causes stale-chunk errors on old tabs after a deploy.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('s24-') && name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// ── Explicit fetch pass-through — NEVER cache anything ──
// Without this, some browsers let the SW intercept navigations by default.
self.addEventListener('fetch', (event) => {
  // Pass ALL requests straight to network — no caching, no interception.
  event.respondWith(fetch(event.request))
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