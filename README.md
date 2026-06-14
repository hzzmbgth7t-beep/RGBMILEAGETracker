# RGBMileage v2.2.0BC Install Package

This package is the Firebase-enabled build candidate install package for RGBMileage.

## Build status
- Stable installed baseline authority: v2.1.6c
- Build candidate version: v2.2.0BC
- Technical line: first Firebase migration build
- Hosting model: GitHub Pages / web PWA retained

## URLs
- GitHub Pages: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=220
- GitHub repository: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Approved scope in this build candidate
- Firebase Email/Password authentication
- Firestore connection
- Explicit local-to-cloud migration flow
- Preservation of accepted current behavior
- Import/export retained

## Out of scope
- Broad code cleanup/refactor
- UI redesign unrelated to Firebase migration
- Hosting move away from GitHub Pages
- Realtime Database adoption
- Analytics / unrelated Firebase products

## Runtime indicators for this build candidate
Use runtime indicators, not README text alone, to confirm the active deployed build:
- index.html loads `app.js?v=220`
- manifest.json start_url includes `?v=220`
- sw.js cache/version is aligned to `220`
- Firebase/cloud/auth controls are present in the app UI
- the deployed index.html contains the real `window.RGBM_FIREBASE_CONFIG` block

## Deployment note
All normal build-control documentation rules apply to this build candidate package, including URL inclusion in package-facing documentation.
