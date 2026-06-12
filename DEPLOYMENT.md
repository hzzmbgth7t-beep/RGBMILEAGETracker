## v2.1.4g Deployment Notes

### Release Type
Fuel Screen Merger Release

### Purpose
Deploy v2.1.4g only after confirming that the new unified Fuel screen works correctly and that Maintenance and Insurance behavior remains unchanged.

### Links
GitHub Pages: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/)

Cache-buster URL: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=214g](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=214g)

Repository: [https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker](https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker)

### Active Version
- App version: `v2.1.4g`
- Active cache-buster: `?v=214g`

### Pre-Deployment Checks
- version labels are aligned across docs and app files
- Fuel opens on one unified screen
- Fuel supports Empty / View / Edit states
- Fuel Data Information appears in both View and Edit, collapsed by default
- Fuel Previous Records stays expanded
- Maintenance and Insurance still use their existing separate View/Edit behavior
- Back, Save, Cancel, and New behavior works for Fuel

### Post-Deployment Verification
1. Open the cache-buster URL.
2. Confirm the app shows `v2.1.4g`.
3. Tap a home-screen vehicle circle and confirm Fuel opens in Edit.
4. Tap a Fuel record and confirm View opens.
5. Long press a Fuel record and confirm Edit opens.
6. Save a Fuel entry and confirm the Stay / Return prompt appears.
7. Confirm Maintenance and Insurance still open the old way.

### Rollback Reference
If the Fuel merger introduces regressions, revert to `v2.1.3oe`.
