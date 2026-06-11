# DEPLOYMENT

Version: v2.1.3ob
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213ob
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Deployment Steps
1. Upload the complete v2.1.3ob build to the deployment target.
2. Ensure `index.html`, `app.js`, `styles.css`, `manifest.json`, and `sw.js` are all updated together.
3. Open the cache-buster URL after deployment.
4. If a prior service worker is active, refresh again after the new cache is installed.

## Post-Deployment Verification
- App title shows `RGB Mileage v2.1.3ob`.
- Settings screen shows schema `2.1.3ob`.
- Home long-press on the center circle opens Vehicle.
- Vehicle record tap opens View.
- Vehicle record long-press opens Edit.
- From Vehicle → record view/edit, Back returns to Vehicle.
- From record screen after opening additional records from Previous Records, Back still returns to the original prior screen.
- From Reports → report detail, Back returns to Reports.
- From Reports screen, Back returns to the prior screen, typically Home.
- Unsaved record edits prompt for Save or Discard before leaving.
- Existing local data still loads in the target browser.

## Release Control Rule
Before packaging any future version, verify that all of the following match the active version:
- `app.js` version/schema source
- `index.html` title and asset query strings
- `manifest.json` start URL
- `sw.js` cache name and asset list
- `README.md`
- `CHANGELOG.md`
- `FIXNOTES.md`
- `DEPLOYMENT.md`
- `USER-GUIDE.md`

Do not release a package until these labels are aligned.

## Browser Notes
- Intended to run in modern desktop browsers and iOS Safari.
- Browser storage is local to each browser/device.
- PWA install behavior can vary by browser.
