# RGB Mileage

**Build:** `v2.1.6l-wc10-flat11`  
**Build date:** `07/31/2026`  
**Governance:** `v1.6`  
**Status:** DEVICE ACCEPTANCE REQUIRED

## Flat11 purpose

Flat10 proved the three-circle composition but failed to fill the installed iPhone portrait viewport. Its Home height was controlled by `visualViewport.height` with `dvh` fallback.

Flat11 keeps the same three-circle model and changes only viewport ownership:

- installed standalone Home height: `100vh`
- regular-browser Home height: `100dvh`
- circle geometry: rendered Home container measured with `ResizeObserver`
- menu height: unchanged at 58 pixels
- portrait title safe-area offset: reduced by 10 pixels
- Home sizing from `visualViewport.height`: prohibited

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat11

Upload only the 17 files at the archive root. Support folders remain in the local ZIP.
