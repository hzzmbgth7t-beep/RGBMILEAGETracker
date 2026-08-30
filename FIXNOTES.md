# FIXNOTES — v2.1.6l-wc10-f27-rc1

Build: `v2.1.6l-wc10-f27-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f27rc1`  
Source baseline: accepted `v2.1.6l-wc10-f26`  
Source SHA-256: `6011c1d5742b1dfb295f04849cb6fd0419bad0c629d2aac30a4d62e48603503b`

## Fix scope

This version adds a Settings recovery control for stale installed app shells, especially when iPhone Safari shows the current version but the Home Screen app opens an older cached version.

## Implementation notes

- Added an **App Cache Reset** card to Settings.
- Added **Create JSON Backup First** button in the Settings cache-reset card.
- Added **Reset App Cache / Reload Current Version** button.
- The reset action preserves vehicle data.
- The reset action deletes Cache Storage entries whose names start with `rgbm-app-shell-`.
- The reset action unregisters service workers scoped to the current RGB Mileage app path.
- The reset action reloads the current cache-busting URL.
- No Home geometry logic was changed.
- No data schema migration was added.

## User warning

A JSON backup should be created before any cache reset or app reinstall workflow.
