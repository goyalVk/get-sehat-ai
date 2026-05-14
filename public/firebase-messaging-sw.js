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
  const title = payload.notification?.title || 'Sehat24'
  const body  = payload.notification?.body  || ''
  const link  = payload.data?.url || 'https://sehat24.com'

  self.registration.showNotification(title, {
    body,
    icon:   '/icon-192x192.png',
    badge:  '/icon-192x192.png',
    data:   { url: link, ...( payload.data || {}) },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || 'https://sehat24.com'
  event.waitUntil(clients.openWindow(url))
})
