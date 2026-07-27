# RGB Mileage Tracker Changelog

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat05`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat5

## 2026-07-26 — flat05 recovery UI correction

- Moved the snapshot control directly below a compact warning card.
- Replaced the fixed recovery app scroller with native document scrolling.
- Added a visible end-of-scroll marker.
- Added a standalone preservation floor derived from active, pending, and legacy counts.
- Locked pending promotion when fewer than three vehicles are configured.
- Locked direct backup restore when fuel, maintenance, insurance, acquisition, or attachment counts would decrease.
- Preserved exact snapshot export, rollback, and legacy retention.
- Added 12 recovery UI tests.
- Expanded application integration to 18 tests.
- Total executable tests: 121 PASS, 0 FAIL.

## 2026-07-26 — flat04

- Added non-mutating inspection, snapshot export, and guarded recovery transactions.
