// Keeps a copy of the app on the device so it opens with no internet.
// When you change any app file, bump VERSION so devices pick up the new copy.
const VERSION = 'v27';
const CACHE = 'field-assessments-' + VERSION;
const FILES = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('field-assessments-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Offline first: always answer from the saved copy, use the network only for anything not saved.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      // Opening the folder address (…/) shows the saved app page.
      if (e.request.mode === 'navigate' && new URL(e.request.url).pathname.endsWith('/')) return caches.match('./index.html');
      return fetch(e.request).catch(() =>
        e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()
      );
    })
  );
});
