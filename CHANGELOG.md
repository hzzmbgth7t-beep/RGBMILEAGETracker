# RGB Mileage Tracker Changelog

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat06`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat6

## 2026-07-27 — flat06 reconciled recovery

- Added source-matched reconciliation candidate validation.
- Added exact pending and legacy fingerprint checks.
- Added preservation-floor enforcement for vehicles and every record collection.
- Added archive-then-write recovery for large localStorage states.
- Added exact rollback of all original RGBM keys on transaction failure.
- Added formal post-reconciliation migration evidence.
- Generated a validated 3-vehicle, 48-fuel, 13-maintenance, 8-insurance candidate.
- Added 12 reconciliation transaction tests.
- Migration evidence tests increased to 10.
- Total executable tests: 134 PASS, 0 FAIL.

## 2026-07-26 — flat05

- Made snapshot controls visible and restored native recovery-page scrolling.
