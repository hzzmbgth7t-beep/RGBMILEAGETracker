# RGB Mileage Tracker Changelog

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat07`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat7

## 2026-07-27 — flat07

- Identified the actual scroll blocker: the Home route remained active and its `touchmove.preventDefault()` intercepted recovery swipes.
- Added the dedicated `recovery` route.
- Excluded recovery from Home touch blocking.
- Added an explicit recovery scroll-mode initializer to override earlier inline shell locks.
- Moved vertical scrolling to the fixed `#app` recovery viewport.
- Added viewport-safe wrapping for long filenames and action-button text.
- Eliminated horizontal overflow.
- Added four recovery UI tests and two integration tests.
- Total executable tests: 140 PASS, 0 FAIL.

## 2026-07-27 — flat06

- Added reconciled three-vehicle recovery candidate and archive-aware restore transaction.
