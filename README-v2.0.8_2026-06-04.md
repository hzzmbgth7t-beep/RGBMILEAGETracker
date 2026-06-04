# RGB Mileage

Version: 2.0.8  
Release Date: 2026-06-04  
Build Type: Incremental Update  
Based On: v2.0.7

## Current Release Summary

RGB Mileage v2.0.8 consolidates backup, restore, CSV import, and CSV export into a single Data Management area and adds backward-compatible restore support for earlier RGB Mileage JSON backups, including v1.0 backups.

## Current Features

- Vehicle-circle Home Screen remains the primary navigation.
- Tap a vehicle circle to open Quick Fuel Entry.
- Long press a vehicle circle to edit vehicle information.
- Vehicle photo circular preview supports zoom-out and drag positioning.
- JSON is the full app backup and restore format.
- CSV is used only for fuel data import/export.
- Legacy JSON backups are detected, previewed, converted, and restored when technically possible.
- Data Management contains Create JSON Backup, Restore JSON Backup, Export Fuel CSV, Import Fuel CSV, and Download CSV Template.
- XLSX import, Supabase Sync, and Receipt Scanning remain future features.
- Version appears at the bottom of every screen.
- Icons remain root-level only.

## Backup Compatibility Policy

Every future RGB Mileage version must restore backups created by prior RGB Mileage versions whenever technically possible.

## Deployment URL

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

---

# README History

## Version 2.0.7
Release Date: 2026-06-04

# RGB Mileage

Version: 2.0.7  
Release Date: 2026-06-04  
Build Type: Incremental Stabilization Update  
Based On: v2.0.6

## Current Release Summary

RGB Mileage v2.0.7 is a controlled stabilization release built from the verified working v2.0.6 source. It preserves the original vehicle-circle Home Screen and focuses on reliability, data safety, deployment documentation, and locked UI corrections.

## Included in v2.0.7

- Preserves the large vehicle-circle Home Screen as the primary navigation.
- Long press on a vehicle circle opens the editable vehicle information form.
- Suppresses iPhone/Safari image context behavior on vehicle circles where possible.
- Adds Manage Vehicle Order with Swap Vehicle Positions.
- Adds improved photo framing support with zoom-out and drag positioning in the circular preview.
- Shows the current version at the bottom of every screen.
- Uses root-level icon files only.
- Keeps CSV import/export support.
- Defers XLSX import to a future release; no XLSX CDN loads at startup.
- Adds full JSON backup restore from a selected backup file.
- Uses RGBM file naming with version and date.
- Updates service worker cache name and old-cache cleanup.
- Adds release documentation standards including FIXNOTES and DEPLOYMENT files.

## Deployment URL

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

## Installation / Update Notes

1. Create a JSON backup before deployment.
2. Upload all files directly to the GitHub repository root.
3. Confirm `index.html`, `app.js`, `styles.css`, `sw.js`, and `manifest.json` are replaced.
4. Open the GitHub Pages URL in Safari using a cache-busting query string.
5. Delete and reinstall the Home Screen icon if needed.
6. Confirm Version 2.0.7 appears on every screen.

## Current Known Deferrals

- XLSX import is deferred.
- Supabase database integration is deferred.
- AI receipt scanning is deferred.
- Advanced import mapping remains future work.

---

# README History

## Version 2.0.6
Release Date: 2026-06-02

# RGB Mileage v2.0.6

Flat-file build. No required folders.

New:
- Navy/wood/chrome Home Screen
- Smaller title area
- Smaller bottom icon row
- Larger vehicle circles
- Vehicle photo preview and zoom slider
- Plus sign only appears on empty vehicle slots
- Saved zoom level used for Home Screen vehicle photo
- Cache-busting service worker update


