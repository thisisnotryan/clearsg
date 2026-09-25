/*
 * ClearSG service worker: notifications, plus enough caching to open the app
 * without a connection.
 *
 * The rule that matters: air quality is never served from a cache. Readings
 * and the functions behind notifications always go to the network, and a
 * failed request surfaces in the app as "last known reading" rather than
 * quietly showing something old. Only the app shell — the HTML, scripts,
 * styles, fonts and icons — is cached.
 */

const VERSION = 'v1'
const SHELL_CACHE = `clearsg-shell-${VERSION}`
const ASSET_CACHE = `clearsg-assets-${VERSION}`

// Enough to render the app offline; hashed assets are added as they are used.
const SHELL_FILES = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.svg']

/** Hosts whose responses must always be fresh. */
const NEVER_CACHE = ['api-open.data.gov.sg', 'data.gov.sg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== SHELL_CACHE && name !== ASSET_CACHE).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  )
})

function isAppAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') || /\.(?:png|svg|woff2?|webmanifest)$/.test(url.pathname))
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Leave the dev server alone, so local work never sees a cached file.
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return
  // Readings, notification endpoints and map tiles: network only.
  if (NEVER_CACHE.includes(url.hostname) || url.pathname.startsWith('/.netlify/')) return
  if (url.origin !== self.location.origin) return

  // Pages: try the network, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(async () => (await caches.match('/index.html')) ?? Response.error()),
    )
    return
  }

  // Scripts, styles, fonts and icons: serve from cache, refresh in the
  // background so the next launch has the newest build.
  if (isAppAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached ?? Response.error())
        return cached ?? network
      }),
    )
  }
})

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
