/*
 * ClearSG service worker.
 *
 * Its only job is notifications: it wakes when the server pushes a message,
 * shows it, and opens the app when it is tapped. It deliberately does not
 * cache anything — air quality must never be served from a cache.
 */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'ClearSG'
  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    // Replaces an earlier notification of the same kind instead of stacking.
    tag: payload.tag || 'clearsg',
    renotify: Boolean(payload.tag),
    data: { url: payload.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // Focus the app if it is already open, rather than opening a second copy.
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(target)
    }),
  )
})
