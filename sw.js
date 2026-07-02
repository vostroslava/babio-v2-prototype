const CACHE_NAME = 'babio-v2-shell-v1'
const APP_SHELL_PATHS = ['', 'app/home', 'studio', 'favicon.svg', 'manifest.webmanifest']

function appShellUrls() {
  return APP_SHELL_PATHS.map((path) => new URL(path, self.registration.scope).toString())
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(appShellUrls())))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
          return response
        })
        .catch(() =>
          caches
            .match(new URL('app/home', self.registration.scope).toString())
            .then((fallback) => fallback || caches.match(new URL('', self.registration.scope).toString())),
        )
    }),
  )
})
