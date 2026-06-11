# DEPLOYMENT

Version: v2.1.3oa
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oa
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Deployment Steps
1. Upload the complete v2.1.3oa build to the deployment target.
2. Ensure `index.html`, `app.js`, `styles.css`, `manifest.json`, and `sw.js` are all updated together.
3. Open the cache-buster URL after deployment.
4. If a prior service worker is active, refresh again after the new cache is installed.

## Post-Deployment Verification
- App title shows `RGB Mileage v2.1.3oa`.
- Settings screen shows schema `2.1.3oa`.
- Quick Fuel saves normally.
- Previous Records tap opens View.
- CSV preview/import opens without sequence fallback failure.
- Backup generation succeeds.
- Existing local data still loads in the target browser.

## Browser Notes
- Intended to run in modern desktop browsers and iOS Safari.
- Browser storage is local to each browser/device.
- PWA install behavior can vary by browser.
