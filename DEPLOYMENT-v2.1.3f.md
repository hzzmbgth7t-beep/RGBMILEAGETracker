# RGB Mileage Tracker — Deployment v2.1.3f

## Release Package
- Version: v2.1.3f
- Build Date: 2026-06-08
- Baseline: v2.1.3e
- Package: RGBM_v2.1.3f_2026-06-08.zip

## Files To Upload
Upload these files to the GitHub Pages repository root:
- index.html
- app.js
- styles.css
- manifest.json
- sw.js
- apple-touch-icon.png
- favicon.png
- favicon-32x32.png
- icon.png
- icon-180x180.png
- icon-192x192.png
- icon-512x512.png
- icon-1024x1024.jpg
- README.md
- README-v2.1.3f.md
- CHANGELOG.md
- CHANGELOG-v2.1.3f.md
- FIXNOTES.md
- FIXNOTES-v2.1.3f.md
- DEPLOYMENT.md
- DEPLOYMENT-v2.1.3f.md
- RGBM-v2.1.3f-Duplicate-Definition-Audit.md
- RGBM-v2.1.3f-Defect-Closure-Log.md

## Deployment Steps
1. Create a backup from the current deployed app before replacing files.
2. Upload all v2.1.3f files to the GitHub repository root.
3. Replace index.html, app.js, styles.css, manifest.json, and sw.js.
4. Wait for GitHub Pages deployment to complete.
5. Open the app using a cache-buster URL.
6. Confirm Home Screen title area displays:
   - RGB Mileage Tracker
   - v2.1.3f • Build 2026-06-08
7. Confirm existing data appears without requiring restore.
8. Refresh the Home Screen icon/app if needed.
9. Run the v2.1.3f review checklist.

## Cache-Buster Recommendation
Use a URL ending in a fresh query string, such as:
?refresh=213f

## Verification Focus
- Tap-to-view on Fuel, Maintenance, and Insurance previous records.
- Long press 750ms still opens Edit.
- Version/build visible under title.
- Orientation lock result documented as fixed or deferred.
- No regression to v2.1.3e confirmed fixes.
