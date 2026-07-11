# RGBMileage v2.1.6l-wc08 Working Copy

**Status:** Baseline-derived diagnostic implementation candidate `v2.1.6l-wc08` (not a promoted release)  
**Governance:** RGBM Governance v1.1  
**Source:** Fresh extraction of locked baseline `v2.1.6l`

## Purpose
Implement the approved integrated deterministic Home-screen and bottom-dock system without reusing any failed working-copy source.

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this working copy:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc08

## What This Working Copy Changes
- Replaces the contaminated Home layout contract with one explicit Home structure
- Treats each circle and label as one vehicle unit
- Calculates one maximum valid circle diameter from measured geometry and fixed clearances
- Recalculates on viewport resize and orientation change
- Uses vertical vehicle units in portrait and left/right units in landscape
- Replaces the old floating nav contract with a true bottom dock
- Applies one neutral chrome family to the title, vehicle labels, and circle borders
- Adds Home layout diagnostics in Settings

## Required validation
WC-08 remains a diagnostic implementation candidate until the iPhone 17 Pro Max standalone portrait and landscape matrices both pass.
