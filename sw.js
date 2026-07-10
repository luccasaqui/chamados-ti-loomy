/* Service worker — Loomy Chamados T.I.
   App shell em cache; API nunca é cacheada; funciona em domínio raiz (Vercel)
   e em subpasta (GitHub Pages) via URLs relativas ao próprio SW. */
const CACHE = 'chamados-ti-v3';
const ASSETS = [
  './',
  './index.html',
  './theme.css',
  './assets/app.css',
  './assets/app.js',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;                       // POST/preflight passam direto
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // fontes/API externas: sem interceptação
  if (url.pathname.indexOf('/api/') >= 0) return;         // API nunca é cacheada

  // Navegação: rede primeiro (pega updates), cai pro cache/offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (res) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res; })
        .catch(function () { return caches.match(req).then(function (r) { return r || caches.match('./index.html'); }); })
    );
    return;
  }

  // Demais assets: cache primeiro, com atualização em segundo plano
  e.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (res) {
        const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
