# RGB Mileage Changelog

Version: 2.0.9  
Release Date: 2026-06-04  
Build Type: Corrective / Stability Update  
Based On: v2.0.8

## Added

- Visible Miles field on Quick Fuel Entry.
- Visible MPG field on Quick Fuel Entry.
- Auto-calculation of Miles from odometer and previous fuel odometer.
- Auto-calculation of MPG from Miles and Gallons.
- Manual Miles entry when no previous fuel entry exists.
- Historical-entry recalculation prompt for affected newer entries.
- Automatic MPG recalculation when accepted Miles update changes.
- Photo optimization on import.
- Backup summary before JSON export.

## Changed

- Backup compatibility policy now supports v2.0.6 and later only.
- Image storage now uses optimized copies to improve backup and restore reliability.

## Deferred

- XLSX import.
- Supabase Sync.
- Receipt Scanning.
