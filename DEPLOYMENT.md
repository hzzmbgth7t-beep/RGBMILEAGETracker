## v2.1.6d Deployment Notes

### Release Type
Insurance Screen Merger Release

### Purpose
Deploy v2.1.6d only after confirming that the new unified Insurance screen works correctly and that Fuel and Maintenance still work as accepted.

### Links
GitHub Pages: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/)

Cache-buster URL: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216c](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216c)

Repository: [https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker](https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker)

### Active Version
- App version: `v2.1.6d`
- Active cache-buster: `?v=216c`

### Pre-Deployment Checks
- version labels are aligned across docs and app files
- Insurance opens on one unified screen
- Insurance supports Empty / View / Edit states
- Insurance Data Information appears in both View and Edit, collapsed by default
- Insurance Previous Records stays expanded
- Fuel still uses the accepted merged-screen behavior
- Maintenance still uses the accepted merged-screen behavior
- Back, Save, Cancel, Home, and New Entry behave correctly on Insurance

### Post-Deployment Verification
- confirm Insurance tap opens View on the unified screen
- confirm Insurance long press opens Edit on the unified screen
- confirm Insurance Save / Return To List / Back / Home all work correctly
- confirm Fuel and Maintenance remain unchanged

### Rollback Reference
If Insurance merger behavior fails, revert to the prior accepted baseline:
- `v2.1.5b`


## v2.1.6d Fuel Delete Workflow
- Previous Fuel Records long press now opens a row actions modal with Edit / Delete / Cancel.
- Choosing Delete opens a confirmation modal with Delete Permanently / Archive Instead / Cancel.
- Fuel Edit screen now includes a Delete button for reviewing data before deleting.
