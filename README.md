# RGBMileage v2.2.0 Install Package

This package is the first Firebase-enabled full `v2.2.0` RGBMileage install package.

## Build status
- Previous stable baseline: `v2.1.6c`
- Current package version: `v2.2.0`
- Package type: full Firebase migration version
- Hosting model retained: GitHub Pages / web PWA

## Included scope
- Firebase Email/Password authentication
- Firestore connection
- Explicit local-to-cloud migration flow
- Preservation of accepted current behavior
- Import/export retained

## Out of scope in v2.2.0
- Broad cleanup/refactor
- UI redesign unrelated to Firebase migration
- Hosting move away from GitHub Pages
- Realtime Database adoption
- Analytics / unrelated Firebase products

## Deployment URLs
- GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=220
- GitHub repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Runtime identification
Use these runtime indicators to confirm the active deployed version:
- `index.html` title shows `RGB Mileage v2.2.0`
- `index.html` loads `app.js?v=220`
- `manifest.json` `start_url` includes `?v=220`
- `sw.js` cache marker is aligned to `v2.2.0`
- Firebase/cloud/auth controls are present in the app UI

## Important note
This package is the full-version deployment build assembled from the verified config-patched `v2.2.0` runtime.
