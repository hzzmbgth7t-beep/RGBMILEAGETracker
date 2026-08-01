# RGB Mileage

**Build:** `v2.1.6l-wc10-f12`  
**Build date:** `07/31/2026`  
**Governance:** `v1.7`  
**Status:** SAFARI BROWSER DEVICE ACCEPTANCE REQUIRED

## F12 purpose

F12 corrects Home sizing inside the Safari browser without changing the accepted flat11 Home Screen behavior.

Display-mode strategies:

- installed Home Screen app: `100vh`
- Safari browser: `visualViewport.height`
- browser CSS fallback: `100dvh`
- circle geometry: rendered Home container measured with `ResizeObserver`
- menu height: unchanged at `58px`

The existing one-above/two-below portrait circle arrangement is intentionally retained in F12. The requested staggered left-center/right-stack arrangement is deferred until the Safari browser viewport correction is accepted independently.

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f12

Upload only the 17 archive-root files. Keep all support folders in the local ZIP.
