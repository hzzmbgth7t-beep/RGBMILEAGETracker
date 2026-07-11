# FIXNOTES

**Status:** Baseline-derived diagnostic implementation candidate `v2.1.6l-wc08`  
**Governance:** RGBM Governance v1.1

## Purpose
Record the precise WC-08 implementation boundary and evidence controls.

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this working copy:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc08

## What This Working Copy Changes
- Removes duplicated baseline Home, circle, label, and nav selector blocks
- Adds one replacement contract for each removed layout responsibility
- Uses fixed-clearance constants that do not scale with circle diameter
- Calculates equal circle width and height
- Keeps failed WC-01 through WC-07 code out of the implementation source
