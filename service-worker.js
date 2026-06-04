const CACHE_NAME='rgbm-v1.1.0-2026-06-03';
const FILES=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-180.png','./icon-192.png','./icon-512.png','./favicon-32x32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html'))));});
