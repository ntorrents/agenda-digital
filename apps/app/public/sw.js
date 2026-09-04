/* Petit Diari — Service Worker (PWA + Web Push)
 * Servei estàtic a /sw.js (public/).
 * No cacheja HTML autenticat: només push + notificationclick.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {
    title: 'Petit Diari',
    body: 'Tens una nova notificació',
    url: '/',
    tag: 'petit-diari',
  }

  try {
    if (event.data) {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    }
  } catch {
    try {
      const text = event.data && event.data.text()
      if (text) data.body = text
    } catch {
      /* ignore */
    }
  }

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    tag: data.tag || 'petit-diari',
    renotify: true,
    data: {
      url: data.url || '/',
    },
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Petit Diari', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const rawUrl =
    (event.notification.data && event.notification.data.url) || '/'
  const targetUrl = new URL(rawUrl, self.location.origin).href

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus()
          if ('navigate' in client) {
            try {
              await client.navigate(targetUrl)
            } catch {
              /* alguns navegadors no permeten navigate */
            }
          }
          return
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl)
      }
    })()
  )
})
