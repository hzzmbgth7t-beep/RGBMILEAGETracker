# RGB Mileage Tracker Changelog

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat03`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat3

## 2026-07-26 — flat03 non-Home correction

- Replaced global `circleBtn` ownership with a Home-only visual class.
- Added dedicated circular vehicle-detail and edit-preview photo frames.
- Enforced `aspect-ratio: 1 / 1` and `object-fit: cover`.
- Added a non-Home header/content/dock shell.
- Kept Back and the dock outside the scrolling content layer.
- Added visual-viewport sizing for portrait and landscape browser states.
- Added a two-column landscape vehicle-detail card.
- Preserved the accepted Home portrait and landscape geometry.
- Added 18 non-Home regression tests.
- Total executable tests: 88 PASS, 0 FAIL.
- Added synthetic browser hit-testing and geometry evidence.

## 2026-07-25 — flat02

- Implemented the accepted three-position Home layout.
- Added schema-3 migration, ordering, restore, and evidence behavior.
