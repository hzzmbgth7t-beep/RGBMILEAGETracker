# RGB Mileage Tracker Changelog

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat04`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat4

## 2026-07-26 — flat04 recovery-only correction

- Added non-mutating active, pending, and legacy storage inspection.
- Added exact recovery-snapshot export.
- Added snapshot-confirmation gate before mutation.
- Added quota-safe pending promotion that does not require simultaneous active and pending copies.
- Added exact rollback of active and pending values on failure.
- Added validated full-backup recovery.
- Retained all legacy storage keys.
- Added a dedicated standalone recovery console.
- Corrected migration evidence so a configured third vehicle is accepted after the original two vehicles and records remain preserved.
- Added 14 recovery transaction tests.
- Expanded integration tests for the recovery console.
- Total executable tests: 107 PASS, 0 FAIL.

## 2026-07-26 — flat03

- Corrected circular detail images, non-Home landscape sizing, and Back/dock hit testing.
