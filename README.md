# RGB Mileage

**Build:** `v2.1.6l-wc10-f23`  
**Build date:** `08/03/2026`  
**Governance:** `v1.7`  
**Status:** DEVICE ACCEPTANCE REQUIRED

F19 was rebuilt directly from the accepted `v2.1.6l-wc10-f16` archive.

Changes:

- every non-Home bottom menu now uses the accepted 58-pixel Home menu height
- vehicle create/edit includes `Custom Label`
- custom labels are trimmed and limited to 50 characters
- a nonblank custom label overrides `Year Make Model Badge` everywhere onscreen
- clearing the custom label restores the generated label
- JSON backup and restore preserve custom labels
- CSV behavior is unchanged

Locked from F16:

- Home portrait and landscape geometry
- service-worker update indicator placement, appearance, and action
- offline behavior
- records, storage keys, backups, and recovery logic

Normal URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
Cache URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f23

Upload only the 17 files at the ZIP root.
