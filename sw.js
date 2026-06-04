const CACHE="rgbm-v2.0.7-2026-06-04";
const FILES=[
  "./index.html?v=207",
  "./styles.css?v=207",
  "./app.js?v=207",
  "./manifest.json?v=207",
  "./icon.png",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./icon-180x180.png",
  "./icon-192x192.png",
  "./icon-512x512.png",
  "./icon-1024x1024.jpg"
];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys
        .filter(k=>k.startsWith("rgb")||k.startsWith("RGB")||k.includes("mileage"))
        .filter(k=>k!==CACHE)
        .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  const isCritical=e.request.mode==="navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/app.js") || url.pathname.endsWith("/styles.css") || url.pathname.endsWith("/manifest.json");
  if(isCritical){
    e.respondWith(fetch(e.request).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=207"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    const copy=r.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return r;
  })));
});
