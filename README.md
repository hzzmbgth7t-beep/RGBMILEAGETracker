# RGB Mileage WC-10 Flat02 Three-Vehicle Home Candidate

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat02`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CONTROLLED DEVICE TESTING ONLY — NOT PROMOTED  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat2

## Purpose

Correct the visually invalid `flat01` Home page while preserving its tested schema-3 migration, stable IDs, order persistence, restore, evidence, and flat-package behavior.

## Implemented Home layout

Portrait:

- Position 1 is one large centered circle.
- Positions 2 and 3 are equal smaller circles in one lower row.
- All three labels remain visible above the dock.

Landscape:

- All three circles are equal.
- All three occupy one horizontal row.
- One maximum shared diameter is calculated from both width and height limits.
- The application uses the full Home viewport instead of a 430-pixel landscape column.

## Orientation

The manifest now allows any orientation, and the runtime portrait lock is removed.

## Acceptance boundary

Automated browser geometry and code tests pass. Real iPhone 17 Pro Max standalone portrait and landscape acceptance remain `N/A` until device evidence is returned.
