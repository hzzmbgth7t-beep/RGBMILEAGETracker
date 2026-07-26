const CACHE="rgbm-v2.1.6l-wc10-flat02-2026-07-25";
const ASSETS=["./","index.html","styles.css?v=216lwc10flat2","rgbm-home-layout.js?v=216lwc10flat2","rgbm-data-v3.js?v=216lwc10flat2","rgbm-wc10-evidence.js?v=216lwc10flat2","app.js?v=216lwc10flat2","manifest.json","apple-touch-icon.png","icon-192x192.png","icon-512x512.png","favicon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});