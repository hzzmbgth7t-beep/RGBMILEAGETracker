# RGBMileage v2.2.0a Clean Install Package

This package is the minimum corrective release for RGBMileage `v2.2.0a`.

## Release status
- Previous release: `v2.2.0`
- Current release: `v2.2.0a`
- Package type: clean install corrective release
- Hosting model retained: GitHub Pages / web PWA

## Corrective scope in v2.2.0a
- Add missing Firebase/auth/cloud controls to the Data Management screen
- Restore complete user-visible Firebase workflow using the already-present Firebase code path
- Correct build-date display format from `DD/MM/YY` to `MM/DD/YY`
- Preserve accepted current behavior
- Retain import/export

## Deployment URLs
- GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=220a
- GitHub repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Runtime identification
- `index.html` title shows `RGB Mileage v2.2.0a`
- `index.html` loads `app.js?v=220a`
- `manifest.json` `start_url` includes `?v=220a`
- `sw.js` cache marker is aligned to `v2.2.0a`
- Data Management screen includes Firebase/cloud/auth controls
- Build date is displayed as `MM/DD/YY`
