/* 오늘의 편지함 — 정적 셸 오프라인 캐시 (선택) */
const CACHE = 'letter-hub-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      const base = self.registration.scope;
      return cache.addAll([base, `${base}index.html`, `${base}data/link-status.json`].map((u) => u).filter(Boolean)).catch(() => undefined);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 외부 API(번역·추출)는 네트워크만
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const net = await fetch(req);
        if (net.ok && (req.mode === 'navigate' || url.pathname.match(/\.(js|css|json|svg|woff2?|png|ico)$/))) {
          const cache = await caches.open(CACHE);
          cache.put(req, net.clone()).catch(() => undefined);
        }
        return net;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const shell = await caches.match(new URL('index.html', self.registration.scope));
          if (shell) return shell;
        }
        throw new Error('offline');
      }
    })()
  );
});
