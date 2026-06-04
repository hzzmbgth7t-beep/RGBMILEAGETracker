# RGB Mileage Changelog

Version: 2.0.8  
Release Date: 2026-06-04  
Build Type: Incremental Update  
Based On: v2.0.7

## Added

- Consolidated Data Management screen.
- Legacy JSON backup conversion for v1.0 backup structure.
- Restore preview summary with legacy conversion notice.
- CSV fuel import preview with rows found, rows ready, warnings, and duplicates.
- CSV duplicate skipping by Record ID.

## Changed

- Home Screen now uses Data instead of separate Import and Backup buttons.
- JSON is clearly identified as the full app backup/restore format.
- CSV is clearly identified as fuel-data only.
- Updated service worker cache name to rgbm-v2.0.8-2026-06-04.

## Deferred

- XLSX import.
- Supabase Sync.
- Receipt Scanning.
