## v2.1.3oc Deployment Notes

### Release Type
Field Parity Release

### Purpose
Deploy v2.1.3oc only after confirming that Maintenance and Insurance field parity is complete and current app behavior has not changed unintentionally.

### Active Version
- App version: `v2.1.3oc`
- Active cache-buster: `?v=213oc`

### Active URLs
- GitHub Pages:
  `https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/`
- Cache-buster URL:
  `https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oc`
- Repository:
  `https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker`

### Pre-Deployment Checks
Confirm all of the following before deployment:
- version labels are aligned across:
  - README
  - CHANGELOG
  - FIXNOTES
  - DEPLOYMENT
  - USER-GUIDE
  - index.html
  - app.js
  - manifest.json
  - sw.js
- Maintenance View and Edit both show:
  - Location
  - Provider
  - Pickup Date
  - Performed By
- Insurance View and Edit both show:
  - Agency
  - Agreed Value
  - Agent
  - Phone
  - Email
  - Notes
- current separate View and Edit screens still behave normally
- tap / long-press behavior is unchanged
- no unrelated regressions are observed in Fuel, Reports, or Vehicle flows

### Post-Deployment Verification
After deployment, verify:
1. Open the active cache-buster URL.
2. Confirm the app loads as `v2.1.3oc`.
3. Open one Maintenance record in View and Edit.
4. Open one Insurance record in View and Edit.
5. Confirm all parity fields are visible.
6. Save one Maintenance edit and one Insurance edit.
7. Reopen those records and confirm saved values persist.
8. Confirm no navigation behavior changed unexpectedly.

### Deployment Rule
Do not treat this release as a screen-simplification release. It is a field-parity checkpoint only.

### Rollback Reference
If parity changes cause unexpected behavior, revert to the prior stable baseline:
- `v2.1.3ob`


# DEPLOYMENT

Version: v2.1.3oc
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oc
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Deployment Steps
1. Upload the complete v2.1.3oc build to the deployment target.
2. Ensure `index.html`, `app.js`, `styles.css`, `manifest.json`, and `sw.js` are all updated together.
3. Open the cache-buster URL after deployment.
4. If a prior service worker is active, refresh again after the new cache is installed.

## Post-Deployment Verification
- App title shows `RGB Mileage v2.1.3oc`.
- Settings screen shows schema `2.1.3oc`.
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
