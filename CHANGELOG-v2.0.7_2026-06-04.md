# RGB Mileage Changelog

Version: 2.0.7  
Release Date: 2026-06-04  
Build Type: Incremental Stabilization Update  
Based On: v2.0.6

## Added

- Manage Vehicle Order / Swap Vehicle Positions.
- Editable vehicle form on Home Screen long press.
- Improved circular vehicle photo framing with zoom-out and drag positioning.
- Version footer on every screen.
- JSON backup restore from selected JSON file.
- Root-level icon package consistency.
- FIXNOTES and DEPLOYMENT documentation files.

## Changed

- Package and backup filenames use RGBM with version and date.
- Service worker cache updated to rgbm-v2.0.7-2026-06-04.
- Old RGB/RGBM/Mileage caches are removed on service worker activation.
- Critical files use network-first service worker behavior.
- XLSX CDN startup dependency removed/deferred.

## Deferred

- XLSX import.
- Supabase cloud database.
- AI receipt scanning.
