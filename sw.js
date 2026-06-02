
const CACHE = "rgb-mileage-tracker-v2-0-3-flat";
const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon.png",
  "./apple-touch-icon.png",
  "./favicon-32x32.png",
  "./favicon-16x16.png",
  "./icon-192x192.png",
  "./icon-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
