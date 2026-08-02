"use strict";

const BUILD_ID = "v2.1.6l-wc10-f17";
const CACHE_REVISION = "216lwc10f17";
const CACHE_PREFIX = "rgbm-app-shell-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_REVISION}`;
const NAVIGATION_TIMEOUT_MS = 4000;

const APP_SHELL = Object.freeze([
  "./",
  "./?v=216lwc10f17",
  "./index.html",
  "./styles.css?v=216lwc10f17",
  "./rgbm-home-layout.js?v=216lwc10f17",
  "./rgbm-data-v3.js?v=216lwc10f17",
  "./rgbm-wc10-evidence.js?v=216lwc10f17",
  "./app.js?v=216lwc10f17",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./icon-192x192.png",
  "./icon-512x512.png",
]);

const NAVIGATION_FALLBACKS = Object.freeze([
  "./?v=216lwc10f17",
  "./index.html",
  "./",
]);

function isHttpRequest(request) {
  const protocol = new URL(request.url).protocol;
  return protocol === "http:" || protocol === "https:";
}

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isVersionedAsset(url) {
  return url.searchParams.get("v") === CACHE_REVISION;
}

function isStaticAsset(url) {
  return /\.(?:css|js|json|png|jpg|jpeg|svg|webp|ico)$/i.test(
    url.pathname,
  );
}

async function fetchShellAsset(asset) {
  const request = new Request(asset, {
    cache: "reload",
    credentials: "same-origin",
  });
  const response = await fetch(request);

  if (!response || !response.ok) {
    throw new Error(`Offline shell fetch failed: ${asset}`);
  }

  return { request, response };
}

async function installApplicationShell() {
  const cache = await caches.open(CACHE_NAME);
  const fetched = await Promise.all(
    APP_SHELL.map((asset) => fetchShellAsset(asset)),
  );

  await Promise.all(
    fetched.map(({ request, response }) => (
      cache.put(request, response.clone())
    )),
  );
}

async function deleteSupersededCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter(
        (key) => (
          key.startsWith(CACHE_PREFIX)
          && key !== CACHE_NAME
        ),
      )
      .map((key) => caches.delete(key)),
  );
}

async function notifyClients(type, extra = {}) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    client.postMessage({
      type,
      build: BUILD_ID,
      cacheRevision: CACHE_REVISION,
      ...extra,
    });
  }
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Navigation network timeout")),
        timeoutMs,
      );
    }),
  ]);
}

async function cacheNavigationResponse(response) {
  if (!response || !response.ok) {
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    NAVIGATION_FALLBACKS.map(
      (key) => cache.put(key, response.clone()),
    ),
  );
}

async function cachedNavigationFallback(request) {
  const direct = await caches.match(request, {
    ignoreSearch: true,
  });
  if (direct) {
    return direct;
  }

  for (const key of NAVIGATION_FALLBACKS) {
    const response = await caches.match(key, {
      ignoreSearch: true,
    });
    if (response) {
      return response;
    }
  }

  return new Response(
    "RGB Mileage is offline and the application shell is unavailable.",
    {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

async function networkFirstNavigation(request) {
  try {
    const response = await withTimeout(
      fetch(request),
      NAVIGATION_TIMEOUT_MS,
    );
    if (response && response.ok) {
      await cacheNavigationResponse(response.clone());
      return response;
    }
    throw new Error("Navigation network response was not successful");
  } catch (error) {
    return cachedNavigationFallback(request);
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request, {
    ignoreSearch: false,
  });
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (
      response
      && response.ok
      && response.type !== "opaque"
    ) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const fallback = await caches.match(request, {
      ignoreSearch: true,
    });
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(installApplicationShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    deleteSupersededCaches()
      .then(() => self.clients.claim())
      .then(() => notifyClients("RGBM_OFFLINE_READY")),
  );
});

self.addEventListener("message", (event) => {
  const message = event && event.data;

  if (message && message.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (message && message.type === "GET_OFFLINE_STATUS") {
    event.waitUntil(
      caches.has(CACHE_NAME).then((cacheReady) => {
        const target = event.source;
        if (target && typeof target.postMessage === "function") {
          target.postMessage({
            type: "RGBM_OFFLINE_STATUS",
            build: BUILD_ID,
            cacheRevision: CACHE_REVISION,
            cacheReady,
          });
        }
      }),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (
    request.method !== "GET"
    || !isHttpRequest(request)
    || !isSameOrigin(request)
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const url = new URL(request.url);
  if (isVersionedAsset(url) || isStaticAsset(url)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
