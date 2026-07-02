export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL
    const serviceWorkerUrl = `${baseUrl.replace(/\/$/, '')}/sw.js`

    navigator.serviceWorker.register(serviceWorkerUrl, { scope: baseUrl }).catch(() => {
      // The prototype should still run if service worker registration is unavailable.
    })
  })
}
