# Deployment — RGB Mileage v2.1.3e

Version: v2.1.3e
Build date: 2026-06-08
Repository: To be confirmed during deployment
GitHub Pages URL: To be confirmed during deployment

## Files to Upload

Replace these files in the GitHub Pages repository root:

- index.html
- app.js
- styles.css
- sw.js
- manifest.json
- README.md
- README-v2.1.3e.md
- CHANGELOG-v2.1.3e.md
- FIXNOTES-v2.1.3e.md
- DEPLOYMENT-v2.1.3e.md
- RGBM-v2.1.3e-Build-Control-Package.md
- RGBM-v2.1.3e-Defect-Closure-Log.md
- RGBM-v2.1.3e-Duplicate-Definition-Audit.md

Icon files are unchanged unless replacement is specifically desired.

## Pre-Deployment Backup

Before deployment:

- Create a JSON backup from the current installed app.
- Record backup filename.
- Confirm backup contains expected vehicles and record counts.

## Cache-Clearing / Refresh Steps

After upload:

1. Open the GitHub Pages app URL with a cache-buster query string, such as `?v=213e`.
2. Confirm browser version shows v2.1.3e.
3. Confirm build date shows 2026-06-08.
4. Confirm existing data is visible.
5. If required, delete and recreate the Home Screen icon.
6. Confirm Home Screen app shows v2.1.3e.

## Data Persistence Verification

Required checks:

- Existing data remains visible after browser refresh.
- Existing data remains visible after cache-buster URL.
- Existing data remains visible after Home Screen refresh/recreation.
- Backup import still succeeds if needed.
- No duplicate records are created after restore.

## Deployment Issue Notes

Use this section after deployment:

- Files uploaded:
- index.html replaced:
- README/CHANGELOG/FIXNOTES uploaded:
- icon.png changed:
- Safari testing result:
- Home Screen testing result:
- Backup created before deployment:
- Backup filename:
- Import/export test result:
- Deployment issues:

