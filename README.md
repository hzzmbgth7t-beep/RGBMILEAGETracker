# RGB Mileage

**Build:** `v2.1.6l-wc10-f13`  
**Build date:** `07/31/2026`  
**Governance:** `v1.7`  
**Status:** OFFLINE DEVICE ACCEPTANCE REQUIRED

## F13 purpose

F13 hardens RGBM for offline use without changing accepted Home geometry, the current three-circle layout, the data schema, or recovery behavior.

Offline architecture:

- application shell precached by the service worker
- navigation uses network-first with cached shell fallback
- versioned runtime assets use cache-first
- same-origin static assets may be filled into the runtime cache
- vehicle and record data stay in `localStorage`
- Cache Storage never receives RGBM record data
- service-worker updates require explicit activation

## Supported launch paths

- installed Home Screen app
- direct Safari URL
- Safari bookmark or shortcut

GitHub's embedded browser is not a supported operating path.

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f13

Upload only the 17 archive-root files. Keep all eight support folders in the local ZIP.
