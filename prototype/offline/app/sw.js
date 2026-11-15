// Offline-first service worker for the installable edition.
// The app is one HTML file, so caching it (plus the manifest and icons) is the whole offline story.
// The full product will use vite-plugin-pwa (ADR-0006); this hand-written worker does the same job for the preview.
const CACHE = 'openact-preview-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon.ico', './favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Cache first, then refresh the copy in the background, so the app opens instantly and offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const refresh = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (hit) {
        event.waitUntil(refresh);
        return hit;
      }
      const res = await refresh;
      return res ?? (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
    }),
  );
});
