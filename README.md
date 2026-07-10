# RGBMileage v2.1.6l-wc07 Working Copy

**Status:** Baseline-derived bottom-dock rebuild working copy `v2.1.6l-wc07` (not a promoted release)

## Purpose
Replace the floating-style bottom navigation with a true full-width bottom dock that owns the bottom edge and safe area like a native app bar.

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this working copy:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc07

## What This Working Copy Changes
- Replaces the floating nav markup with a structural bottom dock
- Adds a full-width dock background that reaches the bottom edge
- Integrates the bottom safe area into the dock itself
- Rebuilds button layout inside the dock
- Updates app-wide bottom spacing so Home, Reports, Data, and Settings end above the dock cleanly
- Leaves routing, data logic, icons, and non-nav business logic unchanged
